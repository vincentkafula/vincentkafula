import { authHeaders } from './authApi';

const API_URL = import.meta.env.VITE_API_URL || '';

async function json(res) {
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
    return body;
}
const post = (path, body) => fetch(`${API_URL}/api/registrations${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
}).then(json);

export const registrationsApi = {
    sendCode: (payload) => post('/otp', payload),
    verifyMember: (membership_no) => post('/verify-member', { membership_no }),
    membership: (payload) => post('/membership', payload),
    cooperative: (payload) => post('/cooperative', payload),
    internship: (payload) => post('/internship', payload),
    // Head Office review
    list: (type) => fetch(`${API_URL}/api/registrations/admin/${type}`, { headers: authHeaders() }).then(json),
    setStatus: (type, id, status, note) => fetch(`${API_URL}/api/registrations/admin/${type}/${id}/status`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({ status, note }),
    }).then(json),
    downloadDocument: async (id, fileName) => {
        const res = await fetch(`${API_URL}/api/registrations/admin/documents/${id}`, { headers: authHeaders() });
        if (!res.ok) throw new Error('Could not download the document');
        const url = URL.createObjectURL(await res.blob());
        const a = document.createElement('a'); a.href = url; a.download = fileName; a.click(); URL.revokeObjectURL(url);
    },
};

export const readFileAsBase64 = (file) => new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1]);
    r.onerror = () => reject(new Error('Could not read the file'));
    r.readAsDataURL(file);
});
