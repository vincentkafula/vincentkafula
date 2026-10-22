import React, {Fragment} from 'react';
import Navbar2 from '../../components/Navbar2/Navbar2';
import PageTitle from '../../components/pagetitle/PageTitle'
import Contactpage from '../../components/Contactpage/Contactpage'
import Scrollbar from '../../components/scrollbar/scrollbar'
import Footer from '../../components/footer/Footer';
import Seo from '../../components/Seo/Seo';

const ContactPage =() => {
    return(
        <Fragment>
            <Navbar2/>
            <Seo title="Contact and Public Engagement" description="Contact Vincent Kafula with questions, feedback on the Build One Zambia proposals or media enquiries." />
            <PageTitle pageTitle={'Contact'} pagesub={'Contact'}/> 
            <Contactpage/>
            <Footer/>
            <Scrollbar/>
        </Fragment>
    )
};
export default ContactPage;

