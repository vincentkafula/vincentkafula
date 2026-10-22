import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { submitPublicForm } from '../../api/contactApi';

const EMPTY = { name: '', email: '', subject: '', phone: '', message: '', website: '' };

const SUBJECTS = [
    'General enquiry',
    'Feedback on a proposal',
    'Transport infrastructure',
    'Agricultural cooperatives',
    'Housing',
    'Mining',
    'Governance',
    'Media enquiry',
    'Volunteering',
];

const ContactForm = () => {
    const [forms, setForms] = useState(EMPTY);
    const [status, setStatus] = useState({ state: 'idle', message: '' });
    const [errors, setErrors] = useState({});

    const validate = (f) => {
        const e = {};
        if (f.name.trim().length < 2) e.name = 'Please enter your name.';
        if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = 'Please enter a valid email address.';
        if (!f.subject) e.subject = 'Please choose a subject.';
        if (f.message.trim().length < 10) e.message = 'Please enter a message of at least 10 characters.';
        return e;
    };
    const Err = ({ name }) => errors[name] ? <div className="errorMessage" id={`cf-${name}-error`} role="alert">{errors[name]}</div> : null;

    const changeHandler = e => {
        setForms({ ...forms, [e.target.name]: e.target.value })
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: undefined });
    };

    const submitHandler = async e => {
        e.preventDefault();
        const found = validate(forms);
        setErrors(found);
        if (Object.keys(found).length) return;
        setStatus({ state: 'sending', message: '' });
        try {
            await submitPublicForm('contact', forms);
            setForms(EMPTY);
            setStatus({ state: 'ok', message: 'Thank you. Your message has been sent and you will receive a reply by email.' });
        } catch (err) {
            setStatus({ state: 'error', message: err.message });
        }
    };

    return (
        <form onSubmit={submitHandler} className="contact-validation-active" noValidate>
            <div className="row">
                <div className="col col-lg-6 col-12">
                    <div className="form-field">
                        <label htmlFor="cf-name" className="vk-sr-only">Your name</label>
                        <input id="cf-name" aria-invalid={Boolean(errors.name)} value={forms.name} type="text" name="name" autoComplete="name"
                            onChange={changeHandler} placeholder="Your name" />
                        <Err name="name" />
                    </div>
                </div>
                <div className="col col-lg-6 col-12">
                    <div className="form-field">
                        <label htmlFor="cf-email" className="vk-sr-only">Your email</label>
                        <input id="cf-email" aria-invalid={Boolean(errors.email)} value={forms.email} type="email" name="email" autoComplete="email"
                            onChange={changeHandler} placeholder="Your email" />
                        <Err name="email" />
                    </div>
                </div>
                <div className="col col-lg-6 col-12">
                    <div className="form-field">
                        <label htmlFor="cf-phone" className="vk-sr-only">Your phone number (optional)</label>
                        <input id="cf-phone" value={forms.phone} type="tel" name="phone" autoComplete="tel"
                            onChange={changeHandler} placeholder="Your phone (optional)" />
                    </div>
                </div>
                <div className="col col-lg-6 col-12">
                    <div className="form-field">
                        <label htmlFor="cf-subject" className="vk-sr-only">Subject</label>
                        <select id="cf-subject" aria-invalid={Boolean(errors.subject)} value={forms.subject} name="subject" onChange={changeHandler}>
                            <option value="">Choose a subject</option>
                            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <Err name="subject" />
                    </div>
                </div>
                <div className="col col-lg-12 col-12">
                    <label htmlFor="cf-message" className="vk-sr-only">Your message</label>
                    <textarea id="cf-message" aria-invalid={Boolean(errors.message)} onChange={changeHandler} value={forms.message} name="message"
                        placeholder="Your message"></textarea>
                    <Err name="message" />
                </div>
                {/* Honeypot field for spam bots; hidden from people and screen readers. */}
                <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }}>
                    <input tabIndex={-1} autoComplete="off" name="website" value={forms.website} onChange={changeHandler} />
                </div>
            </div>
            <div className="submit-area">
                <button type="submit" className="theme-btn" disabled={status.state === 'sending'}>
                    {status.state === 'sending' ? 'Sending…' : 'Send message'}
                </button>
            </div>
            {status.state === 'ok' && <p className="vk-form-status vk-form-status--ok" role="status">{status.message}</p>}
            {status.state === 'error' && <p className="vk-form-status vk-form-status--error" role="alert">{status.message}</p>}
            <p className="vk-privacy-note">Your details are used only to reply to your message. See the <Link to="/privacy">privacy policy</Link>.</p>
        </form>
    )
}

export default ContactForm;
