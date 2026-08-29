import React, {Fragment} from 'react';
import Navbar2 from '../../components/Navbar2/Navbar2.jsx';
import PageTitle from '../../components/pagetitle/PageTitle.jsx'
import Scrollbar from '../../components/scrollbar/scrollbar.jsx'
import BlogSingle from '../../components/BlogDetails/BlogSingle.jsx'
import Footer from '../../components/footer/Footer.jsx';


const BlogDetails =() => {

    return(
        <Fragment>
            <Navbar2/>
            <PageTitle pageTitle={'Latest News'} pagesub={'Blog'}/> 
             <BlogSingle/>
             <Footer/>
            <Scrollbar/>
        </Fragment>
    )
};
export default BlogDetails;
