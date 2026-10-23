import React from 'react'

const Description = ({ CampaignDetails }) => {
    return (
        <div id="Description">
            <div className="wpo-campaign-content">
                <div className="wpo-campaign-text-top">
                    <h2>{CampaignDetails.title}</h2>
                    {CampaignDetails.goal && (
<div className="progress-sub">
                        <div className="progress-section">
                            <div className="process">
                                <div className="progress">
                                    <div className="progress-bar" style={{ width: `${CampaignDetails.progress}%` }}>
                                        <div className="progress-value">
                                            <span>{CampaignDetails.progress}</span>%</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <ul>
                            {CampaignDetails.goal && (<><li><span>Raised:</span> ${CampaignDetails.raised}</li>
                            <li><span>Goal:</span> ${CampaignDetails.goal}</li></>)}
                        </ul>
                    </div>
)}
                    <div className="campaign-b-text">
                        <p>{CampaignDetails.title} is a Build One Zambia public event at {CampaignDetails.location}. It is part of the campaign for a Zambia built by Zambians, for Zambians, where every family has a safe home, every farmer has the means to succeed and every province thrives.</p>
                        <p>The event brings together citizens, young people and community leaders to discuss the issues that affect them and the changes Build One Zambia proposes.</p>
                        <p>Everyone is welcome. Further details, including the programme and speakers, will be announced before the event. For questions, please use the contact page.</p>
                    </div>
                    <div className="campaign-bb-text">
                        <h3>How You Can Take Part</h3>
                        <p>Build One Zambia is powered by farmers, builders, teachers, families and young people who refuse to accept the status quo. Here is how you can take part:</p>
                        <ul>
                            <li>Volunteer to help organise in your province, district or ward.</li>
                            <li>Share the Build One Zambia message with family, friends and your community.</li>
                            <li>Take part in the agricultural cooperative programme.</li>
                            <li>Attend campaign events and bring a friend.</li>
                            <li>Vote Build One Zambia.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Description;