import { useEffect, useState } from 'react'
import TransitionLink from './TransitionLink'
import {
  COOKIE_CONSENT_OPEN_EVENT,
  readCookieConsent,
  writeCookieConsent,
} from '../lib/cookie-consent'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [ready, setReady] = useState(false)
  const [managing, setManaging] = useState(false)
  const [analyticsOn, setAnalyticsOn] = useState(false)

  useEffect(() => {
    const existing = readCookieConsent()
    setVisible(!existing)
    setAnalyticsOn(existing === 'accepted')
    setReady(true)

    const onOpen = () => {
      const current = readCookieConsent()
      setAnalyticsOn(current === 'accepted')
      setManaging(false)
      setVisible(true)
    }
    window.addEventListener(COOKIE_CONSENT_OPEN_EVENT, onOpen)
    return () => window.removeEventListener(COOKIE_CONSENT_OPEN_EVENT, onOpen)
  }, [])

  function choose(value) {
    writeCookieConsent(value)
    setManaging(false)
    setVisible(false)
  }

  function saveManagedPreferences() {
    choose(analyticsOn ? 'accepted' : 'essential')
  }

  if (!ready || !visible) return null

  return (
    <div
      className={`cookie-consent${managing ? ' is-managing' : ''}`}
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-live="polite"
    >
      <div className="cookie-consent-inner">
        <div className="cookie-consent-copy">
          <p id="cookie-consent-title" className="cookie-consent-title">
            {managing ? 'Manage cookie preferences' : 'We use cookies'}
          </p>
          <p className="cookie-consent-text">
            {managing ? (
              <>
                Choose which cookies to allow. Essential cookies stay on so the
                site can work. Analytics cookies (Google Analytics) load only if
                you enable them or choose Accept all. See our{' '}
                <TransitionLink to="/cookie-policy" className="cookie-consent-link">
                  Cookie Policy
                </TransitionLink>
                .
              </>
            ) : (
              <>
                We use essential cookies to run this site and, if you agree,
                Google Analytics cookies to understand traffic. You can accept
                all, reject non-essential cookies, or manage preferences. Details
                are in our{' '}
                <TransitionLink to="/cookie-policy" className="cookie-consent-link">
                  Cookie Policy
                </TransitionLink>
                .
              </>
            )}
          </p>

          {managing ? (
            <ul className="cookie-consent-prefs">
              <li className="cookie-consent-pref">
                <div className="cookie-consent-pref-copy">
                  <p className="cookie-consent-pref-label">
                    Essential cookies
                    <span className="cookie-consent-pref-badge">Always on</span>
                  </p>
                  <p className="cookie-consent-pref-desc">
                    Required for security, network management, and core site
                    functionality.
                  </p>
                </div>
                <label className="cookie-consent-switch">
                  <input type="checkbox" checked disabled readOnly />
                  <span className="cookie-consent-switch-ui" aria-hidden="true" />
                  <span className="sr-only">Essential cookies always enabled</span>
                </label>
              </li>
              <li className="cookie-consent-pref">
                <div className="cookie-consent-pref-copy">
                  <p className="cookie-consent-pref-label">
                    Analytics cookies
                    <span
                      className={`cookie-consent-pref-badge${analyticsOn ? '' : ' cookie-consent-pref-badge--off'}`}
                    >
                      {analyticsOn ? 'On' : 'Off'}
                    </span>
                  </p>
                  <p className="cookie-consent-pref-desc">
                    Google Analytics helps us measure visits and page usage so we
                    can improve the site. Loaded only with your consent.
                  </p>
                </div>
                <label className="cookie-consent-switch">
                  <input
                    type="checkbox"
                    checked={analyticsOn}
                    onChange={(event) => setAnalyticsOn(event.target.checked)}
                  />
                  <span className="cookie-consent-switch-ui" aria-hidden="true" />
                  <span className="sr-only">Enable analytics cookies</span>
                </label>
              </li>
            </ul>
          ) : null}
        </div>

        <div className="cookie-consent-actions">
          {managing ? (
            <>
              <button
                type="button"
                className="btn cookie-consent-reject"
                onClick={() => setManaging(false)}
              >
                Back
              </button>
              <button
                type="button"
                className="btn btn-primary cookie-consent-accept"
                onClick={saveManagedPreferences}
              >
                Save preferences
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn cookie-consent-reject"
                onClick={() => choose('rejected')}
              >
                Reject all cookies
              </button>
              <button
                type="button"
                className="btn cookie-consent-manage"
                onClick={() => setManaging(true)}
              >
                Manage cookies
              </button>
              <button
                type="button"
                className="btn btn-primary cookie-consent-accept"
                onClick={() => choose('accepted')}
              >
                Accept all cookies
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
