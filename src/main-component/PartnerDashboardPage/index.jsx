import React, { Fragment, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Navbar2 from '../../components/Navbar2/Navbar2';
import DashboardTopbar from '../../components/ops-dashboards/DashboardTopbar';
import PageTitle from '../../components/pagetitle/PageTitle';
import Footer from '../../components/footer/Footer';
import Scrollbar from '../../components/scrollbar/scrollbar';
import StatusBadge from '../../components/ops-dashboards/StatusBadge';
import QuotationBuilder from './QuotationBuilder';
import { quotationsApi } from '../../api/quotationsApi';
import { invoicesApi } from '../../api/invoicesApi';

const PartnerDashboard = () => {
    const [quotations, setQuotations] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [payingId, setPayingId] = useState(null);

    const load = () => {
        setLoading(true);
        Promise.all([quotationsApi.list(), invoicesApi.list()])
            .then(([q, inv]) => {
                setQuotations(q);
                setInvoices(inv);
            })
            .catch((err) => toast.error(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const pay = async (id) => {
        setPayingId(id);
        try {
            await invoicesApi.pay(id);
            toast.success('Invoice paid');
            load();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setPayingId(null);
        }
    };

    const handleSubmit = async (payload, resetForm) => {
        if (!payload.partner_name.trim()) {
            toast.error('Partner / organisation name is required');
            return;
        }
        setSubmitting(true);
        try {
            await quotationsApi.submit(payload);
            toast.success('Quotation request submitted');
            resetForm();
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
            <DashboardTopbar />
            <PageTitle pageTitle={'Partner Dashboard'} pagesub={'Dashboard'} />
            <div className="container" style={{ padding: '80px 15px' }}>
                <QuotationBuilder onSubmit={handleSubmit} submitting={submitting} />

                <div style={{ marginTop: '50px' }}>
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

                <div style={{ marginTop: '50px' }}>
                    <h3 style={{ marginBottom: '10px' }}>Invoices</h3>
                    <p style={{ color: '#777', fontSize: '13px', marginBottom: '20px' }}>
                        An invoice is generated automatically once a quotation with upfront payment terms receives final approval.
                        For monthly-terms accounts, invoicing is consolidated at month end.
                    </p>
                    {invoices.length === 0 ? (
                        <p style={{ color: '#777' }}>No invoices yet.</p>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                                        <th style={{ padding: '10px' }}>Invoice #</th>
                                        <th style={{ padding: '10px' }}>Quotation</th>
                                        <th style={{ padding: '10px' }}>Amount</th>
                                        <th style={{ padding: '10px' }}>Status</th>
                                        <th style={{ padding: '10px' }}>Issued</th>
                                        <th style={{ padding: '10px' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map((inv) => (
                                        <tr key={inv.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                            <td style={{ padding: '10px' }}>#{inv.id}</td>
                                            <td style={{ padding: '10px' }}>#{inv.quotation_id} — {inv.partner_name}</td>
                                            <td style={{ padding: '10px' }}>R{Number(inv.amount).toFixed(2)}</td>
                                            <td style={{ padding: '10px' }}>
                                                <span style={{
                                                    padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                                                    color: inv.status === 'paid' ? '#2e7d32' : '#b26a00',
                                                    background: inv.status === 'paid' ? '#e8f5e9' : '#fff3e0',
                                                }}>
                                                    {inv.status === 'paid' ? 'Paid' : 'Unpaid'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '10px' }}>{new Date(inv.created_at).toLocaleDateString()}</td>
                                            <td style={{ padding: '10px' }}>
                                                {inv.status === 'unpaid' && (
                                                    <button
                                                        className="theme-btn"
                                                        disabled={payingId === inv.id}
                                                        onClick={() => pay(inv.id)}
                                                        style={{ padding: '6px 16px', fontSize: '13px' }}
                                                    >
                                                        {payingId === inv.id ? 'Processing...' : 'Pay Now'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
            <Scrollbar />
        </Fragment>
    );
};

export default PartnerDashboard;
