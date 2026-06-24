// utils/cleanupReplays.js
// Periodic job to cleanup expired replayUrl fields on courses.
const mongoose = require('mongoose');
const Cours = require('../models/Cours');

async function cleanupExpiredReplays() {
  try {
    if (mongoose.connection.readyState !== 1) return;

    const now = new Date();
    const expired = await Cours.find({ replayExpireAt: { $lte: now }, replayUrl: { $exists: true, $ne: null } }).select('_id replayUrl replayExpireAt');
    if (!expired.length) return;

    const ids = expired.map((c) => c._id);
    await Cours.updateMany({ _id: { $in: ids } }, { $unset: { replayUrl: '', replayExpireAt: '' } });
    console.log(`🧹 Nettoyage replay: retiré replayUrl pour ${ids.length} cours`);
  } catch (err) {
    console.error('Erreur cleanupExpiredReplays:', err);
  }
}

function scheduleCleanup({ intervalMs = 5 * 60 * 1000 } = {}) {
  const runInitialCleanup = () => cleanupExpiredReplays();

  if (mongoose.connection.readyState === 1) {
    runInitialCleanup();
  } else {
    mongoose.connection.once('connected', runInitialCleanup);
  }

  return setInterval(cleanupExpiredReplays, intervalMs);
}

module.exports = { cleanupExpiredReplays, scheduleCleanup };
