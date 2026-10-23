import React from "react";
import { Link } from 'react-router-dom'



const ClickHandler = () => {
    window.scrollTo(10, 0);
}

const Features = (props) => {
    return (
        <section className="wpo-features-area">
            <div className="container">
                <div className="features-wrap">
                    <div className="row">
                        <div className="col col-lg-3 col-md-6 col-12">
                            <div className="feature-item-wrap">
                                <div className="feature-item">
                                    <div className="icon">
                                        <i className="fi flaticon-goal"></i>
                                    </div>
                                    <div className="feature-text">
                                        <h2><Link onClick={ClickHandler} to="/about">Our Mission</Link></h2>
                                    </div>
                                </div>
                                <div className="feature-item-hidden">
                                    <div className="icon">
                                        <i className="fi flaticon-goal"></i>
                                    </div>
                                    <div className="feature-text">
                                        <h2><Link onClick={ClickHandler} to="/about">Our Mission</Link></h2>
                                        <p>Building one Zambia where every family has a home and every province thrives.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col col-lg-3 col-md-6 col-12">
                            <div className="feature-item-wrap">
                                <div className="feature-item">
                                    <div className="icon">
                                        <i className="fi flaticon-conference-1"></i>
                                    </div>
                                    <div className="feature-text">
                                        <h2><Link onClick={ClickHandler} to="/campaign">Campaign Events</Link></h2>
                                    </div>
                                </div>
                                <div className="feature-item-hidden">
                                    <div className="icon">
                                        <i className="fi flaticon-conference-1"></i>
                                    </div>
                                    <div className="feature-text">
                                        <h2><Link onClick={ClickHandler} to="/campaign">Campaign Events</Link></h2>
                                        <p>Join our public meetings and campaigns in communities across Zambia.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col col-lg-3 col-md-6 col-12">
                            <div className="feature-item-wrap">
                                <div className="feature-item">
                                    <div className="icon">
                                        <i className="fi flaticon-charity"></i>
                                    </div>
                                    <div className="feature-text">
                                        <h2><Link onClick={ClickHandler} to="/donate">Support the Campaign</Link></h2>
                                    </div>
                                </div>
                                <div className="feature-item-hidden">
                                    <div className="icon">
                                        <i className="fi flaticon-charity"></i>
                                    </div>
                                    <div className="feature-text">
                                        <h2><Link onClick={ClickHandler} to="/donate">Support the Campaign</Link></h2>
                                        <p>Help fund a people-powered movement for Zambian-led development.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col col-lg-3 col-md-6 col-12">
                            <div className="feature-item-wrap">
                                <div className="feature-item">
                                    <div className="icon">
                                        <i className="fi flaticon-community"></i>
                                    </div>
                                    <div className="feature-text">
                                        <h2><Link onClick={ClickHandler} to="/volunteer">Volunteer</Link></h2>
                                    </div>
                                </div>
                                <div className="feature-item-hidden">
                                    <div className="icon">
                                        <i className="fi flaticon-community"></i>
                                    </div>
                                    <div className="feature-text">
                                        <h2><Link onClick={ClickHandler} to="/volunteer">Volunteer</Link></h2>
                                        <p>Help organise in your province, district or ward and share the message.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Features;