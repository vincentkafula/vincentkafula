import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { newsApi } from '../../api/newsApi';

// A branded "compose & send" panel for emailing a published article to a list of
// recipients, styled as a standalone card so it reads as a real mail composer
// rather than a plain form.

const styles = `
.cep-wrap{
  --maroon-950:#170606; --maroon-900:#2b0808; --gold-500:#d4a01f; --gold-400:#e6b84a;
  --gold-300:#f0cd7a; --cream-50:#faf7f1; --line:rgba(255,255,255,0.10);
  font-family:'Poppins',sans-serif;
  background:
    radial-gradient(120% 90% at 15% 0%, #4a0e0e 0%, transparent 55%),
    linear-gradient(180deg, var(--maroon-900) 0%, var(--maroon-950) 100%);
  border-radius:16px;
  overflow:hidden;
  color:#f0e6d8;
  box-shadow:0 14px 34px rgba(20,4,4,0.35);
}
.cep-head{
  display:flex; align-items:center; justify-content:space-between;
  padding:18px 22px; border-bottom:1px solid var(--line);
}
.cep-head h3{ margin:0; font-size:16px; font-weight:600; color:#fff; }
.cep-head .sub{ font-size:12px; color:#c9b79a; margin-top:2px; }
.cep-body{ padding:20px 22px; }
.cep-field{ margin-bottom:14px; }
.cep-field label{
  display:block; font-size:11.5px; font-weight:700; letter-spacing:0.04em;
  text-transform:uppercase; color:#c9b79a; margin-bottom:6px;
}
.cep-field input, .cep-field textarea{
  width:100%; box-sizing:border-box; border-radius:10px; border:1px solid var(--line);
  background:rgba(255,255,255,0.06); color:#fff; padding:11px 13px; font-size:14px;
  font-family:'Poppins',sans-serif; outline:none; resize:vertical;
}
.cep-field input::placeholder, .cep-field textarea::placeholder{ color:#8f8074; }
.cep-field input:focus, .cep-field textarea:focus{ border-color:var(--gold-500); }
.cep-preview{
  border:1px solid var(--line); border-radius:12px; padding:10px 14px;
  background:rgba(255,255,255,0.04); font-size:12.5px; color:#d8ccb8;
  margin-bottom:16px;
}
.cep-preview strong{ color:#fff; }

.cep-sig{ text-align:center; padding:18px 10px 6px; border-top:1px dashed var(--line); margin-top:6px; }
.cep-sig-name{
  font-family:'Great Vibes', cursive; font-size:40px; line-height:1;
  background:linear-gradient(120deg, var(--gold-500), #fff 55%, #fff);
  -webkit-background-clip:text; background-clip:text; color:transparent;
}
.cep-sig-underline{ width:200px; height:2px; margin:4px auto 10px; background:linear-gradient(90deg, transparent, var(--gold-500), transparent); }
.cep-sig-info{ font-size:12px; color:#d8ccb8; display:flex; flex-wrap:wrap; gap:14px; justify-content:center; }
.cep-sig-info span{ display:inline-flex; align-items:center; gap:6px; }
.cep-sig-info i{ color:var(--gold-400); }

.cep-footer{
  display:flex; align-items:center; justify-content:space-between;
  padding:16px 22px; border-top:1px solid var(--line);
}
.cep-send{
  background:linear-gradient(180deg, var(--gold-400), var(--gold-500));
  color:#2b1a02; border:none; border-radius:10px; padding:11px 22px;
  font-weight:600; font-size:14px; cursor:pointer; display:flex; align-items:center; gap:8px;
  box-shadow:0 6px 16px rgba(212,160,31,0.35);
}
.cep-send:disabled{ opacity:0.55; cursor:not-allowed; }
.cep-count{ font-size:12px; color:#c9b79a; }
.cep-warn{
  background:rgba(230,184,74,0.12); border:1px solid rgba(230,184,74,0.35); color:var(--gold-300);
  padding:10px 12px; border-radius:10px; font-size:12.5px; margin-bottom:14px;
}
`;

const SIGNATURE = {
    name: 'Vincent Kafula',
    phone: '+260 95 554 8500',
    email: 'vincent.kafula@gmail.com',
    website: 'www.vkm8.org',
    location: 'Lusaka, Zambia',
};

const ComposeEmailPanel = ({ article, emailConfigured }) => {
    const [recipients, setRecipients] = useState('');
    const [subject, setSubject] = useState(article?.title || '');
    const [intro, setIntro] = useState('');
    const [sending, setSending] = useState(false);

    React.useEffect(() => {
        setSubject(article?.title || '');
        setIntro('');
    }, [article?.id]);

    const list = recipients.split(/[,\n]/).map((r) => r.trim()).filter(Boolean);

    const send = async (e) => {
        e.preventDefault();
        if (!article) return;
        if (!list.length) {
            toast.error('Add at least one recipient email');
            return;
        }
        setSending(true);
        try {
            const result = await newsApi.sendEmail(article.id, list, { subject, intro });
            toast.success(`Sent to ${result.sent} recipient${result.sent === 1 ? '' : 's'}${result.failed ? `, ${result.failed} failed` : ''}`);
            setRecipients('');
            setIntro('');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="cep-wrap">
            <style>{styles}</style>
            <div className="cep-head">
                <div>
                    <h3>Compose &amp; Send</h3>
                    <div className="sub">Email this article to your supporter list via Resend</div>
                </div>
                <i className="fa-regular fa-paper-plane" style={{ color: '#e6b84a', fontSize: '18px' }}></i>
            </div>

            <div className="cep-body">
                {!emailConfigured && (
                    <div className="cep-warn">
                        Email sending isn't configured yet — add <code>RESEND_API_KEY</code> to the backend's Railway variables to enable this.
                    </div>
                )}

                {!article ? (
                    <p style={{ color: '#c9b79a', fontSize: '14px' }}>Select an article to compose an email for it.</p>
                ) : (
                    <form onSubmit={send}>
                        <div className="cep-preview">
                            Sending: <strong>{article.title}</strong>
                        </div>

                        <div className="cep-field">
                            <label>To (comma or new-line separated)</label>
                            <textarea rows={3} value={recipients} onChange={(e) => setRecipients(e.target.value)} placeholder="supporter1@example.com, supporter2@example.com" />
                        </div>

                        <div className="cep-field">
                            <label>Subject</label>
                            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject line" />
                        </div>

                        <div className="cep-field">
                            <label>Personal Note (optional)</label>
                            <textarea rows={3} value={intro} onChange={(e) => setIntro(e.target.value)} placeholder="Add a short note above the article…" />
                        </div>

                        <div className="cep-sig">
                            <div className="cep-sig-name">{SIGNATURE.name}</div>
                            <div className="cep-sig-underline"></div>
                            <div className="cep-sig-info">
                                <span><i className="fa-solid fa-phone"></i> {SIGNATURE.phone}</span>
                                <span><i className="fa-regular fa-envelope"></i> {SIGNATURE.email}</span>
                                <span><i className="fa-solid fa-globe"></i> {SIGNATURE.website}</span>
                                <span><i className="fa-solid fa-location-dot"></i> {SIGNATURE.location}</span>
                            </div>
                        </div>

                        <div className="cep-footer" style={{ margin: '18px -22px -20px', padding: '16px 22px' }}>
                            <button type="submit" className="cep-send" disabled={sending || !emailConfigured}>
                                <i className="fa-solid fa-paper-plane"></i> {sending ? 'Sending…' : 'Send Email'}
                            </button>
                            <span className="cep-count">{list.length} recipient{list.length === 1 ? '' : 's'}</span>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ComposeEmailPanel;
