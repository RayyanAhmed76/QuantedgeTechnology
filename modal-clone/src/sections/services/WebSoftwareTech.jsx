export default function WebSoftwareTech({ data }) {
  if (!data?.items?.length) return null

  const { heading, items } = data
  const track = [...items, ...items]

  return (
    <section className="ws-tech" aria-label="Technologies">
      <div className="ws-tech-inner">
        <h2 className="ws-tech-heading">{heading}</h2>
      </div>

      <div className="ws-tech-marquee" aria-hidden="true">
        <div className="ws-tech-track">
          {track.map((name, index) => (
            <span key={`${name}-${index}`} className="ws-tech-item">
              {name}
            </span>
          ))}
        </div>
      </div>

      <ul className="visually-hidden">
        {items.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </section>
  )
}
