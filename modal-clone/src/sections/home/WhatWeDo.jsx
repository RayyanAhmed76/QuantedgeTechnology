import { useRef } from 'react'
import { gsap, useGSAP, ScrollTrigger } from '../../lib/gsap'
import TransitionLink from '../../components/TransitionLink'
import { WHAT_WE_DO } from '../../data'

function PillarCard({ title, copy, image, href, index }) {
  return (
    <div className="card" id={`card-${index + 1}`}>
      <div className="card-inner">
        <div className="card-content">
          <div className="card-head">
            <span className="card-num">0{index + 1}</span>
            <h2>{title}</h2>
          </div>
          <p>{copy}</p>
          {href ? (
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
        if (!cards.length) return
        const lastCard = cards[cards.length - 1]

        ScrollTrigger.create({
          trigger: cards[0],
          start: 'top 18%',
          endTrigger: lastCard,
          end: 'top 15%',
          pin: '.intro',
          pinSpacing: false,
        })

        cards.forEach((card, index) => {
          const isLastCard = index === cards.length - 1
          const cardInner = card.querySelector('.card-inner')

          if (!isLastCard) {
            ScrollTrigger.create({
              trigger: card,
              start: 'top 18%',
              endTrigger: lastCard,
              end: 'top 65%',
              pin: true,
              pinSpacing: false,
            })

            gsap.to(cardInner, {
              y: `-${(cards.length - index) * 10}vh`,
              ease: 'none',
              scrollTrigger: {
                trigger: card,
                start: 'top 18%',
                endTrigger: lastCard,
                end: 'top 65%',
                scrub: true,
              },
            })
          }
        })
      })

      mm.add('(max-width: 900px)', () => {
        const intro = root.querySelector('.intro')
        const cards = gsap.utils.toArray('.card', root)
        if (!intro || !cards.length) return

        const headingPeek = (card) => {
          const head = card.querySelector('.card-head')
          if (!head) return 72
          return Math.max(
            64,
            Math.ceil(head.getBoundingClientRect().bottom - card.getBoundingClientRect().top),
          )
        }

        const stackOffset = (index) => {
          let offset = intro.offsetHeight
          for (let i = 0; i < index; i += 1) {
            offset += headingPeek(cards[i])
          }
          return offset
        }

        ScrollTrigger.create({
          trigger: intro,
          start: 'top top',
          endTrigger: cards[cards.length - 1],
          end: 'bottom top',
          pin: true,
          pinSpacing: false,
          invalidateOnRefresh: true,
        })

        cards.forEach((card, index) => {
          const next = cards[index + 1]
          const isLast = index === cards.length - 1

          ScrollTrigger.create({
            trigger: card,
            start: () => `top top+=${stackOffset(index)}`,
            endTrigger: isLast ? card : next,
            end: isLast
              ? 'bottom top'
              : () => `top top+=${stackOffset(index + 1)}`,
            pin: true,
            pinSpacing: false,
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
