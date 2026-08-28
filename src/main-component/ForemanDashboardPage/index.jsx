import React, { Fragment, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Navbar2 from '../../components/Navbar2/Navbar2';
import DashboardTopbar from '../../components/ops-dashboards/DashboardTopbar';
import PageTitle from '../../components/pagetitle/PageTitle';
import Footer from '../../components/footer/Footer';
import Scrollbar from '../../components/scrollbar/scrollbar';
import { teamBookingsApi } from '../../api/teamBookingsApi';
import { jobsheetsApi } from '../../api/jobsheetsApi';
import { getAuth } from '../../api/authApi';

const cardStyle = { border: '1px solid #eee', borderRadius: '8px', padding: '22px', marginBottom: '18px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' };
const inputStyle = { width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' };
const fmt = (n) => `R${Number(n || 0).toFixed(2)}`;

const emptyJobsheet = () => ({
    shift_hours: '4', qualified: true, labour_total_contracted: '385',
    foreman_payment_method: 'cash', foreman_amount: '',
    worker1_payment_method: 'cash', worker1_amount: '',
    worker2_payment_method: 'cash', worker2_amount: '',
    extra_amount: '0', six_x_reward: '0', transport_amount: '0',
    charge_materials: true,
    bags_issued: '0', bags_returned: '0', bags_used: '0',
    gloves_issued: '0', gloves_returned: '0', gloves_used: '0',
    other_amount: '0', other_notes: '',
});

const ForemanDashboard = () => {
    const [deployed, setDeployed] = useState([]);
    const [jobsheets, setJobsheets] = useState([]);
    const [forms, setForms] = useState({});
    const [busyId, setBusyId] = useState(null);
    const [loading, setLoading] = useState(false);

    const load = () => {
        setLoading(true);
        Promise.all([teamBookingsApi.list('deployed'), jobsheetsApi.list()])
            .then(([d, j]) => { setDeployed(d); setJobsheets(j); })
            .catch((err) => toast.error(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const jobsheetedBookingIds = new Set(jobsheets.map((j) => j.team_booking_id));
    const awaitingJobsheet = deployed.filter((b) => !jobsheetedBookingIds.has(b.id));

    const getForm = (id) => forms[id] || emptyJobsheet();
    const change = (id, field, value) => setForms((f) => ({ ...f, [id]: { ...getForm(id), [field]: value } }));

    const preview = (id) => {
        const f = getForm(id);
        const num = (v) => Number(v) || 0;
        const cashOf = (method, amt) => (method === 'cash' ? num(amt) : 0);
        const eftOf = (method, amt) => (method === 'eft' ? num(amt) : 0);
        const totalCash = cashOf(f.foreman_payment_method, f.foreman_amount) + cashOf(f.worker1_payment_method, f.worker1_amount) + cashOf(f.worker2_payment_method, f.worker2_amount);
        const totalEft = eftOf(f.foreman_payment_method, f.foreman_amount) + eftOf(f.worker1_payment_method, f.worker1_amount) + eftOf(f.worker2_payment_method, f.worker2_amount);
        const material = f.charge_materials ? num(f.bags_used) * 1.94 + num(f.gloves_used) * 7.5 : 0;
        const subtotal = totalCash + totalEft + num(f.extra_amount) + num(f.six_x_reward) + num(f.transport_amount) + material + num(f.other_amount);
        const admin = subtotal * 0.25;
        const invoiceAmount = subtotal + admin;
        return { totalCash, totalEft, material, subtotal, admin, invoiceAmount };
    };

    const submit = async (booking) => {
        const f = getForm(booking.id);
        setBusyId(booking.id);
        try {
            await jobsheetsApi.submit({ team_booking_id: booking.id, ...f });
            toast.success('Jobsheet submitted');
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
            <PageTitle pageTitle={'Foreman Dashboard'} pagesub={'Dashboard'} />
            <div className="container" style={{ padding: '80px 15px' }}>
                <div style={{ marginBottom: '24px' }}>
                    <p style={{ color: '#555', fontSize: '14px' }}>Signed in as <strong>{getAuth()?.display_name}</strong></p>
                </div>

                <h3 style={{ marginBottom: '8px' }}>Task Sheet &amp; Jobsheet — Deployed Shifts ({awaitingJobsheet.length})</h3>
                <p style={{ color: '#777', fontSize: '13px', marginBottom: '18px' }}>
                    Record materials used and each team member's pay (Cash or EFT) at the end of the shift.
                </p>
                {loading ? <p>Loading...</p> : awaitingJobsheet.length === 0 ? (
                    <p style={{ color: '#777' }}>No deployed shifts awaiting a Jobsheet.</p>
                ) : awaitingJobsheet.map((b) => {
                    const f = getForm(b.id);
                    const p = preview(b.id);
                    return (
                        <div key={b.id} style={cardStyle}>
                            <strong>{b.team_name}</strong> — {b.partner_name} ({b.account_name})
                            <p style={{ margin: '6px 0', color: '#555', fontSize: '14px' }}>
                                Foreman: {b.foreman_name} · Workers: {b.worker1_name}, {b.worker2_name}
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 600 }}>Shift length</label>
                                    <select style={inputStyle} value={f.shift_hours} onChange={(e) => change(b.id, 'shift_hours', e.target.value)}>
                                        <option value="4">4 hours</option>
                                        <option value="8">8 hours</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 600 }}>Team qualified?</label>
                                    <select style={inputStyle} value={f.qualified ? 'yes' : 'no'} onChange={(e) => change(b.id, 'qualified', e.target.value === 'yes')}>
                                        <option value="yes">Qualified</option>
                                        <option value="no">Unqualified (6X Reward applies)</option>
                                    </select>
                                </div>
                            </div>

                            <table style={{ width: '100%', marginTop: '14px', fontSize: '14px' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left' }}>
                                        <th style={{ padding: '4px' }}>Member</th>
                                        <th style={{ padding: '4px' }}>Method</th>
                                        <th style={{ padding: '4px' }}>Amount (R)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { role: 'foreman', label: `Foreman — ${b.foreman_name}` },
                                        { role: 'worker1', label: `Worker — ${b.worker1_name}` },
                                        { role: 'worker2', label: `Worker — ${b.worker2_name}` },
                                    ].map((m) => (
                                        <tr key={m.role}>
                                            <td style={{ padding: '4px' }}>{m.label}</td>
                                            <td style={{ padding: '4px' }}>
                                                <select style={inputStyle} value={f[`${m.role}_payment_method`]} onChange={(e) => change(b.id, `${m.role}_payment_method`, e.target.value)}>
                                                    <option value="cash">Cash</option>
                                                    <option value="eft">EFT</option>
                                                </select>
                                            </td>
                                            <td style={{ padding: '4px' }}>
                                                <input style={inputStyle} type="number" value={f[`${m.role}_amount`]} onChange={(e) => change(b.id, `${m.role}_amount`, e.target.value)} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '14px' }}>
                                <div><label style={{ fontSize: '12px', fontWeight: 600 }}>Extra (R)</label><input style={inputStyle} type="number" value={f.extra_amount} onChange={(e) => change(b.id, 'extra_amount', e.target.value)} /></div>
                                <div><label style={{ fontSize: '12px', fontWeight: 600 }}>6X Reward (R)</label><input style={inputStyle} type="number" value={f.six_x_reward} onChange={(e) => change(b.id, 'six_x_reward', e.target.value)} /></div>
                                <div><label style={{ fontSize: '12px', fontWeight: 600 }}>Transport (R)</label><input style={inputStyle} type="number" value={f.transport_amount} onChange={(e) => change(b.id, 'transport_amount', e.target.value)} /></div>
                            </div>

                            <div style={{ marginTop: '14px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 600 }}>
                                    <input type="checkbox" checked={f.charge_materials} onChange={(e) => change(b.id, 'charge_materials', e.target.checked)} /> Charge for bags &amp; gloves on this Jobsheet
                                </label>
                            </div>
                            <table style={{ width: '100%', marginTop: '10px', fontSize: '14px' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left' }}>
                                        <th style={{ padding: '4px' }}></th>
                                        <th style={{ padding: '4px' }}>Issued</th>
                                        <th style={{ padding: '4px' }}>Returned</th>
                                        <th style={{ padding: '4px' }}>Used</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style={{ padding: '4px' }}>Bags</td>
                                        <td style={{ padding: '4px' }}><input style={inputStyle} type="number" value={f.bags_issued} onChange={(e) => change(b.id, 'bags_issued', e.target.value)} /></td>
                                        <td style={{ padding: '4px' }}><input style={inputStyle} type="number" value={f.bags_returned} onChange={(e) => change(b.id, 'bags_returned', e.target.value)} /></td>
                                        <td style={{ padding: '4px' }}><input style={inputStyle} type="number" value={f.bags_used} onChange={(e) => change(b.id, 'bags_used', e.target.value)} /></td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '4px' }}>Gloves</td>
                                        <td style={{ padding: '4px' }}><input style={inputStyle} type="number" value={f.gloves_issued} onChange={(e) => change(b.id, 'gloves_issued', e.target.value)} /></td>
                                        <td style={{ padding: '4px' }}><input style={inputStyle} type="number" value={f.gloves_returned} onChange={(e) => change(b.id, 'gloves_returned', e.target.value)} /></td>
                                        <td style={{ padding: '4px' }}><input style={inputStyle} type="number" value={f.gloves_used} onChange={(e) => change(b.id, 'gloves_used', e.target.value)} /></td>
                                    </tr>
                                </tbody>
                            </table>

                            <div style={{ marginTop: '14px', background: '#f9f9f9', borderRadius: '6px', padding: '12px', fontSize: '13px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Total Cash</span><strong>{fmt(p.totalCash)}</strong></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Total EFT</span><strong>{fmt(p.totalEft)}</strong></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Material</span><strong>{fmt(p.material)}</strong></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><strong>{fmt(p.subtotal)}</strong></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Admin Fee (25%)</span><strong>{fmt(p.admin)}</strong></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #ddd', marginTop: '6px', paddingTop: '6px' }}>
                                    <span>Invoice Amount</span><strong>{fmt(p.invoiceAmount)}</strong>
                                </div>
                            </div>

                            <div style={{ marginTop: '14px' }}>
                                <button className="theme-btn" disabled={busyId === b.id} onClick={() => submit(b)}>Submit Jobsheet</button>
                            </div>
                        </div>
                    );
                })}

                <h3 style={{ margin: '40px 0 18px' }}>Submitted Jobsheets</h3>
                {jobsheets.length === 0 ? <p style={{ color: '#777' }}>None submitted yet.</p> : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                                    <th style={{ padding: '10px' }}>Team</th>
                                    <th style={{ padding: '10px' }}>Invoice Amount</th>
                                    <th style={{ padding: '10px' }}>Status</th>
                                    <th style={{ padding: '10px' }}>Serial No.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobsheets.map((j) => (
                                    <tr key={j.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                        <td style={{ padding: '10px' }}>{j.team_name}</td>
                                        <td style={{ padding: '10px' }}>{fmt(j.invoiceAmount)}</td>
                                        <td style={{ padding: '10px', textTransform: 'capitalize' }}>{j.status}</td>
                                        <td style={{ padding: '10px' }}>{j.serial_number || '—'}</td>
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

export default ForemanDashboard;
