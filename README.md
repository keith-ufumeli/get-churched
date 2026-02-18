# ✟ Get Churched

A faith-based digital party game — a web adaptation of the KultureGames *Get ChurchED* card game. Play with **10 interactive game modes**, AI-generated cards via the Anthropic Claude API, team management, score tracking, and session history stored in MongoDB.

**Shared-device, same-room play:** multiple teams pass one device to take turns. No per-user login required during gameplay.

---

## Stack

| Layer        | Tech |
|-------------|------|
| Frontend    | React 18 + Vite, TypeScript, Tailwind CSS v3, shadcn/ui, TanStack Query, React Router v6 |
| Backend     | Node.js 20 + Express 4 |
| Database    | MongoDB + Mongoose |
| AI          | Anthropic Claude API (proxied via backend only) |

---

## Quick Start

### Prerequisites

- **Node.js v20+**
- **MongoDB** (local or [Atlas](https://cloud.mongodb.com))
- **Anthropic API key** from [console.anthropic.com](https://console.anthropic.com)

### 1. Install dependencies

```bash
# Frontend
cd frontend && npm install

# Backend (from repo root)
cd backend && npm install
```

### 2. Environment

Create `backend/.env`:

```env
PORT=3001
MONGO_URI=mongodb://localhost:27017/get-churched
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxx
CLAUDE_MODEL=claude-sonnet-4-5-20251022
CLAUDE_TOP_UP_RATE=0.3
ALLOWED_ORIGIN=http://localhost:5173
```

Never commit `.env` — it is listed in `.gitignore`.

### 3. Run

```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend
cd frontend && npm run dev
```

Open **http://localhost:5173**. The frontend proxies `/api` to the backend.

---

## Project Structure

```
get-churched/
├── frontend/          # React + Vite + TypeScript SPA
│   ├── src/
│   │   ├── components/ # cards/, game/, ui/ (shadcn)
│   │   ├── context/   # GameContext (teams, scores, rounds)
│   │   ├── hooks/     # useTimer, useCanvas, useCard
│   │   ├── lib/       # TanStack Query, Axios, utils
│   │   ├── pages/     # Home, Setup, Round, Scoreboard
│   │   ├── types/     # game.ts, api.ts
│   │   └── data/      # Built-in card deck (JSON)
│   └── ...
├── backend/           # Node.js + Express
│   ├── src/
│   │   ├── routes/    # cards, sessions, leaderboard
│   │   ├── services/  # claudeService (Anthropic)
│   │   ├── models/    # Session, Leaderboard (Mongoose)
│   │   └── middleware/
│   └── server.js
├── docs/              # PRD and design docs
└── README.md
```

---

## Game Modes (10)

| Mode              | Description |
|-------------------|-------------|
| Sing 🎵           | Sing ≥7 words of a worship song containing the prompt |
| Act 🎭            | Charades — Bible character or story |
| Explain 📖        | Describe the Bible word without saying it |
| Trivia ❓         | Multiple-choice Bible question |
| Hum a Hymn 🎶     | Hum melody; team names the hymn |
| Who Am I? 👤      | Yes/no questions to guess Bible character |
| Fill in the Blank 📜 | Bible verse with one word missing |
| Taboo 🚫          | Describe word without 5 forbidden words |
| One Word 1️⃣       | One word only to describe the concept |
| Draw 🎨           | Pictionary-style on canvas |

Cards come from a built-in deck (~70%) and from Claude API (~30%). If the API fails, the backend falls back to the built-in deck.

---

## API (Backend)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/cards/generate` | Body: `{ mode }` — returns card (Claude or fallback) |
| POST   | `/api/sessions`       | Save completed game |
| GET    | `/api/sessions/:id`   | Get session by ID |
| GET    | `/api/leaderboard`    | Top entries (`?limit=10&sort=score`) |
| POST   | `/api/leaderboard`    | Add leaderboard entry |
| GET    | `/api/health`         | Server health check |

---

## Docs

- **[Product Requirements Document (PRD)](docs/GetChurcked_PRD.md)** — full spec, setup steps, data models, and architecture.

---

## License

See repository for license details.

> ✟ *Get Churched — may your code be clean and your fellowship blessed.*
