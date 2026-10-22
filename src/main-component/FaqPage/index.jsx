import React, {Fragment} from 'react';
import Navbar2 from '../../components/Navbar2/Navbar2'
import PageTitle from '../../components/pagetitle/PageTitle'
import FaqSection from './FaqSection'
import { InvolvementSection } from '../../components/Advocacy/sections'
import Footer from '../../components/footer/Footer'
import Scrollbar from '../../components/scrollbar/scrollbar'
import Seo from '../../components/Seo/Seo'

const FaqPage =() => {
    return(
        <Fragment>
            <Navbar2/>
            <Seo title="Frequently Asked Questions" description="Answers to common questions about Vincent Kafula, Build One Zambia membership, aims and the main proposals." />
            <PageTitle pageTitle={'Frequently Asked Questions'} pagesub={'FAQ'}/> 
                <section className="wpo-faq-section section-padding">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-lg-8 offset-lg-2">
                                <div className="wpo-section-title">
                                    <h2>Questions about Vincent Kafula and Build One Zambia</h2>
                                </div>
                            </div>
                            <div className="col-lg-8 offset-lg-2">
                                <FaqSection/>
                            </div>
                        </div>
                    </div>
                </section>
                <InvolvementSection dark={false} />
            <Footer/>
            <Scrollbar/>
        </Fragment>
    )
};
export default FaqPage;

