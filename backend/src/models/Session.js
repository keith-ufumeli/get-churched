import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  playedAt: { type: Date, default: Date.now },
  teams: [{
    name: String,
    color: String,
    score: Number,
  }],
  rounds: [{
    teamName: String,
    mode: String,
    card: mongoose.Schema.Types.Mixed,
    pointsEarned: Number,
    timestamp: Date,
  }],
  winner: String,
  totalRounds: Number,
  selectedMode: { type: String, default: null },
  roundsPerMode: { type: Number, default: null },
  difficulty: { type: String, default: null },
});

export default mongoose.model('Session', SessionSchema);
