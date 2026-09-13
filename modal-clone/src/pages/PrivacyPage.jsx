import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import LegalBackHeader from '../components/LegalBackHeader'
import { PRIVACY_POLICY } from '../data/privacy'

const RETURN_KEY = 'qe-return-to'
const LEGAL_PATHS = ['/privacy', '/cookie-policy']

function MetaList({ items, className = 'legal-meta' }) {
  if (!items?.length) return null
  return (
    <dl className={className}>
      {items.map((item) => (
        <div key={`${item.label}-${item.value}`}>
          <dt>{item.label}</dt>
          <dd>
            {item.href ? <a href={item.href}>{item.value}</a> : item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function PolicySection({ section }) {
  return (
    <section className="legal-section">
      <h2>{section.heading}</h2>
      {section.paragraphs?.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      {section.subsections?.map((sub) => (
        <div key={sub.heading}>
          <h3>{sub.heading}</h3>
          {sub.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      ))}
      <MetaList items={section.meta} />
    </section>
  )
}

export default function PrivacyPage() {
  const location = useLocation()

  useEffect(() => {
    const from = location.state?.from
    if (typeof from === 'string' && from && !LEGAL_PATHS.includes(from)) {
      sessionStorage.setItem(RETURN_KEY, from)
    }
  }, [location.state])

  return (
    <main className="legal-page">
      <article className="legal-shell">
        <LegalBackHeader title={PRIVACY_POLICY.title} />
        <p className="legal-updated">Last updated: {PRIVACY_POLICY.updated}</p>

        {PRIVACY_POLICY.leads.map((lead) => (
          <p key={lead} className="legal-lead">
            {lead}
          </p>
        ))}

        {PRIVACY_POLICY.sections.map((section) => (
          <PolicySection key={section.heading} section={section} />
        ))}
      </article>
    </main>
  )
}

