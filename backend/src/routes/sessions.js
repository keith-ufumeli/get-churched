import express from 'express';
import Session from '../models/Session.js';

const router = express.Router();

const VALID_CARD_SOURCES = ['ai', 'builtin', 'custom'];

function normalizeRounds(rounds) {
  if (!Array.isArray(rounds)) return [];
  return rounds.map((r) => {
    const round = {
      teamName: r.teamName,
      mode: r.mode,
      card: r.card,
      pointsEarned: r.pointsEarned,
      timestamp: r.timestamp ? new Date(r.timestamp) : undefined,
    };
    if (r.cardSource && VALID_CARD_SOURCES.includes(r.cardSource)) {
      round.cardSource = r.cardSource;
    }
    if (typeof r.roundDurationMs === 'number' && r.roundDurationMs >= 0) {
      round.roundDurationMs = r.roundDurationMs;
    }
    if (typeof r.skipped === 'boolean') {
      round.skipped = r.skipped;
    } else {
      round.skipped = false;
    }
    return round;
  });
}

router.post('/', async (req, res, next) => {
  try {
    const body = req.body;
    if (!body || !body.sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    const sessionId = body.sessionId;
    const rounds = normalizeRounds(body.rounds);

    const doc = {
      sessionId,
      playedAt: body.playedAt ? new Date(body.playedAt) : new Date(),
      teams: body.teams || [],
      rounds,
      winner: body.winner ?? undefined,
      totalRounds: body.totalRounds ?? undefined,
      selectedMode: body.selectedMode ?? undefined,
      roundsPerMode: body.roundsPerMode ?? undefined,
      difficulty: body.difficulty ?? undefined,
    };

    const session = await Session.findOneAndUpdate(
      { sessionId },
      { $set: doc },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(201).json({ sessionId: session.sessionId });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Session already exists' });
    }
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const session = await Session.findOne({ sessionId: req.params.id });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json(session);
  } catch (err) {
    next(err);
  }
});

export default router;
