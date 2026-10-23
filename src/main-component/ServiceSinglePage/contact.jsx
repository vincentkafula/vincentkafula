import React, { useState } from 'react'
import SimpleReactValidator from 'simple-react-validator';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || '';


const Contact = () => {


    const [forms, setForms] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [, forceUpdate] = useState(0);
    const [sending, setSending] = useState(false);
    const [validator] = useState(new SimpleReactValidator({
        className: 'errorMessage'
    }));
    const changeHandler = e => {
        setForms({ ...forms, [e.target.name]: e.target.value })
        if (validator.allValid()) {
            validator.hideMessages();
        } else {
            validator.showMessages();
        }
    };

    const submitHandler = async e => {
        e.preventDefault();
        if (!validator.allValid()) {
            validator.showMessages();
            forceUpdate((n) => n + 1);
            return;
        }
        validator.hideMessages();
        setSending(true);
        try {
            const res = await fetch(`${API_URL}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'contact', ...forms, subject: `${forms.subject} (${window.location.pathname})` }),
            });
            const body = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(body.error);
            toast.success('Thank you. Your message has been sent.');
            setForms({ name: '', email: '', subject: '', message: '' });
        } catch (err) {
            toast.error(err.message || 'Your message could not be sent. Please email vincent.kafula@gmail.com.');
        } finally {
            setSending(false);
        }
    };

    return (
        <form onSubmit={(e) => submitHandler(e)} className="contact-validation-active" >
            <div className="row">
                <div className="col col-lg-6 col-md-6 col-12">
                    <div className="form-field">
                        <input
                            className="form-control"
                            value={forms.name}
                            type="text"
                            name="name"
                            onBlur={(e) => changeHandler(e)}
                            onChange={(e) => changeHandler(e)}
                            placeholder="Your Name" />
                    </div>
                    {validator.message('name', forms.name, 'required|min:2')}
                </div>
                <div className="col col-lg-6 col-md-6 col-12">
                    <div className="form-field">
                        <input
                            className="form-control"
                            value={forms.email}
                            type="email"
                            name="email"
                            onBlur={(e) => changeHandler(e)}
                            onChange={(e) => changeHandler(e)}
                            placeholder="Your Email" />
                        {validator.message('email', forms.email, 'required|email')}
                    </div>
                </div>
                <div className="col col-lg-12 col-12">
                    <div className="form-field">
                        <select className="form-control"
                            onBlur={(e) => changeHandler(e)}
                            onChange={(e) => changeHandler(e)}
                            value={forms.subject}
                            type="text"
                            name="subject">
                            <option value="">Choose a Subject</option>
                                <option>Report a Problem</option>
                            <option>General Question</option>
                            <option>Feedback on a Proposal</option>
                            <option>Volunteering</option>
                        </select>
                        {validator.message('subject', forms.subject, 'required|alpha_space')}
                    </div>
                </div>
                <div className="col fullwidth col-lg-12">
                    <textarea
                        className="form-control"
                        onBlur={(e) => changeHandler(e)}
                        onChange={(e) => changeHandler(e)}
                        value={forms.message}
                        type="text"
                        name="message"
                        placeholder="Message">
                    </textarea>
                    {validator.message('message', forms.message, 'required')}
                </div>
            </div>
            <div className="submit-area">
                <button type="submit" className="theme-btn" disabled={sending}> Submit Now</button>
            </div>
        </form>
    )
}

export default Contact;