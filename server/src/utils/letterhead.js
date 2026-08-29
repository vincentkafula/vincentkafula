// Builds the branded "letterhead" HTML email used for every outgoing campaign
// email — matches Vincent Kafula's official letterhead (logo, address, contact
// details, signature block) and personalizes the greeting per recipient.

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://frontend-production-82b9c.up.railway.app';
const LOGO_URL = `${FRONTEND_URL}/email/vk-logo.png`;

const LETTERHEAD = {
  addressLine: "37 Chiappini Street, St Andrew's Presbyterian Church, Cape Town",
  email: 'vincent@vkm8.org',
  phone: '061 461 5035',
  website: 'www.vkm8.org',
  name: 'VINCENT KAFULA',
};

const todayFormatted = () =>
  new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

// Escapes untrusted text dropped into the HTML (recipient name, subject) —
// the message/body itself is the sender's own content and is preserved as-is
// (with newlines turned into line breaks via white-space:pre-line).
const escapeHtml = (str) =>
  String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

/**
 * Builds one recipient's personalized HTML email.
 * @param {object} opts
 * @param {string} opts.recipientName - Display name for the greeting/footer. Falls back to "Supporter".
 * @param {string} opts.subject
 * @param {string} opts.bodyHtml - Pre-rendered HTML for the message body (already escaped/formatted by the caller).
 */
export function buildLetterheadEmail({ recipientName, subject, bodyHtml }) {
  const name = recipientName?.trim() || 'Supporter';
  const safeName = escapeHtml(name);
  const safeSubject = escapeHtml(subject);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${safeSubject}</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4; font-family: Georgia, 'Times New Roman', serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:6px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,0.08);">

          <!-- HEADER / LETTERHEAD -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a1a,#2b2b2b); padding:28px 32px; text-align:center; border-bottom:4px solid #d9720f;">
              <img src="${LOGO_URL}" alt="Vincent Kafula" width="180" style="display:block; margin:0 auto 10px auto;">
              <div style="color:#e8e8e8; font-family: Arial, Helvetica, sans-serif; font-size:11px; letter-spacing:1px; text-transform:uppercase;">
                ${LETTERHEAD.addressLine}
              </div>
              <div style="color:#d9720f; font-family: Arial, Helvetica, sans-serif; font-size:11px; letter-spacing:0.5px; margin-top:4px;">
                ${LETTERHEAD.email} &nbsp;|&nbsp; ${LETTERHEAD.phone} &nbsp;|&nbsp; ${LETTERHEAD.website}
              </div>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:40px 44px; color:#222222; font-size:15px; line-height:1.7;">

              <p style="margin:0 0 22px 0; color:#888888; font-family: Arial, Helvetica, sans-serif; font-size:13px;">
                ${todayFormatted()}
              </p>

              <p style="margin:0 0 22px 0;">Dear ${safeName},</p>

              <div style="margin:0 0 28px 0;">${bodyHtml}</div>

              <p style="margin:0 0 4px 0;">Yours faithfully,</p>

              <!-- SIGNATURE -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:18px;">
                <tr>
                  <td style="border-left:3px solid #d9720f; padding-left:16px;">
                    <div style="font-family: Arial, Helvetica, sans-serif; font-weight:bold; font-size:17px; color:#1a1a1a; letter-spacing:0.5px;">
                      ${LETTERHEAD.name}
                    </div>
                    <div style="font-family: Arial, Helvetica, sans-serif; font-size:12px; color:#d9720f; margin-top:2px; letter-spacing:0.5px;">
                      ${LETTERHEAD.email} &nbsp;&bull;&nbsp; ${LETTERHEAD.phone}
                    </div>
                    <div style="font-family: Arial, Helvetica, sans-serif; font-size:12px; color:#888888; margin-top:2px;">
                      ${LETTERHEAD.website}
                    </div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color:#f8f8f8; padding:16px 32px; text-align:center; border-top:1px solid #eeeeee;">
              <div style="font-family: Arial, Helvetica, sans-serif; font-size:10px; color:#aaaaaa;">
                This email and any attachments are confidential and intended solely for ${safeName}.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Turns free-typed plain text (with blank-line paragraphs) into safe paragraph HTML.
export function textToHtml(text) {
  return String(text ?? '')
    .split(/\n{2,}/)
    .map((para) => `<p style="margin:0 0 16px 0; white-space:pre-line;">${escapeHtml(para)}</p>`)
    .join('');
}

// Parses a recipients list where each entry can be "Name <email@x.com>" or a bare email.
// Returns [{ name, email }]. Accepts an array of strings.
export function parseRecipients(list) {
  return (list || [])
    .map((raw) => String(raw).trim())
    .filter(Boolean)
    .map((entry) => {
      const match = entry.match(/^(.*)<\s*([^<>\s]+@[^<>\s]+)\s*>$/);
      if (match) {
        return { name: match[1].trim().replace(/^["']|["']$/g, ''), email: match[2].trim() };
      }
      return { name: '', email: entry };
    })
    .filter((r) => r.email.includes('@'));
}
