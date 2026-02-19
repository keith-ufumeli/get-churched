import { createRequire } from 'module';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { apiLimiter, cardsLimiter } from './middleware/rateLimiter.js';
import errorHandler from './middleware/errorHandler.js';
import { adminSessionAuth } from './middleware/adminSessionAuth.js';
import { optionalAdminSession } from './middleware/optionalAdminSession.js';
import { auth } from './auth.config.js';
import cardsRouter from './routes/cards.js';
import modeWordsRouter from './routes/modeWords.js';
import sessionsRouter from './routes/sessions.js';
import leaderboardRouter from './routes/leaderboard.js';
import adminRouter from './routes/admin.js';

const require = createRequire(import.meta.url);
const openApiDocument = require('./openapi.json');

const app = express();

app.set('trust proxy', 1);

// Comma-separated origins for CORS (e.g. "http://localhost:5173,https://myapp.com")
const allowedOrigins = (process.env.ALLOWED_ORIGIN || 'http://localhost:5173').split(',').map((o) => o.trim()).filter(Boolean);
app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : true, credentials: true }));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use('/auth', auth);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/cards', cardsLimiter);
app.use('/api', (req, res, next) => {
  if (req.originalUrl.startsWith('/api/cards')) return next();
  return apiLimiter(req, res, next);
});
app.use('/api/cards', cardsRouter);
app.use('/api/mode-words', modeWordsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/leaderboard', leaderboardRouter);
// Session check is public (200 + { user: null } when not logged in); rest of admin requires auth
app.get('/api/admin/session', optionalAdminSession, (req, res) => {
  res.json(res.locals.session ?? { user: null });
});
app.use('/api/admin', adminSessionAuth, adminRouter);

app.use(errorHandler);

export default app;
