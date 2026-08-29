import React from 'react';

const fmt = (n) => 'R ' + (isFinite(n) ? n : 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const serif = { fontFamily: "'Times New Roman', Georgia, serif" };
const cell = { border: '1px solid #000', padding: '6px 8px', fontSize: '13px' };

const InvoicePreviewModal = ({ open, onClose, onNavigate, fromName, taskTitle, rows, total }) => {
    if (!open) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(28,42,40,0.55)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 16px', overflowY: 'auto' }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div style={{ background: '#fff', maxWidth: '720px', width: '100%', border: '1px solid #1C2A28', boxShadow: '0 22px 50px rgba(15,22,20,0.32)', margin: '12px 0 40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', padding: '20px 26px', borderBottom: '2px solid #000' }}>
                    <div>
                        <h2 style={{ ...serif, fontSize: '19px', fontWeight: 700, margin: 0 }}>Invoice Preview</h2>
                        <span style={{ fontSize: '12px', color: '#666' }}>Indicative — the real invoice is generated after Manager approval</span>
                    </div>
                    <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid #000', background: 'none', cursor: 'pointer', flexShrink: 0 }}>×</button>
                </div>

                <div style={{ padding: '26px 30px', ...serif, color: '#000' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '18px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <div style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>VK</div>
                            <div>
                                <p style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px' }}>VINCENT KAFULA</p>
                                <p style={{ fontSize: '11px', lineHeight: 1.5, margin: 0 }}>
                                    Build One Zambia<br />
                                    37 Chiappini Street, St Andrew's Presbyterian Church, Cape Town
                                </p>
                            </div>
                        </div>
                        <div style={{ border: '1px solid #000', minWidth: '200px', textAlign: 'center', padding: '8px' }}>
                            <div style={{ fontWeight: 700, fontSize: '13px' }}>Draft Invoice</div>
                            <div style={{ fontSize: '12px', marginTop: '4px' }}>Serial No.: Assigned on approval</div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '14px', fontSize: '13px' }}><b>Bill To:</b> {fromName || '—'}</div>
                    {taskTitle && <div style={{ marginBottom: '14px', fontSize: '13px' }}><b>Task:</b> {taskTitle}</div>}

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ ...cell, textAlign: 'left', fontWeight: 700 }}>Role</th>
                                <th style={{ ...cell, textAlign: 'right', fontWeight: 700 }}>Rate</th>
                                <th style={{ ...cell, textAlign: 'right', fontWeight: 700 }}>Qty</th>
                                <th style={{ ...cell, textAlign: 'right', fontWeight: 700 }}>Line Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(!rows || rows.length === 0) ? (
                                <tr><td style={cell} colSpan={4}>No team requested yet</td></tr>
                            ) : rows.map((r) => (
                                <tr key={r.role}>
                                    <td style={cell}>{r.role}</td>
                                    <td style={{ ...cell, textAlign: 'right' }}>{r.rate ? fmt(r.rate) : 'TBC'}</td>
                                    <td style={{ ...cell, textAlign: 'right' }}>{r.qty}</td>
                                    <td style={{ ...cell, textAlign: 'right' }}>{r.total !== null ? fmt(r.total) : 'Confirmed by Ops'}</td>
                                </tr>
                            ))}
                            <tr>
                                <td style={{ ...cell, fontWeight: 700 }} colSpan={3}>Indicative Total</td>
                                <td style={{ ...cell, fontWeight: 700, textAlign: 'right' }}>{fmt(total)}</td>
                            </tr>
                        </tbody>
                    </table>
                    <p style={{ fontSize: '12px', color: '#666', marginTop: '14px' }}>
                        This preview reflects the team you've requested so far. The Operation Office confirms the final quotation amount, and a real invoice is issued once the Manager gives final approval (for upfront-terms accounts).
                    </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', padding: '16px 26px 20px', borderTop: '1px solid #CFC7AF', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', color: '#666' }}>Indicative preview · not a final invoice</span>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => onNavigate('jobsheet')} style={{ padding: '8px 16px', fontSize: '12px', textTransform: 'uppercase', border: '1px solid #1C2A28', background: 'none', borderRadius: '2px', cursor: 'pointer' }}>View Jobsheet</button>
                        <button onClick={onClose} style={{ padding: '8px 16px', fontSize: '12px', textTransform: 'uppercase', border: '1px solid #1C2A28', background: 'none', borderRadius: '2px', cursor: 'pointer' }}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoicePreviewModal;
