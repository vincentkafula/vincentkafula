import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../../images/logo-vk-full.png'
import Advocacy from '../../api/advocacy';
import { contactDetails } from '../../data/navigation';
import SocialLinks from '../SocialLinks/SocialLinks';
import { BozBand } from '../Advocacy/sections';
import { submitPublicForm } from '../../api/contactApi';

const ClickHandler = () => {
    window.scrollTo(10, 0);
}

const Newsletter = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({ state: 'idle', message: '' });

    const SubmitHandler = async (e) => {
        e.preventDefault();
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            setStatus({ state: 'error', message: 'Enter a valid email address.' });
            return;
        }
        setStatus({ state: 'sending', message: '' });
        try {
            await submitPublicForm('subscribe', { email });
            setEmail('');
            setStatus({ state: 'ok', message: 'Thank you — you’re on the list for updates.' });
        } catch (err) {
            setStatus({ state: 'error', message: err.message });
        }
    };

    return (
        <form onSubmit={SubmitHandler} noValidate>
            <div className="input-1">
                <label htmlFor="footer-email" className="vk-sr-only">Your email address</label>
                <input id="footer-email" type="email" className="form-control" placeholder="Your email address"
                    value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div className="submit clearfix">
                <button type="submit" disabled={status.state === 'sending'}>
                    {status.state === 'sending' ? 'Subscribing…' : 'Subscribe'}
                </button>
            </div>
            {status.message && (
                <p role={status.state === 'error' ? 'alert' : 'status'} style={{ marginTop: 10, fontSize: 14 }}>{status.message}</p>
            )}
        </form>
    );
};

const Footer = () => {
    return (
        <footer className="wpo-site-footer">
            <BozBand />
            <div className="wpo-upper-footer">
                <div className="container">
                    <div className="row">
                        <div className="col col-lg-3 col-md-6 col-12">
                            <div className="widget about-widget">
                                <div className="logo widget-title">
                                    <Link onClick={ClickHandler} className="navbar-brand" to="/"><img src={Logo} alt="Vincent Kafula — home" /></Link>
                                </div>
                                <p className="vk-footer-about">Vincent Kafula, Founder of Build One Zambia, advocating for a Zambia built by Zambians, for Zambians.</p>
                                <ul className="info">
                                    {contactDetails.phones.map((p) => (
                                        <li key={p.tel}>{p.label}: <a href={`tel:${p.tel}`}>{p.display}</a></li>
                                    ))}
                                    <li>Email: <a href={`mailto:${contactDetails.email}`}>{contactDetails.email}</a></li>
                                    <li>Address: {contactDetails.address}</li>
                                </ul>
                                <SocialLinks />
                            </div>
                        </div>
                        <div className="col col-lg-3 col-md-6 col-12">
                            <div className="widget link-widget">
                                <div className="widget-title">
                                    <h3>Quick links</h3>
                                </div>
                                <ul>
                                    <li><Link onClick={ClickHandler} to="/">Home</Link></li>
                                    <li><Link onClick={ClickHandler} to="/about">About Vincent Kafula</Link></li>
                                    <li><Link onClick={ClickHandler} to="/proposals">Policy proposals</Link></li>
                                    <li><Link onClick={ClickHandler} to="/resources">Research and resources</Link></li>
                                    <li><Link onClick={ClickHandler} to="/news">News and updates</Link></li>
                                    <li><Link onClick={ClickHandler} to="/campaign">Campaign events</Link></li>
                                    <li><Link onClick={ClickHandler} to="/volunteer">Volunteer</Link></li>
                                    <li><Link onClick={ClickHandler} to="/contact">Contact</Link></li>
                                </ul>
                            </div>
                        </div>
                        <div className="col col-lg-3 col-md-6 col-12">
                            <div className="widget link-widget s2">
                                <div className="widget-title">
                                    <h3>Key issues</h3>
                                </div>
                                <ul>
                                    {Advocacy.map((a) => (
                                        <li key={a.slug}><Link onClick={ClickHandler} to={`/advocacy/${a.slug}`}>{a.title}</Link></li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="col col-lg-3 col-md-6 col-12">
                            <div className="widget newsletter-widget">
                                <div className="widget-title">
                                    <h3>Stay informed</h3>
                                </div>
                                <p>Receive campaign news, statements and event announcements by email. You can unsubscribe at any time.</p>
                                <Newsletter />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="wpo-lower-footer">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col col-lg-6 col-md-12 col-12">
                            <ul>
                                <li>&copy; {new Date().getFullYear()} <Link onClick={ClickHandler} to="/">Vincent Kafula</Link>. All rights reserved.</li>
                            </ul>
                            <p className="vk-footer-disclaimer">Policy content on this site is drawn from the Build One Zambia campaign document.</p>
                        </div>
                        <div className="col col-lg-6 col-md-12 col-12">
                            <div className="link">
                                <ul>
                                    <li><Link onClick={ClickHandler} to="/privacy">Privacy Policy</Link></li>
                                    <li><Link onClick={ClickHandler} to="/terms">Terms of Use</Link></li>
                                    <li><Link onClick={ClickHandler} to="/faq">FAQ</Link></li>
                                    <li><Link onClick={ClickHandler} to="/search">Search</Link></li>
                                    <li><Link onClick={ClickHandler} to="/contact">Contact</Link></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer;
