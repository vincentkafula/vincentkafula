import React, { Fragment, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Navbar2 from '../../components/Navbar2/Navbar2';
import DashboardTopbar from '../../components/ops-dashboards/DashboardTopbar';
import PageTitle from '../../components/pagetitle/PageTitle';
import Footer from '../../components/footer/Footer';
import Scrollbar from '../../components/scrollbar/scrollbar';
import StatusBadge from '../../components/ops-dashboards/StatusBadge';
import { quotationsApi } from '../../api/quotationsApi';
import { getAuth } from '../../api/authApi';

const cardStyle = { border: '1px solid #eee', borderRadius: '8px', padding: '22px', marginBottom: '18px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' };
const inputStyle = { width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' };

const ManagerDashboard = () => {
    const [pending, setPending] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [streamChoice, setStreamChoice] = useState({});
    const [monthlyChoice, setMonthlyChoice] = useState({});
    const [notes, setNotes] = useState({});
    const [busyId, setBusyId] = useState(null);

    const load = () => {
        setLoading(true);
        Promise.all([quotationsApi.list('office_approved'), quotationsApi.list()])
            .then(([officeApproved, all]) => {
                setPending(officeApproved);
                setHistory(all.filter((q) => q.status === 'manager_approved' || q.status === 'manager_rejected'));
                const defaults = {};
                officeApproved.forEach((q) => { defaults[q.id] = q.requested_stream || 'school'; });
                setStreamChoice((s) => ({ ...defaults, ...s }));
            })
            .catch((err) => toast.error(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const act = async (id, approved, isMonthly) => {
        if (approved && isMonthly && monthlyChoice[id] === undefined) {
            toast.error('Approve or decline the monthly payment terms first');
            return;
        }
        setBusyId(id);
        try {
            await quotationsApi.managerApprove(id, {
                approved,
                final_stream: streamChoice[id] || null,
                monthly_terms_approved: isMonthly ? !!monthlyChoice[id] : null,
                notes: notes[id] || '',
            });
            toast.success(approved ? 'Quotation given final approval' : 'Quotation rejected');
            load();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setBusyId(null);
        }
    };

    return (
        <Fragment>
            <Navbar2 />
            <DashboardTopbar />
            <PageTitle pageTitle={'Manager Dashboard'} pagesub={'Dashboard'} />
            <div className="container" style={{ padding: '80px 15px' }}>
                <div style={{ marginBottom: '24px' }}>
                    <p style={{ color: '#555', fontSize: '14px' }}>Approving as <strong>{getAuth()?.display_name}</strong></p>
                </div>

                <h3 style={{ marginBottom: '18px' }}>Awaiting Final Approval ({pending.length})</h3>
                {loading ? <p>Loading...</p> : pending.length === 0 ? (
                    <p style={{ color: '#777' }}>Nothing pending final approval right now.</p>
                ) : pending.map((q) => {
                    const isMonthly = q.payment_terms === 'monthly';
                    return (
                        <div key={q.id} style={cardStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                                <div>
                                    <strong>#{q.id} — {q.partner_name}</strong>
                                    <p style={{ margin: '6px 0', color: '#555', fontSize: '14px' }}>
                                        {q.num_foremen} Foreman / {q.num_workers} Workers / {q.num_operation_supervisors} Op. Supervisors — Approved amount: {q.office_approved_amount ? `R${q.office_approved_amount}` : '—'}
                                    </p>
                                    <p style={{ margin: '6px 0', fontSize: '13px', color: '#888' }}>
                                        Payment terms: <strong style={{ textTransform: 'capitalize' }}>{q.payment_terms}</strong>
                                    </p>
                                </div>
                                <StatusBadge status={q.status} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: isMonthly ? '1fr 1fr' : '1fr', gap: '10px', marginTop: '10px' }}>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 600 }}>Operation Management Stream</label>
                                    <select
                                        style={inputStyle}
                                        value={streamChoice[q.id] || 'school'}
                                        onChange={(e) => setStreamChoice((s) => ({ ...s, [q.id]: e.target.value }))}
                                    >
                                        <option value="pre_school">Pre-School</option>
                                        <option value="school">School</option>
                                        <option value="technical_services">Technical Services</option>
                                    </select>
                                </div>
                                {isMonthly && (
                                    <div>
                                        <label style={{ fontSize: '12px', fontWeight: 600 }}>Monthly Payment Terms</label>
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                                            <label style={{ fontSize: '13px' }}>
                                                <input type="radio" name={`monthly-${q.id}`} checked={monthlyChoice[q.id] === true} onChange={() => setMonthlyChoice((m) => ({ ...m, [q.id]: true }))} /> Approve terms
                                            </label>
                                            <label style={{ fontSize: '13px' }}>
                                                <input type="radio" name={`monthly-${q.id}`} checked={monthlyChoice[q.id] === false} onChange={() => setMonthlyChoice((m) => ({ ...m, [q.id]: false }))} /> Decline terms
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <textarea
                                style={{ ...inputStyle, marginTop: '10px', minHeight: '50px' }}
                                placeholder="Notes (optional)"
                                value={notes[q.id] || ''}
                                onChange={(e) => setNotes((n) => ({ ...n, [q.id]: e.target.value }))}
                            />

                            <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                                <button className="theme-btn" disabled={busyId === q.id} onClick={() => act(q.id, true, isMonthly)}>Give Final Approval</button>
                                <button
                                    disabled={busyId === q.id}
                                    onClick={() => act(q.id, false, isMonthly)}
                                    style={{ background: '#fff', color: '#c62828', border: '1px solid #c62828', borderRadius: '4px', padding: '10px 20px', cursor: 'pointer' }}
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    );
                })}

                <h3 style={{ margin: '40px 0 18px' }}>Recently Decided</h3>
                {history.length === 0 ? <p style={{ color: '#777' }}>Nothing decided yet.</p> : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                                    <th style={{ padding: '10px' }}>ID</th>
                                    <th style={{ padding: '10px' }}>Partner</th>
                                    <th style={{ padding: '10px' }}>Status</th>
                                    <th style={{ padding: '10px' }}>Decided By</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((q) => (
                                    <tr key={q.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                        <td style={{ padding: '10px' }}>#{q.id}</td>
                                        <td style={{ padding: '10px' }}>{q.partner_name}</td>
                                        <td style={{ padding: '10px' }}><StatusBadge status={q.status} /></td>
                                        <td style={{ padding: '10px' }}>{q.manager_approved_by || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <Footer />
            <Scrollbar />
        </Fragment>
    );
};

export default ManagerDashboard;
