import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { leaveRequestsApi } from '../../api/leaveRequestsApi';

const cardStyle = { border: '1px solid #eee', borderRadius: '8px', padding: '18px', marginBottom: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' };
const inputStyle = { width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' };
const emptyForm = { employee_name: '', employee_role: '', leave_type: 'annual', start_date: '', end_date: '', reason: '' };

const leaveTypeLabel = { annual: 'Annual', sick: 'Sick', family: 'Family', unpaid: 'Unpaid', other: 'Other' };
const statusMeta = {
    pending: { label: 'Pending', color: '#b26a00', bg: '#fff3e0' },
    approved: { label: 'Approved', color: '#2e7d32', bg: '#e8f5e9' },
    declined: { label: 'Declined', color: '#c62828', bg: '#ffebee' },
};

const LeaveRegister = ({ canDecide }) => {
    const [requests, setRequests] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [busyId, setBusyId] = useState(null);
    const [loading, setLoading] = useState(false);

    const load = () => {
        setLoading(true);
        leaveRequestsApi.list()
            .then(setRequests)
            .catch((err) => toast.error(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        if (!form.employee_name.trim() || !form.start_date || !form.end_date) {
            toast.error('Employee name, start date, and end date are required');
            return;
        }
        setSubmitting(true);
        try {
            await leaveRequestsApi.submit(form);
            toast.success('Leave request logged');
            setForm(emptyForm);
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
            await leaveRequestsApi.decide(id, approved);
            toast.success(approved ? 'Leave approved' : 'Leave declined');
            load();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setBusyId(null);
        }
    };

    const pending = requests.filter((r) => r.status === 'pending');

    return (
        <div style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '8px' }}>Leave Register</h3>
            <p style={{ color: '#777', fontSize: '13px', marginBottom: '18px' }}>Log and track team leave requests.</p>

            <form onSubmit={submit} style={cardStyle}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <input style={inputStyle} name="employee_name" placeholder="Employee name" value={form.employee_name} onChange={change} />
                    <input style={inputStyle} name="employee_role" placeholder="Role (e.g. Foreman)" value={form.employee_role} onChange={change} />
                    <select style={inputStyle} name="leave_type" value={form.leave_type} onChange={change}>
                        {Object.entries(leaveTypeLabel).map(([v, l]) => <option key={v} value={v}>{l} Leave</option>)}
                    </select>
                    <div />
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 600 }}>Start date</label>
                        <input style={inputStyle} type="date" name="start_date" value={form.start_date} onChange={change} />
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 600 }}>End date</label>
                        <input style={inputStyle} type="date" name="end_date" value={form.end_date} onChange={change} />
                    </div>
                </div>
                <textarea style={{ ...inputStyle, marginTop: '10px', minHeight: '50px' }} name="reason" placeholder="Reason (optional)" value={form.reason} onChange={change} />
                <button type="submit" className="theme-btn" disabled={submitting} style={{ marginTop: '10px' }}>Log Leave Request</button>
            </form>

            {canDecide && pending.length > 0 && (
                <>
                    <h4 style={{ margin: '20px 0 10px' }}>Pending Approval ({pending.length})</h4>
                    {pending.map((r) => (
                        <div key={r.id} style={cardStyle}>
                            <strong>{r.employee_name}</strong> {r.employee_role && `— ${r.employee_role}`}
                            <p style={{ margin: '6px 0', fontSize: '13px', color: '#555' }}>
                                {leaveTypeLabel[r.leave_type]} leave · {new Date(r.start_date).toLocaleDateString()} – {new Date(r.end_date).toLocaleDateString()}
                            </p>
                            {r.reason && <p style={{ margin: '6px 0', fontSize: '13px', color: '#888' }}>{r.reason}</p>}
                            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
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

            <h4 style={{ margin: '20px 0 10px' }}>All Leave Requests</h4>
            {loading ? <p>Loading...</p> : requests.length === 0 ? (
                <p style={{ color: '#777' }}>No leave requests logged yet.</p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                                <th style={{ padding: '8px' }}>Employee</th>
                                <th style={{ padding: '8px' }}>Type</th>
                                <th style={{ padding: '8px' }}>Dates</th>
                                <th style={{ padding: '8px' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((r) => {
                                const meta = statusMeta[r.status];
                                return (
                                    <tr key={r.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                        <td style={{ padding: '8px' }}>{r.employee_name}</td>
                                        <td style={{ padding: '8px' }}>{leaveTypeLabel[r.leave_type]}</td>
                                        <td style={{ padding: '8px' }}>{new Date(r.start_date).toLocaleDateString()} – {new Date(r.end_date).toLocaleDateString()}</td>
                                        <td style={{ padding: '8px' }}>
                                            <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, color: meta.color, background: meta.bg }}>{meta.label}</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default LeaveRegister;
