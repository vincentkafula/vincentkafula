import { authHeaders, clearAuth } from './authApi';

const API_URL = import.meta.env.VITE_API_URL || '';

async function handle(res) {
    if (res.status === 401) {
        clearAuth();
        window.location.href = '/login';
        throw new Error('Session expired — please log in again');
    }
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
    }
    if (res.status === 204) return null;
    return res.json();
}

const jsonHeaders = () => ({ 'Content-Type': 'application/json', ...authHeaders() });

export const productsApi = {
    listActive: () => fetch(`${API_URL}/api/products`).then(handle),
    listAll: () => fetch(`${API_URL}/api/products?all=1`, { headers: authHeaders() }).then(handle),
    getBySlug: (slug) => fetch(`${API_URL}/api/products/${slug}`).then(handle),
    create: (payload) =>
        fetch(`${API_URL}/api/products`, { method: 'POST', headers: jsonHeaders(), body: JSON.stringify(payload) }).then(handle),
    update: (id, payload) =>
        fetch(`${API_URL}/api/products/${id}`, { method: 'PATCH', headers: jsonHeaders(), body: JSON.stringify(payload) }).then(handle),
    remove: (id) =>
        fetch(`${API_URL}/api/products/${id}`, { method: 'DELETE', headers: authHeaders() }).then(handle),
};
