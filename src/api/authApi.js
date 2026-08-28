const API_URL = import.meta.env.VITE_API_URL || '';
const STORAGE_KEY = 'vk_ops_auth';

async function handle(res) {
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
    }
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

export const authApi = {
    login: (username, password) =>
        fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        }).then(handle),
};
