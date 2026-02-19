/**
 * Protect admin routes: require X-Admin-Token header to match ADMIN_SECRET.
 * Returns 401 if missing or invalid.
 */

function adminAuth(req, res, next) {
  const secret = process.env.ADMIN_SECRET;
  const token = req.headers['x-admin-token'];

  if (!secret || !token || token !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

module.exports = adminAuth;
