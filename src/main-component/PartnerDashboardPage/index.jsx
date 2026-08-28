import React, { Fragment, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Navbar2 from '../../components/Navbar2/Navbar2';
import PageTitle from '../../components/pagetitle/PageTitle';
import Footer from '../../components/footer/Footer';
import Scrollbar from '../../components/scrollbar/scrollbar';
import StatusBadge from '../../components/ops-dashboards/StatusBadge';
import { quotationsApi } from '../../api/quotationsApi';

const emptyForm = {
    partner_name: '',
    partner_email: '',
    partner_phone: '',
    num_workers: 2,
    num_foremen: 1,
    num_operation_supervisors: 0,
    task_details: '',
    location_address: '',
    payment_terms: 'upfront',
    requested_stream: 'school',
};

const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    marginTop: '4px',
};
const labelStyle = { display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' };
const fieldWrap = { marginBottom: '18px' };

const PartnerDashboard = () => {
    const [form, setForm] = useState(emptyForm);
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const load = () => {
        setLoading(true);
        quotationsApi.list()
            .then(setQuotations)
            .catch((err) => toast.error(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const change = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const submit = async (e) => {
        e.preventDefault();
        if (!form.partner_name.trim()) {
            toast.error('Partner / organisation name is required');
            return;
        }
        setSubmitting(true);
        try {
            await quotationsApi.submit({
                ...form,
                num_workers: Number(form.num_workers) || 0,
                num_foremen: Number(form.num_foremen) || 0,
                num_operation_supervisors: Number(form.num_operation_supervisors) || 0,
            });
            toast.success('Quotation request submitted');
            setForm(emptyForm);
            load();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Fragment>
            <Navbar2 />
            <PageTitle pageTitle={'Partner Dashboard'} pagesub={'Dashboard'} />
            <div className="container" style={{ padding: '80px 15px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: '40px', alignItems: 'start' }}>
                    <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                        <h3 style={{ marginBottom: '20px' }}>Request a Quotation</h3>
                        <form onSubmit={submit}>
                            <div style={fieldWrap}>
                                <label style={labelStyle}>Partner / Organisation Name *</label>
                                <input style={inputStyle} name="partner_name" value={form.partner_name} onChange={change} />
                            </div>
                            <div style={fieldWrap}>
                                <label style={labelStyle}>Email</label>
                                <input style={inputStyle} name="partner_email" type="email" value={form.partner_email} onChange={change} />
                            </div>
                            <div style={fieldWrap}>
                                <label style={labelStyle}>Phone</label>
                                <input style={inputStyle} name="partner_phone" value={form.partner_phone} onChange={change} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', ...fieldWrap }}>
                                <div>
                                    <label style={labelStyle}>Workers</label>
                                    <input style={inputStyle} name="num_workers" type="number" min="0" value={form.num_workers} onChange={change} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Foremen</label>
                                    <input style={inputStyle} name="num_foremen" type="number" min="0" value={form.num_foremen} onChange={change} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Op. Supervisors</label>
                                    <input style={inputStyle} name="num_operation_supervisors" type="number" min="0" value={form.num_operation_supervisors} onChange={change} />
                                </div>
                            </div>
                            <div style={fieldWrap}>
                                <label style={labelStyle}>Task Sheet Details</label>
                                <textarea style={{ ...inputStyle, minHeight: '90px' }} name="task_details" value={form.task_details} onChange={change} />
                            </div>
                            <div style={fieldWrap}>
                                <label style={labelStyle}>Job Location (address)</label>
                                <input style={inputStyle} name="location_address" value={form.location_address} onChange={change} placeholder="Street, area, city" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', ...fieldWrap }}>
                                <div>
                                    <label style={labelStyle}>Payment Terms</label>
                                    <select style={inputStyle} name="payment_terms" value={form.payment_terms} onChange={change}>
                                        <option value="upfront">Upfront</option>
                                        <option value="monthly">Monthly</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Operation Stream</label>
                                    <select style={inputStyle} name="requested_stream" value={form.requested_stream} onChange={change}>
                                        <option value="pre_school">Pre-School</option>
                                        <option value="school">School</option>
                                        <option value="technical_services">Technical Services</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="theme-btn" disabled={submitting} style={{ width: '100%' }}>
                                {submitting ? 'Submitting...' : 'Submit Quotation Request'}
                            </button>
                        </form>
                    </div>

                    <div>
                        <h3 style={{ marginBottom: '20px' }}>Your Quotation Requests</h3>
                        {loading ? (
                            <p>Loading...</p>
                        ) : quotations.length === 0 ? (
                            <p style={{ color: '#777' }}>No quotation requests yet. Submit one to get started.</p>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                                            <th style={{ padding: '10px' }}>ID</th>
                                            <th style={{ padding: '10px' }}>Partner</th>
                                            <th style={{ padding: '10px' }}>Team</th>
                                            <th style={{ padding: '10px' }}>Terms</th>
                                            <th style={{ padding: '10px' }}>Status</th>
                                            <th style={{ padding: '10px' }}>Submitted</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {quotations.map((q) => (
                                            <tr key={q.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                                <td style={{ padding: '10px' }}>#{q.id}</td>
                                                <td style={{ padding: '10px' }}>{q.partner_name}</td>
                                                <td style={{ padding: '10px' }}>{q.num_foremen}F / {q.num_workers}W / {q.num_operation_supervisors}S</td>
                                                <td style={{ padding: '10px', textTransform: 'capitalize' }}>{q.payment_terms}</td>
                                                <td style={{ padding: '10px' }}><StatusBadge status={q.status} /></td>
                                                <td style={{ padding: '10px' }}>{new Date(q.created_at).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
            <Scrollbar />
        </Fragment>
    );
};

export default PartnerDashboard;
