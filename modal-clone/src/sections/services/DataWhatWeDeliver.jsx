import { useEffect, useState } from 'react'

const MOBILE_MQ = '(max-width: 640px)'

const ICONS = [
  (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 4v5M16 4v5" strokeLinecap="round" />
      <path d="M7 14h4M7 17h6" strokeLinecap="round" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M4 19V9M10 19V5M16 19v-6M20 19V11" strokeLinecap="round" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M4 17 10 9l4 4 6-8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 5h4v4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M4 7h16M4 12h10M4 17h13" strokeLinecap="round" />
      <path d="M18 10.5 20 12l-2 1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M7 4h10v4H7zM6 8h12v12H6z" strokeLinejoin="round" />
      <path d="M9 12h6M9 15h4" strokeLinecap="round" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V8a4 4 0 0 1 8 0v2" strokeLinecap="round" />
    </svg>
  ),
]

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(MOBILE_MQ).matches : false,
  )

  useEffect(() => {
    const media = window.matchMedia(MOBILE_MQ)
    const onChange = () => setIsMobile(media.matches)
    onChange()
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return isMobile
}

export default function DataWhatWeDeliver({ data }) {
  const isMobile = useIsMobile()
  const [openIndex, setOpenIndex] = useState(null)

  useEffect(() => {
    if (!isMobile) setOpenIndex(null)
  }, [isMobile])

  if (!data) return null

  const toggle = (index) => {
    if (!isMobile) return
    setOpenIndex((current) => (current === index ? null : index))
  }

  return (
    <section className="ds-deliver" aria-label={data.heading}>
      <div className="ds-deliver-inner">
        <header className="ds-deliver-header">
          <p className="ds-overline">{data.overline}</p>
          <h2>{data.heading}</h2>
        </header>

        <div className="ds-deliver-grid">
          {data.features.map((feature, index) => {
            const open = !isMobile || openIndex === index

            return (
              <article
                key={feature.title}
                className={`ds-deliver-item${open && isMobile ? ' is-open' : ''}`}
              >
                <button
                  type="button"
                  className="ds-deliver-hit"
                  aria-expanded={open}
                  disabled={!isMobile}
                  onClick={() => toggle(index)}
                >
                  <span className="ds-deliver-icon" aria-hidden="true">
                    {ICONS[index]}
                  </span>
                  <span className="ds-deliver-copy">
                    <span className="ds-deliver-title">{feature.title}</span>
                    <span className={`ds-deliver-desc${open ? ' is-visible' : ''}`}>
                      {feature.description}
                    </span>
                  </span>
                  {isMobile ? (
                    <span
                      className={`ds-deliver-chevron${open ? ' is-open' : ''}`}
                      aria-hidden="true"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  ) : null}
                </button>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
