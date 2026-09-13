import { useEffect, useState } from 'react'

const MOBILE_MQ = '(max-width: 640px)'

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

export default function DataProcess({ data }) {
  const isMobile = useIsMobile()
  const [openIndex, setOpenIndex] = useState(null)

  useEffect(() => {
    if (!isMobile) setOpenIndex(null)
  }, [isMobile])

  if (!data) return null

  const headingParts = Array.isArray(data.heading)
    ? data.heading
    : [{ text: data.heading, accent: false }]

  const toggle = (index) => {
    if (!isMobile) return
    setOpenIndex((current) => (current === index ? null : index))
  }

  return (
    <section className="ds-process" aria-label="How we work">
      <div className="ds-process-inner">
        <header className="ds-process-header">
          <p className="ds-overline">{data.overline}</p>
          <h2>
            {headingParts.map((part) => (
              <span key={part.text} className={part.accent ? 'ds-process-accent' : undefined}>
                {part.text}
              </span>
            ))}
          </h2>
        </header>

        {data.image ? (
          <div className="ds-process-media">
            <img
              src={data.image}
              alt=""
              loading="lazy"
              decoding="async"
            />
          </div>
        ) : null}

        <div className="ds-process-steps">
          {data.steps.map((step, index) => {
            const open = !isMobile || openIndex === index

            return (
              <article
                key={step.number}
                className={`ds-process-step${open && isMobile ? ' is-open' : ''}`}
              >
                <button
                  type="button"
                  className="ds-process-hit"
                  aria-expanded={open}
                  disabled={!isMobile}
                  onClick={() => toggle(index)}
                >
                  <h3>
                    <span className="ds-process-num">{step.number}.</span> {step.title}
                  </h3>
                  {isMobile ? (
                    <span
                      className={`ds-process-chevron${open ? ' is-open' : ''}`}
                      aria-hidden="true"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  ) : null}
                </button>
                <p className={`ds-process-desc${open ? ' is-visible' : ''}`}>{step.description}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
