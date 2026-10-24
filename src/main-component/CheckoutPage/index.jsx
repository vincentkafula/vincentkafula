import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { Link, useLocation } from 'react-router-dom';
import Navbar2 from '../../components/Navbar2/Navbar2';
import PageTitle from "../../components/pagetitle/PageTitle";
import Scrollbar from '../../components/scrollbar/scrollbar'
import Footer from '../../components/footer/Footer';
import { removeFromCart } from '../../store/slices/cartSlice';
import { shopApi, cartLines, formatMoney } from '../../api/shopApi';
import './checkout.css';

const CODES = 'AD AE AF AG AI AL AM AO AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GT GU GW GY HK HN HR HT HU ID IE IL IM IN IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TG TH TJ TL TM TN TO TR TT TV TW TZ UA UG US UY UZ VA VC VE VG VI VN VU WF WS XK YE YT ZA ZM ZW'.split(' ');
const PINNED = ['ZM', 'ZA'];

function useCountries() {
    return useMemo(() => {
        let names;
        try { names = new Intl.DisplayNames(['en'], { type: 'region' }); } catch { names = null; }
        const all = CODES.map((c) => ({ code: c, name: names?.of(c) || c })).sort((a, b) => a.name.localeCompare(b.name));
        return [...all.filter((c) => PINNED.includes(c.code)).sort((a, b) => PINNED.indexOf(a.code) - PINNED.indexOf(b.code)), ...all.filter((c) => !PINNED.includes(c.code))];
    }, []);
}

const CheckoutPage = () => {
    const cart = useSelector((state) => state.cart.cart);
    const dispatch = useDispatch();
    const { search } = useLocation();
    const countries = useCountries();
    const legacy = cart.filter((i) => !i.product_id);
    const lines = useMemo(() => cartLines(cart), [cart]);

    const [f, setF] = useState({ name: '', email: '', phone: '', line1: '', line2: '', city: '', province: '', postal_code: '', country_code: '' });
    const [quote, setQuote] = useState(null);
    const [quoteError, setQuoteError] = useState('');
    const [quoting, setQuoting] = useState(false);
    const [method, setMethod] = useState('');
    const [paying, setPaying] = useState(false);
    const [error, setError] = useState('');
    const [config, setConfig] = useState(null);
    const ch = (e) => setF({ ...f, [e.target.name]: e.target.value });

    useEffect(() => { shopApi.config().then(setConfig).catch(() => setConfig({ checkout: false })); }, []);

    // Ask the server for prices and shipping whenever the cart or country changes.
    useEffect(() => {
        if (!f.country_code || !lines.length) { setQuote(null); return undefined; }
        let live = true;
        setQuoting(true); setQuoteError('');
        shopApi.quote(f.country_code, lines)
            .then((q) => { if (!live) return; setQuote(q); setMethod((m) => (q.options.some((o) => o.name === m) ? m : q.options[0]?.name || '')); })
            .catch((e) => { if (live) { setQuote(null); setQuoteError(e.message); } })
            .finally(() => live && setQuoting(false));
        return () => { live = false; };
    }, [f.country_code, lines]);

    const option = quote?.options.find((o) => o.name === method);
    const total = quote ? quote.subtotal + (option?.price || 0) : null;
    const cur = quote?.currency || config?.currency || 'usd';

    const pay = async (e) => {
        e.preventDefault();
        setError('');
        const missing = ['name', 'email', 'phone', 'line1', 'city', 'province', 'country_code'].filter((k) => !String(f[k]).trim());
        if (missing.length) { setError('Please complete all required fields.'); return; }
        if (!option) { setError('Choose a shipping option.'); return; }
        setPaying(true);
        try {
            const country = countries.find((c) => c.code === f.country_code);
            const r = await shopApi.checkout({
                items: lines,
                shipping_method: option.name,
                customer: { name: f.name, email: f.email, phone: f.phone },
                address: { line1: f.line1, line2: f.line2, city: f.city, province: f.province, postal_code: f.postal_code, country_code: f.country_code, country_name: country?.name },
            });
            window.location.href = r.url;
        } catch (err) {
            setError(err.message);
            setPaying(false);
        }
    };

    return (
        <Fragment>
            <Navbar2 />
            <PageTitle pageTitle={'Checkout'} pagesub={'Checkout'} />
            <section className="co-page section-padding">
                <div className="container">
                    {new URLSearchParams(search).get('cancelled') && <div className="co-note">Payment was cancelled. Your cart is still here whenever you are ready.</div>}
                    {legacy.length > 0 && (
                        <div className="co-note co-warn">
                            Some items in your cart are no longer sold: {legacy.map((i) => i.title).join(', ')}.{' '}
                            <button type="button" onClick={() => legacy.forEach((i) => dispatch(removeFromCart(i.id)))}>Remove them</button>
                        </div>
                    )}
                    {!lines.length ? (
                        <div className="co-empty"><h2>Your cart is empty</h2><Link className="theme-btn" to="/shop">Visit the shop</Link></div>
                    ) : (
                        <form className="co-grid" onSubmit={pay} noValidate>
                            <div className="co-form">
                                <h3>Contact</h3>
                                <div className="co-fields">
                                    <label className="co-full">Full name *<input name="name" value={f.name} onChange={ch} autoComplete="name" /></label>
                                    <label>Email *<input type="email" name="email" value={f.email} onChange={ch} autoComplete="email" /></label>
                                    <label>Phone (for the courier) *<input name="phone" value={f.phone} onChange={ch} autoComplete="tel" /></label>
                                </div>
                                <h3>Delivery address</h3>
                                <div className="co-fields">
                                    <label className="co-full">Country *
                                        <select name="country_code" value={f.country_code} onChange={ch} autoComplete="country">
                                            <option value="">Select your country</option>
                                            {countries.map((c, i) => <option key={c.code} value={c.code}>{c.name}{i === PINNED.length - 1 ? '' : ''}</option>)}
                                        </select>
                                    </label>
                                    <label className="co-full">Street address *<input name="line1" value={f.line1} onChange={ch} autoComplete="address-line1" placeholder="House number and street" /></label>
                                    <label className="co-full">Apartment, suite, etc. (optional)<input name="line2" value={f.line2} onChange={ch} autoComplete="address-line2" /></label>
                                    <label>Town / city *<input name="city" value={f.city} onChange={ch} autoComplete="address-level2" /></label>
                                    <label>Province / state *<input name="province" value={f.province} onChange={ch} autoComplete="address-level1" /></label>
                                    <label>Postal code<input name="postal_code" value={f.postal_code} onChange={ch} autoComplete="postal-code" /></label>
                                </div>
                                <h3>Shipping</h3>
                                {!f.country_code ? <p className="co-muted">Choose your country to see delivery options.</p>
                                    : quoting ? <p className="co-muted">Checking delivery options…</p>
                                        : quoteError ? <p className="co-error">{quoteError}</p>
                                            : quote && (
                                                <div className="co-options" role="radiogroup" aria-label="Shipping options">
                                                    {quote.options.map((o) => (
                                                        <label key={o.name} className={`co-option ${method === o.name ? 'active' : ''}`}>
                                                            <input type="radio" name="ship" checked={method === o.name} onChange={() => setMethod(o.name)} />
                                                            <span><strong>{o.name}</strong>{o.days && <small>{o.days} days</small>}</span>
                                                            <em>{o.price ? formatMoney(o.price, cur) : 'Free'}</em>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                            </div>

                            <aside className="co-summary">
                                <h3>Your order</h3>
                                <ul>
                                    {(quote?.items || cart.filter((i) => i.product_id).map((i) => ({ name: i.title, quantity: i.qty, unit_price: Number(i.price), image: i.proImg }))).map((i, n) => (
                                        <li key={n}>
                                            {i.image && <img src={i.image} alt="" />}
                                            <span>{i.name}{i.variant ? <small>{i.variant}</small> : null}<small>Qty {i.quantity}</small></span>
                                            <strong>{formatMoney(i.unit_price * i.quantity, cur)}</strong>
                                        </li>
                                    ))}
                                </ul>
                                <dl>
                                    <div><dt>Subtotal</dt><dd>{quote ? formatMoney(quote.subtotal, cur) : '—'}</dd></div>
                                    <div><dt>Shipping</dt><dd>{option ? (option.price ? formatMoney(option.price, cur) : 'Free') : '—'}</dd></div>
                                    <div className="co-total"><dt>Total</dt><dd>{total !== null ? formatMoney(total, cur) : '—'}</dd></div>
                                </dl>
                                {error && <p className="co-error" role="alert">{error}</p>}
                                {config && !config.checkout && <p className="co-error">Card payments are not available yet.</p>}
                                <button type="submit" className="theme-btn co-pay" disabled={paying || !option || (config && !config.checkout)}>
                                    {paying ? 'Opening secure payment…' : total !== null ? `Pay ${formatMoney(total, cur)}` : 'Pay securely'}
                                </button>
                                <p className="co-muted co-small">You will pay on Stripe’s secure page. Profit from your order funds the campaign.</p>
                            </aside>
                        </form>
                    )}
                </div>
            </section>
            <Footer />
            <Scrollbar />
        </Fragment>
    );
};

export default CheckoutPage;
