import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { inboxApi } from '../../api/inboxApi';
import './inboxPanel.css';

const FOLDERS = [
    ['inbox', 'Inbox'],
    ['unread', 'Unread'],
    ['starred', 'Starred'],
    ['email', 'Emails'],
    ['website', 'Website forms'],
    ['archived', 'Archived'],
];
const FORM_LABELS = { contact: 'Contact form', volunteer: 'Volunteer', support: 'Support offer', subscribe: 'Newsletter' };
const FIELD_LABELS = {
    name: 'Name', email: 'Email', phone: 'Phone', subject: 'Subject', message: 'Message', province: 'Province',
    district: 'District', constituency: 'Constituency', ward: 'Ward', pollingStation: 'Polling station',
};

const sourceLabel = (m) => (m.source === 'email' ? 'Email' : FORM_LABELS[m.form_type] || 'Website');
const sender = (m) => m.from_name || m.from_email || 'Unknown sender';
const initials = (m) => sender(m).replace(/[^A-Za-z ]/g, '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';

function shortDate(iso) {
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    if (d.getFullYear() === now.getFullYear()) return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
const longDate = (iso) => new Date(iso).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// Renders received HTML in a sandbox with scripts disabled. Remote images stay blocked until the reader allows them.
const HtmlBody = ({ html }) => {
    const ref = useRef(null);
    const [showImages, setShowImages] = useState(false);
    const [height, setHeight] = useState(160);
    const csp = `default-src 'none'; style-src 'unsafe-inline'; font-src data:; img-src data: cid:${showImages ? ' https: http:' : ''};`;
    const doc = `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${csp}"><base target="_blank">
<style>body{margin:0;font:15px/1.6 -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#1d2a22;word-wrap:break-word}img{max-width:100%;height:auto}table{max-width:100%}</style></head><body>${html}</body></html>`;
    const fit = () => {
        try { setHeight(Math.min(Math.max(ref.current.contentDocument.body.scrollHeight + 16, 120), 4000)); } catch { /* ignore */ }
    };
    const hasRemote = /<img[^>]+src=["']?https?:/i.test(html);
    return (
        <>
            {hasRemote && !showImages && (
                <div className="ib-images">Remote images are hidden to protect your privacy. <button type="button" onClick={() => setShowImages(true)}>Show images</button></div>
            )}
            <iframe ref={ref} title="Email content" className="ib-frame" sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                srcDoc={doc} style={{ height }} onLoad={fit} />
        </>
    );
};

const Reader = ({ id, status, onChanged, onBack }) => {
    const [m, setM] = useState(null);
    const [reply, setReply] = useState('');
    const [composing, setComposing] = useState(false);
    const [sending, setSending] = useState(false);
    const composer = useRef(null);

    useEffect(() => {
        let live = true;
        setM(null); setComposing(false); setReply('');
        inboxApi.get(id).then((d) => { if (live) { setM(d); onChanged(); } }).catch((e) => toast.error(e.message));
        return () => { live = false; };
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => { if (composing) composer.current?.focus(); }, [composing]);

    if (!m) return <div className="ib-reader ib-reader-empty"><p>Opening message…</p></div>;

    const patch = async (changes, done) => {
        try { const r = await inboxApi.update(m.id, changes); setM({ ...m, ...r }); onChanged(); if (done) toast.success(done); } catch (e) { toast.error(e.message); }
    };
    const send = async () => {
        setSending(true);
        try {
            const r = await inboxApi.reply(m.id, reply);
            setM({ ...m, replies: [...(m.replies || []), r] });
            setReply(''); setComposing(false); onChanged();
            toast.success(`Reply sent to ${m.from_email}`);
        } catch (e) { toast.error(e.message); } finally { setSending(false); }
    };
    const openAttachment = async (a) => {
        try { const r = await inboxApi.attachment(m.id, a.id); window.open(r.url, '_blank', 'noopener'); } catch (e) { toast.error(e.message); }
    };
    const remove = async () => {
        if (!window.confirm('Delete this message permanently? This cannot be undone.')) return;
        try { await inboxApi.remove(m.id); toast.success('Message deleted'); onChanged(true); } catch (e) { toast.error(e.message); }
    };
    const fields = m.source === 'website' ? Object.entries(m.fields || {}) : [];

    return (
        <article className="ib-reader" aria-label="Message">
            <div className="ib-reader-bar">
                <button type="button" className="ib-back" onClick={onBack}>Back to list</button>
                <div className="ib-actions">
                    <button type="button" className="ib-primary" onClick={() => setComposing(true)} disabled={!m.from_email}>Reply</button>
                    <button type="button" onClick={() => patch({ starred: !m.starred })}>{m.starred ? 'Unstar' : 'Star'}</button>
                    <button type="button" onClick={() => patch({ read: false }, 'Marked as unread')}>Mark unread</button>
                    {m.archived_at
                        ? <><button type="button" onClick={() => patch({ archived: false }, 'Moved to inbox')}>Move to inbox</button>
                            <button type="button" className="ib-danger" onClick={remove}>Delete</button></>
                        : <button type="button" onClick={() => patch({ archived: true }, 'Archived')}>Archive</button>}
                </div>
            </div>

            <header className="ib-msg-head">
                <h3>{m.subject || '(no subject)'}</h3>
                <div className="ib-msg-meta">
                    <span className={`ib-avatar ib-avatar-${m.source}`} aria-hidden="true">{initials(m)}</span>
                    <div>
                        <div><strong>{sender(m)}</strong> {m.from_name && <span className="ib-addr">&lt;{m.from_email}&gt;</span>}</div>
                        <div className="ib-sub">
                            {m.source === 'email' && m.to_addresses?.length > 0 && <>To {m.to_addresses.join(', ')} · </>}
                            {longDate(m.received_at)}
                        </div>
                    </div>
                    <span className={`ib-tag ib-tag-${m.source}`}>{sourceLabel(m)}</span>
                </div>
            </header>

            <div className="ib-body">
                {m.source === 'website' ? (
                    <>
                        {m.fields?.message && <p className="ib-message">{m.fields.message}</p>}
                        <dl className="ib-fields">
                            {fields.filter(([k]) => k !== 'message').map(([k, v]) => (
                                <div key={k}><dt>{FIELD_LABELS[k] || k}</dt><dd>{k === 'email' ? <a href={`mailto:${v}`}>{v}</a> : v}</dd></div>
                            ))}
                        </dl>
                    </>
                ) : m.html_body ? <HtmlBody html={m.html_body} /> : <p className="ib-message">{m.text_body || '(This email has no text.)'}</p>}

                {m.attachments?.length > 0 && (
                    <div className="ib-attachments">
                        <h4>{m.attachments.length === 1 ? '1 attachment' : `${m.attachments.length} attachments`}</h4>
                        <ul>{m.attachments.filter((a) => !a.inline).map((a) => (
                            <li key={a.id}><button type="button" onClick={() => openAttachment(a)}>
                                <span className="ib-file">{(a.filename || 'file').split('.').pop().slice(0, 4).toUpperCase()}</span>
                                <span>{a.filename}<small>{a.size ? `${Math.max(1, Math.round(a.size / 1024))} KB` : ''}</small></span>
                            </button></li>
                        ))}</ul>
                    </div>
                )}
            </div>

            {m.replies?.length > 0 && (
                <section className="ib-thread" aria-label="Replies sent">
                    {m.replies.map((r) => (
                        <div key={r.id} className="ib-sent">
                            <div className="ib-sub">You replied{r.sent_by ? ` as ${r.sent_by}` : ''} · {longDate(r.sent_at)}</div>
                            <p>{r.body}</p>
                        </div>
                    ))}
                </section>
            )}

            {composing ? (
                <section className="ib-compose" aria-label="Write a reply">
                    <div className="ib-sub">To {m.from_email}{status?.replyTo ? ` · replies come back to ${status.replyTo}` : ''}</div>
                    <textarea ref={composer} rows={7} value={reply} onChange={(e) => setReply(e.target.value)} placeholder={`Write to ${m.from_name || m.from_email}…`} />
                    {!status?.sending && <p className="ib-warn">Sending is not set up yet: add RESEND_API_KEY on the server to send replies.</p>}
                    <div className="ib-compose-actions">
                        <button type="button" className="ib-primary" onClick={send} disabled={sending || reply.trim().length < 2 || !status?.sending}>{sending ? 'Sending…' : 'Send reply'}</button>
                        <button type="button" onClick={() => { setComposing(false); setReply(''); }}>Discard</button>
                        <span className="ib-sub">Sent on the official letterhead.</span>
                    </div>
                </section>
            ) : m.from_email && (
                <button type="button" className="ib-reply-bar" onClick={() => setComposing(true)}>Reply to {m.from_name || m.from_email}</button>
            )}
        </article>
    );
};

const InboxPanel = ({ onUnreadChange }) => {
    const [folder, setFolder] = useState('inbox');
    const [query, setQuery] = useState('');
    const [search, setSearch] = useState('');
    const [data, setData] = useState(null);
    const [selected, setSelected] = useState(null);
    const [status, setStatus] = useState(null);
    const [syncing, setSyncing] = useState(false);

    const load = useCallback((quiet) => {
        if (!quiet) setData((d) => (d ? { ...d, loading: true } : d));
        return inboxApi.list({ folder, q: search })
            .then((d) => { setData(d); onUnreadChange?.(d.counts.unread); })
            .catch((e) => { if (!quiet) toast.error(e.message); setData((d) => d || { messages: [], counts: {}, total: 0 }); });
    }, [folder, search, onUnreadChange]);

    useEffect(() => { load(); }, [load]);
    useEffect(() => { inboxApi.status().then(setStatus).catch(() => {}); }, []);
    useEffect(() => { const t = setInterval(() => load(true), 60000); return () => clearInterval(t); }, [load]);
    useEffect(() => { const t = setTimeout(() => setSearch(query.trim()), 350); return () => clearTimeout(t); }, [query]);

    const sync = async () => {
        setSyncing(true);
        try {
            const r = await inboxApi.sync();
            toast.success(r.imported ? `${r.imported} new email${r.imported === 1 ? '' : 's'} imported` : 'No new emails');
            load(true);
        } catch (e) { toast.error(e.message); } finally { setSyncing(false); }
    };
    const toggleStar = async (e, m) => {
        e.stopPropagation();
        try { await inboxApi.update(m.id, { starred: !m.starred }); load(true); } catch (err) { toast.error(err.message); }
    };
    const counts = data?.counts || {};

    return (
        <section className={`ib ${selected ? 'ib-has-selection' : ''}`} aria-label="Inbox">
            <div className="ib-top">
                <div>
                    <h2>Inbox</h2>
                    <p>Emails sent to the campaign and every message from the website’s forms, in one place.</p>
                </div>
                <div className="ib-top-tools">
                    <span className={`ib-conn ${status?.receiving ? 'on' : 'off'}`}>
                        {status?.receiving ? 'Receiving email' : 'Email receiving not connected'}
                    </span>
                    <button type="button" onClick={() => load()}>Refresh</button>
                    {status?.receiving && <button type="button" onClick={sync} disabled={syncing}>{syncing ? 'Checking…' : 'Check for new email'}</button>}
                </div>
            </div>

            <div className="ib-shell">
                <nav className="ib-folders" aria-label="Folders">
                    {FOLDERS.map(([key, label]) => (
                        <button key={key} type="button" aria-current={folder === key ? 'true' : undefined}
                            onClick={() => { setFolder(key); setSelected(null); }}>
                            <span>{label}</span>
                            {counts[key] > 0 && <span className={`ib-count ${key === 'unread' || key === 'inbox' ? 'strong' : ''}`}>{key === 'inbox' ? counts.unread || '' : counts[key]}</span>}
                        </button>
                    ))}
                </nav>

                <div className="ib-list-wrap">
                    <div className="ib-search">
                        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search sender, subject or text" aria-label="Search messages" />
                    </div>
                    {!data ? <p className="ib-empty">Loading messages…</p> : data.messages.length === 0 ? (
                        <div className="ib-empty">
                            <strong>{search ? 'No messages match your search.' : folder === 'archived' ? 'Nothing archived.' : 'No messages here yet.'}</strong>
                            {!search && folder === 'inbox' && <p>New emails and website form submissions will appear here as they arrive.</p>}
                        </div>
                    ) : (
                        <ul className="ib-list">
                            {data.messages.map((m) => (
                                <li key={m.id}>
                                    <button type="button" onClick={() => setSelected(m.id)}
                                        className={`ib-item ${!m.read_at ? 'unread' : ''} ${selected === m.id ? 'active' : ''}`}
                                        aria-current={selected === m.id ? 'true' : undefined}>
                                        <span className={`ib-avatar ib-avatar-${m.source}`} aria-hidden="true">{initials(m)}</span>
                                        <span className="ib-item-main">
                                            <span className="ib-item-row">
                                                <span className="ib-from">{sender(m)}</span>
                                                <time>{shortDate(m.received_at)}</time>
                                            </span>
                                            <span className="ib-subject">{m.subject || '(no subject)'}</span>
                                            <span className="ib-preview">{m.preview}</span>
                                            <span className="ib-item-row ib-item-tags">
                                                <span className={`ib-tag ib-tag-${m.source}`}>{sourceLabel(m)}</span>
                                                {m.attachment_count > 0 && <span className="ib-flag">{m.attachment_count} file{m.attachment_count > 1 ? 's' : ''}</span>}
                                                {m.replied_at && <span className="ib-flag">Replied</span>}
                                            </span>
                                        </span>
                                    </button>
                                    <button type="button" className={`ib-star ${m.starred ? 'on' : ''}`} aria-label={m.starred ? `Unstar message from ${sender(m)}` : `Star message from ${sender(m)}`}
                                        aria-pressed={m.starred} onClick={(e) => toggleStar(e, m)}>★</button>
                                </li>
                            ))}
                        </ul>
                    )}
                    {data?.total > data?.pageSize && <p className="ib-more">Showing the latest {data.pageSize} of {data.total}. Search to find older messages.</p>}
                </div>

                {selected
                    ? <Reader id={selected} status={status} onBack={() => setSelected(null)}
                        onChanged={(removed) => { if (removed === true) setSelected(null); load(true); }} />
                    : <div className="ib-reader ib-reader-empty"><p>Select a message to read it.</p></div>}
            </div>

            {status && !status.receiving && (
                <details className="ib-setup">
                    <summary>Connect the campaign email address</summary>
                    <ol>
                        <li>In Resend, open Emails → Receiving and add your domain (for example <code>bozplans.org</code>), then add the MX record Resend shows to the domain’s DNS.</li>
                        <li>In Resend, open Webhooks → Add webhook. Use <code>{(import.meta.env.VITE_API_URL || window.location.origin)}/api/inbox/webhook</code> and choose the <code>email.received</code> event.</li>
                        <li>Copy the webhook’s signing secret (starts with <code>whsec_</code>) into Railway as <code>RESEND_WEBHOOK_SECRET</code>, and set <code>INBOX_REPLY_TO</code> to your receiving address so replies come back here.</li>
                    </ol>
                    <p>Website form submissions already arrive here without this step.</p>
                </details>
            )}
        </section>
    );
};

export default InboxPanel;
