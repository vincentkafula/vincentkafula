import express from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db/pool.js';
import { signToken } from '../auth/jwt.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const token = signToken(user);
    res.json({
      token,
      user: { username: user.username, role: user.role, display_name: user.display_name },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', requireAuth(), (req, res) => {
  res.json({ user: req.user });
});

export default router;
