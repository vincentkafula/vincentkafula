import React, { Fragment } from 'react';
import Navbar2 from '../../components/Navbar2/Navbar2'
import PageTitle from '../../components/pagetitle/PageTitle'
import Scrollbar from '../../components/scrollbar/scrollbar'
import { useParams } from 'react-router-dom'
import Services from '../../api/service';
import ServiceSidebar from './sidebar'
import Contact from './contact';
import Footer from '../../components/footer/Footer';

const ServiceSinglePage = (props) => {
    const { slug } = useParams()

    const serviceDetails = Services.find(item => item.slug === slug)

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
                                    <p>{serviceDetails.intro1 || serviceDetails.description}</p>
                                    <p>{serviceDetails.intro2 || serviceDetails.des3}</p>
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
                                <div className="wpo-service-single-item list-widget">
                                    <div className="wpo-service-single-title">
                                        <h3>What is proposed</h3>
                                    </div>
                                    <p>{serviceDetails.proposedP || serviceDetails.description}</p>
                                    <ul>
{(serviceDetails.proposed || []).map((item, i) => <li key={i}>{item}</li>)}
                                    </ul>
                                </div>
                                <div className="wpo-service-single-item">
                                    <div className="wpo-service-single-title">
                                        <h3>Why it matters</h3>
                                    </div>
                                    <p>{serviceDetails.why || serviceDetails.des2}</p>
                                </div>
                                <div className="wpo-service-single-item list-widget">
                                    <div className="wpo-service-single-title">
                                        <h3>Intended outcomes</h3>
                                    </div>
                                    <ul>
{(serviceDetails.outcomes || []).map((item, i) => <li key={i}>{item}</li>)}
                                    </ul>
                                </div>
                                <div className="wpo-service-single-item">
                                    <div className="wpo-service-single-title">
                                        <h3>Related issues</h3>
                                    </div>
                                    <div className="wpo-service-area">
                                        <div className="row align-items-center">
                                            {Services.slice(0,3).map((service, srv) => (
                                                <div className="col-lg-4 col-md-6 col-12" key={srv}>
                                                    <div className="wpo-service-item">
                                                        <i className={`fi ${service.icon}`} ></i>
                                                        <h2>{service.sTitle}</h2>
                                                        <p>{service.des2}</p>
                                                    </div>
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
