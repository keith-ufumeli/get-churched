import { getSession, authConfig } from '../auth.config.js';

const ADMIN_SECRET = process.env.ADMIN_SECRET?.trim() || '';

function hasValidAdminToken(req) {
  if (!ADMIN_SECRET) return false;
  const token = req.get('X-Admin-Token')?.trim();
  return token !== undefined && token !== '' && token === ADMIN_SECRET;
}

/** Attaches session to res.locals (Auth.js session or synthetic when X-Admin-Token is valid); never returns 401. */
export async function optionalAdminSession(req, res, next) {
  if (hasValidAdminToken(req)) {
    res.locals.session = { user: { name: 'Admin (token)', email: null, image: null } };
    return next();
  }
  const session = await getSession(req, authConfig);
  res.locals.session = session ?? null;
  next();
}
