import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import Navbar2 from '../../components/Navbar2/Navbar2';
import PageTitle from '../../components/pagetitle/PageTitle';
import Footer from '../../components/footer/Footer';
import Scrollbar from '../../components/scrollbar/scrollbar';
import { clearCart } from '../../store/slices/cartSlice';
import { shopApi, formatMoney } from '../../api/shopApi';
import '../CheckoutPage/checkout.css';

const OrderRecived = () => {
    const { search } = useLocation();
    const params = new URLSearchParams(search);
    const sessionId = params.get('session_id');
    const dispatch = useDispatch();
    const [order, setOrder] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!sessionId) { setError('No order to show.'); return; }
        shopApi.session(sessionId)
            .then((o) => { setOrder(o); if (o.paid) dispatch(clearCart()); })
            .catch((e) => setError(e.message));
    }, [sessionId, dispatch]);

    return (
        <Fragment>
            <Navbar2 />
            <PageTitle pageTitle={'Order received'} pagesub={'Order'} />
            <section className="co-page section-padding">
                <div className="container" style={{ maxWidth: 760 }}>
                    {error && <div className="co-note">{error} <Link to="/track-order">Track an order</Link></div>}
                    {!order && !error && <p>Confirming your payment…</p>}
                    {order && (
                        <div className="co-summary" style={{ position: 'static' }}>
                            <h3>{order.paid ? 'Thank you — your order is confirmed' : 'We are waiting for your payment to clear'}</h3>
                            <p>Order number <strong>{order.order_number}</strong>. A confirmation has been sent to {order.email}. We will email the tracking number when it ships.</p>
                            <ul>
                                {order.items.map((i, n) => (
                                    <li key={n}>
                                        {i.image ? <img src={i.image} alt="" /> : <span />}
                                        <span>{i.name}{i.variant && <small>{i.variant}</small>}<small>Qty {i.quantity}</small></span>
                                        <strong>{formatMoney(i.unit_price * i.quantity, order.currency)}</strong>
                                    </li>
                                ))}
                            </ul>
                            <dl>
                                <div><dt>Subtotal</dt><dd>{formatMoney(order.subtotal, order.currency)}</dd></div>
                                <div><dt>Shipping ({order.shipping_method})</dt><dd>{formatMoney(order.shipping, order.currency)}</dd></div>
                                <div className="co-total"><dt>Total paid</dt><dd>{formatMoney(order.total, order.currency)}</dd></div>
                            </dl>
                            <p className="co-muted">The profit from your order goes to the campaign. Thank you for your support.</p>
                            <Link className="theme-btn" to="/shop">Back to the shop</Link>
                        </div>
                    )}
                </div>
            </section>
            <Footer />
            <Scrollbar />
        </Fragment>
    );
};

export default OrderRecived;
