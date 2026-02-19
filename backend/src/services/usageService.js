/**
 * Per-session Gemini API usage tracking. Persists to MongoDB.
 */

import UsageRecord from '../models/UsageRecord.js';

const store = new Map();

const DEFAULT_LIMIT_CALLS = 1000;
const DEFAULT_LIMIT_TOKENS = 500000;

function getKey(sessionId) {
  return sessionId && typeof sessionId === 'string' ? sessionId : 'anonymous';
}

function getOrCreate(sessionId) {
  const key = getKey(sessionId);
  if (!store.has(key)) {
    store.set(key, { calls: 0, tokens: 0, failures: 0, fallbacks: 0 });
  }
  return store.get(key);
}

/**
 * Record usage. Persists to MongoDB.
 * @param {string} sessionId
 * @param {{ tokens?: number, success?: boolean, fallback?: boolean }} opts
 */
export async function record(sessionId, { tokens = 0, success = true, fallback = false }) {
  const key = getKey(sessionId);
  const entry = getOrCreate(sessionId);
  entry.calls += 1;
  entry.tokens += Number(tokens) || 0;
  if (!success) entry.failures += 1;
  if (fallback) entry.fallbacks += 1;

  try {
    await UsageRecord.findOneAndUpdate(
      { sessionId: key },
      {
        $inc: {
          calls: 1,
          tokens: Number(tokens) || 0,
          ...(success ? {} : { failures: 1 }),
          ...(fallback ? { fallbacks: 1 } : {}),
        },
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error('[usageService] Failed to persist usage:', err.message);
  }
}

export function get(sessionId) {
  return { ...getOrCreate(sessionId) };
}

export function isOverLimit(sessionId) {
  const limitCalls = parseInt(process.env.GEMINI_SOFT_LIMIT_CALLS, 10) || DEFAULT_LIMIT_CALLS;
  const limitTokens = parseInt(process.env.GEMINI_SOFT_LIMIT_TOKENS, 10) || DEFAULT_LIMIT_TOKENS;
  const entry = getOrCreate(sessionId);
  if (entry.calls >= limitCalls) return true;
  if (limitTokens > 0 && entry.tokens >= limitTokens) return true;
  return false;
}

/**
 * Get all usage. Reads from MongoDB and merges with in-memory store.
 */
export async function getAll() {
  const out = { ...Object.fromEntries(store) };
  try {
    const docs = await UsageRecord.find().lean();
    for (const d of docs) {
      const key = d.sessionId;
      const existing = out[key] || { calls: 0, tokens: 0, failures: 0, fallbacks: 0 };
      out[key] = {
        calls: Math.max(existing.calls, d.calls || 0),
        tokens: Math.max(existing.tokens, d.tokens || 0),
        failures: Math.max(existing.failures, d.failures || 0),
        fallbacks: Math.max(existing.fallbacks, d.fallbacks || 0),
      };
    }
  } catch (err) {
    console.error('[usageService] Failed to read usage from DB:', err.message);
  }
  return out;
}
