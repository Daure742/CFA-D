const parseCorsOrigins = (value) => {
  if (!value) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️ CLIENT_URL non défini en production. CORS autorise toutes les origines via un fallback sécurisé.');
      return ['*'];
    }
    return ['http://localhost:5173'];
  }

  const origins = value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length === 0) {
    return ['http://localhost:5173'];
  }

  return origins;
};

module.exports = { parseCorsOrigins };
