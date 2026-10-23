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
const post = (path, body) => fetch(`${API_URL}/api/team${path}`, { method: 'POST', headers: jsonHeaders(), body: body ? JSON.stringify(body) : undefined }).then(handle);

// Team and candidate register. Public calls return only Head Office-approved, published profiles.
export const teamProfilesApi = {
    listPublic: () => fetch(`${API_URL}/api/team`).then((r) => (r.ok ? r.json() : [])),
    getPublic: (id) => fetch(`${API_URL}/api/team/${id}`).then((r) => (r.ok ? r.json() : null)),
    listAll: () => fetch(`${API_URL}/api/team/manage`, { headers: authHeaders() }).then(handle),
    statuses: () => fetch(`${API_URL}/api/team/statuses`).then(handle),
    audit: () => fetch(`${API_URL}/api/team/audit`, { headers: authHeaders() }).then(handle),
    create: (payload) => post('', payload),
    update: (id, payload) => fetch(`${API_URL}/api/team/${id}`, { method: 'PATCH', headers: jsonHeaders(), body: JSON.stringify(payload) }).then(handle),
    setStatus: (id, payload) => post(`/${id}/status`, payload),
    publish: (id) => post(`/${id}/publish`),
    unpublish: (id) => post(`/${id}/unpublish`),
    remove: (id) => fetch(`${API_URL}/api/team/${id}`, { method: 'DELETE', headers: authHeaders() }).then(handle),
    documents: (id) => fetch(`${API_URL}/api/team/${id}/documents`, { headers: authHeaders() }).then(handle),
    uploadDocument: (id, payload) => post(`/${id}/documents`, payload),
    downloadDocument: async (docId, fileName) => {
        const res = await fetch(`${API_URL}/api/team/documents/${docId}`, { headers: authHeaders() });
        if (!res.ok) throw new Error('Could not download the document');
        const url = URL.createObjectURL(await res.blob());
        const a = document.createElement('a');
        a.href = url; a.download = fileName; a.click();
        URL.revokeObjectURL(url);
    },
};
