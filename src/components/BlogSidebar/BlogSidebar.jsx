import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'
import Services from '../../api/service';
import about from '../../images/blog/about-widget.jpg'
import { newsApi } from '../../api/newsApi'

const SubmitHandler = (e) => {
    e.preventDefault()
}

const ClickHandler = () => {
    window.scrollTo(10, 0);
}

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

const BlogSidebar = (props) => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        newsApi.listPublished()
            .then((rows) => setPosts(rows.slice(0, 5)))
            .catch(() => setPosts([]));
    }, []);

    return (
        <div className={`col col-lg-4 col-12 ${props.blLeft}`}>
            <div className="blog-sidebar">
                <div className="widget about-widget">
                    <div className="img-holder">
                        <img src={about} alt="" />
                    </div>
                    <h4>Vincent Kafula</h4>
                    <p>Founder of Build One Zambia. Follow the campaign's latest news and press updates here.</p>
                    <div className="aw-shape">
                    </div>
                </div>
                <div className="widget search-widget">
                    <h3>Search Here</h3>
                    <form onSubmit={SubmitHandler}>
                        <div>
                            <input type="text" className="form-control" placeholder="Search Post.." />
                            <button type="submit"><i className="ti-search"></i></button>
                        </div>
                    </form>
                </div>
                <div className="widget category-widget">
                    <h3>Post Categories</h3>
                    <ul>
                        {Services.slice(0, 5).map((service, Sitem) => (
                            <li key={Sitem}><Link onClick={ClickHandler} to={`/service-single/${service.slug}`}>{service.sTitle}</Link></li>
                        ))}
                    </ul>
                </div>
                <div className="widget recent-post-widget">
                    <h3>Related Posts</h3>
                    <div className="posts">
                        {posts.length === 0 ? (
                            <p style={{ fontSize: '13px', color: '#999' }}>No news posted yet.</p>
                        ) : posts.map((post) => (
                            <div className="post" key={post.id}>
                                <div className="img-holder">
                                    <img src={post.cover_image_url || '/product/1.jpg'} alt="" />
                                </div>
                                <div className="details">
                                    <h4><Link onClick={ClickHandler} to={`/blog-single/${post.slug}`}>{post.title}</Link></h4>
                                    <span className="date">{fmtDate(post.published_at)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="wpo-contact-widget widget">
                    <div className="wpo-contact-widget-inner">
                        <h2><Link onClick={ClickHandler} to="/contact">Contact The Campaign</Link></h2>
                    </div>
                </div>
            </div>
        </div>
    )

}

export default BlogSidebar;
