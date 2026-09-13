import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import LegalBackHeader from '../components/LegalBackHeader'

const RETURN_KEY = 'qe-return-to'
const LEGAL_PATHS = ['/privacy', '/cookie-policy']

export default function CookiePolicyPage() {
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
        <LegalBackHeader title="Cookie Notice" />

        <p className="legal-updated">Last Updated: September 12, 2026</p>

        <p className="legal-lead">
          QUANT EDGE DATA SOLUTIONS LIMITED (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) may use
          cookies and similar technologies on our website where needed for the site to work
          properly. This Cookie Notice explains what cookies are, how we use them today, and how
          you can manage them in your browser.
        </p>

        <section className="legal-section">
          <h2>What Are Cookies?</h2>
          <p>
            Cookies are small text files stored on your device (computer, tablet, or mobile) when
            you visit a website. They help the site recognize your device, remember your
            preferences, and support core functionality.
          </p>
        </section>

        <section className="legal-section">
          <h2>Types of Cookies We Use</h2>

          <h3>Strictly Necessary Cookies</h3>
          <p>
            Essential for the website to function properly. They enable core features such as
            security, network management, session continuity, and authenticated admin access. You
            cannot opt out of these if you want to use those parts of the site.
          </p>

          <h3>Performance, Analytics, Functional &amp; Advertising Cookies</h3>
          <p>
            With your consent, we use Google Analytics to understand how visitors use this website
            (for example page views and traffic sources). These analytics cookies are loaded only
            after you choose <strong>Accept all cookies</strong>, or enable Analytics in{' '}
            <strong>Manage cookies</strong> and save your preferences. If you reject non-essential
            cookies or leave Analytics off, Google Analytics is not loaded.
          </p>
          <p>
            We do not currently use separate advertising cookies. If that changes, we will update
            this notice and ask for consent where required.
          </p>
        </section>

        <section className="legal-section">
          <h2>Managing Your Cookie Preferences</h2>
          <p>
            You can control cookies through your browser settings. Most browsers let you block,
            restrict, or delete cookies. Note that blocking strictly necessary cookies may impact
            website functionality, including admin sign-in. You can also reopen this site&apos;s
            cookie banner anytime via <strong>Cookie settings</strong> in the footer.
          </p>
        </section>

        <section className="legal-section">
          <h2>Contact Us</h2>
          <p>
            If you have any questions regarding our use of cookies or data privacy, please contact
            us at:
          </p>
          <dl className="legal-meta">
            <div>
              <dt>Email</dt>
              <dd>
                <a href="mailto:info@quantedgedatasolutions.com">
                  info@quantedgedatasolutions.com
                </a>
              </dd>
            </div>
            <div>
              <dt>Address</dt>
              <dd>
                QUANT EDGE DATA SOLUTIONS LIMITED, 2 KOSTA VARNALI STREET, NICOSIA 1057 CYPRUS
              </dd>
            </div>
          </dl>
        </section>
      </article>
    </main>
  )
}
