import React from 'react'
import Navbar2 from '../../components/Navbar2/Navbar2'
import PageTitle from '../../components/pagetitle/PageTitle'
import Footer from '../../components/footer/Footer'
import Scrollbar from '../../components/scrollbar/scrollbar'
import FaqSection from './FaqSection'

import fagImg1 from '../../images/terms/terms2.jpg'
import fagImg2 from '../../images/terms/1.jpg'
import fagImg3 from '../../images/terms/2.jpg'


const TermsPage = (props) => {

    return (
        <div>
            <Navbar2 />
            <PageTitle pageTitle={'Terms of Use'} pagesub={'Terms of Use'} />
            <section className="wpo-terms-section section-padding">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-10 offset-lg-1">
                            <div className="wpo-terms-wrap">
                                <div className="wpo-terms-img">
                                    <img src={fagImg1} alt=""/>
                                </div>
                                <div className="wpo-terms-text">
                                    <h2>Terms of Using This Website</h2>
                                    <p>This website presents the work of Vincent Kafula, Founder of Build One Zambia, and the proposals of the Build One Zambia campaign. By using the website, you agree to these terms.</p>
                                    <p>The policy content on this website describes campaign proposals and commitments, not existing government policy. It is provided for public information and discussion, and figures are quoted as stated in the Build One Zambia campaign document.</p>

                                    <ul>
                                        <li>Do not submit false information or impersonate another person.</li>
                                        <li>Do not use the forms to send spam, abuse or unlawful content.</li>
                                        <li>Do not attempt to interfere with the operation or security of the website.</li>
                                        <li>Shop orders are subject to availability and the terms shown at checkout.</li>
                                        <li>Content may be updated as the campaign develops.</li>
                                    </ul>
                                    <p>You are welcome to share links to this website and to quote short passages for discussion, news reporting or education, provided you credit the source and do not change the meaning.</p>
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
                                    <p>We are not responsible for the content of external websites linked from this site. We may update these terms and the content of this website at any time. Questions can be sent to vincent.kafula@gmail.com.</p>

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

export default TermsPage;