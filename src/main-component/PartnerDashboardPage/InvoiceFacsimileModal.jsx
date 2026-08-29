import React from 'react';

const fmt = (n) => Number(n || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const dateStr = (v) => v ? new Date(v).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const serif = { fontFamily: "'Times New Roman', Georgia, serif" };
const cell = { border: '1px solid #000', padding: '6px 10px', fontSize: '13px' };

const InvoiceFacsimileModal = ({ invoice, onClose }) => {
    if (!invoice) return null;

    const teamLines = [
        invoice.num_foremen > 0 && { desc: 'Foreman', qty: invoice.num_foremen },
        invoice.num_workers > 0 && { desc: 'Workers', qty: invoice.num_workers },
        invoice.num_operation_supervisors > 0 && { desc: 'Operation Supervisors', qty: invoice.num_operation_supervisors },
    ].filter(Boolean);

    return (
        <div
            style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(28,42,40,0.55)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 16px', overflowY: 'auto' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div style={{ background: '#fff', maxWidth: '820px', width: '100%', border: '1px solid #1C2A28', boxShadow: '0 22px 50px rgba(15,22,20,0.32)', margin: '12px 0 40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', padding: '20px 26px', borderBottom: '2px solid #000' }}>
                    <div>
                        <h2 style={{ ...serif, fontSize: '19px', fontWeight: 700, margin: 0 }}>Invoice</h2>
                        <span style={{ fontSize: '12px', color: '#666' }}>Build One Zambia — Quotation Invoice</span>
                    </div>
                    <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid #000', background: 'none', cursor: 'pointer', flexShrink: 0 }}>×</button>
                </div>

                <div style={{ padding: '26px 30px', ...serif, color: '#000' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '18px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <div style={{ width: 52, height: 52, borderRadius: '50%', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '18px', flexShrink: 0 }}>VK</div>
                            <div>
                                <p style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '0.04em', margin: '0 0 4px' }}>VINCENT KAFULA</p>
                                <p style={{ fontSize: '11px', lineHeight: 1.5, margin: 0 }}>
                                    Build One Zambia<br />
                                    37 Chiappini Street, St Andrew's Presbyterian Church, Cape Town<br />
                                    vincent.kafula@gmail.com &nbsp;·&nbsp; 0614615035
                                </p>
                            </div>
                        </div>
                        <div style={{ border: '1px solid #000', minWidth: '220px' }}>
                            <div style={{ textAlign: 'center', fontWeight: 700, padding: '6px', borderBottom: '1px solid #000' }}>Tax Invoice</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 10px', borderBottom: '1px solid #000', fontSize: '13px' }}>
                                <label style={{ fontWeight: 700 }}>Date</label><span>{dateStr(invoice.created_at)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 10px', borderBottom: '1px solid #000', fontSize: '13px' }}>
                                <label style={{ fontWeight: 700 }}>Invoice No.</label><span>INV-{String(invoice.id).padStart(5, '0')}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 10px', fontSize: '13px' }}>
                                <label style={{ fontWeight: 700 }}>Quotation Ref.</label><span>#{invoice.quotation_id}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ border: '1px solid #000', padding: '10px 12px', marginBottom: '18px' }}>
                        <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '6px', borderBottom: '1px solid #000', paddingBottom: '4px' }}>Bill To</div>
                        <div style={{ fontSize: '13px', lineHeight: 1.6 }}>
                            {invoice.partner_name}<br />
                            {invoice.partner_email && <>{invoice.partner_email}<br /></>}
                            {invoice.partner_phone && <>{invoice.partner_phone}<br /></>}
                            {invoice.location_address}
                        </div>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '4px' }}>
                        <thead>
                            <tr>
                                <th style={{ ...cell, textAlign: 'left', fontWeight: 700 }}>Description</th>
                                <th style={{ ...cell, textAlign: 'right', fontWeight: 700, width: '90px' }}>Qty</th>
                                <th style={{ ...cell, textAlign: 'right', fontWeight: 700, width: '140px' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teamLines.length === 0 ? (
                                <tr><td style={cell} colSpan={3}>{invoice.task_details || 'Field labour services'}</td></tr>
                            ) : (
                                <>
                                    <tr><td style={cell} colSpan={3}>{invoice.task_details || 'Field labour services'}</td></tr>
                                    {teamLines.map((l) => (
                                        <tr key={l.desc}>
                                            <td style={cell}>{l.desc}</td>
                                            <td style={{ ...cell, textAlign: 'right' }}>{l.qty}</td>
                                            <td style={{ ...cell, textAlign: 'right' }}>—</td>
                                        </tr>
                                    ))}
                                </>
                            )}
                            <tr>
                                <td style={{ ...cell, fontWeight: 700 }} colSpan={2}>Total Quotation Amount</td>
                                <td style={{ ...cell, textAlign: 'right', fontWeight: 700 }}>R{fmt(invoice.amount)}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '16px', marginTop: '18px', alignItems: 'start' }}>
                        <div style={{ fontSize: '12px', lineHeight: 1.6 }}>
                            <div>Payment terms: <strong style={{ textTransform: 'capitalize' }}>{invoice.payment_terms}</strong></div>
                            <div style={{ marginTop: '8px' }}>
                                Status:{' '}
                                <strong style={{ color: invoice.status === 'paid' ? '#2e7d32' : '#b26a00' }}>
                                    {invoice.status === 'paid' ? `Paid on ${dateStr(invoice.paid_at)}` : 'Unpaid'}
                                </strong>
                            </div>
                        </div>
                        <div style={{ border: '1px solid #000' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', fontSize: '15px', fontWeight: 700 }}>
                                <span>Total Due</span><span>R{fmt(invoice.amount)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '16px 26px 20px', borderTop: '1px solid #CFC7AF' }}>
                    <button onClick={() => window.print()} className="theme-btn" style={{ padding: '8px 18px', fontSize: '13px' }}>Print</button>
                    <button onClick={onClose} style={{ padding: '8px 18px', fontSize: '13px', border: '1px solid #1C2A28', background: 'none', borderRadius: '4px', cursor: 'pointer' }}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default InvoiceFacsimileModal;
