import React, { useState } from "react";
import { Link } from "react-router-dom";
import Services from "../../api/service";

const ClickHandler = () => window.scrollTo(10, 0);

const ServiceSectionS2 = () => {
  const [activeTab, setActiveTab] = useState("1");

  return (
    <div className="wpo-campaign-area-s4 section-padding">
      <div className="container">
        <div className="wpo-campaign-wrap">

          {/* TABS */}
          <ul className="nav nav-tabs">
            {[
              { id: "1", label: "Education" },
              { id: "2", label: "Social Services" },
              { id: "3", label: "Business" },
              { id: "4", label: "Qualification" },
              { id: "5", label: "Development" },
            ].map((tab) => (
              <li className="nav-item" key={tab.id}>
                <button
                  className={`nav-link ${activeTab === tab.id ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>

          {/* TAB CONTENT */}
          <div className="tab-content pt-4">

            {/* TAB 1 */}
            {activeTab === "1" && (
              <div className="row">
                {Services.slice(5, 8).map((service, srv) => (
                  <div className="col-lg-4 col-md-6 col-12" key={srv}>
                    <ServiceCard service={service} />
                  </div>
                ))}
              </div>
            )}

            {/* TAB 2 */}
            {activeTab === "2" && (
              <div className="row">
                {Services.slice(8, 11).map((service, srv) => (
                  <div className="col-lg-4 col-md-6 col-12" key={srv}>
                    <ServiceCard service={service} />
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3 */}
            {activeTab === "3" && (
              <div className="row">
                {Services.slice(11, 14).map((service, srv) => (
                  <div className="col-lg-4 col-md-6 col-12" key={srv}>
                    <ServiceCard service={service} />
                  </div>
                ))}
              </div>
            )}

            {/* TAB 4 */}
            {activeTab === "4" && (
              <div className="row">
                {Services.slice(14, 17).map((service, srv) => (
                  <div className="col-lg-4 col-md-6 col-12" key={srv}>
                    <ServiceCard service={service} />
                  </div>
                ))}
              </div>
            )}

            {/* TAB 5 */}
            {activeTab === "5" && (
              <div className="row">
                {Services.slice(17, 20).map((service, srv) => (
                  <div className="col-lg-4 col-md-6 col-12" key={srv}>
                    <ServiceCard service={service} />
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

/* CARD COMPONENT (no logic change) */
const ServiceCard = ({ service }) => (
  <div className="wpo-campaign-single">
    <div className="wpo-campaign-item">
      <div className="wpo-campaign-img">
        <img src={service.sImgS} alt="" />
      </div>
      <div className="wpo-campaign-content">
        <div className="wpo-campaign-text-top">
          <h2>
            <Link onClick={ClickHandler} to={`/service-single/${service.slug}`}>
              {service.sTitle}
            </Link>
          </h2>
          <p>{service.description}</p>
        </div>
      </div>
    </div>
  </div>
);

export default ServiceSectionS2;
