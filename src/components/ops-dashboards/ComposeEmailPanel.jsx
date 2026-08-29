import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { emailApi } from '../../api/emailApi';

// A faithful recreation of the "compose" pane from the reference design —
// a general-purpose email composer, not tied to any specific article.

const styles = `
.cep{
  --maroon-950:#1a0505; --maroon-900:#2b0808; --gold-500:#d4a01f; --gold-400:#e6b84a;
  --gold-300:#f0cd7a; --cream-100:#f4efe6; --ink-900:#241c14; --ink-600:#6b6157;
  --ink-400:#a39a8d; --line:#eae3d6;
  font-family:'Poppins',sans-serif;
  background:#fffdfa;
  border-radius:16px;
  overflow:hidden;
  box-shadow:0 14px 34px rgba(26,5,5,0.12);
  border:1px solid var(--line);
}
.cep-header{
  display:flex; align-items:center; justify-content:space-between;
  padding:20px 26px; border-bottom:1px solid var(--line);
}
.cep-header h1{ font-size:20px; margin:0; font-weight:600; color:var(--ink-900); }
.cep-win{ display:flex; gap:14px; color:var(--ink-600); font-size:14px; }

.cep-field-row{
  display:flex; align-items:center; padding:13px 26px; border-bottom:1px solid var(--line); gap:14px;
}
.cep-field-row label{ font-size:14px; color:var(--ink-600); width:60px; flex-shrink:0; }
.cep-field-row input, .cep-field-row select{
  flex:1; border:none; outline:none; font-size:14.5px; font-family:'Poppins',sans-serif;
  color:var(--ink-900); background:transparent;
}
.cep-field-row input::placeholder{ color:#b7ac9c; }
.cep-note{ font-size:12px; color:var(--gold-500); font-weight:600; flex-shrink:0; }

.cep-toolbar{
  display:flex; align-items:center; gap:6px; padding:9px 20px; border-bottom:1px solid var(--line); flex-wrap:wrap;
}
.cep-tb-btn{
  width:30px; height:30px; border-radius:8px; border:none; background:transparent;
  color:var(--ink-600); font-size:13px; cursor:default;
  display:flex; align-items:center; justify-content:center;
}
.cep-divider{ width:1px; height:20px; background:var(--line); margin:0 4px; }

.cep-body{ padding:20px 30px; display:flex; flex-direction:column; }
.cep-body textarea{
  border:none; outline:none; resize:vertical; font-family:'Poppins',sans-serif;
  font-size:14.5px; color:var(--ink-900); min-height:140px; margin-bottom:22px;
}
.cep-body textarea::placeholder{ color:#b7ac9c; }

.cep-sig{ text-align:center; padding-top:8px; }
.cep-sig-row{ display:flex; align-items:center; justify-content:center; gap:14px; margin-bottom:6px; }
.cep-sig-name{
  font-family:'Great Vibes', cursive; font-size:52px; line-height:1;
  background:linear-gradient(120deg, var(--gold-500), var(--ink-900) 55%, var(--ink-900));
  -webkit-background-clip:text; background-clip:text; color:transparent;
}
.cep-sig-underline{ width:280px; height:2px; margin:2px auto 4px; background:linear-gradient(90deg, transparent, var(--gold-500), transparent); }
.cep-sig-dots{ display:flex; gap:6px; justify-content:center; margin-bottom:18px; }
.cep-sig-dots span{ width:5px; height:5px; border-radius:50%; background:var(--ink-400); }
.cep-sig-dots span.on{ background:var(--gold-500); width:6px; height:6px; }
.cep-sig-contact{ display:flex; align-items:center; justify-content:center; gap:30px; flex-wrap:wrap; }
.cep-sig-info{ text-align:left; font-size:13px; color:var(--ink-900); }
.cep-sig-info div{ display:flex; align-items:center; gap:9px; margin-bottom:9px; }
.cep-sig-info i{ color:var(--gold-500); width:14px; text-align:center; }
.cep-sig-social{ display:flex; gap:10px; padding-left:20px; border-left:1px solid var(--line); }
.cep-sig-social span{
  width:30px; height:30px; border-radius:50%; border:1.5px solid #c0392b;
  display:flex; align-items:center; justify-content:center; color:#c0392b; font-size:13px;
}

.cep-footer{
  display:flex; align-items:center; justify-content:space-between; padding:16px 26px; border-top:1px solid var(--line);
}
.cep-footer-left{ display:flex; align-items:center; gap:10px; }
.cep-send{
  background:linear-gradient(180deg, var(--gold-400), var(--gold-500)); color:#2b1a02; border:none;
  border-radius:10px; padding:11px 22px; font-weight:600; font-size:14px; cursor:pointer;
  display:flex; align-items:center; gap:8px; box-shadow:0 6px 16px rgba(212,160,31,0.35);
}
.cep-send:disabled{ opacity:0.55; cursor:not-allowed; }
.cep-footer-right{ display:flex; align-items:center; gap:16px; color:var(--ink-600); font-size:15px; }
.cep-count{ font-size:12.5px; color:var(--ink-600); }

.cep-warn{
  margin:16px 26px 0; background:#fff4e0; color:#a3690f; padding:10px 14px; border-radius:8px; font-size:12.5px;
}
`;

const SIGNATURE = {
    name: 'Vincent Kafula',
    phone: '+260 95 554 8500',
    email: 'vincent.kafula@gmail.com',
    website: 'www.vkm8.org',
    location: 'Lusaka, Zambia',
};

const ComposeEmailPanel = ({ emailConfigured }) => {
    const [recipients, setRecipients] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    const list = recipients.split(/[,\n]/).map((r) => r.trim()).filter(Boolean);

    const send = async (e) => {
        e.preventDefault();
        if (!list.length) {
            toast.error('Add at least one recipient email');
            return;
        }
        if (!subject.trim()) {
            toast.error('Add a subject');
            return;
        }
        if (!message.trim()) {
            toast.error('Write a message');
            return;
        }
        setSending(true);
        try {
            const result = await emailApi.send(list, subject, message);
            toast.success(`Sent to ${result.sent} recipient${result.sent === 1 ? '' : 's'}${result.failed ? `, ${result.failed} failed` : ''}`);
            setRecipients('');
            setSubject('');
            setMessage('');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="cep">
            <style>{styles}</style>

            <div className="cep-header">
                <h1>New Message</h1>
                <div className="cep-win">
                    <i className="fa-solid fa-minus"></i>
                    <i className="fa-solid fa-up-right-and-down-left-from-center" style={{ fontSize: '12px' }}></i>
                    <i className="fa-solid fa-xmark"></i>
                </div>
            </div>

            {!emailConfigured && (
                <div className="cep-warn">
                    Email sending isn't configured yet — add <code>RESEND_API_KEY</code> to the backend's Railway variables to enable this.
                </div>
            )}

            <form onSubmit={send}>
                <div className="cep-field-row">
                    <label>To</label>
                    <input
                        type="text"
                        value={recipients}
                        onChange={(e) => setRecipients(e.target.value)}
                        placeholder='e.g. "Jane Mwansa <jane@example.com>, John Banda <john@example.com>"'
                    />
                    <div className="cep-note">{list.length} recipient{list.length === 1 ? '' : 's'}</div>
                </div>
                <div style={{ padding: '0 26px 6px', marginTop: '-8px' }}>
                    <p style={{ fontSize: '11.5px', color: 'var(--ink-400, #a39a8d)', margin: 0 }}>
                        Add a name in front of each address — <code>Name &lt;email&gt;</code> — and that person's email will open with "Dear Name,". A bare email still sends, just addressed to "Dear Supporter,".
                    </p>
                </div>

                <div className="cep-field-row">
                    <label>Subject</label>
                    <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Add a subject" />
                </div>

                <div className="cep-toolbar">
                    <button type="button" className="cep-tb-btn"><i className="fa-solid fa-rotate-left"></i></button>
                    <button type="button" className="cep-tb-btn"><i className="fa-solid fa-rotate-right"></i></button>
                    <div className="cep-divider"></div>
                    <select style={{ border: '1px solid var(--line)', borderRadius: '8px', padding: '5px 8px', fontSize: '12.5px' }} disabled><option>Poppins</option></select>
                    <select style={{ border: '1px solid var(--line)', borderRadius: '8px', padding: '5px 8px', fontSize: '12.5px' }} disabled><option>14</option></select>
                    <div className="cep-divider"></div>
                    <button type="button" className="cep-tb-btn"><b>B</b></button>
                    <button type="button" className="cep-tb-btn"><i style={{ fontStyle: 'italic' }}>I</i></button>
                    <button type="button" className="cep-tb-btn" style={{ textDecoration: 'underline' }}>U</button>
                    <div className="cep-divider"></div>
                    <button type="button" className="cep-tb-btn"><i className="fa-solid fa-align-left"></i></button>
                    <button type="button" className="cep-tb-btn"><i className="fa-solid fa-list-ul"></i></button>
                    <div className="cep-divider"></div>
                    <button type="button" className="cep-tb-btn"><i className="fa-solid fa-link"></i></button>
                    <button type="button" className="cep-tb-btn"><i className="fa-regular fa-image"></i></button>
                </div>

                <div className="cep-body">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Write your message here..."
                        rows={8}
                    />

                    <div className="cep-sig">
                        <div className="cep-sig-row">
                            <div className="cep-sig-name">{SIGNATURE.name}</div>
                            <i className="fa-solid fa-pen-nib" style={{ fontSize: '30px', color: '#1a1a1a', transform: 'rotate(-25deg)' }}></i>
                        </div>
                        <div className="cep-sig-underline"></div>
                        <div className="cep-sig-dots"><span></span><span className="on"></span><span></span></div>
                        <div className="cep-sig-contact">
                            <div className="cep-sig-info">
                                <div><i className="fa-solid fa-phone"></i> {SIGNATURE.phone}</div>
                                <div><i className="fa-regular fa-envelope"></i> {SIGNATURE.email}</div>
                                <div><i className="fa-solid fa-globe"></i> {SIGNATURE.website}</div>
                                <div><i className="fa-solid fa-location-dot"></i> {SIGNATURE.location}</div>
                            </div>
                            <div className="cep-sig-social">
                                <span><i className="fa-brands fa-facebook-f"></i></span>
                                <span><i className="fa-brands fa-linkedin-in"></i></span>
                                <span><i className="fa-brands fa-twitter"></i></span>
                                <span><i className="fa-brands fa-instagram"></i></span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="cep-footer">
                    <div className="cep-footer-left">
                        <button type="submit" className="cep-send" disabled={sending || !emailConfigured}>
                            <i className="fa-solid fa-paper-plane"></i> {sending ? 'Sending…' : 'Send'}
                        </button>
                    </div>
                    <div className="cep-footer-right">
                        <i className="fa-regular fa-paperclip"></i>
                        <i className="fa-regular fa-image"></i>
                        <i className="fa-regular fa-trash-can" onClick={() => { setRecipients(''); setSubject(''); setMessage(''); }} style={{ cursor: 'pointer' }}></i>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ComposeEmailPanel;
