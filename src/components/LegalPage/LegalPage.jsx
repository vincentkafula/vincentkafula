import React from 'react'
import Navbar2 from '../Navbar2/Navbar2'
import PageTitle from '../pagetitle/PageTitle'
import Footer from '../footer/Footer'
import Scrollbar from '../scrollbar/scrollbar'
import Seo from '../Seo/Seo'

const LegalPage = ({ title, description, updated, sections }) => (
    <div>
        <Seo title={title} description={description} />
        <Navbar2 />
        <PageTitle pageTitle={title} pagesub={title} />
        <main className="vk-section">
            <div className="container">
                <article className="vk-article" style={{ margin: '0 auto' }}>
                    <p><em>Last updated: {updated}</em></p>
                    {sections.map((s) => (
                        <section key={s.h}>
                            <h2>{s.h}</h2>
                            {(s.p || []).map((p, i) => <p key={i}>{p}</p>)}
                            {s.list && <ul className="vk-list">{s.list.map((l, i) => <li key={i}>{l}</li>)}</ul>}
                        </section>
                    ))}
                </article>
            </div>
        </main>
        <Footer />
        <Scrollbar />
    </div>
);

export default LegalPage;
