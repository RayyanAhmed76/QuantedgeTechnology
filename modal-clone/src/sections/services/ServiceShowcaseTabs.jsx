import { useEffect, useRef, useState } from 'react'

const AUTO_MS = 3000
const MOBILE_MQ = '(max-width: 700px)'

const ICONS = {
  web: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M8 8 4.5 12 8 16M16 8l3.5 4L16 16" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m13 7-2 10" strokeLinecap="round" />
    </svg>
  ),
  ecommerce: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M3 5h2l2.2 10.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.5L21 8H7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="20" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="17" cy="20" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  ),
  deployment: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M7 18a4 4 0 0 1 .4-8 5.5 5.5 0 0 1 10.7 1.5A3.5 3.5 0 0 1 18 18H7Z" strokeLinejoin="round" />
      <path d="M12 14V9M12 9l-2 2M12 9l2 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  support: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M4 12a8 8 0 0 1 16 0" strokeLinecap="round" />
      <path d="M4 12v3.5A2.5 2.5 0 0 0 6.5 18H8v-6H4ZM20 12v3.5a2.5 2.5 0 0 1-2.5 2.5H16v-6h4Z" strokeLinejoin="round" />
      <path d="M16 18.5v.5a4 4 0 0 1-4 4h-1" strokeLinecap="round" />
    </svg>
  ),
  ai: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path
        d="M5 11c0-3.3 2.9-6 6.5-6S18 7.7 18 11c0 1.4-.5 2.6-1.3 3.6L18 19l-3.2-1.4c-.7.2-1.5.4-2.3.4C7.9 18 5 15.3 5 11Z"
        strokeLinejoin="round"
      />
      <path d="M9 11h.01M12 11h.01M15 11h.01" strokeLinecap="round" />
    </svg>
  ),
}

export default function ServiceShowcaseTabs({
  tabs,
  eyebrow = 'What we build',
  intervalMs = AUTO_MS,
}) {
  const [active, setActive] = useState(0)
  const navRef = useRef(null)
  const tabRefs = useRef([])

  useEffect(() => {
    if (!tabs?.length || tabs.length < 2) return undefined

    const timer = window.setTimeout(() => {
      setActive((current) => (current + 1) % tabs.length)
    }, intervalMs)

    return () => window.clearTimeout(timer)
  }, [active, tabs, intervalMs])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window.matchMedia(MOBILE_MQ).matches) return

    const tab = tabRefs.current[active]
    const nav = navRef.current
    if (!tab || !nav) return

    const tabLeft = tab.offsetLeft
    const tabRight = tabLeft + tab.offsetWidth
    const viewLeft = nav.scrollLeft
    const viewRight = viewLeft + nav.clientWidth
    const pad = 16

    if (tabLeft < viewLeft + pad) {
      nav.scrollTo({ left: Math.max(0, tabLeft - pad), behavior: 'smooth' })
    } else if (tabRight > viewRight - pad) {
      nav.scrollTo({ left: tabRight - nav.clientWidth + pad, behavior: 'smooth' })
    }
  }, [active])

  if (!tabs?.length) return null

  return (
    <section className="ss-tabs" aria-label="Service showcase">
      <div className="ss-tabs-inner">
        {eyebrow ? <p className="ss-tabs-eyebrow">{eyebrow}</p> : null}

        <div className="ss-tabs-frame">
          <div ref={navRef} className="ss-tabs-nav" role="tablist" aria-label="Categories">
            {tabs.map((tab, index) => {
              const selected = index === active

              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  id={`ss-tab-${tab.id}`}
                  ref={(el) => {
                    tabRefs.current[index] = el
                  }}
                  aria-selected={selected}
                  aria-controls={`ss-panel-${tab.id}`}
                  tabIndex={selected ? 0 : -1}
                  className={`ss-tabs-tab${selected ? ' is-active' : ''}`}
                  onClick={() => setActive(index)}
                >
                  <span className="ss-tabs-icon" aria-hidden="true">
                    {ICONS[tab.icon] || ICONS.web}
                  </span>
                  <span className="ss-tabs-label">{tab.label}</span>
                  {selected ? (
                    <span
                      key={`progress-${tab.id}-${active}`}
                      className="ss-tabs-progress"
                      style={{ animationDuration: `${intervalMs}ms` }}
                      aria-hidden="true"
                    />
                  ) : null}
                </button>
              )
            })}
          </div>

          <div className="ss-tabs-stage">
            {tabs.map((tab, index) => {
              const selected = index === active

              return (
                <div
                  key={tab.id}
                  id={`ss-panel-${tab.id}`}
                  role="tabpanel"
                  aria-labelledby={`ss-tab-${tab.id}`}
                  aria-hidden={!selected}
                  className={`ss-tabs-pane${selected ? ' is-active' : ''}`}
                >
                  <img
                    src={tab.image}
                    alt={`${tab.label} showcase`}
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
