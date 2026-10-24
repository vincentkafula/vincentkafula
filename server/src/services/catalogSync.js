import { pool } from '../db/pool.js';
import { isCjConfigured, shipFrom, searchProducts, getProduct, listMyProducts } from '../utils/cj.js';

// Keeps the shop's catalogue in step with CJdropshipping without anyone importing by hand:
//  • every product saved to "My Products" in the CJ account appears in the shop;
//  • keyword rules pull popular, in-stock CJ products automatically;
//  • existing CJ products get fresh costs, new/removed options, and are hidden if CJ stops selling them.
// Prices follow the markup unless a manager has set an option's price by hand (price_locked).

export const DEFAULT_SETTINGS = {
  enabled: true,
  intervalHours: 12,
  myProducts: true,
  autoPublish: true,
  markup: null,              // null = use SHOP_MARKUP / 2.5
  maxProducts: 120,          // cap on CJ products in the shop
  refreshPerRun: 60,         // existing products re-checked per run (CJ API points are limited)
  rules: [
    { keyword: 't-shirt', maxCost: 8, perRule: 6, enabled: true },
    { keyword: 'baseball cap', maxCost: 6, perRule: 4, enabled: true },
    { keyword: 'tote bag', maxCost: 5, perRule: 4, enabled: true },
    { keyword: 'ceramic mug', maxCost: 6, perRule: 4, enabled: true },
    { keyword: 'silicone wristband', maxCost: 3, perRule: 4, enabled: true },
  ],
  minStock: 50,
};

const defaultMarkup = () => Math.max(1, Number(process.env.SHOP_MARKUP) || 2.5);
export const retailFromCost = (cost, markup = defaultMarkup()) => Math.max(0.99, Math.ceil(Number(cost) * markup) - 0.01);

const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '').slice(0, 70) || 'product';
async function uniqueSlug(base) {
  for (let n = 1; ; n += 1) {
    const slug = n === 1 ? base : `${base}-${n}`;
    const { rows } = await pool.query('SELECT 1 FROM products WHERE slug = $1', [slug]);
    if (!rows.length) return slug;
  }
}
export const plainText = (html) => String(html || '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<br\s*\/?>/gi, '\n')
  .replace(/<\/(p|div|li|h\d)>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
  .replace(/\n{3,}/g, '\n\n').trim().slice(0, 4000);

export async function getSettings() {
  const { rows } = await pool.query(`SELECT value FROM shop_settings WHERE key = 'catalog'`);
  return { ...DEFAULT_SETTINGS, ...(rows[0]?.value || {}) };
}

export async function saveSettings(input) {
  const cur = await getSettings();
  const num = (v, min, max, d) => { const n = Number(v); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : d; };
  const next = {
    enabled: input.enabled !== undefined ? Boolean(input.enabled) : cur.enabled,
    intervalHours: num(input.intervalHours, 1, 168, cur.intervalHours),
    myProducts: input.myProducts !== undefined ? Boolean(input.myProducts) : cur.myProducts,
    autoPublish: input.autoPublish !== undefined ? Boolean(input.autoPublish) : cur.autoPublish,
    markup: input.markup === null || input.markup === '' ? null : num(input.markup, 1, 10, cur.markup),
    maxProducts: num(input.maxProducts, 1, 1000, cur.maxProducts),
    refreshPerRun: num(input.refreshPerRun, 0, 300, cur.refreshPerRun),
    minStock: num(input.minStock, 0, 100000, cur.minStock),
    rules: Array.isArray(input.rules)
      ? input.rules.map((r) => ({
        keyword: String(r.keyword || '').trim().slice(0, 60),
        maxCost: r.maxCost === '' || r.maxCost === null || r.maxCost === undefined ? null : num(r.maxCost, 0.1, 1000, null),
        perRule: num(r.perRule, 1, 50, 5),
        enabled: r.enabled !== false,
      })).filter((r) => r.keyword.length >= 2).slice(0, 20)
      : cur.rules,
  };
  await pool.query(
    `INSERT INTO shop_settings (key, value, updated_at) VALUES ('catalog', $1, now())
     ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = now()`, [JSON.stringify(next)]);
  return next;
}

// Create or refresh one CJ product in the shop. Returns { row, created }.
export async function upsertCjProduct(pid, { markup, publish = true, source = 'manual', createdBy = 'CJ sync', name } = {}) {
  const m = markup || defaultMarkup();
  const p = await getProduct(pid);
  if (!p.variants.length) throw new Error('This CJ product has no orderable options.');
  const existing = (await pool.query('SELECT * FROM products WHERE cj_pid = $1', [pid])).rows[0];
  const old = new Map((existing?.variants || []).map((v) => [v.vid, v]));
  const variants = p.variants.map((v) => {
    const prev = old.get(v.vid);
    if (prev?.price_locked) return { ...v, price: prev.price, price_locked: true, active: prev.active !== false };
    return { ...v, price: retailFromCost(v.cost, m), active: prev ? prev.active !== false : true };
  });
  const active = variants.filter((v) => v.active !== false);
  const price = Math.min(...(active.length ? active : variants).map((v) => v.price));
  const cost = Math.min(...variants.map((v) => v.cost));

  if (existing) {
    const r = await pool.query(
      `UPDATE products SET variants = $2, cost = $3, price = $4, images = $5, image_url = COALESCE(image_url, $6),
         sync_note = CASE WHEN sync_note LIKE 'CJ:%' THEN NULL ELSE sync_note END, last_synced_at = now(), updated_at = now() WHERE id = $1 RETURNING *`,
      [existing.id, JSON.stringify(variants), cost, price, JSON.stringify(p.images), p.images[0] || null]);
    return { row: r.rows[0], created: false };
  }
  const title = name || p.name;
  const r = await pool.query(
    `INSERT INTO products (name, slug, description, price, image_url, stock_quantity, status, created_by, source, cj_pid, images, variants,
       cost, ship_from, last_synced_at, auto_source)
     VALUES ($1,$2,$3,$4,$5,0,$6,$7,'cj',$8,$9,$10,$11,$12,now(),$13) RETURNING *`,
    [title, await uniqueSlug(slugify(title)), plainText(p.description), price, p.images[0] || null, publish ? 'active' : 'inactive',
      createdBy, pid, JSON.stringify(p.images), JSON.stringify(variants), cost, shipFrom(), source]);
  return { row: r.rows[0], created: true };
}

let running = false;

export async function runCatalogSync(trigger = 'schedule') {
  if (!isCjConfigured()) throw new Error('CJ is not connected (CJ_API_KEY is missing).');
  if (running) throw new Error('A catalogue sync is already running.');
  running = true;
  const settings = await getSettings();
  const markup = settings.markup || defaultMarkup();
  const run = (await pool.query(`INSERT INTO shop_sync_runs (trigger) VALUES ($1) RETURNING id`, [trigger])).rows[0];
  const stats = { added: 0, updated: 0, hidden: 0, errors: [] };
  const note = (msg) => { if (stats.errors.length < 30) stats.errors.push(msg); };
  try {
    const count = async () => Number((await pool.query(`SELECT count(*) FROM products WHERE source = 'cj'`)).rows[0].count);
    let total = await count();
    const known = new Set((await pool.query(`SELECT cj_pid FROM products WHERE cj_pid IS NOT NULL`)).rows.map((r) => r.cj_pid));
    const add = async (pid, source) => {
      if (known.has(pid) || total >= settings.maxProducts) return;
      try {
        const { created } = await upsertCjProduct(pid, { markup, publish: settings.autoPublish, source });
        known.add(pid);
        if (created) { stats.added += 1; total += 1; }
      } catch (err) { note(`Add ${pid}: ${err.message}`); }
    };

    // 1. My Products in the CJ account.
    if (settings.myProducts) {
      const seen = new Set();
      let complete = true;
      try {
        for (let page = 1, pages = 1; page <= Math.min(pages, 20); page += 1) {
          const r = await listMyProducts(page);
          pages = r.totalPages;
          for (const p of r.products) { seen.add(p.pid); await add(p.pid, 'my-products'); }
        }
      } catch (err) { complete = false; note(`My Products: ${err.message}`); }
      // Taken out of My Products in CJ → taken off sale here (only when the full list was read);
      // put back into My Products → back on sale.
      if (complete) {
        if (settings.autoPublish && seen.size) {
          await pool.query(
            `UPDATE products SET status = 'active', sync_note = NULL, updated_at = now()
             WHERE auto_source = 'my-products' AND sync_note = 'Removed from My Products in CJ' AND cj_pid = ANY($1)`, [[...seen]]);
        }
        const gone = await pool.query(
          `UPDATE products SET status = 'inactive', sync_note = 'Removed from My Products in CJ', updated_at = now()
           WHERE auto_source = 'my-products' AND status = 'active' AND NOT (cj_pid = ANY($1)) RETURNING id`, [[...seen]]);
        stats.hidden += gone.rowCount;
      }
    }

    // 2. Keyword rules: popular, in-stock products under the cost ceiling.
    for (const rule of settings.rules.filter((r) => r.enabled)) {
      if (total >= settings.maxProducts) break;
      try {
        const filters = { orderBy: 1, sort: 'desc', size: 40, ...(settings.minStock ? { startWarehouseInventory: settings.minStock } : {}),
          ...(rule.maxCost ? { endSellPrice: rule.maxCost } : {}) };
        const { products } = await searchProducts(rule.keyword, 1, filters);
        let taken = Number((await pool.query(`SELECT count(*) FROM products WHERE auto_source = $1`, [`rule:${rule.keyword}`])).rows[0].count);
        for (const p of products) {
          if (taken >= rule.perRule || total >= settings.maxProducts) break;
          if (known.has(p.pid) || (rule.maxCost && p.cost && p.cost > rule.maxCost)) continue;
          const before = stats.added;
          await add(p.pid, `rule:${rule.keyword}`);
          if (stats.added > before) taken += 1;
        }
      } catch (err) { note(`Rule “${rule.keyword}”: ${err.message}`); }
    }

    // 3. Refresh the products checked longest ago: costs, options, and anything CJ no longer sells.
    if (settings.refreshPerRun > 0) {
      const { rows } = await pool.query(
        `SELECT id, cj_pid, status FROM products WHERE source = 'cj' AND (last_synced_at IS NULL OR last_synced_at < now() - interval '20 hours')
         ORDER BY last_synced_at ASC NULLS FIRST LIMIT $1`, [settings.refreshPerRun]);
      for (const r of rows) {
        try {
          await upsertCjProduct(r.cj_pid, { markup });
          stats.updated += 1;
        } catch (err) {
          const gone = /not exist|not found|no orderable|off.?sale|下架|不存在/i.test(err.message) || err.code === 1601000;
          if (gone) {
            const h = await pool.query(`UPDATE products SET status = 'inactive', sync_note = $2, last_synced_at = now(), updated_at = now()
              WHERE id = $1 AND status = 'active' RETURNING id`, [r.id, `CJ: ${err.message}`]);
            stats.hidden += h.rowCount;
          } else {
            note(`Refresh ${r.cj_pid}: ${err.message}`);
          }
        }
      }
    }
  } finally {
    running = false;
    await pool.query(`UPDATE shop_sync_runs SET finished_at = now(), added = $2, updated = $3, hidden = $4, errors = $5 WHERE id = $1`,
      [run.id, stats.added, stats.updated, stats.hidden, stats.errors]);
  }
  return stats;
}

// Called hourly; runs a sync when the configured interval has passed.
export async function maybeRunScheduledSync() {
  if (!isCjConfigured()) return;
  const s = await getSettings();
  if (!s.enabled) return;
  const { rows } = await pool.query(
    `SELECT started_at, added, cardinality(errors) AS problems,
            (SELECT count(*) FROM products WHERE source = 'cj' AND status = 'active')::int AS on_sale
     FROM shop_sync_runs ORDER BY started_at DESC LIMIT 1`);
  const lastRun = rows[0];
  const since = lastRun ? Date.now() - new Date(lastRun.started_at).getTime() : Infinity;
  // Normally wait the full interval; retry after 15 minutes if the last run failed or the shop is still empty.
  const struggling = lastRun && (lastRun.problems > 0 || lastRun.on_sale === 0);
  if (since < s.intervalHours * 3600 * 1000 && !(struggling && since >= 15 * 60 * 1000)) return;
  await runCatalogSync('schedule');
}

export const isSyncRunning = () => running;
