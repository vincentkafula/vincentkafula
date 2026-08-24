import React, {Fragment} from 'react';
import Navbar2 from '../../components/Navbar2/Navbar2';
import PageTitle from "../../components/pagetitle/PageTitle";
import CheckoutSection from '../../components/CheckoutSection'
import Scrollbar from '../../components/scrollbar/scrollbar'
import { useSelector } from "react-redux";
import Footer from '../../components/footer/Footer';

const CheckoutPage =() => {

    const cartList = useSelector((state) => state.cart.cart);

    return(
        <Fragment>
            <Navbar2/>
            <PageTitle pageTitle={'Checkout'} pagesub={'Checkout'}/> 
            <CheckoutSection cartList={cartList}/>
            <Footer/>
            <Scrollbar/>
        </Fragment>
    )
};

export default CheckoutPage;
