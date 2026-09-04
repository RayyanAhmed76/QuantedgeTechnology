import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { WHAT_WE_DO } from '../data/site'

function PillarCard({ title, copy, index }) {
  return (
    <div className="card" id={`card-${index + 1}`}>
      <div className="card-inner">
        <div className="card-content">
          <div className="card-head">
            <span className="card-num">0{index + 1}</span>
            <h2>{title}</h2>
          </div>
          <p>{copy}</p>
        </div>
        <div className="card-img">
          <img src={`/assets/card-${index + 1}.svg`} alt={title} />
        </div>
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

        ScrollTrigger.create({
          trigger: cards[0],
          start: 'top 18%',
          endTrigger: cards[cards.length - 1],
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
              endTrigger: '.outro',
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
                endTrigger: '.outro',
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
        const outro = root.querySelector('.outro')
        if (!intro || !cards.length || !outro) return

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
            endTrigger: isLast ? outro : next,
            end: isLast
              ? 'top 70%'
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
    <section className="pillars-section" id="what-we-do" ref={container}>
      <div className="intro">
        <p className="eyebrow">WHAT WE DO</p>
        <h2>
          Three pillars.<br />One partner.
        </h2>
      </div>

      <div className="cards">
        {WHAT_WE_DO.map((card, index) => (
          <PillarCard key={card.title} {...card} index={index} />
        ))}
      </div>

      <div className="outro">
        <h2>Explore how we deliver each pillar.</h2>
        <a href="#services" className="btn btn-primary">See services</a>
      </div>
    </section>
  )
}
