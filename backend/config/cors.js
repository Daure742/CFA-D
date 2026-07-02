const parseCorsOrigins = (value) => {
  if (!value) {
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ CLIENT_URL non défini en production. Définissez CLIENT_URL avec l origine de Vercel.');
      return [];
    }
    // Development: require explicit env var for localhost
    return process.env.DEV_LOCALHOST === 'true' ? ['http://localhost:5173'] : [];
  }

  const origins = value
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
