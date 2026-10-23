import React from 'react'
import Navbar2 from '../../components/Navbar2/Navbar2'
import PageTitle from '../../components/pagetitle/PageTitle'
import Footer from '../../components/footer/Footer'
import Scrollbar from '../../components/scrollbar/scrollbar'
import FaqSection from './FaqSection'

import fagImg1 from '../../images/terms/terms.jpg'
import fagImg2 from '../../images/terms/1.jpg'
import fagImg3 from '../../images/terms/2.jpg'


const PrivacyPage = (props) => {

    return (
        <div>
            <Navbar2 />
            <PageTitle pageTitle={'Privacy Policy'} pagesub={'Privacy Policy'} />
            <section className="wpo-terms-section section-padding">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-10 offset-lg-1">
                            <div className="wpo-terms-wrap">
                                <div className="wpo-terms-img">
                                    <img src={fagImg1} alt=""/>
                                </div>
                                <div className="wpo-terms-text">
                                    <h2>How We Handle Your Personal Information</h2>
                                    <p>This website is run by Vincent Kafula, Founder of Build One Zambia. We respect your privacy and only collect the personal information you choose to give us, such as your name, email address, phone number and location details when you contact us, volunteer, subscribe to updates or make a purchase in the shop.</p>
                                    <p>We use this information only for the purpose you gave it for: to reply to your message, organise volunteering in your area, send campaign updates or process your order. We do not sell your information or share it with third parties for their own marketing.</p>

                                    <ul>
                                        <li>Contact form: your name, email, phone number and message, so that we can reply.</li>
                                        <li>Volunteer form: your name, email and location details, so that we can organise activities in your area.</li>
                                        <li>Newsletter: your email address, so that we can send campaign updates.</li>
                                        <li>Shop and accounts: the details needed to process orders and run your account.</li>
                                        <li>We do not use advertising cookies on this website.</li>
                                    </ul>
                                    <p>We keep your information only for as long as it is needed and then delete it. You can ask to see, correct or delete the information we hold about you, or unsubscribe from updates, at any time by emailing vincent.kafula@gmail.com.</p>
                                    <div className="row t-sub">
                                        <div className="col-md-6 col-sm-6 col-12">
                                            <div className="pf-p-details-img">
                                                <img src={fagImg2} alt=""/>
                                            </div>
                                        </div>
                                        <div className="col-md-6 col-sm-6 col-12">
                                            <div className="pf-p-details-img">
                                                <img src={fagImg3} alt=""/>
                                            </div>
                                        </div>
                                    </div>
                                    <p>This website may load maps, fonts and icons from third-party services, which may record your IP address when the content loads. If we change this policy, the updated version will be published on this page.</p>

                                </div>
                                <div className="pf-faq-section">
                                    <h4>Frequently Asked Questions</h4>
                                    <div className="row">
                                        <div className="col-lg-12 col-md-12 col-12">
                                            <FaqSection/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
            <Scrollbar />
        </div>

    )
}

export default PrivacyPage;