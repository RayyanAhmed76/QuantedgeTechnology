const STEP_ICONS = [
  (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16.5 20.5 21" strokeLinecap="round" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M4 19V5l8 4.5L20 5v14l-8-4.5L4 19Z" strokeLinejoin="round" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <rect x="4" y="5" width="16" height="12" rx="2" />
      <path d="M8 21h8M12 17v4" strokeLinecap="round" />
    </svg>
  ),
]

export default function WebSoftwareProcess({ data }) {
  if (!data) return null

  const { eyebrow, heading, steps, image } = data

  return (
    <section className="ws-process" aria-label="Our process">
      <div className="ws-process-inner">
        <header className="ws-process-header">
          {eyebrow ? <p className="ws-process-eyebrow">{eyebrow}</p> : null}
          <h2>
            {heading.map((part) => (
              <span key={part.text} className={part.accent ? 'ws-process-accent' : undefined}>
                {part.text}
              </span>
            ))}
          </h2>
        </header>

        <div className="ws-process-grid">
          <div className="ws-process-steps">
            {steps.map((step, index) => (
              <article key={step.title} className="ws-process-card">
                <span className="ws-process-icon" aria-hidden="true">
                  {STEP_ICONS[index]}
                </span>
                <div className="ws-process-card-copy">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="ws-process-media">
            <img src={image} alt="" decoding="async" />
          </div>
        </div>
      </div>
    </section>
  )
}
