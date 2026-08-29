import React, { useState } from 'react';

const num = (v) => { const n = parseFloat(String(v).replace(/[^0-9.-]/g, '')); return isFinite(n) ? n : 0; };
const fmt = (n) => 'R ' + (isFinite(n) ? n : 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const serif = { fontFamily: "'Times New Roman', Georgia, serif" };
const cell = { border: '1px solid #000', padding: '6px 8px', fontSize: '13px', verticalAlign: 'top' };
const th = { ...cell, fontWeight: 700, textAlign: 'center' };
const line = { border: 'none', borderBottom: '1px solid #000', fontFamily: "'Times New Roman', Georgia, serif", fontSize: '13px', background: 'transparent', width: '100%' };

const JobsheetPreviewModal = ({ open, onClose, onNavigate }) => {
    const [day, setDay] = useState('Thursday');
    const [date, setDate] = useState('');
    const [foreman, setForeman] = useState({ name: '', method: 'cash', amount: '' });
    const [worker1, setWorker1] = useState({ name: '', method: 'cash', amount: '' });
    const [worker2, setWorker2] = useState({ name: '', method: 'cash', amount: '' });
    const [extra, setExtra] = useState('');
    const [sixX, setSixX] = useState('');
    const [transport, setTransport] = useState('');
    const [bagsIssued, setBagsIssued] = useState(''); const [bagsReturned, setBagsReturned] = useState(''); const [bagsUsed, setBagsUsed] = useState('');
    const [glovesIssued, setGlovesIssued] = useState(''); const [glovesReturned, setGlovesReturned] = useState(''); const [glovesUsed, setGlovesUsed] = useState('');

    if (!open) return null;

    const cashOf = (m) => m.method === 'cash' ? num(m.amount) : 0;
    const eftOf = (m) => m.method === 'eft' ? num(m.amount) : 0;
    const totalCash = cashOf(foreman) + cashOf(worker1) + cashOf(worker2);
    const totalEft = eftOf(foreman) + eftOf(worker1) + eftOf(worker2);
    const material = num(bagsUsed) * 1.94 + num(glovesUsed) * 7.5;
    const subtotal = totalCash + totalEft + num(extra) + num(sixX) + num(transport) + material;
    const admin = subtotal * 0.25;
    const invoiceAmount = subtotal + admin;

    const memberRow = (label, m, setM) => (
        <tr>
            <td style={cell}><b>{label}:</b> <input style={{ ...line, width: '55%', display: 'inline' }} placeholder="Name" value={m.name} onChange={(e) => setM({ ...m, name: e.target.value })} /></td>
            <td style={{ ...cell, textAlign: 'center' }}>
                <select style={{ ...serif, fontSize: '13px', border: '1px solid #999' }} value={m.method} onChange={(e) => setM({ ...m, method: e.target.value })}>
                    <option value="cash">Cash</option>
                    <option value="eft">EFT</option>
                </select>
            </td>
            <td style={cell}>R <input style={{ ...line, width: '70px', display: 'inline' }} value={m.amount} onChange={(e) => setM({ ...m, amount: e.target.value })} /></td>
        </tr>
    );

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(28,42,40,0.55)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 16px', overflowY: 'auto' }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div style={{ background: '#fff', maxWidth: '760px', width: '100%', border: '1px solid #1C2A28', boxShadow: '0 22px 50px rgba(15,22,20,0.32)', margin: '12px 0 40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', padding: '20px 26px', borderBottom: '2px solid #000' }}>
                    <div>
                        <h2 style={{ ...serif, fontSize: '19px', fontWeight: 700, margin: 0 }}>Jobsheet</h2>
                        <span style={{ fontSize: '12px', color: '#666' }}>Preview — filled in by the Foreman once the shift is deployed</span>
                    </div>
                    <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid #000', background: 'none', cursor: 'pointer', flexShrink: 0 }}>×</button>
                </div>

                <div style={{ padding: '26px 30px', ...serif, color: '#000' }}>
                    <div style={{ textAlign: 'center', fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}>Build One Zambia</div>
                    <div style={{ textAlign: 'center', marginBottom: '10px' }}><span style={{ border: '3px double #000', padding: '4px 22px', fontWeight: 700 }}>Field Operations</span></div>
                    <div style={{ textAlign: 'center', fontWeight: 700, fontSize: '18px', marginBottom: '4px' }}>JOBSHEET</div>
                    <div style={{ textAlign: 'center', fontSize: '13px', marginBottom: '16px' }}>PAY, MATERIALS &amp; INVOICE RECORD</div>

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                        <div style={{ border: '1px solid #000', padding: '4px 10px', fontSize: '13px' }}>
                            <label style={{ fontWeight: 700 }}>Day:</label> <input style={{ ...line, width: 110, display: 'inline' }} value={day} onChange={(e) => setDay(e.target.value)} />
                        </div>
                        <div style={{ border: '1px solid #000', padding: '4px 10px', fontSize: '13px' }}>
                            <label style={{ fontWeight: 700 }}>Date:</label> <input type="date" style={{ ...line, width: 150, display: 'inline' }} value={date} onChange={(e) => setDate(e.target.value)} />
                        </div>
                        <div style={{ border: '1px solid #000', padding: '4px 10px', fontSize: '13px', marginLeft: 'auto' }}>
                            <label style={{ fontWeight: 700 }}>Serial No.:</label> Assigned on approval
                        </div>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2px' }}>
                        <thead><tr><th style={th}>Team Member</th><th style={th}>Method</th><th style={th}>Amount</th></tr></thead>
                        <tbody>
                            {memberRow('Foreman', foreman, setForeman)}
                            {memberRow('Worker 1', worker1, setWorker1)}
                            {memberRow('Worker 2', worker2, setWorker2)}
                        </tbody>
                    </table>

                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '-1px' }}>
                        <tbody>
                            <tr>
                                <td style={{ ...cell, fontWeight: 700 }}>Extra</td>
                                <td style={cell}>R <input style={{ ...line, width: 80, display: 'inline' }} value={extra} onChange={(e) => setExtra(e.target.value)} /></td>
                                <td style={{ ...cell, fontWeight: 700 }}>6X Reward</td>
                                <td style={cell}>R <input style={{ ...line, width: 80, display: 'inline' }} value={sixX} onChange={(e) => setSixX(e.target.value)} /></td>
                            </tr>
                            <tr>
                                <td style={{ ...cell, fontWeight: 700 }}>Transport</td>
                                <td style={cell}>R <input style={{ ...line, width: 80, display: 'inline' }} value={transport} onChange={(e) => setTransport(e.target.value)} /></td>
                                <td style={{ ...cell, fontWeight: 700 }}>Labour Total</td>
                                <td style={cell}>R 385 / R 365</td>
                            </tr>
                            <tr>
                                <td style={cell}>
                                    <b>Bags:</b> Issued <input style={{ ...line, width: 40, display: 'inline' }} value={bagsIssued} onChange={(e) => setBagsIssued(e.target.value)} /> Returned <input style={{ ...line, width: 40, display: 'inline' }} value={bagsReturned} onChange={(e) => setBagsReturned(e.target.value)} /> Used <input style={{ ...line, width: 40, display: 'inline' }} value={bagsUsed} onChange={(e) => setBagsUsed(e.target.value)} />
                                </td>
                                <td style={cell} colSpan={3}>
                                    <b>Gloves:</b> Issued <input style={{ ...line, width: 40, display: 'inline' }} value={glovesIssued} onChange={(e) => setGlovesIssued(e.target.value)} /> Returned <input style={{ ...line, width: 40, display: 'inline' }} value={glovesReturned} onChange={(e) => setGlovesReturned(e.target.value)} /> Used <input style={{ ...line, width: 40, display: 'inline' }} value={glovesUsed} onChange={(e) => setGlovesUsed(e.target.value)} />
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '14px', textAlign: 'center', border: '1px solid #000', padding: '10px' }}>
                        <div><label style={{ display: 'block', fontWeight: 700, fontSize: '12px' }}>Total Cash</label><b>{fmt(totalCash)}</b></div>
                        <div><label style={{ display: 'block', fontWeight: 700, fontSize: '12px' }}>Total EFT</label><b>{fmt(totalEft)}</b></div>
                        <div><label style={{ display: 'block', fontWeight: 700, fontSize: '12px' }}>Subtotal</label><b>{fmt(subtotal)}</b></div>
                        <div><label style={{ display: 'block', fontWeight: 700, fontSize: '12px' }}>Admin Fee (25%)</label><b>{fmt(admin)}</b></div>
                    </div>
                    <div style={{ textAlign: 'right', marginTop: '10px', fontSize: '16px', fontWeight: 700 }}>Invoice Amount: {fmt(invoiceAmount)}</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', padding: '16px 26px 20px', borderTop: '1px solid #CFC7AF', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', color: '#666' }}>Preview only · the real Jobsheet is completed by the Foreman after deployment</span>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => onNavigate('summary')} style={{ padding: '8px 16px', fontSize: '12px', textTransform: 'uppercase', border: '1px solid #1C2A28', background: 'none', borderRadius: '2px', cursor: 'pointer' }}>View Summary Sheet</button>
                        <button onClick={() => onNavigate('invoice')} style={{ padding: '8px 16px', fontSize: '12px', textTransform: 'uppercase', border: '1px solid #1C2A28', background: 'none', borderRadius: '2px', cursor: 'pointer' }}>View Invoice</button>
                        <button onClick={onClose} style={{ padding: '8px 16px', fontSize: '12px', textTransform: 'uppercase', border: '1px solid #1C2A28', background: 'none', borderRadius: '2px', cursor: 'pointer' }}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobsheetPreviewModal;
