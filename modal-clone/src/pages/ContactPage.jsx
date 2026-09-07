import { useState } from 'react'
import { CONTACT_DETAILS } from '../data'
import { submitContact } from '../lib/api'
import Toast from '../components/Toast'

function ContactIcon({ name }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }

  if (name === 'email') {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    )
  }
  if (name === 'phone') {
    return (
      <svg {...common}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.81.36 1.6.68 2.34a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.74-1.25a2 2 0 0 1 2.11-.45c.74.32 1.53.55 2.34.68A2 2 0 0 1 22 16.92z" />
      </svg>
    )
  }
  if (name === 'location') {
    return (
      <svg {...common}>
        <path d="M12 22s7-7.2 7-12a7 7 0 1 0-14 0c0 4.8 7 12 7 12z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

export default function ContactPage() {
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function onSubmit(event) {
    event.preventDefault()
    setError('')
    setPending(true)
    const formEl = event.currentTarget
    const form = new FormData(formEl)
    try {
      await submitContact({
        firstName: form.get('firstName'),
        lastName: form.get('lastName'),
        email: form.get('email'),
        phone: form.get('phone'),
        message: form.get('message'),
        company_website: form.get('company_website'),
      })
      formEl.reset()
      setToast('Thanks, we received your message. A teammate will be in touch shortly.')
    } catch (err) {
      setError(err.message || 'Could not send. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="contact-page">
      <section className="contact-hero" aria-label="Contact Us">
        <img
          className="contact-hero-img"
          src="/assets/contact-us.jpg"
          alt=""
          loading="eager"
        />
        <div className="contact-hero-overlay" aria-hidden="true" />
        <h1 className="contact-hero-title">Contact Us</h1>
      </section>

      <div className="contact-page-inner">
        <div className="contact-page-form-card">
          <form className="contact-page-form" onSubmit={onSubmit}>
              <h2>
                Send us a <span className="contact-page-accent">message</span>.
              </h2>

              <label className="hp-field" aria-hidden="true">
                Company website
                <input name="company_website" type="text" tabIndex={-1} autoComplete="off" />
              </label>

              <div className="contact-page-row">
                <label>
                  First name
                  <input name="firstName" type="text" required placeholder="Enter your first name" />
                </label>
                <label>
                  Last name
                  <input name="lastName" type="text" required placeholder="Enter your last name" />
                </label>
              </div>

              <label>
                Email
                <input name="email" type="email" required placeholder="yourname@gmail.com" />
              </label>

              <label>
                Phone number
                <input name="phone" type="tel" required placeholder="+1 234 567 890" />
              </label>

              <label>
                Message
                <textarea
                  name="message"
                  required
                  rows={5}
                  placeholder="Enter your message"
                />
              </label>

              {error ? <p className="form-error">{error}</p> : null}

              <button type="submit" className="btn btn-primary contact-page-submit" disabled={pending}>
                {pending ? 'Sending…' : 'Send'}
              </button>
            </form>
        </div>

        <aside className="contact-page-aside" aria-label="Contact details">
          {CONTACT_DETAILS.map((item) => (
            <article key={item.title} className="contact-info-card">
              <div className="contact-info-head">
                <span className="contact-info-icon">
                  <ContactIcon name={item.icon} />
                </span>
                <h2>{item.title}</h2>
              </div>
              {item.href ? (
                <a className="contact-info-value" href={item.href}>
                  {item.value}
                </a>
              ) : (
                <p className="contact-info-value">{item.value}</p>
              )}
              <p className="contact-info-note">{item.note}</p>
            </article>
          ))}
        </aside>
      </div>

      <Toast message={toast} open={Boolean(toast)} onClose={() => setToast('')} />
    </main>
  )
}
