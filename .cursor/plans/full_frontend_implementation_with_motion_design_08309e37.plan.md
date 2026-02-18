---
name: Full frontend implementation with motion design
overview: Implement all core pages (Setup, Round, Result, Scoreboard) with full functionality, motion design (framer-motion transitions, animations), seamless onboarding flow, 10 game mode card components, hooks (useTimer, useCanvas), game components (Timer, ScoreBoard), and complete integration with backend API and Gemini card generation.
todos: []
isProject: false
---

# Full Frontend Implementation with Motion Design

## Current State

- **Infrastructure:** React Router, TanStack Query, GameContext, API layer, types all in place. HomePage has logo and navigation.
- **Pages:** SetupPage, RoundPage, ResultPage, ScoreboardPage are placeholders.
- **Components:** shadcn/ui primitives (Button, Card, Input, Dialog, Badge, Toast) available. No game-specific components yet.
- **Motion:** framer-motion, react-hot-toast, react-confetti, use-sound, react-use-measure installed but not used.
- **Missing:** All game logic, card components (10 modes), timer, canvas for Draw mode, scoreboard UI, onboarding flow, animations.

---

## 1. Hooks and Utilities

### [frontend/src/hooks/useTimer.ts](frontend/src/hooks/useTimer.ts)

- Custom hook for countdown timers (60s, 90s, 30s per mode).
- Returns `{ timeLeft, isRunning, start, pause, reset }`.
- Uses `useEffect` with `setInterval`; cleanup on unmount.
- Optional: emit sound alerts at 10s, 5s, 0s (use-sound).

### [frontend/src/hooks/useCanvas.ts](frontend/src/hooks/useCanvas.ts)

- Canvas hook for Draw mode (Pictionary).
- Returns `{ canvasRef, clearCanvas, getImageData }`.
- Handles mouse/touch drawing with `useRef<HTMLCanvasElement>`.
- Stroke color: mahogany or warmBrown; stroke width: 4-8px.

### [frontend/src/hooks/useCard.ts](frontend/src/hooks/useCard.ts)

- Wrapper around TanStack Query `useMutation` for `generateCard(mode)`.
- Returns `{ mutate, isPending, card, error }`.
- Handles loading states and errors (fallback to built-in deck).

---

## 2. Game Components

### [frontend/src/components/game/Timer.tsx](frontend/src/components/game/Timer.tsx)

- Circular or linear progress timer using framer-motion.
- Props: `duration` (seconds), `onComplete` callback, `color` (mode-specific).
- Animated countdown with smooth transitions.
- Visual: progress ring/circle that fills down, or linear progress bar.

### [frontend/src/components/game/ScoreBoard.tsx](frontend/src/components/game/ScoreBoard.tsx)

- Live scoreboard showing all teams, scores, current team highlight.
- Props: `teams: Team[]`, `currentTeamIndex: number`.
- Animated score updates (framer-motion `AnimatePresence`).
- Layout: horizontal cards or vertical list; highlight current team with gold border.

### [frontend/src/components/game/TeamSetup.tsx](frontend/src/components/game/TeamSetup.tsx)

- Form for adding teams (name, optional color picker).
- Props: `onAddTeam`, `onStartGame`, `teams: Team[]`.
- Animated list with drag-to-reorder (framer-motion drag) or simple add/remove.
- Color palette: use church theme colors (gold, olive, rust, inkBlue, etc.).

---

## 3. Card Components (10 Modes)

Each card component in [frontend/src/components/cards/](frontend/src/components/cards/) receives:

- `card: CardResponse` (string or object per mode)
- `mode: CardMode`
- `onScore: (points: number) => void`
- `timerDuration: number`

### Mode-specific components:

**Simple text modes** (sing, act, explain, hum, whoami, oneword, draw):

- Display card text prominently.
- Mode badge with color (Yellow, Red, Blue, Purple, Peach, Navy, Amber per PRD).
- Timer integration.
- Score buttons (2pts correct, 0pts incorrect).

**TriviaCard.tsx:**

- Display `card.q` (question).
- Four option buttons (`card.options`).
- Highlight correct answer on reveal (`card.a`).
- Animated reveal with framer-motion.

**FillInBlankCard.tsx:**

- Display `card.verse` with blank (`_____`).
- Input field for answer.
- Check button; reveal `card.answer` and `card.ref`.
- Animated reveal.

**TabooCard.tsx:**

- Display `card.word` prominently.
- List `card.forbidden` words (smaller, muted).
- Timer and score buttons.

**DrawCard.tsx:**

- Canvas component (use `useCanvas` hook).
- Clear button.
- Display prompt text above canvas.
- Timer (90s) and score buttons.

All cards:

- Use church theme colors (mode-specific backgrounds: cream card surface, mode color accents).
- Smooth entrance animations (`motion.div` with `initial`, `animate`, `exit`).
- Interactive feedback (hover states, button animations).

---

## 4. Pages Implementation

### [frontend/src/pages/SetupPage.tsx](frontend/src/pages/SetupPage.tsx)

**Onboarding flow:**

1. Welcome step: "Welcome to Get Churched" with brief instructions (animated entrance).
2. Team setup: Use `TeamSetup` component.
  - Add teams (min 2, max unlimited).
  - Optional color assignment.
  - Animated team list with add/remove.
3. Rounds configuration: Input for "Rounds per team" (default 5).
4. Start game button: Validates (≥2 teams), dispatches `START_GAME`, navigates to `/round`.

**Motion:**

- Page transition (framer-motion `AnimatePresence`).
- Step transitions (slide/fade).
- Team card animations (stagger children).
- Button hover/press feedback.

**Integration:**

- Uses `useGame()` to dispatch `START_GAME` with teams, roundsPerTeam, generates `sessionId` (UUID v4).

---

### [frontend/src/pages/RoundPage.tsx](frontend/src/pages/RoundPage.tsx)

**Flow:**

1. Select random mode (from 10 modes).
2. Fetch card via `useCard` hook (TanStack Query mutation).
3. Display mode-specific card component.
4. Show Timer component (duration per mode: 60s, 90s, 30s).
5. Show ScoreBoard component (all teams, highlight current).
6. Score buttons: "Correct (2pts)" / "Incorrect (0pts)" or mode-specific UI.
7. On score: dispatch `SCORE_ROUND`, navigate to `/result`.

**Motion:**

- Card flip/reveal animation (framer-motion `layout` or custom flip).
- Timer countdown animation.
- Mode badge entrance (scale + fade).
- Score button press animations.
- Page transition from Setup.

**Integration:**

- `useCard(mode)` fetches from `/api/cards/generate`.
- `useGame()` for state and dispatch.
- Handles loading states (skeleton/spinner while fetching card).
- Error handling: fallback message, retry button.

---

### [frontend/src/pages/ResultPage.tsx](frontend/src/pages/ResultPage.tsx)

**Flow:**

1. Display last round result: mode, card, points earned.
2. Show updated ScoreBoard (animated score change).
3. Check if game complete: if `rounds.length >= teams.length * roundsPerTeam`, dispatch `END_GAME`, navigate to `/scoreboard`.
4. Otherwise: "Next Team" button → navigate to `/round` (next team's turn).

**Motion:**

- Score update animation (number count-up with framer-motion).
- Confetti on perfect round (react-confetti, optional).
- Success/celebration sound (use-sound, optional).
- Page transition (slide).

**Integration:**

- Reads from `useGame().state.rounds[rounds.length - 1]` for last round.
- Checks `state.status === 'finished'` to determine navigation.

---

### [frontend/src/pages/ScoreboardPage.tsx](frontend/src/pages/ScoreboardPage.tsx)

**Flow:**

1. Display final standings: all teams sorted by score.
2. Winner announcement (largest, animated).
3. "Save to Leaderboard" button → opens dialog.
4. Dialog: input `displayName`, optional `teamName`, submit → `saveSession` + `POST /api/leaderboard`.
5. "View Leaderboard" section: fetch and display top entries from `/api/leaderboard`.
6. "New Game" button → dispatch `RESET`, navigate to `/setup`.

**Motion:**

- Winner reveal animation (scale + confetti).
- Leaderboard list animations (stagger).
- Dialog entrance (shadcn Dialog already animated).
- Page transition.

**Integration:**

- `saveSession` via TanStack Query mutation.
- `fetchLeaderboard` via TanStack Query query.
- `useGame()` to reset state.

---

### [frontend/src/pages/HomePage.tsx](frontend/src/pages/HomePage.tsx)

**Enhancements:**

- Logo entrance animation (fade + scale).
- Button hover animations.
- Optional: brief intro animation sequence.

---

## 5. Shared Layout and Navigation

### [frontend/src/components/layout/PageLayout.tsx](frontend/src/components/layout/PageLayout.tsx)

- Optional wrapper for consistent page structure.
- Parchment background, max-width container.
- Optional header with logo (on Setup/Round/Result/Scoreboard).

---

## 6. Motion Design Specifications

**Page transitions:**

- Use framer-motion `AnimatePresence` in App.tsx or per route.
- Transition: `{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 } }`.
- Duration: 300-400ms.

**Card animations:**

- Entrance: scale (0.95 → 1) + fade.
- Mode badge: rotate + scale on mount.
- Timer: smooth progress animation (spring physics).

**Interactive feedback:**

- Button hover: scale(1.05), shadow increase.
- Button press: scale(0.98).
- Score update: number count-up animation.
- Toast notifications: react-hot-toast for success/errors.

**Sound effects (optional):**

- Timer alerts (10s, 5s, 0s): subtle beep.
- Score correct: success chime.
- Winner: celebration sound.
- Use `use-sound` hook.

---

## 7. Mode Colors and Theming

Per PRD §5, map each mode to its color:

- Sing: Yellow (`#FFD700` or gold variant)
- Act: Red (`#DC2626` or rust variant)
- Explain: Blue (`#2563EB` or inkBlue variant)
- Trivia: Green (`#16A34A` or olive variant)
- Hum: Purple (`#9333EA`)
- Who Am I: Peach (`#FB923C`)
- Fill in Blank: Teal (`#14B8A6`)
- Taboo: Crimson (`#DC2626` or rust)
- One Word: Navy (`#1E3A8A` or inkBlue)
- Draw: Amber (`#F59E0B`)

Use these for mode badges, card borders, timer colors.

---

## 8. Implementation Order

1. **Hooks:** useTimer, useCanvas, useCard.
2. **Game components:** Timer, ScoreBoard, TeamSetup.
3. **Card components:** Start with simple modes (sing, act, explain), then Trivia, FillInBlank, Taboo, Draw.
4. **Pages:**
  - SetupPage (with onboarding steps).
  - RoundPage (card display, timer, scoring).
  - ResultPage (score updates, next team logic).
  - ScoreboardPage (final standings, leaderboard).
5. **Enhancements:** Add motion animations, sounds, confetti.
6. **Polish:** Consistent theming, error handling, loading states.

---

## 9. Key Implementation Details

**UUID generation:**

- Install `uuid` or use `crypto.randomUUID()` for `sessionId` in SetupPage.

**Timer logic:**

- Per mode durations: 60s (sing, act, explain, hum, taboo), 90s (whoami, draw), 30s (oneword).
- Trivia/FillInBlank: no timer (instant answer).

**Score tracking:**

- Each round: `{ teamName, mode, card, pointsEarned, timestamp }`.
- Update team scores in GameContext reducer.

**Game end detection:**

- Check in ResultPage: `rounds.length >= teams.length * roundsPerTeam`.
- Dispatch `END_GAME`, navigate to ScoreboardPage.

**Error handling:**

- Card fetch errors: show toast, fallback to built-in deck (backend handles this).
- Network errors: retry button, offline message.

**Accessibility:**

- ARIA labels on buttons, cards.
- Keyboard navigation support.
- Screen reader announcements for score updates.

After implementation, the app will have full gameplay flow with motion design, onboarding, and backend integration.