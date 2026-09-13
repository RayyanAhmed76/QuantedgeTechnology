import Contact from '../sections/shared/Contact'
import { ABOUT_STATEMENTS } from '../data'

export default function AboutPage() {
  return (
    <main className="about-page">
      <div className="about-content">
        <h1>
          What makes us <span className="about-heading-accent">different</span>
        </h1>
        <p className="about-copy">
          We don&apos;t build just to build. we solve real business problems.
          QuantEdgeDataSolutions unites web, software, data, and growth so every
          choice ties to your revenue or efficiency, explained plainly, and you
          work directly with the engineers building it.
        </p>
      </div>

      <div className="about-banner">
        <img
          className="about-banner-img"
          src="/assets/about-us.webp"
          alt=""
          loading="lazy"
        />
      </div>

      <section className="about-statements" aria-label="Mission, values, and goal">
        {ABOUT_STATEMENTS.map((item, index) => {
          const isEdge = index === 0 || index === ABOUT_STATEMENTS.length - 1
          return (
            <article
              key={item.accent}
              className={[
                'about-statement',
                isEdge ? 'about-statement--bleed' : 'about-statement--inset',
                index % 2 === 0 ? 'about-statement--title-left' : 'about-statement--title-right',
              ].join(' ')}
            >
              <div className="about-statement-inner">
                <h2 className="about-statement-title">
                  <span className="about-statement-lead">{item.lead}</span>{' '}
                  <span className="about-statement-accent">{item.accent}</span>
                </h2>
                <p className="about-statement-copy">{item.copy}</p>
              </div>
            </article>
          )
        })}
      </section>

      <Contact />
    </main>
  )
}
