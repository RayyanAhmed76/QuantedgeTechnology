import { useRef, useState } from 'react'
import { CAREER } from '../data'
import { submitCareer } from '../lib/api'
import { firstErrorKey, validateCareer } from '../lib/formValidation'
import FieldError from '../components/FieldError'
import FormCaptcha from '../components/FormCaptcha'
import Toast from '../components/Toast'

export default function CareerPage() {
  const [toast, setToast] = useState('')
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [pending, setPending] = useState(false)
  const [captchaToken, setCaptchaToken] = useState('')
  const fileRef = useRef(null)

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
    const resume = form.get('resume')
    const resumeFile = resume instanceof File && resume.size > 0 ? resume : null

    const result = validateCareer(
      {
        fullName: form.get('fullName'),
        email: form.get('email'),
        phone: form.get('phone'),
        linkedin: form.get('linkedin'),
        github: form.get('github'),
      },
      resumeFile,
    )

    setFieldErrors(result.errors)
    if (!result.ok) {
      const key = firstErrorKey(result.errors)
      if (key === 'resume') fileRef.current?.focus()
      else formEl.querySelector(`[name="${key}"]`)?.focus()
      return
    }

    setPending(true)
    try {
      form.set('fullName', result.values.fullName)
      form.set('email', result.values.email)
      form.set('phone', result.values.phone)
      form.set('linkedin', result.values.linkedin)
      form.set('github', result.values.github)
      if (captchaToken) form.set('captchaToken', captchaToken)
      await submitCareer(form)
      formEl.reset()
      setFileName('')
      setFieldErrors({})
      setCaptchaToken('')
      setToast(CAREER.success)
    } catch (err) {
      setError(err.message || 'Could not submit. Please try again.')
    } finally {
      setPending(false)
    }
  }

  function onFileChange(event) {
    const file = event.target.files?.[0]
    setFileName(file ? file.name : '')
    clearField('resume')
  }

  const headingParts = CAREER.heading.split(CAREER.headingAccent)

  return (
    <main className="career-page">
      <header className="career-header">
        <h1>
          {headingParts[0]}
          <span className="career-accent">{CAREER.headingAccent}</span>
          {headingParts[1]}
        </h1>
        {CAREER.lead ? <p className="career-lead">{CAREER.lead}</p> : null}
      </header>

      <div className="career-layout">
        <div className="career-form-card">
          <form className="career-form" onSubmit={onSubmit} noValidate>
            <label className="hp-field" aria-hidden="true">
              Company website
              <input name="company_website" type="text" tabIndex={-1} autoComplete="off" />
            </label>

            <label className={fieldErrors.fullName ? 'has-error' : undefined}>
              Full name
              <input
                name="fullName"
                type="text"
                placeholder="Jane Doe"
                autoComplete="name"
                aria-invalid={Boolean(fieldErrors.fullName)}
                aria-describedby={fieldErrors.fullName ? 'career-name-error' : undefined}
                onChange={() => clearField('fullName')}
              />
              <FieldError id="career-name-error" message={fieldErrors.fullName} />
            </label>

            <label className={fieldErrors.email ? 'has-error' : undefined}>
              Email address
              <input
                name="email"
                type="email"
                placeholder="jane@email.com"
                autoComplete="email"
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? 'career-email-error' : undefined}
                onChange={() => clearField('email')}
              />
              <FieldError id="career-email-error" message={fieldErrors.email} />
            </label>

            <label className={fieldErrors.phone ? 'has-error' : undefined}>
              Phone number
              <input
                name="phone"
                type="tel"
                placeholder="+1 234 567 890"
                autoComplete="tel"
                aria-invalid={Boolean(fieldErrors.phone)}
                aria-describedby={fieldErrors.phone ? 'career-phone-error' : undefined}
                onChange={() => clearField('phone')}
              />
              <FieldError id="career-phone-error" message={fieldErrors.phone} />
            </label>

            <label className={`career-file${fieldErrors.resume ? ' has-error' : ''}`}>
              Resume / CV
              <input
                ref={fileRef}
                name="resume"
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                aria-invalid={Boolean(fieldErrors.resume)}
                aria-describedby={fieldErrors.resume ? 'career-resume-error' : undefined}
                onChange={onFileChange}
              />
              <button
                type="button"
                className="career-file-btn"
                onClick={() => fileRef.current?.click()}
              >
                {fileName || 'Upload resume (PDF, DOC)'}
              </button>
              <FieldError id="career-resume-error" message={fieldErrors.resume} />
            </label>

            <label className={fieldErrors.linkedin ? 'has-error' : undefined}>
              LinkedIn / portfolio URL
              <span className="career-optional">Optional</span>
              <input
                name="linkedin"
                type="url"
                placeholder="https://linkedin.com/in/…"
                aria-invalid={Boolean(fieldErrors.linkedin)}
                aria-describedby={fieldErrors.linkedin ? 'career-linkedin-error' : undefined}
                onChange={() => clearField('linkedin')}
              />
              <FieldError id="career-linkedin-error" message={fieldErrors.linkedin} />
            </label>

            <label className={fieldErrors.github ? 'has-error' : undefined}>
              GitHub URL
              <span className="career-optional">Optional</span>
              <input
                name="github"
                type="url"
                placeholder="https://github.com/…"
                aria-invalid={Boolean(fieldErrors.github)}
                aria-describedby={fieldErrors.github ? 'career-github-error' : undefined}
                onChange={() => clearField('github')}
              />
              <FieldError id="career-github-error" message={fieldErrors.github} />
            </label>

            {error ? <p className="form-error">{error}</p> : null}

            <FormCaptcha onTokenChange={setCaptchaToken} />

            <button type="submit" className="btn btn-primary career-submit" disabled={pending}>
              {pending ? 'Submitting…' : CAREER.submitLabel}
            </button>
          </form>
        </div>

        <div className="career-media">
          <img src={CAREER.image} alt="" decoding="async" />
        </div>
      </div>

      <Toast message={toast} open={Boolean(toast)} onClose={() => setToast('')} />
    </main>
  )
}
