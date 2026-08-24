import React, {Fragment} from 'react';
import { useDispatch } from "react-redux";
import PageTitle from '../../components/pagetitle/PageTitle'
import Scrollbar from '../../components/scrollbar/scrollbar'
import { addToCart } from "../../store/slices/cartSlice";
import ShopProduct from '../../components/ShopProduct';
import api from "../../api";
import Navbar2 from '../../components/Navbar2/Navbar2';
import Footer from '../../components/footer/Footer';

const ShopPage =() => {

    const dispatch = useDispatch();
    const products = api();

    const addToCartProduct = (product, qty = 1) => {
        dispatch(addToCart({ ...product, qty }));
    };

    return(
        <Fragment>
            <Navbar2/>
            <PageTitle pageTitle={'Shop'} pagesub={'Shop'}/> 
              <section className="wpo-shop-page section-padding">
                  <div className="container">
                      <div className="row">
                          <div className="col-lg-12">
                              <ShopProduct
                                      addToCartProduct={addToCartProduct}
                                      products={products}
                                  />
                          </div>
                      </div>
                  </div>
              </section>
            <Footer/>
            <Scrollbar/>
        </Fragment>
    )
};

export default ShopPage;