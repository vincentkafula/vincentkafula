import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { registrationsApi } from '../../api/registrationsApi';

// Head Office review of Membership, Cooperative and Internship registrations.
const cell = { padding: 6, borderBottom: '1px solid #f0f0f0', fontSize: 13, verticalAlign: 'top' };
const btn = (bg) => ({ background: bg, color: '#fff', border: 0, borderRadius: 5, padding: '4px 9px', fontSize: 12, marginRight: 4, marginBottom: 4, cursor: 'pointer' });
const TYPES = { membership: 'Members', cooperative: 'Cooperatives', internship: 'Internships' };

const COLUMNS = {
    membership: [['Membership no.', (r) => r.membership_no],
        ['Name', (r) => <>{[r.first_name, r.middle_name, r.last_name].filter(Boolean).join(' ')}{r.gender && <><br /><small>{r.gender}{r.occupation ? ` · ${r.occupation}` : ''}</small></>}</>],
        ['NRC', (r) => r.nrc_number],
        ['Born', (r) => <>{r.date_of_birth?.slice(0, 10)}{r.place_of_birth && <><br /><small>{r.place_of_birth}{r.birth_district ? `, ${r.birth_district}` : ''}{r.birth_province ? `, ${r.birth_province}` : ''}</small></>}</>],
        ['Contact', (r) => <>{r.email}<br />{r.phone}{r.address && <><br /><small>{r.address}</small></>}</>],
        ['Location', (r) => <>{`${r.ward}, ${r.constituency}, ${r.district}, ${r.province}`}{r.polling_station && <><br /><small>Polling station: {r.polling_station}</small></>}</>],
        ['Village & chief', (r) => (r.village || r.chief_name) ? <>{r.village}{r.chief_name && <><br /><small>Chief {r.chief_name}{r.chiefdom ? ` (${r.chiefdom})` : ''}</small></>}</> : '—']],
    cooperative: [['Reference', (r) => r.reference_no], ['Name', (r) => r.name], ['Activity', (r) => r.activity],
        ['Chief', (r) => `${r.chief_name}${r.chiefdom ? ` (${r.chiefdom})` : ''}`], ['Chairperson', (r) => <>{r.chair_membership_no}<br />{r.chair_phone}</>],
        ['Ward', (r) => `${r.ward}, ${r.district}`], ['Members', (r) => r.member_nos?.join(', ')]],
    internship: [['Reference', (r) => r.reference_no], ['Membership no.', (r) => r.membership_no], ['Institution', (r) => r.institution],
        ['Course', (r) => `${r.course} (year ${r.year_of_study})`], ['Motivation', (r) => r.motivation]],
};

const RegistrationsPanel = () => {
    const [type, setType] = useState('membership');
    const [rows, setRows] = useState(null);
    const load = (t = type) => { setRows(null); registrationsApi.list(t).then(setRows).catch((e) => { toast.error(e.message); setRows([]); }); };
    useEffect(() => { load(type); }, [type]);

    const setStatus = async (r, status) => {
        const note = status === 'rejected' ? window.prompt('Reason (optional, kept on record):') ?? null : null;
        if (status === 'rejected' && note === null) return;
        try { await registrationsApi.setStatus(type, r.id, status, note); toast.success('Updated'); load(); } catch (e) { toast.error(e.message); }
    };

    return (
        <div style={{ marginTop: 50 }}>
            <h3 style={{ marginBottom: 6 }}>Registrations</h3>
            <p style={{ color: '#555', fontSize: 14 }}>Applications from the Registration page. Personal details and documents are confidential.</p>
            <div style={{ marginBottom: 12 }}>
                {Object.entries(TYPES).map(([k, label]) => (
                    <button key={k} style={btn(type === k ? '#ED6B37' : '#16182F')} onClick={() => setType(k)}>{label}</button>
                ))}
            </div>
            {rows === null ? <p>Loading…</p> : rows.length === 0 ? <p style={{ color: '#777' }}>No registrations yet.</p> : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr>
                            {[...COLUMNS[type].map((c) => c[0]), 'Documents', 'Received', 'Status', ''].map((h) => <th key={h} style={{ ...cell, textAlign: 'left', borderBottom: '1px solid #ddd' }}>{h}</th>)}
                        </tr></thead>
                        <tbody>
                            {rows.map((r) => (
                                <tr key={r.id}>
                                    {COLUMNS[type].map(([h, fn]) => <td key={h} style={cell}>{fn(r)}</td>)}
                                    <td style={cell}>{(r.documents || []).map((d) => (
                                        <div key={d.id}><button style={{ background: 'none', border: 0, color: '#ED6B37', textDecoration: 'underline', padding: 0, cursor: 'pointer', fontSize: 12 }}
                                            onClick={() => registrationsApi.downloadDocument(d.id, d.file_name).catch((e) => toast.error(e.message))}>{d.kind.replace('_', ' ')}</button></div>
                                    ))}</td>
                                    <td style={cell}>{new Date(r.created_at).toLocaleString('en-GB')}</td>
                                    <td style={{ ...cell, fontWeight: 700, color: r.status === 'approved' ? '#1F7A3A' : r.status === 'rejected' ? '#8a1c12' : '#B8860B' }}>
                                        {r.status}{r.reviewed_by && <div style={{ fontWeight: 400, color: '#777' }}>by {r.reviewed_by}</div>}
                                        {r.review_note && <div style={{ fontWeight: 400, color: '#777' }}>{r.review_note}</div>}
                                    </td>
                                    <td style={cell}>
                                        {r.status !== 'approved' && <button style={btn('#1F7A3A')} onClick={() => setStatus(r, 'approved')}>Approve</button>}
                                        {r.status !== 'rejected' && <button style={btn('#8a1c12')} onClick={() => setStatus(r, 'rejected')}>Reject</button>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default RegistrationsPanel;
