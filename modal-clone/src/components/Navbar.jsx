import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useLenis } from 'lenis/react'
import Logo from './Logo'
import TransitionLink from './TransitionLink'
import { NAV } from '../data'

const SERVICE_ICONS = {
  web: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M8 8 4.5 12 8 16M16 8l3.5 4L16 16" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m13 7-2 10" strokeLinecap="round" />
    </svg>
  ),
  data: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M4 19V9M10 19V5M16 19v-6M20 19V11" strokeLinecap="round" />
    </svg>
  ),
  growth: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M4 17 10 9l4 4 6-8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 5h4v4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
}

function pathMatches(pathname, to) {
  if (!to) return false
  if (to === '/') return pathname === '/'
  // Overview hub should not stay active on /services/:slug
  if (to === '/services') return pathname === '/services'
  return pathname === to || pathname.startsWith(`${to}/`)
}

export default function Navbar() {
  const { pathname } = useLocation()
  const [hidden, setHidden] = useState(false)
  const [openMenu, setOpenMenu] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false)
  /** Sub-item highlighted in the drawer (e.g. All Services) without navigating yet */
  const [mobileServiceFocus, setMobileServiceFocus] = useState(null)
  const dropdownRef = useRef(null)

  const servicesActive =
    pathname === '/services' ||
    NAV.some((item) =>
      item.children?.some((child) => pathMatches(pathname, child.to)),
    )
  const contactActive = pathMatches(pathname, '/contact')

  useLenis(({ scroll, direction }) => {
    if (mobileOpen) {
      setHidden(false)
      return
    }
    const nextHidden = scroll < 48 ? false : direction === 1 ? true : direction === -1 ? false : null
    if (nextHidden === null) return
    setHidden((prev) => (prev === nextHidden ? prev : nextHidden))
  })

  useEffect(() => {
    if (!openMenu) return undefined

    function onPointerDown(event) {
      if (!dropdownRef.current?.contains(event.target)) {
        setOpenMenu(null)
      }
    }

    function onKeyDown(event) {
      if (event.key === 'Escape') setOpenMenu(null)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [openMenu])

  useEffect(() => {
    if (!mobileOpen) return undefined

    function onKeyDown(event) {
      if (event.key === 'Escape') setMobileOpen(false)
    }

    document.documentElement.classList.add('nav-drawer-open')
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.documentElement.classList.remove('nav-drawer-open')
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [mobileOpen])

  useEffect(() => {
    if (servicesActive) {
      setMobileServicesOpen(true)
      setMobileServiceFocus(null)
    }
  }, [servicesActive])

  function closeMobile() {
    setMobileOpen(false)
    setMobileServicesOpen(servicesActive)
    setMobileServiceFocus(null)
  }

  function toggleMobileServicesOverview() {
    setMobileServicesOpen((open) => {
      const next = !open
      // Preview-select All Services only when not already on a services page
      setMobileServiceFocus(next && !servicesActive ? '/services' : null)
      return next
    })
  }

  return (
    <>
      <header className={`nav-wrap${hidden ? ' is-hidden' : ''}${mobileOpen ? ' is-drawer-open' : ''}`}>
        <nav className="nav">
          <TransitionLink to="/" className="logo-link" onClick={closeMobile}>
            <Logo />
          </TransitionLink>
          <ul className="nav-links">
            {NAV.map((item) =>
              item.children ? (
                <li
                  key={item.label}
                  ref={openMenu === item.label ? dropdownRef : null}
                  className={`nav-item has-dropdown${openMenu === item.label ? ' is-open' : ''}${
                    servicesActive ? ' is-active' : ''
                  }`}
                  onMouseEnter={() => setOpenMenu(item.label)}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  <TransitionLink
                    to={item.to || '/services'}
                    className={`nav-parent${servicesActive ? ' is-active' : ''}`}
                    aria-haspopup="menu"
                    aria-expanded={openMenu === item.label}
                    aria-current={servicesActive ? 'true' : undefined}
                    onClick={() => setOpenMenu(null)}
                  >
                    {item.label}
                    <span className="nav-caret" aria-hidden="true">
                      ▾
                    </span>
                  </TransitionLink>
                  <ul className="nav-dropdown" role="menu">
                    {item.children.map((child) => {
                      const active = pathMatches(pathname, child.to)
                      return (
                        <li key={child.to} role="none">
                          <TransitionLink
                            to={child.to}
                            role="menuitem"
                            className={`nav-dropdown-link${active ? ' is-active' : ''}`}
                            aria-current={active ? 'page' : undefined}
                            onClick={() => setOpenMenu(null)}
                          >
                            {child.icon && SERVICE_ICONS[child.icon] ? (
                              <span className="nav-dropdown-icon">{SERVICE_ICONS[child.icon]}</span>
                            ) : null}
                            <span className="nav-dropdown-text">
                              <span className="nav-dropdown-title">{child.label}</span>
                              {child.description ? (
                                <span className="nav-dropdown-desc">{child.description}</span>
                              ) : null}
                            </span>
                          </TransitionLink>
                        </li>
                      )
                    })}
                  </ul>
                </li>
              ) : (
                <li key={item.label}>
                  <TransitionLink
                    to={item.to}
                    className={
                      item.to !== '/' && pathMatches(pathname, item.to) ? 'is-active' : undefined
                    }
                    aria-current={
                      item.to !== '/' && pathMatches(pathname, item.to) ? 'page' : undefined
                    }
                  >
                    {item.label}
                  </TransitionLink>
                </li>
              ),
            )}
          </ul>
          <div className="nav-right">
            <TransitionLink
              to="/contact"
              className={`btn-nav${contactActive ? ' is-active' : ''}`}
              aria-current={contactActive ? 'page' : undefined}
            >
              Contact Us
            </TransitionLink>
            <button
              type="button"
              className={`nav-burger${mobileOpen ? ' is-open' : ''}`}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="nav-mobile-drawer"
              onClick={() => setMobileOpen((open) => !open)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </nav>
      </header>
      <div className="nav-spacer" aria-hidden="true" />

      <div
        className={`nav-drawer-backdrop${mobileOpen ? ' is-open' : ''}`}
        onClick={closeMobile}
        aria-hidden="true"
      />
      <aside
        id="nav-mobile-drawer"
        className={`nav-drawer${mobileOpen ? ' is-open' : ''}`}
        aria-hidden={!mobileOpen}
      >
        <div className="nav-drawer-head">
          <span className="nav-drawer-title">Menu</span>
          <button type="button" className="nav-drawer-close" onClick={closeMobile} aria-label="Close menu">
            ×
          </button>
        </div>
        <ul className="nav-drawer-links">
          {NAV.map((item) =>
            item.children ? (
              <li key={item.label} className="nav-drawer-item">
                <div
                  className={`nav-drawer-parent-row${mobileServicesOpen ? ' is-open' : ''}${
                    servicesActive ? ' is-active' : ''
                  }`}
                >
                  <button
                    type="button"
                    className={`nav-drawer-parent-link${
                      servicesActive || mobileServicesOpen ? ' is-active' : ''
                    }`}
                    aria-expanded={mobileServicesOpen}
                    aria-controls="nav-drawer-services-sub"
                    onClick={toggleMobileServicesOverview}
                  >
                    {item.label}
                  </button>
                  <button
                    type="button"
                    className={`nav-drawer-parent-toggle${mobileServicesOpen ? ' is-open' : ''}`}
                    aria-expanded={mobileServicesOpen}
                    aria-controls="nav-drawer-services-sub"
                    aria-label={mobileServicesOpen ? 'Hide services menu' : 'Show services menu'}
                    onClick={() => {
                      setMobileServicesOpen((open) => {
                        const next = !open
                        setMobileServiceFocus(next && !servicesActive ? '/services' : null)
                        return next
                      })
                    }}
                  >
                    <span aria-hidden="true">▾</span>
                  </button>
                </div>
                <ul
                  id="nav-drawer-services-sub"
                  className={`nav-drawer-sub${mobileServicesOpen ? ' is-open' : ''}`}
                >
                  {item.children.map((child) => {
                    const routeActive = pathMatches(pathname, child.to)
                    const previewActive =
                      Boolean(mobileServiceFocus) &&
                      mobileServiceFocus === child.to &&
                      !servicesActive
                    const active = routeActive || previewActive
                    return (
                      <li key={child.to}>
                        <TransitionLink
                          to={child.to}
                          className={active ? 'is-active' : undefined}
                          aria-current={routeActive ? 'page' : undefined}
                          onClick={closeMobile}
                        >
                          <span className="nav-drawer-sub-title">{child.label}</span>
                          {child.description ? (
                            <span className="nav-drawer-sub-desc">{child.description}</span>
                          ) : null}
                        </TransitionLink>
                      </li>
                    )
                  })}
                </ul>
              </li>
            ) : (
              <li key={item.label} className="nav-drawer-item">
                <TransitionLink
                  to={item.to}
                  className={
                    item.to !== '/' && pathMatches(pathname, item.to) ? 'is-active' : undefined
                  }
                  aria-current={
                    item.to !== '/' && pathMatches(pathname, item.to) ? 'page' : undefined
                  }
                  onClick={closeMobile}
                >
                  {item.label}
                </TransitionLink>
              </li>
            ),
          )}
          <li className="nav-drawer-item nav-drawer-cta">
            <TransitionLink
              to="/contact"
              className={`btn btn-primary${contactActive ? ' is-active' : ''}`}
              aria-current={contactActive ? 'page' : undefined}
              onClick={closeMobile}
            >
              Contact Us
            </TransitionLink>
          </li>
        </ul>
      </aside>
    </>
  )
}
