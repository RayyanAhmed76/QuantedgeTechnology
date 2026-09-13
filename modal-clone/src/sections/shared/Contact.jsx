import { useEffect, useRef, useState } from 'react'
import { BRAND } from '../../data'
import { submitProject } from '../../lib/api'
import { firstErrorKey, validateProjectContact } from '../../lib/formValidation'
import FieldError from '../../components/FieldError'
import FormCaptcha from '../../components/FormCaptcha'
import Toast from '../../components/Toast'
import TransitionLink from '../../components/TransitionLink'

export default function Contact() {
  const videoRef = useRef(null)
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [pending, setPending] = useState(false)
  const [captchaToken, setCaptchaToken] = useState('')

  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined

    // React's muted attr can be flaky for autoplay; set the property + retry play().
    video.muted = true
    video.defaultMuted = true

    const tryPlay = () => {
      const playPromise = video.play()
      if (playPromise?.catch) playPromise.catch(() => {})
    }

    tryPlay()
    video.addEventListener('canplay', tryPlay)
    video.addEventListener('loadeddata', tryPlay)

    const onVisibility = () => {
      if (document.visibilityState === 'visible') tryPlay()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      video.removeEventListener('canplay', tryPlay)
      video.removeEventListener('loadeddata', tryPlay)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

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
    const result = validateProjectContact({
      project: form.get('project'),
      name: form.get('name'),
      email: form.get('email'),
      phone: form.get('phone'),
      privacy: form.get('privacy'),
    })

    setFieldErrors(result.errors)
    if (!result.ok) {
      const key = firstErrorKey(result.errors)
      formEl.querySelector(`[name="${key}"]`)?.focus()
      return
    }

    setPending(true)
    try {
      await submitProject({
        project: result.values.project,
        name: result.values.name,
        email: result.values.email,
        phone: result.values.phone,
        privacy: result.values.privacy,
        company_website: form.get('company_website'),
        captchaToken,
      })
      formEl.reset()
      setFieldErrors({})
      setCaptchaToken('')
      setToast('Thanks, we received your note. A teammate will be in touch shortly.')
    } catch (err) {
      setError(err.message || 'Could not send. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="contact-section" id="contact">
      <div className="contact-media" aria-hidden="true">
        <video
          ref={videoRef}
          className="contact-bg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/assets/contact-bg-poster.webp"
        >
          <source src="/assets/contact-bg.mp4" type="video/mp4" />
          <source src="/assets/contact-bg.webm" type="video/webm" />
        </video>
        <div className="contact-overlay" />
      </div>

      <div className="contact-inner">
        <div className="contact-copy">
          <p className="eyebrow">GET IN TOUCH</p>
          <h2 className="contact-heading">
            Let&apos;s <span className="contact-accent">talk.</span>
          </h2>
          <p className="contact-lead">
            Tell us about your project, whether it&apos;s a website, data platform,
            or growth campaign.
          </p>
          <div className="contact-points">
            <article className="contact-point">
              <h3>Quick response.</h3>
              <p>If you&apos;re ready to create and collaborate, we&apos;d love to hear from you.</p>
            </article>
            <article className="contact-point">
              <h3>Clear next steps.</h3>
              <p>After the consultation, we&apos;ll provide you with a detailed plan and timeline.</p>
            </article>
          </div>
        </div>

        <div className="contact-card">
          <div className="contact-card-inner">
            <form className="contact-form" onSubmit={onSubmit} noValidate>
              <h3 className="contact-form-title">Have a project in mind?</h3>

              <label className="full hp-field" aria-hidden="true">
                Company website
                <input name="company_website" type="text" tabIndex={-1} autoComplete="off" />
              </label>

              <label className={`full${fieldErrors.project ? ' has-error' : ''}`}>
                Tell us about your project.
                <textarea
                  name="project"
                  rows={5}
                  placeholder="Tell us about your project."
                  aria-invalid={Boolean(fieldErrors.project)}
                  aria-describedby={fieldErrors.project ? 'contact-project-error' : undefined}
                  onChange={() => clearField('project')}
                />
                <FieldError id="contact-project-error" message={fieldErrors.project} />
              </label>

              <label className={`full${fieldErrors.name ? ' has-error' : ''}`}>
                Your name*
                <input
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  autoComplete="name"
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby={fieldErrors.name ? 'contact-name-error' : undefined}
                  onChange={() => clearField('name')}
                />
                <FieldError id="contact-name-error" message={fieldErrors.name} />
              </label>

              <label className={`full${fieldErrors.email ? ' has-error' : ''}`}>
                E-mail*
                <input
                  name="email"
                  type="email"
                  placeholder="hello@site.com"
                  autoComplete="email"
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? 'contact-email-error' : undefined}
                  onChange={() => clearField('email')}
                />
                <FieldError id="contact-email-error" message={fieldErrors.email} />
              </label>

              <label className={`full${fieldErrors.phone ? ' has-error' : ''}`}>
                Phone Number*
                <input
                  name="phone"
                  type="tel"
                  placeholder="+1 703-701-9964"
                  autoComplete="tel"
                  aria-invalid={Boolean(fieldErrors.phone)}
                  aria-describedby={fieldErrors.phone ? 'contact-phone-error' : undefined}
                  onChange={() => clearField('phone')}
                />
                <FieldError id="contact-phone-error" message={fieldErrors.phone} />
              </label>

              <div className={`contact-privacy${fieldErrors.privacy ? ' has-error' : ''}`}>
                <label className="contact-check full">
                  <input
                    name="privacy"
                    type="checkbox"
                    aria-invalid={Boolean(fieldErrors.privacy)}
                    aria-describedby={fieldErrors.privacy ? 'contact-privacy-error' : undefined}
                    onChange={() => clearField('privacy')}
                  />
                  <span>
                    I agree with the{' '}
                    <TransitionLink to="/privacy" className="privacy-inline-link">
                      Privacy Policy
                    </TransitionLink>{' '}
                    of {BRAND}.
                  </span>
                </label>
                <FieldError id="contact-privacy-error" message={fieldErrors.privacy} />
              </div>

              <FormCaptcha onTokenChange={setCaptchaToken} />

              {error ? <p className="form-error">{error}</p> : null}

              <button type="submit" className="btn btn-primary contact-submit" disabled={pending}>
                {pending ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <Toast message={toast} open={Boolean(toast)} onClose={() => setToast('')} />
    </section>
  )
}
