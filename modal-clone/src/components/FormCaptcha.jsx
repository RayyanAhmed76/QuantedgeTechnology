import { useEffect, useRef, useState } from 'react'

const TURNSTILE_SCRIPT =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

function loadTurnstileScript() {
  if (window.turnstile) return Promise.resolve()
  const existing = document.querySelector('script[data-turnstile]')
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Failed to load captcha')))
    })
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = TURNSTILE_SCRIPT
    script.async = true
    script.dataset.turnstile = 'true'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load captcha'))
    document.head.appendChild(script)
  })
}

/**
 * Optional Cloudflare Turnstile for public forms.
 * Renders only when /api/submissions/captcha-config says enabled (PUBLIC_FORM_CAPTCHA=1).
 */
export default function FormCaptcha({ onTokenChange }) {
  const hostRef = useRef(null)
  const widgetIdRef = useRef(null)
  const onTokenRef = useRef(onTokenChange)
  const [enabled, setEnabled] = useState(false)
  const [siteKey, setSiteKey] = useState('')

  useEffect(() => {
    onTokenRef.current = onTokenChange
  }, [onTokenChange])

  useEffect(() => {
    let cancelled = false
    fetch('/api/submissions/captcha-config')
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        setEnabled(Boolean(data?.enabled && data?.siteKey))
        setSiteKey(data?.siteKey || '')
      })
      .catch(() => {
        if (!cancelled) setEnabled(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!enabled || !siteKey || !hostRef.current) return undefined
    let cancelled = false

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !hostRef.current || !window.turnstile) return
        if (widgetIdRef.current != null) {
          window.turnstile.remove(widgetIdRef.current)
          widgetIdRef.current = null
        }
        widgetIdRef.current = window.turnstile.render(hostRef.current, {
          sitekey: siteKey,
          theme: 'dark',
          callback: (token) => onTokenRef.current?.(token || ''),
          'expired-callback': () => onTokenRef.current?.(''),
          'error-callback': () => onTokenRef.current?.(''),
        })
      })
      .catch(() => onTokenRef.current?.(''))

    return () => {
      cancelled = true
      if (widgetIdRef.current != null && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [enabled, siteKey])

  if (!enabled) return null

  return <div className="form-captcha" ref={hostRef} aria-label="Captcha" />
}
