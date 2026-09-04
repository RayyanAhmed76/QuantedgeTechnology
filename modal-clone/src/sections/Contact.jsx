import { useState } from 'react'
import { BRAND } from '../data/site'

export default function Contact() {
  const [sent, setSent] = useState(false)

  function onSubmit(event) {
    event.preventDefault()
    setSent(true)
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
            Tell us about your project — whether it&apos;s a website, data platform,
            or growth campaign.
          </p>
          <div className="contact-points">
            <article className="contact-point">
              <span className="contact-point-icon" aria-hidden="true">✉</span>
              <h3>Quick response.</h3>
              <p>If you&apos;re ready to create and collaborate, we&apos;d love to hear from you.</p>
            </article>
            <article className="contact-point">
              <span className="contact-point-icon" aria-hidden="true">↗</span>
              <h3>Clear next steps.</h3>
              <p>After the consultation, we&apos;ll provide you with a detailed plan and timeline.</p>
            </article>
          </div>
        </div>

        <div className="contact-card">
          {sent ? (
            <div className="form-done" role="status">
              <p>Thanks — we received your note. A teammate will be in touch shortly.</p>
            </div>
          ) : (
            <form className="contact-form" onSubmit={onSubmit}>
              <h3 className="contact-form-title">Have a project in mind?</h3>

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

              <button type="submit" className="btn btn-primary contact-submit">
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
