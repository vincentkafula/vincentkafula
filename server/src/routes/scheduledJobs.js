import express from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

// GET /api/scheduled-jobs?status=pending|approved
router.get('/', requireAuth(), async (req, res) => {
  try {
    const { status } = req.query;
    const params = [];
    let sql = `
      SELECT sj.*, q.partner_name, q.task_details, q.location_address,
             q.num_foremen, q.num_workers, q.num_operation_supervisors
      FROM scheduled_jobs sj
      JOIN quotations q ON q.id = sj.quotation_id
    `;
    if (status) {
      params.push(status);
      sql += ` WHERE sj.status = $${params.length}`;
    }
    sql += ' ORDER BY sj.created_at DESC';
    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch scheduled jobs' });
  }
});

// POST /api/scheduled-jobs/:id/approve  (Operation Office — Scheduling Management)
router.post('/:id/approve', requireAuth(['operation-office']), async (req, res) => {
  try {
    const { account_name, scheduled_date } = req.body;
    if (!account_name) return res.status(400).json({ error: 'account_name is required' });

    const { rows } = await pool.query(
      `UPDATE scheduled_jobs
       SET status = 'approved', account_name = $1, scheduled_date = $2,
           approved_by = $3, approved_at = now()
       WHERE id = $4 AND status = 'pending'
       RETURNING *`,
      [account_name, scheduled_date || null, req.user.display_name, req.params.id]
    );
    if (!rows.length) return res.status(409).json({ error: 'Job not found or already approved' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to approve schedule' });
  }
});

export default router;
