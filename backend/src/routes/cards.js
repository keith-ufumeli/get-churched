import express from 'express';
import { generateCard } from '../services/geminiService.js';
import {
  getRandomBuiltinCard,
  builtinCards,
  normalizeCardKey,
} from '../data/builtinCards.js';
import CustomWord from '../models/CustomWord.js';
import { record as recordUsage, isOverLimit } from '../services/usageService.js';
import { getTopUpRate, getEnabledModes } from '../config/geminiConfig.js';

const router = express.Router();

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
    const enabledModes = getEnabledModes();
    if (!enabledModes.includes(mode)) {
      return res.status(400).json({ error: 'This mode is currently disabled' });
    }

    const usedSet = buildUsedSet(usedPrompts);

    const customAvailable = await getFilteredCustomWords(mode, {
      usedSet,
      difficulty: difficulty != null ? String(difficulty) : null,
      country: country != null ? String(country) : null,
    });

    const topUpRate = getTopUpRate();
    const useGemini =
      Math.random() < topUpRate && !isOverLimit(sessionId);

    let card = null;
    let source = 'builtin';
    let geminiTokens = 0;
    let geminiSuccess = true;

    let result = null;
    if (useGemini) {
      result = await generateCard(mode, {
        difficulty,
        country,
        usedSet,
      });
      geminiTokens = result?.tokens ?? 0;
      geminiSuccess = result?.success !== false;
      const geminiCard = result?.card ?? null;

      if (geminiCard != null) {
        const key = normalizeCardKey(geminiCard);
        if (usedSet && usedSet.has(key)) card = null;
        else {
          card = geminiCard;
          source = 'ai';
          console.log('[Gemini] Card generated for mode:', mode);
        }
      }
      if (card == null) {
        console.log('[Gemini] No response or error, using deck for mode:', mode);
      }
    }

    if (card == null && customAvailable.length > 0 && !JSON_MODES.includes(mode)) {
      card = customAvailable[Math.floor(Math.random() * customAvailable.length)];
      source = 'custom';
    }
    if (card == null) {
      card = getRandomBuiltinCard(mode, { usedSet });
      source = 'builtin';
    }

    if (useGemini && result != null) {
      await recordUsage(sessionId, {
        tokens: geminiTokens,
        success: geminiSuccess,
        fallback: source !== 'ai',
      });
    }

    res.json({ card, source });
  } catch (err) {
    next(err);
  }
});

export default router;
