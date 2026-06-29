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
  // MONGO_URI is the main connection string and should be used in production.
  // MONGO_URI_ATLAS is kept for backwards compatibility.
  const atlas = process.env.MONGO_URI?.trim() || process.env.MONGO_URI_ATLAS?.trim();
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
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction && !atlas) {
    console.error('❌ En production, MONGO_URI doit être défini et pointer vers MongoDB Atlas.');
    process.exit(1);
  }

  if (atlas) {
    try {
      const conn = await connectWithOptions(atlas);
      current = 'atlas';
      console.log(`✅ MongoDB connecté : ${conn.connection.host}`);
    } catch (err) {
      console.error(`❌ Connexion MongoDB impossible (${err.message})`);
      if (isProduction) {
        process.exit(1);
      }
      console.warn('⚠️ Tentative de connexion à MongoDB local...');
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
