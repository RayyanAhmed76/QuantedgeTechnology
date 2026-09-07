const STEP_ICONS = [
  (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5 21 21" strokeLinecap="round" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M4 19V9M10 19V5M16 19v-7M20 19V11" strokeLinecap="round" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M8 5.5v13l11-6.5-11-6.5Z" strokeLinejoin="round" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M12 3a9 9 0 1 0 9 9" strokeLinecap="round" />
      <path d="M12 3v9h9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
]

export default function HowWeWork({ data }) {
  if (!data) return null

  const { heading, steps, credibility, offer } = data

  return (
    <section className="dg-how" aria-label="How we work">
      <div className="dg-how-inner">
        <div className="dg-how-heading">
          <h2>
            {heading.map((line) => (
              <span key={line.text} className={line.accent ? 'dg-how-accent' : ''}>
                {line.text}
              </span>
            ))}
          </h2>
        </div>

        <div className="dg-how-steps">
          {steps.map((step, index) => (
            <article key={step.number} className="dg-how-step">
              <span className="dg-how-step-num">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              <span className="dg-how-step-icon" aria-hidden="true">
                {STEP_ICONS[index]}
              </span>
            </article>
          ))}
        </div>

        <div className="dg-how-bottom">
          <article className="dg-how-credibility">
            <div
              className="dg-how-credibility-media"
              style={{ backgroundImage: `url(${credibility.image})` }}
              aria-hidden="true"
            />
            <div className="dg-how-credibility-overlay" aria-hidden="true" />
            <div className="dg-how-credibility-content">
              <h3>{credibility.heading}</h3>
              <p>{credibility.copy}</p>
              {credibility.cta ? (
                <a href={credibility.ctaHref || '#contact'} className="dg-how-credibility-cta">
                  {credibility.cta}
                </a>
              ) : null}
            </div>
          </article>

          <article className="dg-how-offer">
            <h3>{offer.heading}</h3>
            <p>{offer.copy}</p>
            <a href="#contact" className="btn btn-primary dg-how-offer-btn">
              {offer.cta}
            </a>
          </article>
        </div>
      </div>
    </section>
  )
}
