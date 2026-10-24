import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch } from "react-redux";
import { Link, useNavigate } from 'react-router-dom';
import PageTitle from '../../components/pagetitle/PageTitle'
import Scrollbar from '../../components/scrollbar/scrollbar'
import { addToCart } from "../../store/slices/cartSlice";
import ShopProduct from '../../components/ShopProduct';
import { productsApi } from '../../api/productsApi';
import { shopApi, formatMoney } from '../../api/shopApi';
import Navbar2 from '../../components/Navbar2/Navbar2';
import Footer from '../../components/footer/Footer';
import './shop.css';

// Shapes a backend product row into the shape ShopProduct and the cart expect.
export const toShopProduct = (p) => {
    const options = (p.variants || []).filter((v) => v.active !== false);
    const single = p.source === 'cj' ? (options.length === 1 ? options[0] : null) : null;
    return {
        id: `live-${p.id}${single ? `-${single.vid}` : ''}`,
        product_id: p.id,
        vid: single?.vid || null,
        variant: single?.name || null,
        needsOptions: p.source === 'cj' && options.length > 1,
        proImg: p.image_url || '/product/1.jpg',
        title: p.name,
        slug: p.slug,
        price: Number(single?.price ?? p.price).toFixed(2),
        delPrice: p.compare_at_price ? Number(p.compare_at_price).toFixed(2) : null,
        fromPrice: p.source === 'cj' && options.length > 1,
    };
};

const ShopPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [products, setProducts] = useState(null);
    const [fund, setFund] = useState(null);

    useEffect(() => {
        productsApi.listActive()
            .then((rows) => setProducts(rows.map(toShopProduct)))
            .catch(() => setProducts([]));
        shopApi.fund().then(setFund).catch(() => {});
    }, []);

    const addToCartProduct = (product, qty = 1) => {
        if (product.needsOptions) {
            window.scrollTo(10, 0);
            navigate(`/product-single/${product.slug}`);
            return;
        }
        dispatch(addToCart({ ...product, qty }));
    };

    return (
        <Fragment>
            <Navbar2 />
            <PageTitle pageTitle={'Shop'} pagesub={'Shop'} />
            <section className="wpo-shop-page section-padding">
                <div className="container">
                    <div className="shop-fund">
                        <div>
                            <h2>Every purchase funds the campaign</h2>
                            <p>All profit from the shop goes to the campaign. Orders are packed and shipped to your door with tracking.</p>
                        </div>
                        <div className="shop-fund-side">
                            {fund && fund.orders > 0 && <p className="shop-fund-raised"><strong>{formatMoney(fund.raised, fund.currency)}</strong> raised from {fund.orders} order{fund.orders === 1 ? '' : 's'}</p>}
                            <Link to="/track-order" onClick={() => window.scrollTo(10, 0)}>Track an order</Link>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-12">
                            {products === null ? <p className="shop-empty">Loading products…</p>
                                : products.length === 0 ? <p className="shop-empty">New campaign merchandise is coming soon.</p>
                                    : <ShopProduct addToCartProduct={addToCartProduct} products={products} />}
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
