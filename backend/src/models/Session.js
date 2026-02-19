import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    playedAt: { type: Date, default: Date.now },
    teams: [
      {
        name: String,
        color: String,
        score: Number,
      },
    ],
    rounds: [
      {
        teamName: String,
        mode: String,
        card: mongoose.Schema.Types.Mixed,
        pointsEarned: Number,
        timestamp: Date,
        cardSource: { type: String, enum: ['ai', 'builtin', 'custom'], default: null },
        roundDurationMs: Number,
        skipped: { type: Boolean, default: false },
      },
    ],
    winner: String,
    totalRounds: Number,
    selectedMode: { type: String, default: null },
    roundsPerMode: { type: Number, default: null },
    difficulty: { type: String, default: null },
  },
  { timestamps: true }
);

SessionSchema.index({ playedAt: -1 });
SessionSchema.index({ selectedMode: 1 });
SessionSchema.index({ difficulty: 1 });
SessionSchema.index({ 'rounds.mode': 1 });

export default mongoose.model('Session', SessionSchema);
