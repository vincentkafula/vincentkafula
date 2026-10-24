import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar2 from '../../components/Navbar2/Navbar2';
import PageTitle from '../../components/pagetitle/PageTitle';
import Footer from '../../components/footer/Footer';
import Scrollbar from '../../components/scrollbar/scrollbar';
import { LAST_REVIEWED, STATUS, headlineFacts, weaknesses, promises, accountabilitySteps, sources } from '../../data/manifestoWatch';
import './manifestoWatch.css';

const API_URL = import.meta.env.VITE_API_URL || '';
const pillars = ['All', ...new Set(promises.map((p) => p.pillar))];
const toTop = () => window.scrollTo(10, 0);

const PromiseCard = ({ p }) => {
    const [open, setOpen] = useState(false);
    const s = STATUS[p.status];
    return (
        <article className={`mw-promise ${open ? 'is-open' : ''}`}>
            <button type="button" className="mw-promise-head" onClick={() => setOpen(!open)} aria-expanded={open}>
                <span className="mw-num">{String(p.id).padStart(2, '0')}</span>
                <span className="mw-promise-title">{p.promise}</span>
                <span className={`mw-status mw-${s.tone}`}>{s.label}</span>
                <i className={open ? 'ti-minus' : 'ti-plus'} aria-hidden="true"></i>
            </button>
            {open && (
                <div className="mw-promise-body">
                    <div><h6>Where things stand</h6><p>{p.baseline}</p></div>
                    <div><h6>Why it will not work</h6><p>{p.problem}</p></div>
                    <div><h6>What we demand</h6><p>{p.demand}</p></div>
                    <div className="mw-alt"><h6>What Build One Zambia would do</h6><p>{p.alternative}</p>
                        <Link onClick={toTop} to={p.link}>Read our plan →</Link></div>
                </div>
            )}
        </article>
    );
};

const ReportForm = () => {
    const [f, setF] = useState({ name: '', email: '', phone: '', subject: '', message: '', website: '' });
    const [state, setState] = useState({ sending: false, done: false, error: '' });
    const ch = (e) => setF({ ...f, [e.target.name]: e.target.value });
    const submit = async (e) => {
        e.preventDefault();
        if (!f.name.trim() || !f.email.trim() || f.message.trim().length < 10) {
            setState({ ...state, error: 'Please give your name, email and a short description (at least 10 characters).' });
            return;
        }
        setState({ sending: true, done: false, error: '' });
        try {
            const res = await fetch(`${API_URL}/api/contact`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'contact', ...f, subject: `Manifesto Watch — ${f.subject || 'General report'}` }),
            });
            const body = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(body.error || 'Could not send your report.');
            setState({ sending: false, done: true, error: '' });
        } catch (err) {
            setState({ sending: false, done: false, error: err.message });
        }
    };
    if (state.done) return <div className="mw-thanks">Thank you. Your report has been sent to the Build One Zambia team.</div>;
    return (
        <form className="mw-form" onSubmit={submit} noValidate>
            <input className="mw-hp" name="website" value={f.website} onChange={ch} tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <label>Your name<input name="name" value={f.name} onChange={ch} autoComplete="name" /></label>
            <label>Email<input type="email" name="email" value={f.email} onChange={ch} autoComplete="email" /></label>
            <label>Phone (optional)<input name="phone" value={f.phone} onChange={ch} autoComplete="tel" /></label>
            <label>Which promise?
                <select name="subject" value={f.subject} onChange={ch}>
                    <option value="">General report</option>
                    {promises.map((p) => <option key={p.id} value={`Target ${p.id}`}>{`${p.id}. ${p.promise.slice(0, 70)}${p.promise.length > 70 ? '…' : ''}`}</option>)}
                </select>
            </label>
            <label className="mw-full">What is happening in your ward or district?
                <textarea name="message" rows={5} value={f.message} onChange={ch}
                    placeholder="e.g. The clinic promised in our ward has not started; load-shedding is still 12 hours a day; no inputs have arrived." />
            </label>
            {state.error && <p className="mw-error mw-full">{state.error}</p>}
            <button type="submit" className="theme-btn mw-full" disabled={state.sending}>{state.sending ? 'Sending…' : 'Send report'}</button>
        </form>
    );
};

const ManifestoWatchPage = () => {
    const [pillar, setPillar] = useState('All');
    const { hash } = useLocation();
    useEffect(() => {
        if (!hash) return;
        const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 300);
        return () => clearTimeout(t);
    }, [hash]);
    const shown = promises.filter((p) => pillar === 'All' || p.pillar === pillar);
    const counts = Object.keys(STATUS).map((k) => [k, promises.filter((p) => p.status === k).length]);
    return (
        <div>
            <Navbar2 />
            <PageTitle pageTitle={'Manifesto Watch'} pagesub={'Manifesto Watch'} />
            <section className="mw-page section-padding">
                <div className="container">
                    <div className="mw-intro">
                        <span className="mw-kicker">UPND Manifesto 2026–2031</span>
                        <h2>They made the promises. We will hold them to every one.</h2>
                        <p>In August 2026 the UPND was returned to government, and its manifesto, “Zambia Forward, Together”, is now the programme Zambians are entitled to see delivered. Build One Zambia has read all 52 pages. Our verdict: the plan is full of large numbers but short on deadlines, costs and ownership — and too much of it depends on others doing the work.</p>
                        <p>This page does three things. It explains why we believe the plan cannot deliver as written. It sets out exactly what the government must publish so Zambians can judge its progress. And it shows what Build One Zambia would do instead.</p>
                        <div className="mw-facts">
                            {headlineFacts.map((f) => <div key={f.label}><strong>{f.value}</strong><span>{f.label}</span></div>)}
                        </div>
                    </div>

                    <div className="mw-section">
                        <h3>Why the UPND plan cannot work as written</h3>
                        <div className="mw-grid">
                            {weaknesses.map((w) => <div className="mw-card" key={w.title}><h4>{w.title}</h4><p>{w.text}</p></div>)}
                        </div>
                        <p className="mw-credit">Credit where it is due: the 2025/26 maize harvest was a record, and the government reports inflation back in single digits. We will say so when targets are met. But one good season is not a five-year plan, and the promises below are what Zambians voted on.</p>
                    </div>

                    <div className="mw-section" id="scorecard">
                        <div className="mw-score-head">
                            <h3>The Promise Scorecard</h3>
                            <span>Last reviewed: {LAST_REVIEWED}</span>
                        </div>
                        <div className="mw-legend">
                            {counts.map(([k, n]) => <span key={k} className={`mw-status mw-${STATUS[k].tone}`}>{STATUS[k].label}: {n}</span>)}
                        </div>
                        <div className="mw-filter" role="tablist">
                            {pillars.map((p) => <button key={p} type="button" className={pillar === p ? 'active' : ''} onClick={() => setPillar(p)}>{p}</button>)}
                        </div>
                        <div className="mw-promises">{shown.map((p) => <PromiseCard key={p.id} p={p} />)}</div>
                    </div>

                    <div className="mw-section">
                        <h3>How we will hold them to account</h3>
                        <p>The UPND wrote that every commitment would be “translated into specific, measurable targets with clear timelines”, and that it would “diligently and transparently measure and report on results”. We intend to make sure it does.</p>
                        <ol className="mw-steps">
                            {accountabilitySteps.map((s) => <li key={s.title}><h4>{s.title}</h4><p>{s.text}</p></li>)}
                        </ol>
                    </div>

                    <div className="mw-section mw-alt-section">
                        <h3>What can work: the Build One Zambia alternative</h3>
                        <p>Our approach is simple. Government buys the machinery, Zambians operate it, materials are made in Zambia, and profits stay in Zambia. No tenders to middlemen, no foreign firms walking away with the wealth.</p>
                        <div className="mw-grid">
                            <Link onClick={toTop} className="mw-card mw-link" to="/service-single/Mining-Strategy"><h4>Process our own minerals</h4><p>New mines 100% Zambian-owned; all ore processed in Zambia into finished products.</p></Link>
                            <Link onClick={toTop} className="mw-card mw-link" to="/service-single/Agricultural-Mechanisation"><h4>Equip farmer cooperatives</h4><p>Tractors, planters and solar irrigation owned by 20-member cooperatives.</p></Link>
                            <Link onClick={toTop} className="mw-card mw-link" to="/service-single/Housing-and-Community-Infrastructure"><h4>Build with Zambian hands</h4><p>Machinery in every municipality; schools in every ward, colleges in every district, a UNZA campus in every province.</p></Link>
                            <Link onClick={toTop} className="mw-card mw-link" to="/service-single/Transport-Infrastructure"><h4>Roads, rail and airports</h4><p>Built by Zambian crews with locally produced materials — no foreign contractors.</p></Link>
                            <Link onClick={toTop} className="mw-card mw-link" to="/"><h4>Power to every province</h4><p>Ten power plants and fertiliser, cement and stone plants — one set in every province.</p></Link>
                            <Link onClick={toTop} className="mw-card mw-link" to="/register"><h4>Join the movement</h4><p>Register as a member, form a cooperative, or apply for an internship.</p></Link>
                        </div>
                    </div>

                    <div className="mw-section" id="report">
                        <h3>Report a broken promise</h3>
                        <p>Is a promised project missing in your ward? Are inputs late, power still off, or a clinic unfinished? Tell us. Reports help us build the scorecard and the annual Promise Report.</p>
                        <ReportForm />
                    </div>

                    <div className="mw-section mw-sources">
                        <h3>Sources</h3>
                        <ul>{sources.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a></li>)}</ul>
                        <p>Analysis and opinions on this page are those of Build One Zambia. Quotations are taken directly from the UPND Manifesto 2026.</p>
                    </div>
                </div>
            </section>
            <Footer />
            <Scrollbar />
        </div>
    );
};

export default ManifestoWatchPage;
