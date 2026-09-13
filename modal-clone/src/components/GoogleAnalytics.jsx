import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  COOKIE_CONSENT_CHANGE_EVENT,
  GA_MEASUREMENT_ID,
  analyticsAllowed,
  readCookieConsent,
} from '../lib/cookie-consent'

function ensureGtag(measurementId) {
  if (typeof window === 'undefined' || !measurementId) return

  window.dataLayer = window.dataLayer || []
  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag() {
      window.dataLayer.push(arguments)
    }
  }

  const scriptId = 'ga-gtag-src'
  if (!document.getElementById(scriptId)) {
    const script = document.createElement('script')
    script.id = scriptId
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
    document.head.appendChild(script)
  }

  if (!window.__qedsGaConfigured) {
    window.gtag('js', new Date())
    window.gtag('config', measurementId, {
      anonymize_ip: true,
      send_page_view: false,
    })
    window.__qedsGaConfigured = true
  }
}

function trackPageView(measurementId, pathname, search) {
  if (typeof window?.gtag !== 'function' || !measurementId) return
  window.gtag('event', 'page_view', {
    page_path: `${pathname}${search || ''}`,
    page_location: window.location.href,
    page_title: document.title,
  })
}

export default function GoogleAnalytics() {
  const { pathname, search } = useLocation()
  const [enabled, setEnabled] = useState(false)
  const lastPathRef = useRef('')

  useEffect(() => {
    const sync = (value) => {
      setEnabled(analyticsAllowed(value ?? readCookieConsent()))
    }

    sync()

    const onChange = (event) => {
      sync(event.detail ?? readCookieConsent())
    }

    window.addEventListener(COOKIE_CONSENT_CHANGE_EVENT, onChange)
    return () => window.removeEventListener(COOKIE_CONSENT_CHANGE_EVENT, onChange)
  }, [])

  useEffect(() => {
    if (!enabled || !GA_MEASUREMENT_ID) return

    ensureGtag(GA_MEASUREMENT_ID)

    const pathKey = `${pathname}${search || ''}`
    if (lastPathRef.current === pathKey) return
    lastPathRef.current = pathKey
    trackPageView(GA_MEASUREMENT_ID, pathname, search)
  }, [enabled, pathname, search])

  return null
}
