import React, { Fragment, useEffect } from 'react';
import Navbar2 from '../../components/Navbar2/Navbar2'
import PageTitle from '../../components/pagetitle/PageTitle'
import Scrollbar from '../../components/scrollbar/scrollbar'
import { useParams, Link } from 'react-router-dom'
import serviceDetailsText from '../../api/serviceDetails';
import Services from '../../api/service';
import ServiceSidebar from './sidebar'
import Contact from './contact';
import Footer from '../../components/footer/Footer';

const ServiceSinglePage = (props) => {
    const { slug } = useParams()

    const serviceDetails = Services.find(item => item.slug === slug)
    const plan = serviceDetailsText[slug] || { intro: [], blocks: [] };

    // Page title and search description for each issue page.
    useEffect(() => {
        if (!serviceDetails) return;
        document.title = serviceDetails.metaTitle || `${serviceDetails.sTitle} | Vincent Kafula`;
        const setMeta = (name, content) => {
            let el = document.head.querySelector(`meta[name="${name}"]`);
            if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el); }
            el.setAttribute('content', content);
        };
        setMeta('description', serviceDetails.metaDescription || serviceDetails.description);
        if (serviceDetails.metaKeywords) setMeta('keywords', serviceDetails.metaKeywords);
        return () => { document.title = 'Vincent Kafula | Founder of Build One Zambia'; };
    }, [serviceDetails]);

    return (
        <Fragment>
            <Navbar2 />
            <PageTitle pageTitle={serviceDetails.sTitle} pagesub={'Key Issues'} />
            <div className="wpo-service-single-area section-padding">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-8 col-12">
                            <div className="wpo-service-single-wrap">
                                <div className="wpo-service-single-item">
                                    <div className="wpo-service-single-main-img">
                                        <img src={serviceDetails.sImgS} alt="" />
                                    </div>
                                    <div className="wpo-service-single-title">
                                        <h3>{serviceDetails.sTitle}</h3>
                                    </div>
                                    {(plan.intro.length ? plan.intro : [serviceDetails.description]).map((text, i) => <p key={i}>{text}</p>)}
                                    <div className="row mt-4">
                                        <div className="col-md-6 col-sm-6 col-12">
                                            <div className="wpo-p-details-img">
                                                <img src={serviceDetails.ssImg1} alt="" />
                                            </div>
                                        </div>
                                        <div className="col-md-6 col-sm-6 col-12">
                                            <div className="wpo-p-details-img">
                                                <img src={serviceDetails.ssImg2} alt="" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {plan.blocks.map((block, bi) => (
                                    <div className={`wpo-service-single-item${block.els.some((el) => el.t === 'ul') ? ' list-widget' : ''}`} key={bi}>
                                        <div className="wpo-service-single-title">
                                            <h3>{block.title}</h3>
                                        </div>
                                        {block.els.map((el, ei) => {
                                            if (el.t === 'h') return <p key={ei}><strong>{el.text}</strong></p>;
                                            if (el.t === 'ul') return <ul key={ei}>{el.items.map((item, ii) => <li key={ii}>{item}</li>)}</ul>;
                                            return <p key={ei}>{el.text}</p>;
                                        })}
                                    </div>
                                ))}
                                <div className="wpo-service-single-item">
                                    <div className="wpo-service-single-title">
                                        <h3>Related issues</h3>
                                    </div>
                                    <div className="wpo-service-area">
                                        <div className="row align-items-center">
                                            {Services.slice(0,6).filter((s) => s.slug !== slug).slice(0,3).map((service, srv) => (
                                                <div className="col-lg-4 col-md-6 col-12" key={srv}>
                                                    <Link className="wpo-service-item" style={{ display: 'block', color: 'inherit' }} onClick={() => window.scrollTo(10, 0)} to={`/service-single/${service.slug}`}>
                                                        <i className={`fi ${service.icon}`} ></i>
                                                        <h2>{service.sTitle}</h2>
                                                        <p>{service.des2}</p>
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="wpo-service-single-item">
                                    <div className="wpo-service-contact-area">
                                        <div className="wpo-contact-title">
                                            <h2>Have a question about this proposal?</h2>
                                            <p>Get in touch to share your views or ask about the Build One Zambia plan.</p>
                                        </div>
                                        <div className="wpo-contact-form-area">
                                            <Contact/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <ServiceSidebar/>
                    </div>
                </div>
            </div>
            <Footer/>
            <Scrollbar />
        </Fragment>
    )
};
export default ServiceSinglePage;
