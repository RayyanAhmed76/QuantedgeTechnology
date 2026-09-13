import Logo from './Logo'
import TransitionLink from './TransitionLink'
import { openCookieConsent } from '../lib/cookie-consent'
import { BRAND, FOOTER_COLS, FOOTER_SOCIALS } from '../data'

function SocialGlyph({ id, icon }) {
  if (id === 'instagram') {
    return (
      <svg
        className="social-icon"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="3.5"
          y="3.5"
          width="17"
          height="17"
          rx="5"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <circle
          cx="12"
          cy="12"
          r="4.1"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <circle cx="17.35" cy="6.65" r="1.15" fill="currentColor" />
      </svg>
    )
  }

  return icon
}

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Logo size={34} />
          <p className="footer-tag">
            <span className="accent">Build. Analyze. Grow.</span>
          </p>
          <div className="socials">
            {FOOTER_SOCIALS.map(({ id, label, icon, href }) => (
              <a
                className="social"
                key={id}
                href={href}
                aria-label={label}
                {...(href && href !== '#'
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
              >
                <SocialGlyph id={id} icon={icon} />
              </a>
            ))}
          </div>
          <p className="copyright">© {BRAND} 2026</p>
          <button
            type="button"
            className="footer-cookie-btn"
            onClick={openCookieConsent}
          >
            Cookie settings
          </button>
        </div>
        <div className="footer-cols">
          {Object.entries(FOOTER_COLS).map(([head, items]) => (
            <div className="footer-col" key={head}>
              <h4>{head}</h4>
              <ul>
                {items.map((item) => (
                  <li key={item.to}>
                    <TransitionLink to={item.to}>{item.label}</TransitionLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}
