const express = require('express');
const router = express.Router();
const geminiService = require('../services/geminiService');
const {
  getRandomBuiltinCard,
  builtinCards,
  normalizeCardKey,
} = require('../data/builtinCards');
const CustomWord = require('../models/CustomWord');
const usageService = require('../services/usageService');
const geminiConfig = require('../config/geminiConfig');

const VALID_MODES = Object.keys(builtinCards);
const JSON_MODES = ['trivia', 'fillinblank', 'taboo'];

function buildUsedSet(usedPrompts) {
  if (!Array.isArray(usedPrompts) || usedPrompts.length === 0) return null;
  const set = new Set();
  for (const p of usedPrompts) {
    if (p != null && typeof p === 'string') set.add(p.trim().toLowerCase());
    else if (typeof p === 'object') set.add(normalizeCardKey(p));
  }
  return set.size > 0 ? set : null;
}

async function getFilteredCustomWords(mode, { usedSet, difficulty, country }) {
  const query = { mode };
  if (difficulty != null && difficulty !== '') query.difficulty = difficulty;
  if (country != null && country !== '') query.country = country;
  const list = await CustomWord.find(query).lean();
  if (!usedSet || usedSet.size === 0) return list.map((d) => d.word);
  return list
    .filter((d) => !usedSet.has(String(d.word).trim().toLowerCase()))
    .map((d) => d.word);
}

router.post('/generate', async (req, res, next) => {
  try {
    const {
      mode,
      difficulty,
      country,
      usedPrompts,
      sessionId,
    } = req.body || {};
    if (!mode || typeof mode !== 'string' || !VALID_MODES.includes(mode)) {
      return res.status(400).json({ error: 'Invalid or missing mode. Use one of: ' + VALID_MODES.join(', ') });
    }
    const enabledModes = geminiConfig.getEnabledModes();
    if (!enabledModes.includes(mode)) {
      return res.status(400).json({ error: 'This mode is currently disabled' });
    }

    const usedSet = buildUsedSet(usedPrompts);

    const customAvailable = await getFilteredCustomWords(mode, {
      usedSet,
      difficulty: difficulty != null ? String(difficulty) : null,
      country: country != null ? String(country) : null,
    });

    const topUpRate = geminiConfig.getTopUpRate();
    const useGemini =
      Math.random() < topUpRate && !usageService.isOverLimit(sessionId);

    let card = null;
    if (useGemini) {
      const { card: geminiCard, tokens, success } = await geminiService.generateCard(mode, {
        difficulty,
        country,
        usedSet,
      });
      usageService.record(sessionId, { tokens, success });
      if (geminiCard != null) {
        const key = normalizeCardKey(geminiCard);
        if (usedSet && usedSet.has(key)) card = null;
        else {
          card = geminiCard;
          console.log('[Gemini] Card generated for mode:', mode);
        }
      }
      if (card == null) {
        console.log('[Gemini] No response or error, using deck for mode:', mode);
      }
    }

    if (card == null && customAvailable.length > 0 && !JSON_MODES.includes(mode)) {
      card = customAvailable[Math.floor(Math.random() * customAvailable.length)];
    }
    if (card == null) {
      card = getRandomBuiltinCard(mode, { usedSet });
    }

    res.json(card);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
