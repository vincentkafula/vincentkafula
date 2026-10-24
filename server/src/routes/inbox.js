import express from 'express';
import crypto from 'crypto';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { isEmailConfigured } from '../utils/resend.js';
import { buildLetterheadEmail, textToHtml } from '../utils/letterhead.js';
import { fetchReceivedEmail, saveReceivedEmail } from '../utils/inbox.js';

// Dashboard inbox: website form submissions plus email received through Resend Receiving.
//
// Environment:
//   RESEND_API_KEY          required to fetch received emails and send replies
//   RESEND_WEBHOOK_SECRET   whsec_... signing secret of the Resend webhook (event: email.received)
//   RESEND_FROM_EMAIL       sender used for replies (a verified domain)
//   INBOX_REPLY_TO          optional: address replies should come back to (your receiving address)

const router = express.Router();
const MANAGERS = ['news-manager', 'head-office'];
const PAGE_SIZE = 50;

// Resend signs webhooks with Svix: HMAC-SHA256 over "id.timestamp.body", key = base64 part of whsec_ secret.
function verifySvix(req, raw) {
  const secret = process.env.RESEND_WEBHOOK_SECRET || '';
  const id = req.headers['svix-id'];
  const ts = req.headers['svix-timestamp'];
  const sigHeader = String(req.headers['svix-signature'] || '');
  if (!secret || !id || !ts || !sigHeader) return false;
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) return false;
  const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  const expected = crypto.createHmac('sha256', key).update(`${id}.${ts}.${raw}`).digest('base64');
  return sigHeader.split(' ').some((part) => {
    const sig = part.split(',')[1] || '';
    return sig.length === expected.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  });
}

// POST /api/inbox/webhook — called by Resend for every received email.
router.post('/webhook', express.raw({ type: '*/*', limit: '1mb' }), async (req, res) => {
  if (!process.env.RESEND_WEBHOOK_SECRET) return res.status(503).send('Webhook secret not configured');
  const raw = req.body.toString('utf8');
  if (!verifySvix(req, raw)) return res.status(400).send('Invalid signature');
  try {
    const event = JSON.parse(raw);
    if (event.type !== 'email.received') return res.json({ ignored: true });
    const email = await fetchReceivedEmail(event.data.email_id);
    await saveReceivedEmail(email);
    res.json({ ok: true });
  } catch (err) {
    console.error('Inbox webhook error:', err);
    res.status(500).send('Could not store email'); // Resend retries on failure
  }
});

// GET /api/inbox/status
router.get('/status', requireAuth(MANAGERS), async (req, res) => {
  const { rows } = await pool.query(`SELECT count(*) FILTER (WHERE read_at IS NULL AND archived_at IS NULL)::int AS unread FROM inbox_messages`);
  res.json({
    sending: isEmailConfigured(),
    receiving: Boolean(process.env.RESEND_WEBHOOK_SECRET && process.env.RESEND_API_KEY),
    replyTo: process.env.INBOX_REPLY_TO || null,
    unread: rows[0].unread,
  });
});

const FOLDERS = {
  inbox: 'archived_at IS NULL',
  unread: 'archived_at IS NULL AND read_at IS NULL',
  starred: 'starred = true',
  email: "archived_at IS NULL AND source = 'email'",
  website: "archived_at IS NULL AND source = 'website'",
  archived: 'archived_at IS NOT NULL',
};

// GET /api/inbox?folder=inbox&q=&page=1
router.get('/', requireAuth(MANAGERS), async (req, res) => {
  try {
    const where = [FOLDERS[req.query.folder] || FOLDERS.inbox];
    const params = [];
    const q = String(req.query.q || '').trim();
    if (q) {
      params.push(`%${q}%`);
      where.push(`(subject ILIKE $1 OR from_email ILIKE $1 OR from_name ILIKE $1 OR text_body ILIKE $1)`);
    }
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const { rows } = await pool.query(
      `SELECT m.id, m.source, m.form_type, m.from_name, m.from_email, m.subject,
              left(regexp_replace(coalesce(m.text_body, ''), '\\s+', ' ', 'g'), 160) AS preview,
              m.received_at, m.read_at, m.starred, m.archived_at,
              jsonb_array_length(m.attachments) AS attachment_count,
              (SELECT max(sent_at) FROM inbox_replies r WHERE r.message_id = m.id) AS replied_at,
              count(*) OVER () AS total
       FROM inbox_messages m WHERE ${where.join(' AND ')}
       ORDER BY m.received_at DESC LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}`,
      params
    );
    const counts = await pool.query(
      `SELECT count(*) FILTER (WHERE archived_at IS NULL)::int AS inbox,
              count(*) FILTER (WHERE archived_at IS NULL AND read_at IS NULL)::int AS unread,
              count(*) FILTER (WHERE starred)::int AS starred,
              count(*) FILTER (WHERE archived_at IS NULL AND source = 'email')::int AS email,
              count(*) FILTER (WHERE archived_at IS NULL AND source = 'website')::int AS website,
              count(*) FILTER (WHERE archived_at IS NOT NULL)::int AS archived
       FROM inbox_messages`
    );
    res.json({
      messages: rows.map(({ total, ...r }) => r),
      total: rows[0] ? Number(rows[0].total) : 0,
      page, pageSize: PAGE_SIZE, counts: counts.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load the inbox' });
  }
});

// GET /api/inbox/:id — full message; marks it read.
router.get('/:id(\\d+)', requireAuth(MANAGERS), async (req, res) => {
  const { rows } = await pool.query(
    `UPDATE inbox_messages SET read_at = COALESCE(read_at, now()) WHERE id = $1 RETURNING *`, [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Message not found' });
  const replies = await pool.query(`SELECT id, body, sent_by, sent_at FROM inbox_replies WHERE message_id = $1 ORDER BY sent_at`, [req.params.id]);
  res.json({ ...rows[0], replies: replies.rows });
});

// PATCH /api/inbox/:id  { read?, starred?, archived? }
router.patch('/:id(\\d+)', requireAuth(MANAGERS), async (req, res) => {
  const sets = [];
  const { read, starred, archived } = req.body || {};
  if (read !== undefined) sets.push(read ? 'read_at = COALESCE(read_at, now())' : 'read_at = NULL');
  if (starred !== undefined) sets.push(`starred = ${starred ? 'true' : 'false'}`);
  if (archived !== undefined) sets.push(archived ? 'archived_at = COALESCE(archived_at, now())' : 'archived_at = NULL');
  if (!sets.length) return res.status(400).json({ error: 'Nothing to update' });
  const { rows } = await pool.query(`UPDATE inbox_messages SET ${sets.join(', ')} WHERE id = $1 RETURNING id, read_at, starred, archived_at`, [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Message not found' });
  res.json(rows[0]);
});

// DELETE /api/inbox/:id — permanently delete (archived messages only).
router.delete('/:id(\\d+)', requireAuth(MANAGERS), async (req, res) => {
  const { rowCount } = await pool.query(`DELETE FROM inbox_messages WHERE id = $1 AND archived_at IS NOT NULL`, [req.params.id]);
  if (!rowCount) return res.status(400).json({ error: 'Only archived messages can be deleted' });
  res.json({ ok: true });
});

// POST /api/inbox/:id/reply  { message }
router.post('/:id(\\d+)/reply', requireAuth(MANAGERS), async (req, res) => {
  try {
    if (!isEmailConfigured()) return res.status(503).json({ error: 'Email sending is not set up (RESEND_API_KEY is missing).' });
    const message = String(req.body?.message || '').trim();
    if (message.length < 2) return res.status(400).json({ error: 'Write a reply first.' });
    const { rows } = await pool.query(`SELECT * FROM inbox_messages WHERE id = $1`, [req.params.id]);
    const m = rows[0];
    if (!m) return res.status(404).json({ error: 'Message not found' });
    if (!m.from_email) return res.status(400).json({ error: 'This message has no sender address to reply to.' });

    const subject = /^re:/i.test(m.subject) ? m.subject : `Re: ${m.subject || 'your message'}`;
    const html = buildLetterheadEmail({ recipientName: m.from_name || '', subject, bodyHtml: textToHtml(message) });
    const headers = m.message_id ? { 'In-Reply-To': m.message_id, References: m.message_id } : undefined;
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'Vincent Kafula <onboarding@resend.dev>',
        to: m.from_email, subject, html, text: message,
        ...(process.env.INBOX_REPLY_TO ? { reply_to: process.env.INBOX_REPLY_TO } : {}),
        ...(headers ? { headers } : {}),
      }),
    });
    if (!r.ok) {
      const body = await r.json().catch(() => ({}));
      return res.status(502).json({ error: body.message || `The reply could not be sent (Resend ${r.status}).` });
    }
    const saved = await pool.query(
      `INSERT INTO inbox_replies (message_id, body, sent_by) VALUES ($1,$2,$3) RETURNING id, body, sent_by, sent_at`,
      [m.id, message, req.user.display_name || req.user.username || null]);
    await pool.query(`UPDATE inbox_messages SET read_at = COALESCE(read_at, now()) WHERE id = $1`, [m.id]);
    res.json(saved.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'The reply could not be sent.' });
  }
});

// GET /api/inbox/:id/attachments/:attId — returns a short-lived download link from Resend.
router.get('/:id(\\d+)/attachments/:attId', requireAuth(MANAGERS), async (req, res) => {
  const { rows } = await pool.query(`SELECT resend_email_id FROM inbox_messages WHERE id = $1`, [req.params.id]);
  if (!rows[0]?.resend_email_id) return res.status(404).json({ error: 'Attachment not found' });
  const r = await fetch(`https://api.resend.com/emails/receiving/${encodeURIComponent(rows[0].resend_email_id)}/attachments/${encodeURIComponent(req.params.attId)}`,
    { headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` } });
  if (!r.ok) return res.status(502).json({ error: 'The attachment could not be fetched from Resend.' });
  const a = await r.json();
  if (!a.download_url) return res.status(502).json({ error: 'No download link was returned.' });
  res.json({ url: a.download_url, filename: a.filename });
});

// POST /api/inbox/sync — import received emails the webhook may have missed.
router.post('/sync', requireAuth(MANAGERS), async (req, res) => {
  if (!process.env.RESEND_API_KEY) return res.status(503).json({ error: 'RESEND_API_KEY is missing.' });
  try {
    const r = await fetch('https://api.resend.com/emails/receiving?limit=50', { headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` } });
    if (!r.ok) return res.status(502).json({ error: `Resend returned ${r.status}. Receiving may not be enabled on this account.` });
    const list = (await r.json()).data || [];
    const ids = list.map((e) => e.id);
    const known = ids.length ? (await pool.query(`SELECT resend_email_id FROM inbox_messages WHERE resend_email_id = ANY($1)`, [ids])).rows.map((x) => x.resend_email_id) : [];
    let imported = 0;
    for (const id of ids.filter((x) => !known.includes(x))) {
      try { if (await saveReceivedEmail(await fetchReceivedEmail(id))) imported += 1; } catch (e) { console.error('Sync:', e.message); }
    }
    res.json({ checked: ids.length, imported });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sync failed.' });
  }
});

export default router;
