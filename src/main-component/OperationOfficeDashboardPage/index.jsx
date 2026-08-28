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
import { jobsheetsApi } from '../../api/jobsheetsApi';
import { teamBookingsApi } from '../../api/teamBookingsApi';
import { getAuth } from '../../api/authApi';
import WeeklyDeploymentBoard from '../../components/ops-dashboards/WeeklyDeploymentBoard';
import LeaveRegister from '../../components/ops-dashboards/LeaveRegister';
import SimpleLedgerModule from '../../components/ops-dashboards/SimpleLedgerModule';
import { paymentAuthorisationsApi, payrollApi, weeklyRegistersApi, oasysChecksApi } from '../../api/opsModulesApi';

const fmtR = (n) => `R${Number(n || 0).toFixed(2)}`;
const badge = (status, map) => {
    const m = map[status] || { color: '#555', bg: '#eee' };
    return <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, color: m.color, background: m.bg }}>{status}</span>;
};
const approvalColors = { pending: { color: '#b26a00', bg: '#fff3e0' }, approved: { color: '#2e7d32', bg: '#e8f5e9' }, declined: { color: '#c62828', bg: '#ffebee' } };
const oasysColors = { ok: { color: '#2e7d32', bg: '#e8f5e9' }, discrepancy: { color: '#c62828', bg: '#ffebee' } };

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

    const [confirmedJobsheets, setConfirmedJobsheets] = useState([]);
    const [serialedJobsheets, setSerialedJobsheets] = useState([]);
    const [jsBusyId, setJsBusyId] = useState(null);

    const [allBookings, setAllBookings] = useState([]);
    const loadBookings = () => {
        teamBookingsApi.list().then(setAllBookings).catch((err) => toast.error(err.message));
    };

    const loadJobsheets = () => {
        Promise.all([jobsheetsApi.list('confirmed'), jobsheetsApi.list('serialed')])
            .then(([c, s]) => { setConfirmedJobsheets(c); setSerialedJobsheets(s); })
            .catch((err) => toast.error(err.message));
    };

    const assignSerial = async (id) => {
        setJsBusyId(id);
        try {
            const updated = await jobsheetsApi.assignSerial(id);
            toast.success(`Serial number assigned: ${updated.serial_number}`);
            loadJobsheets();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setJsBusyId(null);
        }
    };

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

    useEffect(() => { load(); loadSchedules(); loadJobsheets(); loadBookings(); }, []);

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

                <h3 style={{ marginBottom: '18px' }}>Overview</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                    {[
                        ['Active Schedules', approvedSchedules.length],
                        ['Total Shifts Booked', allBookings.length],
                        ['Shifts Completed', allBookings.filter((b) => b.status === 'completed').length],
                        ['Pending Approvals', pendingSchedules.length + confirmedJobsheets.length],
                    ].map(([label, value]) => (
                        <div key={label} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '16px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                            <div style={{ fontSize: '24px', fontWeight: 700, color: '#1565C0' }}>{value}</div>
                            <div style={{ fontSize: '13px', color: '#777' }}>{label}</div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                    <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '18px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                        <h4 style={{ marginBottom: '12px' }}>KPI Scorecard</h4>
                        {(() => {
                            const totalShifts = allBookings.length;
                            const completedShifts = allBookings.filter((b) => b.status === 'completed').length;
                            const completionRate = totalShifts ? Math.round((completedShifts / totalShifts) * 100) : 0;
                            const totalInvoiced = serialedJobsheets.reduce((s, j) => s + Number(j.invoiceAmount || 0), 0);
                            const totalProfit = serialedJobsheets.reduce((s, j) => s + Number(j.adminFee || 0), 0);
                            const avgInvoice = serialedJobsheets.length ? totalInvoiced / serialedJobsheets.length : 0;
                            const kpis = [
                                ['Shift Completion Rate', `${completionRate}%`],
                                ['Total Invoiced', fmtR(totalInvoiced)],
                                ['Total Profit (Admin Fee)', fmtR(totalProfit)],
                                ['Average Invoice / Jobsheet', fmtR(avgInvoice)],
                            ];
                            return kpis.map(([label, value]) => (
                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0', fontSize: '14px' }}>
                                    <span style={{ color: '#666' }}>{label}</span>
                                    <strong>{value}</strong>
                                </div>
                            ));
                        })()}
                    </div>
                    <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '18px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                        <h4 style={{ marginBottom: '12px' }}>Shifts by Stream</h4>
                        {(() => {
                            const counts = { pre_school: 0, school: 0, technical_services: 0 };
                            approvedSchedules.forEach((j) => { if (counts[j.stream] !== undefined) counts[j.stream]++; });
                            const max = Math.max(1, ...Object.values(counts));
                            const colors = { pre_school: '#7c5a1e', school: '#0d6d4f', technical_services: '#0277bd' };
                            return Object.entries(counts).map(([stream, count]) => (
                                <div key={stream} style={{ marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                                        <span>{streamLabel(stream)}</span><span>{count}</span>
                                    </div>
                                    <div style={{ background: '#f0f0f0', borderRadius: '4px', height: '10px' }}>
                                        <div style={{ width: `${(count / max) * 100}%`, background: colors[stream], height: '10px', borderRadius: '4px' }} />
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                </div>

                <WeeklyDeploymentBoard title="WEEKLY DEPLOYMENT SCHEDULE" subtitle="ALL STREAMS" badgeLabel="WD" />

                <WeeklyDeploymentBoard
                    streamFilter="pre_school"
                    title="PRE-SCHOOL DEPLOYMENT SCHEDULE"
                    subtitle="PRE-SCHOOL DEPLOYMENT BOARD"
                    badgeLabel="PS"
                />

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

                <h3 style={{ margin: '40px 0 18px' }}>Jobsheet Review — Confirmed, Awaiting Serial Number</h3>
                <p style={{ color: '#777', fontSize: '13px', marginBottom: '18px' }}>
                    Day Admin has confirmed these shifts complete. Review the cash/EFT split and materials, then assign a serial number to move it into the accounting ledger.
                </p>
                {confirmedJobsheets.length === 0 ? (
                    <p style={{ color: '#777' }}>Nothing awaiting a serial number.</p>
                ) : confirmedJobsheets.map((j) => (
                    <div key={j.id} style={cardStyle}>
                        <strong>{j.team_name}</strong> — {j.partner_name} ({j.account_name})
                        <p style={{ margin: '6px 0', color: '#555', fontSize: '14px' }}>
                            {j.foreman_name}, {j.worker1_name}, {j.worker2_name} — Cash R{Number(j.totalCash).toFixed(2)} / EFT R{Number(j.totalEft).toFixed(2)}
                        </p>
                        <p style={{ margin: '6px 0', fontSize: '13px', color: '#888' }}>
                            Bags: {j.bags_issued} issued / {j.bags_returned} returned / {j.bags_used} used &nbsp;·&nbsp;
                            Gloves: {j.gloves_issued} issued / {j.gloves_returned} returned / {j.gloves_used} used
                        </p>
                        <p style={{ margin: '6px 0', fontWeight: 600 }}>Invoice Amount: R{Number(j.invoiceAmount).toFixed(2)}</p>
                        <button className="theme-btn" disabled={jsBusyId === j.id} onClick={() => assignSerial(j.id)}>Assign Serial Number</button>
                    </div>
                ))}

                <h3 style={{ margin: '40px 0 18px' }}>Serialed Jobsheets</h3>
                {serialedJobsheets.length === 0 ? <p style={{ color: '#777' }}>None yet.</p> : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                                    <th style={{ padding: '10px' }}>Serial No.</th>
                                    <th style={{ padding: '10px' }}>Team</th>
                                    <th style={{ padding: '10px' }}>Invoice Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {serialedJobsheets.map((j) => (
                                    <tr key={j.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                        <td style={{ padding: '10px' }}>{j.serial_number}</td>
                                        <td style={{ padding: '10px' }}>{j.team_name}</td>
                                        <td style={{ padding: '10px' }}>R{Number(j.invoiceAmount).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <h3 style={{ margin: '10px 0 8px' }}>Operations — All Shifts</h3>
                <p style={{ color: '#777', fontSize: '13px', marginBottom: '18px' }}>Every team booking across every status, for shift management at a glance.</p>
                {allBookings.length === 0 ? (
                    <p style={{ color: '#777', marginBottom: '30px' }}>No shifts booked yet.</p>
                ) : (
                    <div style={{ overflowX: 'auto', marginBottom: '30px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                                    <th style={{ padding: '8px' }}>Team</th>
                                    <th style={{ padding: '8px' }}>Foreman</th>
                                    <th style={{ padding: '8px' }}>Workers</th>
                                    <th style={{ padding: '8px' }}>Session</th>
                                    <th style={{ padding: '8px' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allBookings.map((b) => (
                                    <tr key={b.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                        <td style={{ padding: '8px' }}>{b.team_name}</td>
                                        <td style={{ padding: '8px' }}>{b.foreman_name}</td>
                                        <td style={{ padding: '8px' }}>{b.worker1_name}, {b.worker2_name}</td>
                                        <td style={{ padding: '8px' }}>{b.roll_call_session}</td>
                                        <td style={{ padding: '8px', textTransform: 'capitalize' }}>{b.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <LeaveRegister canDecide={true} />

                <SimpleLedgerModule
                    title="Payment Authorisations"
                    subtitle="Authorise ad-hoc payments outside the normal Jobsheet payroll flow."
                    api={paymentAuthorisationsApi}
                    decidable
                    fields={[
                        { name: 'payee_name', label: 'Payee name', required: true },
                        { name: 'amount', label: 'Amount (R)', type: 'number', required: true },
                        { name: 'purpose', label: 'Purpose', type: 'textarea', fullWidth: true },
                    ]}
                    columns={[
                        { key: 'payee_name', label: 'Payee' },
                        { key: 'amount', label: 'Amount', render: (r) => fmtR(r.amount) },
                        { key: 'purpose', label: 'Purpose' },
                        { key: 'status', label: 'Status', render: (r) => badge(r.status, approvalColors) },
                    ]}
                />

                <SimpleLedgerModule
                    title="Payroll"
                    subtitle="Log payroll entries per pay period."
                    api={payrollApi}
                    fields={[
                        { name: 'employee_name', label: 'Employee name', required: true },
                        { name: 'employee_role', label: 'Role' },
                        { name: 'period_start', label: 'Period start', type: 'date', required: true },
                        { name: 'period_end', label: 'Period end', type: 'date', required: true },
                        { name: 'hours_worked', label: 'Hours worked', type: 'number' },
                        { name: 'gross_pay', label: 'Gross pay (R)', type: 'number' },
                        { name: 'deductions', label: 'Deductions (R)', type: 'number' },
                    ]}
                    columns={[
                        { key: 'employee_name', label: 'Employee' },
                        { key: 'period', label: 'Period', render: (r) => `${new Date(r.period_start).toLocaleDateString()} – ${new Date(r.period_end).toLocaleDateString()}` },
                        { key: 'hours_worked', label: 'Hours' },
                        { key: 'gross_pay', label: 'Gross', render: (r) => fmtR(r.gross_pay) },
                        { key: 'deductions', label: 'Deductions', render: (r) => fmtR(r.deductions) },
                        { key: 'net_pay', label: 'Net Pay', render: (r) => fmtR(r.net_pay) },
                    ]}
                />

                <SimpleLedgerModule
                    title="Weekly Registers"
                    subtitle="Weekly attendance register per employee."
                    api={weeklyRegistersApi}
                    fields={[
                        { name: 'employee_name', label: 'Employee name', required: true },
                        { name: 'week_ending', label: 'Week ending', type: 'date', required: true },
                        { name: 'days_worked', label: 'Days worked', type: 'number' },
                        { name: 'hours_worked', label: 'Hours worked', type: 'number' },
                        { name: 'notes', label: 'Notes', type: 'textarea', fullWidth: true },
                    ]}
                    columns={[
                        { key: 'employee_name', label: 'Employee' },
                        { key: 'week_ending', label: 'Week Ending', render: (r) => new Date(r.week_ending).toLocaleDateString() },
                        { key: 'days_worked', label: 'Days' },
                        { key: 'hours_worked', label: 'Hours' },
                        { key: 'notes', label: 'Notes' },
                    ]}
                />

                <SimpleLedgerModule
                    title="OASys Reconciliation"
                    subtitle="Reconcile expected vs. actual amounts for a line item."
                    api={oasysChecksApi}
                    fields={[
                        { name: 'description', label: 'Description', required: true, fullWidth: true },
                        { name: 'expected_amount', label: 'Expected amount (R)', type: 'number' },
                        { name: 'actual_amount', label: 'Actual amount (R)', type: 'number' },
                    ]}
                    columns={[
                        { key: 'description', label: 'Description' },
                        { key: 'expected_amount', label: 'Expected', render: (r) => fmtR(r.expected_amount) },
                        { key: 'actual_amount', label: 'Actual', render: (r) => fmtR(r.actual_amount) },
                        { key: 'status', label: 'Status', render: (r) => badge(r.status, oasysColors) },
                    ]}
                />
            </div>
            <Footer />
            <Scrollbar />
        </Fragment>
    );
};

export default OperationOfficeDashboard;
