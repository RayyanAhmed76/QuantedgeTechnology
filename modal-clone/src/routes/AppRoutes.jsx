import { Routes, Route } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import SimplePage from '../pages/SimplePage'
import PrivacyPage from '../pages/PrivacyPage'
import CookiePolicyPage from '../pages/CookiePolicyPage'
import AboutPage from '../pages/AboutPage'
import ContactPage from '../pages/ContactPage'
import CareerPage from '../pages/CareerPage'
import ServicePage from '../pages/ServicePage'
import ServicesPage from '../pages/ServicesPage'
import AdminLoginPage from '../pages/AdminLoginPage'
import AdminInboxPage from '../pages/AdminInboxPage'
import NotFoundPage from '../pages/NotFoundPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/services/:slug" element={<ServicePage />} />
      <Route path="/career" element={<CareerPage />} />
      <Route path="/terms" element={<SimplePage title="Terms and Conditions" />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/cookie-policy" element={<CookiePolicyPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminInboxPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
