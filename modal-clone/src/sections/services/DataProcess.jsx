export default function DataProcess({ data }) {
  if (!data) return null

  const headingParts = Array.isArray(data.heading)
    ? data.heading
    : [{ text: data.heading, accent: false }]

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
          {data.steps.map((step) => (
            <article key={step.number} className="ds-process-step">
              <h3>
                <span className="ds-process-num">{step.number}.</span> {step.title}
              </h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
