import { verifyToken } from '../auth/jwt.js';

// Verifies the JWT. If `roles` is given, also enforces the caller's role is in that list.
export function requireAuth(roles) {
  return (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
      const payload = verifyToken(token);
      if (roles && !roles.includes(payload.role)) {
        return res.status(403).json({ error: 'Not authorized for this action' });
      }
      req.user = payload;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }
  };
}
