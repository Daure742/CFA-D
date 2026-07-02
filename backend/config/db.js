// config/db.js - Connexion à MongoDB Atlas
const mongoose = require('mongoose');

const connectDB = async () => {
  mongoose.set('strictQuery', false);

  // Require MONGO_URI explicitly in production. No local fallback.
  const uri = (process.env.MONGO_URI || '').trim();

  if (!uri) {
    console.error('❌ MONGO_URI est requis et doit pointer vers MongoDB Atlas. Le serveur démarre quand même en mode dégradé.');
    return;
  }

  const finalUri = uri;

  const serverSelectionTimeoutMS = parseInt(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS, 10) || 5000;
  const connectTimeoutMS = parseInt(process.env.MONGO_CONNECT_TIMEOUT_MS, 10) || 10000;
  const maxPoolSize = parseInt(process.env.MONGO_MAX_POOL_SIZE, 10) || 10;
  const retryDelayMs = parseInt(process.env.MONGO_RETRY_DELAY_MS, 10) || 5000;
  const maxRetries = parseInt(process.env.MONGO_RETRY_COUNT, 10) || 5;

  const options = {
    serverSelectionTimeoutMS,
    connectTimeoutMS,
    maxPoolSize,
    family: 4,
  };

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const connectWithRetry = async () => {
    let attempt = 0;
    while (attempt < maxRetries) {
      attempt += 1;
      try {
        const connection = await mongoose.connect(finalUri, options);
        console.log(`✅ MongoDB connecté : ${connection.connection.host}`);
        return connection;
      } catch (error) {
        console.warn(`⚠️ Tentative ${attempt}/${maxRetries} de connexion MongoDB échouée : ${error.message}`);
        if (attempt >= maxRetries) {
          throw error;
        }
        await wait(retryDelayMs);
      }
    }
  };

  try {
    await connectWithRetry();
  } catch (err) {
    console.error('❌ Connexion MongoDB impossible :', err.message);
    console.error(err.stack || err);
    console.warn('⚠️ Le serveur continue de démarrer, mais MongoDB n est pas connecté.');
    return;
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
