import { useState } from 'react'
import { CONTACT_DETAILS } from '../data'
import { submitContact } from '../lib/api'
import { firstErrorKey, validateContactPage } from '../lib/formValidation'
import FieldError from '../components/FieldError'
import FormCaptcha from '../components/FormCaptcha'
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
  const [fieldErrors, setFieldErrors] = useState({})
  const [pending, setPending] = useState(false)
  const [captchaToken, setCaptchaToken] = useState('')

  function clearField(name) {
    setFieldErrors((current) => {
      if (!current[name]) return current
      const next = { ...current }
      delete next[name]
      return next
    })
  }

  async function onSubmit(event) {
    event.preventDefault()
    setError('')
    const formEl = event.currentTarget
    const form = new FormData(formEl)
    const result = validateContactPage({
      firstName: form.get('firstName'),
      lastName: form.get('lastName'),
      email: form.get('email'),
      phone: form.get('phone'),
      message: form.get('message'),
    })

    setFieldErrors(result.errors)
    if (!result.ok) {
      const key = firstErrorKey(result.errors)
      formEl.querySelector(`[name="${key}"]`)?.focus()
      return
    }

    setPending(true)
    try {
      await submitContact({
        firstName: result.values.firstName,
        lastName: result.values.lastName,
        email: result.values.email,
        phone: result.values.phone,
        message: result.values.message,
        company_website: form.get('company_website'),
        captchaToken,
      })
      formEl.reset()
      setFieldErrors({})
      setCaptchaToken('')
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
          src="/assets/contact-us.webp"
          alt=""
          loading="eager"
        />
        <div className="contact-hero-overlay" aria-hidden="true" />
        <div className="contact-hero-fade" aria-hidden="true" />
        <h1 className="contact-hero-title">Contact Us</h1>
      </section>

      <div className="contact-page-inner">
        <div className="contact-page-form-card">
          <form className="contact-page-form" onSubmit={onSubmit} noValidate>
            <h2>
              Send us a <span className="contact-page-accent">message</span>.
            </h2>

            <label className="hp-field" aria-hidden="true">
              Company website
              <input name="company_website" type="text" tabIndex={-1} autoComplete="off" />
            </label>

            <div className="contact-page-row">
              <label className={fieldErrors.firstName ? 'has-error' : undefined}>
                First name
                <input
                  name="firstName"
                  type="text"
                  placeholder="Enter your first name"
                  autoComplete="given-name"
                  aria-invalid={Boolean(fieldErrors.firstName)}
                  aria-describedby={fieldErrors.firstName ? 'cp-first-error' : undefined}
                  onChange={() => clearField('firstName')}
                />
                <FieldError id="cp-first-error" message={fieldErrors.firstName} />
              </label>
              <label className={fieldErrors.lastName ? 'has-error' : undefined}>
                Last name
                <input
                  name="lastName"
                  type="text"
                  placeholder="Enter your last name"
                  autoComplete="family-name"
                  aria-invalid={Boolean(fieldErrors.lastName)}
                  aria-describedby={fieldErrors.lastName ? 'cp-last-error' : undefined}
                  onChange={() => clearField('lastName')}
                />
                <FieldError id="cp-last-error" message={fieldErrors.lastName} />
              </label>
            </div>

            <label className={fieldErrors.email ? 'has-error' : undefined}>
              Email
              <input
                name="email"
                type="email"
                placeholder="yourname@gmail.com"
                autoComplete="email"
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? 'cp-email-error' : undefined}
                onChange={() => clearField('email')}
              />
              <FieldError id="cp-email-error" message={fieldErrors.email} />
            </label>

            <label className={fieldErrors.phone ? 'has-error' : undefined}>
              Phone number
              <input
                name="phone"
                type="tel"
                placeholder="+1 234 567 890"
                autoComplete="tel"
                aria-invalid={Boolean(fieldErrors.phone)}
                aria-describedby={fieldErrors.phone ? 'cp-phone-error' : undefined}
                onChange={() => clearField('phone')}
              />
              <FieldError id="cp-phone-error" message={fieldErrors.phone} />
            </label>

            <label className={fieldErrors.message ? 'has-error' : undefined}>
              Message
              <textarea
                name="message"
                rows={5}
                placeholder="Enter your message"
                aria-invalid={Boolean(fieldErrors.message)}
                aria-describedby={fieldErrors.message ? 'cp-message-error' : undefined}
                onChange={() => clearField('message')}
              />
              <FieldError id="cp-message-error" message={fieldErrors.message} />
            </label>

            {error ? <p className="form-error">{error}</p> : null}

            <FormCaptcha onTokenChange={setCaptchaToken} />

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
