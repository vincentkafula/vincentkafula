import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import MobileMenu from '../MobileMenu/MobileMenu'


const Header = (props) => {
    const [menuActive, setMenuState] = useState(false);
    const SubmitHandler = (e) => {
        e.preventDefault()
    }

    const ClickHandler = () => {
        window.scrollTo(10, 0);
    }

    return (
        <header id="header">
            <div className={`wpo-site-header ${props.hclass}`}>
                <nav className="navigation navbar navbar-expand-lg navbar-light">
                    <div className="container-fluid">
                        <div className="row align-items-center">
                            <div className="col-lg-3 col-md-4 col-3 d-lg-none dl-block">
                                <div className="mobail-menu">
                                    <MobileMenu />
                                </div>
                            </div>
                            <div className="col-lg-2 col-md-4 col-6">
                                <div className="navbar-header">
                                    <Link onClick={ClickHandler} className="navbar-brand" to="/"><img src={props.Logo}
                                        alt="logo"/></Link>
                                </div>
                            </div>
                            <div className="col-lg-8 col-md-1 col-1">
                                <div id="navbar" className="collapse navbar-collapse navigation-holder">
                                    <button className="menu-close"><i className="ti-close"></i></button>
                                    <ul className="nav navbar-nav mb-2 mb-lg-0">
                                        <li className="menu-item-has-children">
                                            <Link onClick={ClickHandler} to="/">Home</Link>
                                            <ul className="sub-menu">
                                                <li><Link onClick={ClickHandler} to="/home">Home</Link></li>
                                            </ul>
                                        </li>
                                        <li><Link onClick={ClickHandler} to="/about">About Vincent</Link></li>
                                        <li className="menu-item-has-children">
                                            <Link onClick={ClickHandler} to="/">Campaign</Link>
                                            <ul className="sub-menu">
                                                <li><Link onClick={ClickHandler} to="/campaign">Campaign Events</Link></li>
                                                <li><Link onClick={ClickHandler} to="/campaign-2">Campaign Events Grid</Link></li>
                                                <li><Link onClick={ClickHandler} to="/campaign-3">Campaign Events List</Link></li>
                                                <li><Link onClick={ClickHandler} to="/campaign-single/Support-for-Zambia-Electoral-Reform">Campaign Details</Link></li>
                                            </ul>
                                        </li>
                                        <li className="menu-item-has-children">
                                            <Link onClick={ClickHandler} to="/">Pages</Link>
                                            <ul className="sub-menu">
                                                <li><Link onClick={ClickHandler} to="/gallery">Gallery</Link></li>
                                                <li><Link onClick={ClickHandler} to="/testimonial">Testimonials</Link></li>
                                                <li><Link onClick={ClickHandler} to="/team">Team</Link></li>
                                                <li><Link onClick={ClickHandler} to="/team">Team Member</Link></li>
                                                <li className="menu-item-has-children">
                                                    <Link onClick={ClickHandler} to="/">Key Issues</Link>
                                                    <ul className="sub-menu">
                                                        <li><Link onClick={ClickHandler} to="/service">Key Issues</Link></li>
                                                        <li><Link onClick={ClickHandler} to="/service-single/Transport-Infrastructure">Issue Details</Link></li>
                                                    </ul>
                                                </li>
                                                <li><Link onClick={ClickHandler} to="/shop">Shop</Link></li>
                                                <li><Link onClick={ClickHandler} to="/news">News</Link></li>
                                                <li><Link onClick={ClickHandler} to="/faq">FAQ</Link></li>
                                                <li><Link onClick={ClickHandler} to="/volunteer">Volunteer</Link></li>
                                                <li><Link onClick={ClickHandler} to="/404">404 Error</Link></li>
                                                <li><Link onClick={ClickHandler} to="/login">Log In</Link></li>
                                                <li><Link onClick={ClickHandler} to="/register">Register</Link></li>
                                            </ul>
                                        </li>
                                        <li className="menu-item-has-children">
                                            <Link onClick={ClickHandler} to="/">Blog</Link>
                                            <ul className="sub-menu">
                                                <li><Link onClick={ClickHandler} to="/blog">Blog Right Sidebar</Link></li>
                                                <li><Link onClick={ClickHandler} to="/blog-left-sidebar">Blog Left Sidebar</Link></li>
                                                <li><Link onClick={ClickHandler} to="/blog-fullwidth">Blog Full Width</Link></li>
                                                <li className="menu-item-has-children">
                                                    <Link onClick={ClickHandler} to="/">Blog Details</Link>
                                                    <ul className="sub-menu">
                                                        <li><Link onClick={ClickHandler} to="/blog-single/support-progressive-change">Blog Details Right Sidebar</Link>
                                                        </li>
                                                        <li><Link onClick={ClickHandler} to="/blog-single-left-sidebar/support-progressive-change">Blog Details Left Sidebar</Link></li>
                                                        <li><Link onClick={ClickHandler} to="/blog-single-fullwidth/support-progressive-change">Blog Details Full Width</Link></li>
                                                    </ul>
                                                </li>
                                            </ul>
                                        </li>
                                        <li><Link onClick={ClickHandler} to="/contact">Contact</Link></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="col-lg-2 col-md-3 col-2">
                                <div className="header-right">
                                    <div className="header-search-form-wrapper">
                                        <div className="cart-search-contact">
                                            <button onClick={() => setMenuState(!menuActive)} className="search-toggle-btn"><i
                                                className={`fi ti-search ${menuActive ? "ti-close" : "fi "}`}></i></button>
                                            <div className={`header-search-form ${menuActive ? "header-search-content-toggle" : ""}`}>
                                                <form onSubmit={SubmitHandler}>
                                                    <div>
                                                        <input type="text" className="form-control"
                                                            placeholder="Search here..." />
                                                        <button type="submit"><i
                                                            className="fi flaticon-search"></i></button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="close-form">
                                        <Link onClick={ClickHandler} className="theme-btn" to="/donate"><span className="text">Donate</span>
                                            <span className="mobile">
                                                <i className="fi flaticon-charity"></i>
                                            </span></Link>
                                    </div>
                                    <div className="login-icon-wrap" style={{ marginLeft: '15px', display: 'flex', alignItems: 'center', height: '100%' }}>
                                        <Link onClick={ClickHandler} to="/login" style={{ display: 'inline-flex', color: '#fff', fontWeight: 600 }}>
                                            Login
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>
            </div>
        </header>
    )
}

export default Header;