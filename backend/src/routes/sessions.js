const express = require('express');
const router = express.Router();
const Session = require('../models/Session');

router.post('/', async (req, res, next) => {
  try {
    const body = req.body;
    if (!body || !body.sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    const session = new Session({
      sessionId: body.sessionId,
      playedAt: body.playedAt ? new Date(body.playedAt) : undefined,
      teams: body.teams || [],
      rounds: body.rounds || [],
      winner: body.winner,
      totalRounds: body.totalRounds,
      selectedMode: body.selectedMode ?? undefined,
      roundsPerMode: body.roundsPerMode ?? undefined,
      difficulty: body.difficulty ?? undefined,
    });

    await session.save();
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

module.exports = router;
