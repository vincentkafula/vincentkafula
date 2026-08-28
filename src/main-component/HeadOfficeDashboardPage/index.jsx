import React, { Fragment, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Navbar2 from '../../components/Navbar2/Navbar2';
import DashboardTopbar from '../../components/ops-dashboards/DashboardTopbar';
import PageTitle from '../../components/pagetitle/PageTitle';
import Footer from '../../components/footer/Footer';
import Scrollbar from '../../components/scrollbar/scrollbar';
import { jobsheetsApi } from '../../api/jobsheetsApi';
import { getAuth } from '../../api/authApi';

const fmt = (n) => `R${Number(n || 0).toFixed(2)}`;

const HeadOfficeDashboard = () => {
    const [ledger, setLedger] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        jobsheetsApi.list('serialed')
            .then(setLedger)
            .catch((err) => toast.error(err.message))
            .finally(() => setLoading(false));
    }, []);

    const totals = ledger.reduce((acc, j) => ({
        invoice: acc.invoice + Number(j.invoiceAmount || 0),
        profit: acc.profit + Number(j.adminFee || 0),
        cash: acc.cash + Number(j.totalCash || 0),
        eft: acc.eft + Number(j.totalEft || 0),
    }), { invoice: 0, profit: 0, cash: 0, eft: 0 });

    return (
        <Fragment>
            <Navbar2 />
            <DashboardTopbar />
            <PageTitle pageTitle={'Head Office Dashboard'} pagesub={'Dashboard'} />
            <div className="container" style={{ padding: '80px 15px' }}>
                <div style={{ marginBottom: '24px' }}>
                    <p style={{ color: '#555', fontSize: '14px' }}>Signed in as <strong>{getAuth()?.display_name}</strong></p>
                </div>

                <h3 style={{ marginBottom: '18px' }}>OpHelp Accounting — Serialed Jobsheet Ledger</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '30px' }}>
                    {[
                        ['Jobsheets', ledger.length],
                        ['Total Invoiced', fmt(totals.invoice)],
                        ['Total Profit (Admin Fee)', fmt(totals.profit)],
                        ['Cash Paid Out', fmt(totals.cash)],
                        ['EFT Paid Out', fmt(totals.eft)],
                    ].map(([label, value]) => (
                        <div key={label} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '16px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                            <div style={{ fontSize: '22px', fontWeight: 700 }}>{value}</div>
                            <div style={{ fontSize: '13px', color: '#777' }}>{label}</div>
                        </div>
                    ))}
                </div>

                {loading ? <p>Loading...</p> : ledger.length === 0 ? (
                    <p style={{ color: '#777' }}>No serialed Jobsheets in the ledger yet.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                                    <th style={{ padding: '8px' }}>Serial No.</th>
                                    <th style={{ padding: '8px' }}>Date</th>
                                    <th style={{ padding: '8px' }}>Job Detail</th>
                                    <th style={{ padding: '8px' }}>Foremen</th>
                                    <th style={{ padding: '8px' }}>Workers</th>
                                    <th style={{ padding: '8px' }}>Pay Cash</th>
                                    <th style={{ padding: '8px' }}>Pay EFT</th>
                                    <th style={{ padding: '8px' }}>Transport</th>
                                    <th style={{ padding: '8px' }}>Material</th>
                                    <th style={{ padding: '8px' }}>Other</th>
                                    <th style={{ padding: '8px' }}>6X Reward</th>
                                    <th style={{ padding: '8px' }}>Labour Total</th>
                                    <th style={{ padding: '8px' }}>OpHelp Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ledger.map((j) => (
                                    <tr key={j.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                        <td style={{ padding: '8px', fontFamily: 'monospace' }}>{j.serial_number}</td>
                                        <td style={{ padding: '8px' }}>{new Date(j.created_at).toLocaleDateString()}</td>
                                        <td style={{ padding: '8px' }}>{j.partner_name} — {j.account_name}</td>
                                        <td style={{ padding: '8px' }}>1</td>
                                        <td style={{ padding: '8px' }}>2</td>
                                        <td style={{ padding: '8px' }}>{fmt(j.totalCash)}</td>
                                        <td style={{ padding: '8px' }}>{fmt(j.totalEft)}</td>
                                        <td style={{ padding: '8px' }}>{fmt(j.transport_amount)}</td>
                                        <td style={{ padding: '8px' }}>{fmt(j.materialAmount)}</td>
                                        <td style={{ padding: '8px' }}>{fmt(j.other_amount)}</td>
                                        <td style={{ padding: '8px' }}>{fmt(j.six_x_reward)}</td>
                                        <td style={{ padding: '8px' }}>{fmt(j.labour_total_contracted)}</td>
                                        <td style={{ padding: '8px', fontWeight: 600, color: '#2e7d32' }}>{fmt(j.adminFee)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <p style={{ color: '#999', fontSize: '12px', marginTop: '14px' }}>
                    "OpHelp Balance" reflects the 25% admin fee — the company's margin on each Jobsheet. Transport, Material, and Other are shown as single totals since the Foreman's Jobsheet doesn't currently split those specific categories by Cash/EFT.
                </p>
            </div>
            <Footer />
            <Scrollbar />
        </Fragment>
    );
};

export default HeadOfficeDashboard;
