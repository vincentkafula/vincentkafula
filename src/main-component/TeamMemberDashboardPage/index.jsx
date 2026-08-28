import React, { Fragment, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Navbar2 from '../../components/Navbar2/Navbar2';
import DashboardTopbar from '../../components/ops-dashboards/DashboardTopbar';
import PageTitle from '../../components/pagetitle/PageTitle';
import Footer from '../../components/footer/Footer';
import Scrollbar from '../../components/scrollbar/scrollbar';
import { teamBookingsApi } from '../../api/teamBookingsApi';
import { getAuth } from '../../api/authApi';

const sessionLabel = (s) => (s === '07:30' ? '07:30 AM Roll Call' : '12:30 PM Roll Call');

const shiftStatusMeta = {
    booked: { label: 'Booked — awaiting roll call', color: '#b26a00', bg: '#fff3e0' },
    deployed: { label: 'Deployed — on shift', color: '#0277bd', bg: '#e1f5fe' },
    completed: { label: 'Completed', color: '#2e7d32', bg: '#e8f5e9' },
};

const ShiftBadge = ({ status }) => {
    const meta = shiftStatusMeta[status] || { label: status, color: '#555', bg: '#eee' };
    return (
        <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, color: meta.color, background: meta.bg }}>
            {meta.label}
        </span>
    );
};

const TeamMemberDashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        teamBookingsApi.list()
            .then(setBookings)
            .catch((err) => toast.error(err.message))
            .finally(() => setLoading(false));
    }, []);

    const upcoming = bookings.filter((b) => b.status === 'booked' || b.status === 'deployed');
    const past = bookings.filter((b) => b.status === 'completed');

    return (
        <Fragment>
            <Navbar2 />
            <DashboardTopbar />
            <PageTitle pageTitle={'Team Member Dashboard'} pagesub={'Dashboard'} />
            <div className="container" style={{ padding: '80px 15px' }}>
                <div style={{ marginBottom: '24px' }}>
                    <p style={{ color: '#555', fontSize: '14px' }}>Signed in as <strong>{getAuth()?.display_name}</strong></p>
                </div>

                <h3 style={{ marginBottom: '18px' }}>Upcoming &amp; Active Shifts</h3>
                {loading ? <p>Loading...</p> : upcoming.length === 0 ? (
                    <p style={{ color: '#777' }}>No upcoming or active shifts right now.</p>
                ) : (
                    <div style={{ overflowX: 'auto', marginBottom: '40px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                                    <th style={{ padding: '10px' }}>Team</th>
                                    <th style={{ padding: '10px' }}>Foreman</th>
                                    <th style={{ padding: '10px' }}>Workers</th>
                                    <th style={{ padding: '10px' }}>Roll Call</th>
                                    <th style={{ padding: '10px' }}>Account</th>
                                    <th style={{ padding: '10px' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {upcoming.map((b) => (
                                    <tr key={b.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                        <td style={{ padding: '10px' }}>{b.team_name}</td>
                                        <td style={{ padding: '10px' }}>{b.foreman_name}</td>
                                        <td style={{ padding: '10px' }}>{b.worker1_name}, {b.worker2_name}</td>
                                        <td style={{ padding: '10px' }}>{sessionLabel(b.roll_call_session)}</td>
                                        <td style={{ padding: '10px' }}>{b.account_name || '—'}</td>
                                        <td style={{ padding: '10px' }}><ShiftBadge status={b.status} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <h3 style={{ marginBottom: '18px' }}>Completed Shifts</h3>
                {past.length === 0 ? <p style={{ color: '#777' }}>No completed shifts yet.</p> : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                                    <th style={{ padding: '10px' }}>Team</th>
                                    <th style={{ padding: '10px' }}>Foreman</th>
                                    <th style={{ padding: '10px' }}>Workers</th>
                                    <th style={{ padding: '10px' }}>Roll Call</th>
                                </tr>
                            </thead>
                            <tbody>
                                {past.map((b) => (
                                    <tr key={b.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                        <td style={{ padding: '10px' }}>{b.team_name}</td>
                                        <td style={{ padding: '10px' }}>{b.foreman_name}</td>
                                        <td style={{ padding: '10px' }}>{b.worker1_name}, {b.worker2_name}</td>
                                        <td style={{ padding: '10px' }}>{sessionLabel(b.roll_call_session)}</td>
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

export default TeamMemberDashboard;
