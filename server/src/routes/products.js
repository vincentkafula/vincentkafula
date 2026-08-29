import express from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

const MANAGER_ROLES = ['shop-manager', 'head-office'];

function slugify(name) {
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 80);
}

async function uniqueSlug(base) {
  let slug = base || 'product';
  let n = 1;
  while (true) {
    const { rows } = await pool.query('SELECT 1 FROM products WHERE slug = $1', [slug]);
    if (!rows.length) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

// GET /api/products — public: active only. With a valid shop-manager/head-office session, ?all=1 also returns inactive ones.
router.get('/', async (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    let includeInactive = false;
    if (req.query.all && auth.startsWith('Bearer ')) {
      try {
        const { verifyToken } = await import('../auth/jwt.js');
        const payload = verifyToken(auth.slice(7));
        includeInactive = MANAGER_ROLES.includes(payload.role);
      } catch {
        includeInactive = false;
      }
    }
    const sql = includeInactive
      ? 'SELECT * FROM products ORDER BY created_at DESC'
      : `SELECT * FROM products WHERE status = 'active' ORDER BY created_at DESC`;
    const { rows } = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/:slug — public (by slug or numeric id)
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const sql = /^\d+$/.test(slug)
      ? 'SELECT * FROM products WHERE id = $1'
      : 'SELECT * FROM products WHERE slug = $1';
    const { rows } = await pool.query(sql, [slug]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST /api/products
router.post('/', requireAuth(MANAGER_ROLES), async (req, res) => {
  try {
    const { name, description, price, compare_at_price, image_url, stock_quantity } = req.body;
    if (!name || price === undefined || price === null) {
      return res.status(400).json({ error: 'name and price are required' });
    }
    const slug = await uniqueSlug(slugify(name));
    const { rows } = await pool.query(
      `INSERT INTO products (name, slug, description, price, compare_at_price, image_url, stock_quantity, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        name,
        slug,
        description || null,
        price,
        compare_at_price || null,
        image_url || null,
        stock_quantity || 0,
        req.user.display_name,
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PATCH /api/products/:id
router.patch('/:id', requireAuth(MANAGER_ROLES), async (req, res) => {
  try {
    const { name, description, price, compare_at_price, image_url, stock_quantity, status } = req.body;
    const { rows } = await pool.query(
      `UPDATE products SET
         name = COALESCE($1, name),
         description = COALESCE($2, description),
         price = COALESCE($3, price),
         compare_at_price = COALESCE($4, compare_at_price),
         image_url = COALESCE($5, image_url),
         stock_quantity = COALESCE($6, stock_quantity),
         status = COALESCE($7, status),
         updated_at = now()
       WHERE id = $8 RETURNING *`,
      [
        name || null,
        description ?? null,
        price ?? null,
        compare_at_price ?? null,
        image_url ?? null,
        stock_quantity ?? null,
        status || null,
        req.params.id,
      ]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /api/products/:id
router.delete('/:id', requireAuth(MANAGER_ROLES), async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
