const mongoose = require('mongoose');

const LeaderboardSchema = new mongoose.Schema({
  displayName: { type: String, required: true },
  teamName: String,
  score: { type: Number, required: true },
  sessionId: String,
  achievedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Leaderboard', LeaderboardSchema);
