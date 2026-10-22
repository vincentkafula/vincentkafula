import React, { Fragment } from 'react';
import { Link, useParams, Navigate, useLocation } from 'react-router-dom';
import Navbar2 from '../../components/Navbar2/Navbar2';
import PageTitle from '../../components/pagetitle/PageTitle'
import Scrollbar from '../../components/scrollbar/scrollbar'
import Footer from '../../components/footer/Footer';
import Seo from '../../components/Seo/Seo';
import { ClickHandler } from '../../components/Advocacy/sections';
import Advocacy, { getAdvocacy, getInfrastructure, infrastructure } from '../../api/advocacy';
import campaignBanner from '../../images/campaign-banner.jpg';

const List = ({ items }) => (
    <ul className="vk-list">{items.map((b, i) => <li key={i}>{b}</li>)}</ul>
);

const Sidebar = ({ current, isInfra }) => (
    <aside className="vk-aside" aria-label="More issues">
        {isInfra && (
            <div className="vk-aside-block">
                <h3>Transport infrastructure</h3>
                <ul>
                    <li><Link onClick={ClickHandler} to="/advocacy/transport-infrastructure">Overview and strategy</Link></li>
                    {infrastructure.map((i) => (
                        <li key={i.slug}>
                            <Link onClick={ClickHandler} to={`/infrastructure/${i.slug}`} aria-current={current === i.slug ? 'page' : undefined}>{i.title}</Link>
                        </li>
                    ))}
                </ul>
            </div>
        )}
        <div className="vk-aside-block">
            <h3>All key issues</h3>
            <ul>
                {Advocacy.map((a) => (
                    <li key={a.slug}>
                        <Link onClick={ClickHandler} to={`/advocacy/${a.slug}`} aria-current={current === a.slug ? 'page' : undefined}>{a.title}</Link>
                    </li>
                ))}
            </ul>
        </div>
        <div className="vk-aside-block vk-aside-cta">
            <h3>Have a question or a view?</h3>
            <p>Send feedback or an enquiry about any of these proposals.</p>
            <Link onClick={ClickHandler} to="/contact" className="theme-btn">Get in touch</Link>
        </div>
    </aside>
);

const Layout = ({ seoTitle, seoDesc, pageTitle, crumb, children, current, isInfra }) => (
    <Fragment>
        <Seo title={seoTitle} description={seoDesc} />
        <Navbar2 />
        <PageTitle pageTitle={pageTitle} pagesub={crumb} bgSrc={campaignBanner} />
        <main className="vk-section">
            <div className="container">
                <div className="row">
                    <div className="col-lg-8 col-12">
                        <article className="vk-article">{children}</article>
                    </div>
                    <div className="col-lg-4 col-12">
                        <Sidebar current={current} isInfra={isInfra} />
                    </div>
                </div>
            </div>
        </main>
        <Footer />
        <Scrollbar />
    </Fragment>
);

const AdvocacyDetail = ({ item }) => (
    <Layout seoTitle={item.title} seoDesc={item.metaDescription} pageTitle={item.title} crumb="Advocacy" current={item.slug}>
        {item.intro.map((p, i) => <p key={i} className={i === 0 ? 'vk-lead' : undefined}>{p}</p>)}

        <div className="vk-summary-box">
            <dl>
                <div><dt>The issue</dt><dd>{item.summary.issue}</dd></div>
                <div><dt>Why it matters</dt><dd>{item.summary.why}</dd></div>
                <div><dt>What is proposed</dt><dd>{item.summary.approach}</dd></div>
                <div><dt>The outcome sought</dt><dd>{item.summary.outcome}</dd></div>
            </dl>
        </div>

        {item.children && (
            <>
                <h2>Transport commitments by sector</h2>
                <nav className="vk-subnav" aria-label="Transport sectors">
                    {infrastructure.map((i) => (
                        <Link onClick={ClickHandler} key={i.slug} to={`/infrastructure/${i.slug}`}>
                            <i className={i.icon} aria-hidden="true"></i>{i.title}
                        </Link>
                    ))}
                </nav>
            </>
        )}

        {item.sections.map((s) => (
            <section key={s.heading}>
                <h2>{s.heading}</h2>
                {s.text && s.text.map((p, i) => <p key={i}>{p}</p>)}
                {s.outcomeLabel && <h3>{s.outcomeLabel}</h3>}
                {s.bullets && <List items={s.bullets} />}
                {s.after && s.after.map((p, i) => <p key={`a${i}`}>{p}</p>)}
                {s.callout && <p className="vk-callout">{s.callout}</p>}
                {s.items && (
                    <div className="vk-items">
                        {s.items.map((it) => (
                            <div className="vk-item" key={it.title}>
                                <h3>{it.title}</h3>
                                <p>{it.text}</p>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        ))}

        {item.quote && (
            <blockquote className="vk-pullquote">
                “{item.quote}”
                <cite>Build One Zambia</cite>
            </blockquote>
        )}
    </Layout>
);

const InfrastructureDetail = ({ item }) => (
    <Layout seoTitle={`${item.title} — Transport Infrastructure`} seoDesc={item.metaDescription} pageTitle={item.title} crumb="Infrastructure" current={item.slug} isInfra>
        <h2 style={{ marginTop: 0 }}>{item.headline}</h2>
        <p className="vk-lead">{item.intro}</p>
        <h2>{item.commitmentsLabel}</h2>
        <List items={item.commitments} />
        <div className="vk-benefits">
            <h3>What this means for you</h3>
            <p>{item.benefits}</p>
        </div>
        <p>All transport work follows the same people-powered strategy: government-procured machinery, Zambian labour, locally produced materials, and foreign engineers engaged only as individuals to transfer skills. <Link onClick={ClickHandler} to="/advocacy/transport-infrastructure" style={{ color: '#ED6B37', fontWeight: 700 }}>Read the full transport strategy</Link>.</p>
    </Layout>
);

export const AdvocacySinglePage = () => {
    const { slug } = useParams();
    const item = getAdvocacy(slug);
    if (!item) return <Navigate to="/advocacy" replace />;
    return <AdvocacyDetail item={item} />;
};

export const InfrastructurePage = () => {
    const { slug } = useParams();
    const item = getInfrastructure(slug);
    if (!item) return <Navigate to="/advocacy/transport-infrastructure" replace />;
    return <InfrastructureDetail item={item} />;
};

// Legacy /service-single/:slug links: show the advocacy page if the slug matches, else the overview.
export const LegacyServiceRedirect = () => {
    const { slug } = useParams();
    const { pathname } = useLocation();
    const match = getAdvocacy(slug);
    return <Navigate to={match ? `/advocacy/${match.slug}` : '/advocacy'} replace state={{ from: pathname }} />;
};

export default AdvocacySinglePage;
