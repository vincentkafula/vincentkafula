import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Homepage from '../HomePage/HomePage'
import AboutPage from '../AboutPage/AboutPage';
import CampaignPage from '../CampaignPage/CampaignPage';
import CampaignPageS2 from '../CampaignPageS2/CampaignPageS2';
import CampaignPageS3 from '../CampaignPageS3/CampaignPageS3';
import CampaignSinglePage from '../CampaignSinglePage/CampaignSinglePage';
import TestimonialPage from '../TestimonialPage/TestimonialPage';
import TeamPage from '../TeamPage/TeamPage';
import TeamSinglePage from '../TeamSinglePage/TeamSinglePage';
import ServicePage from '../ServicePage/ServicePage';
import ServiceSinglePage from '../ServiceSinglePage/ServiceSinglePage';
import GalleryPage from '../GalleryPage/GalleryPage';
import ShopPage from '../ShopPage'
import ProductSinglePage from '../ProductSinglePage';
import CartPage from '../CartPage';
import CheckoutPage from '../CheckoutPage';
import OrderRecived from '../OrderRecived';
import BlogPage from '../BlogPage/BlogPage'
import BlogPageLeft from '../BlogPageLeft/BlogPageLeft'
import BlogPageFullwidth from '../BlogPageFullwidth/BlogPageFullwidth'
import BlogDetails from '../BlogDetails/BlogDetails'
import BlogDetailsFull from '../BlogDetailsFull/BlogDetailsFull'
import BlogDetailsLeftSiide from '../BlogDetailsLeftSiide/BlogDetailsLeftSiide'
import ContactPage from '../ContactPage/ContactPage';
import ErrorPage from '../ErrorPage/ErrorPage';
import LoginPage from '../LoginPage';
import DashboardPage from '../DashboardPage';
import RegistrationPage from '../RegistrationPage/RegistrationPage';
// Registration forms carry the full ECZ polling-station list, so they load on demand.
const loadForm = (name) => lazy(() => import('../RegistrationPage/RegistrationForms').then((m) => ({ default: m[name] })));
const MembershipForm = loadForm('MembershipForm');
const CooperativeForm = loadForm('CooperativeForm');
const InternshipForm = loadForm('InternshipForm');
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
import ManifestoWatchPage from '../ManifestoWatchPage/ManifestoWatchPage';
import TrackOrderPage from '../TrackOrderPage';
import TermsPage from '../TermsPage/TermsPage';


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
          <Route path="campaign-2" element={<CampaignPageS2 />} />
          <Route path="campaign-3" element={<CampaignPageS3 />} />
          <Route path="campaign-single/:slug" element={<CampaignSinglePage />} />
          <Route path="service" element={<ServicePage />} />
          <Route path="service-single/:slug" element={<ServiceSinglePage />} />
          <Route path="testimonial" element={<TestimonialPage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="team-single/:slug" element={<TeamSinglePage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path='product-single/:slug' element={<ProductSinglePage/>} />
          <Route path='cart' element={<CartPage/>} />
          <Route path='checkout' element={<CheckoutPage/>} />
          <Route path='order_received' element={<OrderRecived/>} />
          <Route path='faq' element={<FaqPage/>} />
          <Route path='volunteer' element={<Suspense fallback={<div />}><VolunteerPage/></Suspense>} />
          <Route path='donate' element={<DonatePage/>} />
          <Route path='contact' element={<ContactPage/>}/>
          <Route path='blog' element={<BlogPage />} />
          <Route path='blog-left-sidebar' element={<BlogPageLeft />} />
          <Route path='blog-fullwidth' element={<BlogPageFullwidth />} />
          <Route path='blog-single/:slug' element={<BlogDetails />} />
          <Route path='blog-single-left-sidebar/:slug' element={<BlogDetailsLeftSiide />} />
          <Route path='blog-single-fullwidth/:slug' element={<BlogDetailsFull />} />
          <Route path='manifesto-watch' element={<ManifestoWatchPage />} />
          <Route path='track-order' element={<TrackOrderPage />} />
          <Route path='privacy' element={<PrivacyPage />} />
          <Route path='terms' element={<TermsPage />} />
          <Route path='404' element={<ErrorPage/>}/> 
          <Route path='login' element={<LoginPage />} />
          <Route path='dashboard/:role' element={<DashboardPage />} />
          <Route path='register' element={<RegistrationPage />} />
          <Route path='register/membership' element={<Suspense fallback={<div />}><MembershipForm /></Suspense>} />
          <Route path='register/cooperative' element={<Suspense fallback={<div />}><CooperativeForm /></Suspense>} />
          <Route path='register/internship' element={<Suspense fallback={<div />}><InternshipForm /></Suspense>} />
          <Route path='forgot-password' element={<ForgotPassword />} />
          <Route path='reset-password/:token' element={<ResetPasswordPage />} />
          <Route path='account-settings' element={<RequireAuth><AccountSettingsPage /></RequireAuth>} />
          <Route path='admin/accounts' element={<RequireRole roles={['head-office']}><AccountManagementPage /></RequireRole>} />
          <Route path='news' element={<NewsPage />} />
          <Route path='news/:slug' element={<NewsSinglePage />} />
        </Routes>
      </BrowserRouter>

    </div>
  );
}

export default AllRoute;
