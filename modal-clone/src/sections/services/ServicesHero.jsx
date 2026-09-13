import PrismaticBurst from '../../components/PrismaticBurst'
import TransitionLink from '../../components/TransitionLink'

const BURST_COLORS = ['#d2ff00', '#d2ff00', '#111111']

export default function ServicesHero() {
  return (
    <section className="service-hero services-index-hero">
      <div className="service-hero-media" aria-hidden="true">
        <div className="services-hero-burst">
          <PrismaticBurst
            animationType="rotate3d"
            intensity={1.15}
            speed={0.4}
            distort={0}
            paused={false}
            offset={{ x: 0, y: 0 }}
            hoverDampness={0}
            rayCount={0}
            mixBlendMode="normal"
            renderScale={0.5}
            maxFps={28}
            colors={BURST_COLORS}
          />
        </div>
        <div className="service-hero-overlay services-hero-burst-overlay" />
      </div>

      <div className="service-hero-content services-index-hero-content">
        <h1>
          One team,{' '}
          <span className="services-index-accent">
            every <span className="services-hero-lime">build</span> you need
            shipped.
          </span>
        </h1>
        <p className="service-hero-lead">
          Web, software, data, and growth from one delivery team when the work in
          front of you actually needs to get done.
        </p>
        <TransitionLink to="/contact" className="btn btn-primary service-hero-cta">
          Get Started
        </TransitionLink>
      </div>
    </section>
  )
}
