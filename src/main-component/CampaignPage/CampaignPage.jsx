import React, { Fragment } from 'react';
import Navbar2 from '../../components/Navbar2/Navbar2';
import PageTitle from '../../components/pagetitle/PageTitle'
import CampaignSection from '../../components/CampaignSection/CampaignSection';
import Scrollbar from '../../components/scrollbar/scrollbar'
import Footer from '../../components/footer/Footer';
import Seo from '../../components/Seo/Seo';
import { InvolvementSection } from '../../components/Advocacy/sections';
import campaignBanner from '../../images/campaign-banner.jpg';

const CampaignPage = () => {
    return (
        <Fragment>
            <Navbar2 />
            <Seo title="Campaign Events" description="Upcoming and past Build One Zambia campaign events and public meetings." />
            <PageTitle pageTitle={'Campaign Events'} pagesub={'Campaign'} bgSrc={campaignBanner} />
            <CampaignSection cmClass={'wpo-campaign-area-s5'}/>
            <InvolvementSection />
            <Footer />
            <Scrollbar />
        </Fragment>
    )
};
export default CampaignPage;
