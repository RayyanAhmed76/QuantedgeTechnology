import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { adminLogin, adminMe } from '../lib/api'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)
  const [authed, setAuthed] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

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

  async function onSubmit(event) {
    event.preventDefault()
    setError('')
    setPending(true)
    try {
      await adminLogin(email, password)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setPending(false)
    }
  }

  if (checking) {
    return (
      <main className="admin-page">
        <p className="admin-muted">Checking session…</p>
      </main>
    )
  }

  if (authed) return <Navigate to="/admin" replace />

  return (
    <main className="admin-page admin-login-page">
      <form className="admin-login-card" onSubmit={onSubmit}>
        <p className="admin-eyebrow">Admin</p>
        <h1>Sign in</h1>
        <p className="admin-muted">View form submissions and career resumes.</p>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />
        </label>
        <label>
          Password
          <span className="admin-password-field">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
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
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  )
}
