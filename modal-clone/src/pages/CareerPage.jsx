import { useRef, useState } from 'react'
import { CAREER } from '../data'
import { submitCareer } from '../lib/api'
import Toast from '../components/Toast'

export default function CareerPage() {
  const [toast, setToast] = useState('')
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const fileRef = useRef(null)

  async function onSubmit(event) {
    event.preventDefault()
    setError('')
    setPending(true)
    const formEl = event.currentTarget
    const form = new FormData(formEl)
    try {
      await submitCareer(form)
      formEl.reset()
      setFileName('')
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
          <form className="career-form" onSubmit={onSubmit}>
            <label className="hp-field" aria-hidden="true">
              Company website
              <input name="company_website" type="text" tabIndex={-1} autoComplete="off" />
            </label>

            <label>
              Full name
              <input name="fullName" type="text" required placeholder="Jane Doe" />
            </label>

            <label>
              Email address
              <input
                name="email"
                type="email"
                required
                placeholder="jane@email.com"
              />
            </label>

            <label>
              Phone number
              <input
                name="phone"
                type="tel"
                required
                placeholder="+1 234 567 890"
              />
            </label>

            <label className="career-file">
              Resume / CV
              <input
                ref={fileRef}
                name="resume"
                type="file"
                required
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={onFileChange}
              />
              <button
                type="button"
                className="career-file-btn"
                onClick={() => fileRef.current?.click()}
              >
                {fileName || 'Upload resume (PDF, DOC)'}
              </button>
            </label>

            <label>
              LinkedIn / portfolio URL
              <span className="career-optional">Optional</span>
              <input
                name="linkedin"
                type="url"
                placeholder="https://linkedin.com/in/…"
              />
            </label>

            <label>
              GitHub URL
              <span className="career-optional">Optional</span>
              <input
                name="github"
                type="url"
                placeholder="https://github.com/…"
              />
            </label>

            {error ? <p className="form-error">{error}</p> : null}

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
