import React, {Fragment} from 'react';
import PageTitle from '../../components/pagetitle/PageTitle.jsx'
import BlogList from '../../components/BlogList/BlogList.jsx'
import Navbar2 from '../../components/Navbar2/Navbar2.jsx';
import Footer from '../../components/footer/Footer.jsx';
import Scrollbar from '../../components/scrollbar/scrollbar.jsx'

const BlogPage =() => {
    return(
        <Fragment>
            <Navbar2/>
            <PageTitle pageTitle={'Latest News'} pagesub={'Blog'}/> 
            <BlogList/>
            <Footer/>
            <Scrollbar/>
        </Fragment>
    )
};
export default BlogPage;

