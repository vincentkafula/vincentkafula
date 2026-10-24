// Minimal Stripe REST client shared by donations and the shop.
const STRIPE_API = 'https://api.stripe.com/v1';

export const isStripeConfigured = () => Boolean(process.env.STRIPE_SECRET_KEY);

// Encode nested params the way Stripe's form API expects (a[b][0][c]=...).
export function encodeForm(obj, prefix = '', out = []) {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === 'object') encodeForm(v, key, out);
    else out.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
  }
  return out.join('&');
}

export async function stripe(method, path, params) {
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

export function siteUrl(req) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, '');
  const origin = req.headers.origin;
  if (origin && /^https?:\/\/[^/\s]+$/.test(origin)) return origin;
  return null;
}
