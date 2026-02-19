/**
 * In-memory per-session Gemini API usage tracking.
 */

const store = new Map();

const DEFAULT_LIMIT_CALLS = 1000;
const DEFAULT_LIMIT_TOKENS = 500000;

function getKey(sessionId) {
  return sessionId && typeof sessionId === 'string' ? sessionId : 'anonymous';
}

function getOrCreate(sessionId) {
  const key = getKey(sessionId);
  if (!store.has(key)) {
    store.set(key, { calls: 0, tokens: 0, failures: 0 });
  }
  return store.get(key);
}

export function record(sessionId, { tokens = 0, success = true }) {
  const entry = getOrCreate(sessionId);
  entry.calls += 1;
  entry.tokens += Number(tokens) || 0;
  if (!success) entry.failures += 1;
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

export function getAll() {
  const out = {};
  for (const [key, val] of store) {
    out[key] = { ...val };
  }
  return out;
}
