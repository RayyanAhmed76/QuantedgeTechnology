import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useLenis } from 'lenis/react'
import { PRIVACY_POLICY } from '../data/privacy'

const PrivacyContext = createContext(null)

export function usePrivacy() {
  const ctx = useContext(PrivacyContext)
  if (!ctx) {
    throw new Error('usePrivacy must be used within PrivacyProvider')
  }
  return ctx
}

function isInsideModalScroll(target) {
  return Boolean(target?.closest?.('.privacy-modal-body'))
}

export default function PrivacyProvider({ children }) {
  const [open, setOpen] = useState(false)
  const onCloseRef = useRef(null)
  const panelRef = useRef(null)
  const lenis = useLenis()

  const closePrivacy = useCallback(() => {
    setOpen(false)
    const cb = onCloseRef.current
    onCloseRef.current = null
    // Defer route callbacks so scroll lock cleanup runs first without navigation jumps
    if (cb) {
      queueMicrotask(() => cb())
    }
  }, [])

  const openPrivacy = useCallback((options = {}) => {
    onCloseRef.current = typeof options.onClose === 'function' ? options.onClose : null
    setOpen(true)
  }, [])

  useEffect(() => {
    if (!open) return undefined

    const html = document.documentElement
    // Lock with Lenis + overflow only; do NOT use position:fixed (that resets scroll to 0)
    html.classList.add('privacy-modal-open')
    lenis?.stop?.()

    function onKeyDown(event) {
      if (event.key === 'Escape') closePrivacy()
    }

    function preventBackgroundScroll(event) {
      if (isInsideModalScroll(event.target)) return
      event.preventDefault()
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('wheel', preventBackgroundScroll, { passive: false })
    document.addEventListener('touchmove', preventBackgroundScroll, { passive: false })
    panelRef.current?.focus?.({ preventScroll: true })

    return () => {
      html.classList.remove('privacy-modal-open')
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('wheel', preventBackgroundScroll)
      document.removeEventListener('touchmove', preventBackgroundScroll)
      lenis?.start?.()
    }
  }, [open, closePrivacy, lenis])

  return (
    <PrivacyContext.Provider value={{ openPrivacy, closePrivacy, isOpen: open }}>
      {children}
      {open ? (
        <div
          className="privacy-modal-overlay"
          role="presentation"
          onClick={closePrivacy}
        >
          <div
            ref={panelRef}
            className="privacy-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="privacy-modal-title"
            tabIndex={-1}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="privacy-modal-bar">
              <div className="privacy-modal-heading">
                <h2 id="privacy-modal-title">{PRIVACY_POLICY.title}</h2>
                <p className="privacy-modal-updated">Last updated: {PRIVACY_POLICY.updated}</p>
              </div>
              <button type="button" className="btn privacy-modal-close" onClick={closePrivacy}>
                Close
              </button>
            </div>
            <div className="privacy-modal-body">
              {PRIVACY_POLICY.leads.map((lead) => (
                <p key={lead} className="privacy-modal-intro">
                  {lead}
                </p>
              ))}
              {PRIVACY_POLICY.sections.map((section) => (
                <section key={section.heading} className="privacy-modal-section">
                  <h3>{section.heading}</h3>
                  {section.paragraphs?.map((text) => (
                    <p key={text}>{text}</p>
                  ))}
                  {section.subsections?.map((sub) => (
                    <div key={sub.heading}>
                      <h4>{sub.heading}</h4>
                      {sub.paragraphs.map((text) => (
                        <p key={text}>{text}</p>
                      ))}
                    </div>
                  ))}
                  {section.meta?.length ? (
                    <dl className="privacy-modal-meta">
                      {section.meta.map((item) => (
                        <div key={`${item.label}-${item.value}`}>
                          <dt>{item.label}</dt>
                          <dd>
                            {item.href ? <a href={item.href}>{item.value}</a> : item.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                </section>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </PrivacyContext.Provider>
  )
}
