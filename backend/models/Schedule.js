const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  jour: { type: String, required: true }, // Lundi, Mardi, ...
  debut: { type: String, required: true }, // '08:00'
  fin: { type: String, required: true }, // '10:00'
  module: { type: String },
  formateur: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lien: { type: String },
  coursRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Cours' }
});

const scheduleSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'CFA', required: true },
    cohorte: { type: mongoose.Schema.Types.ObjectId, ref: 'Cohorte', required: true },
    weekStart: { type: Date, required: true }, // Date representing start of week (Monday)
    slots: [slotSchema],
    published: { type: Boolean, default: false },
    publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    versionNote: { type: String }
  },
  { timestamps: true }
);

scheduleSchema.index({ tenantId: 1, cohorte: 1, weekStart: -1 });

module.exports = mongoose.model('Schedule', scheduleSchema);
