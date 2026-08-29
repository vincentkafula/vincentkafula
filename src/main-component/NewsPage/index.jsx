import React, { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar2 from '../../components/Navbar2/Navbar2';
import PageTitle from '../../components/pagetitle/PageTitle';
import Footer from '../../components/footer/Footer';
import Scrollbar from '../../components/scrollbar/scrollbar';
import { newsApi } from '../../api/newsApi';

const NewsPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        newsApi.listPublished()
            .then(setPosts)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    return (
        <Fragment>
            <Navbar2 />
            <PageTitle pageTitle={'Campaign News'} pagesub={'News'} />
            <section className="section-padding">
                <div className="container">
                    {loading ? (
                        <p style={{ textAlign: 'center', color: '#777' }}>Loading news…</p>
                    ) : error ? (
                        <p style={{ textAlign: 'center', color: '#c0392b' }}>{error}</p>
                    ) : posts.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#777' }}>No news posted yet — check back soon.</p>
                    ) : (
                        <div className="row">
                            {posts.map((post) => (
                                <div className="col-lg-4 col-md-6 col-12" key={post.id} style={{ marginBottom: '30px' }}>
                                    <div style={{ border: '1px solid #eee', borderRadius: '10px', overflow: 'hidden', height: '100%', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
                                        {post.cover_image_url && (
                                            <img src={post.cover_image_url} alt={post.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                                        )}
                                        <div style={{ padding: '20px' }}>
                                            <p style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>
                                                {post.published_at ? new Date(post.published_at).toLocaleDateString() : ''}
                                            </p>
                                            <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>
                                                <Link to={`/news/${post.slug}`}>{post.title}</Link>
                                            </h3>
                                            {post.excerpt && <p style={{ color: '#666', fontSize: '14px' }}>{post.excerpt}</p>}
                                            <Link to={`/news/${post.slug}`} className="theme-btn" style={{ marginTop: '10px', display: 'inline-block' }}>Read More</Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
            <Footer />
            <Scrollbar />
        </Fragment>
    );
};

export default NewsPage;
