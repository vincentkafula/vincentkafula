import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { scheduledJobsApi } from '../../api/scheduledJobsApi';
import { teamBookingsApi } from '../../api/teamBookingsApi';

const streamColor = { pre_school: '#7c5a1e', school: '#0d6d4f', technical_services: '#0277bd' };
const streamLabel = { pre_school: 'Pre-School', school: 'School', technical_services: 'Technical Services' };
const sessionMeta = {
    '07:30': { title: 'MORNING DEPLOYMENTS', sub: '06:30 – 11:00' },
    '12:30': { title: 'AFTERNOON DEPLOYMENTS', sub: '12:30 – 17:00' },
};

const dayLabel = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return {
        weekday: d.toLocaleDateString('en-ZA', { weekday: 'long' }).toUpperCase(),
        date: d.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' }),
    };
};

const WeeklyDeploymentBoard = ({ streamFilter, title, subtitle, badgeLabel }) => {
    const [jobs, setJobs] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeDate, setActiveDate] = useState(null);

    useEffect(() => {
        setLoading(true);
        Promise.all([scheduledJobsApi.list('approved'), teamBookingsApi.list()])
            .then(([j, b]) => {
                setJobs(streamFilter ? j.filter((job) => job.stream === streamFilter) : j);
                setBookings(b);
            })
            .catch((err) => toast.error(err.message))
            .finally(() => setLoading(false));
    }, [streamFilter]);

    const jobsById = useMemo(() => Object.fromEntries(jobs.map((j) => [j.id, j])), [jobs]);

    // Group bookings by scheduled date
    const byDate = useMemo(() => {
        const map = {};
        bookings.forEach((b) => {
            const job = jobsById[b.scheduled_job_id];
            const date = job?.scheduled_date ? job.scheduled_date.slice(0, 10) : null;
            if (!date) return;
            if (!map[date]) map[date] = [];
            map[date].push({ ...b, job });
        });
        return map;
    }, [bookings, jobsById]);

    const dates = useMemo(() => Object.keys(byDate).sort(), [byDate]);
    const selectedDate = activeDate && byDate[activeDate] ? activeDate : dates[0];
    const dayBookings = selectedDate ? byDate[selectedDate] : [];

    const sessions = ['07:30', '12:30'];

    return (
        <div style={{ background: '#EFEBDF', border: '1px solid #CFC7AF', marginBottom: '20px' }}>
            <div style={{ padding: '22px 24px', borderBottom: '1px solid #CFC7AF' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: '50%', background: '#A97D2C', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0,
                    }}>{badgeLabel || 'SD'}</div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '20px', letterSpacing: '0.02em' }}>{title || 'WEEKLY DEPLOYMENT SCHEDULE'}</h3>
                        <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#48605B', fontFamily: 'monospace', letterSpacing: '0.08em' }}>
                            {subtitle || 'WEEKLY DEPLOYMENT BOARD'}
                        </p>
                    </div>
                </div>
                <p style={{ margin: '14px 0 0', fontSize: '13px', color: '#555' }}>
                    {bookings.filter((b) => jobsById[b.scheduled_job_id]).length} total shifts booked · Issued for depot dispatch &amp; foremen sign-in
                </p>
            </div>

            {loading ? (
                <p style={{ padding: '20px' }}>Loading...</p>
            ) : dates.length === 0 ? (
                <p style={{ padding: '20px', color: '#777' }}>No scheduled shifts with a booked team yet.</p>
            ) : (
                <>
                    <div style={{ display: 'flex', overflowX: 'auto', borderBottom: '3px solid #1C2A28' }}>
                        {dates.map((date) => {
                            const { weekday, date: dateFmt } = dayLabel(date);
                            const isActive = date === selectedDate;
                            return (
                                <button
                                    key={date}
                                    onClick={() => setActiveDate(date)}
                                    style={{
                                        flex: '1 0 130px', textAlign: 'left', padding: '12px 14px', cursor: 'pointer',
                                        background: isActive ? '#1C2A28' : '#E4DFD0',
                                        color: isActive ? '#fff' : '#1C2A28',
                                        border: 'none', borderRight: '1px solid #CFC7AF',
                                    }}
                                >
                                    <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em' }}>{weekday}</div>
                                    <div style={{ fontSize: '11px', opacity: 0.8 }}>{dateFmt}</div>
                                    <div style={{
                                        display: 'inline-block', marginTop: '6px', padding: '2px 8px', borderRadius: '999px',
                                        fontSize: '11px', fontWeight: 600,
                                        background: isActive ? '#A97D2C' : '#1C2A28', color: '#fff',
                                    }}>
                                        {byDate[date].length} shift{byDate[date].length === 1 ? '' : 's'}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div style={{ padding: '20px 24px' }}>
                        {sessions.map((sess) => {
                            const sessBookings = dayBookings.filter((b) => b.roll_call_session === sess);
                            if (sessBookings.length === 0) return null;
                            const meta = sessionMeta[sess];
                            return (
                                <div key={sess} style={{ marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '12px' }}>
                                        <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '13px', letterSpacing: '0.06em' }}>{meta.title}</span>
                                        <span style={{ fontSize: '12px', color: '#777' }}>{meta.sub}</span>
                                        <span style={{ flex: 1, height: '1px', background: '#CFC7AF' }} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                                        {sessBookings.map((b) => (
                                            <div
                                                key={b.id}
                                                style={{
                                                    background: '#FBF9F3', border: '1px solid #CFC7AF',
                                                    borderLeft: `4px solid ${streamColor[b.job?.stream] || '#A97D2C'}`,
                                                    padding: '14px 16px',
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                                                    <strong style={{ fontSize: '14px' }}>{b.job?.account_name || b.job?.partner_name}</strong>
                                                    <span style={{ fontSize: '11px', background: '#1C2A28', color: '#fff', padding: '2px 8px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                                                        {streamLabel[b.job?.stream] || b.job?.stream}
                                                    </span>
                                                </div>
                                                <p style={{ margin: '4px 0 10px', fontSize: '12px', color: '#777' }}>{b.job?.partner_name}</p>
                                                <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                                                    <span style={{ color: '#48605B', marginRight: '6px' }}>FOREMAN</span>
                                                    <span style={{ border: '1px solid #CFC7AF', borderRadius: '4px', padding: '2px 8px', fontSize: '12px' }}>{b.foreman_name}</span>
                                                </div>
                                                <div style={{ fontSize: '12px' }}>
                                                    <span style={{ color: '#48605B', marginRight: '6px' }}>WORKERS</span>
                                                    <span style={{ border: '1px solid #CFC7AF', borderRadius: '4px', padding: '2px 8px', fontSize: '12px', marginRight: '4px' }}>{b.worker1_name}</span>
                                                    <span style={{ border: '1px solid #CFC7AF', borderRadius: '4px', padding: '2px 8px', fontSize: '12px' }}>{b.worker2_name}</span>
                                                </div>
                                                <div style={{ marginTop: '10px' }}>
                                                    <span style={{
                                                        fontSize: '11px', fontWeight: 600, textTransform: 'capitalize',
                                                        color: b.status === 'completed' ? '#2e7d32' : b.status === 'deployed' ? '#0277bd' : '#b26a00',
                                                    }}>
                                                        {b.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

export default WeeklyDeploymentBoard;
