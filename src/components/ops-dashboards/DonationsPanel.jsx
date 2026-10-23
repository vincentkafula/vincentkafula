import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { donationsApi, currencySymbol } from '../../api/donationsApi';

// Donation records for Head Office. Payments themselves are managed in the Stripe Dashboard.
const cell = { padding: 6, borderBottom: '1px solid #f0f0f0', fontSize: 13 };

const DonationsPanel = () => {
    const [rows, setRows] = useState(null);
    useEffect(() => { donationsApi.list().then(setRows).catch((e) => { toast.error(e.message); setRows([]); }); }, []);
    const paid = (rows || []).filter((r) => r.status === 'paid');
    const totals = paid.reduce((acc, r) => ({ ...acc, [r.currency]: (acc[r.currency] || 0) + r.amount_cents / 100 }), {});

    return (
        <div style={{ marginTop: 50 }}>
            <h3 style={{ marginBottom: 6 }}>Donations</h3>
            <p style={{ color: '#555', fontSize: 14 }}>
                Card donations made through Stripe. Refunds and payouts are handled in the Stripe Dashboard.
                {' '}Total received: {Object.keys(totals).length ? Object.entries(totals).map(([c, v]) => `${currencySymbol(c)}${v.toFixed(2)}`).join(', ') : '—'}
                {' '}({paid.length} paid)
            </p>
            {rows === null ? <p>Loading…</p> : rows.length === 0 ? <p style={{ color: '#777' }}>No donations yet.</p> : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr>{['Date', 'Donor', 'Email', 'Amount', 'Status', 'Campaign', 'Message'].map((h) => <th key={h} style={{ ...cell, textAlign: 'left', borderBottom: '1px solid #ddd' }}>{h}</th>)}</tr></thead>
                        <tbody>
                            {rows.map((r) => (
                                <tr key={r.id}>
                                    <td style={cell}>{new Date(r.paid_at || r.created_at).toLocaleString('en-GB')}</td>
                                    <td style={cell}>{r.donor_first_name} {r.donor_last_name}</td>
                                    <td style={cell}>{r.donor_email}</td>
                                    <td style={cell}>{currencySymbol(r.currency)}{(r.amount_cents / 100).toFixed(2)}</td>
                                    <td style={{ ...cell, fontWeight: 700, color: r.status === 'paid' ? '#1F7A3A' : '#777' }}>{r.status}</td>
                                    <td style={cell}>{r.campaign_slug || '—'}</td>
                                    <td style={cell}>{r.message || ''}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default DonationsPanel;
