require('dotenv').config();

// Ensure Node.js crypto exists on globalThis/global for modules or libraries that expect a browser-like API.
try {
  if (!globalThis.crypto) {
    globalThis.crypto = require('crypto');
  }
  if (!global.crypto) {
    global.crypto = globalThis.crypto;
  }
} catch (err) {
  console.warn('⚠️ Impossible d initialiser global crypto :', err && err.message ? err.message : err);
}

// server.js - point d'entrée de l'application, gestion du boot et du serveur
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { parseCorsOrigins } = require('./config/cors');

const PORT = (() => {
  const raw = process.env.PORT;
  if (!raw) {
    console.warn('⚠️ Aucune variable PORT fournie. Démarrage local sur 3000.');
    return 3000;
  }
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    console.warn(`⚠️ PORT invalide (${raw}). Démarrage local sur 3000.`);
    return 3000;
  }
  return parsed;
})();

const server = http.createServer(app);
const allowedOrigins = parseCorsOrigins(process.env.CLIENT_URL);

const initSocketIO = () => {
  try {
    const { Server } = require('socket.io');
    const socketHandler = require('./socket/socketHandler');
    const io = new Server(server, {
      cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST']
      },
      pingTimeout: 30000,
      maxHttpBufferSize: 1e6
    });

    socketHandler(io);

    try {
      const ioHelper = require('./socket/io');
      if (ioHelper && typeof ioHelper.setIo === 'function') {
        ioHelper.setIo(io);
      }
    } catch (err) {
      console.warn('⚠️ Impossible d exposer l instance Socket.IO:', err.message || err);
    }

    console.log('✅ Socket.IO initialisé.');
    return io;
  } catch (err) {
    console.warn('⚠️ Socket.IO non disponible. Le serveur continue sans WebSocket :', err.message || err);
    return null;
  }
};

const io = initSocketIO();

const startServer = (port) => {
  server.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Serveur CFA démarré sur 0.0.0.0:${port}`);
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Port ${port} occupé. Tentative sur ${port + 1}...`);
      server.removeAllListeners('error');
      server.listen(port + 1, '0.0.0.0', () => {
        console.log(`🚀 Serveur CFA démarré sur 0.0.0.0:${port + 1}`);
      });
      return;
    }

    console.error('💥 Erreur serveur non gérée :', err);
  });
};

const gracefulShutdown = () => {
  console.log('⚠️ Arrêt propre du serveur en cours...');

  if (io && typeof io.close === 'function') {
    io.close();
  }

  server.close((closeErr) => {
    if (closeErr) {
      console.error('Erreur lors de la fermeture du serveur :', closeErr);
      return;
    }
    console.log('✅ Serveur arrêté proprement.');
  });
};

process.on('uncaughtException', (error) => {
  console.error('💥 uncaughtException capturée :', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('💥 unhandledRejection capturée :', reason);
});

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

startServer(PORT);

connectDB().catch((err) => {
  console.warn('⚠️ Erreur asynchrone lors de l initialisation MongoDB :', err && err.message ? err.message : err);
});

try {
  const { scheduleCleanup } = require('./utils/cleanupReplays');
  scheduleCleanup({ intervalMs: 5 * 60 * 1000 });
  console.log('🧰 Tâche de nettoyage des replays planifiée (5 min)');
} catch (err) {
  console.warn('⚠️ Impossible de planifier le nettoyage des replays :', err && err.message ? err.message : err);
}

