import { authHeaders, clearAuth } from './authApi';

const API_URL = import.meta.env.VITE_API_URL || '';

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
const json = () => ({ 'Content-Type': 'application/json', ...authHeaders() });
const base = `${API_URL}/api/inbox`;

export const inboxApi = {
    status: () => fetch(`${base}/status`, { headers: authHeaders() }).then(handle),
    list: ({ folder = 'inbox', q = '', page = 1 } = {}) =>
        fetch(`${base}?${new URLSearchParams({ folder, q, page })}`, { headers: authHeaders() }).then(handle),
    get: (id) => fetch(`${base}/${id}`, { headers: authHeaders() }).then(handle),
    update: (id, changes) => fetch(`${base}/${id}`, { method: 'PATCH', headers: json(), body: JSON.stringify(changes) }).then(handle),
    remove: (id) => fetch(`${base}/${id}`, { method: 'DELETE', headers: authHeaders() }).then(handle),
    reply: (id, message) => fetch(`${base}/${id}/reply`, { method: 'POST', headers: json(), body: JSON.stringify({ message }) }).then(handle),
    attachment: (id, attId) => fetch(`${base}/${id}/attachments/${encodeURIComponent(attId)}`, { headers: authHeaders() }).then(handle),
    sync: () => fetch(`${base}/sync`, { method: 'POST', headers: authHeaders() }).then(handle),
};
