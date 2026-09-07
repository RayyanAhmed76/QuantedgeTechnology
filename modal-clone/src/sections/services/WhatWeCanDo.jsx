import { useEffect, useState } from 'react'

const DESKTOP_MQ = '(min-width: 1024px)'

const ICONS = [
  (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5 21 21" strokeLinecap="round" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M3 10v4a1 1 0 0 0 1 1h2l4 4V5L6 9H4a1 1 0 0 0-1 1Z" strokeLinejoin="round" />
      <path d="M14 8a4 4 0 0 1 0 8" strokeLinecap="round" />
      <path d="M17 5a8 8 0 0 1 0 14" strokeLinecap="round" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path
        d="M4 5h13a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H10l-5 4v-4H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
        strokeLinejoin="round"
      />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <path d="m3 6.5 9 6.5 9-6.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M3 19h18" strokeLinecap="round" />
      <path d="M5 16V9M11 16v-6M17 16v-3" strokeLinecap="round" />
      <path d="M14 4h6v6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 4 12 12l-3-3-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
]

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(DESKTOP_MQ).matches : false,
  )

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_MQ)
    const onChange = () => setIsDesktop(media.matches)
    onChange()
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return isDesktop
}

export default function WhatWeCanDo({ items, image }) {
  const isDesktop = useIsDesktop()
  const [active, setActive] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia(DESKTOP_MQ).matches ? 0 : null,
  )

  useEffect(() => {
    setActive(isDesktop ? 0 : null)
  }, [isDesktop])

  if (!items?.length) return null

  const activate = (index) => {
    if (isDesktop) {
      setActive(index)
      return
    }
    setActive((current) => (current === index ? null : index))
  }

  return (
    <section className="wwcd" aria-label="What we can do">
      <div className="wwcd-visual" aria-hidden="true">
        <img
          className="wwcd-visual-img"
          src={image || '/assets/marketing-asset-2.png'}
          alt=""
          loading="lazy"
        />
        <div className="wwcd-visual-mask" />
      </div>

      <div className="wwcd-shell">
        <div className="wwcd-main">
          <header className="wwcd-header">
            <p className="wwcd-eyebrow">( Services )</p>
            <h2>What we can do</h2>
          </header>

          <div className="wwcd-list">
            {items.map((item, index) => {
              const open = active === index

              return (
                <article
                  key={item.number}
                  className={`wwcd-row${open ? ' is-open' : ''}`}
                  onMouseEnter={() => {
                    if (isDesktop) setActive(index)
                  }}
                >
                  <div
                    className="wwcd-hit"
                    role="button"
                    tabIndex={0}
                    aria-expanded={open}
                    onClick={() => activate(index)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        activate(index)
                      }
                    }}
                  >
                    <div className="wwcd-meta">
                      <span className="wwcd-num">{item.number}</span>
                    </div>

                    <div className="wwcd-body">
                      <div className="wwcd-title-row">
                        <span className="wwcd-icon">{ICONS[index]}</span>
                        <h3 className="wwcd-title">{item.title}</h3>
                        {!isDesktop ? (
                          <span
                            className={`wwcd-chevron${open ? ' is-open' : ''}`}
                            aria-hidden="true"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        ) : null}
                      </div>
                      <div className="wwcd-copy-wrap">
                        <p className="wwcd-copy">{item.description}</p>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          <div className="wwcd-final-cta">
            <a href="#contact" className="btn btn-primary wwcd-cta-btn">
              Ready to grow? Let&apos;s talk
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
