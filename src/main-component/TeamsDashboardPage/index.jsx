import React, { Fragment, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Navbar2 from '../../components/Navbar2/Navbar2';
import DashboardTopbar from '../../components/ops-dashboards/DashboardTopbar';
import PageTitle from '../../components/pagetitle/PageTitle';
import Footer from '../../components/footer/Footer';
import Scrollbar from '../../components/scrollbar/scrollbar';
import { scheduledJobsApi } from '../../api/scheduledJobsApi';
import { teamBookingsApi } from '../../api/teamBookingsApi';
import { getAuth } from '../../api/authApi';

const cardStyle = { border: '1px solid #eee', borderRadius: '8px', padding: '22px', marginBottom: '18px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' };
const inputStyle = { width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' };
const streamLabel = (s) => ({ pre_school: 'Pre-School', school: 'School', technical_services: 'Technical Services' }[s] || s);

const emptyBooking = () => ({ team_name: '', foreman_name: '', worker1_name: '', worker2_name: '', roll_call_session: '07:30' });

const TeamsDashboard = () => {
    const [schedules, setSchedules] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [forms, setForms] = useState({});
    const [busyId, setBusyId] = useState(null);
    const [loading, setLoading] = useState(false);

    const load = () => {
        setLoading(true);
        Promise.all([scheduledJobsApi.list('approved'), teamBookingsApi.list()])
            .then(([s, b]) => { setSchedules(s); setBookings(b); })
            .catch((err) => toast.error(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const getForm = (jobId) => forms[jobId] || emptyBooking();
    const changeForm = (jobId, field, value) => setForms((f) => ({ ...f, [jobId]: { ...getForm(jobId), [field]: value } }));

    const book = async (jobId) => {
        const f = getForm(jobId);
        if (!f.team_name.trim() || !f.foreman_name.trim() || !f.worker1_name.trim() || !f.worker2_name.trim()) {
            toast.error('Team name, foreman, and both workers are required');
            return;
        }
        setBusyId(jobId);
        try {
            await teamBookingsApi.book({ scheduled_job_id: jobId, ...f });
            toast.success('Team booked for this shift');
            setForms((old) => ({ ...old, [jobId]: emptyBooking() }));
            load();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setBusyId(null);
        }
    };

    // Which approved schedules still need a booking (a shift needs exactly 1 Foreman + 2 Workers)
    const bookedJobIds = new Set(bookings.map((b) => b.scheduled_job_id));

    return (
        <Fragment>
            <Navbar2 />
            <DashboardTopbar />
            <PageTitle pageTitle={'Teams Dashboard'} pagesub={'Dashboard'} />
            <div className="container" style={{ padding: '80px 15px' }}>
                <div style={{ marginBottom: '24px' }}>
                    <p style={{ color: '#555', fontSize: '14px' }}>Booking as <strong>{getAuth()?.display_name}</strong></p>
                </div>

                <h3 style={{ marginBottom: '18px' }}>Approved Shifts — Book Your Team</h3>
                <p style={{ color: '#777', fontSize: '13px', marginBottom: '18px' }}>Each shift needs exactly 1 Foreman + 2 Workers.</p>
                {loading ? <p>Loading...</p> : schedules.length === 0 ? (
                    <p style={{ color: '#777' }}>No approved schedules right now.</p>
                ) : schedules.map((job) => {
                    const f = getForm(job.id);
                    return (
                        <div key={job.id} style={cardStyle}>
                            <div>
                                <strong>Job #{job.id} — {job.partner_name}</strong>
                                <p style={{ margin: '6px 0', color: '#555', fontSize: '14px' }}>
                                    Account: {job.account_name} · Stream: {streamLabel(job.stream)}
                                    {job.scheduled_date && ` · ${new Date(job.scheduled_date).toLocaleDateString()}`}
                                </p>
                                {job.location_address && <p style={{ margin: '6px 0', fontSize: '13px', color: '#888' }}>📍 {job.location_address}</p>}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                                <input style={inputStyle} placeholder="Team name" value={f.team_name} onChange={(e) => changeForm(job.id, 'team_name', e.target.value)} />
                                <select style={inputStyle} value={f.roll_call_session} onChange={(e) => changeForm(job.id, 'roll_call_session', e.target.value)}>
                                    <option value="07:30">07:30 AM Roll Call</option>
                                    <option value="12:30">12:30 PM Roll Call</option>
                                </select>
                                <input style={inputStyle} placeholder="Foreman name" value={f.foreman_name} onChange={(e) => changeForm(job.id, 'foreman_name', e.target.value)} />
                                <input style={inputStyle} placeholder="Worker 1 name" value={f.worker1_name} onChange={(e) => changeForm(job.id, 'worker1_name', e.target.value)} />
                                <input style={inputStyle} placeholder="Worker 2 name" value={f.worker2_name} onChange={(e) => changeForm(job.id, 'worker2_name', e.target.value)} />
                            </div>
                            <div style={{ marginTop: '10px' }}>
                                <button className="theme-btn" disabled={busyId === job.id} onClick={() => book(job.id)}>
                                    {bookedJobIds.has(job.id) ? 'Book Another Team' : 'Book Team'}
                                </button>
                            </div>
                        </div>
                    );
                })}

                <h3 style={{ margin: '40px 0 18px' }}>Booked Shifts</h3>
                {bookings.length === 0 ? <p style={{ color: '#777' }}>No teams booked yet.</p> : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                                    <th style={{ padding: '10px' }}>Team</th>
                                    <th style={{ padding: '10px' }}>Foreman</th>
                                    <th style={{ padding: '10px' }}>Workers</th>
                                    <th style={{ padding: '10px' }}>Session</th>
                                    <th style={{ padding: '10px' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((b) => (
                                    <tr key={b.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                        <td style={{ padding: '10px' }}>{b.team_name}</td>
                                        <td style={{ padding: '10px' }}>{b.foreman_name}</td>
                                        <td style={{ padding: '10px' }}>{b.worker1_name}, {b.worker2_name}</td>
                                        <td style={{ padding: '10px' }}>{b.roll_call_session}</td>
                                        <td style={{ padding: '10px', textTransform: 'capitalize' }}>{b.status}</td>
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

export default TeamsDashboard;
