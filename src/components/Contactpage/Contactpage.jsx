import React from 'react';
import ContactForm from '../ContactFrom/ContactForm'
import { contactDetails } from '../../data/navigation';

const Contactpage = () => {
    return (
        <section className="wpo-contact-pg-section section-padding">
            <div className="container">
                <div className="row">
                    <div className="col col-lg-10 offset-lg-1">
                        <div className="office-info">
                            <div className="row">
                                <div className="col col-xl-4 col-lg-6 col-md-6 col-12">
                                    <div className="office-info-item">
                                        <div className="office-info-icon">
                                            <div className="icon">
                                                <i className="fi flaticon-maps-and-flags"></i>
                                            </div>
                                        </div>
                                        <div className="office-info-text">
                                            <h2>Address</h2>
                                            <p>{contactDetails.address}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col col-xl-4 col-lg-6 col-md-6 col-12">
                                    <div className="office-info-item">
                                        <div className="office-info-icon">
                                            <div className="icon">
                                                <i className="fi flaticon-email"></i>
                                            </div>
                                        </div>
                                        <div className="office-info-text">
                                            <h2>Email</h2>
                                            <p><a href={`mailto:${contactDetails.email}`} style={{ color: 'inherit' }}>{contactDetails.email}</a></p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col col-xl-4 col-lg-6 col-md-6 col-12">
                                    <div className="office-info-item">
                                        <div className="office-info-icon">
                                            <div className="icon">
                                                <i className="fi flaticon-phone-call"></i>
                                            </div>
                                        </div>
                                        <div className="office-info-text">
                                            <h2>Phone</h2>
                                            {contactDetails.phones.map((p) => (
                                                <p key={p.tel}>{p.label}: <a href={`tel:${p.tel}`} style={{ color: 'inherit' }}>{p.display}</a></p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="wpo-contact-title">
                            <h2>Send a message</h2>
                            <p>Ask a question, share feedback on a proposal, or tell us about the issues that matter in your community.</p>
                        </div>
                        <div className="wpo-contact-form-area">
                            <ContactForm />
                        </div>
                    </div>
                </div>
            </div>
            <section className="wpo-contact-map-section">
                <div className="wpo-contact-map">
                    <iframe
                        title={`Map: ${contactDetails.address}`}
                        loading="lazy"
                        src={`https://www.google.com/maps?q=${encodeURIComponent(contactDetails.mapQuery)}&output=embed`}></iframe>
                </div>
            </section>
        </section>
    )
}

export default Contactpage;
