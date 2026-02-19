const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const rateLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const adminAuth = require('./middleware/adminAuth');
const cardsRouter = require('./routes/cards');
const modeWordsRouter = require('./routes/modeWords');
const sessionsRouter = require('./routes/sessions');
const leaderboardRouter = require('./routes/leaderboard');
const adminRouter = require('./routes/admin');
const openApiDocument = require('./openapi.json');

const app = express();

const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: allowedOrigin }));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api', rateLimiter);
app.use('/api/cards', cardsRouter);
app.use('/api/mode-words', modeWordsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/admin', adminAuth, adminRouter);

app.use(errorHandler);

module.exports = app;
