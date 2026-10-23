import React, { Fragment, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar2 from '../../components/Navbar2/Navbar2';
import Footer from '../../components/footer/Footer';
import Scrollbar from '../../components/scrollbar/scrollbar';
import heroBg from '../../images/about-banner.jpg';
import portrait from '../../images/testimonial/3.png';
import './registration.css';

const ClickHandler = () => window.scrollTo(10, 0);

// Simplified national flags (public symbols) for the partnership illustration.
const FlagUSA = () => (
    <svg viewBox="0 0 78 52" role="img" aria-label="Flag of the United States">
        {[...Array(13)].map((_, i) => <rect key={i} y={i * 4} width="78" height="4" fill={i % 2 ? '#fff' : '#B22234'} />)}
        <rect width="34" height="28" fill="#3C3B6E" />
        {[...Array(20)].map((_, i) => <circle key={i} cx={4 + (i % 5) * 6.5} cy={4 + Math.floor(i / 5) * 6.5} r="1.2" fill="#fff" />)}
    </svg>
);
const FlagChina = () => (
    <svg viewBox="0 0 78 52" role="img" aria-label="Flag of China">
        <rect width="78" height="52" fill="#DE2910" />
        <polygon points="13,6 15.4,13 22.8,13 16.8,17.4 19,24.4 13,20 7,24.4 9.2,17.4 3.2,13 10.6,13" fill="#FFDE00" />
        {[[26, 5], [31, 10], [31, 17], [26, 22]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.8" fill="#FFDE00" />)}
    </svg>
);
const FlagZambia = () => (
    <svg viewBox="0 0 78 52" role="img" aria-label="Flag of Zambia">
        <rect width="78" height="52" fill="#198A00" />
        <rect x="52" y="22" width="8.7" height="30" fill="#DE2010" />
        <rect x="60.7" y="22" width="8.7" height="30" fill="#000" />
        <rect x="69.4" y="22" width="8.6" height="30" fill="#EF7D00" />
        <path d="M58 9 q7 -6 14 0 q-7 3 -14 0 z" fill="#EF7D00" />
    </svg>
);

const TYPES = [
    { key: 'membership', colour: '', icon: 'fa-user', title: 'Membership', text: 'Register as an individual member of the party',
      items: ['Personal information', 'Location details', 'Document upload', 'Two-factor verification'] },
    { key: 'cooperative', colour: 'blue', icon: 'fa-users', title: 'Cooperative', text: 'Register a cooperative group with 20 members',
      items: ['20 member group', 'Cooperative details', 'Chief & chairperson info', 'Member verification codes'] },
    { key: 'internship', colour: 'purple', icon: 'fa-graduation-cap', title: 'Internship', text: 'Register for a political internship programme',
      items: ['Membership verification', 'University details', 'Course information', 'Year of study'] },
];

export const RegistrationHero = () => (
    <section className="rg-hero" style={{ '--rg-hero-img': `url(${heroBg})` }}>
        <img className="rg-hero-photo" src={portrait} alt="Vincent Kafula" />
        <div className="container">
            <h1>Build One Zambia</h1>
            <div className="rg-hero-sub">Registration &amp; Ward-Level Partnerships</div>
            <p>Connecting Zambians with the world — creating opportunities, driving investment and building a stronger, united nation.</p>
        </div>
    </section>
);

const RegistrationPage = () => {
    useEffect(() => { document.title = 'Registration | Vincent Kafula — Build One Zambia'; }, []);
    return (
        <Fragment>
            <Navbar2 />
            <main className="rg">
                <RegistrationHero />

                <section className="rg-intro">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-lg-7">
                                <h2>Registration</h2>
                                <p><strong>Build One Zambia aims</strong> to unite Zambians with partners in America, China and across the world, building lasting people-to-people and economic ties between our nation and the global community, one ward at a time.</p>
                                <p>Our goal is to link each of Zambia’s <strong>more than 1,800 wards</strong> with international partners, including U.S. chambers of commerce such as AmCham Zambia, <strong>Chinese business associations</strong> and trade partners from every corner of the globe. Together, these partnerships are intended to drive economic growth, expand opportunity and strengthen Zambia’s place in the world, giving every ward a direct link to the United States, China and beyond: opening export markets, attracting investment and helping local entrepreneurs compete on a global stage.</p>
                                <p><strong>Each ward will be paired with international partners to help Zambian farmers, manufacturers and entrepreneurs:</strong></p>
                                <ul className="rg-checks">
                                    <li>Export products to U.S., Chinese and global markets</li>
                                    <li>Connect with international investors from America, China and around the world to expand their market reach</li>
                                    <li>Navigate trade regulations across multiple countries and build sustainable, long-term relationships</li>
                                </ul>
                                <p>This is our vision: a Zambia fully connected to the world — to America, to China and to every nation willing to grow with us. Choose your registration type below to become part of this movement.</p>
                            </div>
                            <div className="col-lg-5 rg-visual">
                                <div className="rg-globe" aria-hidden="true">
                                    <div className="rg-flags"><FlagUSA /><FlagChina /><FlagZambia /></div>
                                    <i className="fa fa-handshake-o rg-shake"></i>
                                </div>
                                <div className="rg-tagline">One Nation<span>|</span>Global Partnerships<br />Shared Prosperity</div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="rg-types" aria-labelledby="rg-types-title">
                    <div className="container">
                        <h2 className="rg-types-title" id="rg-types-title">Choose your registration type to get started</h2>
                        <div className="row g-4">
                            {TYPES.map((t) => (
                                <div className="col-lg-4 col-md-6 col-12 mb-4" key={t.key}>
                                    <div className={`rg-card ${t.colour}`}>
                                        <div className="rg-card-head">
                                            <div className="rg-icon"><i className={`fa ${t.icon}`} aria-hidden="true"></i></div>
                                            <div>
                                                <h3>{t.title}</h3>
                                                <p>{t.text}</p>
                                            </div>
                                        </div>
                                        <ul className="rg-checks">{t.items.map((i) => <li key={i}>{i}</li>)}</ul>
                                        <Link onClick={ClickHandler} className="rg-btn" to={`/register/${t.key}`}>
                                            Apply Now <i className="fa fa-arrow-right" aria-hidden="true"></i>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="rg-join">
                    <div className="container">
                        <div className="rg-join-inner">
                            <i className="fa fa-users" aria-hidden="true"></i>
                            <div className="rg-join-text">
                                <h2>Join as a Member Today</h2>
                                <p>Become a member today to take part in ward partnerships, cooperative registration and internship opportunities. Together, we’re building a brighter future for Zambian businesses on the global stage.</p>
                            </div>
                            <div className="rg-script" aria-hidden="true">A Stronger Zambia</div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
            <Scrollbar />
        </Fragment>
    );
};

export default RegistrationPage;
