import React, { Fragment, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Navbar2 from '../../components/Navbar2/Navbar2';
import PageTitle from '../../components/pagetitle/PageTitle';
import Footer from '../../components/footer/Footer';
import Scrollbar from '../../components/scrollbar/scrollbar';
import StatusBadge from '../../components/ops-dashboards/StatusBadge';
import { quotationsApi } from '../../api/quotationsApi';

const cardStyle = { border: '1px solid #eee', borderRadius: '8px', padding: '22px', marginBottom: '18px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' };
const inputStyle = { width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' };

const streamLabel = (s) => ({ pre_school: 'Pre-School', school: 'School', technical_services: 'Technical Services' }[s] || '—');

const OpManagementDashboard = () => {
    const [pending, setPending] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [notes, setNotes] = useState({});
    const [reviewer, setReviewer] = useState('');
    const [busyId, setBusyId] = useState(null);

    const load = () => {
        setLoading(true);
        Promise.all([quotationsApi.list('submitted'), quotationsApi.list()])
            .then(([sub, all]) => {
                setPending(sub);
                setHistory(all.filter((q) => q.status === 'om_approved' || q.status === 'om_rejected'));
            })
            .catch((err) => toast.error(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const act = async (id, approved) => {
        setBusyId(id);
        try {
            await quotationsApi.omReview(id, { approved, reviewer_name: reviewer || 'Operation Management', notes: notes[id] || '' });
            toast.success(approved ? 'Marked feasible and approved' : 'Request rejected');
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
            <PageTitle pageTitle={'Operation Management Dashboard'} pagesub={'Dashboard'} />
            <div className="container" style={{ padding: '80px 15px' }}>
                <div style={{ marginBottom: '24px', maxWidth: '360px' }}>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Reviewing as</label>
                    <input style={inputStyle} placeholder="Your name" value={reviewer} onChange={(e) => setReviewer(e.target.value)} />
                </div>

                <h3 style={{ marginBottom: '18px' }}>Awaiting Feasibility Review ({pending.length})</h3>
                {loading ? <p>Loading...</p> : pending.length === 0 ? (
                    <p style={{ color: '#777' }}>Nothing pending review right now.</p>
                ) : pending.map((q) => (
                    <div key={q.id} style={cardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                            <div>
                                <strong>#{q.id} — {q.partner_name}</strong>
                                <p style={{ margin: '6px 0', color: '#555', fontSize: '14px' }}>
                                    {q.num_foremen} Foreman / {q.num_workers} Workers / {q.num_operation_supervisors} Op. Supervisors — Requested stream: {streamLabel(q.requested_stream)}
                                </p>
                                {q.task_details && <p style={{ margin: '6px 0', fontSize: '14px' }}>{q.task_details}</p>}
                                {q.location_address && <p style={{ margin: '6px 0', fontSize: '13px', color: '#888' }}>📍 {q.location_address}</p>}
                            </div>
                            <StatusBadge status={q.status} />
                        </div>
                        <textarea
                            style={{ ...inputStyle, marginTop: '10px', minHeight: '60px' }}
                            placeholder="Notes (optional)"
                            value={notes[q.id] || ''}
                            onChange={(e) => setNotes((n) => ({ ...n, [q.id]: e.target.value }))}
                        />
                        <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                            <button className="theme-btn" disabled={busyId === q.id} onClick={() => act(q.id, true)}>Approve Feasibility</button>
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

                <h3 style={{ margin: '40px 0 18px' }}>Recently Reviewed</h3>
                {history.length === 0 ? <p style={{ color: '#777' }}>Nothing reviewed yet.</p> : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                                    <th style={{ padding: '10px' }}>ID</th>
                                    <th style={{ padding: '10px' }}>Partner</th>
                                    <th style={{ padding: '10px' }}>Status</th>
                                    <th style={{ padding: '10px' }}>Reviewed By</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((q) => (
                                    <tr key={q.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                        <td style={{ padding: '10px' }}>#{q.id}</td>
                                        <td style={{ padding: '10px' }}>{q.partner_name}</td>
                                        <td style={{ padding: '10px' }}><StatusBadge status={q.status} /></td>
                                        <td style={{ padding: '10px' }}>{q.om_reviewed_by || '—'}</td>
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

export default OpManagementDashboard;
