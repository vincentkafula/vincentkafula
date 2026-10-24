import React, { Fragment, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../../store/slices/cartSlice";
import Navbar2 from "../../components/Navbar2/Navbar2";
import PageTitle from "../../components/pagetitle/PageTitle";
import Scrollbar from "../../components/scrollbar/scrollbar";
import Product from "./product";
import { productsApi } from "../../api/productsApi";
import Footer from "../../components/footer/Footer";
import "./productSingle.css";

const ProductSinglePage = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const [product, setProduct] = useState(undefined);

  useEffect(() => {
    setProduct(undefined);
    productsApi.getBySlug(slug)
      .then((p) => {
        const description = (p.description || '').trim();
        setProduct({
          product_id: p.id,
          proImg: p.image_url || '/product/1.jpg',
          images: (p.images && p.images.length ? p.images : [p.image_url]).filter(Boolean),
          title: p.name,
          slug: p.slug,
          price: Number(p.price).toFixed(2),
          delPrice: p.compare_at_price ? Number(p.compare_at_price).toFixed(2) : null,
          variants: p.source === 'cj' ? p.variants : [],
          summary: description.split('\n').find((l) => l.trim()) || '',
          description,
        });
      })
      .catch(() => setProduct(null));
  }, [slug]);

  const addToCartProduct = (item, qty = 1) => dispatch(addToCart({ ...item, qty }));

  return (
    <Fragment>
      <Navbar2 />
      <PageTitle pageTitle={product ? product.title : "Product"} pagesub={"Product"} />
      <section className="wpo-shop-single-section section-padding">
        <div className="container">
          {product === undefined && <p>Loading…</p>}
          {product === null && <p>This product is no longer available.</p>}
          {product && <Product item={product} addToCart={addToCartProduct} />}
          {product?.description && (
            <div className="ps-description">
              <h3>Product details</h3>
              {product.description.split(/\n{2,}/).map((para, i) => <p key={i}>{para}</p>)}
            </div>
          )}
        </div>
      </section>
      <Footer />
      <Scrollbar />
    </Fragment>
  );
};

export default ProductSinglePage;
