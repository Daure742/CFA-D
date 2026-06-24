const parseCorsOrigins = (value) => {
  if (!value) {
    return ['http://localhost:5173'];
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

module.exports = { parseCorsOrigins };
