export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-inner">
        <a href="#services" className="hero-badge">
          Web & Software · Data Solutions · Digital Growth →
        </a>
        <h1>
          Build, analyze,<br />
          and grow your<br />
          digital business.
        </h1>
        <p className="hero-sub">
          We design custom software, unlock insights from your data, and drive
          measurable growth — so you can focus on running the business, not the tech.
        </p>
        <div className="hero-cta">
          <a href="#contact" className="btn btn-primary">Get Started →</a>
          <a href="#services" className="btn btn-ghost">Our Services</a>
        </div>
      </div>
      <div className="hero-beam" aria-hidden="true" />
    </section>
  )
}
