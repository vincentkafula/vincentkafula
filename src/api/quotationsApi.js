const API_URL = import.meta.env.VITE_API_URL || '';

async function handle(res) {
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
    }
    return res.json();
}

export const quotationsApi = {
    list: (status) => {
        const qs = status ? `?status=${encodeURIComponent(status)}` : '';
        return fetch(`${API_URL}/api/quotations${qs}`).then(handle);
    },
    get: (id) => fetch(`${API_URL}/api/quotations/${id}`).then(handle),
    submit: (payload) =>
        fetch(`${API_URL}/api/quotations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        }).then(handle),
    omReview: (id, payload) =>
        fetch(`${API_URL}/api/quotations/${id}/om-review`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        }).then(handle),
    officeApprove: (id, payload) =>
        fetch(`${API_URL}/api/quotations/${id}/office-approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        }).then(handle),
    managerApprove: (id, payload) =>
        fetch(`${API_URL}/api/quotations/${id}/manager-approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        }).then(handle),
};
