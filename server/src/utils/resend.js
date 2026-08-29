// Thin wrapper around the Resend REST API (https://resend.com/docs/api-reference/emails/send-email).
// Requires RESEND_API_KEY in the environment. RESEND_FROM_EMAIL should be a verified sender/domain
// in the Resend dashboard (falls back to Resend's shared onboarding sender for quick testing).

const RESEND_API_URL = 'https://api.resend.com/emails';

function getConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || 'Vincent Kafula <onboarding@resend.dev>';
  return { apiKey, from };
}

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

// Sends one email per recipient (rather than one email with everyone in `to`) so that
// recipients never see each other's addresses. `recipients` may be an array of email
// strings, or an array of { email, name } objects when `buildHtml` is provided so each
// recipient gets their own personalized version (e.g. "Dear Jane," vs "Dear John,").
// Returns { sent, failed, errors }.
export async function sendBulkEmail({ recipients, subject, html, text, buildHtml }) {
  const { apiKey, from } = getConfig();
  if (!apiKey) {
    throw new Error('Email is not configured on the server (missing RESEND_API_KEY)');
  }
  const list = (recipients || []).filter(Boolean);
  if (!list.length) {
    throw new Error('At least one recipient email is required');
  }

  let sent = 0;
  const errors = [];

  await Promise.all(
    list.map(async (entry) => {
      const isObject = typeof entry === 'object' && entry !== null;
      const to = (isObject ? entry.email : entry)?.trim();
      try {
        if (!to) throw new Error('Missing email address');
        const body = buildHtml ? buildHtml(entry) : html;
        const res = await fetch(RESEND_API_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ from, to, subject, html: body, text }),
        });
        if (!res.ok) {
          const body2 = await res.json().catch(() => ({}));
          throw new Error(body2.message || `Resend responded with ${res.status}`);
        }
        sent += 1;
      } catch (err) {
        errors.push({ to, error: err.message });
      }
    })
  );

  return { sent, failed: errors.length, errors };
}

export async function sendSingleEmail({ to, subject, html, text }) {
  const result = await sendBulkEmail({ recipients: [to], subject, html, text });
  if (result.failed > 0) {
    throw new Error(result.errors[0]?.error || 'Failed to send email');
  }
  return result;
}
