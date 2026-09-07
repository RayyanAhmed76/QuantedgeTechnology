export default function DigitalGrowthHero({ service }) {
  return (
    <section className="dg-showcase">
      <div className="dg-hero">
        <div className="dg-hero-copy">
          <h1 className="dg-title">
            <span className="dg-title-muted">Digital growth</span>{' '}
            <span className="dg-title-accent">
              that moves the <br className="dg-title-break" />
              business forward
            </span>
          </h1>
          <p className="dg-hero-lead">
            {service.heroLead[0]}{' '}
            <br className="dg-lead-break" />
            {service.heroLead[1]}
          </p>
          <a href="#contact" className="btn btn-primary dg-hero-cta">
            {service.heroCta || 'Get a Growth Review'}
          </a>
        </div>

        <div className="dg-hero-visual" aria-hidden="true">
          <div className="dg-hero-grid" />
          <img
            className="dg-dice"
            src={service.heroImage}
            alt=""
            loading="eager"
          />
        </div>
      </div>

      <div className="dg-panels">
        <span className="dg-node dg-node--shared dg-node--tl" aria-hidden="true" />
        <span className="dg-node dg-node--shared dg-node--tc" aria-hidden="true" />
        <span className="dg-node dg-node--shared dg-node--tr" aria-hidden="true" />
        <span className="dg-node dg-node--shared dg-node--bl" aria-hidden="true" />
        <span className="dg-node dg-node--shared dg-node--bc" aria-hidden="true" />
        <span className="dg-node dg-node--shared dg-node--br" aria-hidden="true" />

        <article className="dg-panel">
          <span className="dg-panel-corners" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </span>
          <h2>
            <span className="dg-panel-icon" aria-hidden="true">
              ↗
            </span>
            Main Task
          </h2>
          <p>{service.mainTask}</p>
        </article>
        <article className="dg-panel">
          <span className="dg-panel-corners" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </span>
          <h2>
            <span className="dg-panel-icon" aria-hidden="true">
              ↗
            </span>
            Solution
          </h2>
          <p>{service.solution}</p>
        </article>
      </div>

      <div className="dg-offer">
        <a href="#contact" className="dg-offer-pill">
          {service.howWeWork.offer.heading}
        </a>
      </div>
    </section>
  )
}
