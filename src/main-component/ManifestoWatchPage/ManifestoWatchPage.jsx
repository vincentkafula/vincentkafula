import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar2 from '../../components/Navbar2/Navbar2';
import Footer from '../../components/footer/Footer';
import Scrollbar from '../../components/scrollbar/scrollbar';
import {
    LAST_REVIEWED, STATUS, weaknesses, promises, accountabilitySteps, sources, gaps, comparison, timeline,
} from '../../data/manifestoWatch';
import './manifestoWatch.css';

const API_URL = import.meta.env.VITE_API_URL || '';
const pillars = ['All', ...new Set(promises.map((p) => p.pillar))];
const toTop = () => window.scrollTo(10, 0);
const multiple = (g) => {
    const m = g.target / g.now;
    return m >= 10 ? `${Math.round(m)}×` : `${m.toFixed(1)}×`;
};

const sections = [
    ['verdict', 'The verdict'],
    ['scorecard', 'Scorecard'],
    ['compare', 'Their plan and ours'],
    ['accountability', 'Accountability'],
    ['report', 'Report a broken promise'],
];

// The signature element: how far each measurable promise is from today's reality.
const GapMeter = () => {
    const [ready, setReady] = useState(false);
    useEffect(() => { const t = setTimeout(() => setReady(true), 150); return () => clearTimeout(t); }, []);
    return (
        <figure className="mw-gap" aria-labelledby="mw-gap-title">
            <figcaption id="mw-gap-title">
                <strong>The gap</strong>
                <span>Where Zambia is today, against what the UPND promised by 2031</span>
            </figcaption>
            <ul>
                {gaps.map((g) => (
                    <li key={g.label}>
                        <div className="mw-gap-row">
                            <span className="mw-gap-label">{g.label}</span>
                            <span className="mw-gap-mult">needs {multiple(g)}</span>
                        </div>
                        <div className="mw-gap-track" role="img"
                            aria-label={`${g.label}: ${g.nowText} ${g.unit} today, ${g.targetText} promised`}>
                            <span className="mw-gap-fill" style={{ width: ready ? `${Math.max((g.now / g.target) * 100, 1.2)}%` : 0 }} />
                        </div>
                        <div className="mw-gap-scale">
                            <span>{g.nowText} <em>{g.note}</em></span>
                            <span>{g.targetText} {g.unit}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </figure>
    );
};

const PromiseRow = ({ p }) => {
    const [open, setOpen] = useState(false);
    const s = STATUS[p.status];
    const id = `mw-p-${p.id}`;
    return (
        <li className={`mw-row ${open ? 'is-open' : ''}`}>
            <button type="button" className="mw-row-head" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls={id}>
                <span className="mw-row-num">{String(p.id).padStart(2, '0')}</span>
                <span className="mw-row-title">{p.promise}</span>
                <span className={`mw-pill mw-${s.tone}`}>{s.label}</span>
                <span className="mw-row-toggle" aria-hidden="true">{open ? '−' : '+'}</span>
            </button>
            {open && (
                <div className="mw-row-body" id={id}>
                    <dl>
                        <div><dt>Where things stand</dt><dd>{p.baseline}</dd></div>
                        <div><dt>Why it will not work</dt><dd>{p.problem}</dd></div>
                        <div><dt>What the government must publish</dt><dd>{p.demand}</dd></div>
                    </dl>
                    <aside className="mw-row-alt">
                        <h4>What Build One Zambia would do</h4>
                        <p>{p.alternative}</p>
                        <Link onClick={toTop} to={p.link}>Read our plan</Link>
                    </aside>
                </div>
            )}
        </li>
    );
};

const ReportForm = () => {
    const [f, setF] = useState({ name: '', email: '', phone: '', subject: '', message: '', website: '' });
    const [state, setState] = useState({ sending: false, done: false, error: '' });
    const ch = (e) => setF({ ...f, [e.target.name]: e.target.value });
    const submit = async (e) => {
        e.preventDefault();
        if (!f.name.trim() || !f.email.trim() || f.message.trim().length < 10) {
            setState({ ...state, error: 'Add your name, email and a description of at least 10 characters.' });
            return;
        }
        setState({ sending: true, done: false, error: '' });
        try {
            const res = await fetch(`${API_URL}/api/contact`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'contact', ...f, subject: `Manifesto Watch — ${f.subject || 'General report'}` }),
            });
            const body = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(body.error || 'Your report could not be sent. Try again, or email vincent.kafula@gmail.com.');
            setState({ sending: false, done: true, error: '' });
        } catch (err) {
            setState({ sending: false, done: false, error: err.message });
        }
    };
    if (state.done) return <div className="mw-thanks" role="status">Report sent. The Build One Zambia team will review it for the next scorecard update.</div>;
    return (
        <form className="mw-form" onSubmit={submit} noValidate>
            <input className="mw-hp" name="website" value={f.website} onChange={ch} tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <label>Your name<input name="name" value={f.name} onChange={ch} autoComplete="name" /></label>
            <label>Email<input type="email" name="email" value={f.email} onChange={ch} autoComplete="email" /></label>
            <label>Phone (optional)<input name="phone" value={f.phone} onChange={ch} autoComplete="tel" /></label>
            <label>Which promise?
                <select name="subject" value={f.subject} onChange={ch}>
                    <option value="">General report</option>
                    {promises.map((p) => <option key={p.id} value={`Target ${p.id}`}>{`${p.id}. ${p.promise.slice(0, 64)}${p.promise.length > 64 ? '…' : ''}`}</option>)}
                </select>
            </label>
            <label className="mw-full">What is happening in your ward or district?
                <textarea name="message" rows={5} value={f.message} onChange={ch}
                    placeholder="For example: the clinic promised in our ward has not started, or load-shedding is still 12 hours a day." />
            </label>
            {state.error && <p className="mw-error mw-full" role="alert">{state.error}</p>}
            <button type="submit" className="mw-btn mw-btn-gold" disabled={state.sending}>{state.sending ? 'Sending…' : 'Send report'}</button>
        </form>
    );
};

const ManifestoWatchPage = () => {
    const [pillar, setPillar] = useState('All');
    const { hash } = useLocation();
    useEffect(() => {
        if (!hash) return undefined;
        const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 300);
        return () => clearTimeout(t);
    }, [hash]);
    const shown = promises.filter((p) => pillar === 'All' || p.pillar === pillar);
    const counts = Object.keys(STATUS).map((k) => [k, promises.filter((p) => p.status === k).length]);

    return (
        <div className="mw-page">
            <Navbar2 />

            <header className="mw-hero">
                <div className="container mw-hero-grid">
                    <div className="mw-hero-text">
                        <nav className="mw-crumbs" aria-label="Breadcrumb"><Link to="/">Home</Link><span aria-hidden="true">/</span>Manifesto Watch</nav>
                        <h1>They made the promises. We will hold them to every one.</h1>
                        <p className="mw-lede">The UPND was returned to government in August 2026. Its 52-page manifesto, “Zambia Forward, Together”, sets 15 headline targets for 2026–2031. It attaches a cost to none of them and a deadline to almost none.</p>
                        <p>Build One Zambia has read every page. Here is why the plan cannot deliver as written, what the government must publish so you can judge it, and what we would do instead.</p>
                        <div className="mw-hero-cta">
                            <a className="mw-btn mw-btn-gold" href="#scorecard">See the scorecard</a>
                            <a className="mw-btn mw-btn-line" href="#report">Report a broken promise</a>
                        </div>
                    </div>
                    <GapMeter />
                </div>
            </header>

            <nav className="mw-jump" aria-label="On this page">
                <div className="container">
                    {sections.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
                </div>
            </nav>

            <section className="mw-section" id="verdict">
                <div className="container">
                    <div className="mw-head">
                        <h2>Why the plan cannot work as written</h2>
                        <p>Six problems, each taken from the manifesto’s own words.</p>
                    </div>
                    <div className="mw-verdict">
                        {weaknesses.map((w) => (
                            <article key={w.title}>
                                <div className="mw-verdict-claim">
                                    <h3>{w.title}</h3>
                                    <blockquote><p>“{w.quote}”</p><cite>UPND Manifesto 2026</cite></blockquote>
                                </div>
                                <p className="mw-verdict-text">{w.text}</p>
                            </article>
                        ))}
                    </div>
                    <p className="mw-credit"><strong>Credit where it is due.</strong> The 2025/26 maize harvest was a record, and the government reports inflation back in single digits. We will say so whenever a target is met. But one good season is not a five-year plan, and the promises below are what Zambians voted on.</p>
                </div>
            </section>

            <section className="mw-section mw-tint" id="scorecard">
                <div className="container">
                    <div className="mw-head mw-head-split">
                        <div>
                            <h2>The Promise Scorecard</h2>
                            <p>The UPND’s 15 headline targets, in the order the manifesto lists them. Open any target for the detail.</p>
                        </div>
                        <p className="mw-reviewed">Last reviewed {LAST_REVIEWED}</p>
                    </div>
                    <div className="mw-dist" aria-label="Status of the 15 targets">
                        <div className="mw-dist-bar">
                            {counts.map(([k, n]) => n > 0 && <span key={k} className={`mw-${STATUS[k].tone}`} style={{ flexGrow: n }} />)}
                        </div>
                        <ul className="mw-dist-key">
                            {counts.map(([k, n]) => <li key={k}><span className={`mw-dot mw-${STATUS[k].tone}`} />{n} {STATUS[k].label.toLowerCase()}</li>)}
                        </ul>
                    </div>
                    <div className="mw-filter" role="group" aria-label="Filter targets">
                        {pillars.map((p) => <button key={p} type="button" aria-pressed={pillar === p} onClick={() => setPillar(p)}>{p}</button>)}
                    </div>
                    <ol className="mw-rows">{shown.map((p) => <PromiseRow key={p.id} p={p} />)}</ol>
                </div>
            </section>

            <section className="mw-section" id="compare">
                <div className="container">
                    <div className="mw-head">
                        <h2>Their plan and ours</h2>
                        <p>The difference is who owns the tools. The UPND invites others to build Zambia. Build One Zambia puts the machinery in Zambian hands.</p>
                    </div>
                    <div className="mw-compare" role="table" aria-label="UPND plan compared with the Build One Zambia plan">
                        <div className="mw-compare-head" role="row">
                            <span role="columnheader">Area</span>
                            <span role="columnheader">UPND manifesto</span>
                            <span role="columnheader">Build One Zambia</span>
                        </div>
                        {comparison.map((c) => (
                            <div className="mw-compare-row" role="row" key={c.topic}>
                                <span role="rowheader" className="mw-compare-topic">{c.topic}</span>
                                <span role="cell" className="mw-compare-upnd"><em className="mw-mobile-label">UPND</em>{c.upnd}</span>
                                <span role="cell" className="mw-compare-boz"><em className="mw-mobile-label">Build One Zambia</em>{c.boz}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mw-links">
                        <Link onClick={toTop} to="/service-single/Mining-Strategy">Mining strategy</Link>
                        <Link onClick={toTop} to="/service-single/Agricultural-Mechanisation">Agricultural mechanisation</Link>
                        <Link onClick={toTop} to="/service-single/Housing-and-Community-Infrastructure">Housing and community infrastructure</Link>
                        <Link onClick={toTop} to="/service-single/Transport-Infrastructure">Transport infrastructure</Link>
                        <Link onClick={toTop} to="/service-single/Decentralised-Governance">Decentralised governance</Link>
                    </div>
                </div>
            </section>

            <section className="mw-section mw-dark" id="accountability">
                <div className="container mw-acc-grid">
                    <div>
                        <h2>How we will hold them to account</h2>
                        <p className="mw-acc-intro">The UPND promised to <q>diligently and transparently measure and report on results</q>. Where it does not, we will.</p>
                        <ul className="mw-methods">
                            {accountabilitySteps.map((s) => <li key={s.title}><h3>{s.title}</h3><p>{s.text}</p></li>)}
                        </ul>
                    </div>
                    <ol className="mw-timeline" aria-label="Accountability calendar 2026 to 2031">
                        {timeline.map((t) => (
                            <li key={t.when}>
                                <time>{t.when}</time>
                                <h3>{t.what}</h3>
                                <p>{t.detail}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            <section className="mw-section" id="report">
                <div className="container mw-report">
                    <div className="mw-report-text">
                        <h2>Report a broken promise</h2>
                        <p>Is a promised project missing in your ward? Are farming inputs late, the power still off, or a clinic unfinished? Tell us what you see.</p>
                        <p>Every report is read by the Build One Zambia team and feeds the quarterly scorecard and the annual Promise Report.</p>
                        <Link onClick={toTop} className="mw-text-link" to="/register">Join Build One Zambia</Link>
                    </div>
                    <ReportForm />
                </div>
            </section>

            <section className="mw-sources">
                <div className="container">
                    <h2>Sources</h2>
                    <ol>{sources.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a></li>)}</ol>
                    <p>Analysis and opinions on this page are those of Build One Zambia. Quotations are taken word for word from the UPND Manifesto 2026.</p>
                </div>
            </section>

            <Footer />
            <Scrollbar />
        </div>
    );
};

export default ManifestoWatchPage;
