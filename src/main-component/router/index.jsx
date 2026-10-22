import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Homepage from '../HomePage/HomePage'
import AboutPage from '../AboutPage/AboutPage';
import CampaignPage from '../CampaignPage/CampaignPage';
import CampaignSinglePage from '../CampaignSinglePage/CampaignSinglePage';
import ShopPage from '../ShopPage'
import ProductSinglePage from '../ProductSinglePage';
import CartPage from '../CartPage';
import CheckoutPage from '../CheckoutPage';
import OrderRecived from '../OrderRecived';
import BlogDetails from '../BlogDetails/BlogDetails'
import BlogDetailsFull from '../BlogDetailsFull/BlogDetailsFull'
import BlogDetailsLeftSiide from '../BlogDetailsLeftSiide/BlogDetailsLeftSiide'
import ContactPage from '../ContactPage/ContactPage';
import ErrorPage from '../ErrorPage/ErrorPage';
import LoginPage from '../LoginPage';
import DashboardPage from '../DashboardPage';
import SignUpPage from '../SignUpPage';
import ForgotPassword from '../ForgotPassword';
import ResetPasswordPage from '../ResetPasswordPage';
import AccountSettingsPage from '../AccountSettingsPage';
import AccountManagementPage from '../AccountManagementPage';
import NewsPage from '../NewsPage';
import NewsSinglePage from '../NewsSinglePage';
import RequireAuth from '../../components/ops-dashboards/RequireAuth';
import RequireRole from '../../components/ops-dashboards/RequireRole';
import FaqPage from '../FaqPage';
const VolunteerPage = lazy(() => import('../VolunteerPage/VolunteerPage'));
import DonatePage from '../DonatePage/DonatePage';
import PrivacyPage from '../PrivacyPage/PrivacyPage';
import TermsPage from '../TermsPage/TermsPage';
import AdvocacyPage from '../AdvocacyPage/AdvocacyPage';
import { AdvocacySinglePage, InfrastructurePage, LegacyServiceRedirect } from '../AdvocacySinglePage/AdvocacySinglePage';
import ProposalsPage from '../ProposalsPage/ProposalsPage';
import ResourcesPage from '../ResourcesPage/ResourcesPage';
import SearchPage from '../SearchPage/SearchPage';


const AllRoute = () => {

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="home" element={<Homepage />} />
          <Route path="home2" element={<Navigate to="/" replace />} />
          <Route path="home3" element={<Navigate to="/" replace />} />
          <Route path="home4" element={<Navigate to="/" replace />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="campaign" element={<CampaignPage />} />
          <Route path="campaign-2" element={<Navigate to="/campaign" replace />} />
          <Route path="campaign-3" element={<Navigate to="/campaign" replace />} />
          <Route path="campaign-single/:slug" element={<CampaignSinglePage />} />
          <Route path="service" element={<Navigate to="/advocacy" replace />} />
          <Route path="advocacy" element={<AdvocacyPage />} />
          <Route path="advocacy/:slug" element={<AdvocacySinglePage />} />
          <Route path="infrastructure/:slug" element={<InfrastructurePage />} />
          <Route path="proposals" element={<ProposalsPage />} />
          <Route path="resources" element={<ResourcesPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="service-single/:slug" element={<LegacyServiceRedirect />} />
          <Route path="testimonial" element={<Navigate to="/about" replace />} />
          <Route path="gallery" element={<Navigate to="/" replace />} />
          <Route path="team" element={<Navigate to="/about" replace />} />
          <Route path="team-single/:slug" element={<Navigate to="/about" replace />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path='product-single/:slug' element={<ProductSinglePage/>} />
          <Route path='cart' element={<CartPage/>} />
          <Route path='checkout' element={<CheckoutPage/>} />
          <Route path='order_received' element={<OrderRecived/>} />
          <Route path='faq' element={<FaqPage/>} />
          <Route path='volunteer' element={<Suspense fallback={<div />}><VolunteerPage/></Suspense>} />
          <Route path='donate' element={<DonatePage/>} />
          <Route path='contact' element={<ContactPage/>}/>
          <Route path='blog' element={<Navigate to="/news" replace />} />
          <Route path='blog-left-sidebar' element={<Navigate to="/news" replace />} />
          <Route path='blog-fullwidth' element={<Navigate to="/news" replace />} />
          <Route path='blog-single/:slug' element={<BlogDetails />} />
          <Route path='blog-single-left-sidebar/:slug' element={<BlogDetailsLeftSiide />} />
          <Route path='blog-single-fullwidth/:slug' element={<BlogDetailsFull />} />
          <Route path='privacy' element={<PrivacyPage />} />
          <Route path='terms' element={<TermsPage />} />
          <Route path='404' element={<ErrorPage/>}/> 
          <Route path='login' element={<LoginPage />} />
          <Route path='dashboard/:role' element={<DashboardPage />} />
          <Route path='register' element={<SignUpPage />} />
          <Route path='forgot-password' element={<ForgotPassword />} />
          <Route path='reset-password/:token' element={<ResetPasswordPage />} />
          <Route path='account-settings' element={<RequireAuth><AccountSettingsPage /></RequireAuth>} />
          <Route path='admin/accounts' element={<RequireRole roles={['head-office']}><AccountManagementPage /></RequireRole>} />
          <Route path='news' element={<NewsPage />} />
          <Route path='news/:slug' element={<NewsSinglePage />} />
          <Route path='*' element={<ErrorPage/>} />
        </Routes>
      </BrowserRouter>

    </div>
  );
}

export default AllRoute;
