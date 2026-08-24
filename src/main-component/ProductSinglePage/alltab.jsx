import React, { useState } from "react";

import rv1 from '../../images/review/img-1.jpg'
import rv2 from '../../images/review/img-2.jpg'

const ProductTabs = () => {
  const [activeTab, setActiveTab] = useState("1");

  const SubmitHandler = (e) => {
    e.preventDefault();
  };

  return (
    <div className="row">
      <div className="col col-xs-12">
        <div className="product-info">

          {/* NAV TABS */}
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "1" ? "active" : ""}`}
                type="button"
                onClick={() => setActiveTab("1")}
              >
                Description
              </button>
            </li>

            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "2" ? "active" : ""}`}
                type="button"
                onClick={() => setActiveTab("2")}
              >
                Review
              </button>
            </li>
          </ul>

          {/* TAB CONTENT */}
          <div className="tab-content">

            {/* DESCRIPTION */}
            <div
              className={`tab-pane fade ${
                activeTab === "1" ? "show active" : ""
              }`}
            >
              <div className="row">
                <div className="col-sm-12">
                  <div id="Schedule">
                    <p>
                      Samsa woke from troubled dreams, he found himself
                      transformed in his bed into a horrible vermin. He lay on
                      his armour-like back, and if he lifted his head a little he
                      could see his brown belly.
                    </p>
                    <p>
                      The bedding was hardly able to cover it and seemed ready to
                      slide off any moment. His many legs, pitifully thin
                      compared with the size of the rest of him.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* REVIEW */}
            <div
              className={`tab-pane fade ${
                activeTab === "2" ? "show active" : ""
              }`}
            >
              <div className="row">
                <div className="col col-lg-10 col-12">

                  {/* REVIEW ITEM */}
                  <div className="client-rv">
                    <div className="client-pic">
                      <img src={rv1} alt="" />
                    </div>
                    <div className="details">
                      <div className="name-rating-time">
                        <div className="name-rating">
                          <h4>Jenefar Willium</h4>
                          <div className="product-rt">
                            <span>25 Sep 2025</span>
                            <div className="rating">
                              <i className="fa fa-star"></i>
                              <i className="fa fa-star"></i>
                              <i className="fa fa-star"></i>
                              <i className="fa fa-star"></i>
                              <i className="fa fa-star-o"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="review-body">
                        <p>
                          There are many variations of passages of Lorem Ipsum
                          available, but the majority have suffered alteration.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* REVIEW ITEM */}
                  <div className="client-rv">
                    <div className="client-pic">
                      <img src={rv2} alt="" />
                    </div>
                    <div className="details">
                      <div className="name-rating-time">
                        <div className="name-rating">
                          <h4>Maria Bannet</h4>
                          <div className="product-rt">
                            <span>28 Sep 2025</span>
                            <div className="rating">
                              <i className="fa fa-star"></i>
                              <i className="fa fa-star"></i>
                              <i className="fa fa-star"></i>
                              <i className="fa fa-star"></i>
                              <i className="fa fa-star-o"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="review-body">
                        <p>
                          There are many variations of passages of Lorem Ipsum
                          available, but the majority have suffered alteration.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* REVIEW FORM */}
                <div className="col col-lg-12 col-12 review-form-wrapper">
                  <div className="review-form">
                    <h4>Add a review</h4>
                    <p>
                      Your email address will not be published. Required fields
                      are marked *
                    </p>

                    <form onSubmit={SubmitHandler}>
                      <div className="give-rat-sec">
                        <p>Your rating *</p>
                        <div className="give-rating">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <label key={star}>
                              <input type="radio" name="stars" value={star} />
                              {"★".repeat(star)}
                            </label>
                          ))}
                        </div>
                      </div>

                      <input
                        type="text"
                        className="form-control"
                        placeholder="Name *"
                        required
                      />
                      <input
                        type="email"
                        className="form-control mt-4"
                        placeholder="Email *"
                        required
                      />
                      <textarea
                        className="form-control mt-4"
                        placeholder="Review *"
                      ></textarea>

                      <div className="submit mt-4">
                        <button type="submit" className="theme-btn">
                          Post review
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductTabs;