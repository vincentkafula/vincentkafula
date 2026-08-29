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

export const newsApi = {
    listPublished: () => fetch(`${API_URL}/api/news`).then(handle),
    listAll: () => fetch(`${API_URL}/api/news?all=1`, { headers: authHeaders() }).then(handle),
    getBySlug: (slug) => fetch(`${API_URL}/api/news/${slug}`).then(handle),
    create: (payload) =>
        fetch(`${API_URL}/api/news`, { method: 'POST', headers: jsonHeaders(), body: JSON.stringify(payload) }).then(handle),
    update: (id, payload) =>
        fetch(`${API_URL}/api/news/${id}`, { method: 'PATCH', headers: jsonHeaders(), body: JSON.stringify(payload) }).then(handle),
    publish: (id) =>
        fetch(`${API_URL}/api/news/${id}/publish`, { method: 'POST', headers: authHeaders() }).then(handle),
    unpublish: (id) =>
        fetch(`${API_URL}/api/news/${id}/unpublish`, { method: 'POST', headers: authHeaders() }).then(handle),
    remove: (id) =>
        fetch(`${API_URL}/api/news/${id}`, { method: 'DELETE', headers: authHeaders() }).then(handle),
    emailStatus: () =>
        fetch(`${API_URL}/api/news/email/status`, { headers: authHeaders() }).then(handle),
    sendEmail: (id, recipients, options = {}) =>
        fetch(`${API_URL}/api/news/${id}/send`, {
            method: 'POST',
            headers: jsonHeaders(),
            body: JSON.stringify({ recipients, ...options }),
        }).then(handle),
    broadcastHistory: (id) =>
        fetch(`${API_URL}/api/news/${id}/broadcasts`, { headers: authHeaders() }).then(handle),
};
