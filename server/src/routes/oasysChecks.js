import express from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

router.get('/', requireAuth(), async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM oasys_checks ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch OASys checks' });
  }
});

router.post('/', requireAuth(['operation-office']), async (req, res) => {
  try {
    const { description, expected_amount, actual_amount } = req.body;
    if (!description) return res.status(400).json({ error: 'description is required' });
    const expected = Number(expected_amount) || 0;
    const actual = Number(actual_amount) || 0;
    const status = Math.abs(expected - actual) < 0.01 ? 'ok' : 'discrepancy';
    const { rows } = await pool.query(
      `INSERT INTO oasys_checks (description, expected_amount, actual_amount, status, checked_by)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [description, expected, actual, status, req.user.display_name]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to log OASys check' });
  }
});

export default router;
