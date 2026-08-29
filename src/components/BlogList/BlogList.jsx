import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'
import BlogSidebar from '../BlogSidebar/BlogSidebar.jsx'
import { newsApi } from '../../api/newsApi.js'

const ClickHandler = () => {
    window.scrollTo(10, 0);
}

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

const BlogList = (props) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        newsApi.listPublished()
            .then(setPosts)
            .catch(() => setPosts([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <section className="wpo-blog-pg-section section-padding">
            <div className="container">
                <div className="row">
                    <div className={`col col-lg-8 col-12 ${props.blRight}`}>
                        <div className="wpo-blog-content">
                            {loading ? (
                                <p>Loading news…</p>
                            ) : posts.length === 0 ? (
                                <p>No news posted yet — check back soon.</p>
                            ) : (
                                posts.map((post) => (
                                    <div className="post" key={post.id}>
                                        <div className="entry-media">
                                            <img src={post.cover_image_url || '/product/1.jpg'} alt="" />
                                        </div>
                                        <div className="entry-meta">
                                            <ul>
                                                <li><i className="fi flaticon-user"></i> By <Link onClick={ClickHandler} to={`/blog-single/${post.slug}`}>{post.author_display_name}</Link> </li>
                                                <li><i className="fi flaticon-calendar"></i> {fmtDate(post.published_at)}</li>
                                            </ul>
                                        </div>
                                        <div className="entry-details">
                                            <h3><Link onClick={ClickHandler} to={`/blog-single/${post.slug}`}>{post.title}</Link></h3>
                                            <p>{post.excerpt || `${post.body.slice(0, 180)}${post.body.length > 180 ? '…' : ''}`}</p>
                                            <Link onClick={ClickHandler} to={`/blog-single/${post.slug}`} className="read-more">READ MORE...</Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    <BlogSidebar blLeft={props.blLeft}/>
                </div>
            </div>
        </section>
     )
}

export default BlogList;
