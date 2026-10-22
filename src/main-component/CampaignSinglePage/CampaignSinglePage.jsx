import React, { Fragment } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom'
import Navbar2 from '../../components/Navbar2/Navbar2'
import PageTitle from '../../components/pagetitle/PageTitle'
import Scrollbar from '../../components/scrollbar/scrollbar'
import Campaign from '../../api/campaign'
import Footer from '../../components/footer/Footer';
import Seo from '../../components/Seo/Seo';
import { isPast, sortedEvents } from '../../components/CampaignSection/CampaignSection';
import campaignBanner from '../../images/campaign-banner.jpg';

const ClickHandler = () => {
    window.scrollTo(10, 0);
}

const CampaignSinglePage = () => {
    const { slug } = useParams()
    const event = Campaign.find(item => item.slug === slug)
    if (!event) return <Navigate to="/campaign" replace />;
    const past = isPast(event);
    const others = sortedEvents().filter((e) => e.slug !== slug);

    return (
        <Fragment>
            <Seo title={event.title} description={`${event.title} — ${event.date}, ${event.location}.`} />
            <Navbar2 />
            <PageTitle pageTitle={event.title} pagesub={'Campaign events'} bgSrc={campaignBanner} />
            <main className="vk-section">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-8 col-12">
                            <article className="vk-article">
                                <img src={event.cSimg} alt="" style={{ width: '100%', borderRadius: 6, marginBottom: 30 }} />
                                <span className={`vk-badge${past ? ' vk-badge--past' : ''}`}>{past ? 'This event has taken place' : 'Upcoming event'}</span>
                                <h2 style={{ marginTop: 10 }}>{event.title}</h2>
                                <ul className="vk-event-meta">
                                    <li><i className="fa-solid fa-tag" aria-hidden="true"></i>{event.thumb}</li>
                                    <li><i className="fa-solid fa-calendar-day" aria-hidden="true"></i>{event.date}</li>
                                    <li><i className="fa-solid fa-clock" aria-hidden="true"></i>{event.time}</li>
                                    <li><i className="fa-solid fa-location-dot" aria-hidden="true"></i>{event.location}</li>
                                </ul>
                                <p>{past
                                    ? 'A report on this event will be published in News and updates when it is available.'
                                    : 'Further details, including the programme and speakers, will be announced before the event. To attend, volunteer or ask a question, please get in touch.'}</p>
                                <Link onClick={ClickHandler} to="/contact" className="theme-btn">Ask about this event</Link>
                            </article>
                        </div>
                        <div className="col-lg-4 col-12">
                            <aside className="vk-aside">
                                <div className="vk-aside-block">
                                    <h3>Other events</h3>
                                    <ul>
                                        {others.map((e) => (
                                            <li key={e.slug}><Link onClick={ClickHandler} to={`/campaign-single/${e.slug}`}>{e.title}<br /><small>{e.date}</small></Link></li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="vk-aside-block vk-aside-cta">
                                    <h3>Volunteer in your ward</h3>
                                    <p>Help organise Build One Zambia activities where you live.</p>
                                    <Link onClick={ClickHandler} to="/volunteer" className="theme-btn">Volunteer</Link>
                                </div>
                            </aside>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
            <Scrollbar />
        </Fragment>
    )
};
export default CampaignSinglePage;
