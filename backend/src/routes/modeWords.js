const express = require('express');
const router = express.Router();
const CustomWord = require('../models/CustomWord');
const { builtinCards } = require('../data/builtinCards');

const VALID_MODES = Object.keys(builtinCards);

router.post('/', async (req, res, next) => {
  try {
    const { mode, word, difficulty, country } = req.body || {};
    if (!mode || typeof mode !== 'string' || !VALID_MODES.includes(mode)) {
      return res.status(400).json({
        error: 'Invalid or missing mode. Use one of: ' + VALID_MODES.join(', '),
      });
    }
    if (!word || typeof word !== 'string' || !word.trim()) {
      return res.status(400).json({ error: 'word is required and must be non-empty' });
    }

    const doc = {
      mode,
      word: word.trim(),
      ...(difficulty != null && { difficulty: String(difficulty) }),
      ...(country != null && { country: String(country) }),
    };

    const created = await CustomWord.create(doc);
    res.status(201).json(created);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Duplicate: this mode and word combination already exists' });
    }
    next(err);
  }
});

module.exports = router;
