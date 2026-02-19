const mongoose = require('mongoose');

const CustomWordSchema = new mongoose.Schema({
  mode: { type: String, required: true },
  word: { type: String, required: true },
  difficulty: { type: String, default: null },
  country: { type: String, default: null },
  source: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
});

CustomWordSchema.index({ mode: 1, word: 1 }, { unique: true });

module.exports = mongoose.model('CustomWord', CustomWordSchema);
