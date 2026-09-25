import { useEffect, useState } from 'react'
import Aurora from '../../components/Aurora'
import LightRays from '../../components/LightRays'

const MOBILE_MQ = '(max-width: 900px)'

function getIsMobile() {
  if (typeof window === 'undefined') return false
  return window.matchMedia(MOBILE_MQ).matches
}

export default function Hero() {
  const [webglOk, setWebglOk] = useState(false)
  const [isMobile, setIsMobile] = useState(getIsMobile)

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ)
    const sync = () => {
      setIsMobile(mq.matches)
      setWebglOk(false)
    }
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  return (
    <section className="hero">
      <div
        className={`hero-media${webglOk ? ' is-webgl' : ''}${isMobile ? ' is-mobile' : ''}`}
        aria-hidden="true"
      >
        {/* CSS glow only on mobile under LightRays — never on laptop/tablet/desktop */}
        {isMobile && (
          <div className="hero-glow">
            <span className="hero-glow-orb hero-glow-orb--a" />
            <span className="hero-glow-orb hero-glow-orb--b" />
            <span className="hero-glow-orb hero-glow-orb--c" />
          </div>
        )}

        {isMobile ? (
          <div className="hero-rays">
            <LightRays
              raysOrigin="top-center"
              raysColor="#d2ff00"
              raysSpeed={1}
              lightSpread={1.1}
              rayLength={2.2}
              followMouse={false}
              mouseInfluence={0}
              noiseAmount={0}
              distortion={0}
              className="hero-light-rays"
              pulsating={false}
              fadeDistance={1.3}
              saturation={1.25}
              intensity={1.35}
              onReady={() => setWebglOk(true)}
              onError={() => setWebglOk(false)}
            />
          </div>
        ) : (
          <div className="hero-aurora">
            <Aurora
              colorStops={['#d2ff00', '#6f7a3a', '#b8e600']}
              blend={0.5}
              amplitude={1.05}
              speed={1.15}
              onReady={() => setWebglOk(true)}
              onError={() => setWebglOk(false)}
            />
          </div>
        )}

        <div className="hero-overlay" />
      </div>

      <div className="hero-inner">
        <h1>
          Build, analyze,<br />
          and grow your<br />
          <span className="accent">digital business.</span>
        </h1>
        <p className="hero-sub">
          We design custom software, unlock insights from your data, and drive
          measurable
          <br className="hero-sub-break" />
          {' '}growth so you can focus on running the business, not the tech.
        </p>
        <div className="hero-cta">
          <a href="#contact" className="btn btn-primary">Get Started</a>
          <a href="#services" className="btn btn-ghost">Our Services</a>
        </div>
      </div>
    </section>
  )
}
