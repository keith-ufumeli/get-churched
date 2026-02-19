import express from 'express';
import Leaderboard from '../models/Leaderboard.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
    const sort = req.query.sort === 'score' ? { score: -1 } : { achievedAt: -1 };

    const entries = await Leaderboard.find()
      .sort(sort)
      .limit(limit)
      .lean();

    res.json(entries);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { displayName, teamName, score, sessionId } = req.body || {};
    if (displayName == null || displayName === '' || typeof score !== 'number') {
      return res.status(400).json({ error: 'displayName and score (number) are required' });
    }

    const entry = new Leaderboard({
      displayName: String(displayName).trim(),
      teamName: teamName != null ? String(teamName) : undefined,
      score,
      sessionId: sessionId != null ? String(sessionId) : undefined,
    });

    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
});

export default router;
