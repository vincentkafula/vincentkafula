import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { donationsApi, currencySymbol } from '../../api/donationsApi'
import visa from '../../images/icon/visa.png';
import mastercard from '../../images/icon/mastercard.png';

const EMPTY = { amount: '', first_name: '', last_name: '', email: '', address: '', message: '' };

// Donation form used on the Donate page and the campaign event Donation tab.
// "Payment by Card" opens Stripe's secure checkout; "Offline Donation" sends the offer to the campaign office.
const DonationForm = ({ campaignSlug }) => {
    const { search } = useLocation();
    const [form, setForm] = useState(EMPTY);
    const [method, setMethod] = useState('card');
    const [config, setConfig] = useState({ enabled: false, currency: 'usd' });
    const [result, setResult] = useState(null);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        donationsApi.config().then((c) => {
            setConfig(c);
            if (!c.enabled) setMethod('offline');
        });
    }, []);

    // Returning from Stripe: confirm the payment with the server.
    useEffect(() => {
        const params = new URLSearchParams(search);
        const status = params.get('donation');
        if (status === 'cancelled') setResult({ type: 'info', text: 'Your donation was cancelled. You have not been charged.' });
        if (status === 'success' && params.get('session_id')) {
            setResult({ type: 'info', text: 'Confirming your donation…' });
            donationsApi.confirm(params.get('session_id'))
                .then((r) => setResult(r.status === 'paid'
                    ? { type: 'ok', text: `Thank you. Your donation of ${currencySymbol(r.currency)}${Number(r.amount).toFixed(2)} has been received. A receipt has been sent to your email.` }
                    : { type: 'info', text: 'Your payment is being processed. You will receive an email from Stripe once it is complete.' }))
                .catch(() => setResult({ type: 'info', text: 'Thank you. Your payment is being processed.' }));
        }
    }, [search]);

    const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const symbol = currencySymbol(config.currency);

    const SubmitHandler = async (e) => {
        e.preventDefault()
        if (!form.first_name.trim() || !form.last_name.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) {
            toast.error('Please enter your first name, last name and a valid email address.');
            return;
        }
        const amount = Number(form.amount);
        if (method === 'card' && (!Number.isFinite(amount) || amount < (config.min || 1))) {
            toast.error(`Please enter a donation amount of at least ${symbol}${config.min || 1}.`);
            return;
        }
        setBusy(true);
        try {
            if (method === 'card') {
                const { url } = await donationsApi.checkout({ ...form, amount, campaign_slug: campaignSlug });
                window.location.href = url;
                return;
            }
            await donationsApi.offline({
                name: `${form.first_name} ${form.last_name}`,
                email: form.email,
                subject: `Offline donation${form.amount ? ` of ${symbol}${form.amount}` : ''}${campaignSlug ? ` (${campaignSlug})` : ''}`,
                message: [form.message, form.address && `Address: ${form.address}`].filter(Boolean).join('\n') || 'Offline donation offer',
            });
            setForm(EMPTY);
            toast.success('Thank you. The campaign office will contact you to arrange your donation.');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <div id="Donations" className="tab-pane">
            {result && (
                <p role="status" style={{ padding: '14px 18px', borderRadius: 6, marginBottom: 20, fontWeight: 600,
                    background: result.type === 'ok' ? '#E8F5EC' : '#FFF6F1', color: result.type === 'ok' ? '#155d2b' : '#16182F' }}>
                    {result.text}
                </p>
            )}
            <form onSubmit={SubmitHandler}>
                <div className="wpo-donations-amount">
                    <h2>Your Donation</h2>
                    <input type="number" min={config.min || 1} step="0.01" inputMode="decimal" className="form-control" name="amount"
                        value={form.amount} onChange={change} aria-label="Donation amount"
                        placeholder={`Enter Donation Amount (${config.currency.toUpperCase()})`} />
                </div>
                <div className="wpo-donations-details">
                    <h2>Details</h2>
                    <div className="row">
                        <div className="col-lg-6 col-md-6 col-sm-6 col-12 form-group">
                            <input type="text" className="form-control" name="first_name" value={form.first_name} onChange={change} placeholder="First Name" autoComplete="given-name" />
                        </div>
                        <div className="col-lg-6 col-md-6 col-sm-6 col-12 form-group">
                            <input type="text" className="form-control" name="last_name" value={form.last_name} onChange={change} placeholder="Last Name" autoComplete="family-name" />
                        </div>
                        <div className="col-lg-6 col-md-6 col-sm-6 col-12 form-group clearfix">
                            <input type="email" className="form-control" name="email" value={form.email} onChange={change} placeholder="Email" autoComplete="email" />
                        </div>
                        <div className="col-lg-6 col-md-6 col-sm-6 col-12 form-group">
                            <input type="text" className="form-control" name="address" value={form.address} onChange={change} placeholder="Address" autoComplete="street-address" />
                        </div>
                        <div className="col-lg-12 col-12 form-group">
                            <textarea className="form-control" name="message" value={form.message} onChange={change} placeholder="Message"></textarea>
                        </div>
                    </div>
                </div>
                <div className="wpo-doanation-payment">
                    <h2>Choose Your Payment Method</h2>
                    <div className="wpo-payment-area">
                        <div className="row">
                            <div className="col-12">
                                <div className="wpo-payment-option" id="open4">
                                    <div className="wpo-payment-select">
                                        <ul>
                                            <li className="addToggle">
                                                <input id={`card-${campaignSlug || 'page'}`} type="radio" name="payment" value="card"
                                                    checked={method === 'card'} disabled={!config.enabled} onChange={() => setMethod('card')} />
                                                <label htmlFor={`card-${campaignSlug || 'page'}`}>Payment By Card</label>
                                            </li>
                                            <li className="removeToggle">
                                                <input id={`offline-${campaignSlug || 'page'}`} type="radio" name="payment" value="offline"
                                                    checked={method === 'offline'} onChange={() => setMethod('offline')} />
                                                <label htmlFor={`offline-${campaignSlug || 'page'}`}>Offline Donation</label>
                                            </li>
                                        </ul>
                                    </div>
                                    {method === 'card' ? (
                                        <div id="open5" className="payment-name" style={{ display: 'block' }}>
                                            <ul>
                                                <li className="visa"><label><img src={visa} alt="Visa" /></label></li>
                                                <li className="mas"><label><img src={mastercard} alt="Mastercard" /></label></li>
                                            </ul>
                                            <p style={{ marginTop: 12 }}>
                                                When you select Donate Now, you will be taken to Stripe’s secure payment page to enter your card details.
                                                Your card details are never stored on this website.
                                            </p>
                                        </div>
                                    ) : (
                                        <p style={{ marginTop: 12 }}>
                                            {config.enabled ? '' : 'Card payments are not available at the moment. '}
                                            Send your details and the campaign office will contact you to arrange an offline donation.
                                            You can also <Link to="/contact">contact us</Link> directly.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="submit-area">
                    <button type="submit" className="theme-btn submit-btn" disabled={busy}>
                        {busy ? 'Please wait…' : 'Donate Now'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default DonationForm;
