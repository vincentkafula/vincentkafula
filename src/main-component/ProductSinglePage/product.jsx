import React, { useMemo, useState } from 'react';
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'
import { Link } from 'react-router-dom';

// Product detail with option (variant) choice for CJ products.
const Product = ({ item, addToCart }) => {
    const options = useMemo(() => (item.variants || []).filter((v) => v.active !== false), [item.variants]);
    const [vid, setVid] = useState(options.length === 1 ? options[0].vid : '');
    const [qty, setQty] = useState(1);
    const [image, setImage] = useState(item.proImg);
    const chosen = options.find((v) => v.vid === vid);
    const price = chosen ? Number(chosen.price).toFixed(2) : item.price;
    const needsChoice = options.length > 1 && !chosen;
    const gallery = item.images?.length ? item.images : [item.proImg];

    const choose = (v) => { setVid(v); const o = options.find((x) => x.vid === v); if (o?.image) setImage(o.image); };
    const add = () => {
        if (needsChoice) return;
        addToCart({
            ...item,
            id: `live-${item.product_id}${chosen ? `-${chosen.vid}` : ''}`,
            vid: chosen?.vid || null,
            variant: chosen?.name || null,
            title: chosen ? `${item.title} (${chosen.name})` : item.title,
            price,
            proImg: chosen?.image || item.proImg,
        }, qty);
    };

    return (
        <div className="row align-items-start">
            <div className="col col-lg-5 col-12">
                <div className="shop-single-slider">
                    <div className="slider-nav">
                        <div><Zoom><img src={image || ''} alt={item.title} /></Zoom></div>
                    </div>
                    {gallery.length > 1 && (
                        <div className="ps-thumbs">
                            {gallery.map((g) => (
                                <button type="button" key={g} onClick={() => setImage(g)} aria-label="Show this photo" className={g === image ? 'active' : ''}>
                                    <img src={g} alt="" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className="col col-lg-7 col-12">
                <div className="product-details">
                    <h2>{item.title}</h2>
                    <div className="price">
                        <span className="current">{needsChoice ? `From $${item.price}` : `$${price}`}</span>
                        {item.delPrice && <span className="old">${item.delPrice}</span>}
                    </div>
                    {item.summary && <p className="ps-summary">{item.summary}</p>}
                    <p className="ps-fund">Profit from this item goes to the campaign.</p>
                    {options.length > 1 && (
                        <label className="ps-field">Choose an option
                            <select value={vid} onChange={(e) => choose(e.target.value)}>
                                <option value="">Select…</option>
                                {options.map((o) => <option key={o.vid} value={o.vid}>{o.name} — ${Number(o.price).toFixed(2)}</option>)}
                            </select>
                        </label>
                    )}
                    <div className="product-option">
                        <div className="product-row ps-row">
                            <label className="ps-qty">Quantity
                                <input type="number" min="1" max="20" value={qty} onChange={(e) => setQty(Math.min(20, Math.max(1, parseInt(e.target.value, 10) || 1)))} />
                            </label>
                            <button className="theme-btn" onClick={add} disabled={needsChoice}>{needsChoice ? 'Choose an option' : 'Add to cart'}</button>
                        </div>
                    </div>
                    <div className="tg-btm">
                        <p><span>Delivery:</span> Shipped with tracking. The cost is calculated at checkout for your country.</p>
                        <p><Link to="/track-order">Track an existing order</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Product;
