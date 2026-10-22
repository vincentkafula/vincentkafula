import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SocialLinks from '../SocialLinks/SocialLinks'
import { useSelector } from 'react-redux'
import HeaderTopbar from '../HeaderTopbar/HeaderTopbar'
import MobileMenu from '../MobileMenu/MobileMenu'
import NavList from '../NavList/NavList'
import Logo from '../../images/logo-vk-full.png'

const Header2 = (props) => {
    const [menuActive, setMenuState] = useState(false);
    const cartItems = useSelector((state) => state.cart.cart);
    const cartCount = cartItems.reduce((acc, item) => acc + (item.qty || 1), 0);
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
            <HeaderTopbar />
            <div className="wpo-site-header wpo-site-header-s2">
                <nav className="navigation navbar navbar-expand-lg navbar-light">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-lg-3 col-md-3 col-3 d-lg-none dl-block">
                                <div className="mobail-menu">
                                    <MobileMenu />
                                </div>
                            </div>
                            <div className="col-md-6 col-6 d-lg-none dl-block">
                                <div className="navbar-header">
                                    <Link onClick={ClickHandler} className="navbar-brand" to="/"><img src={Logo}
                                        alt="Vincent Kafula — home" /></Link>
                                </div>
                            </div>
                            <div className="col col-lg-7 col-md-1 col-1">
                                <div id="navbar" className="collapse navbar-collapse navigation-holder">
                                    <button className="menu-close"><i className="ti-close"></i></button>
                                    <NavList />
                                </div>
                            </div>
                            <div className="col-lg-5 col-md-2 col-2">
                                <div className="header-right">
                                    <div className="header-search-form-wrapper">
                                        <div className="cart-search-contact">
                                            <Link onClick={ClickHandler} to="/cart" className="cart-toggle-btn" style={{ position: 'relative' }}>
                                                <i className="fi ti-shopping-cart"></i>
                                                {cartCount > 0 && (
                                                    <span
                                                        style={{
                                                            position: 'absolute',
                                                            top: '-6px',
                                                            right: '4px',
                                                            background: '#ff5e14',
                                                            color: '#fff',
                                                            borderRadius: '50%',
                                                            width: '16px',
                                                            height: '16px',
                                                            fontSize: '10px',
                                                            lineHeight: '16px',
                                                            textAlign: 'center',
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        {cartCount}
                                                    </span>
                                                )}
                                            </Link>
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
                                    <SocialLinks />
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>
            </div>
        </header>
    )
}

export default Header2;