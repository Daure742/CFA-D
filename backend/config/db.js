// config/db.js - Connexion à MongoDB Atlas
const mongoose = require('mongoose');

const connectDB = async () => {
  mongoose.set('strictQuery', false);

  const uri = (process.env.MONGO_URI || process.env.MONGO_URI_ATLAS || process.env.MONGODB_URI || '').trim();
  const explicitLocalUri = (process.env.MONGO_URI_LOCAL || process.env.MONGO_LOCAL_URI || '').trim();
  const finalUri = uri || explicitLocalUri;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!finalUri) {
    console.error('❌ MONGO_URI est requis. Définissez MONGO_URI ou MONGO_URI_ATLAS dans vos variables d environnement.');
    process.exit(1);
  }

  if (isProduction && !uri) {
    console.error('❌ En production, MONGO_URI doit pointer vers MongoDB Atlas.');
    process.exit(1);
  }

  const serverSelectionTimeoutMS = parseInt(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS, 10) || 5000;
  const connectTimeoutMS = parseInt(process.env.MONGO_CONNECT_TIMEOUT_MS, 10) || 10000;
  const maxPoolSize = parseInt(process.env.MONGO_MAX_POOL_SIZE, 10) || 10;

  const options = {
    serverSelectionTimeoutMS,
    connectTimeoutMS,
    maxPoolSize,
    family: 4,
  };

  try {
    const connection = await mongoose.connect(finalUri, options);
    console.log(`✅ MongoDB connecté : ${connection.connection.host}`);
  } catch (err) {
    console.error('❌ Connexion MongoDB impossible :', err.message);
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB déconnecté.');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected.');
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB error:', err.message || err);
  });
};

module.exports = connectDB;
