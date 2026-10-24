import React from 'react';
import { Link } from 'react-router-dom';
import './manifestoBanner.css';

const toTop = () => window.scrollTo(10, 0);

// Homepage call-out for the Manifesto Watch scorecard.
const ManifestoBanner = () => (
    <section className="wpo-donors-section mw-home-banner">
        <div className="container">
            <div className="wpo-donors-wrap">
                <div className="row align-items-center">
                    <div className="col-lg-7">
                        <h2>15 promises. No deadlines. No costs. We are tracking every UPND manifesto target until 2031.</h2>
                    </div>
                    <div className="col-lg-5">
                        <div className="donors-btn">
                            <Link onClick={toTop} to="/manifesto-watch">See the Scorecard</Link>
                            <Link to="/manifesto-watch#report">Report a Broken Promise</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

export default ManifestoBanner;
