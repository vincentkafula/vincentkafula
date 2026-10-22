// Public form submissions (contact, volunteer, support pledge, newsletter).
// Sent to the backend route POST /api/contact, which emails the campaign inbox via Resend.
const API_URL = import.meta.env.VITE_API_URL || '';

export async function submitPublicForm(type, fields) {
    const res = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, ...fields }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(body.error || 'Your message could not be sent. Please email vincent.kafula@gmail.com directly.');
    }
    return body;
}
