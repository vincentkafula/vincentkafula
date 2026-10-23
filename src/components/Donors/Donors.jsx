import React from 'react';
import { Link } from 'react-router-dom'

const ClickHandler = () => {
    window.scrollTo(10, 0);
}

const Donors = () => {

    return (
        <section className="wpo-donors-section">
            <div className="container">
                <div className="wpo-donors-wrap">
                    <div className="row align-items-center">
                        <div className="col-lg-6">
                            <h2>Standing with Lusaka’s street vendors. Learn about
                                our position and how to get help.</h2>
                        </div>
                        <div className="col-lg-6">
                            <div className="donors-btn">
                                <Link onClick={ClickHandler} to="/service-single/Street-Vendors-and-Vulnerable-Communities">Read More</Link>
                                <Link onClick={ClickHandler} to="/contact">Report a Problem</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Donors;