import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import Navbar2 from '../../components/Navbar2/Navbar2';
import PageTitle from '../../components/pagetitle/PageTitle'
import Scrollbar from '../../components/scrollbar/scrollbar'
import Footer from '../../components/footer/Footer';
import Seo from '../../components/Seo/Seo';
import { SectionHead, ClickHandler } from '../../components/Advocacy/sections';
import Advocacy, { infrastructure, sourceDocument } from '../../api/advocacy';
import campaignBanner from '../../images/campaign-banner.jpg';

// Collects the concrete commitments from each advocacy item into one list.
const commitmentsFor = (a) => {
    const rows = [];
    a.sections.forEach((s) => {
        (s.bullets || []).forEach((b) => rows.push({ text: b }));
        (s.items || []).forEach((it) => rows.push({ title: it.title, text: it.text }));
    });
    if (a.children) {
        infrastructure.forEach((inf) => inf.commitments.forEach((c) => rows.push({ title: inf.title, text: c })));
    }
    return rows;
};

const ProposalsPage = () => (
    <Fragment>
        <Seo title="Policy Proposals and Recommendations" description="Every specific proposal in the Build One Zambia platform, grouped by issue, with the outcome each is intended to achieve." />
        <Navbar2 />
        <PageTitle pageTitle={'Policy Proposals'} pagesub={'Proposals'} bgSrc={campaignBanner} />
        <main className="vk-section">
            <div className="container">
                <SectionHead kicker="Proposals and recommendations" title="Every commitment in one place">
                    The specific proposals set out in the Build One Zambia campaign document, grouped by issue. These are proposals and campaign commitments, not existing government policy.
                </SectionHead>
                <nav className="vk-aside-block" aria-label="Jump to an issue" style={{ marginBottom: 50 }}>
                    <h3>Jump to</h3>
                    <ul style={{ columns: 2 }}>
                        {Advocacy.map((a) => <li key={a.slug}><a href={`#p-${a.slug}`}>{a.title}</a></li>)}
                    </ul>
                </nav>
                {Advocacy.map((a) => {
                    const rows = commitmentsFor(a);
                    return (
                        <section className="vk-proposal-group" id={`p-${a.slug}`} key={a.slug}>
                            <h2><Link onClick={ClickHandler} to={`/advocacy/${a.slug}`}>{a.title}</Link></h2>
                            <p><strong>Approach:</strong> {a.summary.approach}</p>
                            <div className="vk-table-wrap">
                                <table className="vk-table">
                                    <caption className="vk-sr-only">Proposals for {a.title}</caption>
                                    <thead>
                                        <tr><th scope="col">Proposal</th><th scope="col">Detail</th></tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((r, i) => (
                                            r.title
                                                ? <tr key={i}><td><strong>{r.title}</strong></td><td>{r.text}</td></tr>
                                                : <tr key={i}><td colSpan={2}>{r.text}</td></tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p style={{ marginTop: 16 }}><strong>Intended outcome:</strong> {a.summary.outcome}</p>
                        </section>
                    );
                })}
                <p className="vk-source-note">Source: {sourceDocument.title}. <Link to="/resources" style={{ color: '#ED6B37', textDecoration: 'underline' }}>Download the full document</Link>.</p>
            </div>
        </main>
        <Footer />
        <Scrollbar />
    </Fragment>
);

export default ProposalsPage;
