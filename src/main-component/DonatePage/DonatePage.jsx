import React from 'react'
import Navbar2 from '../../components/Navbar2/Navbar2'
import PageTitle from '../../components/pagetitle/PageTitle'
import Footer from '../../components/footer/Footer'
import Scrollbar from '../../components/scrollbar/scrollbar'
import DonationForm from '../../components/DonationForm/DonationForm'

const DonatePage = (props) => {

    return (
        <div className="donate-page">
            <Navbar2 />
            <PageTitle pageTitle={'Support the Campaign'} pagesub={'Donate'} />
            <div className="wpo-donation-page-area section-padding">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <div className="wpo-donate-header">
                                <h2>Make a Donation</h2>
                            </div>
                            <DonationForm />
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
            <Scrollbar />
        </div>

    )
}

export default DonatePage;