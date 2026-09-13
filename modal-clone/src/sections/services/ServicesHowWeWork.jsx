import { useEffect, useRef, useState } from 'react'
import { SERVICES_HOW_WE_WORK } from '../../data/servicesOverview'

function buildZigzagPath(points, amplitude = 14) {
  if (points.length < 2) return ''

  const [first, ...rest] = points
  let d = `M ${first.x} ${first.y}`

  rest.forEach((point, index) => {
    const prev = points[index]
    const midY = (prev.y + point.y) / 2
    const sway = index % 2 === 0 ? -amplitude : amplitude
    const c1x = prev.x + sway
    const c2x = point.x - sway
    d += ` C ${c1x} ${midY - (point.y - prev.y) * 0.12}, ${c2x} ${midY + (point.y - prev.y) * 0.12}, ${point.x} ${point.y}`
  })

  return d
}

export default function ServicesHowWeWork() {
  const timelineRef = useRef(null)
  const [path, setPath] = useState(null)

  useEffect(() => {
    const timeline = timelineRef.current
    if (!timeline) return

    const sync = () => {
      const dots = Array.from(timeline.querySelectorAll('.rcwork-axis-dot'))
      if (dots.length < 2) {
        setPath(null)
        return
      }

      const parent = timeline.getBoundingClientRect()
      const points = dots.map((dot) => {
        const rect = dot.getBoundingClientRect()
        return {
          x: rect.left + rect.width / 2 - parent.left,
          y: rect.top + rect.height / 2 - parent.top,
        }
      })

      const amplitude =
        parent.width < 900
          ? 8
          : Math.min(18, Math.max(10, parent.width * 0.012))

      setPath({
        width: parent.width,
        height: parent.height,
        d: buildZigzagPath(points, amplitude),
      })
    }

    sync()
    const raf = window.requestAnimationFrame(sync)
    const t1 = window.setTimeout(sync, 100)
    const t2 = window.setTimeout(sync, 500)

    const images = timeline.querySelectorAll('img')
    images.forEach((img) => {
      if (!img.complete) img.addEventListener('load', sync)
    })

    const ro = new ResizeObserver(sync)
    ro.observe(timeline)
    window.addEventListener('resize', sync)

    return () => {
      window.cancelAnimationFrame(raf)
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      images.forEach((img) => img.removeEventListener('load', sync))
      ro.disconnect()
      window.removeEventListener('resize', sync)
    }
  }, [])

  return (
    <section className="rcwork-section" aria-labelledby="rcwork-heading">
      <div className="rcwork-shell">
        <header className="rcwork-header">
          <p className="service-eyebrow">
            <span aria-hidden="true">✦</span> Our process
          </p>
          <h2 id="rcwork-heading">
            How We <span>Work</span>
          </h2>
        </header>

        <div className="rcwork-timeline" ref={timelineRef}>
          {path ? (
            <svg
              className="rcwork-path"
              width={path.width}
              height={path.height}
              viewBox={`0 0 ${path.width} ${path.height}`}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d={path.d}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0 9"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          ) : null}

          <ol className="rcwork-steps">
            {SERVICES_HOW_WE_WORK.map((step, index) => {
              const flip = index % 2 === 1
              const displayNum = String(Number(step.number))
              return (
                <li
                  key={step.number}
                  className={`rcwork-row${flip ? ' is-flip' : ''}`}
                >
                  <div className="rcwork-copy">
                    <p className="rcwork-step-label">{step.number}</p>
                    <h3>{step.title}</h3>
                    <p className="rcwork-copy-text">{step.copy}</p>
                  </div>

                  <div className="rcwork-axis" aria-hidden="true">
                    <span className="rcwork-axis-num">{displayNum}</span>
                    <span className="rcwork-axis-dot" />
                  </div>

                  <div className="rcwork-media">
                    <img src={step.image} alt="" loading="lazy" />
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
