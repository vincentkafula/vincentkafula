import React, { Fragment, useEffect, useState } from 'react';
import Navbar2 from '../../components/Navbar2/Navbar2';
import PageTitle from '../../components/pagetitle/PageTitle'
import Scrollbar from '../../components/scrollbar/scrollbar'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'react-toastify';
import Footer from '../../components/footer/Footer';
import { teamProfilesApi } from '../../api/teamProfilesApi';
import placeholder from '../../images/team/1.jpg'

const API_URL = import.meta.env.VITE_API_URL || '';
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '');

// Shows only details an administrator has entered and Head Office has approved for publication.
const TeamSinglePage = () => {
    const { slug } = useParams()
    const [member, setMember] = useState(undefined);
    const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
    const [sending, setSending] = useState(false);

    useEffect(() => {
        setMember(undefined);
        if (!/^\d+$/.test(slug)) { setMember(null); return; }
        teamProfilesApi.getPublic(slug).then(setMember).catch(() => setMember(null));
    }, [slug]);

    const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const SubmitHandler = async (e) => {
        e.preventDefault()
        if (!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email) || form.message.trim().length < 10) {
            toast.error('Please enter your name, a valid email and a message of at least 10 characters.');
            return;
        }
        setSending(true);
        try {
            const res = await fetch(`${API_URL}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'contact', ...form, subject: `Message for ${member.full_name}` }),
            });
            const body = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(body.error);
            toast.success('Thank you. Your message has been sent.');
            setForm({ name: '', email: '', phone: '', message: '' });
        } catch (err) {
            toast.error(err.message || 'Your message could not be sent.');
        } finally {
            setSending(false);
        }
    }

    if (member === undefined) {
        return (
            <Fragment>
                <Navbar2 />
                <PageTitle pageTitle={'Campaign Team'} pagesub={'Team'} />
                <div className="team-pg-area section-padding"><div className="container"><p>Loading…</p></div></div>
                <Footer />
            </Fragment>
        );
    }

    if (member === null) {
        return (
            <Fragment>
                <Navbar2 />
                <PageTitle pageTitle={'Campaign Team'} pagesub={'Team'} />
                <div className="team-pg-area section-padding">
                    <div className="container">
                        <p>This profile is not available. Only verified and approved team members and candidates are published.</p>
                        <Link className="theme-btn" to="/team">View the Campaign Team</Link>
                    </div>
                </div>
                <Footer />
                <Scrollbar />
            </Fragment>
        );
    }

    return (
        <Fragment>
            <Navbar2 />
            <PageTitle pageTitle={member.full_name} pagesub={member.role_title} />
            <div className="team-pg-area section-padding">
                <div className="container">
                    <div className="team-single-wrap">
                        <div className="team-info-wrap">
                            <div className="row align-items-center">
                                <div className="col-lg-5">
                                    <div className="team-info-img">
                                        <img src={member.photo_url || placeholder} alt={member.photo_url ? member.full_name : ''} />
                                    </div>
                                </div>
                                <div className="col-lg-7">
                                    <div className="team-info-text">
                                        <h2>{member.full_name}</h2>
                                        <ul>
                                            <li>Status: <span>{member.status_label}</span></li>
                                            <li>Position: <span>{member.role_title}</span></li>
                                            {member.region && <li>Region: <span>{member.region}</span></li>}
                                            {member.status === 'appointed' && member.appointment_date && (
                                                <li>Appointed: <span>{fmtDate(member.appointment_date)}</span></li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {member.bio && (
                            <div className="team-exprience-area team-widget">
                                <div className="row">
                                    <div className="col-lg-12">
                                        <div className="exprience-wrap">
                                            <h2>Biography</h2>
                                            {member.bio.split(/\n\s*\n/).map((p, i) => <p key={i}>{p}</p>)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="wpo-contact-area ex-wiget">
                            <div className="wpo-contact-title">
                                <h2>Send a Message</h2>
                                <p>Your message will be sent to the Build One Zambia campaign office.</p>
                            </div>
                            <div className="quote-form">
                                <form onSubmit={SubmitHandler}>
                                    <div className="form-group half-col">
                                        <input type="text" className="form-control" placeholder="Name" name="name" value={form.name} onChange={change} />
                                    </div>
                                    <div className="form-group half-col">
                                        <input type="email" className="form-control" placeholder="Email" name="email" value={form.email} onChange={change} />
                                    </div>
                                    <div className="form-group full-col">
                                        <input type="text" className="form-control" placeholder="Phone (optional)" name="phone" value={form.phone} onChange={change} />
                                    </div>
                                    <div className="form-group full-col">
                                        <textarea className="form-control" name="message" placeholder="Your message" value={form.message} onChange={change}></textarea>
                                    </div>
                                    <div className="form-group full-col text-center">
                                        <button className="btn theme-btn" type="submit" disabled={sending}>Send Message</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
            <Scrollbar />
        </Fragment>
    )
};
export default TeamSinglePage;
