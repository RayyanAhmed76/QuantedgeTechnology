import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function Toast({ message, open, onClose, duration = 4000 }) {
  useEffect(() => {
    if (!open) return undefined
    const timer = window.setTimeout(() => onClose?.(), duration)
    return () => window.clearTimeout(timer)
  }, [open, duration, onClose])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div className="toast" role="status" aria-live="polite">
      <p>{message}</p>
      <button type="button" className="toast-close" onClick={onClose} aria-label="Dismiss">
        ×
      </button>
    </div>,
    document.body,
  )
}
