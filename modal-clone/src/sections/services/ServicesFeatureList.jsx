import TransitionLink from '../../components/TransitionLink'
import Reveal from '../../components/Reveal'
import { SERVICES_OVERVIEW } from '../../data/servicesOverview'

export default function ServicesFeatureList() {
  return (
    <section
      className="services-feature-section"
      aria-labelledby="services-index-dir-heading"
    >
      <div className="services-feature-shell">
        <Reveal className="services-feature-header">
          <header>
            <h2 id="services-index-dir-heading">
              Where we can <span>help</span>
            </h2>
            <p>
              Explore each area below. When you&apos;re ready, talk to us and
              we&apos;ll help you figure out the right starting point.
            </p>
          </header>
        </Reveal>

        <div className="services-feature-list">
          {SERVICES_OVERVIEW.map((service, index) => (
            <Reveal key={service.title} delay={index * 60}>
              <article
                className={
                  index % 2 === 1
                    ? 'services-feature-row services-feature-row--flip'
                    : 'services-feature-row'
                }
              >
                <div className="services-feature-media">
                  <img
                    src={service.image}
                    alt=""
                    width={960}
                    height={720}
                    loading={index < 2 ? 'eager' : 'lazy'}
                    className="services-feature-img"
                  />
                </div>

                <div className="services-feature-copy">
                  <p className="services-feature-eyebrow">
                    <span aria-hidden="true">✦</span>{' '}
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3>{service.title}</h3>
                  <p className="services-feature-text">{service.copy}</p>
                  {service.external ? (
                    <a
                      href={service.href}
                      className="btn btn-primary services-feature-cta"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {service.cta}
                    </a>
                  ) : (
                    <TransitionLink
                      to={service.href}
                      className="btn btn-primary services-feature-cta"
                    >
                      {service.cta}
                    </TransitionLink>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
