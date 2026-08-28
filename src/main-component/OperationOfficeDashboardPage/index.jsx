import React, { Fragment, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Navbar2 from '../../components/Navbar2/Navbar2';
import DashboardTopbar from '../../components/ops-dashboards/DashboardTopbar';
import PageTitle from '../../components/pagetitle/PageTitle';
import Footer from '../../components/footer/Footer';
import Scrollbar from '../../components/scrollbar/scrollbar';
import StatusBadge from '../../components/ops-dashboards/StatusBadge';
import { quotationsApi } from '../../api/quotationsApi';
import { scheduledJobsApi } from '../../api/scheduledJobsApi';
import { getAuth } from '../../api/authApi';

const streamLabel = (s) => ({ pre_school: 'Pre-School', school: 'School', technical_services: 'Technical Services' }[s] || s);

const cardStyle = { border: '1px solid #eee', borderRadius: '8px', padding: '22px', marginBottom: '18px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' };
const inputStyle = { width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' };

const OperationOfficeDashboard = () => {
    const [pending, setPending] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [amounts, setAmounts] = useState({});
    const [notes, setNotes] = useState({});
    const [busyId, setBusyId] = useState(null);

    const [pendingSchedules, setPendingSchedules] = useState([]);
    const [approvedSchedules, setApprovedSchedules] = useState([]);
    const [accountNames, setAccountNames] = useState({});
    const [scheduledDates, setScheduledDates] = useState({});
    const [schedBusyId, setSchedBusyId] = useState(null);

    const loadSchedules = () => {
        Promise.all([scheduledJobsApi.list('pending'), scheduledJobsApi.list('approved')])
            .then(([p, a]) => { setPendingSchedules(p); setApprovedSchedules(a); })
            .catch((err) => toast.error(err.message));
    };

    const approveSchedule = async (id) => {
        if (!accountNames[id]?.trim()) {
            toast.error('Enter the account name for this schedule first');
            return;
        }
        setSchedBusyId(id);
        try {
            await scheduledJobsApi.approve(id, { account_name: accountNames[id], scheduled_date: scheduledDates[id] || null });
            toast.success('Schedule approved — now visible to Teams');
            loadSchedules();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSchedBusyId(null);
        }
    };

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

    useEffect(() => { load(); loadSchedules(); }, []);

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

                <h3 style={{ margin: '40px 0 18px' }}>Scheduling Management</h3>
                <p style={{ color: '#777', fontSize: '13px', marginBottom: '18px' }}>
                    Approved quotations land here for scheduling. Confirm the account name and (optionally) a date, then approve — the schedule becomes visible to Teams immediately.
                </p>
                {pendingSchedules.length === 0 ? (
                    <p style={{ color: '#777' }}>Nothing awaiting scheduling right now.</p>
                ) : pendingSchedules.map((job) => (
                    <div key={job.id} style={cardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                            <div>
                                <strong>Job #{job.id} — {job.partner_name}</strong>
                                <p style={{ margin: '6px 0', color: '#555', fontSize: '14px' }}>
                                    {job.num_foremen} Foreman / {job.num_workers} Workers — Stream: {streamLabel(job.stream)}
                                </p>
                                {job.location_address && <p style={{ margin: '6px 0', fontSize: '13px', color: '#888' }}>📍 {job.location_address}</p>}
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '10px', marginTop: '10px' }}>
                            <input
                                style={inputStyle}
                                placeholder="Account name"
                                value={accountNames[job.id] || ''}
                                onChange={(e) => setAccountNames((a) => ({ ...a, [job.id]: e.target.value }))}
                            />
                            <input
                                style={inputStyle}
                                type="date"
                                value={scheduledDates[job.id] || ''}
                                onChange={(e) => setScheduledDates((d) => ({ ...d, [job.id]: e.target.value }))}
                            />
                        </div>
                        <div style={{ marginTop: '10px' }}>
                            <button className="theme-btn" disabled={schedBusyId === job.id} onClick={() => approveSchedule(job.id)}>Approve Schedule</button>
                        </div>
                    </div>
                ))}

                <h3 style={{ margin: '40px 0 18px' }}>Approved Schedules</h3>
                {approvedSchedules.length === 0 ? <p style={{ color: '#777' }}>None approved yet.</p> : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                                    <th style={{ padding: '10px' }}>Job #</th>
                                    <th style={{ padding: '10px' }}>Partner</th>
                                    <th style={{ padding: '10px' }}>Account Name</th>
                                    <th style={{ padding: '10px' }}>Stream</th>
                                    <th style={{ padding: '10px' }}>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {approvedSchedules.map((job) => (
                                    <tr key={job.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                        <td style={{ padding: '10px' }}>#{job.id}</td>
                                        <td style={{ padding: '10px' }}>{job.partner_name}</td>
                                        <td style={{ padding: '10px' }}>{job.account_name}</td>
                                        <td style={{ padding: '10px' }}>{streamLabel(job.stream)}</td>
                                        <td style={{ padding: '10px' }}>{job.scheduled_date ? new Date(job.scheduled_date).toLocaleDateString() : '—'}</td>
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
