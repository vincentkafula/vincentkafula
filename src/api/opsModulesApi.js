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

function makeApi(resource, { decidable } = {}) {
    const api = {
        list: () => fetch(`${API_URL}/api/${resource}`, { headers: authHeaders() }).then(handle),
        submit: (payload) =>
            fetch(`${API_URL}/api/${resource}`, {
                method: 'POST',
                headers: jsonHeaders(),
                body: JSON.stringify(payload),
            }).then(handle),
    };
    if (decidable) {
        api.decide = (id, approved) =>
            fetch(`${API_URL}/api/${resource}/${id}/decide`, {
                method: 'POST',
                headers: jsonHeaders(),
                body: JSON.stringify({ approved }),
            }).then(handle);
    }
    return api;
}

export const paymentAuthorisationsApi = makeApi('payment-authorisations', { decidable: true });
export const payrollApi = makeApi('payroll');
export const weeklyRegistersApi = makeApi('weekly-registers');
export const oasysChecksApi = makeApi('oasys-checks');
