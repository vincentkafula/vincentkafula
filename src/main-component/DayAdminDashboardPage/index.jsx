import React, { Fragment, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Navbar2 from '../../components/Navbar2/Navbar2';
import DashboardTopbar from '../../components/ops-dashboards/DashboardTopbar';
import PageTitle from '../../components/pagetitle/PageTitle';
import Footer from '../../components/footer/Footer';
import Scrollbar from '../../components/scrollbar/scrollbar';
import { teamBookingsApi } from '../../api/teamBookingsApi';
import { getAuth } from '../../api/authApi';

const cardStyle = { border: '1px solid #eee', borderRadius: '8px', padding: '22px', marginBottom: '18px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' };
const inputStyle = { width: '100%', padding: '6px 8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' };

const DayAdminDashboard = () => {
    const [booked, setBooked] = useState([]);
    const [deployed, setDeployed] = useState([]);
    const [completed, setCompleted] = useState([]);
    const [loading, setLoading] = useState(false);
    const [noShows, setNoShows] = useState({}); // { bookingId: { foreman_name: true/false, ... } }
    const [replacementNames, setReplacementNames] = useState({}); // { bookingId: { foreman_name: 'text' } }
    const [busyId, setBusyId] = useState(null);

    const load = () => {
        setLoading(true);
        Promise.all([teamBookingsApi.list('booked'), teamBookingsApi.list('deployed'), teamBookingsApi.list('completed')])
            .then(([b, d, c]) => { setBooked(b); setDeployed(d); setCompleted(c); })
            .catch((err) => toast.error(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const toggleNoShow = (bookingId, name) => {
        setNoShows((n) => ({ ...n, [bookingId]: { ...(n[bookingId] || {}), [name]: !(n[bookingId]?.[name]) } }));
    };
    const setReplacement = (bookingId, name, value) => {
        setReplacementNames((r) => ({ ...r, [bookingId]: { ...(r[bookingId] || {}), [name]: value } }));
    };

    const deploy = async (booking) => {
        const flags = noShows[booking.id] || {};
        const repl = replacementNames[booking.id] || {};
        const members = [booking.foreman_name, booking.worker1_name, booking.worker2_name];
        const noShowNames = members.filter((n) => flags[n]);
        const replacements = noShowNames
            .filter((n) => repl[n]?.trim())
            .map((n) => ({ originalName: n, replacementName: repl[n], reason: 'No-show at roll call', at: new Date().toISOString() }));

        setBusyId(booking.id);
        try {
            await teamBookingsApi.deploy(booking.id, { no_show_names: noShowNames, replacements });
            toast.success('Shift deployed');
            load();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setBusyId(null);
        }
    };

    const complete = async (id) => {
        setBusyId(id);
        try {
            await teamBookingsApi.complete(id);
            toast.success('Shift marked complete');
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
            <PageTitle pageTitle={'Day Admin Dashboard'} pagesub={'Dashboard'} />
            <div className="container" style={{ padding: '80px 15px' }}>
                <div style={{ marginBottom: '24px' }}>
                    <p style={{ color: '#555', fontSize: '14px' }}>Signed in as <strong>{getAuth()?.display_name}</strong></p>
                </div>

                <h3 style={{ marginBottom: '8px' }}>Roll Call — Booked Shifts ({booked.length})</h3>
                <p style={{ color: '#777', fontSize: '13px', marginBottom: '18px' }}>
                    Roll call runs at 07:30 AM and 12:30 PM. Tick anyone who didn't show up and (optionally) name their replacement from the team queue, then deploy.
                </p>
                {loading ? <p>Loading...</p> : booked.length === 0 ? (
                    <p style={{ color: '#777' }}>Nothing booked and waiting for roll call.</p>
                ) : booked.map((b) => {
                    const members = [
                        { role: 'Foreman', name: b.foreman_name },
                        { role: 'Worker', name: b.worker1_name },
                        { role: 'Worker', name: b.worker2_name },
                    ];
                    return (
                        <div key={b.id} style={cardStyle}>
                            <strong>{b.team_name}</strong> — {b.roll_call_session === '07:30' ? '07:30 AM' : '12:30 PM'} Roll Call
                            <p style={{ margin: '6px 0', color: '#555', fontSize: '14px' }}>
                                {b.partner_name} · Account: {b.account_name}
                            </p>
                            <table style={{ width: '100%', marginTop: '10px', fontSize: '14px' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left' }}>
                                        <th style={{ padding: '4px' }}>Role</th>
                                        <th style={{ padding: '4px' }}>Name</th>
                                        <th style={{ padding: '4px' }}>No-show?</th>
                                        <th style={{ padding: '4px' }}>Replacement (from queue)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {members.map((m) => (
                                        <tr key={m.name}>
                                            <td style={{ padding: '4px' }}>{m.role}</td>
                                            <td style={{ padding: '4px' }}>{m.name}</td>
                                            <td style={{ padding: '4px' }}>
                                                <input type="checkbox" checked={!!noShows[b.id]?.[m.name]} onChange={() => toggleNoShow(b.id, m.name)} />
                                            </td>
                                            <td style={{ padding: '4px' }}>
                                                {noShows[b.id]?.[m.name] && (
                                                    <input
                                                        style={inputStyle}
                                                        placeholder="Replacement name"
                                                        value={replacementNames[b.id]?.[m.name] || ''}
                                                        onChange={(e) => setReplacement(b.id, m.name, e.target.value)}
                                                    />
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div style={{ marginTop: '12px' }}>
                                <button className="theme-btn" disabled={busyId === b.id} onClick={() => deploy(b)}>Deploy Shift</button>
                            </div>
                        </div>
                    );
                })}

                <h3 style={{ margin: '40px 0 18px' }}>Deployed — Awaiting Completion ({deployed.length})</h3>
                {deployed.length === 0 ? <p style={{ color: '#777' }}>Nothing currently deployed.</p> : deployed.map((b) => (
                    <div key={b.id} style={cardStyle}>
                        <strong>{b.team_name}</strong> — {b.foreman_name}, {b.worker1_name}, {b.worker2_name}
                        {b.no_show_names?.length > 0 && (
                            <p style={{ margin: '6px 0', fontSize: '13px', color: '#b26a00' }}>No-shows replaced: {b.no_show_names.join(', ')}</p>
                        )}
                        <div style={{ marginTop: '10px' }}>
                            <button className="theme-btn" disabled={busyId === b.id} onClick={() => complete(b.id)}>Confirm Shift Complete</button>
                        </div>
                    </div>
                ))}

                <h3 style={{ margin: '40px 0 18px' }}>Completed Shifts</h3>
                {completed.length === 0 ? <p style={{ color: '#777' }}>None completed yet.</p> : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                                    <th style={{ padding: '10px' }}>Team</th>
                                    <th style={{ padding: '10px' }}>Foreman</th>
                                    <th style={{ padding: '10px' }}>Workers</th>
                                    <th style={{ padding: '10px' }}>Session</th>
                                </tr>
                            </thead>
                            <tbody>
                                {completed.map((b) => (
                                    <tr key={b.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                        <td style={{ padding: '10px' }}>{b.team_name}</td>
                                        <td style={{ padding: '10px' }}>{b.foreman_name}</td>
                                        <td style={{ padding: '10px' }}>{b.worker1_name}, {b.worker2_name}</td>
                                        <td style={{ padding: '10px' }}>{b.roll_call_session}</td>
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

export default DayAdminDashboard;
