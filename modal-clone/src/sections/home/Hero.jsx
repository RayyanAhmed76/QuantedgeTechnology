import Aurora from '../../components/Aurora'

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-media" aria-hidden="true">
        <div className="hero-aurora">
          <Aurora
            colorStops={['#d2ff00', '#c2c8aa', '#ccf704']}
            blend={0.51}
            amplitude={1.0}
            speed={1}
          />
        </div>
        <div className="hero-overlay" />
      </div>

      <div className="hero-inner">
        <h1>
          Build, analyze,<br />
          and grow your<br />
          <span className="accent">digital business.</span>
        </h1>
        <p className="hero-sub">
          We design custom software, unlock insights from your data, and drive
          measurable
          <br className="hero-sub-break" />
          {' '}growth so you can focus on running the business, not the tech.
        </p>
        <div className="hero-cta">
          <a href="#contact" className="btn btn-primary">Get Started</a>
          <a href="#services" className="btn btn-ghost">Our Services</a>
        </div>
      </div>
    </section>
  )
}
