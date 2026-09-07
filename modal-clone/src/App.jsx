import { BrowserRouter, useLocation } from 'react-router-dom'
import { ReactLenis } from 'lenis/react'

import './lib/gsap'
import TransitionProvider from './providers/TransitionProvider'
import LenisScrollSync from './providers/LenisScrollSync'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AppRoutes from './routes/AppRoutes'

function Shell() {
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')

  if (isAdmin) {
    return <AppRoutes />
  }

  return (
    <TransitionProvider>
      <ReactLenis root options={{ autoRaf: true }}>
        <LenisScrollSync />
        <div className="app">
          <Navbar />
          <AppRoutes />
          <Footer />
        </div>
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
