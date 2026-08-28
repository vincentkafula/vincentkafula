import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const cardStyle = { border: '1px solid #eee', borderRadius: '8px', padding: '18px', marginBottom: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' };
const inputStyle = { width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' };

// A generic "log entries, list them in a table" module used for the import-driven
// OPHELP modules (Payroll, Payment Authorisations, Weekly Registers, OASys) that
// don't yet have an equivalent source file to import here — this gives the same
// dashboard shell, backed by real manual entry, ready for a real importer later.
const SimpleLedgerModule = ({ title, subtitle, api, fields, columns, decidable }) => {
    const [rows, setRows] = useState([]);
    const [form, setForm] = useState(() => Object.fromEntries(fields.map((f) => [f.name, f.default || ''])));
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [busyId, setBusyId] = useState(null);

    const load = () => {
        setLoading(true);
        api.list()
            .then(setRows)
            .catch((err) => toast.error(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        const missing = fields.filter((f) => f.required && !String(form[f.name] || '').trim());
        if (missing.length) {
            toast.error(`${missing[0].label} is required`);
            return;
        }
        setSubmitting(true);
        try {
            await api.submit(form);
            toast.success('Logged');
            setForm(Object.fromEntries(fields.map((f) => [f.name, f.default || ''])));
            load();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const decide = async (id, approved) => {
        setBusyId(id);
        try {
            await api.decide(id, approved);
            toast.success(approved ? 'Approved' : 'Declined');
            load();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setBusyId(null);
        }
    };

    const pending = decidable ? rows.filter((r) => r.status === 'pending') : [];

    return (
        <div style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '8px' }}>{title}</h3>
            {subtitle && <p style={{ color: '#777', fontSize: '13px', marginBottom: '18px' }}>{subtitle}</p>}

            <form onSubmit={submit} style={cardStyle}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {fields.map((f) => (
                        <div key={f.name} style={f.fullWidth ? { gridColumn: '1 / -1' } : undefined}>
                            {f.type === 'textarea' ? (
                                <textarea style={{ ...inputStyle, minHeight: '50px' }} name={f.name} placeholder={f.label} value={form[f.name]} onChange={change} />
                            ) : (
                                <>
                                    {f.type === 'date' && <label style={{ fontSize: '12px', fontWeight: 600 }}>{f.label}</label>}
                                    <input style={inputStyle} type={f.type || 'text'} name={f.name} placeholder={f.type === 'date' ? undefined : f.label} value={form[f.name]} onChange={change} />
                                </>
                            )}
                        </div>
                    ))}
                </div>
                <button type="submit" className="theme-btn" disabled={submitting} style={{ marginTop: '10px' }}>Log Entry</button>
            </form>

            {decidable && pending.length > 0 && (
                <>
                    <h4 style={{ margin: '20px 0 10px' }}>Pending Approval ({pending.length})</h4>
                    {pending.map((r) => (
                        <div key={r.id} style={cardStyle}>
                            {columns.map((c) => (
                                <span key={c.key} style={{ marginRight: '16px', fontSize: '13px' }}>
                                    <strong>{c.label}:</strong> {c.render ? c.render(r) : r[c.key]}
                                </span>
                            ))}
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button className="theme-btn" disabled={busyId === r.id} onClick={() => decide(r.id, true)}>Approve</button>
                                <button
                                    disabled={busyId === r.id}
                                    onClick={() => decide(r.id, false)}
                                    style={{ background: '#fff', color: '#c62828', border: '1px solid #c62828', borderRadius: '4px', padding: '10px 20px', cursor: 'pointer' }}
                                >
                                    Decline
                                </button>
                            </div>
                        </div>
                    ))}
                </>
            )}

            <h4 style={{ margin: '20px 0 10px' }}>All Entries</h4>
            {loading ? <p>Loading...</p> : rows.length === 0 ? (
                <p style={{ color: '#777' }}>No entries logged yet.</p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                                {columns.map((c) => <th key={c.key} style={{ padding: '8px' }}>{c.label}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r) => (
                                <tr key={r.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                    {columns.map((c) => <td key={c.key} style={{ padding: '8px' }}>{c.render ? c.render(r) : r[c.key]}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default SimpleLedgerModule;
