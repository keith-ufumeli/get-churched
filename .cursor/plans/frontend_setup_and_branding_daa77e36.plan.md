---
name: Frontend setup and branding
overview: "Set up the Get Churched frontend: branding (favicon, logo), HTML title and fonts, install router/query/axios, add API proxy, wire providers and routing, add types and API layer, GameContext, and five screen placeholders with a branded Home page using the provided logo."
todos: []
isProject: false
---

# Frontend Setup and Branding

## Current state

- **Stack already in place:** Vite, React 19, TypeScript, Tailwind with church theme colors (parchment, cream, mahogany, gold, etc. in [frontend/tailwind.config.js](frontend/tailwind.config.js)), shadcn/ui components (button, card, dialog, etc.), framer-motion, react-hot-toast, react-confetti, use-sound, react-use-measure, clsx, tailwind-merge.
- **Missing for app flow:** react-router-dom, @tanstack/react-query, axios. No router, no GameContext, no API layer, no pages. [frontend/src/main.tsx](frontend/src/main.tsx) has no providers; [frontend/src/App.tsx](frontend/src/App.tsx) is the default Vite counter demo.
- **Public assets:** User provides logo at [frontend/public/logos/get-churched-logo.png](frontend/public/logos/get-churched-logo.png) and favicon at [frontend/public/favicon.ico](frontend/public/favicon.ico). Currently [frontend/public](frontend/public) has only `vite.svg` and `site.webmanifest`; ensure `public/logos` exists and the logo/favicon are in place (copy from provided paths if needed).
- **Vite:** [frontend/vite.config.ts](frontend/vite.config.ts) has `@/` alias but no `/api` proxy; add proxy to `http://localhost:3001` for backend.

---

## 1. Branding and HTML

- **[frontend/index.html](frontend/index.html)**  
  - Set `<title>` to `Get Churched`.  
  - Set favicon to `/favicon.ico`: `<link rel="icon" type="image/x-icon" href="/favicon.ico" />`.  
  - Optionally add Google Fonts (e.g. Nunito, EB Garamond) per PRD §12 for headings/body.
- **Public assets**  
  - Ensure [frontend/public/favicon.ico](frontend/public/favicon.ico) exists (user provided path).  
  - Ensure [frontend/public/logos/get-churched-logo.png](frontend/public/logos/get-churched-logo.png) exists; create `public/logos` if needed and copy the logo from the user-provided asset path if it is not already there.

---

## 2. Dependencies

Install and use in code:

- **react-router-dom** — routing (Home, Setup, Round, Result, Scoreboard).
- **@tanstack/react-query** — server state (cards, sessions, leaderboard).
- **axios** — HTTP client for API layer (used inside React Query).

---

## 3. Vite API proxy

In [frontend/vite.config.ts](frontend/vite.config.ts), add:

```ts
server: {
  proxy: {
    '/api': { target: 'http://localhost:3001', changeOrigin: true },
  },
},
```

so `fetch('/api/...')` in dev hits the running backend.

---

## 4. Types and API layer

- **[frontend/src/types/game.ts](frontend/src/types/game.ts)**  
  - `CardMode`: union of the 10 modes (`'sing' | 'act' | 'explain' | 'trivia' | 'hum' | 'whoami' | 'fillinblank' | 'taboo' | 'oneword' | 'draw'`).  
  - `Team`: `{ name, color?, score? }`.  
  - `Round`: `{ teamName, mode, card, pointsEarned?, timestamp? }`.  
  - `Session`: `{ sessionId, playedAt?, teams, rounds, winner?, totalRounds? }`.  
  - `GameState`: `{ sessionId, teams, rounds, currentTeamIndex, roundsPerTeam, status }` with `status`: `'idle' | 'setup' | 'playing' | 'finished'`.  
  - `GameAction`: discriminated union for `START_GAME`, `SCORE_ROUND`, `END_GAME`, `RESET`.  
  - `CardResponse`: type for card API (string or object for trivia/fillinblank/taboo).
- **[frontend/src/lib/api.ts](frontend/src/lib/api.ts)**  
  - `axios.create({ baseURL: '/api' })`.  
  - `generateCard(mode: CardMode)`, `saveSession(session: Session)`, `fetchLeaderboard(limit?)`, `getSession(id)`.

---

## 5. Game context

- **[frontend/src/context/GameContext.tsx](frontend/src/context/GameContext.tsx)**  
  - `initialState` matching `GameState` (idle, empty teams/rounds).  
  - `gameReducer` handling `START_GAME`, `SCORE_ROUND`, `END_GAME`, `RESET` per PRD §10 Step 8.  
  - `GameProvider` and `useGame()` hook.

---

## 6. App wiring and routing

- **[frontend/src/main.tsx](frontend/src/main.tsx)**  
  - Wrap app with `BrowserRouter`, `QueryClientProvider` (staleTime 5 min, retry 1), and `GameProvider`.  
  - Render `App` and keep `import './index.css'`.
- **[frontend/src/App.tsx](frontend/src/App.tsx)**  
  - Remove Vite demo.  
  - Use `Routes` / `Route` from react-router-dom: `/` (Home), `/setup`, `/round`, `/result`, `/scoreboard`.  
  - Optional: simple layout (e.g. header with logo) and `Outlet`, or full-page routes only.  
  - Use logo at `**/logos/get-churched-logo.png`** on the Home page (and optionally in a shared header).

---

## 7. Pages

- **[frontend/src/pages/HomePage.tsx](frontend/src/pages/HomePage.tsx)**  
  - Show Get Churched logo (`<img src="/logos/get-churched-logo.png" alt="Get Churched" />`), styled for the church theme (e.g. parchment background, centered).  
  - Two actions: “Start Game” → `navigate('/setup')`, “View Leaderboard” → `navigate('/scoreboard')`. Use shadcn `Button` and Tailwind (parchment, mahogany, gold).
- **[frontend/src/pages/SetupPage.tsx](frontend/src/pages/SetupPage.tsx)**  
  - Placeholder: title “Setup” and link back to home (or minimal “Coming soon” message).
- **[frontend/src/pages/RoundPage.tsx](frontend/src/pages/RoundPage.tsx)**  
  - Placeholder: “Round” and link back.
- **[frontend/src/pages/ResultPage.tsx](frontend/src/pages/ResultPage.tsx)**  
  - Placeholder: “Result” and link back.
- **[frontend/src/pages/ScoreboardPage.tsx](frontend/src/pages/ScoreboardPage.tsx)**  
  - Placeholder: “Leaderboard” and link back home (later: list from `fetchLeaderboard`).

Use a consistent layout (e.g. max-width container, parchment background from Tailwind) and `cn()` from [frontend/src/lib/utils.ts](frontend/src/lib/utils.ts) where useful.

---

## 8. Order of work

1. **Branding:** Update index.html (title, favicon link). Ensure `public/logos` exists and `public/logos/get-churched-logo.png` and `public/favicon.ico` are present (copy from user paths if needed).
2. **Dependencies:** Install react-router-dom, @tanstack/react-query, axios.
3. **Vite:** Add `/api` proxy in vite.config.ts.
4. **Types and API:** Add `types/game.ts` and `lib/api.ts`.
5. **Context:** Add `context/GameContext.tsx`.
6. **Providers and routing:** Update main.tsx (Router, QueryClient, GameProvider) and App.tsx (Routes, Route for all five paths).
7. **Pages:** Add HomePage (with logo and Start Game / View Leaderboard), then Setup, Round, Result, Scoreboard placeholders.

After this, `npm run dev` in the frontend with the backend running will show the branded Home page with logo and navigation to Setup and Scoreboard; other screens are placeholders for later implementation.