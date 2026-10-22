import React, { Fragment, useMemo, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar2 from '../../components/Navbar2/Navbar2';
import PageTitle from '../../components/pagetitle/PageTitle'
import Scrollbar from '../../components/scrollbar/scrollbar'
import Footer from '../../components/footer/Footer';
import Seo from '../../components/Seo/Seo';
import { ClickHandler } from '../../components/Advocacy/sections';
import Advocacy, { infrastructure } from '../../api/advocacy';
import { faqs } from '../FaqPage/faqData';

const flatten = (v) => (Array.isArray(v) ? v.map(flatten).join(' ') : typeof v === 'object' && v ? Object.values(v).map(flatten).join(' ') : String(v ?? ''));

const index = [
    ...Advocacy.map((a) => ({ title: a.title, link: `/advocacy/${a.slug}`, excerpt: a.short, body: flatten(a) })),
    ...infrastructure.map((i) => ({ title: `${i.title} — Transport`, link: `/infrastructure/${i.slug}`, excerpt: i.intro, body: flatten(i) })),
    ...faqs.map((f) => ({ title: f.q, link: '/faq', excerpt: f.a, body: `${f.q} ${f.a}` })),
    { title: 'About Vincent Kafula', link: '/about', excerpt: 'Biography, Build One Zambia membership, aims, objectives and the BOZ symbol.', body: 'about vincent kafula biography ndola shiwang’andu mpika unisa build one zambia membership aims objectives constitution symbol flag colours black green gold' },
];

const SearchPage = () => {
    const [params, setParams] = useSearchParams();
    const q = params.get('q') || '';
    const [value, setValue] = useState(q);
    useEffect(() => setValue(q), [q]);

    const results = useMemo(() => {
        const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
        if (!terms.length) return [];
        return index
            .map((r) => {
                const hay = `${r.title} ${r.body}`.toLowerCase();
                const score = terms.reduce((n, t) => n + (hay.includes(t) ? 1 : 0) + (r.title.toLowerCase().includes(t) ? 2 : 0), 0);
                return { ...r, score, all: terms.every((t) => hay.includes(t)) };
            })
            .filter((r) => r.all)
            .sort((a, b) => b.score - a.score);
    }, [q]);

    return (
        <Fragment>
            <Seo title={q ? `Search: ${q}` : 'Search'} />
            <Navbar2 />
            <PageTitle pageTitle={'Search'} pagesub={'Search'} />
            <main className="vk-section">
                <div className="container" style={{ maxWidth: 860 }}>
                    <form className="vk-search-form" role="search" onSubmit={(e) => { e.preventDefault(); setParams(value.trim() ? { q: value.trim() } : {}); }}>
                        <label htmlFor="site-search" className="vk-sr-only">Search the website</label>
                        <input id="site-search" type="search" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Try “housing”, “copper” or “cooperative”" />
                        <button type="submit" className="theme-btn">Search</button>
                    </form>
                    {q && (
                        <p aria-live="polite">{results.length} {results.length === 1 ? 'result' : 'results'} for “{q}”</p>
                    )}
                    {q && results.length === 0 && (
                        <p>Try a broader word, or browse <Link to="/advocacy" style={{ color: '#ED6B37', textDecoration: 'underline' }}>all key issues</Link>.</p>
                    )}
                    {results.map((r) => (
                        <div className="vk-search-result" key={r.link + r.title}>
                            <h3><Link onClick={ClickHandler} to={r.link}>{r.title}</Link></h3>
                            <p>{r.excerpt}</p>
                        </div>
                    ))}
                </div>
            </main>
            <Footer />
            <Scrollbar />
        </Fragment>
    );
};

export default SearchPage;
