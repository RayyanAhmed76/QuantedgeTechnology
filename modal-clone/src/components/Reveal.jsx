import useInView from '../hooks/useInView'

export default function Reveal({ children, className = '', delay = 0 }) {
  const [ref, visible] = useInView({
    threshold: 0.14,
    rootMargin: '0px 0px -40px 0px',
  })

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'in' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
