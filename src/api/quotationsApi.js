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
    return res.json();
}

const jsonHeaders = () => ({ 'Content-Type': 'application/json', ...authHeaders() });

export const quotationsApi = {
    list: (status) => {
        const qs = status ? `?status=${encodeURIComponent(status)}` : '';
        return fetch(`${API_URL}/api/quotations${qs}`, { headers: authHeaders() }).then(handle);
    },
    get: (id) => fetch(`${API_URL}/api/quotations/${id}`, { headers: authHeaders() }).then(handle),
    submit: (payload) =>
        fetch(`${API_URL}/api/quotations`, {
            method: 'POST',
            headers: jsonHeaders(),
            body: JSON.stringify(payload),
        }).then(handle),
    omReview: (id, payload) =>
        fetch(`${API_URL}/api/quotations/${id}/om-review`, {
            method: 'POST',
            headers: jsonHeaders(),
            body: JSON.stringify(payload),
        }).then(handle),
    officeApprove: (id, payload) =>
        fetch(`${API_URL}/api/quotations/${id}/office-approve`, {
            method: 'POST',
            headers: jsonHeaders(),
            body: JSON.stringify(payload),
        }).then(handle),
    managerApprove: (id, payload) =>
        fetch(`${API_URL}/api/quotations/${id}/manager-approve`, {
            method: 'POST',
            headers: jsonHeaders(),
            body: JSON.stringify(payload),
        }).then(handle),
};
