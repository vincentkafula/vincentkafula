import express from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

router.get('/', requireAuth(), async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM weekly_register_entries ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch weekly register entries' });
  }
});

router.post('/', requireAuth(['operation-office']), async (req, res) => {
  try {
    const { employee_name, week_ending, days_worked, hours_worked, notes } = req.body;
    if (!employee_name || !week_ending) return res.status(400).json({ error: 'employee_name and week_ending are required' });
    const { rows } = await pool.query(
      `INSERT INTO weekly_register_entries (employee_name, week_ending, days_worked, hours_worked, notes, entered_by)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [employee_name, week_ending, days_worked || 0, hours_worked || 0, notes || null, req.user.display_name]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to log weekly register entry' });
  }
});

export default router;
