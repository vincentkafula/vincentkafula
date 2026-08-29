import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SectionTitle from "../SectionTitle/SectionTitle";
import { newsApi } from "../../api/newsApi";

const ClickHandler = () => {
    window.scrollTo(10, 0);
}

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

const BlogSection = () => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        newsApi.listPublished()
            .then((rows) => setPosts(rows.slice(0, 3)))
            .catch(() => setPosts([]));
    }, []);

    if (posts.length === 0) return null;

    return (
        <section className="wpo-blog-section section-padding" id="blog">
            <div className="container">
                <SectionTitle subTitle={'Our News'} Title={'Latest News & Press'} />
                <div className="wpo-blog-items">
                    <div className="row">
                        {posts.map((post) => (
                            <div className="col col-lg-4 col-md-6 col-12" key={post.id}>
                                <div className="wpo-blog-item">
                                    <div className="wpo-blog-img">
                                        <img src={post.cover_image_url || '/product/1.jpg'} alt="" />
                                    </div>
                                    <div className="wpo-blog-content">
                                        <ul>
                                            <li><Link onClick={ClickHandler} to={`/blog-single/${post.slug}`}>{fmtDate(post.published_at)}</Link></li>
                                            <li>by: <Link onClick={ClickHandler} to={`/blog-single/${post.slug}`}>{post.author_display_name}</Link></li>
                                        </ul>
                                        <h2><Link onClick={ClickHandler} to={`/blog-single/${post.slug}`}>{post.title}</Link></h2>
                                        <Link className="more" onClick={ClickHandler} to={`/blog-single/${post.slug}`}>Continue Reading</Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default BlogSection;
