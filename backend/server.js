// server.js - Point d'entrée du serveur Node.js
const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');
const socketHandler = require('./socket/socketHandler');
const { parseCorsOrigins } = require('./config/cors');

const BASE_PORT = Number(process.env.PORT) || 5000;

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
  server.listen(port, () => {
    console.log(`🚀 Serveur LMS CFA démarré sur le port ${port}`);
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Port ${port} déjà utilisé. Tentative sur ${port + 1}...`);
      // Try one fallback port to avoid infinite loops
      const fallback = port + 1;
      server.removeAllListeners('error');
      // Close any active handle and try fallback
      server.listen(fallback, () => {
        console.log(`🚀 Serveur LMS CFA démarré sur le port ${fallback}`);
      });
    } else {
      console.error('Erreur serveur non gérée :', err);
      process.exit(1);
    }
  });
};

startServer(BASE_PORT);
// Start replay cleanup scheduler
try {
  const { scheduleCleanup } = require('./utils/cleanupReplays');
  scheduleCleanup({ intervalMs: 5 * 60 * 1000 }); // every 5 minutes
  console.log('🧰 Scheduled replay cleanup job (5min)');
} catch (err) {
  console.warn('⚠️ Impossible de démarrer le cleanup des replays:', err.message);
}