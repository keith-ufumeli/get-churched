# ✟ GET CHURCHED
## Web App — Product Requirements Document

> **Stack:** React + Vite · TypeScript · Node.js/Express · MongoDB · Tailwind CSS v3 · shadcn/ui · Anthropic Claude API

| Field | Detail |
|---|---|
| **Version** | 1.1.0 — Frontend Stack Updated |
| **Date** | February 2026 |
| **Status** | Draft — In Development |

---

## 1. Project Overview

Get Churched is a faith-based digital party game — a web application adaptation of the physical KultureGames *Get ChurchED* card game — extended with **10 interactive game modes**, AI-powered card generation via the Anthropic Claude API, team management, score tracking, and game session history stored in MongoDB.

The application runs entirely in a **shared-device, same-room setting** where multiple teams pass a single device around to take turns. No per-user authentication is required during gameplay, but optional host accounts allow saving game history and accessing a leaderboard.

---

## 2. Goals & Non-Goals

### 2.1 Goals

- Deliver all 10 game modes in a polished, production-ready React + Vite SPA written in TypeScript.
- Use the Anthropic Claude API (`claude-sonnet-4-5` or later) to generate fresh card prompts on demand, supplementing a built-in offline deck.
- Persist game session results and team scores in MongoDB.
- Support a flexible number of teams (2–unlimited) on one shared browser device.
- Keep the API key secure by routing all Claude API calls through the Node.js/Express backend — never exposed to the browser.

### 2.2 Non-Goals (v1.0)

- Real-time multiplayer across separate devices (no WebSocket sync for v1).
- Native mobile apps (iOS/Android).
- Paid subscriptions or in-app purchases.
- User-generated custom card decks (considered for v2).

---

## 3. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18 + Vite | Component-based SPA, hooks-based architecture |
| Language | TypeScript | Static typing across frontend and shared types |
| Styling | Tailwind CSS v3 | Utility-first styling, church warm theme |
| Component Library | shadcn/ui | Accessible, unstyled primitives styled with Tailwind |
| Icons | lucide-react | Consistent, lightweight icon set |
| Server State | TanStack Query (React Query) | API data fetching, caching, and synchronisation |
| Client State | React Context + `useReducer` | In-game session state (teams, scores, round progress) |
| Routing | React Router v6 | SPA navigation between screens |
| Backend | Node.js 20 + Express 4 | REST API, Claude proxy, DB layer |
| AI Engine | Anthropic Claude API | Dynamic card + trivia generation |
| Database | MongoDB + Mongoose | Game sessions, scores, leaderboard |
| Canvas | HTML5 Canvas (React ref) | Draw mode freehand drawing board |
| HTTP Client | Axios | Frontend → backend API calls (used inside TanStack Query) |
| Env/Config | `.env` + dotenv | Secrets management |

---

## 4. Recommended Folder Structure

```
get-churched/
├── frontend/                        # React + Vite + TypeScript application
│   ├── src/
│   │   ├── assets/                  # Fonts, images, icons
│   │   ├── components/              # Reusable React components
│   │   │   ├── cards/               # One component per game mode
│   │   │   │   ├── SingCard.tsx
│   │   │   │   ├── TriviaCard.tsx
│   │   │   │   ├── DrawCard.tsx
│   │   │   │   └── ...              # One file per mode
│   │   │   ├── game/                # Timer, ScoreBoard, TeamSetup
│   │   │   │   ├── Timer.tsx
│   │   │   │   ├── ScoreBoard.tsx
│   │   │   │   └── TeamSetup.tsx
│   │   │   └── ui/                  # shadcn/ui re-exports + custom primitives
│   │   │       ├── button.tsx
│   │   │       ├── card.tsx
│   │   │       ├── dialog.tsx
│   │   │       ├── badge.tsx
│   │   │       └── ...
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useTimer.ts
│   │   │   ├── useCanvas.ts
│   │   │   └── useCard.ts
│   │   ├── context/                 # React Context providers
│   │   │   └── GameContext.tsx      # Active game state (teams, scores, round)
│   │   ├── lib/                     # TanStack Query clients, Axios instance, utils
│   │   │   ├── queryClient.ts       # TanStack Query client setup
│   │   │   ├── api.ts               # Axios instance + typed API helpers
│   │   │   └── utils.ts             # cn(), shuffle(), etc.
│   │   ├── pages/                   # Route-level page components
│   │   │   ├── HomePage.tsx
│   │   │   ├── SetupPage.tsx
│   │   │   ├── GamePage.tsx
│   │   │   ├── RoundPage.tsx
│   │   │   └── ScoreboardPage.tsx
│   │   ├── router/                  # React Router route definitions
│   │   │   └── index.tsx
│   │   ├── data/                    # Built-in card deck (typed JSON)
│   │   │   └── cards.ts
│   │   ├── types/                   # Shared TypeScript types & interfaces
│   │   │   ├── game.ts              # Team, Round, Session, CardMode types
│   │   │   └── api.ts               # API request/response types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── components.json              # shadcn/ui config
│   ├── vite.config.ts
│   └── package.json
│
├── backend/                         # Node.js + Express server
│   ├── src/
│   │   ├── routes/
│   │   │   ├── cards.js             # POST /api/cards/generate
│   │   │   ├── sessions.js          # POST/GET /api/sessions
│   │   │   └── leaderboard.js       # GET /api/leaderboard
│   │   ├── controllers/             # Business logic per route
│   │   ├── models/                  # Mongoose schemas
│   │   │   ├── Session.js
│   │   │   └── Leaderboard.js
│   │   ├── services/
│   │   │   └── claudeService.js     # All Claude API calls
│   │   ├── middleware/
│   │   │   ├── errorHandler.js
│   │   │   └── rateLimiter.js
│   │   └── app.js                   # Express app setup
│   ├── server.js                    # Entry point
│   ├── .env                         # ANTHROPIC_API_KEY, MONGO_URI
│   └── package.json
│
└── README.md
```

---

## 5. Game Modes (10 Total)

Each round, the active team draws a card from a randomly selected mode. Cards are sourced first from the built-in JSON deck; if the AI top-up flag is active (~30% of draws), the backend requests a fresh card from the Claude API instead.

| # | Mode | Card Colour | How to Play | Scoring |
|---|---|---|---|---|
| 1 | Sing 🎵 | Yellow | Sing ≥7 words of a worship/Christian song containing the prompt word. Any language is valid as long as the opposing team recognises the song. | 2 pts — correct guess within 60 s |
| 2 | Act 🎭 | Red | Charades-style. Act out a Bible character, story, or concept using gestures only — no speech or mouthing. | 2 pts — correct guess within 60 s |
| 3 | Explain 📖 | Blue | Describe the Bible word using any words except the word itself or direct derivatives. | 2 pts — correct guess within 60 s |
| 4 | Trivia ❓ | Green | Multiple-choice Bible knowledge question. The active player reads the question aloud; the team selects one of four options. | 2 pts correct · 0 pts incorrect |
| 5 | Hum a Hymn 🎶 | Purple | Hum, whistle, or sing the melody of a well-known hymn or worship song — no lyrics or title. Team must name it. | 2 pts — correct name within 60 s |
| 6 | Who Am I? 👤 | Peach | A Bible character name is shown. The team asks yes/no questions only; the holder answers to help team guess their identity. | 2 pts — correct guess within 90 s |
| 7 | Fill in the Blank 📜 | Teal | A Bible verse is displayed with one key word replaced by `_____`. The team shouts out the missing word. | 2 pts correct · 0 pts incorrect |
| 8 | Taboo 🚫 | Crimson | Describe the top word without using any of the 5 forbidden words listed on the card. | 2 pts — correct guess within 60 s |
| 9 | One Word 1️⃣ | Navy | Describe the Bible concept or character using only a single spoken word — no gestures. | 2 pts — correct guess within 30 s |
| 10 | Draw 🎨 | Amber | Pictionary-style. Draw the Bible prompt on the canvas; no letters, numbers, or spoken hints. | 2 pts — correct guess within 90 s |

---

## 6. Claude API Integration (Card Generation)

All Claude API requests are made **exclusively from the Express backend**. The browser never has access to the API key. The frontend calls `POST /api/cards/generate` with a `mode` parameter; the backend constructs the appropriate prompt, calls the Anthropic API, parses the response, and returns a structured card object.

### 6.1 Secure Architecture

```
Browser (React)
   │  POST /api/cards/generate  { mode: 'trivia' }
   │  (via TanStack Query useMutation → Axios)
   ▼
Express Backend  ─────────────────────────────────────────────
   │  claudeService.generateCard(mode)
   │  headers: { x-api-key: process.env.ANTHROPIC_API_KEY }
   ▼
Anthropic API  (api.anthropic.com/v1/messages)
   │  model: claude-sonnet-4-5-20251022
   │  max_tokens: 300
   ▼
Backend parses + validates response JSON
   ▼
Returns clean card object to React frontend
```

### 6.2 Prompt Design Per Mode

The `claudeService.js` file (backend) maps each mode to a carefully crafted system+user prompt pair. On the frontend, typed API helpers in `src/lib/api.ts` define the response shapes and are consumed via TanStack Query hooks. All prompts instruct the model to reply **only with valid JSON** in a defined schema, with no preamble or markdown fences.

| Mode | User Prompt (summary) | Expected JSON Schema |
|---|---|---|
| `sing` / `act` / `explain` / `hum` / `whoami` / `oneword` / `draw` | Return a single Christian/Bible prompt word or short phrase suitable for [mode]. Reply with only the plain string, no JSON. | `{ "card": "Amazing Grace" }` |
| `trivia` | Generate one Bible trivia question with 4 options. Reply with only JSON. | `{ "q": "...", "a": "correct", "options": ["a","b","c","d"] }` |
| `fillinblank` | Generate one fill-in-the-blank Bible verse. Replace one word with `_____`. | `{ "verse": "..._____...", "answer": "word", "ref": "John 3:16" }` |
| `taboo` | Generate one Bible taboo card with a word and 5 forbidden words. | `{ "word": "Prayer", "forbidden": ["talk","God",...] }` |

### 6.3 Fallback Strategy

The system uses a **70/30 split**:
- **70%** of draws use the built-in JSON deck (works fully offline).
- **30%** request a freshly generated card from Claude.

If the Claude API call fails for any reason (network error, timeout, rate limit), the backend silently falls back to serving a built-in card. The client never sees an error — it simply receives a card.

> ℹ **Tip:** Set `CLAUDE_TOP_UP_RATE=0.3` in `.env` to control the AI draw probability without redeploying code.

> ⚠ **Warning:** Never call the Anthropic API directly from React/Axios. Always proxy through Express to keep your API key secret.

---

## 7. Sessions, Auth & Login Recommendation

### 7.1 How Game Sessions Work

A game session is an in-memory React Context + `useReducer` state object that is created at setup time and persisted to MongoDB at game end. No user account is required to play. The full session lifecycle is:

1. Host opens the app and navigates to Setup.
2. Host enters team names (2–unlimited) and selects rounds per team.
3. A `sessionId` (UUID v4) is generated on the frontend at game start.
4. Each round result (mode drawn, card shown, team, points scored, timestamp) is recorded in the `GameContext` reducer.
5. When the game ends (all rounds complete), the frontend POSTs the full session object to `POST /api/sessions` via a TanStack Query `useMutation`.
6. The backend saves it to MongoDB under the `Session` collection and returns the `sessionId`.
7. The Scoreboard screen shows final standings and a *Save to Leaderboard* button (optional, requires name entry).

### 7.2 Login — Recommendation

Full per-user login authentication is **NOT required** for v1.0 gameplay. However, the following lightweight approach is recommended to support the leaderboard and session history features:

| Feature | Recommendation |
|---|---|
| **Guest play** | Allow full gameplay with no account. `SessionId` stored in `localStorage` for the duration of the game. |
| **Leaderboard entry** | Prompt for a display name only (no password). Store name + score in MongoDB `Leaderboard` collection. No auth needed. |
| **Host accounts (v1.5)** | Optional: simple email + bcrypt password stored in MongoDB. Use `express-session` or JWT to persist login. Enables viewing past game history. |
| **OAuth (v2)** | Consider Google OAuth via Passport.js for frictionless login if host accounts gain adoption. |

> ℹ For v1.0, skip login entirely. Add it only when leaderboard or saved-deck features are prioritised.

---

## 8. MongoDB Data Models

### 8.1 Session Schema

```js
// backend/src/models/Session.js
const SessionSchema = new mongoose.Schema({
  sessionId:   { type: String, required: true, unique: true },
  playedAt:    { type: Date,   default: Date.now },
  teams: [{
    name:  String,
    color: String,
    score: Number,
  }],
  rounds: [{
    teamName:     String,
    mode:         String,                      // 'sing' | 'trivia' | etc.
    card:         mongoose.Schema.Types.Mixed, // string or object
    pointsEarned: Number,
    timestamp:    Date,
  }],
  winner:      String,  // team name
  totalRounds: Number,
});
```

### 8.2 Leaderboard Schema

```js
// backend/src/models/Leaderboard.js
const LeaderboardSchema = new mongoose.Schema({
  displayName: { type: String, required: true },
  teamName:    String,
  score:       { type: Number, required: true },
  sessionId:   String,
  achievedAt:  { type: Date, default: Date.now },
});
```

---

## 9. Backend API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/cards/generate` | Body: `{ mode }`. Calls Claude API (or falls back to built-in deck). Returns a structured card object. |
| `POST` | `/api/sessions` | Body: full session object. Saves completed game to MongoDB. Returns `{ sessionId }`. |
| `GET` | `/api/sessions/:id` | Returns a single saved session by `sessionId`. |
| `GET` | `/api/leaderboard` | Query params: `?limit=10&sort=score`. Returns top entries. |
| `POST` | `/api/leaderboard` | Body: `{ displayName, teamName, score, sessionId }`. Adds a leaderboard entry. |
| `GET` | `/api/health` | Returns `200 OK` with server status. Used by frontend to check API availability. |

---

## 10. Installation & Setup Steps

### Step 1 — Prerequisites

Ensure the following are installed before beginning:

- **Node.js v20+** — https://nodejs.org
- **npm v9+** (bundled with Node.js)
- **MongoDB** — local install (https://www.mongodb.com/try/download/community) or free Atlas cluster (https://cloud.mongodb.com)
- **Git** — for version control
- **Anthropic API key** — obtain from https://console.anthropic.com

### Step 2 — Clone & Scaffold Project

```bash
# Create project root
mkdir get-churched && cd get-churched

# Scaffold React + TypeScript frontend with Vite
npm create vite@latest frontend -- --template react-ts
cd frontend && npm install

# Return to root and create backend
cd ..
mkdir backend && cd backend
npm init -y
```

### Step 3 — Install Frontend Dependencies

```bash
cd frontend

# Routing
npm install react-router-dom

# Server state: TanStack Query
npm install @tanstack/react-query

# HTTP client
npm install axios

# Icons
npm install lucide-react

# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# shadcn/ui prerequisites (Radix UI + class variance authority)
npm install class-variance-authority clsx tailwind-merge
npm install @radix-ui/react-slot

# TypeScript path alias support (for shadcn/ui @/ imports)
npm install -D @types/node
```

**Initialise shadcn/ui:**

```bash
# Run the shadcn/ui CLI — choose "Default" style, confirm Tailwind config path
npx shadcn-ui@latest init

# Add individual components as needed, e.g.:
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add input
npx shadcn-ui@latest add progress
```

> ℹ `shadcn/ui` copies component source into `src/components/ui/` — you own the code and can customise freely.

**Configure `tailwind.config.ts`:**

```ts
// frontend/tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        parchment: '#F5ECD7',
        cream:     '#FDF6E3',
        mahogany:  '#4A1C0E',
        warmBrown: '#6B3A2A',
        gold:      '#C9963A',
        olive:     '#7A8C4A',
        rust:      '#C4673A',
        inkBlue:   '#2A3F5F',
      },
      fontFamily: {
        serif: ['Palatino Linotype', 'Georgia', 'serif'],
        sans:  ['Nunito', 'Lato', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config
```

**Configure path aliases in `vite.config.ts`** (required for shadcn/ui `@/` imports):

```ts
// frontend/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
```

**Configure `tsconfig.app.json`** (path alias for TypeScript):

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

### Step 4 — Install Backend Dependencies

```bash
cd backend

# Core server
npm install express cors dotenv

# Database
npm install mongoose

# Anthropic SDK  ← key dependency
npm install @anthropic-ai/sdk

# Utilities
npm install uuid express-rate-limit helmet morgan

# Dev dependencies
npm install -D nodemon
```

### Step 5 — Environment Variables

```bash
# backend/.env
PORT=3001
MONGO_URI=mongodb://localhost:27017/get-churched
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxx
CLAUDE_MODEL=claude-sonnet-4-5-20251022
CLAUDE_TOP_UP_RATE=0.3
ALLOWED_ORIGIN=http://localhost:5173
```

> ⚠ **Never commit `.env` to version control.** Add it to `.gitignore` immediately.

### Step 6 — Wrap App with Providers (`main.tsx`)

```tsx
// frontend/src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
```

### Step 7 — TanStack Query Usage Pattern

Card fetching and session saving use TanStack Query mutations and queries for automatic caching, loading states, and error handling:

```tsx
// frontend/src/lib/api.ts
import axios from 'axios'
import type { CardMode, CardResponse, Session } from '@/types/game'

const api = axios.create({ baseURL: '/api' })

export const generateCard = async (mode: CardMode): Promise<CardResponse> => {
  const { data } = await api.post('/cards/generate', { mode })
  return data
}

export const saveSession = async (session: Session): Promise<{ sessionId: string }> => {
  const { data } = await api.post('/sessions', session)
  return data
}

export const fetchLeaderboard = async (limit = 10) => {
  const { data } = await api.get(`/leaderboard?limit=${limit}&sort=score`)
  return data
}
```

```tsx
// Usage in a component
import { useMutation } from '@tanstack/react-query'
import { generateCard } from '@/lib/api'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

function DrawCardButton({ mode }: { mode: CardMode }) {
  const { mutate, isPending, data } = useMutation({ mutationFn: generateCard })

  return (
    <Button onClick={() => mutate(mode)} disabled={isPending}>
      {isPending ? <Loader2 className="animate-spin" /> : 'Draw Card'}
    </Button>
  )
}
```

### Step 8 — GameContext (Client State)

```tsx
// frontend/src/context/GameContext.tsx
import { createContext, useContext, useReducer, ReactNode } from 'react'
import type { GameState, GameAction } from '@/types/game'

const initialState: GameState = {
  sessionId: null,
  teams: [],
  rounds: [],
  currentTeamIndex: 0,
  roundsPerTeam: 5,
  status: 'idle',   // 'idle' | 'setup' | 'playing' | 'finished'
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':   return { ...state, ...action.payload, status: 'playing' }
    case 'SCORE_ROUND':  return { ...state, rounds: [...state.rounds, action.payload],
                                  currentTeamIndex: (state.currentTeamIndex + 1) % state.teams.length }
    case 'END_GAME':     return { ...state, status: 'finished' }
    case 'RESET':        return initialState
    default:             return state
  }
}

const GameContext = createContext<{
  state: GameState
  dispatch: React.Dispatch<GameAction>
} | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>
}

export const useGame = () => {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
```

### Step 9 — Backend Entry Point

```js
// backend/server.js
import app from './src/app.js'
import mongoose from 'mongoose'
import 'dotenv/config'

const PORT = process.env.PORT || 3001

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected')
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  })
  .catch(err => { console.error(err); process.exit(1) })
```

### Step 10 — Claude Service Skeleton

```js
// backend/src/services/claudeService.js
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const PROMPTS = {
  trivia: `Generate one Bible trivia question as JSON:
           { q, a, options: [4 strings] }. JSON only, no markdown.`,
  fillinblank: `Generate one fill-in-the-blank Bible verse as JSON:
                { verse, answer, ref }. JSON only.`,
  taboo: `Generate one Bible taboo card as JSON:
          { word, forbidden: [5 strings] }. JSON only.`,
  // Simple string modes:
  sing:    'Give one worship-song keyword (single word). Plain text only.',
  act:     'Give one Bible charades prompt (3-5 words). Plain text only.',
  explain: 'Give one Bible word, place, or concept (1-3 words). Plain text only.',
  hum:     'Give one well-known Christian hymn title. Plain text only.',
  whoami:  'Give one Bible character name. Plain text only.',
  oneword: 'Give one abstract Christian/faith concept. Plain text only.',
  draw:    'Give one Bible scene or object (3-5 words) to draw. Plain text only.',
}

export async function generateCard(mode) {
  const prompt = PROMPTS[mode] || PROMPTS.explain

  const msg = await client.messages.create({
    model: process.env.CLAUDE_MODEL,
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = msg.content[0]?.text?.trim() || ''
  const jsonModes = ['trivia', 'fillinblank', 'taboo']

  if (jsonModes.includes(mode)) {
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  }

  return text
}
```

### Step 11 — npm Scripts

```json
// backend/package.json
"scripts": {
  "start": "node server.js",
  "dev":   "nodemon server.js"
}

// frontend/package.json (added by Vite)
"scripts": {
  "dev":     "vite",
  "build":   "vite build",
  "preview": "vite preview"
}
```

### Step 12 — Run the App

```bash
# Terminal 1 — Start MongoDB (if running locally)
mongod --dbpath /usr/local/var/mongodb

# Terminal 2 — Start Express backend
cd backend && npm run dev

# Terminal 3 — Start React frontend
cd frontend && npm run dev

# Open browser at:
# http://localhost:5173
```

---

## 11. Application Screen Flow

The application has five primary screens managed by React Router v6. All in-game state lives in the `GameContext` provider and is not persisted to the server until game end. Server data (leaderboard, saved sessions) is fetched and cached via TanStack Query.

| Screen | Route | Description |
|---|---|---|
| Home | `/` | Landing page. Options: Start Game, View Leaderboard. |
| Setup | `/setup` | Enter team names, assign colours, set rounds per team. |
| Round | `/round` | Active gameplay screen. Shows current team, mode card, timer, and card content. Accepts score input. |
| Result | `/result` | Brief inter-round result screen. Shows points earned, updated scores. 'Next Team' button advances play. |
| Scoreboard | `/scoreboard` | Final standings, winner announcement, option to save score to leaderboard or start a new game. |

---

## 12. Visual Design Theme

The app should evoke a warm, faith-inspired aesthetic — referencing the texture of aged parchment, illuminated manuscripts, and stained-glass accent colours. Church-themed without being overly formal.

| Token | Hex | Usage |
|---|---|---|
| `parchment` | `#F5ECD7` | Page background — aged document feel |
| `cream` | `#FDF6E3` | Card surface background |
| `mahogany` | `#4A1C0E` | Primary headings, borders |
| `warmBrown` | `#6B3A2A` | Body text, subheadings |
| `gold` | `#C9963A` | Accent, dividers, icons, CTAs |
| `olive` | `#7A8C4A` | Success states, Trivia mode |
| `rust` | `#C4673A` | Act mode, warnings, errors |
| `inkBlue` | `#2A3F5F` | Explain mode, links |

**Recommended fonts:** Palatino Linotype or EB Garamond (headings), Lato or Nunito (body). Load via Google Fonts in `index.html`.

---

## 13. Key Architecture Decisions

**Why proxy Claude API calls through Express?**
The Anthropic API key must never be included in frontend bundles. Any user who inspects network requests or the JavaScript bundle could extract it and run up your bill. The Express backend acts as the secure proxy — it holds the key in `.env`, makes the API call server-side, and returns only the processed card data.

**Why React Context + `useReducer` over a dedicated state library?**
The in-game state (teams, scores, round history) is a single, well-scoped object that flows top-down and changes through clear, enumerated actions. `useReducer` provides predictable state transitions without introducing a third-party dependency. Redux or Zustand would be appropriate additions if state complexity grows significantly in v2.

**Why TanStack Query for server state?**
TanStack Query separates *server state* (leaderboard data, saved sessions, generated cards) from *client state* (the active game). It handles caching, background refetching, loading and error states, and deduplication of concurrent requests automatically — all things that would otherwise require substantial manual wiring with plain `useEffect` + `useState`. Every call to `/api/cards/generate` and `/api/leaderboard` is a natural `useMutation` or `useQuery`.

**Why shadcn/ui over a full component library?**
shadcn/ui ships component *source code* directly into the project rather than as a locked dependency. This means full control over markup, styling, and accessibility without fighting library abstractions. Components are pre-wired for Tailwind and Radix UI primitives, making it ideal for a bespoke church-themed visual design.

**Why lucide-react?**
Lucide provides a comprehensive, consistently-designed icon set as individual tree-shakeable React components. Icons are typed, sized via props, and styled with Tailwind classes — no icon font or sprite overhead.

**Why TypeScript throughout the frontend?**
TypeScript catches mismatched card schemas, missing props, and incorrect API response shapes at compile time rather than at runtime during a game session. The `types/game.ts` file acts as a single source of truth for `CardMode`, `Team`, `Round`, and `Session` shapes shared across components, hooks, and API helpers.

**Why MongoDB over SQL?**
Game session documents are naturally hierarchical (session → rounds → card data). MongoDB stores these as nested documents without joins, which simplifies both the schema and the query logic. The mixed card type (string or object, depending on mode) maps cleanly to a flexible BSON document.

**Why 70/30 built-in vs. AI card split?**
The built-in deck guarantees the game always works offline or when the API is unavailable. The 30% AI draw rate is enough to keep sessions feeling fresh and surprising without generating excessive API costs. This ratio is adjustable via the `CLAUDE_TOP_UP_RATE` environment variable.

---

## 14. Future Features (v2 Roadmap)

- Real-time multiplayer on separate devices using Socket.IO.
- Host login with saved custom card decks.
- Difficulty levels (Easy / Medium / Hard) with separate built-in pools and Claude prompts.
- Audio support — text-to-speech hint reading for accessibility.
- Shareable session recap link (read-only scoreboard via `sessionId`).
- PWA support — install as home-screen app, full offline play.
- Admin panel to review AI-generated cards and flag inappropriate content.

---

> ✟ *May your code be clean and your fellowship blessed.*
>
> **Get Churched — PRD v1.1**
