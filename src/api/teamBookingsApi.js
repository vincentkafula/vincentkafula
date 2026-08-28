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

export const teamBookingsApi = {
    list: (status) => {
        const qs = status ? `?status=${encodeURIComponent(status)}` : '';
        return fetch(`${API_URL}/api/team-bookings${qs}`, { headers: authHeaders() }).then(handle);
    },
    book: (payload) =>
        fetch(`${API_URL}/api/team-bookings`, {
            method: 'POST',
            headers: jsonHeaders(),
            body: JSON.stringify(payload),
        }).then(handle),
    deploy: (id, payload) =>
        fetch(`${API_URL}/api/team-bookings/${id}/deploy`, {
            method: 'POST',
            headers: jsonHeaders(),
            body: JSON.stringify(payload),
        }).then(handle),
    complete: (id) =>
        fetch(`${API_URL}/api/team-bookings/${id}/complete`, {
            method: 'POST',
            headers: authHeaders(),
        }).then(handle),
};
