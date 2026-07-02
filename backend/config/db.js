// config/db.js - connexion sécurisée vers MongoDB Atlas
const mongoose = require('mongoose');

const connectDB = async () => {
  mongoose.set('strictQuery', false);
  mongoose.set('bufferCommands', false);

  const uri = (process.env.MONGO_URI || '').trim();

  if (!uri) {
    console.warn('⚠️ MONGO_URI manquant. Le serveur démarre en mode dégradé, mais MongoDB ne sera pas connecté.');
    return;
  }

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
    autoIndex: false
  };

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const connectWithRetry = async () => {
    for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
      try {
        const connection = await mongoose.connect(uri, options);
        console.log(`✅ MongoDB connecté : ${connection.connection.host}`);
        return connection;
      } catch (error) {
        console.warn(`⚠️ MongoDB tentative ${attempt}/${maxRetries} échouée : ${error.message}`);
        if (attempt === maxRetries) {
          throw error;
        }
        await wait(retryDelayMs);
      }
    }
  };

  try {
    await connectWithRetry();
  } catch (err) {
    console.error('❌ Connexion MongoDB impossible après plusieurs tentatives :', err.message || err);
    console.warn('⚠️ Le serveur continue de démarrer, mais MongoDB n est pas connecté.');
    return;
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB déconnecté.');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnecté.');
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB error:', err.message || err);
  });
};

module.exports = connectDB;
