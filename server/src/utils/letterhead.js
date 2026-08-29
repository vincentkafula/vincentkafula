// Builds the branded "letterhead" HTML email used for every outgoing campaign
// email — matches Vincent Kafula's official letterhead (logo, address, contact
// details, signature block) and personalizes the greeting per recipient.

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://frontend-production-82b9c.up.railway.app';
const LOGO_URL = `${FRONTEND_URL}/email/vk-logo.png`;
const ICON_URL = `${FRONTEND_URL}/email/vk-icon.png`;

const LETTERHEAD = {
  addressLine: "37 Chiappini Street, St Andrew's Presbyterian Church, Cape Town",
  email: 'vincent@vkm8.org',
  phone: '061 461 5035',
  website: 'www.vkm8.org',
  name: 'Vincent Kafula',
};

const ACCENT = '#d9720f';

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
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${safeSubject}</title>
<style>
  @media only screen and (max-width: 640px) {
    .vk-container { width:100% !important; border-radius:0 !important; }
    .vk-pad { padding-left:24px !important; padding-right:24px !important; }
  }
</style>
</head>
<body style="margin:0; padding:0; background-color:#eef0ee; font-family: Georgia, 'Times New Roman', serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eef0ee; padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="620" cellpadding="0" cellspacing="0" class="vk-container" style="width:620px; background-color:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 10px 30px rgba(20,10,0,0.10);">

          <!-- TOP ACCENT -->
          <tr>
            <td style="height:6px; line-height:6px; font-size:0; background:linear-gradient(90deg, #b85c0a, ${ACCENT} 50%, #f2a24d);">&nbsp;</td>
          </tr>

          <!-- HEADER / LETTERHEAD -->
          <tr>
            <td class="vk-pad" style="background:linear-gradient(160deg,#161616,#2c2c2c 70%); padding:36px 40px 30px; text-align:center;">
              <img src="${LOGO_URL}" alt="Vincent Kafula" width="180" style="display:block; margin:0 auto 16px auto; height:auto;">
              <div style="width:52px; height:2px; margin:0 auto 16px; background-color:${ACCENT};"></div>
              <div style="color:#cfcfcf; font-family: Arial, Helvetica, sans-serif; font-size:11px; letter-spacing:1.2px; text-transform:uppercase; line-height:1.6;">
                ${LETTERHEAD.addressLine}
              </div>
              <div style="color:${ACCENT}; font-family: Arial, Helvetica, sans-serif; font-size:11.5px; letter-spacing:0.4px; margin-top:8px;">
                ${LETTERHEAD.email} &nbsp;&middot;&nbsp; ${LETTERHEAD.phone} &nbsp;&middot;&nbsp; ${LETTERHEAD.website}
              </div>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td class="vk-pad" style="padding:44px 48px 40px; color:#222222; font-size:15.5px; line-height:1.75;">

              <p style="margin:0 0 26px 0; color:#9a9a9a; font-family: Arial, Helvetica, sans-serif; font-size:12.5px; letter-spacing:0.3px;">
                ${todayFormatted()}
              </p>

              <p style="margin:0 0 22px 0; font-size:16.5px;">Dear ${safeName},</p>

              <div style="margin:0 0 30px 0;">${bodyHtml}</div>

              <p style="margin:0 0 2px 0;">Yours faithfully,</p>

              <!-- SIGNATURE -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:22px;">
                <tr>
                  <td style="border-left:3px solid ${ACCENT}; padding-left:18px;">
                    <div style="font-family: Arial, Helvetica, sans-serif; font-weight:bold; font-size:18px; color:#1a1a1a; letter-spacing:0.4px;">
                      ${LETTERHEAD.name}
                    </div>
                    <div style="font-family: Arial, Helvetica, sans-serif; font-size:12px; color:${ACCENT}; margin-top:4px; letter-spacing:0.3px;">
                      ${LETTERHEAD.email} &nbsp;&bull;&nbsp; ${LETTERHEAD.phone}
                    </div>
                    <div style="font-family: Arial, Helvetica, sans-serif; font-size:12px; color:#999999; margin-top:2px;">
                      ${LETTERHEAD.website}
                    </div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color:#faf9f7; padding:20px 32px; text-align:center; border-top:1px solid #eeeeee;">
              <img src="${ICON_URL}" alt="" width="22" style="display:block; margin:0 auto 8px auto; opacity:0.55;">
              <div style="font-family: Arial, Helvetica, sans-serif; font-size:10.5px; color:#a8a8a8; line-height:1.6;">
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
