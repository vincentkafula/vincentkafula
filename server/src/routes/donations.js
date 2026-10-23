import express from 'express';
import crypto from 'crypto';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/requireAuth.js';

// Donations via Stripe Checkout.
//
// Environment variables (backend service on Railway):
//   STRIPE_SECRET_KEY       sk_live_... (or sk_test_... while testing) — required
//   STRIPE_WEBHOOK_SECRET   whsec_...   — recommended, from the Stripe webhook endpoint
//   DONATION_CURRENCY       e.g. usd, zar (default usd)
//   SITE_URL                public website address, e.g. https://www.example.com (used for return links)
//
// Card details are entered on Stripe's hosted checkout page; this server never sees them.

const router = express.Router();
const STRIPE_API = 'https://api.stripe.com/v1';
const VIEWERS = ['head-office'];

const MIN_AMOUNT = 1;          // in major units (e.g. 1 USD)
const MAX_AMOUNT = 100000;

const currency = () => (process.env.DONATION_CURRENCY || 'usd').toLowerCase();
const isConfigured = () => Boolean(process.env.STRIPE_SECRET_KEY);
const clean = (v, max = 500) => (v === undefined || v === null ? null : String(v).trim().slice(0, max) || null);

// Encode nested params the way Stripe's form API expects (a[b][0][c]=...).
function encodeForm(obj, prefix = '', out = []) {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === 'object') encodeForm(v, key, out);
    else out.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
  }
  return out.join('&');
}

async function stripe(method, path, params) {
  const res = await fetch(`${STRIPE_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params ? encodeForm(params) : undefined,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error?.message || `Stripe request failed (${res.status})`);
  return body;
}

function siteUrl(req) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, '');
  const origin = req.headers.origin;
  if (origin && /^https?:\/\/[^/\s]+$/.test(origin)) return origin;
  return null;
}

async function markFromSession(session) {
  const status = session.payment_status === 'paid' ? 'paid'
    : session.status === 'expired' ? 'expired' : 'pending';
  await pool.query(
    `UPDATE donations SET status = $1, stripe_payment_intent = COALESCE($2, stripe_payment_intent),
       paid_at = CASE WHEN $1 = 'paid' AND paid_at IS NULL THEN now() ELSE paid_at END
     WHERE stripe_session_id = $3`,
    [status, typeof session.payment_intent === 'string' ? session.payment_intent : null, session.id]
  );
  return status;
}

// GET /api/donations/config — lets the page know whether card payments are available
router.get('/config', (req, res) => {
  res.json({ enabled: isConfigured(), currency: currency(), min: MIN_AMOUNT, max: MAX_AMOUNT });
});

// POST /api/donations/checkout — create a Stripe Checkout session and return its URL
router.post('/checkout', async (req, res) => {
  try {
    if (!isConfigured()) return res.status(503).json({ error: 'Card donations are not available yet. Please choose Offline Donation.' });
    const amount = Number(String(req.body.amount || '').replace(/[^0-9.]/g, ''));
    if (!Number.isFinite(amount) || amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
      return res.status(400).json({ error: `Enter an amount between ${MIN_AMOUNT} and ${MAX_AMOUNT.toLocaleString()}.` });
    }
    const email = clean(req.body.email, 200);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
    const first = clean(req.body.first_name, 100);
    const last = clean(req.body.last_name, 100);
    if (!first || !last) return res.status(400).json({ error: 'Enter your first and last name.' });
    const base = siteUrl(req);
    if (!base) return res.status(500).json({ error: 'The website address is not configured (SITE_URL).' });

    const cents = Math.round(amount * 100);
    const campaign = clean(req.body.campaign_slug, 200);
    const returnPath = campaign ? `/campaign-single/${encodeURIComponent(campaign)}` : '/donate';

    const session = await stripe('POST', '/checkout/sessions', {
      mode: 'payment',
      submit_type: 'donate',
      customer_email: email,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: currency(),
          unit_amount: cents,
          product_data: { name: 'Donation to the Build One Zambia campaign' },
        },
      }],
      metadata: { donor_name: `${first} ${last}`, campaign: campaign || '' },
      success_url: `${base}${returnPath}?donation=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}${returnPath}?donation=cancelled`,
    });

    await pool.query(
      `INSERT INTO donations (stripe_session_id, amount_cents, currency, donor_first_name, donor_last_name, donor_email, donor_address, message, campaign_slug)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [session.id, cents, currency(), first, last, email, clean(req.body.address), clean(req.body.message, 2000), campaign]
    );
    res.json({ url: session.url });
  } catch (err) {
    console.error('Donation checkout error:', err);
    res.status(502).json({ error: 'The payment page could not be opened. Please try again shortly.' });
  }
});

// GET /api/donations/session/:id — confirm the result when the donor returns from Stripe
router.get('/session/:id', async (req, res) => {
  try {
    if (!isConfigured()) return res.status(503).json({ error: 'Not configured' });
    if (!/^cs_[A-Za-z0-9_]+$/.test(req.params.id)) return res.status(400).json({ error: 'Invalid session' });
    const session = await stripe('GET', `/checkout/sessions/${req.params.id}`);
    const status = await markFromSession(session);
    res.json({ status, amount: session.amount_total / 100, currency: session.currency });
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: 'Could not confirm the donation' });
  }
});

// POST /api/donations/webhook — Stripe calls this; body must be the raw bytes for signature checking
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return res.status(503).send('Webhook secret not configured');
  try {
    const header = String(req.headers['stripe-signature'] || '');
    const parts = Object.fromEntries(header.split(',').map((p) => p.split('=')));
    const signatures = header.split(',').filter((p) => p.startsWith('v1=')).map((p) => p.slice(3));
    const payload = req.body.toString('utf8');
    const expected = crypto.createHmac('sha256', secret).update(`${parts.t}.${payload}`).digest('hex');
    const valid = signatures.some((s) => s.length === expected.length && crypto.timingSafeEqual(Buffer.from(s), Buffer.from(expected)));
    const fresh = Math.abs(Date.now() / 1000 - Number(parts.t)) < 300;
    if (!valid || !fresh) return res.status(400).send('Invalid signature');

    const event = JSON.parse(payload);
    if (['checkout.session.completed', 'checkout.session.async_payment_succeeded', 'checkout.session.expired'].includes(event.type)) {
      await markFromSession(event.data.object);
    } else if (event.type === 'checkout.session.async_payment_failed') {
      await pool.query(`UPDATE donations SET status = 'failed' WHERE stripe_session_id = $1`, [event.data.object.id]);
    }
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(400).send('Webhook error');
  }
});

// GET /api/donations — donation records for Head Office
router.get('/', requireAuth(VIEWERS), async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM donations ORDER BY created_at DESC LIMIT 500');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch donations' });
  }
});

export default router;
