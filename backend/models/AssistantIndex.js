const mongoose = require('mongoose');

const AssistantIndexSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, required: false, index: true },
  sourceType: { type: String, enum: ['cours', 'devoir', 'document'], required: true },
  sourceId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  chunkIndex: { type: Number, default: 0 },
  text: { type: String },
  embedding: { type: [Number], default: [] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AssistantIndex', AssistantIndexSchema);
