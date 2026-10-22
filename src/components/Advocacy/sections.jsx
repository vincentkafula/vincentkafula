import React from 'react';
import { Link } from 'react-router-dom';
import Advocacy, {
    promises, principles, keyFacts, supporterQuotes, involvement,
} from '../../api/advocacy';

export const ClickHandler = () => {
    window.scrollTo(10, 0);
};

export const BozBand = ({ short }) => (
    <div className={`boz-band${short ? ' boz-band--short' : ''}`} aria-hidden="true">
        <span></span><span></span><span></span>
    </div>
);

export const SectionHead = ({ kicker, title, children, center, as = 'h2', id }) => {
    const H = as;
    return (
        <div className={`vk-section-head${center ? ' vk-section-head--center' : ''}`}>
            <BozBand short />
            {kicker && <span className="vk-kicker">{kicker}</span>}
            <H id={id}>{title}</H>
            {children && <p>{children}</p>}
        </div>
    );
};

// Four headline promises from the Build One Zambia home page.
export const PromisesSection = () => (
    <section className="vk-section" aria-labelledby="promises-title">
        <div className="container">
            <SectionHead kicker="Our promise to every Zambian" title="Four commitments that run through every proposal" id="promises-title">
                Each one is built on the same idea: Zambian workers using government-owned machinery and locally made materials.
            </SectionHead>
            <div className="vk-promises">
                {promises.map((p) => (
                    <div className="vk-promise" key={p.title}>
                        <i className={p.icon} aria-hidden="true"></i>
                        <h3><Link onClick={ClickHandler} to={p.link}>{p.title}</Link></h3>
                        <p>{p.text}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

// Grid of advocacy priority cards, each linking to its detail page.
export const PrioritiesGrid = ({ limit }) => (
    <div className="vk-priority-grid">
        {(limit ? Advocacy.slice(0, limit) : Advocacy).map((a) => (
            <article className="vk-priority-card" key={a.slug}>
                <div className="vk-icon"><i className={a.icon} aria-hidden="true"></i></div>
                <h3><Link onClick={ClickHandler} to={`/advocacy/${a.slug}`}>{a.title}</Link></h3>
                <p>{a.short}</p>
                <span className="vk-more" aria-hidden="true">Read the proposal</span>
            </article>
        ))}
    </div>
);

export const PrioritiesSection = ({ muted = true }) => (
    <section className={`vk-section${muted ? ' vk-section--muted' : ''}`} aria-labelledby="priorities-title">
        <div className="container">
            <SectionHead kicker="Key priorities" title="The issues Vincent Kafula advocates for" id="priorities-title">
                Eight areas of the Build One Zambia platform, from roads and railways to mining, housing and how the country is governed.
            </SectionHead>
            <PrioritiesGrid />
        </div>
    </section>
);

// Issue-by-issue overview: what, why, approach, outcome.
export const IssueOverview = ({ items = Advocacy, headingLevel = 'h3' }) => {
    const H = headingLevel;
    return (
        <div className="vk-issues">
            {items.map((a) => (
                <article className="vk-issue" key={a.slug} id={a.slug}>
                    <div className="vk-issue-title">
                        <i className={a.icon} aria-hidden="true"></i>
                        <H><Link onClick={ClickHandler} to={`/advocacy/${a.slug}`}>{a.title}</Link></H>
                        <Link onClick={ClickHandler} to={`/advocacy/${a.slug}`} className="vk-more" style={{ color: '#ED6B37', fontWeight: 700 }}>
                            Full proposal<span className="vk-sr-only">: {a.title}</span>
                        </Link>
                    </div>
                    <dl>
                        <div><dt>The issue</dt><dd>{a.summary.issue}</dd></div>
                        <div><dt>Why it matters</dt><dd>{a.summary.why}</dd></div>
                        <div><dt>What is proposed</dt><dd>{a.summary.approach}</dd></div>
                        <div><dt>The outcome sought</dt><dd>{a.summary.outcome}</dd></div>
                    </dl>
                </article>
            ))}
        </div>
    );
};

export const AdvocacyOverviewSection = () => (
    <section className="vk-section" aria-labelledby="overview-title">
        <div className="container">
            <SectionHead kicker="Advocacy overview" title="What is wrong, and what Build One Zambia proposes" id="overview-title">
                A short summary of each issue. Every proposal has its own page with the full detail from the campaign document.
            </SectionHead>
            <IssueOverview items={Advocacy.slice(0, 4)} />
            <div style={{ marginTop: 40 }}>
                <Link onClick={ClickHandler} to="/advocacy" className="theme-btn">See all eight issues</Link>
            </div>
        </div>
    </section>
);

// "Why this matters": shared principles and key figures.
export const WhyItMattersSection = () => (
    <section className="vk-section vk-section--dark" aria-labelledby="why-title">
        <div className="container">
            <SectionHead kicker="Why this matters" title="Zambia’s wealth should build Zambia" id="why-title">
                The document argues that opaque tenders and foreign contractors have taken wealth, wages and skills out of the country. Every proposal answers that with the same four principles.
            </SectionHead>
            <div className="vk-principles">
                {principles.map((p) => (
                    <div className="vk-principle" key={p.title}>
                        <h3>{p.title}</h3>
                        <p>{p.text}</p>
                    </div>
                ))}
            </div>
            <div className="vk-facts">
                {keyFacts.map((f) => (
                    <div className="vk-fact" key={f.label}>
                        <strong>{f.value}</strong>
                        <span>{f.label}</span>
                    </div>
                ))}
            </div>
            <p className="vk-source-note">Figures as stated in the Build One Zambia campaign document. <Link to="/resources" style={{ color: '#fff', textDecoration: 'underline' }}>View the source document</Link>.</p>
        </div>
    </section>
);

// Featured advocacy position. Written as a summary, not as a quotation.
export const StatementSection = ({ photo }) => (
    <section className="vk-section" aria-labelledby="statement-title">
        <div className="container">
            <div className="vk-statement">
                <div className="vk-statement-photo">
                    <img src={photo} alt="Vincent Kafula" />
                    <BozBand />
                </div>
                <div className="vk-statement-body">
                    <span className="vk-kicker" style={{ color: '#ED6B37', fontWeight: 700, display: 'block', marginBottom: 10 }}>Advocacy position</span>
                    <h2 id="statement-title">Zambian-led development: built by Zambians, for Zambians</h2>
                    <p>Vincent Kafula advocates for the Build One Zambia approach to development. Instead of awarding contracts to middlemen and foreign firms, the state would buy the machinery itself, Zambians would do the work, and materials would be produced at home.</p>
                    <p>The same approach is applied across the platform: roads, railways and airports; homes and schools; farm machinery for cooperatives; local processing of copper and other minerals; and provincial parliaments that bring decisions closer to communities. The stated aim is jobs, skills and wealth that stay in Zambia.</p>
                    <div className="vk-statement-sign">
                        Vincent Kafula
                        <span>Founder, Build One Zambia</span>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

export const SupporterVoices = () => (
    <section className="vk-section vk-section--muted" aria-labelledby="voices-title">
        <div className="container">
            <SectionHead kicker="Supporters" title="What supporters say" id="voices-title" />
            <div className="vk-quotes">
                {supporterQuotes.map((q) => (
                    <blockquote className="vk-quote" key={q.name}>
                        <p>“{q.text}”</p>
                        <footer>{q.name}<span>{q.role}</span></footer>
                    </blockquote>
                ))}
            </div>
        </div>
    </section>
);

export const InvolvementSection = ({ dark = true }) => (
    <section className={`vk-section${dark ? ' vk-section--dark' : ' vk-section--muted'}`} aria-labelledby="involve-title">
        <div className="container">
            <SectionHead kicker="Join the movement" title="Your voice. Your vote. Your Zambia." id="involve-title">
                This campaign is powered by farmers, builders, teachers, families and young people. Here is how you can take part.
            </SectionHead>
            <div className="vk-involve-grid">
                {involvement.map((i) => (
                    <div className={`vk-involve${dark ? '' : ' vk-involve--light'}`} key={i.title}>
                        <i className={i.icon} aria-hidden="true"></i>
                        <h3>{i.title}</h3>
                        <p>{i.text}</p>
                        <Link onClick={ClickHandler} to={i.link}>{i.cta}</Link>
                    </div>
                ))}
            </div>
        </div>
    </section>
);
