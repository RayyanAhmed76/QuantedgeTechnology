const ICONS = [
  (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M9.5 7.5a2.5 2.5 0 1 1 5 0c0 1.6-1.2 2.3-2.5 3.4S9.5 13 9.5 14.5" strokeLinecap="round" />
      <circle cx="12" cy="17.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M9 18h6M10 14.5h4" strokeLinecap="round" />
      <path d="M8.5 9.5a3.5 3.5 0 1 1 7 0c0 2-1.4 2.9-2.8 3.9-.6.4-.9.9-.9 1.6" strokeLinecap="round" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M7 8.5a2.8 2.8 0 1 0 0 5.6h1.2M16.8 8.5a2.8 2.8 0 1 1 0 5.6H15.6" strokeLinecap="round" />
      <path d="M8.5 11.3h7" strokeLinecap="round" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 16V6.5M12 6.5 9.2 9.3M12 6.5l2.8 2.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 18h9" strokeLinecap="round" />
    </svg>
  ),
]

export default function DataWhyChooseUs({ data }) {
  if (!data) return null

  return (
    <section className="ds-why" aria-label={data.heading}>
      <div className="ds-why-inner">
        <header className="ds-why-header">
          <div className="ds-why-heading-block">
            <p className="ds-overline">{data.overline}</p>
            <h2>{data.heading}</h2>
          </div>
        </header>

        <div className="ds-why-cards">
          {data.cards.map((card, index) => (
            <article key={card.title} className="ds-why-card">
              <span className="ds-why-icon" aria-hidden="true">
                {ICONS[index]}
              </span>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
