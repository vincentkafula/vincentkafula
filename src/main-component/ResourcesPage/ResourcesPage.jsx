import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import Navbar2 from '../../components/Navbar2/Navbar2';
import PageTitle from '../../components/pagetitle/PageTitle'
import Scrollbar from '../../components/scrollbar/scrollbar'
import Footer from '../../components/footer/Footer';
import Seo from '../../components/Seo/Seo';
import { SectionHead, ClickHandler } from '../../components/Advocacy/sections';
import { sourceDocument } from '../../api/advocacy';

const ResourcesPage = () => (
    <Fragment>
        <Seo title="Research and Resources" description="Download the Build One Zambia campaign document that sets out the issues, proposals and commitments Vincent Kafula advocates for." />
        <Navbar2 />
        <PageTitle pageTitle={'Research and Resources'} pagesub={'Resources'} />
        <main className="vk-section">
            <div className="container">
                <SectionHead kicker="Source documents" title="Read the platform in full">
                    The advocacy content on this website is based on the document below. Download it to read every proposal in its original form.
                </SectionHead>
                <div className="vk-resource">
                    <div>
                        <h3>{sourceDocument.title}</h3>
                        <p>{sourceDocument.subtitle}. Covers the movement’s aims and symbol, transport infrastructure, agricultural mechanisation, housing and community infrastructure, the mining strategy, decentralised governance and how to get involved.</p>
                    </div>
                    <div className="vk-resource-actions">
                        <a className="theme-btn" href={sourceDocument.pdf} download>
                            <i className="fa-solid fa-file-pdf" aria-hidden="true"></i> PDF
                        </a>
                        <a className="vk-btn-outline vk-btn-outline--dark" href={sourceDocument.docx} download>
                            <i className="fa-solid fa-file-word" aria-hidden="true"></i> Word
                        </a>
                    </div>
                </div>
                <p>Prefer to browse online? Start with the <Link onClick={ClickHandler} to="/advocacy" style={{ color: '#ED6B37', textDecoration: 'underline' }}>key issues</Link> or the <Link onClick={ClickHandler} to="/proposals" style={{ color: '#ED6B37', textDecoration: 'underline' }}>full list of proposals</Link>.</p>
            </div>
        </main>
        <Footer />
        <Scrollbar />
    </Fragment>
);

export default ResourcesPage;
