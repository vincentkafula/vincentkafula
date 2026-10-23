import { authHeaders } from './authApi';

const API_URL = import.meta.env.VITE_API_URL || '';

async function json(res) {
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
    return body;
}

// Card donations go through Stripe Checkout; card details are entered on Stripe's own page.
export const donationsApi = {
    config: () => fetch(`${API_URL}/api/donations/config`).then(json).catch(() => ({ enabled: false, currency: 'usd' })),
    checkout: (payload) => fetch(`${API_URL}/api/donations/checkout`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    }).then(json),
    confirm: (sessionId) => fetch(`${API_URL}/api/donations/session/${encodeURIComponent(sessionId)}`).then(json),
    list: () => fetch(`${API_URL}/api/donations`, { headers: authHeaders() }).then(json),
    offline: (payload) => fetch(`${API_URL}/api/contact`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'support', ...payload }),
    }).then(json),
};

export const currencySymbol = (c) => ({ usd: '$', zar: 'R', zmw: 'K', eur: '€', gbp: '£' }[String(c).toLowerCase()] || String(c).toUpperCase() + ' ');
