import React, {Fragment} from 'react';
import Navbar2 from '../../components/Navbar2/Navbar2.jsx';
import PageTitle from '../../components/pagetitle/PageTitle.jsx'
import Scrollbar from '../../components/scrollbar/scrollbar.jsx'
import { useParams } from 'react-router-dom'
import blogs from '../../api/blogs.js'
import BlogSingle from '../../components/BlogDetails/BlogSingle.jsx'
import Footer from '../../components/footer/Footer.jsx';


const BlogDetails =() => {

    const { slug } = useParams()

    const BlogDetails = blogs.find(item => item.slug === slug)

    return(
        <Fragment>
            <Navbar2/>
            <PageTitle pageTitle={BlogDetails.title} pagesub={'Blog'}/> 
             <BlogSingle/>
             <Footer/>
            <Scrollbar/>
        </Fragment>
    )
};
export default BlogDetails;
