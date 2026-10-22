import React from 'react'
import { Link } from 'react-router-dom'
import Logo from '../../images/logo-vk-full.png'
import { contactDetails } from '../../data/navigation'

const HeaderTopbar = () => {
    const phone = contactDetails.phones[0];
    return (
        <div className="topbar">
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-lg-3 col-12 d-lg-block d-none">
                        <Link className="navbar-brand" to="/"><img src={Logo} alt="Vincent Kafula — home" /></Link>
                    </div>
                    <div className="col-lg-9 col-12">
                        <div className="contact-info-wrap">
                            <div className="contact-info">
                                <div className="icon">
                                    <i className="fi flaticon-phone-call"></i>
                                </div>
                                <div className="info-text">
                                    <span>Call</span>
                                    <p><a href={`tel:${phone.tel}`} style={{ color: 'inherit' }}>{phone.display}</a></p>
                                </div>
                            </div>
                            <div className="contact-info">
                                <div className="icon">
                                    <i className="fi flaticon-email"></i>
                                </div>
                                <div className="info-text">
                                    <span>Email</span>
                                    <p><a href={`mailto:${contactDetails.email}`} style={{ color: 'inherit' }}>{contactDetails.email}</a></p>
                                </div>
                            </div>
                            <div className="contact-info">
                                <Link className="theme-btn" to="/volunteer">Get Involved</Link>
                                <Link to="/login" style={{ marginLeft: '15px', display: 'inline-flex', alignItems: 'center', color: 'inherit', fontWeight: 600 }}>
                                    Log in
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
