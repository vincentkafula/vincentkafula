import express from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

router.get('/', requireAuth(), async (req, res) => {
  try {
    const { status } = req.query;
    const params = [];
    let sql = 'SELECT * FROM payment_authorisations';
    if (status) { params.push(status); sql += ` WHERE status = $${params.length}`; }
    sql += ' ORDER BY created_at DESC';
    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch payment authorisations' });
  }
});

router.post('/', requireAuth(['operation-office']), async (req, res) => {
  try {
    const { payee_name, amount, purpose } = req.body;
    if (!payee_name || !amount) return res.status(400).json({ error: 'payee_name and amount are required' });
    const { rows } = await pool.query(
      `INSERT INTO payment_authorisations (payee_name, amount, purpose, requested_by) VALUES ($1,$2,$3,$4) RETURNING *`,
      [payee_name, amount, purpose || null, req.user.display_name]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to log payment authorisation' });
  }
});

router.post('/:id/decide', requireAuth(['operation-office']), async (req, res) => {
  try {
    const { approved } = req.body;
    const status = approved ? 'approved' : 'declined';
    const { rows } = await pool.query(
      `UPDATE payment_authorisations SET status = $1, decided_by = $2, decided_at = now()
       WHERE id = $3 AND status = 'pending' RETURNING *`,
      [status, req.user.display_name, req.params.id]
    );
    if (!rows.length) return res.status(409).json({ error: 'Not found or already decided' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to record decision' });
  }
});

export default router;
