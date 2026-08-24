import React, { useState } from "react";
import Description from "./description";
import Donation from "./Donation";
import Comments from "./Comments";

const CampaignTab = ({ CampaignDetails }) => {
  const [activeTab, setActiveTab] = useState("1");

  return (
    <div>
      {/* TAB HEADER */}
      <div className="wpo-campaign-details-tab">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "1" ? "active" : ""}`}
              onClick={() => setActiveTab("1")}
            >
              Description
            </button>
          </li>

          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "2" ? "active" : ""}`}
              onClick={() => setActiveTab("2")}
            >
              Donations
            </button>
          </li>

          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "3" ? "active" : ""}`}
              onClick={() => setActiveTab("3")}
            >
              Comments
            </button>
          </li>
        </ul>
      </div>

      {/* TAB BODY */}
      <div className="wpo-campaign-details-text pt-4">

        {activeTab === "1" && (
          <div className="row">
            <div className="col-12">
              <Description CampaignDetails={CampaignDetails} />
            </div>
          </div>
        )}

        {activeTab === "2" && (
          <div className="row">
            <div className="col-12">
              <Donation />
            </div>
          </div>
        )}

        {activeTab === "3" && (
          <div className="row">
            <div className="col-12">
              <Comments />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CampaignTab;
