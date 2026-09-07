import { Routes, Route } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import SimplePage from '../pages/SimplePage'
import AboutPage from '../pages/AboutPage'
import ContactPage from '../pages/ContactPage'
import CareerPage from '../pages/CareerPage'
import ServicePage from '../pages/ServicePage'
import AdminLoginPage from '../pages/AdminLoginPage'
import AdminInboxPage from '../pages/AdminInboxPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/services/:slug" element={<ServicePage />} />
      <Route path="/career" element={<CareerPage />} />
      <Route path="/terms" element={<SimplePage title="Terms and Conditions" />} />
      <Route path="/privacy" element={<SimplePage title="Privacy Policy" />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminInboxPage />} />
    </Routes>
  )
}
