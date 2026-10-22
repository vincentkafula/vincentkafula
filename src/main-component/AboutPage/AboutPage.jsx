import React, { Fragment, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar2 from '../../components/Navbar2/Navbar2';
import PageTitle from '../../components/pagetitle/PageTitle'
import About from '../../components/about/about';
import Scrollbar from '../../components/scrollbar/scrollbar'
import Footer from '../../components/footer/Footer';
import Seo from '../../components/Seo/Seo';
import { SectionHead, PrioritiesSection, InvolvementSection } from '../../components/Advocacy/sections';
import { organisation, symbol } from '../../api/advocacy';
import abimg from '../../images/about.jpg'
import aboutBanner from '../../images/about-banner.jpg'

const AboutPage = () => {
    const { hash } = useLocation();

    // Scroll to #build-one-zambia or #symbol when arriving from the menu.
    useEffect(() => {
        if (!hash) return;
        const t = setTimeout(() => {
            const el = document.getElementById(hash.slice(1));
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
        return () => clearTimeout(t);
    }, [hash]);

    return (
        <Fragment>
            <Seo title="About Vincent Kafula" description="Biography of Vincent Kafula, Founder of Build One Zambia, and the movement’s membership, aims, objectives and symbol." />
            <Navbar2 />
            <PageTitle pageTitle={'About Vincent Kafula'} pagesub={'About'} bgSrc={aboutBanner} />
            <main>
                <About abimg={abimg} abClass={"pt-padding"} fullBio={true} />

                <section className="vk-section vk-section--muted" id="build-one-zambia" aria-labelledby="boz-title">
                    <div className="container">
                        <SectionHead kicker="Build One Zambia" title="Building a better future together" id="boz-title" />
                        <div className="vk-article" style={{ maxWidth: 820 }}>
                            {organisation.about.map((p, i) => <p key={i}>{p}</p>)}
                        </div>
                        <div className="vk-org-grid">
                            <div className="vk-org-item"><h3>Membership</h3><p>{organisation.membership}</p></div>
                            <div className="vk-org-item"><h3>Aim</h3><p>{organisation.aim}</p></div>
                            <div className="vk-org-item"><h3>Objective</h3><p>{organisation.objective}</p></div>
                            <div className="vk-org-item"><h3>Policy</h3><p>{organisation.policy}</p></div>
                        </div>
                    </div>
                </section>

                <section className="vk-section" id="symbol" aria-labelledby="symbol-title">
                    <div className="container">
                        <div className="vk-symbol">
                            <div>
                                <div className="vk-flag" role="img" aria-label="Build One Zambia flag: three equal horizontal bands of black, green and gold">
                                    <span></span><span></span><span></span>
                                </div>
                                <p className="vk-flag-caption">{symbol.flag}</p>
                            </div>
                            <div className="vk-article">
                                <SectionHead kicker="The symbol of Build One Zambia" title="Unity, freedom and shared progress" id="symbol-title" />
                                <p>{symbol.emblem}</p>
                                <h2 style={{ fontSize: 26, marginTop: 30 }}>What the colours stand for</h2>
                                <div className="vk-colours">
                                    {symbol.colours.map((c) => (
                                        <div className="vk-colour" key={c.name} style={{ borderTopColor: c.hex }}>
                                            <h3>{c.name}</h3>
                                            <p>{c.text}</p>
                                        </div>
                                    ))}
                                </div>
                                <h2 style={{ fontSize: 26 }}>The meaning of unity</h2>
                                <p>{symbol.unity}</p>
                                <p className="vk-callout">{symbol.motto}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <PrioritiesSection />
                <InvolvementSection />
            </main>
            <Footer />
            <Scrollbar />
        </Fragment>
    )
};
export default AboutPage;
