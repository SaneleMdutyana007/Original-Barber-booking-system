import { Routes, Route, Outlet } from 'react-router-dom'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import StickyMobileCTA from '@/components/StickyMobileCTA'
import CookieBanner from '@/components/CookieBanner'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import ErrorBoundary from '@/components/ErrorBoundary'
import { ToastProvider } from '@/components/ui/Toast'
import { RequireAuth, RequireAdmin, RequireClient } from '@/components/ProtectedRoute'
import AdminLayout from '@/components/AdminLayout'

import Home from '@/pages/Home'
import Services from '@/pages/Services'
import ServiceDetail from '@/pages/ServiceDetail'
import Barbers from '@/pages/Barbers'
import Book from '@/pages/Book'
import ThankYou from '@/pages/ThankYou'
import Dashboard from '@/pages/Dashboard'
import CaseStudies from '@/pages/CaseStudies'
import CaseStudyDetail from '@/pages/CaseStudyDetail'
import FAQs from '@/pages/FAQs'
import Reviews from '@/pages/Reviews'
import Contact from '@/pages/Contact'
import PrivacyPolicy from '@/pages/PrivacyPolicy'
import Login from '@/pages/Login'
import Signup from '@/pages/Signup'
import NotFound from '@/pages/NotFound'

import AdminBookings from '@/pages/admin/AdminBookings'
import AdminCalendar from '@/pages/admin/AdminCalendar'
import AdminRequests from '@/pages/admin/AdminRequests'
import AdminServices from '@/pages/admin/AdminServices'
import AdminBarbers from '@/pages/admin/AdminBarbers'
import AdminAvailability from '@/pages/admin/AdminAvailability'
import AdminReviews from '@/pages/admin/AdminReviews'
import AdminCaseStudies from '@/pages/admin/AdminCaseStudies'
import AdminFAQs from '@/pages/admin/AdminFAQs'
import AdminMFA from '@/pages/admin/AdminMFA'

function PublicShell() {
  return (
    <>
      <SiteHeader />
      <main><Outlet /></main>
      <SiteFooter />
      <StickyMobileCTA />
    </>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <GoogleAnalytics />
      <ErrorBoundary>
        <Routes>
          <Route element={<PublicShell />}>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:slug" element={<ServiceDetail />} />
            <Route path="/barbers" element={<Barbers />} />
            <Route path="/case-studies" element={<CaseStudies />} />
            <Route path="/case-studies/:slug" element={<CaseStudyDetail />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route path="/book" element={<RequireAuth><Book /></RequireAuth>} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/dashboard" element={<RequireClient><Dashboard /></RequireClient>} />

            <Route path="/admin/mfa-setup" element={<RequireAdmin><AdminMFA /></RequireAdmin>} />
            <Route path="/admin" element={<RequireAdmin><AdminLayout><Outlet /></AdminLayout></RequireAdmin>}>
              <Route index element={<AdminBookings />} />
              <Route path="calendar" element={<AdminCalendar />} />
              <Route path="requests" element={<AdminRequests />} />
              <Route path="services" element={<AdminServices />} />
              <Route path="barbers" element={<AdminBarbers />} />
              <Route path="availability" element={<AdminAvailability />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="case-studies" element={<AdminCaseStudies />} />
              <Route path="faqs" element={<AdminFAQs />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ErrorBoundary>
      <CookieBanner />
    </ToastProvider>
  )
}