import express from 'express';
import crypto from 'crypto';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { stripe, siteUrl, isStripeConfigured } from '../utils/stripe.js';
import {
  isCjConfigured, shipFrom, searchProducts, getProduct, freightQuote, createOrder, getOrder, getBalance,
} from '../utils/cj.js';
import { sendBulkEmail, isEmailConfigured } from '../utils/resend.js';
import {
  retailFromCost, upsertCjProduct, getSettings, saveSettings, runCatalogSync, isSyncRunning,
} from '../services/catalogSync.js';
import { buildLetterheadEmail, textToHtml } from '../utils/letterhead.js';

// Campaign shop, fulfilled by CJdropshipping. Profit from every order funds the campaign.
//
// Environment (backend):
//   CJ_API_KEY            CJ API key (required for CJ products)
//   CJ_AUTO_PAY           'true' (default): pay CJ from the CJ wallet balance as soon as the customer pays.
//                         'false': create the CJ order only; pay it in the CJ dashboard.
//   CJ_SHIP_FROM          warehouse country for quotes and orders (default CN)
//   SHOP_MARKUP           default retail multiplier on CJ cost when importing (default 2.5)
//   SHOP_CURRENCY         currency for prices and card payments (default usd; CJ costs are in USD)
//   STRIPE_SECRET_KEY     card payments (shared with donations; webhook goes to /api/donations/webhook)
//   SITE_URL              public website address for return links

const router = express.Router();
const MANAGERS = ['shop-manager', 'head-office'];
const currency = () => (process.env.SHOP_CURRENCY || 'usd').toLowerCase();
const autoPay = () => String(process.env.CJ_AUTO_PAY || 'true').toLowerCase() !== 'false';
const defaultMarkup = () => Math.max(1, Number(process.env.SHOP_MARKUP) || 2.5);
const money = (n) => Math.round(Number(n || 0) * 100) / 100;
const clean = (v, max = 200) => (v === undefined || v === null ? null : String(v).trim().slice(0, max) || null);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PUBLIC_STATUS = {
  pending_payment: 'Awaiting payment',
  paid: 'Payment received',
  with_supplier: 'Being prepared',
  awaiting_supplier_payment: 'Being prepared',
  needs_attention: 'Being prepared',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

// ---------- helpers ----------

// Resolve cart lines against the database. Never trusts prices sent by the browser.
async function resolveItems(lines) {
  if (!Array.isArray(lines) || !lines.length) throw new Error('Your cart is empty.');
  if (lines.length > 30) throw new Error('Too many different items in one order.');
  const ids = [...new Set(lines.map((l) => Number(l.product_id)).filter(Boolean))];
  const { rows } = await pool.query(`SELECT * FROM products WHERE id = ANY($1) AND status = 'active'`, [ids]);
  const byId = new Map(rows.map((r) => [r.id, r]));
  return lines.map((l) => {
    const p = byId.get(Number(l.product_id));
    if (!p) throw new Error('An item in your cart is no longer available. Please remove it and try again.');
    const quantity = Math.min(Math.max(parseInt(l.quantity, 10) || 1, 1), 20);
    if (p.source === 'cj') {
      const v = (p.variants || []).find((x) => x.vid === l.vid && x.active !== false);
      if (!v) throw new Error(`Please choose an available option for “${p.name}”.`);
      return {
        product_id: p.id, name: p.name, variant: v.name, vid: v.vid, sku: v.sku, quantity,
        unit_price: money(v.price), unit_cost: money(v.cost), image: v.image || p.image_url, fulfilment: 'cj',
      };
    }
    return {
      product_id: p.id, name: p.name, variant: null, vid: null, sku: null, quantity,
      unit_price: money(p.price), unit_cost: money(p.cost || 0), image: p.image_url, fulfilment: 'manual',
    };
  });
}

async function shippingOptions(countryCode, items) {
  const cjItems = items.filter((i) => i.fulfilment === 'cj');
  if (!cjItems.length) return [{ name: 'Delivered by the campaign team', cost: 0, price: 0, days: null }];
  const opts = await freightQuote(countryCode, cjItems.map((i) => ({ vid: i.vid, quantity: i.quantity })));
  // Customers pay CJ's shipping cost, rounded up to the next 10 cents.
  return opts.slice(0, 5).map((o) => ({ ...o, price: Math.ceil(o.cost * 10) / 10 }));
}

function orderNumber() {
  const d = new Date();
  return `VK${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

const itemsText = (items) => items.map((i) => `• ${i.quantity} × ${i.name}${i.variant ? ` (${i.variant})` : ''} — ${(i.unit_price * i.quantity).toFixed(2)}`).join('\n');

async function emailCustomer(order, subject, message) {
  if (!isEmailConfigured()) return;
  try {
    await sendBulkEmail({
      recipients: [{ email: order.customer_email, name: order.customer_name }],
      subject,
      buildHtml: (r) => buildLetterheadEmail({ recipientName: r.name, subject, bodyHtml: textToHtml(message) }),
    });
  } catch (err) {
    console.error('Shop email failed:', err.message);
  }
}

// Notify the team through the dashboard inbox.
async function notifyTeam(order, title, text) {
  try {
    await pool.query(
      `INSERT INTO inbox_messages (source, form_type, from_name, from_email, subject, text_body, fields)
       VALUES ('website','shop',$1,$2,$3,$4,$5)`,
      [order.customer_name, order.customer_email, title, text,
        { order: order.order_number, total: `${order.total} ${order.currency.toUpperCase()}`, status: order.status }]
    );
  } catch (err) {
    console.error('Shop inbox notice failed:', err.message);
  }
}

const CJ_TO_STATUS = {
  CREATED: 'awaiting_supplier_payment', IN_CART: 'awaiting_supplier_payment', UNPAID: 'awaiting_supplier_payment',
  PENDING: 'with_supplier', PROCESSING: 'with_supplier', UNSHIPPED: 'with_supplier',
  SHIPPED: 'shipped', DELIVERED: 'delivered', CANCELLED: 'cancelled',
};

// Send a paid order to CJ. Safe to call again for orders that failed.
export async function fulfilOrder(orderId) {
  const { rows } = await pool.query('SELECT * FROM shop_orders WHERE id = $1', [orderId]);
  const order = rows[0];
  if (!order || order.cj_order_id) return order;
  const cjItems = order.items.filter((i) => i.fulfilment === 'cj');
  const manual = order.items.filter((i) => i.fulfilment !== 'cj');
  if (!cjItems.length) {
    const r = await pool.query(`UPDATE shop_orders SET status = 'needs_attention', supplier_error = $2, updated_at = now() WHERE id = $1 RETURNING *`,
      [order.id, 'All items in this order are sent by the campaign team.']);
    return r.rows[0];
  }
  try {
    const data = await createOrder({
      orderNumber: order.order_number,
      shippingCountryCode: order.country_code,
      shippingCountry: order.country_name,
      shippingProvince: order.province,
      shippingCity: order.city,
      shippingAddress: order.address_line1,
      shippingAddress2: order.address_line2 || '',
      shippingZip: order.postal_code || '',
      shippingCustomerName: order.customer_name,
      shippingPhone: order.customer_phone || '',
      email: order.customer_email,
      logisticName: order.shipping_method,
      fromCountryCode: shipFrom(),
      payType: autoPay() ? 2 : 3,
      shopAmount: String(order.total),
      remark: `Vincent Kafula campaign shop ${order.order_number}`,
      products: cjItems.map((i, n) => ({ vid: i.vid, quantity: i.quantity, storeLineItemId: `${order.order_number}-${n + 1}` })),
    });
    const intercepted = (data?.interceptOrderReasons || []).map((r) => r.message).filter(Boolean);
    const status = intercepted.length ? 'needs_attention' : CJ_TO_STATUS[data?.orderStatus] || (autoPay() ? 'with_supplier' : 'awaiting_supplier_payment');
    const notes = [manual.length ? `Send by hand: ${manual.map((i) => `${i.quantity} × ${i.name}`).join(', ')}` : null].filter(Boolean).join(' ');
    const r = await pool.query(
      `UPDATE shop_orders SET cj_order_id = $2, cj_status = $3, cj_product_cost = $4, cj_shipping_cost = $5, cj_total = $6,
         status = $7, supplier_error = $8, notes = COALESCE(NULLIF($9,''), notes), updated_at = now() WHERE id = $1 RETURNING *`,
      [order.id, data?.orderId || null, data?.orderStatus || null, money(data?.productAmount) || null, money(data?.postageAmount) || null,
        money(data?.actualPayment || data?.orderAmount) || null, status, intercepted.join('; ') || null, notes]
    );
    return r.rows[0];
  } catch (err) {
    console.error(`CJ order failed for ${order.order_number}:`, err.message);
    const r = await pool.query(`UPDATE shop_orders SET status = 'needs_attention', supplier_error = $2, updated_at = now() WHERE id = $1 RETURNING *`,
      [order.id, `CJ: ${err.message}`]);
    await notifyTeam(r.rows[0], `Shop order ${order.order_number} needs attention`,
      `The order was paid but could not be sent to CJdropshipping.\nReason: ${err.message}\nOpen the Shop Manager dashboard and press “Send to CJ again”.`);
    return r.rows[0];
  }
}

// Mark a Stripe session paid (idempotent) and fulfil it.
async function handlePaidSession(session) {
  const claimed = await pool.query(
    `UPDATE shop_orders SET status = 'paid', paid_at = now(), stripe_payment_intent = $2, updated_at = now()
     WHERE stripe_session_id = $1 AND status = 'pending_payment' RETURNING *`,
    [session.id, typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id || null]
  );
  const order = claimed.rows[0];
  if (!order) return null; // already handled

  // Record the real card fee so the profit figure is exact.
  try {
    const full = await stripe('GET', `/checkout/sessions/${session.id}?expand[]=payment_intent.latest_charge.balance_transaction`);
    const fee = full.payment_intent?.latest_charge?.balance_transaction?.fee;
    if (Number.isFinite(fee)) await pool.query('UPDATE shop_orders SET payment_fee = $2 WHERE id = $1', [order.id, fee / 100]);
  } catch (err) {
    console.warn('Could not read the Stripe fee:', err.message);
  }

  await emailCustomer(order, `Order ${order.order_number} confirmed`,
    `Thank you for your order. Every purchase helps fund the campaign.\n\nOrder number: ${order.order_number}\n${itemsText(order.items)}\nShipping (${order.shipping_method}): ${Number(order.shipping_charged).toFixed(2)}\nTotal paid: ${Number(order.total).toFixed(2)} ${order.currency.toUpperCase()}\n\nWe will email you the tracking number as soon as your order ships.`);
  const done = await fulfilOrder(order.id);
  await notifyTeam(done || order, `New shop order ${order.order_number}`,
    `${order.customer_name} paid ${Number(order.total).toFixed(2)} ${order.currency.toUpperCase()}.\n${itemsText(order.items)}\nShip to: ${order.city}, ${order.country_name}\nSupplier status: ${(done || order).status}${(done || order).supplier_error ? ` — ${(done || order).supplier_error}` : ''}`);
  return done;
}

export async function handleShopCheckoutEvent(event) {
  const session = event.data.object;
  if (['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(event.type) && session.payment_status === 'paid') {
    await handlePaidSession(session);
  } else if (['checkout.session.expired', 'checkout.session.async_payment_failed'].includes(event.type)) {
    await pool.query(`UPDATE shop_orders SET status = 'cancelled', updated_at = now() WHERE stripe_session_id = $1 AND status = 'pending_payment'`, [session.id]);
  }
}

// Pull status and tracking from CJ for open orders.
export async function syncOpenOrders() {
  if (!isCjConfigured()) return { checked: 0, updated: 0 };
  const { rows } = await pool.query(
    `SELECT * FROM shop_orders WHERE cj_order_id IS NOT NULL AND status IN ('with_supplier','awaiting_supplier_payment','needs_attention','shipped')
     ORDER BY updated_at ASC LIMIT 50`);
  let updated = 0;
  for (const o of rows) {
    try {
      const d = await getOrder(o.cj_order_id);
      const status = CJ_TO_STATUS[d?.orderStatus] || o.status;
      const r = await pool.query(
        `UPDATE shop_orders SET cj_status = $2, status = $3, tracking_number = COALESCE($4, tracking_number), logistic_name = COALESCE($5, logistic_name),
           cj_product_cost = COALESCE($6, cj_product_cost), cj_shipping_cost = COALESCE($7, cj_shipping_cost), cj_total = COALESCE($8, cj_total),
           supplier_error = CASE WHEN $3 <> 'needs_attention' THEN NULL ELSE supplier_error END, updated_at = now()
         WHERE id = $1 RETURNING *`,
        [o.id, d?.orderStatus || null, status, d?.trackNumber || null, d?.logisticName || null,
          d?.productAmount != null ? money(d.productAmount) : null, d?.postageAmount != null ? money(d.postageAmount) : null,
          d?.orderAmount != null ? money(d.orderAmount) : null]
      );
      const n = r.rows[0];
      if (n.status !== o.status || n.tracking_number !== o.tracking_number) updated += 1;
      if (n.tracking_number && !n.tracking_emailed_at) {
        await emailCustomer(n, `Your order ${n.order_number} has shipped`,
          `Good news — your order is on its way.\n\nCarrier: ${n.logistic_name || n.shipping_method}\nTracking number: ${n.tracking_number}\n\nYou can follow it at https://www.17track.net/en/track?nums=${encodeURIComponent(n.tracking_number)}\n\nThank you for supporting the campaign.`);
        await pool.query('UPDATE shop_orders SET tracking_emailed_at = now() WHERE id = $1', [n.id]);
      }
    } catch (err) {
      console.warn(`CJ sync failed for ${o.order_number}:`, err.message);
    }
  }
  return { checked: rows.length, updated };
}

// Profit per order: what the customer paid, minus the supplier bill (or the estimate before CJ bills it), minus card fees.
const PROFIT_SQL = `(total - COALESCE(cj_total, estimated_cost) - COALESCE(payment_fee, round(total * 0.034 + 0.3, 2)))`;
const COUNTED = `status NOT IN ('pending_payment','cancelled','refunded')`;

// ---------- public ----------

router.get('/config', (req, res) => {
  res.json({ checkout: isStripeConfigured(), supplier: isCjConfigured(), currency: currency() });
});

// Campaign total raised by the shop (for public display).
router.get('/fund', async (req, res) => {
  const { rows } = await pool.query(`SELECT COALESCE(sum(${PROFIT_SQL}),0)::numeric(12,2) AS raised, count(*)::int AS orders FROM shop_orders WHERE ${COUNTED}`);
  res.json({ raised: Number(rows[0].raised), orders: rows[0].orders, currency: currency() });
});

router.post('/quote', async (req, res) => {
  try {
    const country = String(req.body?.country || '').toUpperCase();
    if (!/^[A-Z]{2}$/.test(country)) return res.status(400).json({ error: 'Choose the country to deliver to.' });
    const items = await resolveItems(req.body?.items);
    const options = await shippingOptions(country, items);
    if (!options.length) return res.status(422).json({ error: 'Sorry, these items cannot be delivered to that country at the moment.' });
    const subtotal = money(items.reduce((s, i) => s + i.unit_price * i.quantity, 0));
    res.json({ items, subtotal, options: options.map(({ name, price, days }) => ({ name, price, days })), currency: currency() });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Could not calculate shipping.' });
  }
});

router.post('/checkout', async (req, res) => {
  try {
    if (!isStripeConfigured()) return res.status(503).json({ error: 'Card payments are not available yet. Please try again later.' });
    const b = req.body || {};
    const c = b.customer || {};
    const a = b.address || {};
    const customer = { name: clean(c.name, 100), email: clean(c.email, 200)?.toLowerCase(), phone: clean(c.phone, 30) };
    const address = {
      line1: clean(a.line1, 300), line2: clean(a.line2, 300), city: clean(a.city, 100), province: clean(a.province, 100),
      postal: clean(a.postal_code, 20), code: String(a.country_code || '').toUpperCase(), country: clean(a.country_name, 100),
    };
    if (!customer.name || !customer.email || !EMAIL_RE.test(customer.email)) return res.status(400).json({ error: 'Enter your full name and a valid email address.' });
    if (!customer.phone) return res.status(400).json({ error: 'Enter a phone number for the courier.' });
    if (!address.line1 || !address.city || !address.province || !/^[A-Z]{2}$/.test(address.code) || !address.country) {
      return res.status(400).json({ error: 'Complete the delivery address.' });
    }
    const base = siteUrl(req);
    if (!base) return res.status(500).json({ error: 'The website address is not configured (SITE_URL).' });

    const items = await resolveItems(b.items);
    const options = await shippingOptions(address.code, items);
    const chosen = options.find((o) => o.name === b.shipping_method) || options[0];
    if (!chosen) return res.status(422).json({ error: 'Sorry, these items cannot be delivered to that country at the moment.' });

    const subtotal = money(items.reduce((s, i) => s + i.unit_price * i.quantity, 0));
    const total = money(subtotal + chosen.price);
    const estimatedCost = money(items.reduce((s, i) => s + i.unit_cost * i.quantity, 0) + chosen.cost);
    const number = orderNumber();

    const { rows } = await pool.query(
      `INSERT INTO shop_orders (order_number, customer_name, customer_email, customer_phone, address_line1, address_line2, city, province,
         postal_code, country_code, country_name, items, shipping_method, currency, subtotal, shipping_charged, total, estimated_cost)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) RETURNING id`,
      [number, customer.name, customer.email, customer.phone, address.line1, address.line2, address.city, address.province,
        address.postal, address.code, address.country, JSON.stringify(items), chosen.name, currency(), subtotal, chosen.price, total, estimatedCost]
    );

    const lineItems = items.map((i) => ({
      quantity: i.quantity,
      price_data: {
        currency: currency(),
        unit_amount: Math.round(i.unit_price * 100),
        product_data: { name: i.variant ? `${i.name} — ${i.variant}` : i.name, ...(i.image ? { images: [i.image] } : {}) },
      },
    }));
    if (chosen.price > 0) {
      lineItems.push({ quantity: 1, price_data: { currency: currency(), unit_amount: Math.round(chosen.price * 100), product_data: { name: `Shipping — ${chosen.name}${chosen.days ? ` (${chosen.days} days)` : ''}` } } });
    }
    const session = await stripe('POST', '/checkout/sessions', {
      mode: 'payment',
      customer_email: customer.email,
      line_items: lineItems,
      metadata: { kind: 'shop', order_number: number },
      payment_intent_data: { metadata: { kind: 'shop', order_number: number } },
      success_url: `${base}/order_received?order=${number}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/checkout?cancelled=1`,
    });
    await pool.query('UPDATE shop_orders SET stripe_session_id = $2 WHERE id = $1', [rows[0].id, session.id]);
    res.json({ url: session.url, order_number: number });
  } catch (err) {
    console.error('Shop checkout error:', err);
    res.status(400).json({ error: err.message || 'The payment page could not be opened.' });
  }
});

// Confirm on return from Stripe (does not rely on the webhook arriving first).
router.get('/session/:id', async (req, res) => {
  try {
    if (!/^cs_[A-Za-z0-9_]+$/.test(req.params.id)) return res.status(400).json({ error: 'Invalid session' });
    const session = await stripe('GET', `/checkout/sessions/${req.params.id}`);
    if (session.metadata?.kind !== 'shop') return res.status(404).json({ error: 'Not a shop order' });
    if (session.payment_status === 'paid') await handlePaidSession(session);
    const { rows } = await pool.query('SELECT * FROM shop_orders WHERE stripe_session_id = $1', [session.id]);
    const o = rows[0];
    if (!o) return res.status(404).json({ error: 'Order not found' });
    res.json({
      order_number: o.order_number, status: PUBLIC_STATUS[o.status] || o.status, paid: Boolean(o.paid_at),
      items: o.items.map(({ name, variant, quantity, unit_price, image }) => ({ name, variant, quantity, unit_price, image })),
      subtotal: Number(o.subtotal), shipping: Number(o.shipping_charged), total: Number(o.total), currency: o.currency,
      shipping_method: o.shipping_method, email: o.customer_email,
    });
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: 'Could not confirm the order.' });
  }
});

// Order tracking for customers: order number + the email used at checkout.
router.get('/track', async (req, res) => {
  const number = String(req.query.order || '').trim().toUpperCase();
  const email = String(req.query.email || '').trim().toLowerCase();
  if (!number || !email) return res.status(400).json({ error: 'Enter your order number and email address.' });
  const { rows } = await pool.query('SELECT * FROM shop_orders WHERE order_number = $1 AND customer_email = $2', [number, email]);
  const o = rows[0];
  if (!o) return res.status(404).json({ error: 'No order found with that number and email address.' });
  res.json({
    order_number: o.order_number, status: PUBLIC_STATUS[o.status] || o.status, placed: o.created_at,
    items: o.items.map(({ name, variant, quantity }) => ({ name, variant, quantity })),
    total: Number(o.total), currency: o.currency, carrier: o.logistic_name || o.shipping_method, tracking_number: o.tracking_number,
  });
});

// ---------- manager ----------

router.get('/admin/status', requireAuth(MANAGERS), async (req, res) => {
  const out = {
    stripe: isStripeConfigured(), cj: { configured: isCjConfigured(), connected: false, balance: null, error: null },
    settings: { currency: currency(), markup: defaultMarkup(), autoPay: autoPay(), shipFrom: shipFrom() },
  };
  if (isCjConfigured()) {
    try { out.cj.balance = await getBalance(); out.cj.connected = true; } catch (err) { out.cj.error = err.message; }
  }
  res.json(out);
});

router.get('/admin/summary', requireAuth(MANAGERS), async (req, res) => {
  const q = (where) => pool.query(
    `SELECT count(*)::int AS orders, COALESCE(sum(total),0)::numeric(12,2) AS revenue,
            COALESCE(sum(COALESCE(cj_total, estimated_cost)),0)::numeric(12,2) AS supplier,
            COALESCE(sum(COALESCE(payment_fee, round(total * 0.034 + 0.3, 2))),0)::numeric(12,2) AS fees,
            COALESCE(sum(${PROFIT_SQL}),0)::numeric(12,2) AS profit
     FROM shop_orders WHERE ${COUNTED} ${where}`);
  const [all, month, attention] = await Promise.all([
    q(''), q(`AND paid_at >= date_trunc('month', now())`),
    pool.query(`SELECT count(*)::int AS n FROM shop_orders WHERE status IN ('needs_attention','awaiting_supplier_payment')`),
  ]);
  const num = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, Number(v)]));
  res.json({ all: num(all.rows[0]), month: num(month.rows[0]), attention: attention.rows[0].n, currency: currency() });
});

router.get('/admin/cj/search', requireAuth(MANAGERS), async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    if (q.length < 2) return res.status(400).json({ error: 'Type at least two letters to search.' });
    const result = await searchProducts(q, Math.max(1, parseInt(req.query.page, 10) || 1));
    const { rows } = await pool.query('SELECT cj_pid FROM products WHERE cj_pid = ANY($1)', [result.products.map((p) => p.pid)]);
    const imported = new Set(rows.map((r) => r.cj_pid));
    res.json({ ...result, products: result.products.map((p) => ({ ...p, imported: imported.has(p.pid), suggested_price: p.cost ? retailFromCost(p.cost) : null })) });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

router.get('/admin/cj/product/:pid', requireAuth(MANAGERS), async (req, res) => {
  try {
    const p = await getProduct(req.params.pid);
    res.json({ ...p, variants: p.variants.map((v) => ({ ...v, suggested_price: retailFromCost(v.cost) })) });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// Import (or refresh) a CJ product into the shop by hand.
router.post('/admin/cj/import', requireAuth(MANAGERS), async (req, res) => {
  try {
    const pid = clean(req.body?.pid, 100);
    if (!pid) return res.status(400).json({ error: 'Missing product id.' });
    const markup = Math.max(1, Number(req.body?.markup) || defaultMarkup());
    const { row, created } = await upsertCjProduct(pid, {
      markup, publish: req.body?.publish !== false, source: 'manual', createdBy: req.user.display_name, name: clean(req.body?.name, 150),
    });
    res.status(created ? 201 : 200).json(row);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: err.message });
  }
});

// Automatic catalogue settings and runs.
router.get('/admin/catalog', requireAuth(MANAGERS), async (req, res) => {
  const [settings, runs, counts] = await Promise.all([
    getSettings(),
    pool.query('SELECT * FROM shop_sync_runs ORDER BY started_at DESC LIMIT 10'),
    pool.query(`SELECT count(*) FILTER (WHERE status = 'active')::int AS on_sale, count(*)::int AS total,
                       count(*) FILTER (WHERE auto_source = 'my-products')::int AS my_products,
                       count(*) FILTER (WHERE auto_source LIKE 'rule:%')::int AS from_rules
                FROM products WHERE source = 'cj'`),
  ]);
  res.json({ settings, runs: runs.rows, counts: counts.rows[0], running: isSyncRunning(), defaultMarkup: defaultMarkup() });
});

router.put('/admin/catalog', requireAuth(MANAGERS), async (req, res) => {
  try { res.json(await saveSettings(req.body || {})); } catch (err) { res.status(400).json({ error: err.message }); }
});

router.post('/admin/catalog/run', requireAuth(MANAGERS), async (req, res) => {
  try { res.json(await runCatalogSync(`manual: ${req.user.display_name}`)); } catch (err) { res.status(409).json({ error: err.message }); }
});

// Refresh CJ costs for one product, keeping the shop's retail prices.
router.post('/admin/products/:id/sync', requireAuth(MANAGERS), async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM products WHERE id = $1 AND source = 'cj'`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Not a CJ product' });
    const p = await getProduct(rows[0].cj_pid);
    const old = new Map((rows[0].variants || []).map((v) => [v.vid, v]));
    const variants = p.variants.map((v) => {
      const prev = old.get(v.vid);
      return { ...v, price: prev?.price ?? retailFromCost(v.cost), price_locked: prev?.price_locked || false, active: prev ? prev.active !== false : true };
    });
    const active = variants.filter((v) => v.active);
    const r = await pool.query(
      `UPDATE products SET variants = $2, cost = $3, price = $4, last_synced_at = now(), updated_at = now() WHERE id = $1 RETURNING *`,
      [rows[0].id, JSON.stringify(variants), Math.min(...variants.map((v) => v.cost)), Math.min(...(active.length ? active : variants).map((v) => v.price))]);
    res.json(r.rows[0]);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// Set retail prices / switch options on or off.
router.patch('/admin/products/:id/variants', requireAuth(MANAGERS), async (req, res) => {
  try {
  const { rows } = await pool.query(`SELECT * FROM products WHERE id = $1 AND source = 'cj'`, [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Not a CJ product' });
  const changes = new Map((req.body?.variants || []).map((v) => [v.vid, v]));
  const variants = (rows[0].variants || []).map((v) => {
    const c = changes.get(v.vid);
    if (!c) return v;
    const price = c.price !== undefined ? money(c.price) : v.price;
    if (!(price > 0)) throw new Error('Prices must be above zero.');
    return { ...v, price, price_locked: c.price !== undefined ? true : v.price_locked, active: c.active !== undefined ? Boolean(c.active) : v.active };
  });
  const active = variants.filter((v) => v.active !== false);
  if (!active.length) return res.status(400).json({ error: 'Keep at least one option on sale, or unpublish the product instead.' });
  const r = await pool.query(`UPDATE products SET variants = $2, price = $3, updated_at = now() WHERE id = $1 RETURNING *`,
    [rows[0].id, JSON.stringify(variants), Math.min(...active.map((v) => v.price))]);
  res.json(r.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/admin/orders', requireAuth(MANAGERS), async (req, res) => {
  const filter = String(req.query.status || '');
  const where = filter === 'open' ? `WHERE status IN ('paid','with_supplier','awaiting_supplier_payment','needs_attention','shipped')`
    : filter ? 'WHERE status = $1' : `WHERE status <> 'pending_payment'`;
  const { rows } = await pool.query(
    `SELECT *, ${PROFIT_SQL}::numeric(12,2) AS profit FROM shop_orders ${where} ORDER BY created_at DESC LIMIT 200`,
    filter && filter !== 'open' ? [filter] : []);
  res.json(rows);
});

router.post('/admin/orders/:id/retry', requireAuth(MANAGERS), async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM shop_orders WHERE id = $1', [req.params.id]);
  const o = rows[0];
  if (!o) return res.status(404).json({ error: 'Order not found' });
  if (!o.paid_at) return res.status(400).json({ error: 'This order has not been paid.' });
  if (o.cj_order_id) return res.status(400).json({ error: 'This order is already with CJ.' });
  res.json(await fulfilOrder(o.id));
});

router.post('/admin/orders/sync', requireAuth(MANAGERS), async (req, res) => {
  try { res.json(await syncOpenOrders()); } catch (err) { res.status(502).json({ error: err.message }); }
});

router.post('/admin/orders/:id/status', requireAuth(MANAGERS), async (req, res) => {
  const status = String(req.body?.status || '');
  if (!['cancelled', 'refunded', 'delivered', 'shipped', 'with_supplier'].includes(status)) return res.status(400).json({ error: 'Unknown status' });
  const note = clean(req.body?.note, 500);
  const r = await pool.query(
    `UPDATE shop_orders SET status = $2, notes = CASE WHEN $3::text IS NULL THEN notes ELSE concat_ws(E'\\n', notes, $3::text) END, updated_at = now()
     WHERE id = $1 RETURNING *`, [req.params.id, status, note ? `${new Date().toISOString().slice(0, 10)} ${req.user.display_name}: ${note}` : null]);
  if (!r.rows[0]) return res.status(404).json({ error: 'Order not found' });
  res.json(r.rows[0]);
});

export default router;
