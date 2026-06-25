// config/db.js - Connexion à MongoDB Atlas (Atlas-first) avec fallback local
const mongoose = require('mongoose');
const DigestFetch = (() => {
  try {
    return require('digest-fetch');
  } catch (e) {
    return null;
  }
})();

const DEFAULT_LOCAL = 'mongodb://127.0.0.1:27017/cfa_digital';

const getUris = () => {
  // Atlas URI (preferred). Backwards compatibility: fall back to MONGO_URI if set.
  const atlas = process.env.MONGO_URI_ATLAS?.trim() || process.env.MONGO_URI?.trim();
  const local = process.env.MONGO_URI_LOCAL?.trim() || process.env.MONGO_LOCAL_URI?.trim();
  return { atlas, local: local || DEFAULT_LOCAL };
};

const connectWithOptions = (uri) => {
  const serverSelectionTimeoutMS = parseInt(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS, 10) || 5000;
  const connectTimeoutMS = parseInt(process.env.MONGO_CONNECT_TIMEOUT_MS, 10) || 10000;
  const options = {
    serverSelectionTimeoutMS,
    connectTimeoutMS,
  };
  return mongoose.connect(uri, options);
};

let current = null; // 'atlas' | 'local'

const connectDB = async () => {
  mongoose.set('strictQuery', false);
  const { atlas, local } = getUris();

  // If Atlas API credentials are provided, check whether the project's IP access list
  // contains 0.0.0.0/0 (allow-all). If so, prefer Atlas when possible.
  const atlasApiPublic = process.env.ATLAS_API_PUBLIC_KEY;
  const atlasApiPrivate = process.env.ATLAS_API_PRIVATE_KEY;
  const atlasProjectId = process.env.ATLAS_PROJECT_ID;
  let atlasForcePreferred = false;
  if (atlas && atlasApiPublic && atlasApiPrivate && atlasProjectId && DigestFetch) {
    try {
      const client = new DigestFetch(atlasApiPublic, atlasApiPrivate);
      const url = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${atlasProjectId}/accessList`;
      const res = await client.fetch(url);
      if (res && res.ok) {
        const body = await res.json();
        const items = body.results || body;
        const hasOpen = (Array.isArray(items) && items.some(i => (i.cidrBlock === '0.0.0.0/0' || i.ipAddress === '0.0.0.0')));
        if (hasOpen) {
          atlasForcePreferred = true;
          console.log('ℹ️ Atlas IP access list contains 0.0.0.0/0 — preferring Atlas connection');
        }
      }
    } catch (apiErr) {
      console.warn('⚠️ Unable to query Atlas API for IP access list:', apiErr.message || apiErr);
    }
  }

  // Try Atlas first if configured or explicitly allowed by Atlas IP access list
  if (atlas && atlasForcePreferred) {
    // If API says open access, prefer Atlas
    try {
      const conn = await connectWithOptions(atlas);
      current = 'atlas';
      console.log(`✅ MongoDB Atlas connecté : ${conn.connection.host}`);
    } catch (err) {
      console.warn(`⚠️ Connexion MongoDB Atlas impossible (${err.message}). Tentative avec MongoDB local...`);
      try {
        const conn = await connectWithOptions(local);
        current = 'local';
        console.log(`✅ MongoDB connecté (local) : ${conn.connection.host}`);
      } catch (localErr) {
        console.error(`❌ Erreur de connexion MongoDB locale : ${localErr.message}`);
        process.exit(1);
      }
    }
  } else if (atlas) {
    try {
      const conn = await connectWithOptions(atlas);
      current = 'atlas';
      console.log(`✅ MongoDB Atlas connecté : ${conn.connection.host}`);
    } catch (err) {
      console.warn(`⚠️ Connexion MongoDB Atlas impossible (${err.message}). Tentative avec MongoDB local...`);
      try {
        const conn = await connectWithOptions(local);
        current = 'local';
        console.log(`✅ MongoDB connecté (local) : ${conn.connection.host}`);
      } catch (localErr) {
        console.error(`❌ Erreur de connexion MongoDB locale : ${localErr.message}`);
        process.exit(1);
      }
    }
  } else {
    try {
      const conn = await connectWithOptions(local);
      current = 'local';
      console.log(`✅ MongoDB connecté (local) : ${conn.connection.host}`);
    } catch (err) {
      console.error(`❌ Erreur de connexion MongoDB locale : ${err.message}`);
      process.exit(1);
    }
  }

  // Connection lifecycle handlers: attempt local fallback if Atlas disconnects
  mongoose.connection.on('disconnected', async () => {
    console.warn('⚠️ MongoDB déconnecté.');
    if (current === 'atlas' && local) {
      console.warn('Tentative de basculement vers MongoDB local...');
      try {
        await connectWithOptions(local);
        current = 'local';
        console.log('✅ Basculé vers MongoDB local.');
      } catch (err) {
        console.error('❌ Échec connexion locale après déconnexion Atlas :', err.message);
      }
    }
  });

  mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected.');
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB error:', err.message);
  });
};

module.exports = connectDB;
