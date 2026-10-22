import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MobileMenu from '../MobileMenu/MobileMenu'
import NavList from '../NavList/NavList'


const Header = (props) => {
    const [menuActive, setMenuState] = useState(false);
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const SubmitHandler = (e) => {
        e.preventDefault()
        const q = query.trim();
        if (!q) return;
        setMenuState(false);
        navigate(`/search?q=${encodeURIComponent(q)}`);
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
                                        alt="Vincent Kafula — home"/></Link>
                                </div>
                            </div>
                            <div className="col-lg-8 col-md-1 col-1">
                                <div id="navbar" className="collapse navbar-collapse navigation-holder">
                                    <button className="menu-close"><i className="ti-close"></i></button>
                                    <NavList />
                                </div>
                            </div>
                            <div className="col-lg-2 col-md-3 col-2">
                                <div className="header-right">
                                    <div className="header-search-form-wrapper">
                                        <div className="cart-search-contact">
                                            <button onClick={() => setMenuState(!menuActive)} className="search-toggle-btn" aria-label="Open search"><i
                                                className={`fi ti-search ${menuActive ? "ti-close" : "fi "}`}></i></button>
                                            <div className={`header-search-form ${menuActive ? "header-search-content-toggle" : ""}`}>
                                                <form onSubmit={SubmitHandler}>
                                                    <div>
                                                        <input type="search" className="form-control" aria-label="Search the website"
                                                            value={query} onChange={(e) => setQuery(e.target.value)}
                                                            placeholder="Search the issues..." />
                                                        <button type="submit" aria-label="Search"><i
                                                            className="fi flaticon-search"></i></button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="close-form">
                                        <Link onClick={ClickHandler} className="theme-btn" to="/donate"><span className="text">Support</span>
                                            <span className="mobile">
                                                <i className="fi flaticon-charity"></i>
                                            </span></Link>
                                    </div>
                                    <div className="login-icon-wrap" style={{ marginLeft: '15px', display: 'flex', alignItems: 'center', height: '100%' }}>
                                        <Link onClick={ClickHandler} to="/login" style={{ display: 'inline-flex', color: '#fff', fontWeight: 600 }}>
                                            Log in
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