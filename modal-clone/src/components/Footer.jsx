import Logo from './Logo'
import TransitionLink from './TransitionLink'
import { BRAND, FOOTER_COLS } from '../data'

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
            {['𝕏', 'in', '#', '◗', '▶'].map((icon) => (
              <span className="social" key={icon}>
                {icon}
              </span>
            ))}
          </div>
          <p className="copyright">© {BRAND} 2026</p>
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
