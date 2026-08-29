import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom'
import BlogSidebar from '../BlogSidebar/BlogSidebar.jsx'
import { newsApi } from '../../api/newsApi.js';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

const BlogSingle = (props) => {

    const { slug } = useParams()
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        newsApi.getBySlug(slug)
            .then(setPost)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [slug]);

    const submitHandler = (e) => {
        e.preventDefault()
    }

    return (
        <section className="wpo-blog-single-section section-padding">
            <div className="container">
                <div className="row">
                    <div className={`col col-lg-8 col-12 ${props.blRight}`}>
                        <div className="wpo-blog-content">
                            {loading ? (
                                <p>Loading article…</p>
                            ) : error || !post ? (
                                <div>
                                    <p style={{ color: '#c0392b' }}>{error || 'Article not found.'}</p>
                                    <Link to="/blog" className="theme-btn">Back to News</Link>
                                </div>
                            ) : (
                                <div className="post format-standard-image">
                                    {post.cover_image_url && (
                                        <div className="entry-media">
                                            <img src={post.cover_image_url} alt={post.title} />
                                        </div>
                                    )}
                                    <div className="entry-meta">
                                        <ul>
                                            <li><i className="fi flaticon-user"></i> By {post.author_display_name}</li>
                                            <li><i className="fi flaticon-calendar"></i> {fmtDate(post.published_at)}</li>
                                        </ul>
                                    </div>
                                    <h2>{post.title}</h2>
                                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{post.body}</div>

                                    <div className="more-posts">
                                        <div className="previous-post">
                                            <Link to="/blog">
                                                <span className="post-control-link">← Back to News</span>
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="comments-area">
                                        <div className="comment-respond">
                                            <h3 className="comment-reply-title">Leave a Comment</h3>
                                            <form onSubmit={submitHandler} id="commentform" className="comment-form">
                                                <div className="form-textarea">
                                                    <textarea id="comment" placeholder="Write Your Comments..."></textarea>
                                                </div>
                                                <div className="form-inputs">
                                                    <input placeholder="Name" type="text" />
                                                    <input placeholder="Email" type="email" />
                                                </div>
                                                <div className="form-submit">
                                                    <input id="submit" value="Post Comment" type="submit" />
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <BlogSidebar blLeft={props.blLeft}/>
                </div>
            </div>
        </section>
    )

}

export default BlogSingle;
