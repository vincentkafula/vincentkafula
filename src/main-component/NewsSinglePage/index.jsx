import React, { Fragment, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar2 from '../../components/Navbar2/Navbar2';
import PageTitle from '../../components/pagetitle/PageTitle';
import Footer from '../../components/footer/Footer';
import Scrollbar from '../../components/scrollbar/scrollbar';
import { newsApi } from '../../api/newsApi';

const NewsSinglePage = () => {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        newsApi.getBySlug(slug)
            .then(setPost)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [slug]);

    return (
        <Fragment>
            <Navbar2 />
            <PageTitle pageTitle={post?.title || 'News'} pagesub={'News'} />
            <section className="section-padding">
                <div className="container" style={{ maxWidth: '820px' }}>
                    {loading ? (
                        <p style={{ textAlign: 'center', color: '#777' }}>Loading…</p>
                    ) : error ? (
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ color: '#c0392b' }}>{error}</p>
                            <Link to="/news" className="theme-btn">Back to News</Link>
                        </div>
                    ) : (
                        <article>
                            {post.cover_image_url && (
                                <img src={post.cover_image_url} alt={post.title} style={{ width: '100%', borderRadius: '10px', marginBottom: '24px' }} />
                            )}
                            <p style={{ fontSize: '13px', color: '#999', marginBottom: '10px' }}>
                                {post.published_at ? new Date(post.published_at).toLocaleDateString() : ''} · {post.author_display_name}
                            </p>
                            <h1 style={{ fontSize: '30px', marginBottom: '20px' }}>{post.title}</h1>
                            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, color: '#333', fontSize: '16px' }}>{post.body}</div>
                            <div style={{ marginTop: '40px' }}>
                                <Link to="/news" className="theme-btn">← Back to News</Link>
                            </div>
                        </article>
                    )}
                </div>
            </section>
            <Footer />
            <Scrollbar />
        </Fragment>
    );
};

export default NewsSinglePage;
