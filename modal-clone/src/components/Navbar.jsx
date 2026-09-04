import Logo from './Logo'
import TransitionLink from './TransitionLink'
import { NAV } from '../data/site'

export default function Navbar() {
  return (
    <header className="nav-wrap">
      <nav className="nav">
        <TransitionLink to="/" className="logo-link">
          <Logo />
        </TransitionLink>
        <ul className="nav-links">
          {NAV.map((item) => (
            <li key={item.label}>
              <TransitionLink to={item.to}>{item.label}</TransitionLink>
            </li>
          ))}
        </ul>
        <div className="nav-right">
          <TransitionLink to="/contact" className="btn btn-nav">
            Contact Us
          </TransitionLink>
        </div>
      </nav>
    </header>
  )
}
