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

export const invoicesApi = {
    list: () => fetch(`${API_URL}/api/invoices`, { headers: authHeaders() }).then(handle),
    pay: (id) =>
        fetch(`${API_URL}/api/invoices/${id}/pay`, {
            method: 'POST',
            headers: authHeaders(),
        }).then(handle),
};
