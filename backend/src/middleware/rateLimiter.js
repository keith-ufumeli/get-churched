import rateLimit from 'express-rate-limit';

const windowMs = 15 * 60 * 1000;

/** General API: 100 requests per 15 min per IP. */
export const apiLimiter = rateLimit({
  windowMs,
  max: parseInt(process.env.RATE_LIMIT_API_MAX, 10) || 100,
  standardHeaders: true,
  legacyHeaders: false,
});

/** Cards generation: higher limit for gameplay (one request per round). */
export const cardsLimiter = rateLimit({
  windowMs,
  max: parseInt(process.env.RATE_LIMIT_CARDS_MAX, 10) || 250,
  standardHeaders: true,
  legacyHeaders: false,
});

export default apiLimiter;
