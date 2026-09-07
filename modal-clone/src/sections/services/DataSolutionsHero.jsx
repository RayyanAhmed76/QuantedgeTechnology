export default function DataSolutionsHero({ data }) {
  if (!data) return null

  const accent = data.headingAccent || ''
  const base =
    accent && data.heading.endsWith(accent)
      ? data.heading.slice(0, -accent.length).trimEnd()
      : data.heading

  return (
    <section className="ds-hero" aria-label={data.heading}>
      <div
        className="ds-hero-media"
        aria-hidden="true"
        style={{ backgroundImage: `url(${data.image})` }}
      >
        <div className="ds-hero-overlay" />
      </div>

      <div className="ds-hero-inner">
        <div className="ds-hero-copy">
          <h1 className="ds-hero-title">
            {base ? <span>{base} </span> : null}
            {accent ? <span className="ds-hero-title-accent">{accent}</span> : null}
          </h1>
          <p className="ds-hero-subtext">{data.subtext}</p>
          <a href={data.ctaHref || '#contact'} className="btn btn-primary ds-hero-cta">
            {data.cta}
          </a>
        </div>
      </div>
    </section>
  )
}
