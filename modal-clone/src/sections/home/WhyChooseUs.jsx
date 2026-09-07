import Reveal from '../../components/Reveal'
import { REASONS } from '../../data'

export default function WhyChooseUs() {
  return (
    <section className="section" id="why-us">
      <Reveal>
        <p className="eyebrow">WHY CHOOSE US</p>
        <h2 className="section-title">A partner for build, data, and growth.</h2>
      </Reveal>
      <div className="why-grid">
        {REASONS.map((reason, i) => (
          <Reveal key={reason.title} delay={i * 100}>
            <article className="why-card">
              <span className="why-index">0{i + 1}</span>
              <h3>{reason.title}</h3>
              <p>{reason.text}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
