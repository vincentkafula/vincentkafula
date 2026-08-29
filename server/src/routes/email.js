import express from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { sendBulkEmail, isEmailConfigured } from '../utils/resend.js';

const router = express.Router();

const MANAGER_ROLES = ['news-manager', 'head-office'];

// GET /api/email/status — is Resend configured?
router.get('/status', requireAuth(MANAGER_ROLES), (req, res) => {
  res.json({ configured: isEmailConfigured() });
});

// POST /api/email/send — send a general email to a list of recipients via Resend
router.post('/send', requireAuth(MANAGER_ROLES), async (req, res) => {
  try {
    const { recipients, subject, message } = req.body;
    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: 'recipients must be a non-empty array of email addresses' });
    }
    if (!subject) {
      return res.status(400).json({ error: 'subject is required' });
    }
    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <p style="white-space: pre-wrap; color:#333; line-height:1.6; font-size:15px;">${message}</p>

        <div style="text-align:center; padding-top:24px; margin-top:28px; border-top:1px dashed #ddd;">
          <div style="font-family: 'Brush Script MT', 'Segoe Script', cursive; font-size:34px; color:#b8860b;">Vincent Kafula</div>
          <div style="width:180px;height:2px;margin:6px auto 12px;background:linear-gradient(90deg,transparent,#d4a01f,transparent);"></div>
          <div style="font-size:12.5px; color:#666; line-height:1.9;">
            +260 95 554 8500 &nbsp;·&nbsp; vincent.kafula@gmail.com &nbsp;·&nbsp; www.vkm8.org &nbsp;·&nbsp; Lusaka, Zambia
          </div>
        </div>
        <p style="margin-top:18px; font-size:11px; color:#aaa; text-align:center;">Sent by ${req.user.display_name} — Vincent Kafula Campaign</p>
      </div>`;

    const result = await sendBulkEmail({ recipients, subject, html });

    await pool.query(
      `INSERT INTO email_broadcasts (news_post_id, subject, recipients, sent_count, failed_count, sent_by)
       VALUES (NULL,$1,$2,$3,$4,$5)`,
      [subject, recipients, result.sent, result.failed, req.user.display_name]
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
