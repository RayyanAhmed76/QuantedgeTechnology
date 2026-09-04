import Reveal from '../components/Reveal'
import { SERVICES } from '../data/site'

export default function Services() {
  return (
    <section className="band-soft" id="services">
      <div className="section">
        <Reveal>
          <p className="eyebrow">OUR SERVICES</p>
          <h2 className="section-title">An overview of how we help.</h2>
          <p className="services-lead">
            High-level coverage across build, data, and growth — we go deeper once we understand your goals.
          </p>
        </Reveal>
        <div className="grid-3 services-grid services-overview">
          {SERVICES.map((service, i) => (
            <Reveal key={service.title} delay={i * 100}>
              <article className="svc-card svc-card-lg">
                <span className="svc-mark" aria-hidden="true" />
                <span className="svc-index">0{i + 1}</span>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
