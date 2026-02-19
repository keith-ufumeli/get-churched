import { getSession, authConfig } from '../auth.config.js';

export async function adminSessionAuth(req, res, next) {
  const session = await getSession(req, authConfig);
  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.locals.session = session;
  next();
}
