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

export const emailApi = {
    status: () => fetch(`${API_URL}/api/email/status`, { headers: authHeaders() }).then(handle),
    send: (recipients, subject, message) =>
        fetch(`${API_URL}/api/email/send`, {
            method: 'POST',
            headers: jsonHeaders(),
            body: JSON.stringify({ recipients, subject, message }),
        }).then(handle),
    history: () => fetch(`${API_URL}/api/email/history`, { headers: authHeaders() }).then(handle),
};
