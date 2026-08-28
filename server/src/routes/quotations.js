import express from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

// GET /api/quotations?status=submitted
router.get('/', requireAuth(), async (req, res) => {
  try {
    const { status } = req.query;
    const params = [];
    let sql = 'SELECT * FROM quotations';
    if (status) {
      params.push(status);
      sql += ` WHERE status = $${params.length}`;
    }
    sql += ' ORDER BY created_at DESC';
    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch quotations' });
  }
});

// GET /api/quotations/:id
router.get('/:id', requireAuth(), async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM quotations WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch quotation' });
  }
});

// POST /api/quotations  (Partner submits a request)
router.post('/', requireAuth(['partner']), async (req, res) => {
  try {
    const {
      partner_name, partner_email, partner_phone,
      num_workers, num_foremen, num_operation_supervisors,
      task_details, location_address, location_lat, location_lng,
      payment_terms, requested_stream,
    } = req.body;

    if (!partner_name) {
      return res.status(400).json({ error: 'partner_name is required' });
    }

    const { rows } = await pool.query(
      `INSERT INTO quotations
        (partner_name, partner_email, partner_phone, num_workers, num_foremen,
         num_operation_supervisors, task_details, location_address, location_lat,
         location_lng, payment_terms, requested_stream, created_by_user_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        partner_name, partner_email || null, partner_phone || null,
        num_workers || 0, num_foremen || 0, num_operation_supervisors || 0,
        task_details || null, location_address || null,
        location_lat || null, location_lng || null,
        payment_terms || 'upfront', requested_stream || null,
        req.user.sub,
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit quotation' });
  }
});

// POST /api/quotations/:id/om-review  (Operation Management: feasibility)
router.post('/:id/om-review', requireAuth(['op-management']), async (req, res) => {
  try {
    const { approved, notes } = req.body;
    const status = approved ? 'om_approved' : 'om_rejected';
    const { rows } = await pool.query(
      `UPDATE quotations
       SET status = $1, om_reviewed_by = $2, om_reviewed_at = now(), om_notes = $3, updated_at = now()
       WHERE id = $4 AND status = 'submitted'
       RETURNING *`,
      [status, req.user.display_name, notes || null, req.params.id]
    );
    if (!rows.length) return res.status(409).json({ error: 'Quotation not found or not awaiting Operation Management review' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to record review' });
  }
});

// POST /api/quotations/:id/office-approve  (Operation Office: amount)
router.post('/:id/office-approve', requireAuth(['operation-office']), async (req, res) => {
  try {
    const { approved, approved_amount, notes } = req.body;
    const status = approved ? 'office_approved' : 'office_rejected';
    const { rows } = await pool.query(
      `UPDATE quotations
       SET status = $1, office_approved_by = $2, office_approved_at = now(),
           office_approved_amount = $3, office_notes = $4, updated_at = now()
       WHERE id = $5 AND status = 'om_approved'
       RETURNING *`,
      [status, req.user.display_name, approved_amount || null, notes || null, req.params.id]
    );
    if (!rows.length) return res.status(409).json({ error: 'Quotation not found or not awaiting Operation Office approval' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to record approval' });
  }
});

// POST /api/quotations/:id/manager-approve  (Manager: final approval)
router.post('/:id/manager-approve', requireAuth(['project-manager']), async (req, res) => {
  try {
    const { approved, notes, final_stream, monthly_terms_approved } = req.body;
    const status = approved ? 'manager_approved' : 'manager_rejected';
    const { rows } = await pool.query(
      `UPDATE quotations
       SET status = $1, manager_approved_by = $2, manager_approved_at = now(),
           final_stream = $3, monthly_terms_approved = $4, manager_notes = $5, updated_at = now()
       WHERE id = $6 AND status = 'office_approved'
       RETURNING *`,
      [status, req.user.display_name, final_stream || null, monthly_terms_approved, notes || null, req.params.id]
    );
    if (!rows.length) return res.status(409).json({ error: 'Quotation not found or not awaiting Manager approval' });

    const quotation = rows[0];

    // Upfront-payment quotations get an invoice the moment they're finally approved.
    if (approved && quotation.payment_terms === 'upfront' && quotation.office_approved_amount) {
      await pool.query(
        `INSERT INTO invoices (quotation_id, amount) VALUES ($1, $2)`,
        [quotation.id, quotation.office_approved_amount]
      );
    }

    res.json(quotation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to record final approval' });
  }
});

export default router;
