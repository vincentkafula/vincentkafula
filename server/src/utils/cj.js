import { pool } from '../db/pool.js';

// CJdropshipping Open API 2.0 client.
// Docs: https://developers.cjdropshipping.com/en/api/api2/
//
// Environment:
//   CJ_API_KEY        API key from My CJ → Authorization → API (required)
//   CJ_SHIP_FROM      default warehouse country for orders and freight quotes (default CN)
//
// CJ allows a new access token only once every 5 minutes, and tokens last 15 days,
// so the token is stored in the database and reused across restarts.

const BASE = 'https://developers.cjdropshipping.com/api2.0/v1';
const DAY = 24 * 60 * 60 * 1000;

export const isCjConfigured = () => Boolean(process.env.CJ_API_KEY);
export const shipFrom = () => (process.env.CJ_SHIP_FROM || 'CN').toUpperCase();

export class CjError extends Error {
  constructor(message, code) { super(message); this.code = code; }
}

// CJ allows one request per second per account. Every call goes through this queue,
// spaced ~1.2 s apart, and is retried with a back-off when CJ still says "Too Many Requests".
const GAP_MS = 1200;
let queue = Promise.resolve();
let lastCall = 0;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function throttled(fn) {
  const run = queue.then(async () => {
    const wait = lastCall + GAP_MS - Date.now();
    if (wait > 0) await sleep(wait);
    lastCall = Date.now();
    return fn();
  });
  queue = run.catch(() => {});
  return run;
}
const isRateLimited = (status, json) => status === 429 || json?.code === 1600200 || /too many requests|qps limit/i.test(json?.message || '');

async function cjFetch(url, init) {
  for (let attempt = 0; ; attempt += 1) {
    const { res, json } = await throttled(async () => {
      const r = await fetch(url, init);
      return { res: r, json: await r.json().catch(() => ({})) };
    });
    if (isRateLimited(res.status, json) && attempt < 4) { await sleep(2000 * (attempt + 1)); continue; }
    return { res, json };
  }
}

let memoryToken = null;
let lastTokenRequest = 0;

async function loadToken() {
  if (memoryToken) return memoryToken;
  const { rows } = await pool.query('SELECT * FROM cj_auth WHERE id = 1');
  memoryToken = rows[0] || null;
  return memoryToken;
}

async function saveToken(d) {
  const row = {
    access_token: d.accessToken,
    access_expires: d.accessTokenExpiryDate ? new Date(d.accessTokenExpiryDate) : new Date(Date.now() + 14 * DAY),
    refresh_token: d.refreshToken,
    refresh_expires: d.refreshTokenExpiryDate ? new Date(d.refreshTokenExpiryDate) : new Date(Date.now() + 170 * DAY),
  };
  await pool.query(
    `INSERT INTO cj_auth (id, access_token, access_expires, refresh_token, refresh_expires, updated_at)
     VALUES (1,$1,$2,$3,$4,now())
     ON CONFLICT (id) DO UPDATE SET access_token = $1, access_expires = $2, refresh_token = $3, refresh_expires = $4, updated_at = now()`,
    [row.access_token, row.access_expires, row.refresh_token, row.refresh_expires]
  );
  memoryToken = row;
  return row;
}

async function rawPost(path, body, token) {
  const { res, json } = await cjFetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { 'CJ-Access-Token': token } : {}) },
    body: JSON.stringify(body),
  });
  if (!res.ok || json.result === false || (json.code && json.code !== 200)) {
    throw new CjError(json.message || `CJ request failed (${res.status})`, json.code);
  }
  return json.data;
}

async function getAccessToken(force = false) {
  if (!isCjConfigured()) throw new CjError('CJ is not connected: add CJ_API_KEY to the backend settings.');
  const t = await loadToken();
  const now = Date.now();
  if (!force && t && new Date(t.access_expires).getTime() - now > DAY) return t.access_token;

  if (t?.refresh_token && new Date(t.refresh_expires).getTime() > now) {
    try {
      return (await saveToken(await rawPost('/authentication/refreshAccessToken', { refreshToken: t.refresh_token }))).access_token;
    } catch (err) {
      console.warn('CJ token refresh failed, requesting a new token:', err.message);
    }
  }
  if (now - lastTokenRequest < 5 * 60 * 1000) {
    throw new CjError('CJ only allows a new login every 5 minutes. Please try again shortly.');
  }
  lastTokenRequest = now;
  return (await saveToken(await rawPost('/authentication/getAccessToken', { apiKey: String(process.env.CJ_API_KEY).trim().replace(/^["']|["']$/g, '') }))).access_token;
}

// Generic call. Retries once with a fresh token if CJ reports an authentication failure.
export async function cj(method, path, { query, body } = {}, retried = false) {
  const token = await getAccessToken();
  const qs = query ? `?${new URLSearchParams(Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== ''))}` : '';
  const { res, json } = await cjFetch(`${BASE}${path}${qs}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'CJ-Access-Token': token },
    body: body ? JSON.stringify(body) : undefined,
  });
  const authFailed = res.status === 401 || [1600001, 1600003].includes(json.code);
  if (authFailed && !retried) {
    memoryToken = null;
    await pool.query('DELETE FROM cj_auth WHERE id = 1').catch(() => {});
    return cj(method, path, { query, body }, true);
  }
  if (!res.ok || json.result === false || (json.code && json.code !== 200)) {
    throw new CjError(json.message || `CJ request failed (${res.status})`, json.code);
  }
  return json.data;
}

const firstNumber = (v) => {
  const m = String(v ?? '').match(/\d+(\.\d+)?/);
  return m ? Number(m[0]) : null;
};

// Search the CJ catalogue by keyword. `filters` may hold any listV2 filter
// (categoryId, startSellPrice, endSellPrice, orderBy, sort, startWarehouseInventory, countryCode, size).
export async function searchProducts(keyword, page = 1, filters = {}) {
  const data = await cj('GET', '/product/listV2', { query: { keyWord: keyword, page, size: 20, features: 'enable_category', ...filters } });
  const content = Array.isArray(data?.content) ? data.content : [];
  const list = content.flatMap((c) => c.productList || []);
  return {
    total: data?.totalRecords ?? list.length,
    products: list.map((p) => ({
      pid: p.id || p.pid,
      name: p.nameEn || p.productNameEn || p.name,
      sku: p.sku || p.productSku,
      image: p.bigImage || p.productImage,
      cost: firstNumber(p.nowPrice) ?? firstNumber(p.sellPrice),
      listed: p.listedNum ?? null,
      stock: p.warehouseInventoryNum ?? null,
      category: p.oneCategoryName || p.twoCategoryName || p.threeCategoryName || null,
    })).filter((p) => p.pid),
    totalPages: Number(data?.totalPages) || 1,
  };
}

// Full product with variants.
export async function getProduct(pid) {
  const p = await cj('GET', '/product/query', { query: { pid } });
  const parseImages = (v) => {
    if (Array.isArray(v)) return v;
    try { const a = JSON.parse(v); return Array.isArray(a) ? a : [v]; } catch { return v ? [v] : []; }
  };
  const images = [...new Set([...parseImages(p.productImageSet), ...parseImages(p.productImage)].filter(Boolean))].slice(0, 8);
  return {
    pid: p.pid,
    name: p.productNameEn || p.productName,
    sku: p.productSku,
    description: p.description || '',
    images,
    weight: firstNumber(p.productWeight),
    variants: (p.variants || []).map((v) => ({
      vid: v.vid,
      name: (v.variantKey || v.variantNameEn || '').replace(/^\s*-\s*/, '') || 'Standard',
      sku: v.variantSku,
      cost: Number(v.variantSellPrice) || 0,
      image: v.variantImage || null,
    })).filter((v) => v.vid),
  };
}

// Shipping options from the warehouse country to the customer's country.
export async function freightQuote(countryCode, items, from = shipFrom()) {
  const data = await cj('POST', '/logistic/freightCalculate', {
    body: { startCountryCode: from, endCountryCode: countryCode, products: items.map((i) => ({ vid: i.vid, quantity: i.quantity })) },
  });
  return (Array.isArray(data) ? data : [])
    .map((o) => ({
      name: o.logisticName,
      cost: Number(o.totalPostageFee ?? o.logisticPrice) || 0,
      days: o.logisticAging || null,
    }))
    .filter((o) => o.name)
    .sort((a, b) => a.cost - b.cost);
}

export async function createOrder(payload) {
  return cj('POST', '/shopping/order/createOrderV2', { body: payload });
}

export async function getOrder(orderId) {
  return cj('GET', '/shopping/order/getOrderDetail', { query: { orderId } });
}

export async function getBalance() {
  const d = await cj('GET', '/shopping/pay/getBalance');
  return { amount: Number(d?.amount ?? 0), frozen: Number(d?.freezeAmount ?? d?.frozenAmount ?? 0) };
}

// Products saved to "My Products" in the CJ account (one page).
export async function listMyProducts(page = 1, size = 50) {
  const data = await cj('GET', '/product/myProduct/query', { query: { pageNumber: page, pageSize: size } });
  const content = Array.isArray(data?.content) ? data.content : [];
  return {
    totalPages: Number(data?.totalPages) || 1,
    products: content.map((p) => ({ pid: p.productId, name: p.nameEn, image: p.bigImage, cost: Number(p.totalPrice || p.sellPrice) || null })).filter((p) => p.pid),
  };
}
