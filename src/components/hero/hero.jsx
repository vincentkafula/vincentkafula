import React from "react";
import { Link } from 'react-router-dom'
import hero1 from '../../images/slider/1.png'
import { movement } from '../../api/advocacy';

const Hero = () => {

    const ClickHandler = () => {
        window.scrollTo(10, 0);
    }

    return (
        <section className="static-hero">
            <div className="hero-container">
                <div className="hero-inner">
                    <div className="container-fluid">
                        <div className="hero-content">
                            <div className="slide-title-sub">
                                <span className="vk-hero-role">Vincent Kafula, <strong>Founder of Build One Zambia</strong></span>
                            </div>
                            <div className="slide-title">
                                <h1 className="vk-sr-only">Vincent Kafula — Founder of Build One Zambia</h1>
                                <h2>{movement.tagline}</h2>
                            </div>
                            <div className="slide-text">
                                <p>Vincent Kafula advocates for a Zambia built by Zambians: government-owned machinery in every municipality, Zambian workers doing the work, and the country’s land and minerals benefiting every citizen.</p>
                            </div>
                            <div className="clearfix"></div>
                            <div className="slide-btns">
                                <Link onClick={ClickHandler} to="/advocacy" className="theme-btn">Explore the advocacy</Link>
                                <Link onClick={ClickHandler} to="/proposals" className="vk-btn-outline">Read the proposals</Link>
                            </div>
                            <div className="politian-pic">
                                <img src={hero1} alt="Vincent Kafula speaking at a podium" />
                                <div className="politian-shape">
                                    <div className="shape-1"></div>
                                    <div className="shape-2"></div>
                                    <div className="shape-3"></div>
                                    <div className="shape-4"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Hero;
