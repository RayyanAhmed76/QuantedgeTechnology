import { useState } from 'react'
import { FAQS } from '../../data'

export default function Faqs({ items = FAQS }) {
  const [open, setOpen] = useState(0)

  if (!items?.length) return null

  return (
    <section className="faq-section" id="faq">
      <div className="faq-wrap">
        <div className="faq-intro">
          <h2 className="faq-heading">FAQ.</h2>
          <p className="faq-sub">
            Got questions? We&apos;ve got answers. Here&apos;s everything you need to
            know about working with us.
          </p>
        </div>

        <div className="faq-list">
          {items.map((item, i) => {
            const isOpen = open === i
            return (
              <div className={`faq-item ${isOpen ? 'open' : ''}`} key={item.q}>
                <button
                  type="button"
                  className="faq-q"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                >
                  <span>{item.q}</span>
                  <span className="faq-icon" aria-hidden="true">{isOpen ? '−' : '+'}</span>
                </button>
                <div className="faq-a">
                  <p>{item.a}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
