import { BRAND } from '../data'
import TransitionLink from '../components/TransitionLink'

export default function NotFoundPage() {
  return (
    <main className="not-found-page">
      <div className="not-found-bg" aria-hidden="true" />
      <div className="not-found-inner">
        <p className="not-found-brand">{BRAND}</p>
        <p className="not-found-code" aria-hidden="true">
          404
        </p>
        <h1 className="not-found-title">
          Page not found<span className="not-found-dot">.</span>
        </h1>
        <p className="not-found-copy">
          This route doesn&apos;t exist — or it moved. Head home, explore services, or get in
          touch.
        </p>
        <div className="not-found-actions">
          <TransitionLink to="/" className="btn btn-primary">
            Back home
          </TransitionLink>
          <TransitionLink to="/services" className="btn btn-ghost">
            Services
          </TransitionLink>
          <TransitionLink to="/contact" className="btn btn-ghost">
            Contact
          </TransitionLink>
        </div>
      </div>
    </main>
  )
}
