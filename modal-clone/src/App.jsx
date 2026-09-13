import { BrowserRouter, useLocation } from 'react-router-dom'
import { ReactLenis } from 'lenis/react'

import './lib/gsap'
import TransitionProvider from './providers/TransitionProvider'
import PrivacyProvider from './providers/PrivacyProvider'
import LenisScrollSync from './providers/LenisScrollSync'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AutoScrollReveal from './components/AutoScrollReveal'
import CookieConsent from './components/CookieConsent'
import GoogleAnalytics from './components/GoogleAnalytics'
import DocumentTitle from './components/DocumentTitle'
import AppRoutes from './routes/AppRoutes'

function Shell() {
  const { pathname } = useLocation()
  const isAdmin = pathname === '/admin' || pathname === '/admin/login'

  if (isAdmin) {
    return (
      <>
        <DocumentTitle />
        <AppRoutes />
      </>
    )
  }

  return (
    <TransitionProvider>
      <ReactLenis root options={{ autoRaf: true }}>
        <PrivacyProvider>
          <LenisScrollSync />
          <DocumentTitle />
          <div className="app">
            <Navbar />
            <AppRoutes />
            <Footer />
          </div>
          <AutoScrollReveal />
          <CookieConsent />
          <GoogleAnalytics />
        </PrivacyProvider>
      </ReactLenis>
    </TransitionProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  )
}
