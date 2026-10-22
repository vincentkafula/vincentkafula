import React, { Fragment } from 'react';
import Navbar from '../../components/Navbar/Navbar'
import Hero from '../../components/hero/hero';
import About from '../../components/about/about';
import CampaignSection from '../../components/CampaignSection/CampaignSection';
import BlogSection from '../../components/BlogSection/BlogSection';
import Footer from '../../components/footer/Footer';
import Scrollbar from '../../components/scrollbar/scrollbar';
import Seo from '../../components/Seo/Seo';
import {
    PromisesSection, PrioritiesSection, AdvocacyOverviewSection, WhyItMattersSection,
    StatementSection, SupporterVoices, InvolvementSection,
} from '../../components/Advocacy/sections';
import abimg from '../../images/about.jpg'
import statementImg from '../../images/testimonial/1.png'
import Logo from '../../images/logo-vk-full.png'

const HomePage = () => {
    return (
        <Fragment>
            <Seo />
            <Navbar hclass={'wpo-site-header-s1'} topbarNone={'topbar-none'} Logo={Logo} />
            <main>
                <Hero />
                <PromisesSection />
                <PrioritiesSection />
                <AdvocacyOverviewSection />
                <WhyItMattersSection />
                <StatementSection photo={statementImg} />
                <About abimg={abimg} fullBio={true} />
                <SupporterVoices />
                <CampaignSection limit={3} />
                <BlogSection />
                <InvolvementSection />
            </main>
            <Footer />
            <Scrollbar />
        </Fragment>
    )
};
export default HomePage;
