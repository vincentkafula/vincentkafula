import express from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

// GET /api/invoices?quotation_id=  (also joins quotation info for display)
router.get('/', requireAuth(), async (req, res) => {
  try {
    const { quotation_id } = req.query;
    const params = [];
    let sql = `
      SELECT i.*, q.partner_name, q.payment_terms
      FROM invoices i
      JOIN quotations q ON q.id = i.quotation_id
    `;
    if (quotation_id) {
      params.push(quotation_id);
      sql += ` WHERE i.quotation_id = $${params.length}`;
    }
    sql += ' ORDER BY i.created_at DESC';
    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// POST /api/invoices/:id/pay  (mock payment — marks the invoice paid)
router.post('/:id/pay', requireAuth(['partner']), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE invoices SET status = 'paid', paid_at = now()
       WHERE id = $1 AND status = 'unpaid'
       RETURNING *`,
      [req.params.id]
    );
    if (!rows.length) return res.status(409).json({ error: 'Invoice not found or already paid' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to record payment' });
  }
});

export default router;
