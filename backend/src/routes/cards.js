const express = require('express');
const router = express.Router();
const geminiService = require('../services/geminiService');
const { getRandomBuiltinCard, builtinCards } = require('../data/builtinCards');

const VALID_MODES = Object.keys(builtinCards);

router.post('/generate', async (req, res, next) => {
  try {
    const { mode } = req.body || {};
    if (!mode || typeof mode !== 'string' || !VALID_MODES.includes(mode)) {
      return res.status(400).json({ error: 'Invalid or missing mode. Use one of: ' + VALID_MODES.join(', ') });
    }

    const topUpRate = parseFloat(process.env.GEMINI_TOP_UP_RATE, 10) || 0.3;
    const useGemini = Math.random() < topUpRate;

    let card = null;
    if (useGemini) {
      card = await geminiService.generateCard(mode);
      if (card != null) {
        console.log('[Gemini] Card generated for mode:', mode);
      } else {
        console.log('[Gemini] No response or error, using built-in deck for mode:', mode);
      }
    } else {
      console.log('[Gemini] Using built-in deck (skip Gemini) for mode:', mode);
    }

    if (card == null) {
      card = getRandomBuiltinCard(mode);
    }

    res.json(card);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
