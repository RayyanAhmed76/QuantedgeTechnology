import { useState } from 'react'
import { BRAND } from '../../data'
import { submitProject } from '../../lib/api'
import Toast from '../../components/Toast'

export default function Contact() {
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
      await submitProject({
        project: form.get('project'),
        name: form.get('name'),
        email: form.get('email'),
        phone: form.get('phone'),
        privacy: form.get('privacy') ? true : false,
        company_website: form.get('company_website'),
      })
      formEl.reset()
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
        <img
          className="contact-bg"
          src="/assets/contact-bg.webp"
          alt=""
          decoding="async"
        />
        <div className="contact-overlay" />
      </div>

      <div className="contact-inner">
        <div className="contact-copy">
          <p className="eyebrow">GET IN TOUCH</p>
          <h2 className="contact-heading">Let&apos;s talk.</h2>
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
            <form className="contact-form" onSubmit={onSubmit}>
              <h3 className="contact-form-title">Have a project in mind?</h3>

              <label className="full hp-field" aria-hidden="true">
                Company website
                <input name="company_website" type="text" tabIndex={-1} autoComplete="off" />
              </label>

              <label className="full">
                Tell us about your project.
                <textarea
                  name="project"
                  required
                  rows={5}
                  placeholder="Tell us about your project."
                />
              </label>

              <label className="full">
                Your name*
                <input name="name" type="text" required placeholder="John Doe" />
              </label>

              <label className="full">
                E-mail*
                <input name="email" type="email" required placeholder="hello@site.com" />
              </label>

              <label className="full">
                Phone Number*
                <input name="phone" type="tel" required placeholder="+1 703-701-9964" />
              </label>

              <label className="contact-check full">
                <input name="privacy" type="checkbox" required />
                <span>
                  I agree with the <a href="#">Privacy Policy</a> of {BRAND}.
                </span>
              </label>

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
