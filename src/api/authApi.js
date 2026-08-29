const API_URL = import.meta.env.VITE_API_URL || '';
const STORAGE_KEY = 'vk_ops_auth';

async function handle(res) {
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
    }
    if (res.status === 204) return null;
    return res.json();
}

export function getAuth() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function setAuth(auth) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

export function clearAuth() {
    localStorage.removeItem(STORAGE_KEY);
}

export function authHeaders() {
    const auth = getAuth();
    return auth?.token ? { Authorization: `Bearer ${auth.token}` } : {};
}

const jsonHeaders = () => ({ 'Content-Type': 'application/json', ...authHeaders() });

export const authApi = {
    login: (username, password) =>
        fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        }).then(handle),

    updateMe: (payload) =>
        fetch(`${API_URL}/api/auth/me`, {
            method: 'PATCH',
            headers: jsonHeaders(),
            body: JSON.stringify(payload),
        }).then(handle),

    listUsers: () =>
        fetch(`${API_URL}/api/auth/users`, { headers: authHeaders() }).then(handle),

    createUser: (payload) =>
        fetch(`${API_URL}/api/auth/users`, {
            method: 'POST',
            headers: jsonHeaders(),
            body: JSON.stringify(payload),
        }).then(handle),

    deleteUser: (id) =>
        fetch(`${API_URL}/api/auth/users/${id}`, { method: 'DELETE', headers: authHeaders() }).then(handle),

    forgotPassword: (username) =>
        fetch(`${API_URL}/api/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
        }).then(handle),

    resetPassword: (token, new_password) =>
        fetch(`${API_URL}/api/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, new_password }),
        }).then(handle),
};
