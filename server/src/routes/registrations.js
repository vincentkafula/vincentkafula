import express from 'express';
import crypto from 'crypto';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { sendSingleEmail, isEmailConfigured } from '../utils/resend.js';

// Registrations: Membership, Cooperative (20 members) and Internship.
//
// Verification ("two-factor"): every submission must include a 6-digit code emailed to the applicant
// (membership) or to the email on file for the member's membership number (cooperative chairperson, intern).
// Membership is open to Zambians aged 18 or older (Build One Zambia membership criteria).
// Documents (NRC copies, CVs) are stored privately and only Head Office can view them.

const router = express.Router();
const REVIEWERS = ['head-office'];
const bigJson = express.json({ limit: '14mb' });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NRC_RE = /^\d{6}\/\d{2}\/\d$/;
const MEMBER_NO_RE = /^BOZ-\d{6}$/;
const DOC_TYPES = ['application/pdf', 'image/png', 'image/jpeg',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_DOC = 5 * 1024 * 1024;
const COOP_SIZE = 20;

const clean = (v, max = 300) => (v === undefined || v === null ? '' : String(v).trim().slice(0, max));
const hash = (code) => crypto.createHash('sha256').update(String(code)).digest('hex');
const maskEmail = (e) => e.replace(/^(.)(.*)(.@.*)$/, (m, a, mid, b) => a + '*'.repeat(Math.max(1, mid.length)) + b);

// --- simple in-memory rate limiting ---
const hits = new Map();
function limited(key, max, windowMs) {
  const now = Date.now();
  const list = (hits.get(key) || []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(key, list);
  return list.length > max;
}

async function memberByNo(no) {
  const { rows } = await pool.query(
    `SELECT * FROM member_registrations WHERE membership_no = $1 AND status <> 'rejected'`, [String(no || '').toUpperCase()]
  );
  return rows[0] || null;
}

async function uniqueRef(table, column, prefix) {
  for (;;) {
    const ref = `${prefix}-${crypto.randomInt(100000, 1000000)}`;
    const { rows } = await pool.query(`SELECT 1 FROM ${table} WHERE ${column} = $1`, [ref]);
    if (!rows.length) return ref;
  }
}

async function checkOtp(email, code) {
  const { rows } = await pool.query(
    `SELECT * FROM registration_otps WHERE email = $1 AND used_at IS NULL AND expires_at > now()
     ORDER BY created_at DESC LIMIT 1`, [email.toLowerCase()]
  );
  const otp = rows[0];
  if (!otp) return 'The verification code has expired. Please request a new one.';
  if (otp.attempts >= 5) return 'Too many incorrect attempts. Please request a new code.';
  if (otp.code_hash !== hash(String(code || '').trim())) {
    await pool.query('UPDATE registration_otps SET attempts = attempts + 1 WHERE id = $1', [otp.id]);
    return 'The verification code is incorrect.';
  }
  await pool.query('UPDATE registration_otps SET used_at = now() WHERE id = $1', [otp.id]);
  return null;
}

function parseDocs(docs, allowedKinds) {
  const out = [];
  for (const d of Array.isArray(docs) ? docs : []) {
    if (!allowedKinds.includes(d.kind)) continue;
    if (!DOC_TYPES.includes(d.mime_type)) throw new Error('Documents must be PDF, Word or image files.');
    const data = Buffer.from(String(d.data_base64 || ''), 'base64');
    if (!data.length || data.length > MAX_DOC) throw new Error('Each document must be smaller than 5 MB.');
    out.push({ kind: d.kind, file_name: clean(d.file_name, 200) || 'document', mime_type: d.mime_type, data });
  }
  return out;
}

async function saveDocs(client, type, id, docs) {
  for (const d of docs) {
    await client.query(
      `INSERT INTO registration_documents (registration_type, registration_id, kind, file_name, mime_type, data)
       VALUES ($1,$2,$3,$4,$5,$6)`, [type, id, d.kind, d.file_name, d.mime_type, d.data]
    );
  }
}

function ageOn(dob) {
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return -1;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  if (now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())) age -= 1;
  return age;
}

async function notify(to, subject, lines) {
  try {
    await sendSingleEmail({ to, subject, html: lines.map((l) => `<p style="font-family:Arial,sans-serif;font-size:15px">${l}</p>`).join('') });
  } catch (err) {
    console.error('Registration email failed:', err.message);
  }
}

// POST /api/registrations/otp — send a verification code.
// Body: { email } for new members, or { membership_no } to send to the email on file.
router.post('/otp', async (req, res) => {
  try {
    if (!isEmailConfigured()) return res.status(503).json({ error: 'Email verification is not available right now. Please try again later.' });
    if (limited(`otp-ip:${req.ip}`, 60, 15 * 60 * 1000)) return res.status(429).json({ error: 'Too many requests. Please wait a few minutes.' });
    let email = clean(req.body.email, 200).toLowerCase();
    if (req.body.membership_no) {
      const member = await memberByNo(req.body.membership_no);
      if (!member) return res.status(404).json({ error: 'That membership number was not found.' });
      email = member.email.toLowerCase();
    }
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
    if (limited(`otp-email:${email}`, 3, 10 * 60 * 1000)) return res.status(429).json({ error: 'A code was sent recently. Please check your email or wait a few minutes.' });

    const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
    await pool.query(
      `INSERT INTO registration_otps (email, code_hash, expires_at) VALUES ($1,$2, now() + interval '10 minutes')`,
      [email, hash(code)]
    );
    await sendSingleEmail({
      to: email,
      subject: `Your verification code: ${code}`,
      html: `<p style="font-family:Arial,sans-serif;font-size:15px">Your Build One Zambia registration verification code is:</p>
             <p style="font-family:Arial,sans-serif;font-size:28px;font-weight:bold;letter-spacing:6px">${code}</p>
             <p style="font-family:Arial,sans-serif;font-size:13px;color:#666">The code expires in 10 minutes. If you did not request it, you can ignore this email.</p>`,
    });
    res.json({ sent_to: maskEmail(email) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'The verification code could not be sent.' });
  }
});

// POST /api/registrations/verify-member — check a membership number (used by the cooperative form)
router.post('/verify-member', async (req, res) => {
  try {
    if (limited(`verify:${req.ip}`, 120, 15 * 60 * 1000)) return res.status(429).json({ error: 'Too many requests. Please wait a few minutes.' });
    const no = clean(req.body.membership_no, 20).toUpperCase();
    if (!MEMBER_NO_RE.test(no)) return res.json({ valid: false });
    const member = await memberByNo(no);
    if (!member) return res.json({ valid: false });
    // Only a first name and initial are returned, to protect members' privacy.
    res.json({ valid: true, name: `${member.first_name} ${member.last_name.charAt(0)}.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not check the membership number.' });
  }
});

// POST /api/registrations/membership
router.post('/membership', bigJson, async (req, res) => {
  const client = await pool.connect();
  try {
    const b = req.body || {};
    const f = {
      first_name: clean(b.first_name, 100), last_name: clean(b.last_name, 100), date_of_birth: clean(b.date_of_birth, 10),
      nrc_number: clean(b.nrc_number, 20), phone: clean(b.phone, 30), email: clean(b.email, 200).toLowerCase(),
      province: clean(b.province, 100), district: clean(b.district, 100), constituency: clean(b.constituency, 100), ward: clean(b.ward, 100),
    };
    if (!f.first_name || !f.last_name) return res.status(400).json({ error: 'Enter your first and last name.' });
    const age = ageOn(f.date_of_birth);
    if (age < 0) return res.status(400).json({ error: 'Enter a valid date of birth.' });
    if (age < 18) return res.status(400).json({ error: 'Membership is open to Zambians aged 18 or older.' });
    if (!NRC_RE.test(f.nrc_number)) return res.status(400).json({ error: 'Enter your NRC number in the format 123456/78/1.' });
    if (!/^[+\d\s()-]{9,20}$/.test(f.phone)) return res.status(400).json({ error: 'Enter a valid phone number.' });
    if (!EMAIL_RE.test(f.email)) return res.status(400).json({ error: 'Enter a valid email address.' });
    if (!f.province || !f.district || !f.constituency || !f.ward) return res.status(400).json({ error: 'Select your province, district, constituency and ward.' });
    if (!b.declaration_citizen || !b.declaration_principles || !b.declaration_privacy) {
      return res.status(400).json({ error: 'Please confirm all the declarations.' });
    }
    let docs;
    try { docs = parseDocs(b.documents, ['nrc_front', 'nrc_back', 'photo']); } catch (e) { return res.status(400).json({ error: e.message }); }
    if (!docs.some((d) => d.kind === 'nrc_front')) return res.status(400).json({ error: 'Upload a copy of the front of your NRC.' });

    const { rows: dup } = await pool.query(
      `SELECT 1 FROM member_registrations WHERE status <> 'rejected' AND (nrc_number = $1 OR email = $2)`, [f.nrc_number, f.email]
    );
    if (dup.length) return res.status(409).json({ error: 'A membership registration already exists for this NRC number or email address.' });

    const otpError = await checkOtp(f.email, b.otp);
    if (otpError) return res.status(400).json({ error: otpError });

    const membership_no = await uniqueRef('member_registrations', 'membership_no', 'BOZ');
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO member_registrations (membership_no, first_name, last_name, date_of_birth, nrc_number, phone, email, province, district, constituency, ward)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
      [membership_no, f.first_name, f.last_name, f.date_of_birth, f.nrc_number, f.phone, f.email, f.province, f.district, f.constituency, f.ward]
    );
    await saveDocs(client, 'membership', rows[0].id, docs);
    await client.query('COMMIT');
    notify(f.email, 'Your Build One Zambia membership registration', [
      `Dear ${f.first_name},`,
      `Thank you for registering. Your membership number is <strong>${membership_no}</strong>. Please keep it safe: you will need it to join a cooperative or apply for an internship.`,
      'Your registration will be reviewed and you will be contacted if any further information is needed.',
    ]);
    res.status(201).json({ membership_no });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error(err);
    res.status(500).json({ error: 'Your registration could not be saved. Please try again.' });
  } finally {
    client.release();
  }
});

// POST /api/registrations/cooperative
router.post('/cooperative', bigJson, async (req, res) => {
  try {
    const b = req.body || {};
    const f = {
      name: clean(b.name, 200), activity: clean(b.activity, 200),
      province: clean(b.province, 100), district: clean(b.district, 100), constituency: clean(b.constituency, 100), ward: clean(b.ward, 100),
      chief_name: clean(b.chief_name, 200), chiefdom: clean(b.chiefdom, 200),
      chair_membership_no: clean(b.chair_membership_no, 20).toUpperCase(), chair_phone: clean(b.chair_phone, 30),
    };
    if (!f.name || !f.activity) return res.status(400).json({ error: 'Enter the cooperative name and main activity.' });
    if (!f.province || !f.district || !f.constituency || !f.ward) return res.status(400).json({ error: 'Select the cooperative’s province, district, constituency and ward.' });
    if (!f.chief_name) return res.status(400).json({ error: 'Enter the name of the chief for the area.' });
    if (!/^[+\d\s()-]{9,20}$/.test(f.chair_phone)) return res.status(400).json({ error: 'Enter the chairperson’s phone number.' });

    const members = [...new Set((Array.isArray(b.member_nos) ? b.member_nos : []).map((n) => clean(n, 20).toUpperCase()).filter(Boolean))];
    if (members.length !== COOP_SIZE) return res.status(400).json({ error: `A cooperative must have exactly ${COOP_SIZE} different members.` });
    if (!members.includes(f.chair_membership_no)) return res.status(400).json({ error: 'The chairperson must be one of the 20 members.' });
    const { rows: found } = await pool.query(
      `SELECT membership_no FROM member_registrations WHERE membership_no = ANY($1) AND status <> 'rejected'`, [members]
    );
    const valid = new Set(found.map((r) => r.membership_no));
    const invalid = members.filter((m) => !valid.has(m));
    if (invalid.length) return res.status(400).json({ error: `These membership numbers are not valid: ${invalid.join(', ')}` });

    const chair = await memberByNo(f.chair_membership_no);
    const otpError = await checkOtp(chair.email, b.otp);
    if (otpError) return res.status(400).json({ error: otpError });

    const reference_no = await uniqueRef('cooperative_registrations', 'reference_no', 'COOP');
    await pool.query(
      `INSERT INTO cooperative_registrations (reference_no, name, activity, province, district, constituency, ward, chief_name, chiefdom, chair_membership_no, chair_phone, member_nos)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [reference_no, f.name, f.activity, f.province, f.district, f.constituency, f.ward, f.chief_name, f.chiefdom || null, f.chair_membership_no, f.chair_phone, members]
    );
    notify(chair.email, 'Your cooperative registration', [
      `Dear ${chair.first_name},`,
      `The cooperative <strong>${f.name}</strong> has been registered with reference <strong>${reference_no}</strong>.`,
      'The registration will be reviewed and you will be contacted about the next steps.',
    ]);
    res.status(201).json({ reference_no });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'The cooperative registration could not be saved. Please try again.' });
  }
});

// POST /api/registrations/internship
router.post('/internship', bigJson, async (req, res) => {
  const client = await pool.connect();
  try {
    const b = req.body || {};
    const f = {
      membership_no: clean(b.membership_no, 20).toUpperCase(), institution: clean(b.institution, 200), student_number: clean(b.student_number, 50),
      course: clean(b.course, 200), year_of_study: clean(b.year_of_study, 30), expected_completion: clean(b.expected_completion, 30), motivation: clean(b.motivation, 3000),
    };
    const member = await memberByNo(f.membership_no);
    if (!member) return res.status(400).json({ error: 'Enter a valid membership number. You must register as a member first.' });
    if (!f.institution || !f.course || !f.year_of_study) return res.status(400).json({ error: 'Enter your university or college, course and year of study.' });
    let docs;
    try { docs = parseDocs(b.documents, ['cv', 'student_proof']); } catch (e) { return res.status(400).json({ error: e.message }); }
    const otpError = await checkOtp(member.email, b.otp);
    if (otpError) return res.status(400).json({ error: otpError });

    const reference_no = await uniqueRef('internship_registrations', 'reference_no', 'INT');
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO internship_registrations (reference_no, membership_no, institution, student_number, course, year_of_study, expected_completion, motivation)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
      [reference_no, f.membership_no, f.institution, f.student_number || null, f.course, f.year_of_study, f.expected_completion || null, f.motivation || null]
    );
    await saveDocs(client, 'internship', rows[0].id, docs);
    await client.query('COMMIT');
    notify(member.email, 'Your internship application', [
      `Dear ${member.first_name},`,
      `Your internship application has been received. Your reference is <strong>${reference_no}</strong>.`,
      'Applications are reviewed and successful applicants will be contacted.',
    ]);
    res.status(201).json({ reference_no });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error(err);
    res.status(500).json({ error: 'Your application could not be saved. Please try again.' });
  } finally {
    client.release();
  }
});

// ---------- Head Office review ----------
const TABLES = { membership: 'member_registrations', cooperative: 'cooperative_registrations', internship: 'internship_registrations' };

router.get('/admin/:type', requireAuth(REVIEWERS), async (req, res) => {
  const table = TABLES[req.params.type];
  if (!table) return res.status(404).json({ error: 'Unknown type' });
  try {
    const { rows } = await pool.query(
      `SELECT t.*, (SELECT json_agg(json_build_object('id', d.id, 'kind', d.kind, 'file_name', d.file_name))
                    FROM registration_documents d WHERE d.registration_type = $1 AND d.registration_id = t.id) AS documents
       FROM ${table} t ORDER BY t.created_at DESC LIMIT 500`, [req.params.type]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

router.post('/admin/:type/:id(\\d+)/status', requireAuth(REVIEWERS), async (req, res) => {
  const table = TABLES[req.params.type];
  if (!table) return res.status(404).json({ error: 'Unknown type' });
  if (!['pending', 'approved', 'rejected'].includes(req.body.status)) return res.status(400).json({ error: 'Unknown status' });
  try {
    const { rows } = await pool.query(
      `UPDATE ${table} SET status = $1, review_note = $2, reviewed_by = $3, reviewed_at = now() WHERE id = $4 RETURNING *`,
      [req.body.status, clean(req.body.note, 1000) || null, `${req.user.display_name} (${req.user.username})`, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

router.get('/admin/documents/:id(\\d+)', requireAuth(REVIEWERS), async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM registration_documents WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.setHeader('Content-Type', rows[0].mime_type);
    res.setHeader('Content-Disposition', `attachment; filename="${rows[0].file_name.replace(/"/g, '')}"`);
    res.send(rows[0].data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

export default router;
