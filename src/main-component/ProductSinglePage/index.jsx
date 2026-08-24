import React, { Fragment, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../../store/slices/cartSlice";
import Navbar2 from "../../components/Navbar2/Navbar2";
import PageTitle from "../../components/pagetitle/PageTitle";
import Scrollbar from "../../components/scrollbar/scrollbar";
import Product from "./product";
import api from "../../api";
import ProductTabs from "./alltab";
import Footer from "../../components/footer/Footer";

const ProductSinglePage = () => {
  const { slug } = useParams(); // 👈 slug instead of id
  const dispatch = useDispatch();

  const products = api();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    if (!products?.length) return;

    const found = products.find((p) => p.slug === slug);

    setProduct(found || null);
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
