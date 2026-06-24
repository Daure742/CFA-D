// config/db.js - Connexion à MongoDB Atlas
const mongoose = require('mongoose');

const getMongoUri = () => {
  const configuredUri = process.env.MONGO_URI?.trim();
  if (configuredUri) {
    return configuredUri;
  }

  const fallbackUri = 'mongodb://127.0.0.1:27017/cfa_digital';
  console.warn('⚠️ MONGO_URI non configuré. Utilisation du serveur MongoDB local :', fallbackUri);
  return fallbackUri;
};

const connectDB = async () => {
  mongoose.set('strictQuery', false);
  const mongoUri = getMongoUri();

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB connecté : ${conn.connection.host}`);
  } catch (error) {
    if (mongoUri.startsWith('mongodb+srv://')) {
      const fallbackUri = 'mongodb://127.0.0.1:27017/cfa_digital';
      console.warn(`⚠️ Connexion MongoDB Atlas impossible (${error.message}). Tentative avec MongoDB local...`);
      try {
        const conn = await mongoose.connect(fallbackUri);
        console.log(`✅ MongoDB connecté en local : ${conn.connection.host}`);
        return;
      } catch (fallbackError) {
        console.error(`❌ Erreur de connexion MongoDB locale : ${fallbackError.message}`);
      }
    }

    console.error(`❌ Erreur de connexion MongoDB : ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
