import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { teamProfilesApi } from '../../api/teamProfilesApi';
import { getAuth } from '../../api/authApi';

// Team & Candidates register.
// Editors (News Manager, Head Office) add and edit profiles, set pending statuses and upload documents.
// Only Head Office can confirm or reject an appointment, publish, unpublish or delete.

const EMPTY = { full_name: '', role_title: '', region: '', bio: '', photo_url: '', status: 'candidate_for_appointment' };
const PENDING = ['candidate_for_appointment', 'under_consideration', 'nominee', 'appointment_pending'];

const box = { border: '1px solid #e6e6e6', borderRadius: 8, padding: 18, marginBottom: 18, background: '#fff' };
const input = { width: '100%', padding: '8px 10px', border: '1px solid #ccc', borderRadius: 6, marginBottom: 10, fontSize: 14 };
const btn = (bg = '#16182F') => ({ background: bg, color: '#fff', border: 0, borderRadius: 6, padding: '7px 12px', fontSize: 13, marginRight: 6, marginBottom: 6, cursor: 'pointer' });
const badge = (bg) => ({ display: 'inline-block', padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 700, background: bg, color: '#fff', marginRight: 6 });
const fmt = (d) => (d ? new Date(d).toLocaleString('en-GB') : '');

const readFile = (file) => new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1]);
    r.onerror = () => reject(new Error('Could not read the file'));
    r.readAsDataURL(file);
});

const ProfileCard = ({ p, labels, isApprover, onChanged }) => {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(p);
    const [appoint, setAppoint] = useState({ appointment_reference: p.appointment_reference || '', appointment_date: p.appointment_date ? p.appointment_date.slice(0, 10) : '' });
    const [docs, setDocs] = useState(null);
    const [busy, setBusy] = useState(false);

    const run = async (fn, ok) => {
        setBusy(true);
        try { await fn(); if (ok) toast.success(ok); onChanged(); } catch (err) { toast.error(err.message); } finally { setBusy(false); }
    };
    const loadDocs = () => teamProfilesApi.documents(p.id).then(setDocs).catch((e) => toast.error(e.message));

    const upload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { toast.error('Documents must be smaller than 5 MB.'); return; }
        await run(async () => {
            await teamProfilesApi.uploadDocument(p.id, { file_name: file.name, mime_type: file.type, data_base64: await readFile(file) });
            await loadDocs();
        }, 'Document uploaded');
        e.target.value = '';
    };

    const statusColour = p.status === 'appointed' ? '#1F7A3A' : p.status === 'rejected' ? '#8a1c12' : '#B8860B';

    return (
        <div style={box}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div>
                    <h4 style={{ margin: '0 0 6px' }}>{p.full_name}</h4>
                    <div style={{ fontSize: 14, color: '#555', marginBottom: 6 }}>{p.role_title}{p.region ? ` · ${p.region}` : ''}</div>
                    <span style={badge(statusColour)}>{labels[p.status] || p.status}</span>
                    <span style={badge(p.published ? '#1F7A3A' : '#777')}>{p.published ? 'Published' : 'Not published'}</span>
                    <span style={{ fontSize: 12, color: '#777' }}>{p.document_count} document(s)</span>
                    {p.status === 'appointed' && (
                        <div style={{ fontSize: 12, color: '#555', marginTop: 6 }}>
                            Confirmed by {p.approved_by} on {fmt(p.approved_at)}. Reference: {p.appointment_reference || '—'}. Appointment date: {p.appointment_date ? p.appointment_date.slice(0, 10) : '—'}
                        </div>
                    )}
                </div>
                <div>
                    <button style={btn('#555')} disabled={busy} onClick={() => { setEditing(!editing); setDraft(p); }}>{editing ? 'Cancel' : 'Edit details'}</button>
                    <button style={btn('#555')} disabled={busy} onClick={() => (docs ? setDocs(null) : loadDocs())}>{docs ? 'Hide documents' : 'Documents'}</button>
                    {isApprover && (p.published
                        ? <button style={btn('#777')} disabled={busy} onClick={() => run(() => teamProfilesApi.unpublish(p.id), 'Profile taken offline')}>Unpublish</button>
                        : p.status !== 'rejected' && <button style={btn('#1F7A3A')} disabled={busy} onClick={() => run(() => teamProfilesApi.publish(p.id), 'Profile published')}>Approve & publish</button>)}
                    {isApprover && <button style={btn('#8a1c12')} disabled={busy} onClick={() => window.confirm(`Delete ${p.full_name}? The audit trail is kept.`) && run(() => teamProfilesApi.remove(p.id), 'Profile deleted')}>Delete</button>}
                </div>
            </div>

            {editing && (
                <div style={{ marginTop: 14 }}>
                    <input style={input} value={draft.full_name || ''} onChange={(e) => setDraft({ ...draft, full_name: e.target.value })} placeholder="Full name (as on official records)" />
                    <input style={input} value={draft.role_title || ''} onChange={(e) => setDraft({ ...draft, role_title: e.target.value })} placeholder="Role, e.g. Regional Representative" />
                    <input style={input} value={draft.region || ''} onChange={(e) => setDraft({ ...draft, region: e.target.value })} placeholder="Province or region (optional)" />
                    <input style={input} value={draft.photo_url || ''} onChange={(e) => setDraft({ ...draft, photo_url: e.target.value })} placeholder="Photo URL of an authorised photograph (optional)" />
                    <textarea style={{ ...input, minHeight: 100 }} value={draft.bio || ''} onChange={(e) => setDraft({ ...draft, bio: e.target.value })} placeholder="Verified biography (optional)" />
                    <button style={btn()} disabled={busy} onClick={() => run(async () => {
                        await teamProfilesApi.update(p.id, { full_name: draft.full_name, role_title: draft.role_title, region: draft.region, bio: draft.bio, photo_url: draft.photo_url });
                        setEditing(false);
                    }, p.published && !isApprover ? 'Saved. The profile is offline until Head Office approves it again.' : 'Saved')}>Save changes</button>
                </div>
            )}

            <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #eee' }}>
                <strong style={{ fontSize: 14 }}>Status</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {PENDING.map((s) => (
                        <button key={s} style={btn(p.status === s ? '#ED6B37' : '#999')} disabled={busy || p.status === s}
                            onClick={() => run(() => teamProfilesApi.setStatus(p.id, { status: s }), 'Status updated')}>{labels[s]}</button>
                    ))}
                </div>
                {isApprover ? (
                    <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, alignItems: 'end' }}>
                        <div>
                            <label style={{ fontSize: 12 }}>Appointment reference (letter, resolution or record no.)</label>
                            <input style={input} value={appoint.appointment_reference} onChange={(e) => setAppoint({ ...appoint, appointment_reference: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ fontSize: 12 }}>Date the appointment was confirmed</label>
                            <input style={input} type="date" value={appoint.appointment_date} onChange={(e) => setAppoint({ ...appoint, appointment_date: e.target.value })} />
                        </div>
                        <div>
                            <button style={btn('#1F7A3A')} disabled={busy} onClick={() => window.confirm(`Confirm that ${p.full_name} has been officially appointed?`) && run(() => teamProfilesApi.setStatus(p.id, { status: 'appointed', ...appoint }), 'Appointment confirmed')}>Confirm appointment</button>
                            <button style={btn('#8a1c12')} disabled={busy || p.status === 'rejected'} onClick={() => window.confirm(`Mark ${p.full_name} as not appointed? The profile will be taken offline.`) && run(() => teamProfilesApi.setStatus(p.id, { status: 'rejected' }), 'Marked as not appointed')}>Reject</button>
                        </div>
                    </div>
                ) : (
                    <p style={{ fontSize: 12, color: '#777', marginTop: 8 }}>Only Head Office can confirm or reject an appointment and publish profiles.</p>
                )}
            </div>

            {docs && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #eee' }}>
                    <strong style={{ fontSize: 14 }}>Appointment documents</strong> <span style={{ fontSize: 12, color: '#777' }}>(private: never shown on the website)</span>
                    {docs.length === 0 ? <p style={{ fontSize: 13, color: '#777' }}>No documents uploaded.</p> : (
                        <ul style={{ fontSize: 13, marginTop: 8 }}>
                            {docs.map((d) => (
                                <li key={d.id}>
                                    <button style={{ background: 'none', border: 0, color: '#ED6B37', textDecoration: 'underline', padding: 0, cursor: 'pointer' }}
                                        onClick={() => teamProfilesApi.downloadDocument(d.id, d.file_name).catch((e) => toast.error(e.message))}>{d.file_name}</button>
                                    {' '}— uploaded by {d.uploaded_by} on {fmt(d.uploaded_at)}
                                </li>
                            ))}
                        </ul>
                    )}
                    <label style={{ fontSize: 13 }}>Upload a letter, resolution or record (PDF, Word or image, max 5 MB): </label>{' '}
                    <input type="file" accept=".pdf,.doc,.docx,image/png,image/jpeg" onChange={upload} disabled={busy} />
                </div>
            )}
        </div>
    );
};

const TeamProfilesManager = () => {
    const isApprover = getAuth()?.role === 'head-office';
    const [profiles, setProfiles] = useState([]);
    const [labels, setLabels] = useState({});
    const [form, setForm] = useState(EMPTY);
    const [audit, setAudit] = useState(null);
    const [saving, setSaving] = useState(false);

    const load = () => teamProfilesApi.listAll().then(setProfiles).catch((e) => toast.error(e.message));
    useEffect(() => {
        load();
        teamProfilesApi.statuses().then((s) => setLabels(Object.fromEntries(s.map((x) => [x.value, x.label])))).catch(() => {});
    }, []);

    const create = async (e) => {
        e.preventDefault();
        if (!form.full_name.trim() || !form.role_title.trim()) { toast.error('Enter the full name and role.'); return; }
        setSaving(true);
        try {
            await teamProfilesApi.create(form);
            setForm(EMPTY);
            toast.success('Profile added. It stays private until Head Office approves and publishes it.');
            load();
        } catch (err) { toast.error(err.message); } finally { setSaving(false); }
    };

    return (
        <div style={{ marginTop: 50 }}>
            <h3 style={{ marginBottom: 6 }}>Team & Candidates</h3>
            <p style={{ color: '#555', fontSize: 14, maxWidth: 820 }}>
                Add only real people, using names and details from official records. New profiles start as
                “Candidate for Appointment” and are private. “Appointed” can only be set by Head Office with an appointment
                reference or uploaded document. Only approved, published profiles appear on the website.
            </p>

            <form onSubmit={create} style={box}>
                <strong>Add a team member or candidate</strong>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginTop: 10 }}>
                    <input style={input} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Full name (as on official records)" />
                    <input style={input} value={form.role_title} onChange={(e) => setForm({ ...form, role_title: e.target.value })} placeholder="Role, e.g. Regional Representative" />
                    <input style={input} value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="Province or region (optional)" />
                    <select style={input} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                        {PENDING.map((s) => <option key={s} value={s}>{labels[s] || s}</option>)}
                    </select>
                </div>
                <input style={input} value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} placeholder="Photo URL of an authorised photograph (optional)" />
                <textarea style={{ ...input, minHeight: 80 }} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Verified biography (optional)" />
                <button type="submit" style={btn('#ED6B37')} disabled={saving}>Add profile</button>
            </form>

            {profiles.length === 0 ? <p style={{ color: '#777' }}>No profiles yet.</p> : profiles.map((p) => (
                <ProfileCard key={`${p.id}-${p.updated_at}`} p={p} labels={labels} isApprover={isApprover} onChanged={load} />
            ))}

            <div style={{ marginTop: 20 }}>
                <button style={btn('#555')} onClick={() => (audit ? setAudit(null) : teamProfilesApi.audit().then(setAudit).catch((e) => toast.error(e.message)))}>
                    {audit ? 'Hide audit trail' : 'Show audit trail'}
                </button>
                {audit && (
                    <div style={{ overflowX: 'auto', marginTop: 10 }}>
                        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                            <thead><tr>{['When', 'Who', 'Profile', 'Action', 'Details'].map((h) => <th key={h} style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 6 }}>{h}</th>)}</tr></thead>
                            <tbody>
                                {audit.map((a) => (
                                    <tr key={a.id}>
                                        <td style={{ padding: 6, borderBottom: '1px solid #f0f0f0', whiteSpace: 'nowrap' }}>{fmt(a.created_at)}</td>
                                        <td style={{ padding: 6, borderBottom: '1px solid #f0f0f0' }}>{a.changed_by}</td>
                                        <td style={{ padding: 6, borderBottom: '1px solid #f0f0f0' }}>{a.full_name || a.details?.full_name || '(deleted)'}</td>
                                        <td style={{ padding: 6, borderBottom: '1px solid #f0f0f0' }}>{a.action.replace(/_/g, ' ')}</td>
                                        <td style={{ padding: 6, borderBottom: '1px solid #f0f0f0', fontFamily: 'monospace', fontSize: 12 }}>{JSON.stringify(a.details)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamProfilesManager;
