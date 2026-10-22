import React, { Fragment } from 'react';
import Navbar2 from '../../components/Navbar2/Navbar2';
import PageTitle from '../../components/pagetitle/PageTitle'
import Scrollbar from '../../components/scrollbar/scrollbar'
import Footer from '../../components/footer/Footer';
import Seo from '../../components/Seo/Seo';
import { SectionHead, PrioritiesGrid, IssueOverview, InvolvementSection } from '../../components/Advocacy/sections';
import { movement } from '../../api/advocacy';
import campaignBanner from '../../images/campaign-banner.jpg';

const AdvocacyPage = () => (
    <Fragment>
        <Seo title="Advocacy and Key Issues" description="The issues Vincent Kafula champions as Founder of Build One Zambia: transport, agriculture, housing, community infrastructure, mining, governance, provincial industry and responsible borrowing." />
        <Navbar2 />
        <PageTitle pageTitle={'Advocacy and Key Issues'} pagesub={'Advocacy'} bgSrc={campaignBanner} />
        <main>
            <section className="vk-section">
                <div className="container">
                    <SectionHead kicker="The Build One Zambia platform" title="Eight issues, one approach">
                        {movement.intro}
                    </SectionHead>
                    <PrioritiesGrid />
                </div>
            </section>
            <section className="vk-section vk-section--muted">
                <div className="container">
                    <SectionHead title="Each issue at a glance">
                        What each proposal responds to, why it matters, what is proposed and what it aims to achieve.
                    </SectionHead>
                    <IssueOverview />
                </div>
            </section>
            <InvolvementSection />
        </main>
        <Footer />
        <Scrollbar />
    </Fragment>
);

export default AdvocacyPage;
