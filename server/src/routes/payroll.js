import express from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

router.get('/', requireAuth(), async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM payroll_entries ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch payroll entries' });
  }
});

router.post('/', requireAuth(['operation-office']), async (req, res) => {
  try {
    const { employee_name, employee_role, period_start, period_end, hours_worked, gross_pay, deductions } = req.body;
    if (!employee_name || !period_start || !period_end) {
      return res.status(400).json({ error: 'employee_name, period_start, and period_end are required' });
    }
    const gross = Number(gross_pay) || 0;
    const ded = Number(deductions) || 0;
    const { rows } = await pool.query(
      `INSERT INTO payroll_entries (employee_name, employee_role, period_start, period_end, hours_worked, gross_pay, deductions, net_pay, entered_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [employee_name, employee_role || null, period_start, period_end, hours_worked || 0, gross, ded, gross - ded, req.user.display_name]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to log payroll entry' });
  }
});

export default router;
