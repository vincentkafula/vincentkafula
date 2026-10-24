import { pool } from '../db/pool.js';
import { isCjConfigured, shipFrom, searchProducts, getProduct, listMyProducts } from '../utils/cj.js';

// Keeps a large shop catalogue in step with CJdropshipping without anyone importing by hand.
//
// CJ allows one request per second and charges API points per call, so the catalogue is built in two layers:
//  1. Listings — name, photo, CJ cost, category — come from CJ's search, 100 products per request.
//     Thousands of products need only a few dozen requests.
//  2. Details — sizes/colours, all photos, description, exact option costs — are fetched the first time
//     someone opens a product, and re-checked before checkout, then cached.
// Prices follow the markup unless a manager has set an option's price by hand (price_locked).

const BROAD_RULES = [
  't-shirt', 'hoodie', 'cap', 'tote bag', 'backpack', 'mug', 'water bottle', 'phone case', 'socks', 'scarf',
  'sunglasses', 'watch', 'necklace', 'bracelet', 'earrings', 'wallet', 'handbag', 'sneakers', 'sandals', 'dress',
  'jacket', 'kitchen', 'home decor', 'storage', 'bedding', 'lamp', 'garden', 'pet', 'toy', 'baby',
  'fitness', 'yoga', 'cycling', 'camping', 'car accessories', 'phone charger', 'earphones', 'speaker', 'smart watch', 'beauty',
  'hair accessories', 'makeup brush', 'skin care tool', 'stationery', 'notebook', 'school bag', 'umbrella', 'tools', 'office', 'party supplies',
].map((keyword) => ({ keyword, maxCost: null, perRule: 80, enabled: true }));

// Products whose names contain these words are never added (editable in the dashboard).
const DEFAULT_BLOCKED = [
  'sexy', 'lingerie', 'erotic', 'sex', 'vibrator', 'thong', 'nude', 'bikini', 'underwear', 'bra',
  'knife', 'dagger', 'tactical', 'weapon', 'gun', 'pistol', 'rifle', 'ammo', 'bullet', 'airsoft', 'crossbow', 'slingshot',
  'vape', 'e-cigarette', 'cigarette', 'hookah', 'cbd', 'cannabis', 'marijuana', 'weed', 'smoking', 'pipe',
  'alcohol', 'casino', 'gambling', 'drug', 'pill', 'medicine', 'syringe', 'spy camera', 'hidden camera',
  'replica', 'nazi', 'skull',
];

export const DEFAULT_SETTINGS = {
  enabled: true,
  intervalHours: 24,
  myProducts: true,
  autoPublish: true,
  markup: null,              // null = SHOP_MARKUP or 2.5
  maxProducts: 4000,         // cap on CJ products in the shop
  minStock: 50,
  minCost: 0.5,              // skip near-free items that cost more to ship than they earn
  blockedWords: DEFAULT_BLOCKED,
  rules: BROAD_RULES,
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

const blockedMatcher = (words) => {
  const list = (words || []).map((w) => String(w).trim().toLowerCase()).filter(Boolean);
  if (!list.length) return () => false;
  const re = new RegExp(`\\b(${list.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})s?\\b`, 'i');
  return (name) => re.test(String(name || ''));
};

const SETTINGS_VERSION = 2;

export async function getSettings() {
  const { rows } = await pool.query(`SELECT value FROM shop_settings WHERE key = 'catalog'`);
  const saved = rows[0]?.value || {};
  if (rows[0] && saved.version !== SETTINGS_VERSION) {
    // Upgrade from the first, small catalogue: keep the manager's rules and add the broad ones.
    const have = new Set((saved.rules || []).map((r) => r.keyword.toLowerCase()));
    saved.rules = [...(saved.rules || []), ...BROAD_RULES.filter((r) => !have.has(r.keyword))];
    saved.maxProducts = Math.max(Number(saved.maxProducts) || 0, DEFAULT_SETTINGS.maxProducts);
    saved.intervalHours = Math.max(Number(saved.intervalHours) || 0, DEFAULT_SETTINGS.intervalHours);
    delete saved.refreshPerRun;
    saved.version = SETTINGS_VERSION;
    await pool.query(`UPDATE shop_settings SET value = $1, updated_at = now() WHERE key = 'catalog'`, [JSON.stringify(saved)]);
  }
  return { ...DEFAULT_SETTINGS, ...saved, version: SETTINGS_VERSION };
}

export async function saveSettings(input) {
  const cur = await getSettings();
  const num = (v, min, max, d) => { const n = Number(v); return v !== '' && v !== null && Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : d; };
  const next = {
    version: SETTINGS_VERSION,
    enabled: input.enabled !== undefined ? Boolean(input.enabled) : cur.enabled,
    intervalHours: num(input.intervalHours, 1, 168, cur.intervalHours),
    myProducts: input.myProducts !== undefined ? Boolean(input.myProducts) : cur.myProducts,
    autoPublish: input.autoPublish !== undefined ? Boolean(input.autoPublish) : cur.autoPublish,
    markup: input.markup === null || input.markup === '' ? null : num(input.markup, 1, 10, cur.markup),
    maxProducts: num(input.maxProducts, 1, 20000, cur.maxProducts),
    minStock: num(input.minStock, 0, 100000, cur.minStock),
    minCost: num(input.minCost, 0, 1000, cur.minCost),
    blockedWords: Array.isArray(input.blockedWords)
      ? [...new Set(input.blockedWords.map((w) => String(w).trim().toLowerCase()).filter((w) => w.length >= 2))].slice(0, 300)
      : cur.blockedWords,
    rules: Array.isArray(input.rules)
      ? input.rules.map((r) => ({
        keyword: String(r.keyword || '').trim().slice(0, 60),
        maxCost: r.maxCost === '' || r.maxCost === null || r.maxCost === undefined ? null : num(r.maxCost, 0.1, 1000, null),
        perRule: num(r.perRule, 1, 1000, 50),
        enabled: r.enabled !== false,
      })).filter((r) => r.keyword.length >= 2).slice(0, 100)
      : cur.rules,
  };
  await pool.query(
    `INSERT INTO shop_settings (key, value, updated_at) VALUES ('catalog', $1, now())
     ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = now()`, [JSON.stringify(next)]);
  return next;
}

// Add or update a product from listing data only (no details call).
async function upsertListing(item, { markup, publish, source }) {
  const cost = Number(item.cost);
  const price = retailFromCost(cost, markup);
  const r = await pool.query(
    `UPDATE products SET cost = $2,
       price = CASE WHEN jsonb_array_length(variants) = 0 THEN $3 ELSE price END,
       image_url = COALESCE(image_url, $4), category = COALESCE($5, category), listed_num = COALESCE($6, listed_num),
       last_synced_at = now(), updated_at = now()
     WHERE cj_pid = $1 RETURNING id`,
    [item.pid, cost, price, item.image || null, item.category || null, item.listed ?? null]);
  if (r.rowCount) return false;
  const name = String(item.name || 'Product').slice(0, 150);
  await pool.query(
    `INSERT INTO products (name, slug, description, price, image_url, stock_quantity, status, created_by, source, cj_pid, images,
       variants, cost, ship_from, last_synced_at, auto_source, category, listed_num)
     VALUES ($1,$2,'',$3,$4,0,$5,'CJ sync','cj',$6,$7,'[]',$8,$9,now(),$10,$11,$12)
     ON CONFLICT DO NOTHING`,
    [name, await uniqueSlug(slugify(name)), price, item.image || null, publish ? 'active' : 'inactive', item.pid,
      JSON.stringify(item.image ? [item.image] : []), cost, shipFrom(), source, item.category || null, item.listed ?? null]);
  return true;
}

// Full details for one CJ product (options, photos, description). Returns { row, created }.
export async function upsertCjProduct(pid, { markup, publish = true, source = 'manual', createdBy = 'CJ sync', name } = {}) {
  const m = markup || (await getSettings()).markup || defaultMarkup();
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
         description = CASE WHEN COALESCE(description, '') = '' THEN $7 ELSE description END,
         sync_note = CASE WHEN sync_note LIKE 'CJ:%' THEN NULL ELSE sync_note END,
         details_loaded_at = now(), last_synced_at = now(), updated_at = now() WHERE id = $1 RETURNING *`,
      [existing.id, JSON.stringify(variants), cost, price, JSON.stringify(p.images), p.images[0] || null, plainText(p.description)]);
    return { row: r.rows[0], created: false };
  }
  const title = name || p.name;
  const r = await pool.query(
    `INSERT INTO products (name, slug, description, price, image_url, stock_quantity, status, created_by, source, cj_pid, images, variants,
       cost, ship_from, last_synced_at, details_loaded_at, auto_source)
     VALUES ($1,$2,$3,$4,$5,0,$6,$7,'cj',$8,$9,$10,$11,$12,now(),now(),$13) RETURNING *`,
    [title, await uniqueSlug(slugify(title)), plainText(p.description), price, p.images[0] || null, publish ? 'active' : 'inactive',
      createdBy, pid, JSON.stringify(p.images), JSON.stringify(variants), cost, shipFrom(), source]);
  return { row: r.rows[0], created: true };
}

const GONE = /not exist|not found|no orderable|off.?sale|removed|下架|不存在/i;

// Make sure a CJ product has fresh details. Returns the up-to-date row, or null if CJ no longer sells it.
// If CJ is busy or unreachable, the cached row is returned so the shop keeps working.
export async function ensureDetails(row, maxAgeHours = 72) {
  if (!row || row.source !== 'cj' || !isCjConfigured()) return row;
  const fresh = row.details_loaded_at && Date.now() - new Date(row.details_loaded_at).getTime() < maxAgeHours * 3600 * 1000;
  if (fresh && (row.variants || []).length) return row;
  try {
    return (await upsertCjProduct(row.cj_pid)).row;
  } catch (err) {
    if (GONE.test(err.message) || err.code === 1601000) {
      await pool.query(`UPDATE products SET status = 'inactive', sync_note = $2, updated_at = now() WHERE id = $1`, [row.id, `CJ: ${err.message}`]);
      return null;
    }
    console.warn(`CJ details for ${row.cj_pid} unavailable:`, err.message);
    return row;
  }
}

let running = false;
let progress = null;

export async function runCatalogSync(trigger = 'schedule') {
  if (!isCjConfigured()) throw new Error('CJ is not connected (CJ_API_KEY is missing).');
  if (running) throw new Error('A catalogue sync is already running.');
  running = true;
  progress = { stage: 'starting', added: 0, seen: 0 };
  const run = (await pool.query(`INSERT INTO shop_sync_runs (trigger) VALUES ($1) RETURNING id`, [trigger])).rows[0];
  const stats = { added: 0, updated: 0, hidden: 0, errors: [] };
  const note = (msg) => { if (stats.errors.length < 30) stats.errors.push(msg); };
  try {
    const settings = await getSettings();
    const markup = settings.markup || defaultMarkup();
    const blocked = blockedMatcher(settings.blockedWords);
    let total = Number((await pool.query(`SELECT count(*) FROM products WHERE source = 'cj'`)).rows[0].count);
    const seenThisRun = new Set();
    const consider = async (item, source) => {
      if (!item.pid || seenThisRun.has(item.pid)) return 'dup';
      seenThisRun.add(item.pid);
      progress.seen += 1;
      if (blocked(item.name)) return 'blocked';
      if (!(item.cost > 0) || item.cost < settings.minCost) return 'skip';
      const isNew = !(await pool.query('SELECT 1 FROM products WHERE cj_pid = $1', [item.pid])).rowCount;
      if (isNew && total >= settings.maxProducts) return 'full';
      const created = await upsertListing(item, { markup, publish: settings.autoPublish, source });
      if (created) { stats.added += 1; total += 1; progress.added = stats.added; } else stats.updated += 1;
      return created ? 'added' : 'updated';
    };

    // 1. My Products in the CJ account.
    if (settings.myProducts) {
      progress.stage = 'My Products';
      const seen = new Set();
      let complete = true;
      try {
        for (let page = 1, pages = 1; page <= Math.min(pages, 40); page += 1) {
          const r = await listMyProducts(page);
          pages = r.totalPages;
          for (const p of r.products) { seen.add(p.pid); await consider(p, 'my-products'); }
        }
      } catch (err) { complete = false; note(`My Products: ${err.message}`); }
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

    // 2. Keyword rules, 100 products per request, most-listed first.
    for (const rule of settings.rules.filter((r) => r.enabled)) {
      if (total >= settings.maxProducts) { note('Product limit reached; raise “Most CJ products in the shop” to add more.'); break; }
      progress.stage = `“${rule.keyword}”`;
      let taken = 0;
      try {
        for (let page = 1, pages = 1; page <= Math.min(pages, 10) && taken < rule.perRule && total < settings.maxProducts; page += 1) {
          const filters = { orderBy: 1, sort: 'desc', size: 100,
            ...(settings.minStock ? { startWarehouseInventory: settings.minStock } : {}),
            ...(rule.maxCost ? { endSellPrice: rule.maxCost } : {}) };
          const r = await searchProducts(rule.keyword, page, filters);
          pages = r.totalPages;
          if (!r.products.length) break;
          for (const p of r.products) {
            if (taken >= rule.perRule) break;
            if (rule.maxCost && p.cost && p.cost > rule.maxCost) continue;
            const result = await consider(p, `rule:${rule.keyword}`);
            if (result === 'added' || result === 'updated') taken += 1;
            if (result === 'full') break;
          }
        }
      } catch (err) {
        note(`Rule “${rule.keyword}”: ${err.message}`);
        if (/point|quota|insufficient|frozen/i.test(err.message)) { note('Stopped: CJ API points are used up for now.'); break; }
      }
    }

    // 3. Take blocked items off sale if the word list changed.
    const hiddenBlocked = await pool.query(`SELECT id, name FROM products WHERE source = 'cj' AND status = 'active'`);
    const toHide = hiddenBlocked.rows.filter((r) => blocked(r.name)).map((r) => r.id);
    if (toHide.length) {
      const h = await pool.query(`UPDATE products SET status = 'inactive', sync_note = 'Matches a blocked word' WHERE id = ANY($1)`, [toHide]);
      stats.hidden += h.rowCount;
    }
  } finally {
    running = false;
    progress = null;
    await pool.query(`UPDATE shop_sync_runs SET finished_at = now(), added = $2, updated = $3, hidden = $4, errors = $5 WHERE id = $1`,
      [run.id, stats.added, stats.updated, stats.hidden, stats.errors]);
  }
  return stats;
}

// Called every 15 minutes; runs a sync when the interval has passed (sooner after a failed or empty run).
export async function maybeRunScheduledSync() {
  if (!isCjConfigured() || running) return;
  const s = await getSettings();
  if (!s.enabled) return;
  const { rows } = await pool.query(
    `SELECT started_at, added, cardinality(errors) AS problems,
            (SELECT count(*) FROM products WHERE source = 'cj' AND status = 'active')::int AS on_sale
     FROM shop_sync_runs ORDER BY started_at DESC LIMIT 1`);
  const lastRun = rows[0];
  const since = lastRun ? Date.now() - new Date(lastRun.started_at).getTime() : Infinity;
  const struggling = lastRun && (lastRun.on_sale === 0 || (lastRun.problems > 0 && lastRun.added === 0));
  if (since < s.intervalHours * 3600 * 1000 && !(struggling && since >= 15 * 60 * 1000)) return;
  await runCatalogSync('schedule');
}

export const isSyncRunning = () => running;
export const syncProgress = () => progress;
