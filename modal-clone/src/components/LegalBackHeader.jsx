import { usePageTransition } from '../providers/TransitionProvider'

const RETURN_KEY = 'qe-return-to'
const LEGAL_PATHS = ['/privacy', '/cookie-policy']

function resolveReturnPath() {
  const stored = sessionStorage.getItem(RETURN_KEY)
  if (stored && !LEGAL_PATHS.some((path) => stored === path || stored.startsWith(`${path}?`))) {
    return stored
  }

  const referrer = document.referrer
  if (referrer) {
    try {
      const url = new URL(referrer)
      if (
        url.origin === window.location.origin &&
        !LEGAL_PATHS.some((path) => url.pathname === path)
      ) {
        return url.pathname + url.search
      }
    } catch {
      // ignore invalid referrer
    }
  }

  return '/'
}

export default function LegalBackHeader({ title }) {
  const { transitionTo } = usePageTransition()

  return (
    <header className="legal-header">
      <div className="legal-topbar">
        <button
          type="button"
          className="legal-back"
          onClick={() => {
            void transitionTo(resolveReturnPath())
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M15 6 9 12l6 6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Back</span>
        </button>
      </div>

      <p className="legal-eyebrow">
        <span aria-hidden="true">✦</span> Legal
      </p>
      <h1>{title}</h1>
    </header>
  )
}
