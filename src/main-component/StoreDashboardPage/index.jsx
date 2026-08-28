import React, { Fragment, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Navbar2 from '../../components/Navbar2/Navbar2';
import DashboardTopbar from '../../components/ops-dashboards/DashboardTopbar';
import PageTitle from '../../components/pagetitle/PageTitle';
import Footer from '../../components/footer/Footer';
import Scrollbar from '../../components/scrollbar/scrollbar';
import { jobsheetsApi } from '../../api/jobsheetsApi';
import { getAuth } from '../../api/authApi';

const StoreDashboard = () => {
    const [jobsheets, setJobsheets] = useState([]);
    const [loading, setLoading] = useState(false);

    const load = () => {
        setLoading(true);
        jobsheetsApi.list()
            .then(setJobsheets)
            .catch((err) => toast.error(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const totals = jobsheets.reduce((acc, j) => ({
        bagsIssued: acc.bagsIssued + Number(j.bags_issued || 0),
        bagsReturned: acc.bagsReturned + Number(j.bags_returned || 0),
        bagsUsed: acc.bagsUsed + Number(j.bags_used || 0),
        glovesIssued: acc.glovesIssued + Number(j.gloves_issued || 0),
        glovesReturned: acc.glovesReturned + Number(j.gloves_returned || 0),
        glovesUsed: acc.glovesUsed + Number(j.gloves_used || 0),
    }), { bagsIssued: 0, bagsReturned: 0, bagsUsed: 0, glovesIssued: 0, glovesReturned: 0, glovesUsed: 0 });

    return (
        <Fragment>
            <Navbar2 />
            <DashboardTopbar />
            <PageTitle pageTitle={'Store Dashboard'} pagesub={'Dashboard'} />
            <div className="container" style={{ padding: '80px 15px' }}>
                <div style={{ marginBottom: '24px' }}>
                    <p style={{ color: '#555', fontSize: '14px' }}>Signed in as <strong>{getAuth()?.display_name}</strong></p>
                </div>

                <h3 style={{ marginBottom: '18px' }}>Materials Summary — All Shift Slips</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '30px' }}>
                    {[
                        ['Bags Issued', totals.bagsIssued],
                        ['Bags Returned', totals.bagsReturned],
                        ['Bags Used', totals.bagsUsed],
                        ['Gloves Issued', totals.glovesIssued],
                        ['Gloves Returned', totals.glovesReturned],
                        ['Gloves Used', totals.glovesUsed],
                    ].map(([label, value]) => (
                        <div key={label} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '16px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                            <div style={{ fontSize: '24px', fontWeight: 700 }}>{value}</div>
                            <div style={{ fontSize: '13px', color: '#777' }}>{label}</div>
                        </div>
                    ))}
                </div>

                <h3 style={{ marginBottom: '18px' }}>Shift Slips ({jobsheets.length})</h3>
                {loading ? <p>Loading...</p> : jobsheets.length === 0 ? (
                    <p style={{ color: '#777' }}>No shift slips submitted yet.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                                    <th style={{ padding: '10px' }}>Team</th>
                                    <th style={{ padding: '10px' }}>Foreman</th>
                                    <th style={{ padding: '10px' }}>Bags I/R/U</th>
                                    <th style={{ padding: '10px' }}>Gloves I/R/U</th>
                                    <th style={{ padding: '10px' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobsheets.map((j) => (
                                    <tr key={j.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                        <td style={{ padding: '10px' }}>{j.team_name}</td>
                                        <td style={{ padding: '10px' }}>{j.foreman_name}</td>
                                        <td style={{ padding: '10px' }}>{j.bags_issued} / {j.bags_returned} / {j.bags_used}</td>
                                        <td style={{ padding: '10px' }}>{j.gloves_issued} / {j.gloves_returned} / {j.gloves_used}</td>
                                        <td style={{ padding: '10px', textTransform: 'capitalize' }}>{j.status}</td>
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

export default StoreDashboard;
