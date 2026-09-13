const COOKIE_CONSENT_KEY = 'qeds-cookie-consent'
export const COOKIE_CONSENT_OPEN_EVENT = 'qeds:cookie-consent-open'
export const COOKIE_CONSENT_CHANGE_EVENT = 'qeds:cookie-consent-change'

export const GA_MEASUREMENT_ID =
  (import.meta.env.VITE_GA_ID || 'G-1VQ1BXKQFW').trim()

export function readCookieConsent() {
  if (typeof window === 'undefined') return null
  try {
    const value = window.localStorage.getItem(COOKIE_CONSENT_KEY)
    if (value === 'accepted' || value === 'rejected' || value === 'essential') {
      return value
    }
  } catch {
    /* private mode / blocked storage */
  }
  return null
}

export function writeCookieConsent(value) {
  try {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, value)
  } catch {
    /* ignore */
  }
  window.dispatchEvent(
    new CustomEvent(COOKIE_CONSENT_CHANGE_EVENT, { detail: value }),
  )
}

export function openCookieConsent() {
  window.dispatchEvent(new Event(COOKIE_CONSENT_OPEN_EVENT))
}

export function analyticsAllowed(value) {
  return value === 'accepted'
}
