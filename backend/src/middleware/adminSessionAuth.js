import { getSession, authConfig } from '../auth.config.js';

const ADMIN_SECRET = process.env.ADMIN_SECRET?.trim() || '';

function hasValidAdminToken(req) {
  if (!ADMIN_SECRET) return false;
  const token = req.get('X-Admin-Token')?.trim();
  return token !== undefined && token !== '' && token === ADMIN_SECRET;
}

/** Allow access with either Auth.js session or valid X-Admin-Token. */
export async function adminSessionAuth(req, res, next) {
  if (hasValidAdminToken(req)) {
    res.locals.session = { user: { name: 'Admin (token)', email: null, image: null } };
    return next();
  }
  const session = await getSession(req, authConfig);
  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.locals.session = session;
  next();
}
