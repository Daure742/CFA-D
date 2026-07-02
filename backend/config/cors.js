const DEFAULT_PRODUCTION_FRONTEND_URL = 'https://plateforme-cfa.vercel.app';

const parseCorsOrigins = (value) => {
  const sourceValue = value || process.env.CLIENT_URL || process.env.FRONTEND_URL || process.env.CORS_ORIGIN;

  if (!sourceValue) {
    if (process.env.NODE_ENV === 'production') {
      console.warn(`⚠️ CLIENT_URL absent en production. Utilisation du fallback sécurisé ${DEFAULT_PRODUCTION_FRONTEND_URL}`);
      return [DEFAULT_PRODUCTION_FRONTEND_URL];
    }

    return process.env.DEV_LOCALHOST === 'true' ? ['http://localhost:5173'] : [];
  }

  const origins = sourceValue
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return origins.length > 0 ? origins : [];
};

const createCorsOptions = (allowedOrigins = []) => ({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes('*')) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS origin non autorisée : ${origin}`), false);
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'Origin', 'Cookie'],
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 204,
});

module.exports = { parseCorsOrigins, createCorsOptions };
