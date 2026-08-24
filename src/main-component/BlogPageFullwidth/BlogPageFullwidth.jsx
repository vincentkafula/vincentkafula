import React, {Fragment} from 'react';
import Navbar2 from '../../components/Navbar2/Navbar2.jsx';
import PageTitle from '../../components/pagetitle/PageTitle.jsx'
import BlogList from '../../components/BlogList/BlogList.jsx'
import Scrollbar from '../../components/scrollbar/scrollbar.jsx'
import Footer from '../../components/footer/Footer.jsx';

const BlogPageFullwidth =() => {
    return(
        <Fragment>
            <Navbar2/>
            <PageTitle pageTitle={'Latest News'} pagesub={'Blog'}/> 
            <BlogList blLeft={'d-none'} blRight={'col-lg-10 offset-lg-1'}/>
            <Footer/>
            <Scrollbar/>
        </Fragment>
    )
};
export default BlogPageFullwidth;

