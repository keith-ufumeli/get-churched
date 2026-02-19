# Get Churched — Backend

Node.js + Express API for **Get Churched**: REST endpoints, MongoDB persistence, and a secure proxy to the Google Gemini API for AI-generated cards.

---

## Stack

- **Runtime:** Node.js 20+
- **Framework:** Express 4
- **Database:** MongoDB (Mongoose)
- **AI:** Google Gemini API (`@google/generative-ai`) — called only from this backend; the API key is never exposed to the frontend.

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Create a `.env` file in this directory (do not commit it):

```env
PORT=3001
MONGO_URI=mongodb://localhost:27017/get-churched
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
GEMINI_TOP_UP_RATE=0.3
ALLOWED_ORIGIN=http://localhost:5173
```

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default `3001`) |
| `MONGO_URI` | MongoDB connection string |
| `GEMINI_API_KEY` | API key from [Google AI Studio](https://aistudio.google.com/apikey) |
| `GEMINI_MODEL` | Model ID (e.g. `gemini-2.5-flash` or `gemini-2.5-pro`) |
| `GEMINI_TOP_UP_RATE` | Fraction of card draws that use Gemini (e.g. `0.3` = 30%) |
| `GEMINI_SOFT_LIMIT_CALLS` | Optional. Per-session max Gemini calls; over this use built-in only (default 1000). |
| `GEMINI_SOFT_LIMIT_TOKENS` | Optional. Per-session max tokens; over this use built-in only (default 500000). |
| `ADMIN_SECRET` | Secret token for admin API; set `X-Admin-Token` header to this value. |
| `ALLOWED_ORIGIN` | Frontend origin for CORS (e.g. `http://localhost:5173`) |
| `RATE_LIMIT_API_MAX` | Optional. General API rate limit: requests per 15 min per IP (default `100`). |
| `RATE_LIMIT_CARDS_MAX` | Optional. Cards generation rate limit: requests per 15 min per IP (default `250`). Higher than general API to avoid 429s during gameplay. |

### 3. Run

```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

Server runs at **http://localhost:3001** (or the port in `PORT`).

---

## Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `nodemon server.js` | Start with auto-reload |
| `start` | `node server.js` | Start for production |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/cards/generate` | Body: `{ mode, difficulty?, country?, usedPrompts?, sessionId? }`. Returns a card. |
| `POST` | `/api/mode-words` | Body: `{ mode, word, difficulty?, country? }`. Add custom word (409 if duplicate). |
| `POST` | `/api/sessions` | Body: full session object. Saves game to MongoDB. |
| `GET` | `/api/sessions/:id` | Get a saved session by `sessionId`. |
| `GET` | `/api/leaderboard` | Query: `?limit=10&sort=score`. Top leaderboard entries. |
| `POST` | `/api/leaderboard` | Body: `{ displayName, teamName, score, sessionId }`. Add entry. |
| `GET` | `/api/health` | Health check; returns 200 OK. |
| `GET/POST/DELETE` | `/api/admin/*` | Admin-only (header `X-Admin-Token: <ADMIN_SECRET>`): words, usage, config, sessions. |

---

## Folder structure (target)

```
backend/
├── src/
│   ├── routes/         # cards, sessions, leaderboard
│   ├── controllers/
│   ├── models/         # Session, Leaderboard (Mongoose)
│   ├── services/       # geminiService.js (Google Gemini)
│   ├── middleware/     # errorHandler, rateLimiter
│   └── app.js          # Express app
├── server.js           # Entry point (connects DB, starts server)
├── .env                # Not committed
└── package.json
```

---

## Security

- **Never** call the Gemini API from the frontend. All AI requests go through this backend so the API key stays in `.env` only.
- `.env` is listed in `.gitignore`; keep it that way.
- **Rate limiting:** General API routes are limited to 100 requests per 15 min per IP; `/api/cards` has a higher limit (250) so gameplay does not hit 429s. Override via `RATE_LIMIT_API_MAX` and `RATE_LIMIT_CARDS_MAX`.

---

See the [main README](../README.md) and [PRD](../docs/GetChurcked_PRD.md) for full project and API details.
