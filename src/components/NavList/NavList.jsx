import React from 'react';
import { Link } from 'react-router-dom';
import navigation from '../../data/navigation';

const ClickHandler = () => {
    window.scrollTo(10, 0);
};

const renderItems = (items) => items.map((item) => (
    <li key={item.id} className={item.submenu ? 'menu-item-has-children' : undefined}>
        <Link onClick={ClickHandler} to={item.link}>{item.title}</Link>
        {item.submenu && <ul className="sub-menu">{renderItems(item.submenu)}</ul>}
    </li>
));

// Desktop navigation list shared by both header styles.
const NavList = () => (
    <ul className="nav navbar-nav mb-2 mb-lg-0">
        {renderItems(navigation)}
    </ul>
);

export default NavList;
