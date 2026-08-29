import React, { useState } from 'react';

const num = (v) => { const n = parseFloat(String(v).replace(/[^0-9.-]/g, '')); return isFinite(n) ? n : 0; };
const fmt = (n) => 'R ' + (isFinite(n) ? n : 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const serif = { fontFamily: "'Times New Roman', Georgia, serif" };
const cell = { border: '1px solid #000', padding: '5px 8px', fontSize: '13px' };
const line = { border: 'none', borderBottom: '1px solid #000', fontFamily: "'Times New Roman', Georgia, serif", fontSize: '13px', background: 'transparent', width: '100%' };

const emptyRow = () => ({ jobsheet: '', cashPaid: '' });

const SummarySheetPreviewModal = ({ open, onClose, onNavigate }) => {
    const [session, setSession] = useState('AM');
    const [date, setDate] = useState('');
    const [rows, setRows] = useState(Array.from({ length: 6 }, emptyRow));
    const [vouchers, setVouchers] = useState(Array.from({ length: 3 }, () => ({ desc: '', amount: '' })));
    const [dayAmount, setDayAmount] = useState('');

    if (!open) return null;

    const setRow = (i, field, value) => setRows((rs) => rs.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
    const setVoucher = (i, field, value) => setVouchers((vs) => vs.map((v, idx) => idx === i ? { ...v, [field]: value } : v));

    const cashSubtotal = rows.reduce((s, r) => s + num(r.cashPaid), 0);
    const voucherTotal = vouchers.reduce((s, v) => s + num(v.amount), 0);
    const totalPaidOut = cashSubtotal + voucherTotal;
    const balance = num(dayAmount) - totalPaidOut;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(28,42,40,0.55)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 16px', overflowY: 'auto' }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div style={{ background: '#fff', maxWidth: '760px', width: '100%', border: '1px solid #1C2A28', boxShadow: '0 22px 50px rgba(15,22,20,0.32)', margin: '12px 0 40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', padding: '20px 26px', borderBottom: '2px solid #000' }}>
                    <div>
                        <h2 style={{ ...serif, fontSize: '19px', fontWeight: 700, margin: 0 }}>Summary Sheet</h2>
                        <span style={{ fontSize: '12px', color: '#666' }}>Preview — compiled by Day Admin at end of session</span>
                    </div>
                    <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid #000', background: 'none', cursor: 'pointer', flexShrink: 0 }}>×</button>
                </div>

                <div style={{ padding: '26px 30px', ...serif, color: '#000' }}>
                    <div style={{ fontSize: '20px', fontWeight: 700, textDecoration: 'underline', marginBottom: '14px' }}>
                        Field Shifts Summary — <input style={{ ...line, width: 200, display: 'inline', fontWeight: 700, textDecoration: 'underline' }} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '14px' }}>
                        Session:{' '}
                        <select style={{ ...serif, fontSize: '14px', border: '1px solid #999', fontWeight: 700 }} value={session} onChange={(e) => setSession(e.target.value)}>
                            <option value="AM">AM (07:30 Roll Call)</option>
                            <option value="PM">PM (12:30 Roll Call)</option>
                        </select>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
                        <thead><tr><th style={{ ...cell, fontWeight: 700, textAlign: 'left' }}>Jobsheet / Shift</th><th style={{ ...cell, fontWeight: 700, textAlign: 'right', width: '160px' }}>Cash Paid</th></tr></thead>
                        <tbody>
                            {rows.map((r, i) => (
                                <tr key={i}>
                                    <td style={cell}><input style={line} value={r.jobsheet} onChange={(e) => setRow(i, 'jobsheet', e.target.value)} /></td>
                                    <td style={cell}>R <input style={{ ...line, width: 80, display: 'inline' }} value={r.cashPaid} onChange={(e) => setRow(i, 'cashPaid', e.target.value)} /></td>
                                </tr>
                            ))}
                            <tr><td style={{ ...cell, fontWeight: 700, textAlign: 'right' }}>Subtotal</td><td style={{ ...cell, fontWeight: 700 }}>{fmt(cashSubtotal)}</td></tr>
                        </tbody>
                    </table>

                    <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '8px' }}>Cash Voucher / Petty Cash Summary</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
                        <tbody>
                            {vouchers.map((v, i) => (
                                <tr key={i}>
                                    <td style={cell}><input style={line} placeholder="Voucher description" value={v.desc} onChange={(e) => setVoucher(i, 'desc', e.target.value)} /></td>
                                    <td style={{ ...cell, width: '160px' }}>R <input style={{ ...line, width: 80, display: 'inline' }} value={v.amount} onChange={(e) => setVoucher(i, 'amount', e.target.value)} /></td>
                                </tr>
                            ))}
                            <tr><td style={{ ...cell, fontWeight: 700, textAlign: 'right' }}>Voucher Total</td><td style={{ ...cell, fontWeight: 700 }}>{fmt(voucherTotal)}</td></tr>
                        </tbody>
                    </table>

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                            <tr><td style={{ ...cell, fontWeight: 700, textAlign: 'right' }}>Total Amount Paid Out</td><td style={{ ...cell, fontWeight: 700, width: '160px' }}>{fmt(totalPaidOut)}</td></tr>
                            <tr>
                                <td style={{ ...cell, fontWeight: 700, textAlign: 'right' }}>Day Amount Provided</td>
                                <td style={cell}>R <input style={{ ...line, width: 80, display: 'inline' }} value={dayAmount} onChange={(e) => setDayAmount(e.target.value)} /></td>
                            </tr>
                            <tr><td style={{ ...cell, fontWeight: 700, textAlign: 'right' }}>Balance Left Over</td><td style={{ ...cell, fontWeight: 700 }}>{fmt(balance)}</td></tr>
                        </tbody>
                    </table>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', fontSize: '13px', flexWrap: 'wrap', gap: '20px' }}>
                        <div>Received: <input style={{ ...line, width: 200, display: 'inline' }} /><div style={{ textAlign: 'center', fontSize: '11px', marginTop: '2px' }}>Day Admin</div></div>
                        <div>Submitted: <input style={{ ...line, width: 200, display: 'inline' }} /><div style={{ textAlign: 'center', fontSize: '11px', marginTop: '2px' }}>Day Admin</div></div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', padding: '16px 26px 20px', borderTop: '1px solid #CFC7AF', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', color: '#666' }}>Preview only · totals calculate automatically</span>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => onNavigate('invoice')} style={{ padding: '8px 16px', fontSize: '12px', textTransform: 'uppercase', border: '1px solid #1C2A28', background: 'none', borderRadius: '2px', cursor: 'pointer' }}>View Invoice</button>
                        <button onClick={onClose} style={{ padding: '8px 16px', fontSize: '12px', textTransform: 'uppercase', border: '1px solid #1C2A28', background: 'none', borderRadius: '2px', cursor: 'pointer' }}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SummarySheetPreviewModal;
