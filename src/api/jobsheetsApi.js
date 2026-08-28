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

export const jobsheetsApi = {
    list: (status) => {
        const qs = status ? `?status=${encodeURIComponent(status)}` : '';
        return fetch(`${API_URL}/api/jobsheets${qs}`, { headers: authHeaders() }).then(handle);
    },
    submit: (payload) =>
        fetch(`${API_URL}/api/jobsheets`, {
            method: 'POST',
            headers: jsonHeaders(),
            body: JSON.stringify(payload),
        }).then(handle),
    confirm: (id) =>
        fetch(`${API_URL}/api/jobsheets/${id}/confirm`, {
            method: 'POST',
            headers: authHeaders(),
        }).then(handle),
    assignSerial: (id) =>
        fetch(`${API_URL}/api/jobsheets/${id}/serial`, {
            method: 'POST',
            headers: authHeaders(),
        }).then(handle),
};
