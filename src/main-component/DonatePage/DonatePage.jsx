import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar2 from '../../components/Navbar2/Navbar2'
import PageTitle from '../../components/pagetitle/PageTitle'
import Footer from '../../components/footer/Footer'
import Scrollbar from '../../components/scrollbar/scrollbar'
import Seo from '../../components/Seo/Seo'
import { SectionHead } from '../../components/Advocacy/sections'
import { submitPublicForm } from '../../api/contactApi'

const EMPTY = { name: '', email: '', phone: '', subject: '', message: '' };
const SUPPORT_TYPES = ['Financial contribution', 'Materials or equipment', 'Professional skills', 'Venue or transport for an event', 'Other'];

// Online card payments are not set up. This page collects offers of support so the
// campaign can follow up directly, without taking any payment details.
const DonatePage = () => {
    const [form, setForm] = useState(EMPTY);
    const [status, setStatus] = useState({ state: 'idle', message: '' });
    const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const submit = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email) || !form.subject) {
            setStatus({ state: 'error', message: 'Please enter your name, a valid email address and the type of support.' });
            return;
        }
        setStatus({ state: 'sending', message: '' });
        try {
            await submitPublicForm('support', form);
            setForm(EMPTY);
            setStatus({ state: 'ok', message: 'Thank you for your offer of support. We will contact you by email.' });
        } catch (err) {
            setStatus({ state: 'error', message: err.message });
        }
    };

    return (
        <div className="donate-page">
            <Seo title="Support the Campaign" description="Offer financial, material or professional support to Vincent Kafula and the Build One Zambia campaign." />
            <Navbar2 />
            <PageTitle pageTitle={'Support the Campaign'} pagesub={'Support'} />
            <main className="vk-section">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <SectionHead kicker="Support" title="Help build one Zambia">
                                Online payments are not available on this website. Tell us how you would like to help and the campaign team will contact you directly with the next steps.
                            </SectionHead>
                            <form onSubmit={submit} noValidate className="wpo-donations-details">
                                <div className="row">
                                    <div className="col-md-6 col-12 form-group">
                                        <label htmlFor="sp-name" className="vk-sr-only">Full name</label>
                                        <input id="sp-name" className="form-control" name="name" value={form.name} onChange={change} placeholder="Full name" autoComplete="name" />
                                    </div>
                                    <div className="col-md-6 col-12 form-group">
                                        <label htmlFor="sp-email" className="vk-sr-only">Email</label>
                                        <input id="sp-email" type="email" className="form-control" name="email" value={form.email} onChange={change} placeholder="Email" autoComplete="email" />
                                    </div>
                                    <div className="col-md-6 col-12 form-group">
                                        <label htmlFor="sp-phone" className="vk-sr-only">Phone (optional)</label>
                                        <input id="sp-phone" type="tel" className="form-control" name="phone" value={form.phone} onChange={change} placeholder="Phone (optional)" autoComplete="tel" />
                                    </div>
                                    <div className="col-md-6 col-12 form-group">
                                        <label htmlFor="sp-type" className="vk-sr-only">Type of support</label>
                                        <select id="sp-type" className="form-control" name="subject" value={form.subject} onChange={change}>
                                            <option value="">Type of support</option>
                                            {SUPPORT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-12 form-group">
                                        <label htmlFor="sp-msg" className="vk-sr-only">Details</label>
                                        <textarea id="sp-msg" className="form-control" name="message" value={form.message} onChange={change} placeholder="Tell us more (optional)"></textarea>
                                    </div>
                                </div>
                                <div className="submit-area">
                                    <button type="submit" className="theme-btn submit-btn" disabled={status.state === 'sending'}>
                                        {status.state === 'sending' ? 'Sending…' : 'Offer support'}
                                    </button>
                                </div>
                                {status.state === 'ok' && <p className="vk-form-status vk-form-status--ok" role="status">{status.message}</p>}
                                {status.state === 'error' && <p className="vk-form-status vk-form-status--error" role="alert">{status.message}</p>}
                                <p className="vk-privacy-note">Do not send card or bank details through this form. See the <Link to="/privacy">privacy policy</Link>.</p>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
            <Scrollbar />
        </div>
    )
}

export default DonatePage;
