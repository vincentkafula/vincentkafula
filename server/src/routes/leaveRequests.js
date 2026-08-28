import express from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

// GET /api/leave-requests?status=
router.get('/', requireAuth(), async (req, res) => {
  try {
    const { status } = req.query;
    const params = [];
    let sql = 'SELECT * FROM leave_requests';
    if (status) {
      params.push(status);
      sql += ` WHERE status = $${params.length}`;
    }
    sql += ' ORDER BY created_at DESC';
    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
});

// POST /api/leave-requests  (any authenticated role can log a leave request)
router.post('/', requireAuth(), async (req, res) => {
  try {
    const { employee_name, employee_role, leave_type, start_date, end_date, reason } = req.body;
    if (!employee_name || !start_date || !end_date) {
      return res.status(400).json({ error: 'employee_name, start_date, and end_date are required' });
    }
    const { rows } = await pool.query(
      `INSERT INTO leave_requests (employee_name, employee_role, leave_type, start_date, end_date, reason, requested_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [employee_name, employee_role || null, leave_type || 'annual', start_date, end_date, reason || null, req.user.display_name]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit leave request' });
  }
});

// POST /api/leave-requests/:id/decide  (Operation Office: approve or decline)
router.post('/:id/decide', requireAuth(['operation-office']), async (req, res) => {
  try {
    const { approved } = req.body;
    const status = approved ? 'approved' : 'declined';
    const { rows } = await pool.query(
      `UPDATE leave_requests SET status = $1, decided_by = $2, decided_at = now()
       WHERE id = $3 AND status = 'pending'
       RETURNING *`,
      [status, req.user.display_name, req.params.id]
    );
    if (!rows.length) return res.status(409).json({ error: 'Leave request not found or already decided' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to record decision' });
  }
});

export default router;
