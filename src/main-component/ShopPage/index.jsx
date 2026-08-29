import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch } from "react-redux";
import PageTitle from '../../components/pagetitle/PageTitle'
import Scrollbar from '../../components/scrollbar/scrollbar'
import { addToCart } from "../../store/slices/cartSlice";
import ShopProduct from '../../components/ShopProduct';
import api from "../../api";
import { productsApi } from '../../api/productsApi';
import Navbar2 from '../../components/Navbar2/Navbar2';
import Footer from '../../components/footer/Footer';

// Shapes a backend product row into the { proImg, title, slug, price, delPrice } shape ShopProduct expects.
const toShopProduct = (p) => ({
    id: `live-${p.id}`,
    proImg: p.image_url || '/product/1.jpg',
    title: p.name,
    slug: p.slug,
    price: Number(p.price).toFixed(2),
    delPrice: p.compare_at_price ? Number(p.compare_at_price).toFixed(2) : Number(p.price).toFixed(2),
});

const ShopPage = () => {

    const dispatch = useDispatch();
    const staticProducts = api();
    const [liveProducts, setLiveProducts] = useState([]);

    useEffect(() => {
        productsApi.listActive()
            .then((rows) => setLiveProducts(rows.map(toShopProduct)))
            .catch(() => setLiveProducts([]));
    }, []);

    const products = [...liveProducts, ...staticProducts];

    const addToCartProduct = (product, qty = 1) => {
        dispatch(addToCart({ ...product, qty }));
    };

    return (
        <Fragment>
            <Navbar2 />
            <PageTitle pageTitle={'Shop'} pagesub={'Shop'} />
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
            <Footer />
            <Scrollbar />
        </Fragment>
    )
};

export default ShopPage;
