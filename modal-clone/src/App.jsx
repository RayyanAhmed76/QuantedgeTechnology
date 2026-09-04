import { BrowserRouter, Routes, Route } from 'react-router-dom'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ReactLenis } from 'lenis/react'

import TransitionProvider from './providers/TransitionProvider'
import LenisScrollSync from './providers/LenisScrollSync'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import SimplePage from './pages/SimplePage'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export default function App() {
  return (
    <BrowserRouter>
      <TransitionProvider>
        <ReactLenis root options={{ autoRaf: true }}>
          <LenisScrollSync />
          <div className="app">
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<SimplePage title="About" />} />
              <Route path="/contact" element={<SimplePage title="Contact" />} />
              <Route path="/career" element={<SimplePage title="Career" />} />
              <Route path="/consultant" element={<SimplePage title="Consultant" />} />
            </Routes>
            <Footer />
          </div>
        </ReactLenis>
      </TransitionProvider>
    </BrowserRouter>
  )
}
