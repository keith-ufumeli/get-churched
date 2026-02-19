---
name: Auth.js GitHub Admin Setup
overview: "Complete Auth.js (GitHub) authentication for the admin panel on the Express backend and Vite frontend: integrate the auth route, add session-based admin protection with getSession, restrict sign-in to a single GitHub account via username or ID, add jwt package, and configure callback URLs and CORS for credentials."
todos: []
isProject: false
---

# Auth.js GitHub admin authentication – complete setup

## Current state

- **[backend/src/routes/auth.route.js](backend/src/routes/auth.route.js)** – ESM snippet using `ExpressAuth` and GitHub provider; not mounted on the main app. Main app is CommonJS ([backend/src/app.js](backend/src/app.js)), so the auth route is never used.
- **Admin protection** – [backend/src/middleware/adminAuth.js](backend/src/middleware/adminAuth.js) checks `X-Admin-Token` against `ADMIN_SECRET`.
- **Frontend admin** – [frontend/src/pages/AdminPortalPage.tsx](frontend/src/pages/AdminPortalPage.tsx) uses token input / `VITE_ADMIN_TOKEN`; [frontend/src/lib/adminApi.ts](frontend/src/lib/adminApi.ts) sends `X-Admin-Token`. No `/auth` proxy in [frontend/vite.config.ts](frontend/vite.config.ts).
- **Env** – Backend has `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `JWT_SECRET`; `CALLBACK_URL` is a placeholder. Frontend has `VITE_API_URL`, `VITE_ADMIN_PATH`.

## 1. Backend: ESM and Auth integration

**Why ESM:** `@auth/express` is ESM-only. The rest of the backend uses CommonJS. To integrate Auth.js cleanly we have two options:

- **Option A (recommended):** Convert the backend to ESM (`"type": "module"` in [backend/package.json](backend/package.json)), change all `require`/`module.exports` to `import`/`export` in [backend/server.js](backend/server.js), [backend/src/app.js](backend/src/app.js), all routes and middleware under `backend/src`, and use `.js` (or `.mjs`) with explicit extensions where needed for ESM resolution.
- **Option B:** Keep CJS and load Auth in a separate ESM worker or use dynamic `import()` of an ESM auth router from the CJS app (more brittle and harder to maintain).

**Plan assumes Option A.** Files to convert: `server.js`, `app.js`, `rateLimiter.js`, `errorHandler.js`, `adminAuth.js` (replaced by session middleware), `cards.js`, `modeWords.js`, `sessions.js`, `leaderboard.js`, `admin.js`, and any other `backend/src` files that use `require`/`module.exports`.

**Mount Auth on the main app:**

- In `app.js`: `app.set('trust proxy', 1)` (for correct protocol in redirects behind a proxy).
- Create a single Auth config module (e.g. [backend/src/auth.config.js](backend/src/auth.config.js)) that:
  - Imports `ExpressAuth`, `getSession`, and GitHub provider from `@auth/express`.
  - Exports the same config object used by both `ExpressAuth` and `getSession` (so session middleware and Auth handler share config).
  - Configures GitHub with `clientId: process.env.AUTH_GITHUB_ID`, `clientSecret: process.env.AUTH_GITHUB_SECRET`.
  - Uses **signIn** callback to restrict to one GitHub account:
    - Read `ALLOWED_GITHUB_USERNAME` and/or `ALLOWED_GITHUB_ID` from env.
    - In `signIn({ user, profile })`: allow only if `profile?.login === ALLOWED_GITHUB_USERNAME` (if set) or `profile?.id === ALLOWED_GITHUB_ID` or `user?.id` matches (if set). If neither env is set, treat as “no allowlist” and either allow all (dev) or deny all (recommend: deny unless at least one is set).
  - Optionally sets `pages: { signIn: "/auth/signin" }` and trust host for production.
- Mount Auth handler: `app.use("/auth", ExpressAuth(authConfig))` (handles `/auth/`* including `/auth/signin`, `/auth/signout`, `/auth/callback/github`).
- After OAuth callback, redirect to the **frontend** admin page: use Auth.js redirect/callbackUrl so after sign-in the user lands on `VITE_API_URL`-based redirect. Because the backend does not serve the SPA, set a post-sign-in redirect to the frontend origin + admin path (e.g. `http://localhost:5173/admin-portal` in dev). This can be done via Auth.js `redirect` or by configuring the default callback URL / redirect in the Auth config (e.g. `redirectProxyUrl` or equivalent, or by having the frontend pass `callbackUrl` when linking to `/auth/signin`).

**Session-based admin middleware:**

- New middleware (e.g. [backend/src/middleware/adminSessionAuth.js](backend/src/middleware/adminSessionAuth.js)): call `getSession(req, authConfig)`. If no session or no `session.user`, respond with `401` and `{ error: "Unauthorized" }`. Otherwise attach session to `req` or `res.locals` and call `next()`. Use this middleware instead of the current `adminAuth` for `/api/admin` so only Auth.js-authenticated users can access admin API.
- Remove or keep the old `adminAuth.js`; admin routes should no longer check `X-Admin-Token` for browser-based admin (cookie session only). If you later add a programmatic admin API, you could support both session and a separate token.

**JWT package:**

- Add `jsonwebtoken` (or `jwt` – the user asked for “jwt package”; `jsonwebtoken` is the common choice): `npm install jsonwebtoken` in backend.
- Use for one or both of: (1) optional API token issuance (e.g. issue a JWT in a protected route after GitHub sign-in and return it for `Authorization: Bearer <token>` if you want non-browser clients), (2) future use (e.g. short-lived tokens). The initial flow can remain cookie-only; the plan will add the package and a brief note in code or README on how you might issue a JWT from an admin endpoint if needed.

**Env (backend):**

- Keep: `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`.
- Add: `ALLOWED_GITHUB_USERNAME` (your GitHub username) and/or `ALLOWED_GITHUB_ID` (your GitHub numeric user ID). At least one must be set to allow anyone; if both set, either match allows sign-in.
- Remove or replace placeholder `CALLBACK_URL` with a comment that the callback is always `[origin]/auth/callback/github` (see below).
- Ensure `AUTH_TRUST_HOST=true` in production so Auth.js accepts the host header.

**GitHub OAuth app – callback URL:**

- Auth.js expects the provider callback at `[origin]/auth/callback/[provider]`. So:
  - **Development:** `http://localhost:3001/auth/callback/github` (backend origin; frontend proxies or redirects to backend for auth).
  - **Production:** `https://<your-backend-domain>/auth/callback/github` (e.g. `https://api.getchurched.com/auth/callback/github`). Use the same origin as the backend (no trailing slash).
- In GitHub: **Settings → Developer settings → OAuth Apps → your app → Authorization callback URL**: set exactly the value above for each environment. You can register two OAuth apps (one dev, one prod) or use one app with multiple callback URLs if GitHub allows it (they allow one callback URL per app; for two environments use two apps or one URL that works in both).

## 2. CORS and credentials

- Admin API calls from the frontend (different origin) must send the Auth.js session cookie. So:
  - In [backend/src/app.js](backend/src/app.js): set CORS to allow the frontend origin with credentials, e.g. `cors({ origin: allowedOrigin, credentials: true })`.
  - Keep `ALLOWED_ORIGIN` (or a list) so only your frontend can send credentials.

## 3. Frontend: sign-in flow and admin API

- **Admin gate:** Replace the current “admin token” form with a “Sign in with GitHub” flow:
  - If not authenticated: show a button/link that sends the user to the **backend** sign-in URL, e.g. `{VITE_API_URL}/auth/signin?callbackUrl={encodeURIComponent(window.location.origin + '/' + ADMIN_PATH)}` so after GitHub OAuth and callback the user is redirected back to the admin page on the frontend.
- **Session check:** Before showing the admin UI, call a small backend endpoint (e.g. `GET /api/admin/session` or reuse an existing admin endpoint) with `credentials: 'include'`. If it returns 401, show “Sign in with GitHub” and do not show the token form. If 200, show the admin portal.
- **Admin API client:** In [frontend/src/lib/adminApi.ts](frontend/src/lib/adminApi.ts): use `axios.create({ baseURL: VITE_API_URL or relative /api, withCredentials: true })` so every request sends the session cookie. Remove `X-Admin-Token` and any use of `VITE_ADMIN_TOKEN` / sessionStorage for the token. Keep a minimal “session” check (e.g. call `/api/admin/session` or first admin endpoint) to decide whether to show the sign-in page.
- **Proxy:** In [frontend/vite.config.ts](frontend/vite.config.ts), add a proxy for `/auth` to the backend (e.g. `target: 'http://localhost:3001'`) so in dev the frontend can link to `/auth/signin` and the request goes to the backend. Alternatively the frontend can link directly to `VITE_API_URL + '/auth/signin'`; then no proxy for `/auth` is strictly required, but proxying keeps the same origin in dev and avoids CORS for the auth redirects.
- **Env (frontend):** Keep `VITE_ADMIN_PATH`. Use `VITE_API_URL` (or equivalent) for building the backend auth URL when not using a proxy for `/auth`.

## 4. Post-sign-in redirect (backend)

- After successful GitHub callback, Auth.js will redirect. Configure the default redirect (or the one used when no `callbackUrl` is provided) to the frontend admin URL so the user lands on the SPA admin page. This may require passing `callbackUrl` from the frontend when opening `/auth/signin` (as above); then Auth.js will redirect there after sign-in.

## 5. Files to add or change (summary)


| Area                                       | Action                                                                                                                                                               |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| backend/package.json                       | Add `"type": "module"`; add `jsonwebtoken`.                                                                                                                          |
| backend/src/auth.config.js                 | New: Auth config with GitHub provider, signIn allowlist (ALLOWED_GITHUB_USERNAME / ALLOWED_GITHUB_ID), shared for ExpressAuth and getSession.                        |
| backend/src/app.js                         | ESM; trust proxy; mount ExpressAuth at `/auth`; CORS with credentials; replace adminAuth with adminSessionAuth for `/api/admin`.                                     |
| backend/src/middleware/adminSessionAuth.js | New: getSession(req, authConfig); 401 if no session.user; else next().                                                                                               |
| backend/src/middleware/adminAuth.js        | Remove or keep for legacy; admin routes use adminSessionAuth only.                                                                                                   |
| backend/src/routes/auth.route.js           | Remove or refactor: move ExpressAuth mount into app.js and config into auth.config.js.                                                                               |
| All other backend/src files                | Convert to ESM (import/export, file extensions if required).                                                                                                         |
| backend/.env                               | Add ALLOWED_GITHUB_USERNAME and/or ALLOWED_GITHUB_ID; AUTH_TRUST_HOST for prod; document callback URL.                                                               |
| frontend/src/pages/AdminPortalPage.tsx     | Replace token form with “Sign in with GitHub” and session check (GET with credentials); on 401 show sign-in button linking to backend /auth/signin?callbackUrl=... . |
| frontend/src/lib/adminApi.ts               | Use withCredentials: true; remove X-Admin-Token and token storage; optional GET /api/admin/session for “am I logged in?”.                                            |
| frontend/vite.config.ts                    | Optional: proxy `/auth` to backend.                                                                                                                                  |
| frontend/.env                              | Ensure VITE_API_URL (and VITE_ADMIN_PATH) set for building auth URL if not proxying.                                                                                 |


## 6. Restricting to your GitHub account

- **Option 1 (recommended):** Set **ALLOWED_GITHUB_USERNAME** to your GitHub username (e.g. `keith-ufumeli`). In the signIn callback, allow only when `profile?.login === process.env.ALLOWED_GITHUB_USERNAME`.
- **Option 2:** Set **ALLOWED_GITHUB_ID** to your GitHub numeric user ID (from GitHub profile URL or API). Allow only when `profile?.id == process.env.ALLOWED_GITHUB_ID` (or `user?.id` if that’s the provider account id).
- **Both:** If either env var is set, allow when the corresponding value matches; if both are set, either match is enough. If neither is set, deny all sign-ins (recommended for production).

You can find your GitHub user ID via: GitHub profile → URL `https://github.com/<username>`, or `curl https://api.github.com/users/<username>` and use the `id` field.

## 7. Callback URL summary for GitHub OAuth app

- **Development:** `http://localhost:3001/auth/callback/github`
- **Production:** `https://<your-backend-host>/auth/callback/github` (e.g. `https://api.yourdomain.com/auth/callback/github`)

Use exactly these (no trailing slash, correct scheme and host). If you use one GitHub OAuth app for both, GitHub allows only one callback URL; then use two separate OAuth apps (e.g. “Get Churched Dev” and “Get Churched Prod”) with the two URLs above.

## 8. Order of implementation

1. Backend: add `jsonwebtoken`; convert backend to ESM; add `auth.config.js` and session-based admin middleware; integrate ExpressAuth in app.js; CORS with credentials; update .env.
2. Frontend: admin API withCredentials and session check; AdminPortalPage “Sign in with GitHub” and callbackUrl; optional /auth proxy.
3. Test: sign-in from admin page, confirm redirect and cookie, then access admin API and restrict to your GitHub account via ALLOWED_GITHUB_USERNAME/ID.

