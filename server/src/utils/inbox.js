import { pool } from '../db/pool.js';

// Shared helpers for the manager-dashboard inbox.

// "Jane Banda <jane@x.com>" -> { name: 'Jane Banda', email: 'jane@x.com' }
export function parseAddress(value) {
  const str = String(value || '').trim();
  const m = str.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  if (m) return { name: m[1].trim() || null, email: m[2].trim().toLowerCase() };
  return { name: null, email: str.toLowerCase() };
}

const LABELS = {
  phone: 'Phone', province: 'Province', district: 'District', constituency: 'Constituency', ward: 'Ward', pollingStation: 'Polling station',
};

const asArray = (v) => (Array.isArray(v) ? v : v ? [v] : []).map(String);

// Store one website form submission. Never throws: a storage problem must not block the form.
export async function saveWebsiteSubmission({ formType, title, body }) {
  try {
    const fields = {};
    for (const [k, v] of Object.entries(body || {})) {
      if (k === 'website' || k === 'type' || v === undefined || v === null || String(v).trim() === '') continue;
      fields[k] = String(v).slice(0, 5000);
    }
    const lines = Object.entries(fields)
      .filter(([k]) => !['name', 'email', 'subject', 'message'].includes(k))
      .map(([k, v]) => `${LABELS[k] || k}: ${v}`);
    const text = [fields.message, lines.length ? `\n${lines.join('\n')}` : ''].filter(Boolean).join('\n');
    const { rows } = await pool.query(
      `INSERT INTO inbox_messages (source, form_type, from_name, from_email, subject, text_body, fields)
       VALUES ('website',$1,$2,$3,$4,$5,$6) RETURNING id`,
      [formType, fields.name || null, (fields.email || '').toLowerCase(), title, text || null, fields]
    );
    return rows[0].id;
  } catch (err) {
    console.error('Inbox: could not save website submission:', err.message);
    return null;
  }
}

// Fetch a received email's full content from Resend.
export async function fetchReceivedEmail(emailId) {
  const res = await fetch(`https://api.resend.com/emails/receiving/${encodeURIComponent(emailId)}`, {
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
  });
  if (!res.ok) throw new Error(`Resend returned ${res.status} for received email ${emailId}`);
  return res.json();
}

// Store a received email (idempotent on the Resend id). Returns true when newly stored.
export async function saveReceivedEmail(email) {
  const from = parseAddress(email.from);
  const attachments = (email.attachments || []).map((a) => ({
    id: a.id, filename: a.filename, content_type: a.content_type, size: a.size ?? null,
    inline: a.content_disposition === 'inline',
  }));
  const { rowCount } = await pool.query(
    `INSERT INTO inbox_messages (source, resend_email_id, message_id, from_name, from_email, to_addresses, cc_addresses,
       subject, text_body, html_body, attachments, received_at)
     VALUES ('email',$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,COALESCE($11::timestamptz, now()))
     ON CONFLICT (resend_email_id) DO NOTHING`,
    [email.id, email.message_id || null, from.name, from.email, asArray(email.to), asArray(email.cc),
      email.subject || '(no subject)', email.text || null, email.html || null, JSON.stringify(attachments), email.created_at || null]
  );
  return rowCount > 0;
}
