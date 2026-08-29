import React, { Fragment, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../../store/slices/cartSlice";
import Navbar2 from "../../components/Navbar2/Navbar2";
import PageTitle from "../../components/pagetitle/PageTitle";
import Scrollbar from "../../components/scrollbar/scrollbar";
import Product from "./product";
import api from "../../api";
import { productsApi } from "../../api/productsApi";
import ProductTabs from "./alltab";
import Footer from "../../components/footer/Footer";

const ProductSinglePage = () => {
  const { slug } = useParams(); // 👈 slug instead of id
  const dispatch = useDispatch();

  const products = api();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const found = products?.length ? products.find((p) => p.slug === slug) : null;
    if (found) {
      setProduct(found);
      return;
    }
    // Not in the static demo catalog — try the live backend (shop-manager-posted products).
    productsApi.getBySlug(slug)
      .then((p) => setProduct({
        proImg: p.image_url || '/product/1.jpg',
        title: p.name,
        slug: p.slug,
        price: Number(p.price).toFixed(2),
        delPrice: p.compare_at_price ? Number(p.compare_at_price).toFixed(2) : Number(p.price).toFixed(2),
      }))
      .catch(() => setProduct(null));
  }, [slug]);

  const addToCartProduct = (item, qty = 1) => {
    dispatch(addToCart({ ...item, qty }));
  };

  return (
    <Fragment>
      <Navbar2 />

      <PageTitle
        pageTitle={product ? product.title : "Product"}
        pagesub={"Product"}
      />

      <section className="wpo-shop-single-section section-padding">
        <div className="container">
          {product && (
            <Product item={product} addToCart={addToCartProduct} />
          )}

          {product && <ProductTabs />}
        </div>
      </section>

      <Footer />
      <Scrollbar />
    </Fragment>
  );
};

export default ProductSinglePage;
