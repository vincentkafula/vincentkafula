import React from 'react'
import { Link } from 'react-router-dom'
import Logo from '../../images/logo-vk-full.png'

const HeaderTopbar = () => {
    return (
        <div className="topbar">
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-lg-3 col-12 d-lg-block d-none">
                        <Link className="navbar-brand" to="/"><img src={Logo} alt=""/></Link>
                    </div>
                    <div className="col-lg-9 col-12">
                        <div className="contact-info-wrap">
                            <div className="contact-info">
                                <div className="icon">
                                    <i className="fi flaticon-phone-call"></i>
                                </div>
                                <div className="info-text">
                                    <span>Call Us:</span>
                                    <p>+260955548500</p>
                                </div>
                            </div>
                            <div className="contact-info">
                                <div className="icon">
                                    <i className="fi flaticon-email"></i>
                                </div>
                                <div className="info-text">
                                    <span>E-mail Now:</span>
                                    <p>vincent.kafula@gmail.com</p>
                                </div>
                            </div>
                            <div className="contact-info">
                                <Link className="theme-btn" to="/donate">Donate Now</Link>
                                <Link to="/login" style={{ marginLeft: '15px', display: 'inline-flex', alignItems: 'center', color: 'inherit' }}>
                                    <i className="fi flaticon-user" style={{ fontSize: '20px' }}></i>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HeaderTopbar;