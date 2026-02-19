const express = require('express');
const router = express.Router();
const CustomWord = require('../models/CustomWord');
const Session = require('../models/Session');
const usageService = require('../services/usageService');
const geminiConfig = require('../config/geminiConfig');
const { builtinCards } = require('../data/builtinCards');

const VALID_MODES = Object.keys(builtinCards);

router.get('/words', async (req, res, next) => {
  try {
    const { mode } = req.query;
    const query = mode && VALID_MODES.includes(mode) ? { mode } : {};
    const words = await CustomWord.find(query).sort({ createdAt: -1 }).lean();
    res.json(words);
  } catch (err) {
    next(err);
  }
});

router.post('/words', async (req, res, next) => {
  try {
    const { mode, word, difficulty, country } = req.body || {};
    if (!mode || !word || !VALID_MODES.includes(mode)) {
      return res.status(400).json({ error: 'mode and word required; mode must be valid' });
    }
    const created = await CustomWord.create({
      mode,
      word: String(word).trim(),
      difficulty: difficulty != null ? String(difficulty) : undefined,
      country: country != null ? String(country) : undefined,
      source: 'admin',
    });
    res.status(201).json(created);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Duplicate mode+word' });
    next(err);
  }
});

router.delete('/words/:id', async (req, res, next) => {
  try {
    const deleted = await CustomWord.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Word not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.get('/usage', (req, res) => {
  const usage = usageService.getAll();
  res.json(usage);
});

router.get('/config', (req, res) => {
  res.json(geminiConfig.getConfig());
});

router.patch('/config', (req, res) => {
  const updated = geminiConfig.updateConfig(req.body || {});
  res.json(updated);
});

router.get('/sessions', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const sessions = await Session.find()
      .sort({ playedAt: -1 })
      .limit(limit)
      .lean()
      .select('sessionId playedAt teams winner totalRounds difficulty');
    res.json(sessions);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
