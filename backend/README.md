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
GEMINI_MODEL=gemini-1.5-flash
GEMINI_TOP_UP_RATE=0.3
ALLOWED_ORIGIN=http://localhost:5173
```

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default `3001`) |
| `MONGO_URI` | MongoDB connection string |
| `GEMINI_API_KEY` | API key from [Google AI Studio](https://aistudio.google.com/apikey) |
| `GEMINI_MODEL` | Model ID (e.g. `gemini-1.5-flash` or `gemini-1.5-pro`) |
| `GEMINI_TOP_UP_RATE` | Fraction of card draws that use Gemini (e.g. `0.3` = 30%) |
| `ALLOWED_ORIGIN` | Frontend origin for CORS (e.g. `http://localhost:5173`) |

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
| `POST` | `/api/cards/generate` | Body: `{ mode }`. Returns a card (Gemini or built-in fallback). |
| `POST` | `/api/sessions` | Body: full session object. Saves game to MongoDB. |
| `GET` | `/api/sessions/:id` | Get a saved session by `sessionId`. |
| `GET` | `/api/leaderboard` | Query: `?limit=10&sort=score`. Top leaderboard entries. |
| `POST` | `/api/leaderboard` | Body: `{ displayName, teamName, score, sessionId }`. Add entry. |
| `GET` | `/api/health` | Health check; returns 200 OK. |

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

---

See the [main README](../README.md) and [PRD](../docs/GetChurcked_PRD.md) for full project and API details.
