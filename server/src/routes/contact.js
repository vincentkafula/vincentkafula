import express from 'express';
import { sendBulkEmail, isEmailConfigured } from '../utils/resend.js';
import { saveWebsiteSubmission } from '../utils/inbox.js';

// Public form submissions from the website (contact, volunteer, support, newsletter).
// Each submission is emailed to CONTACT_TO_EMAIL (default: vincent.kafula@gmail.com) via Resend.

const router = express.Router();

const TYPES = {
  contact: 'Website contact form',
  volunteer: 'New volunteer sign-up',
  support: 'Offer of support',
  subscribe: 'Newsletter subscription',
};

const FIELD_LABELS = {
  name: 'Name', email: 'Email', phone: 'Phone', subject: 'Subject', message: 'Message',
  province: 'Province', district: 'District', constituency: 'Constituency', ward: 'Ward', pollingStation: 'Polling station',
};

const MAX_LEN = 5000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Simple in-memory rate limit: 5 submissions per IP per 10 minutes.
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 5;
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > LIMIT;
}

const escapeHtml = (v) => String(v)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

router.post('/', async (req, res) => {
  try {
    const body = req.body || {};
    const type = TYPES[body.type] ? body.type : null;
    if (!type) return res.status(400).json({ error: 'Unknown form type.' });

    // Honeypot: real visitors never fill this hidden field. Pretend success for bots.
    if (body.website) return res.json({ ok: true });

    if (rateLimited(req.ip)) {
      return res.status(429).json({ error: 'Too many submissions. Please try again in a few minutes.' });
    }

    const email = String(body.email || '').trim();
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });
    if (type !== 'subscribe' && !String(body.name || '').trim()) {
      return res.status(400).json({ error: 'Please enter your name.' });
    }
    if (type === 'contact' && String(body.message || '').trim().length < 10) {
      return res.status(400).json({ error: 'Please enter a message of at least 10 characters.' });
    }

    // Every submission lands in the dashboard inbox; the email copy below is a notification on top.
    const subjectForInbox = `${TYPES[type]}${body.subject ? `: ${String(body.subject).slice(0, 120)}` : ''}`;
    const savedId = await saveWebsiteSubmission({ formType: type, title: subjectForInbox, body: { ...body, email } });

    if (!isEmailConfigured()) {
      if (savedId) return res.json({ ok: true });
      return res.status(503).json({ error: 'The message service is not available right now. Please email vincent.kafula@gmail.com directly.' });
    }

    const rows = Object.keys(FIELD_LABELS)
      .filter((k) => body[k] !== undefined && String(body[k]).trim() !== '')
      .map((k) => `<tr><th align="left" style="padding:6px 12px 6px 0;vertical-align:top">${FIELD_LABELS[k]}</th><td style="padding:6px 0;white-space:pre-wrap">${escapeHtml(String(body[k]).slice(0, MAX_LEN))}</td></tr>`)
      .join('');

    const subjectLine = `${TYPES[type]}${body.subject ? `: ${String(body.subject).slice(0, 120)}` : ''}`;
    const html = `<h2 style="font-family:Arial,sans-serif">${TYPES[type]}</h2><table style="font-family:Arial,sans-serif;font-size:14px">${rows}</table><p style="font-family:Arial,sans-serif;font-size:12px;color:#666">Sent from the website. Reply directly to respond to ${escapeHtml(email)}.</p>`;

    const to = process.env.CONTACT_TO_EMAIL || 'vincent.kafula@gmail.com';
    const result = await sendBulkEmail({ recipients: [to], subject: subjectLine, html, replyTo: email });
    if (!result.sent && !savedId) {
      return res.status(502).json({ error: 'Your message could not be sent. Please email vincent.kafula@gmail.com directly.' });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('Contact form error:', err);
    res.status(500).json({ error: 'Your message could not be sent. Please email vincent.kafula@gmail.com directly.' });
  }
});

export default router;
