import express from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { sendBulkEmail, isEmailConfigured } from '../utils/resend.js';
import { buildLetterheadEmail, textToHtml, parseRecipients } from '../utils/letterhead.js';

const router = express.Router();

const MANAGER_ROLES = ['news-manager', 'head-office'];

// GET /api/email/status — is Resend configured?
router.get('/status', requireAuth(MANAGER_ROLES), (req, res) => {
  res.json({ configured: isEmailConfigured() });
});

// POST /api/email/send — send a general, letterhead-branded email to a list of
// recipients via Resend. Each recipient gets their own email, personally
// addressed by name (accepts "Name <email>" or bare email per recipient).
router.post('/send', requireAuth(MANAGER_ROLES), async (req, res) => {
  try {
    const { recipients, subject, message } = req.body;
    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: 'recipients must be a non-empty array' });
    }
    if (!subject) {
      return res.status(400).json({ error: 'subject is required' });
    }
    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }

    const parsed = parseRecipients(recipients);
    if (!parsed.length) {
      return res.status(400).json({ error: 'No valid email addresses found in recipients' });
    }

    const bodyHtml = textToHtml(message);

    const result = await sendBulkEmail({
      recipients: parsed,
      subject,
      buildHtml: (r) => buildLetterheadEmail({ recipientName: r.name, subject, bodyHtml }),
    });

    await pool.query(
      `INSERT INTO email_broadcasts (news_post_id, subject, recipients, sent_count, failed_count, sent_by)
       VALUES (NULL,$1,$2,$3,$4,$5)`,
      [subject, parsed.map((r) => r.email), result.sent, result.failed, req.user.display_name]
    );

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to send email' });
  }
});

// GET /api/email/history — recent sends (both general emails and article emails)
router.get('/history', requireAuth(MANAGER_ROLES), async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM email_broadcasts ORDER BY created_at DESC LIMIT 50'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch send history' });
  }
});

export default router;
