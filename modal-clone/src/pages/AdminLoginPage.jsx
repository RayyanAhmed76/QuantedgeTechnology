import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { adminCaptchaConfig, adminLogin, adminMe } from '../lib/api'
import { firstErrorKey, validateAdminLogin } from '../lib/formValidation'
import FieldError from '../components/FieldError'

const TURNSTILE_SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

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

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)
  const [authed, setAuthed] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [pending, setPending] = useState(false)
  const [captchaSiteKey, setCaptchaSiteKey] = useState('')
  const [captchaRequired, setCaptchaRequired] = useState(false)
  const [captchaToken, setCaptchaToken] = useState('')
  const captchaHostRef = useRef(null)
  const widgetIdRef = useRef(null)

  useEffect(() => {
    let alive = true
    adminMe()
      .then(() => {
        if (alive) setAuthed(true)
      })
      .catch(() => {
        if (alive) setAuthed(false)
      })
      .finally(() => {
        if (alive) setChecking(false)
      })
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    let alive = true
    adminCaptchaConfig()
      .then((data) => {
        if (!alive) return
        setCaptchaSiteKey(data.siteKey || '')
        setCaptchaRequired(Boolean(data.enabled && data.siteKey))
      })
      .catch(() => {
        if (!alive) return
        setCaptchaSiteKey(import.meta.env.VITE_TURNSTILE_SITE_KEY || '')
        setCaptchaRequired(Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY))
      })
    return () => {
      alive = false
    }
  }, [])

  const resetCaptcha = useCallback(() => {
    setCaptchaToken('')
    if (widgetIdRef.current != null && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current)
    }
  }, [])

  useEffect(() => {
    if (!captchaSiteKey || !captchaHostRef.current) return undefined
    let cancelled = false

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !captchaHostRef.current || !window.turnstile) return
        if (widgetIdRef.current != null) {
          window.turnstile.remove(widgetIdRef.current)
          widgetIdRef.current = null
        }
        widgetIdRef.current = window.turnstile.render(captchaHostRef.current, {
          sitekey: captchaSiteKey,
          theme: 'dark',
          callback: (token) => setCaptchaToken(token),
          'expired-callback': () => setCaptchaToken(''),
          'error-callback': () => setCaptchaToken(''),
        })
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Captcha failed to load')
      })

    return () => {
      cancelled = true
      if (widgetIdRef.current != null && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [captchaSiteKey])

  function clearField(name) {
    setFieldErrors((current) => {
      if (!current[name]) return current
      const next = { ...current }
      delete next[name]
      return next
    })
  }

  async function onSubmit(event) {
    event.preventDefault()
    setError('')
    const result = validateAdminLogin({ email, password })
    setFieldErrors(result.errors)
    if (!result.ok) {
      const key = firstErrorKey(result.errors)
      event.currentTarget.querySelector(`[name="${key}"]`)?.focus()
      return
    }

    if (captchaRequired && !captchaToken) {
      setError('Please complete the captcha')
      return
    }

    setPending(true)
    try {
      await adminLogin(result.values.email, result.values.password, captchaToken)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed')
      resetCaptcha()
    } finally {
      setPending(false)
    }
  }

  if (checking) {
    return (
      <main className="admin-page admin-login-page">
        <div className="admin-login-shell">
          <Link to="/" className="admin-login-home">
            ← Back to home
          </Link>
          <p className="admin-muted">Checking session…</p>
        </div>
      </main>
    )
  }

  if (authed) return <Navigate to="/admin" replace />

  return (
    <main className="admin-page admin-login-page">
      <div className="admin-login-shell">
        <Link to="/" className="admin-login-home">
          ← Back to home
        </Link>
        <form className="admin-login-card" onSubmit={onSubmit} noValidate>
          <p className="admin-eyebrow">Admin</p>
          <h1>Sign in</h1>
          <p className="admin-muted">View form submissions and career resumes.</p>

        <label className={fieldErrors.email ? 'has-error' : undefined}>
          Email
          <input
            name="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              clearField('email')
            }}
            autoComplete="username"
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'admin-email-error' : undefined}
          />
          <FieldError id="admin-email-error" message={fieldErrors.email} />
        </label>
        <label className={fieldErrors.password ? 'has-error' : undefined}>
          Password
          <span className="admin-password-field">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                clearField('password')
              }}
              autoComplete="current-password"
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? 'admin-password-error' : undefined}
            />
            <button
              type="button"
              className="admin-password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M1 12.5C2.7 8.1 7 5 12 5s9.3 3.1 11 7.5c-1.7 4.4-6 7.5-11 7.5S2.7 16.9 1 12.5Z" />
                  <circle cx="12" cy="12.5" r="3" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M3 3l18 18" strokeLinecap="round" />
                  <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" strokeLinecap="round" />
                  <path d="M9.9 5.1A10 10 0 0 1 12 5c5 0 9.3 3.1 11 7.5a11.7 11.7 0 0 1-4.2 5.1" strokeLinecap="round" />
                  <path d="M6.1 6.1A11.7 11.7 0 0 0 1 12.5C2.7 16.9 7 20 12 20c1.4 0 2.7-.3 3.9-.7" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </span>
          <FieldError id="admin-password-error" message={fieldErrors.password} />
        </label>

        {captchaSiteKey ? (
          <div className="admin-captcha" aria-label="Captcha">
            <div ref={captchaHostRef} />
          </div>
        ) : null}

        {error ? <p className="form-error">{error}</p> : null}

        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      </div>
    </main>
  )
}
