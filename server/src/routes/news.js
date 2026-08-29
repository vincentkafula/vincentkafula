import express from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { sendBulkEmail, isEmailConfigured } from '../utils/resend.js';

const router = express.Router();

const MANAGER_ROLES = ['news-manager', 'head-office'];

function slugify(title) {
  return String(title)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 80);
}

async function uniqueSlug(base) {
  let slug = base || 'post';
  let n = 1;
  while (true) {
    const { rows } = await pool.query('SELECT 1 FROM news_posts WHERE slug = $1', [slug]);
    if (!rows.length) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

// GET /api/news — public: published only. With a valid news-manager/head-office session, ?all=1 also returns drafts.
router.get('/', async (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    let includeDrafts = false;
    if (req.query.all && auth.startsWith('Bearer ')) {
      try {
        const { verifyToken } = await import('../auth/jwt.js');
        const payload = verifyToken(auth.slice(7));
        includeDrafts = MANAGER_ROLES.includes(payload.role);
      } catch {
        includeDrafts = false;
      }
    }
    const sql = includeDrafts
      ? 'SELECT * FROM news_posts ORDER BY created_at DESC'
      : `SELECT * FROM news_posts WHERE status = 'published' ORDER BY published_at DESC`;
    const { rows } = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// GET /api/news/:slug — public
router.get('/:slug', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM news_posts WHERE slug = $1', [req.params.slug]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// POST /api/news — create a draft
router.post('/', requireAuth(MANAGER_ROLES), async (req, res) => {
  try {
    const { title, excerpt, body, cover_image_url } = req.body;
    if (!title || !body) {
      return res.status(400).json({ error: 'title and body are required' });
    }
    const slug = await uniqueSlug(slugify(title));
    const { rows } = await pool.query(
      `INSERT INTO news_posts (title, slug, excerpt, body, cover_image_url, author_username, author_display_name)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [title, slug, excerpt || null, body, cover_image_url || null, req.user.username, req.user.display_name]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create article' });
  }
});

// PATCH /api/news/:id — edit
router.patch('/:id', requireAuth(MANAGER_ROLES), async (req, res) => {
  try {
    const { title, excerpt, body, cover_image_url } = req.body;
    const { rows } = await pool.query(
      `UPDATE news_posts SET
         title = COALESCE($1, title),
         excerpt = COALESCE($2, excerpt),
         body = COALESCE($3, body),
         cover_image_url = COALESCE($4, cover_image_url),
         updated_at = now()
       WHERE id = $5 RETURNING *`,
      [title || null, excerpt ?? null, body || null, cover_image_url ?? null, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update article' });
  }
});

// POST /api/news/:id/publish
router.post('/:id/publish', requireAuth(MANAGER_ROLES), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE news_posts SET status = 'published', published_at = now(), updated_at = now()
       WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to publish article' });
  }
});

// POST /api/news/:id/unpublish
router.post('/:id/unpublish', requireAuth(MANAGER_ROLES), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE news_posts SET status = 'draft', updated_at = now() WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to unpublish article' });
  }
});

// DELETE /api/news/:id
router.delete('/:id', requireAuth(MANAGER_ROLES), async (req, res) => {
  try {
    await pool.query('DELETE FROM news_posts WHERE id = $1', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

// GET /api/news/email/status — is Resend configured?
router.get('/email/status', requireAuth(MANAGER_ROLES), (req, res) => {
  res.json({ configured: isEmailConfigured() });
});

// POST /api/news/:id/send — email this article to a list of recipients via Resend
router.post('/:id/send', requireAuth(MANAGER_ROLES), async (req, res) => {
  try {
    const { recipients, subject: subjectOverride, intro } = req.body;
    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: 'recipients must be a non-empty array of email addresses' });
    }
    const { rows } = await pool.query('SELECT * FROM news_posts WHERE id = $1', [req.params.id]);
    const post = rows[0];
    if (!post) return res.status(404).json({ error: 'Article not found' });

    const subject = subjectOverride || post.title;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        ${post.cover_image_url ? `<img src="${post.cover_image_url}" style="width:100%;border-radius:8px;margin-bottom:16px;" />` : ''}
        ${intro ? `<p style="white-space: pre-wrap; color:#333; line-height:1.6; font-size:15px;">${intro}</p><hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />` : ''}
        <h2 style="color:#12351b;">${post.title}</h2>
        <p style="white-space: pre-wrap; color:#333; line-height:1.6;">${post.body}</p>

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
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [post.id, subject, recipients, result.sent, result.failed, req.user.display_name]
    );

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to send email' });
  }
});

// GET /api/news/:id/broadcasts — send history for one article
router.get('/:id/broadcasts', requireAuth(MANAGER_ROLES), async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM email_broadcasts WHERE news_post_id = $1 ORDER BY created_at DESC',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch send history' });
  }
});

export default router;
