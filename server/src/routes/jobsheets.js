import express from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

const BAG_RATE = 1.94;
const GLOVE_RATE = 7.5;
const ADMIN_FEE_RATE = 0.25;

function computeTotals(j) {
  const totalCash =
    (j.foreman_payment_method === 'cash' ? j.foreman_amount : 0) +
    (j.worker1_payment_method === 'cash' ? j.worker1_amount : 0) +
    (j.worker2_payment_method === 'cash' ? j.worker2_amount : 0);
  const totalEft =
    (j.foreman_payment_method === 'eft' ? j.foreman_amount : 0) +
    (j.worker1_payment_method === 'eft' ? j.worker1_amount : 0) +
    (j.worker2_payment_method === 'eft' ? j.worker2_amount : 0);
  const payAmount = totalCash + totalEft + Number(j.six_x_reward || 0);
  const materialAmount = j.charge_materials
    ? Number(j.bags_used || 0) * BAG_RATE + Number(j.gloves_used || 0) * GLOVE_RATE
    : 0;
  const subtotal = totalCash + totalEft + Number(j.extra_amount || 0) + Number(j.six_x_reward || 0) +
    Number(j.transport_amount || 0) + materialAmount + Number(j.other_amount || 0);
  const adminFee = subtotal * ADMIN_FEE_RATE;
  const invoiceAmount = subtotal + adminFee;
  return { totalCash, totalEft, payAmount, materialAmount, subtotal, adminFee, invoiceAmount };
}

function withTotals(row) {
  if (!row) return row;
  return { ...row, ...computeTotals(row) };
}

// GET /api/jobsheets?status=
router.get('/', requireAuth(), async (req, res) => {
  try {
    const { status } = req.query;
    const params = [];
    let sql = `
      SELECT j.*, tb.team_name, tb.foreman_name, tb.worker1_name, tb.worker2_name,
             tb.roll_call_session, sj.account_name, sj.stream, q.partner_name
      FROM jobsheets j
      JOIN team_bookings tb ON tb.id = j.team_booking_id
      JOIN scheduled_jobs sj ON sj.id = tb.scheduled_job_id
      JOIN quotations q ON q.id = sj.quotation_id
    `;
    if (status) {
      params.push(status);
      sql += ` WHERE j.status = $${params.length}`;
    }
    sql += ' ORDER BY j.created_at DESC';
    const { rows } = await pool.query(sql, params);
    res.json(rows.map(withTotals));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch jobsheets' });
  }
});

// POST /api/jobsheets  (Foreman submits, for a deployed team booking)
router.post('/', requireAuth(['foreman']), async (req, res) => {
  try {
    const b = req.body;
    if (!b.team_booking_id) return res.status(400).json({ error: 'team_booking_id is required' });

    const { rows } = await pool.query(
      `INSERT INTO jobsheets
        (team_booking_id, shift_hours, qualified, labour_total_contracted,
         foreman_payment_method, foreman_amount, worker1_payment_method, worker1_amount,
         worker2_payment_method, worker2_amount, extra_amount, six_x_reward, transport_amount,
         charge_materials, bags_issued, bags_returned, bags_used,
         gloves_issued, gloves_returned, gloves_used, other_amount, other_notes, submitted_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
       RETURNING *`,
      [
        b.team_booking_id, b.shift_hours || 4, b.qualified !== false, b.labour_total_contracted || 385,
        b.foreman_payment_method || 'cash', b.foreman_amount || 0,
        b.worker1_payment_method || 'cash', b.worker1_amount || 0,
        b.worker2_payment_method || 'cash', b.worker2_amount || 0,
        b.extra_amount || 0, b.six_x_reward || 0, b.transport_amount || 0,
        b.charge_materials !== false, b.bags_issued || 0, b.bags_returned || 0, b.bags_used || 0,
        b.gloves_issued || 0, b.gloves_returned || 0, b.gloves_used || 0,
        b.other_amount || 0, b.other_notes || null, req.user.display_name,
      ]
    );
    res.status(201).json(withTotals(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit jobsheet' });
  }
});

// POST /api/jobsheets/:id/confirm  (Day Admin: confirm shift completion)
router.post('/:id/confirm', requireAuth(['day-admin']), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE jobsheets SET status = 'confirmed', confirmed_by = $1, confirmed_at = now()
       WHERE id = $2 AND status = 'submitted'
       RETURNING *`,
      [req.user.display_name, req.params.id]
    );
    if (!rows.length) return res.status(409).json({ error: 'Jobsheet not found or already confirmed' });

    // Also mark the underlying team booking complete, if not already.
    await pool.query(
      `UPDATE team_bookings SET status = 'completed' WHERE id = (SELECT team_booking_id FROM jobsheets WHERE id = $1) AND status = 'deployed'`,
      [req.params.id]
    );

    res.json(withTotals(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to confirm jobsheet' });
  }
});

// POST /api/jobsheets/:id/serial  (Operation Office: assign serial number after review)
router.post('/:id/serial', requireAuth(['operation-office']), async (req, res) => {
  try {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yy = String(now.getFullYear()).slice(-2);
    const datePrefix = `${dd}${mm}${yy}`;

    const { rows: countRows } = await pool.query(
      `SELECT COUNT(*) FROM jobsheets WHERE serial_number LIKE $1`,
      [`${datePrefix}%`]
    );
    const seq = String(Number(countRows[0].count) + 1).padStart(2, '0');
    const serialNumber = `${datePrefix}${seq}`;

    const { rows } = await pool.query(
      `UPDATE jobsheets SET status = 'serialed', serial_number = $1, serialed_by = $2, serialed_at = now()
       WHERE id = $3 AND status = 'confirmed'
       RETURNING *`,
      [serialNumber, req.user.display_name, req.params.id]
    );
    if (!rows.length) return res.status(409).json({ error: 'Jobsheet not found or not yet confirmed by Day Admin' });
    res.json(withTotals(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to assign serial number' });
  }
});

export default router;
