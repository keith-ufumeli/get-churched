import express from 'express';
import CustomWord from '../models/CustomWord.js';
import Session from '../models/Session.js';
import { getAll as getUsageAll } from '../services/usageService.js';
import { getConfig, updateConfig } from '../config/geminiConfig.js';
import { builtinCards } from '../data/builtinCards.js';

const router = express.Router();
const VALID_MODES = Object.keys(builtinCards);

// GET /session is handled in app.js (optional auth); all routes here require adminSessionAuth

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

router.get('/usage', async (req, res, next) => {
  try {
    const usage = await getUsageAll();
    res.json(usage);
  } catch (err) {
    next(err);
  }
});

router.get('/config', (req, res) => {
  res.json(getConfig());
});

router.patch('/config', (req, res) => {
  const updated = updateConfig(req.body || {});
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

// Analytics endpoints
router.get('/analytics/mode-popularity', async (req, res, next) => {
  try {
    const result = await Session.aggregate([
      { $unwind: '$rounds' },
      { $group: { _id: '$rounds.mode', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json(result.map((r) => ({ mode: r._id, count: r.count })));
  } catch (err) {
    next(err);
  }
});

router.get('/analytics/difficulty-distribution', async (req, res, next) => {
  try {
    const result = await Session.aggregate([
      { $match: { difficulty: { $exists: true, $ne: null, $ne: '' } } },
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json(result.map((r) => ({ difficulty: r._id, count: r.count })));
  } catch (err) {
    next(err);
  }
});

router.get('/analytics/session-stats', async (req, res, next) => {
  try {
    const result = await Session.aggregate([
      { $project: { roundCount: { $size: '$rounds' } } },
      {
        $group: {
          _id: null,
          avgRoundsPerSession: { $avg: '$roundCount' },
          totalSessions: { $sum: 1 },
        },
      },
    ]);
    const stats = result[0] || { avgRoundsPerSession: 0, totalSessions: 0 };
    res.json({
      avgRoundsPerSession: Math.round(stats.avgRoundsPerSession * 100) / 100,
      totalSessions: stats.totalSessions,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/analytics/ai-usage', async (req, res, next) => {
  try {
    const usage = await getUsageAll();
    const entries = Object.values(usage);
    const totalCalls = entries.reduce((s, r) => s + (r.calls || 0), 0);
    const totalTokens = entries.reduce((s, r) => s + (r.tokens || 0), 0);
    const totalFailures = entries.reduce((s, r) => s + (r.failures || 0), 0);
    const totalFallbacks = entries.reduce((s, r) => s + (r.fallbacks || 0), 0);
    res.json({
      bySession: usage,
      totals: {
        calls: totalCalls,
        tokens: totalTokens,
        failures: totalFailures,
        fallbacks: totalFallbacks,
        fallbackRate: totalCalls > 0 ? totalFallbacks / totalCalls : 0,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/analytics/custom-words', async (req, res, next) => {
  try {
    const result = await CustomWord.aggregate([
      { $group: { _id: '$mode', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json(result.map((r) => ({ mode: r._id, count: r.count })));
  } catch (err) {
    next(err);
  }
});

router.post('/signout', (req, res) => {
  const session = res.locals.session;
  const isTokenAuth = session?.user?.name === 'Admin (token)';
  if (isTokenAuth) {
    res.json({ ok: true });
  } else {
    const base = typeof req.get('origin') === 'string' ? req.get('origin') : '';
    const callbackUrl = base ? `${base}/admin-portal` : '/admin-portal';
    res.json({ ok: true, redirect: `/auth/signout?callbackUrl=${encodeURIComponent(callbackUrl)}` });
  }
});

export default router;
