import React, { useState, useMemo } from 'react'
import Navbar2 from '../../components/Navbar2/Navbar2'
import PageTitle from '../../components/pagetitle/PageTitle'
import Footer from '../../components/footer/Footer'
import Scrollbar from '../../components/scrollbar/scrollbar'
import eczData from '../../data/ecz-locations.json'
import { Link } from 'react-router-dom'
import Seo from '../../components/Seo/Seo'
import { submitPublicForm } from '../../api/contactApi'
import { SectionHead } from '../../components/Advocacy/sections'
import { involvement } from '../../api/advocacy'

const HELP_OPTIONS = ['Organise in my ward or district', 'Spread the word in my community', 'Join an agricultural cooperative', 'Help on polling day', 'Other']

const titleCase = (str) => str.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase());

const VolunteerPage = (props) => {

    const [forms, setForms] = useState({
        name: '',
        province: '',
        district: '',
        constituency: '',
        ward: '',
        pollingStation: '',
        email: '',
        subject: '',
        phone: '',
        message: ''
    });
    const [status, setStatus] = useState({ state: 'idle', message: '' });
    const [errors, setErrors] = useState({});
    const validate = (f) => {
        const e = {};
        if (f.name.trim().length < 2) e.name = 'Please enter your full name.';
        if (!f.province) e.province = 'Please select your province.';
        if (!f.district) e.district = 'Please select your district.';
        if (!f.constituency) e.constituency = 'Please select your constituency.';
        if (!f.ward) e.ward = 'Please select your ward.';
        if (!f.pollingStation) e.pollingStation = 'Please select your polling station.';
        if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = 'Please enter a valid email address.';
        if (!f.subject) e.subject = 'Please choose how you would like to help.';
        if (f.message.trim().length < 10) e.message = 'Please tell us a little more (at least 10 characters).';
        return e;
    };
    const Err = ({ name }) => errors[name] ? <div className="errorMessage" role="alert">{errors[name]}</div> : null;

    const provinces = useMemo(() => Object.keys(eczData).sort(), []);

    const districts = useMemo(() => {
        if (!forms.province || !eczData[forms.province]) return [];
        return Object.keys(eczData[forms.province]).sort();
    }, [forms.province]);

    const constituencies = useMemo(() => {
        if (!forms.province || !forms.district) return [];
        const d = eczData[forms.province]?.[forms.district];
        return d ? Object.keys(d).sort() : [];
    }, [forms.province, forms.district]);

    const wards = useMemo(() => {
        if (!forms.province || !forms.district || !forms.constituency) return [];
        const c = eczData[forms.province]?.[forms.district]?.[forms.constituency];
        return c ? Object.keys(c).sort() : [];
    }, [forms.province, forms.district, forms.constituency]);

    const pollingStations = useMemo(() => {
        if (!forms.province || !forms.district || !forms.constituency || !forms.ward) return [];
        const stations = eczData[forms.province]?.[forms.district]?.[forms.constituency]?.[forms.ward];
        return stations ? [...stations].sort() : [];
    }, [forms.province, forms.district, forms.constituency, forms.ward]);

    const changeHandler = e => {
        const { name, value } = e.target;
        let updated = { ...forms, [name]: value };

        // reset dependent fields when a parent location field changes
        if (name === 'province') {
            updated = { ...updated, district: '', constituency: '', ward: '', pollingStation: '' };
        } else if (name === 'district') {
            updated = { ...updated, constituency: '', ward: '', pollingStation: '' };
        } else if (name === 'constituency') {
            updated = { ...updated, ward: '', pollingStation: '' };
        } else if (name === 'ward') {
            updated = { ...updated, pollingStation: '' };
        }

        setForms(updated);
        if (errors[name]) setErrors({ ...errors, [name]: undefined });
    };

    const submitHandler = async e => {
        e.preventDefault();
        const found = validate(forms);
        setErrors(found);
        if (Object.keys(found).length) return;
        setStatus({ state: 'sending', message: '' });
        try {
            await submitPublicForm('volunteer', forms);
            setForms({ name: '', province: '', district: '', constituency: '', ward: '', pollingStation: '', email: '', subject: '', phone: '', message: '' });
            setStatus({ state: 'ok', message: 'Thank you for volunteering. We will contact you by email about activities in your area.' });
        } catch (err) {
            setStatus({ state: 'error', message: err.message });
        }
    };

    return (
        <div className="volunteer-page">
            <Navbar2 />
            <Seo title="Volunteer" description="Volunteer with Build One Zambia: help organise in your province, district or ward and share the message in your community." />
            <PageTitle pageTitle={'Volunteer'} pagesub={'Get involved'} />
            <div className="volunteer-area">
                <div className="volunteer-wrap">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-lg-10">
                                <div className="vk-section" style={{ paddingBottom: 50 }}>
                                    <SectionHead kicker="Join the movement" title="The campaign is powered by people like you">
                                        Farmers, builders, teachers, families and young people who refuse to accept the status quo. Choose how you would like to help, tell us where you are, and we will be in touch.
                                    </SectionHead>
                                    <div className="vk-involve-grid">
                                        {involvement.map((i) => (
                                            <div className="vk-involve vk-involve--light" key={i.title}>
                                                <i className={i.icon} aria-hidden="true"></i>
                                                <h3>{i.title}</h3>
                                                <p style={{ marginBottom: 0 }}>{i.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="volunteer-contact">
                                    <div className="volunteer-contact-form">
                                        <h2>Become a volunteer</h2>
                                        <form onSubmit={(e) => submitHandler(e)} className="contact-validation-active" id="contact-form-main" noValidate>
                                            <div className="row">
                                                <div className="col-lg-6 col-md-6 col-sm-6 col-12 form-group">
                                                    <div className="form-field">
                                                        <input
                                                            value={forms.name}
                                                            type="text"
                                                            name="name"
                                                            onBlur={(e) => changeHandler(e)}
                                                            onChange={(e) => changeHandler(e)}
                                                            placeholder="Your full name" aria-label="Your full name" />
                                                        <Err name="name" />
                                                    </div>
                                                </div>
                                                <div className="col-lg-6 col-md-6 col-sm-6 col-12 form-group">
                                                    <div className="form-field">
                                                        <select
                                                            value={forms.province}
                                                            name="province"
                                                            onBlur={(e) => changeHandler(e)}
                                                            onChange={(e) => changeHandler(e)}>
                                                            <option value="">Select province</option>
                                                            {provinces.map((p) => (
                                                                <option key={p} value={p}>{titleCase(p)}</option>
                                                            ))}
                                                        </select>
                                                        <Err name="province" />
                                                    </div>
                                                </div>
                                                <div className="col-lg-6 col-md-6 col-sm-6 col-12 form-group clearfix">
                                                    <div className="form-field">
                                                        <select
                                                            value={forms.district}
                                                            name="district"
                                                            disabled={!forms.province}
                                                            onBlur={(e) => changeHandler(e)}
                                                            onChange={(e) => changeHandler(e)}>
                                                            <option value="">Select district</option>
                                                            {districts.map((d) => (
                                                                <option key={d} value={d}>{titleCase(d)}</option>
                                                            ))}
                                                        </select>
                                                        <Err name="district" />
                                                    </div>
                                                </div>
                                                <div className="col-lg-6 col-md-6 col-sm-6 col-12 form-group">
                                                    <div className="form-field">
                                                        <select
                                                            value={forms.constituency}
                                                            name="constituency"
                                                            disabled={!forms.district}
                                                            onBlur={(e) => changeHandler(e)}
                                                            onChange={(e) => changeHandler(e)}>
                                                            <option value="">Select constituency</option>
                                                            {constituencies.map((c) => (
                                                                <option key={c} value={c}>{titleCase(c)}</option>
                                                            ))}
                                                        </select>
                                                        <Err name="constituency" />
                                                    </div>
                                                </div>
                                                <div className="col-lg-6 col-md-6 col-sm-6 col-12 form-group clearfix">
                                                    <div className="form-field">
                                                        <select
                                                            value={forms.ward}
                                                            name="ward"
                                                            disabled={!forms.constituency}
                                                            onBlur={(e) => changeHandler(e)}
                                                            onChange={(e) => changeHandler(e)}>
                                                            <option value="">Select ward</option>
                                                            {wards.map((w) => (
                                                                <option key={w} value={w}>{titleCase(w)}</option>
                                                            ))}
                                                        </select>
                                                        <Err name="ward" />
                                                    </div>
                                                </div>
                                                <div className="col-lg-12 col-12 form-group">
                                                    <div className="form-field">
                                                        <select
                                                            value={forms.pollingStation}
                                                            name="pollingStation"
                                                            disabled={!forms.ward}
                                                            onBlur={(e) => changeHandler(e)}
                                                            onChange={(e) => changeHandler(e)}>
                                                            <option value="">Select polling station</option>
                                                            {pollingStations.map((s) => (
                                                                <option key={s} value={s}>{titleCase(s)}</option>
                                                            ))}
                                                        </select>
                                                        <Err name="pollingStation" />
                                                    </div>
                                                </div>
                                                <div className="col-lg-6 col-md-6 col-sm-6 col-12 form-group clearfix">
                                                    <div className="form-field">
                                                        <input
                                                            value={forms.email}
                                                            type="email"
                                                            name="email"
                                                            onBlur={(e) => changeHandler(e)}
                                                            onChange={(e) => changeHandler(e)}
                                                            placeholder="Your email" aria-label="Your email" />
                                                        <Err name="email" />
                                                    </div>
                                                </div>
                                                <div className="col-lg-6 col-md-6 col-sm-6 col-12 form-group">
                                                    <div className="form-field">
                                                        <select value={forms.subject} name="subject" aria-label="How would you like to help?" onChange={(e) => changeHandler(e)}>
                                                            <option value="">How would you like to help?</option>
                                                            {HELP_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                                                        </select>
                                                        <Err name="subject" />
                                                    </div>
                                                </div>
                                                <div className="col-lg-12 col-12 form-group">
                                                    <div className="form-field">
                                                        <input value={forms.phone} type="tel" name="phone" autoComplete="tel"
                                                            onChange={(e) => changeHandler(e)}
                                                            placeholder="Your phone number (optional)" aria-label="Your phone number (optional)" />
                                                    </div>
                                                </div>
                                                <div className="col-lg-12 col-12 form-group">
                                                    <textarea
                                                        onBlur={(e) => changeHandler(e)}
                                                        onChange={(e) => changeHandler(e)}
                                                        value={forms.message}
                                                        type="text"
                                                        name="message"
                                                        placeholder="Tell us a little about yourself and your skills" aria-label="Message">
                                                    </textarea>
                                                    <Err name="message" />
                                                </div>
                                                <div className="submit-area col-lg-12 col-12">
                                                    <button type="submit" className="theme-btn submit-btn" disabled={status.state === 'sending'}>{status.state === 'sending' ? 'Sending…' : 'Sign up to volunteer'}</button>
                                                </div>
                                            </div>
                                            {status.state === 'ok' && <p className="vk-form-status vk-form-status--ok" role="status">{status.message}</p>}
                                            {status.state === 'error' && <p className="vk-form-status vk-form-status--error" role="alert">{status.message}</p>}
                                            <p className="vk-privacy-note">Your details are used only to organise volunteering. See the <Link to="/privacy">privacy policy</Link>.</p>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
            <Scrollbar />
        </div>

    )
}

export default VolunteerPage;
