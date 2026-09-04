import { Link } from 'react-router-dom'
import { usePageTransition } from '../providers/TransitionProvider'

function isModifiedClick(event) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0
}

export default function TransitionLink({ to, onClick, children, ...rest }) {
  const { transitionTo } = usePageTransition()

  return (
    <Link
      to={to}
      {...rest}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented || isModifiedClick(event) || rest.target === '_blank') return
        event.preventDefault()
        event.stopPropagation()
        transitionTo(to)
      }}
    >
      {children}
    </Link>
  )
}
