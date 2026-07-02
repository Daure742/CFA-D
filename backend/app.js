// app.js - configuration Express de la plateforme CFA
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
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
app.disable('x-powered-by');

const allowedOrigins = parseCorsOrigins(process.env.CLIENT_URL);

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS origin non autorisé: ${origin}`), false);
  },
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime()
  });
});

app.get('/api/health', (req, res) => {
  const mongoState = mongoose.connection.readyState;
  const stateNames = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.json({
    status: 'ok',
    uptime: process.uptime(),
    database: {
      state: stateNames[mongoState],
      connected: mongoState === 1,
      host: mongoose.connection.host || 'unknown'
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/api', (req, res) => {
  res.json({ status: 'ok', service: 'cfa-digital-api' });
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

app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Route introuvable' });
});

app.use((err, req, res, next) => {
  console.error(err.stack || err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;
