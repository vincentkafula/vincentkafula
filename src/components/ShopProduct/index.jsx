import React from "react";
import { Link } from "react-router-dom";


const ShopProduct = ({ products, addToCartProduct }) => {
    const ClickHandler = () => {
        window.scrollTo(10, 0);
    };

    return (
        <section className="wpo-shop-section">
            <div className="container">
                <div className="row">
                    <div className="col col-xs-12">
                        <div className="shop-grids clearfix">
                            {products.length > 0 &&
                                products.map((product, pitem) => (
                                    <div className="grid" key={pitem}>
                                        <div className="img-holder">
                                            <img src={product.proImg} alt="" />
                                        </div>
                                        <div className="details">
                                            <h3><Link onClick={ClickHandler} to={`/product-single/${product.slug}`}>{product.title}</Link></h3>
                                            {product.delPrice && <del>${product.delPrice}</del>}
                                            <span>{product.fromPrice ? 'From ' : ''}${product.price}</span>
                                            <div className="add-to-cart">
                                                <button
                                                    data-bs-toggle="tooltip"
                                                    data-bs-html="true"
                                                    title="Add to Cart"
                                                    onClick={() => addToCartProduct(product)}
                                                >
                                                    {product.needsOptions ? 'Choose options' : 'Add to cart'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ShopProduct;
