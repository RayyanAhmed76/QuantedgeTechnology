import { Link, useLocation } from 'react-router-dom'
import { usePageTransition } from '../providers/TransitionProvider'

function isModifiedClick(event) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0
}

export default function TransitionLink({ to, onClick, children, ...rest }) {
  const { transitionTo } = usePageTransition()
  const location = useLocation()

  return (
    <Link
      to={to}
      {...rest}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented || isModifiedClick(event) || rest.target === '_blank') return
        event.preventDefault()
        event.stopPropagation()
        const path = typeof to === 'string' ? to : to?.pathname
        if (path === '/privacy' || path === '/cookie-policy') {
          const current = location.pathname + location.search
          if (current !== '/privacy' && current !== '/cookie-policy') {
            sessionStorage.setItem('qe-return-to', current)
          }
        }
        transitionTo(to)
      }}
    >
      {children}
    </Link>
  )
}
