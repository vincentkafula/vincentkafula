import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch } from "react-redux";
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import PageTitle from '../../components/pagetitle/PageTitle'
import Scrollbar from '../../components/scrollbar/scrollbar'
import { addToCart } from "../../store/slices/cartSlice";
import ShopProduct from '../../components/ShopProduct';
import { shopApi, formatMoney } from '../../api/shopApi';
import Navbar2 from '../../components/Navbar2/Navbar2';
import Footer from '../../components/footer/Footer';
import './shop.css';

const PER_PAGE = 24;

// Shapes a catalogue row into what ShopProduct and the cart expect.
export const toShopProduct = (p) => {
    const only = p.only_option && p.only_option.active !== false ? p.only_option : null;
    const isCj = p.source === 'cj';
    return {
        id: `live-${p.id}${only ? `-${only.vid}` : ''}`,
        product_id: p.id,
        vid: only?.vid || null,
        variant: only?.name || null,
        needsOptions: isCj && !only,
        proImg: p.image_url || '/product/1.jpg',
        title: p.name,
        slug: p.slug,
        price: Number(only?.price ?? p.price).toFixed(2),
        delPrice: p.compare_at_price ? Number(p.compare_at_price).toFixed(2) : null,
        fromPrice: isCj && !only,
        category: p.category,
    };
};

// Page numbers with gaps: 1 … 4 5 [6] 7 8 … 40
function pageList(page, pages) {
    const set = new Set([1, pages, page - 2, page - 1, page, page + 1, page + 2].filter((n) => n >= 1 && n <= pages));
    const sorted = [...set].sort((a, b) => a - b);
    const out = [];
    sorted.forEach((n, i) => { if (i && n - sorted[i - 1] > 1) out.push('…' + n); out.push(n); });
    return out;
}

const ShopPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [params, setParams] = useSearchParams();
    const page = Math.max(parseInt(params.get('page'), 10) || 1, 1);
    const q = params.get('q') || '';
    const category = params.get('category') || '';
    const sort = params.get('sort') || 'popular';
    const [query, setQuery] = useState(q);
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [fund, setFund] = useState(null);

    useEffect(() => { shopApi.fund().then(setFund).catch(() => {}); }, []);
    useEffect(() => { setQuery(q); }, [q]);
    useEffect(() => {
        let live = true;
        setError('');
        shopApi.catalog({ page, per: PER_PAGE, q, category, sort })
            .then((d) => { if (live) setData(d); })
            .catch((e) => { if (live) { setError(e.message); setData({ items: [], total: 0, pages: 1, categories: [] }); } });
        return () => { live = false; };
    }, [page, q, category, sort]);

    const update = (changes) => {
        const next = new URLSearchParams(params);
        Object.entries(changes).forEach(([k, v]) => { if (v === '' || v === null || v === undefined || (k === 'page' && v === 1) || (k === 'sort' && v === 'popular')) next.delete(k); else next.set(k, v); });
        setParams(next);
    };
    const goPage = (n) => { update({ page: n }); window.scrollTo({ top: document.querySelector('.shop-tools')?.offsetTop - 120 || 0, behavior: 'smooth' }); };

    const addToCartProduct = (product, qty = 1) => {
        if (product.needsOptions) {
            window.scrollTo(10, 0);
            navigate(`/product-single/${product.slug}`);
            return;
        }
        dispatch(addToCart({ ...product, qty }));
    };
    const products = data ? data.items.map(toShopProduct) : null;

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

                    <div className="shop-tools">
                        <form className="shop-search" onSubmit={(e) => { e.preventDefault(); update({ q: query.trim(), page: 1 }); }} role="search">
                            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products" aria-label="Search products" />
                            <button type="submit" className="theme-btn">Search</button>
                        </form>
                        <label className="shop-sort">Sort
                            <select value={sort} onChange={(e) => update({ sort: e.target.value, page: 1 })}>
                                <option value="popular">Most popular</option>
                                <option value="newest">Newest</option>
                                <option value="price_asc">Price: low to high</option>
                                <option value="price_desc">Price: high to low</option>
                            </select>
                        </label>
                    </div>

                    {data?.categories?.length > 0 && (
                        <div className="shop-cats" role="group" aria-label="Categories">
                            <button type="button" className={!category ? 'active' : ''} onClick={() => update({ category: '', page: 1 })}>All</button>
                            {data.categories.map((c) => (
                                <button type="button" key={c.name} className={category === c.name ? 'active' : ''} onClick={() => update({ category: c.name, page: 1 })}>
                                    {c.name} <span>{c.count}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {data && (
                        <p className="shop-count">
                            {data.total.toLocaleString()} product{data.total === 1 ? '' : 's'}{q ? ` for “${q}”` : ''}{category ? ` in ${category}` : ''}
                            {(q || category) && <button type="button" onClick={() => update({ q: '', category: '', page: 1 })}>Clear</button>}
                        </p>
                    )}

                    {products === null ? (
                        <div className="shop-skeleton" aria-hidden="true">{Array.from({ length: 12 }, (_, i) => <div key={i} />)}</div>
                    ) : products.length === 0 ? (
                        <p className="shop-empty">{error || (q || category ? 'No products match. Try another search.' : 'New products are being added. Please check back soon.')}</p>
                    ) : (
                        <ShopProduct addToCartProduct={addToCartProduct} products={products} />
                    )}

                    {data && data.pages > 1 && (
                        <nav className="shop-pages" aria-label="Pages">
                            <button type="button" disabled={page <= 1} onClick={() => goPage(page - 1)}>Previous</button>
                            {pageList(page, data.pages).map((n) => (typeof n === 'string'
                                ? <span key={n} className="gap">…</span>
                                : <button type="button" key={n} className={n === page ? 'active' : ''} aria-current={n === page ? 'page' : undefined} onClick={() => goPage(n)}>{n}</button>))}
                            <button type="button" disabled={page >= data.pages} onClick={() => goPage(page + 1)}>Next</button>
                        </nav>
                    )}
                </div>
            </section>
            <Footer />
            <Scrollbar />
        </Fragment>
    )
};

export default ShopPage;
