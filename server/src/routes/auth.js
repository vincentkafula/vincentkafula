import express from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { pool } from '../db/pool.js';
import { signToken } from '../auth/jwt.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { sendSingleEmail, isEmailConfigured } from '../utils/resend.js';
import { buildLetterheadEmail } from '../utils/letterhead.js';

const router = express.Router();

const ADMIN_ROLES = ['head-office'];
const ALL_ROLES = [
  'teams', 'foreman', 'day-admin', 'operation-office', 'op-management',
  'store', 'project-manager', 'head-office', 'partner', 'team-member',
  'news-manager', 'shop-manager',
];

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
      user: { username: user.username, role: user.role, display_name: user.display_name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', requireAuth(), (req, res) => {
  res.json({ user: req.user });
});

// PATCH /api/auth/me — update your own display name / email, or change your password.
router.patch('/me', requireAuth(), async (req, res) => {
  try {
    const { display_name, email, current_password, new_password } = req.body;

    if (new_password) {
      if (!current_password) {
        return res.status(400).json({ error: 'current_password is required to set a new password' });
      }
      const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.sub]);
      const user = rows[0];
      const ok = await bcrypt.compare(current_password, user.password_hash);
      if (!ok) return res.status(401).json({ error: 'Current password is incorrect' });
      if (new_password.length < 8) {
        return res.status(400).json({ error: 'New password must be at least 8 characters' });
      }
      const hash = await bcrypt.hash(new_password, 10);
      await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user.sub]);
    }

    if (display_name || email !== undefined) {
      await pool.query(
        `UPDATE users SET display_name = COALESCE($1, display_name), email = COALESCE($2, email) WHERE id = $3`,
        [display_name || null, email ?? null, req.user.sub]
      );
    }

    const { rows } = await pool.query('SELECT id, username, role, display_name, email FROM users WHERE id = $1', [req.user.sub]);
    const user = rows[0];
    const token = signToken(user);
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update account' });
  }
});

// ---- Account management (head office only) ----

// GET /api/auth/users
router.get('/users', requireAuth(ADMIN_ROLES), async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, username, role, display_name, email, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST /api/auth/users — create a new account for any role
router.post('/users', requireAuth(ADMIN_ROLES), async (req, res) => {
  try {
    const { username, password, role, display_name, email } = req.body;
    if (!username || !password || !role || !display_name) {
      return res.status(400).json({ error: 'username, password, role, and display_name are required' });
    }
    if (!ALL_ROLES.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (username, password_hash, role, display_name, email)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id, username, role, display_name, email, created_at`,
      [username, hash, role, display_name, email || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'That username is already taken' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// DELETE /api/auth/users/:id
router.delete('/users/:id', requireAuth(ADMIN_ROLES), async (req, res) => {
  try {
    if (String(req.user.sub) === String(req.params.id)) {
      return res.status(400).json({ error: "You can't delete your own account" });
    }
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// ---- Password reset (emailed via Resend) ----

// POST /api/auth/forgot-password  { username }
router.post('/forgot-password', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'username is required' });

    const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = rows[0];
    // Always respond the same way whether or not the account exists, so this can't be used to enumerate usernames.
    const genericResponse = { ok: true, message: 'If that account exists, a reset link has been sent.' };

    if (!user || !user.email) {
      return res.json(genericResponse);
    }
    if (!isEmailConfigured()) {
      return res.status(503).json({ error: 'Email is not configured on the server yet. Contact an administrator.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await pool.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1,$2,$3)',
      [user.id, token, expiresAt]
    );

    const baseUrl = process.env.FRONTEND_URL || 'https://frontend-production-82b9c.up.railway.app';
    const resetUrl = `${baseUrl}/reset-password/${token}`;

    const subject = 'Reset your password';
    const bodyHtml = `
      <p style="margin:0 0 20px 0;">Click the link below to set a new password for your dashboard account. This link expires in 1 hour.</p>
      <p style="margin:0 0 20px 0;">
        <a href="${resetUrl}" style="background:#d9720f;color:#fff;padding:11px 22px;border-radius:6px;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:14px;display:inline-block;">Reset Password</a>
      </p>
      <p style="margin:0; color:#888; font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
    `;

    await sendSingleEmail({
      to: user.email,
      subject,
      html: buildLetterheadEmail({ recipientName: user.display_name, subject, bodyHtml }),
    });

    res.json(genericResponse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

// POST /api/auth/reset-password  { token, new_password }
router.post('/reset-password', async (req, res) => {
  try {
    const { token, new_password } = req.body;
    if (!token || !new_password) {
      return res.status(400).json({ error: 'token and new_password are required' });
    }
    if (new_password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    const { rows } = await pool.query(
      `SELECT * FROM password_reset_tokens WHERE token = $1 AND used_at IS NULL AND expires_at > now()`,
      [token]
    );
    const record = rows[0];
    if (!record) {
      return res.status(400).json({ error: 'This reset link is invalid or has expired' });
    }
    const hash = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, record.user_id]);
    await pool.query('UPDATE password_reset_tokens SET used_at = now() WHERE id = $1', [record.id]);
    res.json({ ok: true, message: 'Password updated. You can now log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

export default router;
