import express from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

// GET /api/team-bookings?status=booked
router.get('/', requireAuth(), async (req, res) => {
  try {
    const { status } = req.query;
    const params = [];
    let sql = `
      SELECT tb.*, sj.account_name, sj.stream, sj.scheduled_date, sj.quotation_id,
             q.partner_name, q.task_details, q.location_address
      FROM team_bookings tb
      JOIN scheduled_jobs sj ON sj.id = tb.scheduled_job_id
      JOIN quotations q ON q.id = sj.quotation_id
    `;
    if (status) {
      params.push(status);
      sql += ` WHERE tb.status = $${params.length}`;
    }
    sql += ' ORDER BY tb.created_at DESC';
    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch team bookings' });
  }
});

// POST /api/team-bookings  (Teams: book Foreman + 2 Workers against an approved schedule)
router.post('/', requireAuth(['teams']), async (req, res) => {
  try {
    const { scheduled_job_id, team_name, foreman_name, worker1_name, worker2_name, roll_call_session } = req.body;
    if (!scheduled_job_id || !team_name || !foreman_name || !worker1_name || !worker2_name || !roll_call_session) {
      return res.status(400).json({ error: 'All team booking fields are required' });
    }
    const { rows } = await pool.query(
      `INSERT INTO team_bookings
        (scheduled_job_id, team_name, foreman_name, worker1_name, worker2_name, roll_call_session, booked_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [scheduled_job_id, team_name, foreman_name, worker1_name, worker2_name, roll_call_session, req.user.display_name]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to book team' });
  }
});

// POST /api/team-bookings/:id/deploy  (Day Admin: roll call deployment, with optional no-show replacements)
router.post('/:id/deploy', requireAuth(['day-admin']), async (req, res) => {
  try {
    const { no_show_names, replacements } = req.body;
    const { rows } = await pool.query(
      `UPDATE team_bookings
       SET status = 'deployed', deployed_by = $1, deployed_at = now(),
           no_show_names = $2, replacements = $3
       WHERE id = $4 AND status = 'booked'
       RETURNING *`,
      [req.user.display_name, no_show_names || [], JSON.stringify(replacements || []), req.params.id]
    );
    if (!rows.length) return res.status(409).json({ error: 'Booking not found or already deployed' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to deploy shift' });
  }
});

// POST /api/team-bookings/:id/complete  (Day Admin: confirm shift completion)
router.post('/:id/complete', requireAuth(['day-admin']), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE team_bookings SET status = 'completed'
       WHERE id = $1 AND status = 'deployed'
       RETURNING *`,
      [req.params.id]
    );
    if (!rows.length) return res.status(409).json({ error: 'Booking not found or not currently deployed' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to complete shift' });
  }
});

export default router;
