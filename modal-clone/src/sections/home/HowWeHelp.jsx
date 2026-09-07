import Reveal from '../../components/Reveal'
import useInView from '../../hooks/useInView'
import { JOURNEY_STEPS } from '../../data'

function JourneyStep({ step, index }) {
  const [ref, visible] = useInView({
    threshold: 0.35,
    rootMargin: '0px 0px -12% 0px',
  })

  return (
    <div ref={ref} className={`step ${visible ? 'visible' : ''}`}>
      <div className="step-dot" aria-hidden="true" />
      <div className="step-content">
        <span className="snum">Step {index + 1}</span>
        <h4>{step.title}</h4>
        <p>{step.copy}</p>
        <span className="touch">{step.tag}</span>
      </div>
    </div>
  )
}

function JourneyTrack() {
  const [ref, lineOn] = useInView({ threshold: 0.12 })

  return (
    <div ref={ref} className={`journey-track ${lineOn ? 'line-on' : ''}`}>
      <div className="track-line" aria-hidden="true" />
      <div className="steps-list">
        {JOURNEY_STEPS.map((step, i) => (
          <JourneyStep key={step.title} step={step} index={i} />
        ))}
      </div>
    </div>
  )
}

export default function HowWeHelp() {
  return (
    <section className="band-soft" id="how-we-do-it">
      <div className="section">
        <Reveal>
          <p className="eyebrow">HOW WE DO IT</p>
          <h2 className="section-title">An overview of how we help.</h2>
        </Reveal>

        <div className="journey-block">
          <Reveal>
            <div className="journey-head">
              <h3>How a project actually moves, from first call to ongoing growth.</h3>
            </div>
          </Reveal>
          <JourneyTrack />
        </div>
      </div>
    </section>
  )
}
