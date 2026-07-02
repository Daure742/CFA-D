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

// CRITICAL: Port must come from Render/environment
const PORT = (() => {
  // On Render, PORT is ALWAYS provided via environment
  const raw = process.env.PORT || process.env.RENDER_PORT;
  
  if (!raw) {
    // If running locally without PORT, use 5000 for development
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️ PORT non fourni. Développement local sur 5000.');
      return 5000;
    }
    // In production, PORT is REQUIRED
    console.error('❌ CRITICAL: PORT environment variable is required in production.');
    process.exit(1);
  }
  
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    console.error(`❌ CRITICAL: PORT invalide (${raw}). Exiting.`);
    process.exit(1);
  }
  
  return parsed;
})();

console.log(`📍 Serveur se liera au port: ${PORT} on 0.0.0.0`);

const server = http.createServer(app);
const allowedOrigins = parseCorsOrigins(process.env.CLIENT_URL);

const initSocketIO = () => {
  try {
    const { Server } = require('socket.io');
    const socketHandler = require('./socket/socketHandler');
    const io = new Server(server, {
      cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        credentials: true,
        allowedHeaders: ['Authorization', 'Content-Type', 'Accept', 'Origin', 'Cookie']
      },
      pingTimeout: 30000,
      maxHttpBufferSize: 1e6,
      transports: ['websocket', 'polling']
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
    console.log('✅ Port ouvert - Render port scan devrait réussir');
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${port} déjà utilisé. Impossible de continuer.`);
      process.exit(1);
    }

    console.error('💥 Erreur serveur critique :', err);
    process.exit(1);
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

// Setup error handlers BEFORE any startup code
process.on('uncaughtException', (error) => {
  console.error('💥 uncaughtException capturée :', error);
  console.error('⚠️ Serveur continue malgré l\'erreur (mode dégradé)');
});

process.on('unhandledRejection', (reason) => {
  console.error('💥 unhandledRejection capturée :', reason);
  console.error('⚠️ Serveur continue malgré l\'erreur (mode dégradé)');
});

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// CRITICAL: START SERVER FIRST
// This ensures Render detects open port immediately
startServer(PORT);

// ASYNC tasks run AFTER server is listening
setImmediate(async () => {
  try {
    await connectDB();
  } catch (err) {
    console.warn('⚠️ Erreur asynchrone lors de l initialisation MongoDB :', err && err.message ? err.message : err);
  }
});

// Schedule cleanup tasks
setImmediate(() => {
  try {
    const { scheduleCleanup } = require('./utils/cleanupReplays');
    scheduleCleanup({ intervalMs: 5 * 60 * 1000 });
    console.log('🧰 Tâche de nettoyage des replays planifiée (5 min)');
  } catch (err) {
    console.warn('⚠️ Impossible de planifier le nettoyage des replays :', err && err.message ? err.message : err);
  }
});

