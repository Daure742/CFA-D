// server.js - Point d'entrée du serveur Node.js
const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');
const socketHandler = require('./socket/socketHandler');
const connectDB = require('./config/db');
const { parseCorsOrigins } = require('./config/cors');

const BASE_PORT = Number(process.env.PORT) || 5000;

const handleFatalError = (error) => {
  console.error('❌ Erreur système non gérée :', error);
  process.exit(1);
};

process.on('uncaughtException', handleFatalError);
process.on('unhandledRejection', handleFatalError);
process.on('SIGTERM', () => {
  console.log('⚠️ SIGTERM reçu, arrêt propre du serveur');
  process.exit(0);
});

const server = http.createServer(app);
const allowedOrigins = parseCorsOrigins(process.env.CLIENT_URL);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});

// Gestionnaire Socket.io
socketHandler(io);
// expose io instance for controllers
try {
  const ioHelper = require('./socket/io');
  ioHelper.setIo(io);
} catch (err) {
  console.warn('Impossible d exposer io instance:', err.message || err);
}

const startServer = (port) => {
  server.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Serveur LMS CFA démarré sur le port ${port} (0.0.0.0)`);
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Port ${port} déjà utilisé. Tentative sur ${port + 1}...`);
      const fallback = port + 1;
      server.removeAllListeners('error');
      server.listen(fallback, '0.0.0.0', () => {
        console.log(`🚀 Serveur LMS CFA démarré sur le port ${fallback} (0.0.0.0)`);
      });
    } else {
      console.error('Erreur serveur non gérée :', err);
      process.exit(1);
    }
  });
};

(async () => {
  try {
    await connectDB();
    startServer(BASE_PORT);
  } catch (err) {
    console.error('❌ Impossible de démarrer le backend sans connexion MongoDB.', err);
    process.exit(1);
  }
})();

// Start replay cleanup scheduler
try {
  const { scheduleCleanup } = require('./utils/cleanupReplays');
  scheduleCleanup({ intervalMs: 5 * 60 * 1000 }); // every 5 minutes
  console.log('🧰 Scheduled replay cleanup job (5min)');
} catch (err) {
  console.warn('⚠️ Impossible de démarrer le cleanup des replays:', err.message);
}