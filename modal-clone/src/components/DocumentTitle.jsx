import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { BRAND } from '../data'

const PAGE_TITLES = {
  '/': 'home',
  '/about': 'about',
  '/contact': 'contact',
  '/services': 'services',
  '/career': 'career',
  '/privacy': 'privacy',
  '/cookie-policy': 'cookie policy',
  '/terms': 'terms',
  '/admin': 'admin',
  '/admin/login': 'admin login',
}

const SERVICE_TITLES = {
  'web-software-development': 'web & software',
  'data-solutions': 'data solutions',
  'digital-growth': 'digital growth',
}

function titleForPath(pathname) {
  if (PAGE_TITLES[pathname]) {
    return `${BRAND} | ${PAGE_TITLES[pathname]}`
  }

  if (pathname.startsWith('/services/')) {
    const slug = pathname.split('/')[2] || ''
    if (SERVICE_TITLES[slug]) {
      return `${BRAND} | ${SERVICE_TITLES[slug]}`
    }
    return `${BRAND} | page not found`
  }

  return `${BRAND} | page not found`
}

export default function DocumentTitle() {
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = titleForPath(pathname)
  }, [pathname])

  return null
}
