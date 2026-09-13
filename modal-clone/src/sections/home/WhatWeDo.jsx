import { useRef } from 'react'
import { gsap, useGSAP, ScrollTrigger } from '../../lib/gsap'
import TransitionLink from '../../components/TransitionLink'
import { WHAT_WE_DO } from '../../data'

function isExternalHref(href) {
  return typeof href === 'string' && /^https?:\/\//i.test(href)
}

function PillarCard({ title, copy, image, href, index }) {
  const external = isExternalHref(href)

  return (
    <div className="card" id={`card-${index + 1}`}>
      <div className="card-inner">
        <div className="card-content">
          <div className="card-head">
            <span className="card-num">0{index + 1}</span>
            <h2>{title}</h2>
          </div>
          <p>{copy}</p>
          {external ? (
            <a
              href={href}
              className="btn btn-primary card-cta"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more
            </a>
          ) : href ? (
            <TransitionLink to={href} className="btn btn-primary card-cta">
              Learn more
            </TransitionLink>
          ) : (
            <button type="button" className="btn btn-primary card-cta">
              Learn more
            </button>
          )}
        </div>
        {image ? (
          <div className="card-img">
            <img src={image} alt="" loading="lazy" />
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default function WhatWeDo() {
  const container = useRef(null)

  useGSAP(
    () => {
      const root = container.current
      if (!root) return

      const mm = gsap.matchMedia()

      mm.add('(min-width: 901px)', () => {
        const cards = gsap.utils.toArray('.card', root)
        const intro = root.querySelector('.intro')
        if (!cards.length || !intro) return
        const lastCard = cards[cards.length - 1]

        // Keep heading fixed (no fade) until the card stack finishes
        ScrollTrigger.create({
          trigger: intro,
          start: 'top top',
          endTrigger: lastCard,
          end: '+=15%',
          pin: true,
          pinSpacing: false,
        })

        // Hard stack: full-viewport pin so previous cards don't peek above.
        // Cards 1-3 pin until the next covers them; last card holds briefly then releases.
        cards.forEach((card, index) => {
          const isLast = index === cards.length - 1
          const nextCard = cards[index + 1]

          ScrollTrigger.create({
            trigger: card,
            start: 'top top',
            endTrigger: isLast ? undefined : nextCard,
            end: isLast ? '+=15%' : 'top top',
            pin: true,
            pinSpacing: isLast,
          })
        })
      })

      mm.add('(max-width: 900px)', () => {
        const cards = gsap.utils.toArray('.card', root)
        if (!cards.length) return

        // Do not pin the intro on mobile — pinning lets card #1 cover "One partner."
        // Cards still hard-stack; last card holds briefly then releases.
        cards.forEach((card, index) => {
          const isLast = index === cards.length - 1
          const next = cards[index + 1]

          ScrollTrigger.create({
            trigger: card,
            start: 'top top',
            endTrigger: isLast ? undefined : next,
            end: isLast ? '+=15%' : 'top top',
            pin: true,
            pinSpacing: isLast,
            invalidateOnRefresh: true,
          })
        })

        const refresh = () => ScrollTrigger.refresh()
        requestAnimationFrame(refresh)
        window.addEventListener('resize', refresh)

        return () => {
          window.removeEventListener('resize', refresh)
        }
      })

      return () => mm.revert()
    },
    { scope: container },
  )

  return (
    <section className="pillars-section" id="services" ref={container}>
      <div className="intro">
        <p className="eyebrow">WHAT WE DO</p>
        <h2>
          Four pillars.<br />One partner.
        </h2>
      </div>

      <div className="cards">
        {WHAT_WE_DO.map((card, index) => (
          <PillarCard key={card.title} {...card} index={index} />
        ))}
      </div>
    </section>
  )
}
