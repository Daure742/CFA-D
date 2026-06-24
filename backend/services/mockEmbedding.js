const crypto = require('crypto');

function textToDeterministicVector(text, dim = parseInt(process.env.EMBEDDING_DIM || '1536', 10)) {
  const hash = crypto.createHash('sha256').update(String(text)).digest();
  const vec = new Array(dim);
  // Expand hash bytes into floats deterministically
  for (let i = 0; i < dim; i++) {
    const byte = hash[i % hash.length];
    // map 0..255 to -1..1
    vec[i] = (byte / 127.5) - 1.0;
  }
  return vec;
}

module.exports = { textToDeterministicVector };
