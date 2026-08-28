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

const OperationOfficeDashboard = () => {
    const [pending, setPending] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [amounts, setAmounts] = useState({});
    const [notes, setNotes] = useState({});
    const [busyId, setBusyId] = useState(null);

    const load = () => {
        setLoading(true);
        Promise.all([quotationsApi.list('om_approved'), quotationsApi.list()])
            .then(([omApproved, all]) => {
                setPending(omApproved);
                setHistory(all.filter((q) => q.status === 'office_approved' || q.status === 'office_rejected'));
            })
            .catch((err) => toast.error(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const act = async (id, approved) => {
        if (approved && !amounts[id]) {
            toast.error('Enter an approved amount first');
            return;
        }
        setBusyId(id);
        try {
            await quotationsApi.officeApprove(id, {
                approved,
                approved_amount: amounts[id] ? Number(amounts[id]) : null,
                notes: notes[id] || '',
            });
            toast.success(approved ? 'Amount approved' : 'Request rejected');
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
            <PageTitle pageTitle={'Operation Office Dashboard'} pagesub={'Dashboard'} />
            <div className="container" style={{ padding: '80px 15px' }}>
                <div style={{ marginBottom: '24px' }}>
                    <p style={{ color: '#555', fontSize: '14px' }}>Approving as <strong>{getAuth()?.display_name}</strong></p>
                </div>

                <h3 style={{ marginBottom: '18px' }}>Awaiting Amount Approval ({pending.length})</h3>
                {loading ? <p>Loading...</p> : pending.length === 0 ? (
                    <p style={{ color: '#777' }}>Nothing pending amount approval right now.</p>
                ) : pending.map((q) => (
                    <div key={q.id} style={cardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                            <div>
                                <strong>#{q.id} — {q.partner_name}</strong>
                                <p style={{ margin: '6px 0', color: '#555', fontSize: '14px' }}>
                                    {q.num_foremen} Foreman / {q.num_workers} Workers / {q.num_operation_supervisors} Op. Supervisors — {q.payment_terms} terms
                                </p>
                                {q.om_notes && <p style={{ margin: '6px 0', fontSize: '13px', color: '#888' }}>OM notes: {q.om_notes}</p>}
                            </div>
                            <StatusBadge status={q.status} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '10px', marginTop: '10px' }}>
                            <input
                                style={inputStyle}
                                type="number"
                                placeholder="Approved amount (R)"
                                value={amounts[q.id] || ''}
                                onChange={(e) => setAmounts((a) => ({ ...a, [q.id]: e.target.value }))}
                            />
                            <input
                                style={inputStyle}
                                placeholder="Notes (optional)"
                                value={notes[q.id] || ''}
                                onChange={(e) => setNotes((n) => ({ ...n, [q.id]: e.target.value }))}
                            />
                        </div>
                        <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                            <button className="theme-btn" disabled={busyId === q.id} onClick={() => act(q.id, true)}>Approve Amount</button>
                            <button
                                disabled={busyId === q.id}
                                onClick={() => act(q.id, false)}
                                style={{ background: '#fff', color: '#c62828', border: '1px solid #c62828', borderRadius: '4px', padding: '10px 20px', cursor: 'pointer' }}
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                ))}

                <h3 style={{ margin: '40px 0 18px' }}>Recently Processed</h3>
                {history.length === 0 ? <p style={{ color: '#777' }}>Nothing processed yet.</p> : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                                    <th style={{ padding: '10px' }}>ID</th>
                                    <th style={{ padding: '10px' }}>Partner</th>
                                    <th style={{ padding: '10px' }}>Amount</th>
                                    <th style={{ padding: '10px' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((q) => (
                                    <tr key={q.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                        <td style={{ padding: '10px' }}>#{q.id}</td>
                                        <td style={{ padding: '10px' }}>{q.partner_name}</td>
                                        <td style={{ padding: '10px' }}>{q.office_approved_amount ? `R${q.office_approved_amount}` : '—'}</td>
                                        <td style={{ padding: '10px' }}><StatusBadge status={q.status} /></td>
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

export default OperationOfficeDashboard;
