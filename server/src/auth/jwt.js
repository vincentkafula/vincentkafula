import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev-only-insecure-secret-change-me';

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, username: user.username, role: user.role, display_name: user.display_name },
    SECRET,
    { expiresIn: '12h' }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}
