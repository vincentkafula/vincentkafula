import React from "react";
import { Link } from 'react-router-dom'
import hero1 from '../../images/slider/1.png'

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
                            <div data-swiper-parallax="300" className="slide-title-sub">
                                <span>Zambia Is Waiting</span>
                            </div>
                            <div data-swiper-parallax="300" className="slide-title">
                                <h2>The time to act is now</h2>
                            </div>
                            <div data-swiper-parallax="400" className="slide-text">
                                <p>Vincent Kafula, Founder of Build One Zambia, advocates for a Zambia built by
                                    Zambians, for Zambians.</p>
                            </div>
                            <div className="clearfix"></div>
                            <div data-swiper-parallax="500" className="slide-btns">
                                <Link onClick={ClickHandler} to="/about" className="theme-btn">Join the Movement</Link>
                            </div>
                            <div className="politian-pic">
                                <img src={hero1} alt="Vincent Kafula" />
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