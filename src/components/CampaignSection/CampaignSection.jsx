import React from "react";
import { Link } from 'react-router-dom'
import SectionTitle from "../SectionTitle/SectionTitle";
import Campaign from '../../api/campaign'

const ClickHandler = () => {
    window.scrollTo(10, 0);
}

export const isPast = (c) => c.isoDate && new Date(`${c.isoDate}T23:59:59`) < new Date();

// Upcoming events first (soonest first), then past events (most recent first).
export const sortedEvents = () => {
    const upcoming = Campaign.filter((c) => !isPast(c)).sort((a, b) => a.isoDate.localeCompare(b.isoDate));
    const past = Campaign.filter(isPast).sort((a, b) => b.isoDate.localeCompare(a.isoDate));
    return [...upcoming, ...past];
};

const CampaignSection = (props) => {
    const events = props.limit ? sortedEvents().slice(0, props.limit) : sortedEvents();
    return (
        <section className={`wpo-campaign-area section-padding ${props.cmClass || ''}`} aria-labelledby="events-title">
            <div className="container">
                <SectionTitle subTitle={'Campaign events'} Title={'Public meetings and campaigns'} id="events-title" />
                <div className="wpo-campaign-wrap">
                    <div className="row">
                        {events.map((campaign) => {
                            const past = isPast(campaign);
                            return (
                                <div className="col-lg-4 col-md-6 col-12" key={campaign.Id}>
                                    <div className="wpo-campaign-single">
                                        <div className="wpo-campaign-item">
                                            <div className="wpo-campaign-img">
                                                <img src={campaign.cImg} alt="" />
                                            </div>
                                            <div className="wpo-campaign-content">
                                                <div className="wpo-campaign-text-top">
                                                    <span className={`vk-badge${past ? ' vk-badge--past' : ''}`}>{past ? 'Past event' : 'Upcoming'}</span>
                                                    <small style={{ display: 'block' }}>{campaign.thumb}</small>
                                                    <h2><Link onClick={ClickHandler} to={`/campaign-single/${campaign.slug}`}>{campaign.title}</Link></h2>
                                                    <p><i className="fi flaticon-time" aria-hidden="true"></i> {campaign.date}, {campaign.time}</p>
                                                    <p><i className="fi flaticon-pin" aria-hidden="true"></i> {campaign.location}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default CampaignSection;
