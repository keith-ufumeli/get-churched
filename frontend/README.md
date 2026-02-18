# Get Churched — Frontend

React + Vite SPA for **Get Churched**: 10 game modes, shared-device play, and UI for setup, rounds, scoring, and leaderboard.

---

## Stack

- **Build:** Vite 7
- **UI:** React 19, TypeScript
- **Styling:** Tailwind CSS v3 (church-themed palette)
- **Components:** shadcn/ui (Radix primitives + Tailwind)
- **Data:** TanStack Query (API), React Context + `useReducer` (game state)
- **Routing:** React Router v6
- **Icons:** lucide-react

### Motion design

**Core animation**

| Package | Role |
|--------|------|
| **framer-motion** | Layout animations, transitions, page transitions, drag |
| **tailwindcss-animate** | Utility animations (used by shadcn) |
| **react-use-measure** | Auto height animations |
| **clsx** + **tailwind-merge** | Clean class handling |

**Optional enhancers**

| Package | Role |
|--------|------|
| **react-hot-toast** | Animated toasts |
| **use-sound** | Subtle game sounds |
| **react-confetti** | Winner celebration |

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Run

Ensure the [backend](../backend/README.md) is running (e.g. on port 3001). Then:

```bash
npm run dev
```

App runs at **http://localhost:5173**. The Vite dev server proxies `/api` to the backend.

---

## Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `vite` | Start dev server with HMR |
| `build` | `tsc -b && vite build` | Type-check and production build |
| `preview` | `vite preview` | Serve production build locally |
| `lint` | `eslint .` | Run ESLint |

---

## Folder structure (target)

```
frontend/
├── src/
│   ├── components/
│   │   ├── cards/        # Per-mode card components (Sing, Trivia, Draw, …)
│   │   ├── game/         # Timer, ScoreBoard, TeamSetup
│   │   └── ui/           # shadcn/ui components
│   ├── context/          # GameContext (teams, scores, rounds)
│   ├── hooks/            # useTimer, useCanvas, useCard
│   ├── lib/              # queryClient, api (Axios), utils
│   ├── pages/            # Home, Setup, Round, Result, Scoreboard
│   ├── router/           # React Router config
│   ├── types/            # game.ts, api.ts
│   ├── data/             # Built-in card deck (JSON)
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── tailwind.config.ts
├── vite.config.ts        # Includes @/ alias and /api proxy
├── tsconfig.json
├── components.json       # shadcn/ui config
└── package.json
```

---

## Key config

- **Path alias:** `@/` → `src/` (for imports like `@/components/ui/button`).
- **API proxy:** In dev, requests to `/api/*` are proxied to the backend (see `vite.config.ts`).
- **Theme:** Tailwind uses a custom palette (parchment, cream, mahogany, gold, etc.) — see PRD or `tailwind.config.ts`.

---

## Adding shadcn/ui components

```bash
npx shadcn@latest add button
npx shadcn@latest add card
# etc.
```

Components are copied into `src/components/ui/` so you can customize them.

---

See the [main README](../README.md) and [PRD](../docs/GetChurcked_PRD.md) for game modes, flows, and architecture.
