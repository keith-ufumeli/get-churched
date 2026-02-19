import { getSession, authConfig } from '../auth.config.js';

/** Attaches session to res.locals if present; never returns 401. Use for public session-check endpoint. */
export async function optionalAdminSession(req, res, next) {
  const session = await getSession(req, authConfig);
  res.locals.session = session ?? null;
  next();
}
