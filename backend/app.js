// app.js - Configuration Express de la plateforme CFA
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const { parseCorsOrigins } = require('./config/cors');

// Routes
const authRoutes = require('./routes/auth.routes');
const etudiantRoutes = require('./routes/etudiant.routes');
const formateurRoutes = require('./routes/formateur.routes');
const coursRoutes = require('./routes/cours.routes');
const devoirRoutes = require('./routes/devoir.routes');
const documentRoutes = require('./routes/document.routes');
const noteRoutes = require('./routes/note.routes');
const presenceRoutes = require('./routes/presence.routes');
const notificationRoutes = require('./routes/notification.routes');
const messageRoutes = require('./routes/message.routes');
const adminRoutes = require('./routes/admin.routes');
const cohorteRoutes = require('./routes/cohorte.routes');
const scheduleRoutes = require('./routes/schedule.routes');
const cfaRoutes = require('./routes/cfa.routes');
const attestationRoutes = require('./routes/attestation.routes');
const assistantRoutes = require('./routes/assistant.routes');

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
// Middlewares globaux
app.use(helmet());
const allowedOrigins = parseCorsOrigins(process.env.CLIENT_URL);
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Limitation du nombre de requêtes (anti-force brute)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // maximum 100 requêtes par IP
});
app.use('/api/', limiter);

// Routes API
app.get('/api/health', (req, res) => {
  const mongoState = require('mongoose').connection.readyState;
  const stateNames = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({
    status: 'ok',
    service: 'cfa-digital-api',
    database: {
      state: stateNames[mongoState],
      connected: mongoState === 1,
      host: require('mongoose').connection.host || 'unknown'
    },
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/etudiant', etudiantRoutes);
app.use('/api/formateur', formateurRoutes);
app.use('/api/cours', coursRoutes);
app.use('/api/devoirs', devoirRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/presences', presenceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cfas', cfaRoutes);
app.use('/api/cohortes', cohorteRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/attestations', attestationRoutes);
app.use('/api/assistant', assistantRoutes);

// Gestion d'erreur globale
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;
