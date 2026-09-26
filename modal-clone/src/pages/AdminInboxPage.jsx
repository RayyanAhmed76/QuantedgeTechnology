import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import {
  adminDeleteSubmission,
  adminFetchFileBlob,
  adminGetSubmission,
  adminListSubmissions,
  adminLogout,
  adminMe,
  adminUpdateStatus,
} from '../lib/api'

const TYPE_OPTIONS = [
  { value: '', label: 'All forms' },
  { value: 'project_inquiry', label: 'Project inquiry' },
  { value: 'contact_message', label: 'Contact message' },
  { value: 'career_application', label: 'Career application' },
  { value: 'consultancy_inquiry', label: 'Consultancy' },
]

const SITE_OPTIONS = [
  { value: '', label: 'All sites' },
  { value: 'main', label: 'Main site' },
  { value: 'consultancy', label: 'Consultancy site' },
]

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'new', label: 'New' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'archived', label: 'Archived' },
  { value: 'spam', label: 'Spam' },
]

export default function AdminInboxPage() {
  const navigate = useNavigate()
  const [admin, setAdmin] = useState(null)
  const [checking, setChecking] = useState(true)
  const [items, setItems] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [error, setError] = useState('')
  const [formType, setFormType] = useState('')
  const [site, setSite] = useState('')
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [previewName, setPreviewName] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const externalPreviewUrlsRef = useRef([])

  function closePreview() {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return ''
    })
    setPreviewName('')
  }

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  useEffect(() => {
    return () => {
      externalPreviewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
      externalPreviewUrlsRef.current = []
    }
  }, [])

  // Freeze the inbox behind the desktop preview modal
  useEffect(() => {
    if (!previewUrl) return

    const html = document.documentElement
    const { body } = document
    const scrollY = window.scrollY

    html.classList.add('admin-preview-open')
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'

    return () => {
      html.classList.remove('admin-preview-open')
      body.style.position = ''
      body.style.top = ''
      body.style.left = ''
      body.style.right = ''
      body.style.width = ''
      window.scrollTo(0, scrollY)
    }
  }, [previewUrl])

  function prefersNativePdfViewer() {
    return window.matchMedia('(max-width: 900px), (pointer: coarse)').matches
  }

  async function openResume() {
    if (!detail?.file) return
    try {
      setPreviewLoading(true)
      setError('')
      closePreview()
      const blob = await adminFetchFileBlob(
        detail.id,
        detail.file.id,
        detail.file.mimeType,
      )
      const url = URL.createObjectURL(blob)
      const name = detail.file.originalName || 'resume.pdf'

      // Mobile browsers can't reliably scroll PDFs inside iframes; use native viewer
      if (prefersNativePdfViewer()) {
        const tab = window.open(url, '_blank')
        if (tab) {
          externalPreviewUrlsRef.current.push(url)
          return
        }
        // Popup blocked: full-page native viewer (browser back returns to inbox)
        externalPreviewUrlsRef.current.push(url)
        window.location.assign(url)
        return
      }

      setPreviewUrl(url)
      setPreviewName(name)
    } catch (err) {
      setError(err.message || 'Could not open resume')
    } finally {
      setPreviewLoading(false)
    }
  }

  useEffect(() => {
    let alive = true
    adminMe()
      .then((data) => {
        if (alive) setAdmin(data.admin)
      })
      .catch(() => {
        if (alive) setAdmin(null)
      })
      .finally(() => {
        if (alive) setChecking(false)
      })
    return () => {
      alive = false
    }
  }, [])

  async function loadList() {
    setError('')
    try {
      const data = await adminListSubmissions({ form_type: formType, status, site, q })
      setItems(data.items || [])
    } catch (err) {
      setError(err.message || 'Failed to load submissions')
      if (String(err.message).toLowerCase().includes('unauthorized')) {
        setAdmin(null)
      }
    }
  }

  useEffect(() => {
    if (!admin) return
    loadList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin, formType, status, site])

  useEffect(() => {
    if (!selectedId || !admin) {
      setDetail(null)
      return
    }
    let alive = true
    adminGetSubmission(selectedId)
      .then((data) => {
        if (alive) setDetail(data)
      })
      .catch((err) => {
        if (alive) setError(err.message || 'Failed to load detail')
      })
    return () => {
      alive = false
    }
  }, [selectedId, admin])

  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) || null,
    [items, selectedId],
  )

  async function onLogout() {
    await adminLogout().catch(() => {})
    navigate('/admin/login', { replace: true })
  }

  async function onStatusChange(next) {
    if (!detail) return
    try {
      await adminUpdateStatus(detail.id, next)
      setDetail((prev) => (prev ? { ...prev, status: next } : prev))
      setItems((prev) => prev.map((item) => (item.id === detail.id ? { ...item, status: next } : item)))
    } catch (err) {
      setError(err.message || 'Could not update status')
    }
  }

  async function onDelete() {
    if (!detail || deleting) return
    const label = detail.email || detail.name || 'this submission'
    const confirmed = window.confirm(
      `Delete ${label} permanently?\n\nThis cannot be undone. Attached resumes will be removed too.`,
    )
    if (!confirmed) return

    setDeleting(true)
    setError('')
    try {
      const id = detail.id
      await adminDeleteSubmission(id)
      closePreview()
      setItems((prev) => prev.filter((item) => item.id !== id))
      setSelectedId(null)
      setDetail(null)
    } catch (err) {
      setError(err.message || 'Could not delete submission')
    } finally {
      setDeleting(false)
    }
  }

  function onSearch(event) {
    event.preventDefault()
    loadList()
  }

  if (checking) {
    return (
      <main className="admin-page">
        <p className="admin-muted">Loading…</p>
      </main>
    )
  }

  if (!admin) return <Navigate to="/admin/login" replace />

  return (
    <main className="admin-page">
      <header className="admin-top">
        <div className="admin-top-bar">
          <p className="admin-eyebrow">Inbox</p>
          <button type="button" className="btn btn-ghost admin-logout" onClick={onLogout}>
            Log out
          </button>
        </div>
        <div className="admin-top-main">
          <h1>Submissions</h1>
          <span className="admin-muted admin-top-email">{admin.email}</span>
        </div>
      </header>

      <div className="admin-filters">
        <select value={formType} onChange={(e) => setFormType(e.target.value)}>
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value || 'all-types'} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select value={site} onChange={(e) => setSite(e.target.value)}>
          {SITE_OPTIONS.map((opt) => (
            <option key={opt.value || 'all-sites'} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value || 'all-status'} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <form className="admin-search" onSubmit={onSearch}>
          <input
            type="search"
            placeholder="Search name, email, message"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="admin-layout">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Received</th>
                <th>Type</th>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>File</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="admin-muted">
                    No submissions yet.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className={item.id === selectedId ? 'is-active' : ''}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <td>{item.createdAt}</td>
                    <td>
                      <span className={`admin-badge type-${item.formType}`}>{item.formLabel}</span>
                    </td>
                    <td>{item.name || '-'}</td>
                    <td>{item.email}</td>
                    <td>
                      <span className={`admin-status status-${item.status}`}>{item.status}</span>
                    </td>
                    <td>{item.hasFile ? 'Resume' : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <aside className="admin-detail">
          {!detail ? (
            <p className="admin-muted">Select a submission to view details.</p>
          ) : (
            <>
              <div className="admin-detail-head">
                <h2>{detail.formLabel}</h2>
                <select
                  value={detail.status}
                  onChange={(e) => onStatusChange(e.target.value)}
                >
                  {STATUS_OPTIONS.filter((o) => o.value).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <dl className="admin-dl">
                <div>
                  <dt>Source</dt>
                  <dd>
                    <span
                      className={`admin-badge ${
                        detail.sourceSite === 'consultancy' ? 'site-consultancy' : 'site-main'
                      }`}
                    >
                      {detail.sourceSiteLabel || detail.sourceSite || 'Main site'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt>Name</dt>
                  <dd>{detail.name || '-'}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>
                    <a href={`mailto:${detail.email}`}>{detail.email}</a>
                  </dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd>{detail.phone || '-'}</dd>
                </div>
                {detail.service ? (
                  <div>
                    <dt>Service</dt>
                    <dd>{detail.service}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>Received</dt>
                  <dd>{detail.createdAt}</dd>
                </div>
                {detail.linkedinUrl ? (
                  <div>
                    <dt>LinkedIn</dt>
                    <dd>
                      <a href={detail.linkedinUrl} target="_blank" rel="noreferrer">
                        {detail.linkedinUrl}
                      </a>
                    </dd>
                  </div>
                ) : null}
                {detail.githubUrl ? (
                  <div>
                    <dt>GitHub</dt>
                    <dd>
                      <a href={detail.githubUrl} target="_blank" rel="noreferrer">
                        {detail.githubUrl}
                      </a>
                    </dd>
                  </div>
                ) : null}
              </dl>
              {detail.message ? (
                <div className="admin-message">
                  <h3>Message</h3>
                  <p>{detail.message}</p>
                </div>
              ) : null}
              {detail.file ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={previewLoading || deleting}
                  onClick={openResume}
                >
                  {previewLoading ? 'Opening…' : `View ${detail.file.originalName}`}
                </button>
              ) : null}
              <div className="admin-detail-actions">
                <button
                  type="button"
                  className="btn admin-delete-btn"
                  disabled={deleting}
                  onClick={onDelete}
                >
                  {deleting ? 'Deleting…' : 'Delete record'}
                </button>
              </div>
              {selected?.preview && !detail.message ? (
                <p className="admin-muted">{selected.preview}</p>
              ) : null}
            </>
          )}
        </aside>
      </div>

      <p className="admin-foot">
        <Link to="/" className="btn btn-ghost admin-back-link">
          Back to site
        </Link>
      </p>

      {previewUrl ? (
        <div
          className="admin-preview-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={previewName}
          onClick={closePreview}
        >
          <div className="admin-preview" onClick={(e) => e.stopPropagation()}>
            <div className="admin-preview-bar">
              <strong>{previewName}</strong>
              <button type="button" className="btn" onClick={closePreview}>
                Close
              </button>
            </div>
            <iframe
              title={previewName}
              src={previewUrl}
              className="admin-preview-frame"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      ) : null}
    </main>
  )
}
