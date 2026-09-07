export default function WebSoftwareHero({ data }) {
  if (!data) return null

  const accent = data.headingAccent || ''
  const base =
    accent && data.heading.endsWith(accent)
      ? data.heading.slice(0, -accent.length).trimEnd()
      : data.heading

  return (
    <section className="ws-hero" aria-label={data.heading}>
      <div
        className="ws-hero-media"
        aria-hidden="true"
        style={{ backgroundImage: `url(${data.image})` }}
      >
        <div className="ws-hero-overlay" />
      </div>

      <div className="ws-hero-inner">
        <div className="ws-hero-copy">
          <h1 className="ws-hero-title">
            {base ? <span className="ws-hero-title-line">{base} </span> : null}
            {accent ? <span className="ws-hero-title-accent">{accent}</span> : null}
          </h1>
          <p className="ws-hero-subtext">{data.subtext}</p>
          <a href={data.ctaHref || '#contact'} className="btn btn-primary ws-hero-cta">
            {data.cta}
          </a>
        </div>
      </div>
    </section>
  )
}
