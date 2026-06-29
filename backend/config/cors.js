const parseCorsOrigins = (value) => {
  if (!value) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('CLIENT_URL doit être défini en production pour la configuration CORS.');
    }
    return ['http://localhost:5173'];
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

module.exports = { parseCorsOrigins };
