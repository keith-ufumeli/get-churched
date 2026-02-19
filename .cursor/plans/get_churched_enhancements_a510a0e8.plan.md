---
name: Get Churched Enhancements
overview: Structured plan to implement mobile-first UX, difficulty selection, single-mode-per-round-set logic, rules display, Sing/Hymn updates, custom words API, session used-cards tracking, Gemini usage monitoring, and a private admin panel—with clear schema changes, new endpoints, and breaking-change notes.
todos: []
isProject: false
---

# Get Churched Enhancements – Implementation Plan

## Current State Summary

- **Backend:** Express in `backend/src`; routes: `cards`, `sessions`, `leaderboard`; models: `Session`, `Leaderboard`; single service: `geminiService.js` (Gemini only; no Claude). Card flow: `POST /api/cards/generate` with `{ mode }`; 70/30 built-in vs Gemini via `GEMINI_TOP_UP_RATE`.
- **Frontend:** React + Vite; game state in `GameContext` (`[frontend/src/context/GameContext.tsx](frontend/src/context/GameContext.tsx)`, `[gameContextState.ts](frontend/src/context/gameContextState.ts)`); routes: `/`, `/setup`, `/round`, `/result`, `/scoreboard`. No dedicated Settings page—only Setup steps: welcome, teams, “Game Settings” (rounds per team). Mode is chosen **per round** on `[RoundPage](frontend/src/pages/RoundPage.tsx)` via `[ModeSelectionScreen](frontend/src/components/game/ModeSelectionScreen.tsx)`; no difficulty, no “round set” concept.
- **Session/game state:** `[GameState](frontend/src/types/game.ts)`: `sessionId`, `teams`, `rounds`, `currentTeamIndex`, `roundsPerTeam`, `status`. No `selectedMode`, `roundsPerMode`, or `usedCards`; no difficulty or country.

---

## 1. Mobile-First Redesign

**Goal:** Strict mobile-first layouts; gameplay screens (Round, Timer, Card, Scoreboard) optimized for small screens; responsive scaling to tablet/desktop; better touch (large tap targets, gesture-safe UI).

**Approach:**

- **Layout:** Refactor `[RoundPage](frontend/src/pages/RoundPage.tsx)`, `[ResultPage](frontend/src/pages/ResultPage.tsx)`, and `[ScoreboardPage](frontend/src/pages/ScoreboardPage.tsx)` to use base styles for mobile (single column, full-width content, scoreboard below or collapsible), then `sm:`/`md:`/`lg:` for larger screens. Keep `grid-cols-1 lg:grid-cols-3` but ensure mobile has no side-by-side squeeze; consider bottom sheet or slide-over for scoreboard on small screens.
- **Components:** In `[Timer](frontend/src/components/game/Timer.tsx)`, `[ScoreBoard](frontend/src/components/game/ScoreBoard.tsx)`, and `[BaseCard](frontend/src/components/cards/BaseCard.tsx)`: increase touch targets (min 44px), spacing, and font sizes on small viewports; avoid hover-only interactions.
- **ModeSelectionScreen:** In `[ModeSelectionScreen.tsx](frontend/src/components/game/ModeSelectionScreen.tsx)`, use a single column or larger cards on mobile; ensure buttons have `min-h-[44px]` and adequate padding.
- **SetupPage:** In `[SetupPage.tsx](frontend/src/pages/SetupPage.tsx)`, keep steps vertical; ensure inputs and CTAs are thumb-friendly.
- **Global:** Add a mobile-first Tailwind preset or document breakpoint usage in `[tailwind.config.js](frontend/tailwind.config.js)`; no new dependencies required. Consider `touch-action` and safe-area insets for notches.

**Files to touch:** All pages above; `Timer.tsx`, `ScoreBoard.tsx`, `BaseCard.tsx`, `ModeSelectionScreen.tsx`, `index.css` if needed for touch/safe-area.

---

## 2. Difficulty Selection

**Goal:** Difficulty selector (Easy / Medium / Hard / Mixed) on Settings; persist in game session; deck filtering and AI prompts respect difficulty; Gemini prompts receive difficulty context.

**Approach:**

- **Settings surface:** Add a “Settings” step or a dedicated Settings step on Setup (e.g. step 4 “Difficulty & options”) with a Difficulty dropdown: Easy, Medium, Hard, Mixed. Store in local state then pass into `START_GAME` payload.
- **Types & state:** In `[frontend/src/types/game.ts](frontend/src/types/game.ts)` add `Difficulty = 'easy' | 'medium' | 'hard' | 'mixed'`. In `GameState` add `difficulty: Difficulty` (default `'medium'`). In `[gameContextState.ts](frontend/src/context/gameContextState.ts)` handle in `START_GAME` and `initialState`.
- **API:** Extend `POST /api/cards/generate` body to accept optional `difficulty` (and later `country`, `usedCardIds`). Frontend `[api.ts](frontend/src/lib/api.ts)` and `[useCard](frontend/src/hooks/useCard.ts)` pass `state.difficulty` (and session `usedCards` when implemented).
- **Backend:** In `[backend/src/routes/cards.js](backend/src/routes/cards.js)` read `difficulty` from body; pass to `geminiService.generateCard(mode, { difficulty })` and to built-in/custom-word filtering. In `[backend/src/services/geminiService.js](backend/src/services/geminiService.js)` add difficulty to each prompt (e.g. “Easy: common terms; Hard: obscure references”) and optionally to `generationConfig` (e.g. temperature).
- **Built-in deck:** In `[backend/src/data/builtinCards.js](backend/src/data/builtinCards.js)` optionally tag entries with difficulty or split arrays by difficulty and filter by requested difficulty; Mixed = random difficulty per card.

**Schema:** Session model can add optional `difficulty: String` for analytics; not required for gameplay if difficulty lives only in client state for the session.

**Files:** `game.ts`, `gameContextState.ts`, `SetupPage.tsx`, `api.ts`, `useCard.ts`, `cards.js`, `geminiService.js`, `builtinCards.js`.

---

## 3. Single-Mode Per Round Set

**Goal:** When a team selects a mode and X rounds (e.g. Trivia, 6), all X rounds use only that mode; no mode switching during those rounds; session/game state reflects `selectedMode` and `roundsPerMode`.

**Approach:**

- **Flow:** Introduce “round sets.” At the start of a set, the current team picks **mode** and **number of rounds** (e.g. 6). Then exactly those 6 rounds are played (each round = one team’s turn, cycling teams), all using that mode. After the set finishes, the next team starts a new set (picks mode + count) until total rounds (e.g. `teams.length * roundsPerTeam`) are reached.
- **State:** In `GameState` add: `selectedMode: CardMode | null`, `roundsPerMode: number` (rounds in current set), `roundsPlayedInSet: number` (0-based count within set). When `roundsPlayedInSet >= roundsPerMode`, treat as “set complete”: next round shows mode selection again and the team then picks new `selectedMode` and `roundsPerMode` (capped by remaining rounds).
- **RoundPage logic:** If we’re at the start of a set (`roundsPlayedInSet === 0` and no `selectedMode`) or after a set just finished, show **mode + rounds** selection (new component or extended ModeSelectionScreen: pick mode, then number of rounds for this set). Once `selectedMode` and `roundsPerMode` are set, show only the card for `selectedMode` (no mode grid). After scoring, increment `roundsPlayedInSet`; if `roundsPlayedInSet >= roundsPerMode`, clear `selectedMode` / reset for next set.
- **Reducer:** New actions or payloads: e.g. `START_ROUND_SET` with `{ selectedMode, roundsPerMode }`; in `SCORE_ROUND` increment `roundsPlayedInSet` and clear set when full. Total round count remains `state.rounds.length`; “Round X of Y” still uses `teams.length * roundsPerTeam`.
- **Session schema:** Add `selectedMode: String`, `roundsPerMode: Number` to session document for persistence (and optionally store per-round-set in `rounds[]` for replay). Frontend session payload in `[ScoreboardPage](frontend/src/pages/ScoreboardPage.tsx)` should send these if saving to backend.

**Breaking change:** Round flow changes from “choose mode every round” to “choose mode + count per set”; UI and reducer change noticeably.

**Files:** `game.ts`, `gameContextState.ts`, `RoundPage.tsx`, `ModeSelectionScreen.tsx` (or new `RoundSetConfig`), `ResultPage.tsx`, `Session.js` (schema), session save in `ScoreboardPage`.

---

## 4. Rules Display Per Mode

**Goal:** When a mode is selected (for a round set), show that mode’s official rules before the first round of the set; structured, readable, dismissible; reusable `ModeRules` component; rules reflect Sing = “word in song” and other updates.

**Approach:**

- **Content:** Add `MODE_RULES: Record<CardMode, string | React.ReactNode>` in `[gameModes.ts](frontend/src/lib/gameModes.ts)` (or a separate `modeRules.ts`), one block per mode. Sing: e.g. “Your team must sing a line from a worship/Christian song that **contains** the word shown (not the song title).” Update other modes as needed (e.g. Hum/Gospel when added).
- **Component:** New `ModeRules.tsx`: receives `mode`, optional `onDismiss`. Renders heading “Rules: [Mode]”, body from `MODE_RULES[mode]`, and a “Got it” / “Start” button that calls `onDismiss`. Use existing Card/Dialog/Sheet from UI library; ensure mobile-friendly and accessible.
- **Integration:** On RoundPage, when entering “playing” phase for a round set, if `roundsPlayedInSet === 0` (first round of set), show `ModeRules` for `selectedMode` first; on dismiss, show the card. Optionally “Don’t show again this game” in context if desired later.

**Files:** `gameModes.ts` or `modeRules.ts`, new `ModeRules.tsx`, `RoundPage.tsx`.

---

## 5. Sing Mode Update

**Goal:** Sing = team must sing a worship/Christian song that **contains** a displayed WORD (not song title). Validation messaging reflects this.

**Approach:**

- **Backend:** In `[geminiService.js](backend/src/services/geminiService.js)`, change `sing` prompt to request a single **word** (e.g. “Grace”, “Love”) that must appear in the lyrics. In `[builtinCards.js](backend/src/data/builtinCards.js)` change `sing` entries from titles to words.
- **Frontend:** In `[MODE_DESCRIPTIONS](frontend/src/lib/gameModes.ts)` and in `MODE_RULES` for Sing, state: “Sing a line from a worship or Christian song that **contains** this word (not the song title).” In `[SingCard.tsx](frontend/src/components/cards/SingCard.tsx)` add a short subline under the word: e.g. “Your song must contain this word.” No change to scoring flow (still Correct/Incorrect via BaseCard).

**Files:** `geminiService.js`, `builtinCards.js`, `gameModes.ts`, `ModeRules` content, `SingCard.tsx`.

---

## 6. Hymn/Gospel Mode Enhancement

**Goal:** Support country selection for hymn generation; prompts reflect culturally common Gospel/Christian songs for that country; optional “Hum a Gospel Song” vs “Hum a Hymn.”

**Approach:**

- **Settings/API:** Add optional “Hymn country” (e.g. dropdown: US, UK, Nigeria, South Africa, Brazil, etc.) in Setup or game settings; store in game state (e.g. `hymnCountry: string`) and pass to card generation. Backend `POST /api/cards/generate` accepts optional `country` (and optionally `hymnVariant: 'hymn' | 'gospel'`).
- **Backend prompts:** In `geminiService.js`, for `hum` (and any gospel variant): include country in prompt, e.g. “Give one well-known Christian hymn or gospel song title commonly sung in [country]. Plain text only.” Optionally add a separate prompt for “Hum a Gospel Song” (e.g. `humGospel`) or a single `hum` prompt that takes variant + country.
- **Built-in deck:** Optionally structure `hum` by country or add a small set per region; filter by `country` when provided.
- **Frontend:** In `[gameModes.ts](frontend/src/lib/gameModes.ts)` optionally add label “Hum a Gospel Song” and a mode or variant; in Setup/Settings add country selector used for hymn/hum modes. Pass `country` and optional variant in `generateCard` from useCard.

**Files:** `geminiService.js`, `builtinCards.js`, `cards.js`, `api.ts`, `useCard.ts`, `game.ts`, `SetupPage.tsx` or settings component, `gameModes.ts`.

---

## 7. Custom Word Endpoint

**Goal:** New endpoint `POST /api/mode-words`; persist custom words in MongoDB; merge with built-in + AI in gameplay; avoid duplicates.

**Approach:**

- **Model:** New Mongoose model `CustomWord` (or `ModeWord`): `mode` (String), `word` (String; for simple modes the prompt/card text), `difficulty` (String, optional), `country` (String, optional), `createdAt` (Date). Optional: `source: 'user' | 'admin'`. Index on `{ mode, word }` for uniqueness.
- **Route:** New route file `backend/src/routes/modeWords.js`: `POST /api/mode-words` body `{ mode, word, difficulty?, country? }`. Validate mode against VALID_MODES; insert into MongoDB; return created document or 409 if duplicate. No auth for now (or protect with admin later).
- **Mount:** In `[app.js](backend/src/app.js)` mount `app.use('/api/mode-words', modeWordsRouter)`.
- **Card flow:** In `cards.js`, when generating a card: (1) optionally fetch random custom words for `mode` (and filter by difficulty/country if provided); (2) merge with built-in deck and AI result. E.g. with probability pick from custom words, else existing 70/30 built-in vs Gemini; or merge custom into a pool and draw from pool. Ensure “used” list (see below) excludes chosen custom words to avoid repetition.
- **Deduplication:** When merging, normalize `word` (trim, lower) and check against existing built-in and AI-suggested content to avoid obvious duplicates; CustomWord unique index prevents duplicate DB entries.

**New files:** `backend/src/models/CustomWord.js`, `backend/src/routes/modeWords.js`. Touched: `app.js`, `cards.js` (and possibly a small service to “get random card” that combines built-in, custom, Gemini).

**Schema:** New collection `customwords` (or `modewords`).

---

## 8. Prevent Repetition Within Session

**Goal:** Session-level used-cards registry; exclude already-used prompts from built-in, custom, and AI; O(1) lookup; fallback when deck exhausted.

**Approach:**

- **Frontend:** Maintain a `usedCards: Set<string>` in game state (or in a ref keyed by session). When sending `generateCard`, include `usedCardIds: string[]` (or `usedPrompts: string[]`) in the request body. Normalize card to a stable key: e.g. for string cards the lowercase trimmed string; for trivia/fillinblank/taboo a JSON string or composite key. Add each used card to the set after a round is scored (in reducer or RoundPage when dispatching SCORE_ROUND).
- **Backend:** In `cards.js`, accept `usedCardIds` or `usedPrompts` in body. When choosing from built-in deck, filter out any card whose key is in the set; when calling Gemini, pass “exclude these words/prompts” in the prompt (or post-filter response); when choosing from custom words, filter by same set. If after filtering no card remains, use “fallback” behavior: either return a random card from full deck (allow repeat) or return a predefined “deck exhausted” card and let frontend retry or show message. Prefer O(1) Set in memory on backend per request (convert incoming array to Set).
- **Performance:** Backend builds a Set from `usedPrompts` once per request; built-in/custom arrays filtered with `.filter(c => !usedSet.has(normalize(c)))`. No DB scan for “used” per request if we don’t persist used per session on server (client sends current session’s used list each time).

**Alternative:** Persist `usedCardIds` in session on server and merge with client-sent list; then session document grows with each round. Simpler approach: client sends used list each time; no schema change.

**Files:** `game.ts` (optional type for used list), `gameContextState.ts` (add used set, update on SCORE_ROUND), `RoundPage` or context (build and pass used list to useCard), `api.ts` (body with usedCardIds/usedPrompts), `useCard.ts`, `cards.js`, `geminiService.js` (optional “exclude” in prompt), `builtinCards.js` (filter helper).

---

## 9. Gemini API Usage Monitoring

**Goal:** Track per-session API usage (calls, tokens, failures); log in backend; soft limit that auto-switches to built-in when near threshold; configurable via .env.

**Approach:**

- **Metrics:** In backend, create a small `usageService` or in-memory store keyed by session (or request correlation id). For each Gemini call: increment call count; on success, read `result.response?.usageMetadata` (see [Gemini usage metadata](https://ai.google.dev/gemini-api/docs/tokens)) for `totalTokenCount` (or prompt + completion tokens) and add to session totals; on failure increment failure count. If SDK does not expose usage, track only call count and optionally estimate tokens.
- **Logging:** Log after each call: sessionId (if available), mode, success/fail, tokens (if available). Optionally persist to MongoDB (e.g. `ApiUsage` collection: sessionId, date, calls, tokens, failures) for admin visibility.
- **Soft limit:** In `cards.js`, before calling Gemini: check current session usage against `GEMINI_SOFT_LIMIT_CALLS` or `GEMINI_SOFT_LIMIT_TOKENS` from .env. If at or over threshold, skip Gemini and use built-in (and optionally custom words) only; log “soft limit reached.”
- **Session id:** Frontend must send `sessionId` (or game session id) in card request so backend can key usage. Add to `POST /api/cards/generate` body and pass through to usage tracking.

**Env:** `GEMINI_SOFT_LIMIT_CALLS`, `GEMINI_SOFT_LIMIT_TOKENS` (optional). Existing: `GEMINI_API_KEY`, `GEMINI_MODEL`, `GEMINI_TOP_UP_RATE`.

**Files:** `geminiService.js` (return usage from SDK if available), new `backend/src/services/usageService.js` or middleware, `cards.js`, `.env.example` / README.

---

## 10. Private Admin Panel (Owner Only)

**Goal:** Hidden admin route (e.g. `/admin-portal-<secure-hash>`); not in main nav; protected by env secret and/or Basic Auth; capabilities: manage words per mode, view AI usage, toggle AI top-up rate, enable/disable modes, view session history; admin routes excluded from public navigation.

**Approach:**

- **Route:** In frontend `[App.tsx](frontend/src/App.tsx)` add a route that matches a path like `/admin-portal-:hash` or a single path built from env (e.g. `VITE_ADMIN_PATH` = `admin-portal-<hash>`). No link to this path in Header/Footer/Home/Setup; only access via direct URL or bookmark.
- **Backend:** New base path for admin API, e.g. `/api/admin/`*. Middleware: validate secret token from header (e.g. `X-Admin-Token: <env.ADMIN_SECRET>`) or Basic Auth (username/password from env). If invalid, 401. Mount admin routes after this middleware.
- **Admin API:** New router `backend/src/routes/admin.js`: 
  - Words: `GET /api/admin/words?mode=` (list custom words), `POST/DELETE` for manage (or reuse `POST /api/mode-words` with admin auth).
  - Usage: `GET /api/admin/usage` (aggregate or per-session metrics from usage service/DB).
  - Config: `GET/PATCH /api/admin/config` for toggles (e.g. AI top-up rate, enable/disable modes). Config can live in env + in-memory or in a small `Config` collection.
  - Sessions: `GET /api/admin/sessions` (list recent sessions from Session model).
- **Frontend admin page:** Single page or tabs: “Words” (per-mode table, add/remove), “AI Usage” (metrics), “Config” (top-up rate slider, mode toggles), “Sessions” (table). Calls admin API with token in header (e.g. from env `VITE_ADMIN_TOKEN` or prompt on first load and store in sessionStorage). Do not expose token in public bundle if possible (e.g. inject at build time only for admin build, or use sessionStorage after one-time entry).
- **Mode enable/disable:** Backend maintains list of enabled modes (from DB or env); card generation and frontend mode list filter by this. Frontend can fetch “enabled modes” from public config or admin; if only admin can change it, a non-admin endpoint can still read enabled list.

**Security:** Admin secret in `.env` only; never in frontend. Frontend admin token can be a separate shared secret for browser (e.g. `VITE_ADMIN_TOKEN`) used only on admin route; or use Basic Auth in browser. Ensure admin routes are not linked from anywhere in the app.

**New files:** `backend/src/routes/admin.js`, `backend/src/middleware/adminAuth.js`, frontend `AdminPortalPage.tsx` (or similar), admin API client helpers. Touched: `app.js`, `App.tsx`.

---

## Architecture Summary

- **Separation:** Routes → controllers/handlers → services (Gemini, usage, custom words); models for Session, Leaderboard, CustomWord, optionally ApiUsage, Config.
- **API keys:** Remain server-side only (Gemini, admin secret).
- **Offline / fallback:** 70/30 built-in vs Gemini preserved; soft limit and “deck exhausted” fallback keep play possible without AI.
- **Modularity:** Difficulty, country, usedCards, and custom words are optional parameters through the card pipeline; tests can mock services.

---

## Schema Changes Summary


| Location                | Change                                                                                 |
| ----------------------- | -------------------------------------------------------------------------------------- |
| **Session**             | Add `selectedMode` (String), `roundsPerMode` (Number), optional `difficulty` (String). |
| **CustomWord** (new)    | `mode`, `word`, `difficulty?`, `country?`, `createdAt`; unique index (mode, word).     |
| **ApiUsage** (optional) | `sessionId`, `date`, `calls`, `tokens`, `failures` for admin metrics.                  |
| **Config** (optional)   | Key-value for `topUpRate`, `enabledModes` (JSON array) if stored in DB.                |


---

## New Endpoints Summary


| Method      | Path                          | Purpose                                              |
| ----------- | ----------------------------- | ---------------------------------------------------- |
| POST        | `/api/mode-words`             | Add custom word (mode, word, difficulty?, country?). |
| GET         | `/api/admin/words`            | List custom words (admin; optional query `mode`).    |
| POST/DELETE | `/api/admin/words` or similar | Manage custom words (admin).                         |
| GET         | `/api/admin/usage`            | AI usage metrics (admin).                            |
| GET/PATCH   | `/api/admin/config`           | Read/update top-up rate, enabled modes (admin).      |
| GET         | `/api/admin/sessions`         | List session history (admin).                        |


**Modified:** `POST /api/cards/generate` — body may include `difficulty`, `country`, `usedCardIds`/`usedPrompts`, `sessionId` (for usage tracking).

---

## Breaking Changes

1. **Round flow:** Mode selection becomes “per round set” (mode + rounds count); existing clients that assume one mode per round will need to adopt new state and UI.
2. **Session document:** New fields `selectedMode`, `roundsPerMode` (and optional `difficulty`); old sessions without these remain valid if backend treats them as optional.
3. **Card generate payload:** Frontend must send additional optional fields (`difficulty`, `country`, `usedCardIds`, `sessionId`); backend should remain backward compatible when they are missing.
4. **Sing mode:** Card content changes from “song title” to “word”; existing built-in sing entries and any saved rounds with titles are legacy.

---

## Suggested Implementation Order

1. Schema + backend: Session fields, CustomWord model, `POST /api/mode-words`, then card pipeline (difficulty, country, custom words, usedCards).
2. Gemini: usage tracking + soft limit in backend; prompt updates (difficulty, Sing word, Hum country).
3. Frontend state: difficulty, round-set state (selectedMode, roundsPerMode, roundsPlayedInSet), usedCards set.
4. Setup/UI: difficulty selector, round-set selector (mode + count), then RoundPage flow and ModeRules.
5. Mobile-first pass: layouts and touch targets.
6. Admin: middleware, admin routes, admin frontend page and config.

This order keeps backend contract and data model stable before wiring UI and avoids rework when adding admin and monitoring.