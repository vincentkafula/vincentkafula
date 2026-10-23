import express from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/requireAuth.js';

// Team and candidate register.
//
// Safeguards:
// - Editors (news-manager, head-office) can add and edit profiles and set pending statuses.
// - Only head-office can confirm an appointment, reject a candidate, publish or delete.
// - "appointed" requires an appointment reference or an uploaded appointment document.
// - The public endpoint returns published profiles only.
// - Any edit to a published profile by a non-approver takes it offline until head-office republishes it.
// - Every change is written to team_profile_audit.

const router = express.Router();

const EDITORS = ['news-manager', 'head-office'];
const APPROVERS = ['head-office'];

const PENDING = ['candidate_for_appointment', 'under_consideration', 'nominee', 'appointment_pending'];
const STATUSES = [...PENDING, 'appointed', 'rejected'];

const STATUS_LABELS = {
  candidate_for_appointment: 'Candidate for Appointment',
  under_consideration: 'Candidate Under Consideration',
  nominee: 'Nominee for Appointment',
  appointment_pending: 'Selected Candidate — Appointment Subject to Confirmation',
  appointed: 'Appointed',
  rejected: 'Not Appointed',
};

const MAX_DOC_BYTES = 5 * 1024 * 1024;
const DOC_TYPES = ['application/pdf', 'image/png', 'image/jpeg',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];

const clean = (v, max = 5000) => (v === undefined || v === null ? null : String(v).trim().slice(0, max) || null);

async function audit(profileId, action, user, details = {}) {
  await pool.query(
    'INSERT INTO team_profile_audit (profile_id, action, details, changed_by) VALUES ($1,$2,$3,$4)',
    [profileId, action, JSON.stringify(details), user ? `${user.display_name} (${user.username})` : null]
  );
}

async function docCount(id) {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM team_profile_documents WHERE profile_id = $1', [id]);
  return rows[0].n;
}

// Public view: only what visitors are allowed to see.
const publicShape = (p) => ({
  id: p.id,
  full_name: p.full_name,
  role_title: p.role_title,
  region: p.region,
  bio: p.bio,
  photo_url: p.photo_url,
  status: p.status,
  status_label: p.status === 'appointed' ? `Appointed ${p.role_title}` : STATUS_LABELS[p.status],
  appointment_date: p.status === 'appointed' ? p.appointment_date : null,
});

// GET /api/team — public, published only, never rejected
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM team_profiles WHERE published = true AND status <> 'rejected'
       ORDER BY (status = 'appointed') DESC, full_name ASC`
    );
    res.json(rows.map(publicShape));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

// GET /api/team/statuses — status values and labels for the admin form
router.get('/statuses', (req, res) => res.json(STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }))));

// GET /api/team/manage — all profiles with document counts (editors)
router.get('/manage', requireAuth(EDITORS), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, (SELECT COUNT(*)::int FROM team_profile_documents d WHERE d.profile_id = p.id) AS document_count
       FROM team_profiles p ORDER BY p.updated_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch profiles' });
  }
});

// GET /api/team/audit — recent audit trail (editors)
router.get('/audit', requireAuth(EDITORS), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.*, p.full_name FROM team_profile_audit a LEFT JOIN team_profiles p ON p.id = a.profile_id
       ORDER BY a.created_at DESC LIMIT 200`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch audit trail' });
  }
});

// GET /api/team/:id — public if published, otherwise 404
router.get('/:id(\\d+)', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM team_profiles WHERE id = $1 AND published = true AND status <> 'rejected'`, [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(publicShape(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// POST /api/team — add a profile (always starts unpublished, never as appointed)
router.post('/', requireAuth(EDITORS), async (req, res) => {
  try {
    const full_name = clean(req.body.full_name, 200);
    const role_title = clean(req.body.role_title, 200);
    if (!full_name || !role_title) return res.status(400).json({ error: 'Full name and role are required.' });
    const status = PENDING.includes(req.body.status) ? req.body.status : 'candidate_for_appointment';
    const { rows } = await pool.query(
      `INSERT INTO team_profiles (full_name, role_title, region, bio, photo_url, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [full_name, role_title, clean(req.body.region, 200), clean(req.body.bio), clean(req.body.photo_url, 1000), status, req.user.username]
    );
    await audit(rows[0].id, 'created', req.user, { full_name, role_title, status });
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create profile' });
  }
});

// PATCH /api/team/:id — edit details
router.patch('/:id(\\d+)', requireAuth(EDITORS), async (req, res) => {
  try {
    const { rows: existing } = await pool.query('SELECT * FROM team_profiles WHERE id = $1', [req.params.id]);
    if (!existing.length) return res.status(404).json({ error: 'Not found' });
    const before = existing[0];
    const fields = ['full_name', 'role_title', 'region', 'bio', 'photo_url'];
    const changes = {};
    for (const f of fields) {
      if (req.body[f] !== undefined) {
        const v = clean(req.body[f], f === 'bio' ? 5000 : 1000);
        if ((f === 'full_name' || f === 'role_title') && !v) return res.status(400).json({ error: 'Full name and role cannot be empty.' });
        if (v !== before[f]) changes[f] = { from: before[f], to: v };
      }
    }
    if (!Object.keys(changes).length) return res.json(before);
    // A non-approver editing a published profile takes it offline for re-approval.
    const unpublish = before.published && !APPROVERS.includes(req.user.role);
    const sets = Object.keys(changes).map((f, i) => `${f} = $${i + 1}`);
    const values = Object.keys(changes).map((f) => changes[f].to);
    if (unpublish) sets.push('published = false');
    sets.push('updated_at = now()');
    values.push(req.params.id);
    const { rows } = await pool.query(`UPDATE team_profiles SET ${sets.join(', ')} WHERE id = $${values.length} RETURNING *`, values);
    await audit(before.id, 'edited', req.user, { changes, unpublished_for_review: unpublish });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// POST /api/team/:id/status — change status. Appointed/rejected need head-office.
router.post('/:id(\\d+)/status', requireAuth(EDITORS), async (req, res) => {
  try {
    const status = req.body.status;
    if (!STATUSES.includes(status)) return res.status(400).json({ error: 'Unknown status.' });
    if (!PENDING.includes(status) && !APPROVERS.includes(req.user.role)) {
      return res.status(403).json({ error: 'Only Head Office can confirm or reject an appointment.' });
    }
    const { rows: existing } = await pool.query('SELECT * FROM team_profiles WHERE id = $1', [req.params.id]);
    if (!existing.length) return res.status(404).json({ error: 'Not found' });
    const before = existing[0];

    let reference = before.appointment_reference;
    let date = before.appointment_date;
    if (status === 'appointed') {
      reference = clean(req.body.appointment_reference, 300) || before.appointment_reference;
      date = req.body.appointment_date || before.appointment_date;
      if (!reference && (await docCount(before.id)) === 0) {
        return res.status(400).json({ error: 'An appointment can only be confirmed with an appointment reference (letter, resolution or record number) or an uploaded appointment document.' });
      }
      if (!date) return res.status(400).json({ error: 'Enter the date the appointment was confirmed.' });
    }
    const approver = status === 'appointed' || status === 'rejected';
    // Moving an appointed person back to a pending status clears approval and takes them offline.
    const demoted = before.status === 'appointed' && status !== 'appointed';
    const { rows } = await pool.query(
      `UPDATE team_profiles SET status = $1, appointment_reference = $2, appointment_date = $3,
         approved_by = CASE WHEN $4 THEN $5 WHEN $6 THEN NULL ELSE approved_by END,
         approved_at = CASE WHEN $4 THEN now() WHEN $6 THEN NULL ELSE approved_at END,
         published = CASE WHEN $1 = 'rejected' OR $6 THEN false ELSE published END,
         updated_at = now()
       WHERE id = $7 RETURNING *`,
      [status, status === 'appointed' ? reference : before.appointment_reference, status === 'appointed' ? date : before.appointment_date,
       approver, `${req.user.display_name} (${req.user.username})`, demoted, before.id]
    );
    await audit(before.id, 'status_changed', req.user, { from: before.status, to: status, appointment_reference: reference, appointment_date: date });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to change status' });
  }
});

// POST /api/team/:id/publish and /unpublish — head-office only
router.post('/:id(\\d+)/publish', requireAuth(APPROVERS), async (req, res) => {
  try {
    const { rows: existing } = await pool.query('SELECT * FROM team_profiles WHERE id = $1', [req.params.id]);
    if (!existing.length) return res.status(404).json({ error: 'Not found' });
    if (existing[0].status === 'rejected') return res.status(400).json({ error: 'A rejected candidate cannot be published.' });
    const { rows } = await pool.query('UPDATE team_profiles SET published = true, updated_at = now() WHERE id = $1 RETURNING *', [req.params.id]);
    await audit(existing[0].id, 'published', req.user, { status: existing[0].status });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to publish profile' });
  }
});

router.post('/:id(\\d+)/unpublish', requireAuth(APPROVERS), async (req, res) => {
  try {
    const { rows } = await pool.query('UPDATE team_profiles SET published = false, updated_at = now() WHERE id = $1 RETURNING *', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    await audit(rows[0].id, 'unpublished', req.user);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to unpublish profile' });
  }
});

// Appointment documents (letters, resolutions). Stored in the database; never public.
router.post('/:id(\\d+)/documents', requireAuth(EDITORS), express.json({ limit: '8mb' }), async (req, res) => {
  try {
    const file_name = clean(req.body.file_name, 255);
    const mime_type = String(req.body.mime_type || '');
    if (!file_name || !req.body.data_base64) return res.status(400).json({ error: 'Choose a file to upload.' });
    if (!DOC_TYPES.includes(mime_type)) return res.status(400).json({ error: 'Upload a PDF, Word document or image.' });
    const data = Buffer.from(String(req.body.data_base64), 'base64');
    if (!data.length || data.length > MAX_DOC_BYTES) return res.status(400).json({ error: 'Documents must be smaller than 5 MB.' });
    const { rows: p } = await pool.query('SELECT id FROM team_profiles WHERE id = $1', [req.params.id]);
    if (!p.length) return res.status(404).json({ error: 'Not found' });
    const { rows } = await pool.query(
      `INSERT INTO team_profile_documents (profile_id, file_name, mime_type, data, uploaded_by)
       VALUES ($1,$2,$3,$4,$5) RETURNING id, file_name, mime_type, uploaded_by, uploaded_at`,
      [req.params.id, file_name, mime_type, data, req.user.username]
    );
    await audit(Number(req.params.id), 'document_uploaded', req.user, { file_name });
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

router.get('/:id(\\d+)/documents', requireAuth(EDITORS), async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, file_name, mime_type, uploaded_by, uploaded_at FROM team_profile_documents WHERE profile_id = $1 ORDER BY uploaded_at DESC',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

router.get('/documents/:docId(\\d+)', requireAuth(EDITORS), async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM team_profile_documents WHERE id = $1', [req.params.docId]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.setHeader('Content-Type', rows[0].mime_type);
    res.setHeader('Content-Disposition', `attachment; filename="${rows[0].file_name.replace(/"/g, '')}"`);
    res.send(rows[0].data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// DELETE /api/team/:id — head-office only (audit row is kept)
router.delete('/:id(\\d+)', requireAuth(APPROVERS), async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM team_profiles WHERE id = $1 RETURNING full_name, role_title, status', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    await audit(null, 'deleted', req.user, { id: Number(req.params.id), ...rows[0] });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete profile' });
  }
});

export default router;
