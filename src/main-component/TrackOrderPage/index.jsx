import React, { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar2 from '../../components/Navbar2/Navbar2';
import PageTitle from '../../components/pagetitle/PageTitle';
import Footer from '../../components/footer/Footer';
import Scrollbar from '../../components/scrollbar/scrollbar';
import { shopApi, formatMoney } from '../../api/shopApi';
import '../CheckoutPage/checkout.css';

const TrackOrderPage = () => {
    const [form, setForm] = useState({ order: '', email: '' });
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const submit = async (e) => {
        e.preventDefault();
        setError(''); setResult(null); setBusy(true);
        try { setResult(await shopApi.track(form.order.trim(), form.email.trim())); } catch (err) { setError(err.message); } finally { setBusy(false); }
    };
    return (
        <Fragment>
            <Navbar2 />
            <PageTitle pageTitle={'Track your order'} pagesub={'Track order'} />
            <section className="co-page section-padding">
                <div className="container" style={{ maxWidth: 700 }}>
                    <form onSubmit={submit} className="co-fields" noValidate>
                        <label>Order number<input value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} placeholder="e.g. VK2610-0B3703" /></label>
                        <label>Email used at checkout<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
                        <button type="submit" className="theme-btn co-full" disabled={busy}>{busy ? 'Looking up…' : 'Track order'}</button>
                    </form>
                    {error && <p className="co-error" style={{ marginTop: 20 }}>{error}</p>}
                    {result && (
                        <div className="co-summary" style={{ position: 'static', marginTop: 30 }}>
                            <h3>{result.status}</h3>
                            <p>Order {result.order_number}, placed {new Date(result.placed).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} — {formatMoney(result.total, result.currency)}</p>
                            <ul>{result.items.map((i, n) => <li key={n}><span /><span>{i.name}{i.variant && <small>{i.variant}</small>}</span><strong>× {i.quantity}</strong></li>)}</ul>
                            {result.tracking_number ? (
                                <p>Carrier: {result.carrier}<br />Tracking number: <strong>{result.tracking_number}</strong><br />
                                    <a href={`https://www.17track.net/en/track?nums=${encodeURIComponent(result.tracking_number)}`} target="_blank" rel="noopener noreferrer">Follow the parcel</a></p>
                            ) : <p className="co-muted">A tracking number will appear here, and be emailed to you, once the order ships.</p>}
                        </div>
                    )}
                    <p style={{ marginTop: 30 }}><Link to="/shop">Back to the shop</Link></p>
                </div>
            </section>
            <Footer />
            <Scrollbar />
        </Fragment>
    );
};

export default TrackOrderPage;
