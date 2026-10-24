import { authHeaders, clearAuth } from './authApi';

const API_URL = import.meta.env.VITE_API_URL || '';
const base = `${API_URL}/api/shop`;

async function handle(res) {
    if (res.status === 401) {
        clearAuth();
        window.location.href = '/login';
        throw new Error('Session expired — please log in again');
    }
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
    return body;
}
const post = (path, body, auth = false) => fetch(`${base}${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...(auth ? authHeaders() : {}) }, body: JSON.stringify(body || {}),
}).then(handle);
const get = (path, auth = false) => fetch(`${base}${path}`, { headers: auth ? authHeaders() : {} }).then(handle);

// Turns a cart into the lines the server prices itself.
export const cartLines = (cart) => cart.filter((i) => i.product_id).map((i) => ({ product_id: i.product_id, vid: i.vid || null, quantity: i.qty }));

export const shopApi = {
    config: () => get('/config'),
    fund: () => get('/fund'),
    quote: (country, items) => post('/quote', { country, items }),
    checkout: (payload) => post('/checkout', payload),
    session: (id) => get(`/session/${encodeURIComponent(id)}`),
    track: (order, email) => get(`/track?${new URLSearchParams({ order, email })}`),
    admin: {
        status: () => get('/admin/status', true),
        summary: () => get('/admin/summary', true),
        search: (q, page = 1) => get(`/admin/cj/search?${new URLSearchParams({ q, page })}`, true),
        product: (pid) => get(`/admin/cj/product/${encodeURIComponent(pid)}`, true),
        importProduct: (pid, opts = {}) => post('/admin/cj/import', { pid, ...opts }, true),
        syncProduct: (id) => post(`/admin/products/${id}/sync`, {}, true),
        setVariants: (id, variants) => fetch(`${base}/admin/products/${id}/variants`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({ variants }),
        }).then(handle),
        catalog: () => get('/admin/catalog', true),
        saveCatalog: (settings) => fetch(`${base}/admin/catalog`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(settings),
        }).then(handle),
        runCatalog: () => post('/admin/catalog/run', {}, true),
        orders: (status = '') => get(`/admin/orders?${new URLSearchParams({ status })}`, true),
        retry: (id) => post(`/admin/orders/${id}/retry`, {}, true),
        syncOrders: () => post('/admin/orders/sync', {}, true),
        setStatus: (id, status, note) => post(`/admin/orders/${id}/status`, { status, note }, true),
    },
};

export const formatMoney = (n, currency = 'usd') => {
    try { return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(Number(n) || 0); } catch { return `$${(Number(n) || 0).toFixed(2)}`; }
};
