import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const TARGET_SELECTOR = [
  'main section',
  'main .contact-copy',
  'main .contact-card',
  'main .contact-page-form-card',
  'main .contact-info-card',
  'main .about-content',
  'main .about-banner',
  'main .about-statements > *',
  'main .career-header',
  'main .career-form-card',
  'main .career-media',
  'main .why-card',
  'main .legal-shell > *',
  'main .legal-section',
  'main .simple-page > *',
  'main .wwcd-header',
  'main .wwcd-list > *',
  'main .wwcd-final-cta',
  'main .pillars-section .intro',
  'main .service-page > section',
  'main .service-page > div',
  'main .rcwork-header',
  'main .rcwork-row',
  'main .faq-intro',
  'main .faq-item',
].join(', ')

const SKIP_SELECTOR = [
  '.hero',
  '.dg-hero',
  '.ds-hero',
  '.ws-hero',
  '.service-hero',
  '.services-index-hero',
  '.contact-hero',
  '[data-no-reveal]',
].join(', ')

function shouldSkip(el) {
  if (!(el instanceof HTMLElement)) return true
  if (el.closest(SKIP_SELECTOR)) return true
  if (el.classList.contains('reveal')) return true
  if (el.parentElement?.closest('.reveal')) return true
  if (el.querySelector(':scope .reveal')) return true
  return false
}

export default function AutoScrollReveal() {
  const { pathname } = useLocation()

  useEffect(() => {
    if (pathname.startsWith('/admin')) return undefined

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const observed = new WeakSet()

    const observer = reduce
      ? null
      : new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue
              const el = entry.target
              el.classList.add('in')
              observer?.unobserve(el)
            }
          },
          { threshold: 0.14, rootMargin: '0px 0px -6% 0px' },
        )

    const scan = () => {
      const main = document.querySelector('main')
      if (!main) return

      const nodes = Array.from(main.querySelectorAll(TARGET_SELECTOR))
      const leaves = nodes.filter(
        (el) => !nodes.some((other) => other !== el && el.contains(other)),
      )

      let i = 0
      leaves.forEach((node) => {
        if (shouldSkip(node) || observed.has(node)) return
        const el = node

        el.classList.add('reveal')
        const delay = (i % 5) * 50
        if (delay) el.style.setProperty('--reveal-delay', `${delay}ms`)
        i += 1

        observed.add(el)

        if (reduce) {
          el.classList.add('in')
          return
        }

        const rect = el.getBoundingClientRect()
        const vh = window.innerHeight || 1
        if (rect.top < vh * 0.92 && rect.bottom > 40) {
          requestAnimationFrame(() => el.classList.add('in'))
          return
        }

        observer?.observe(el)
      })
    }

    let debounceTimer = null
    const scheduleScan = () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(scan, 60)
    }

    const t0 = window.setTimeout(scan, 50)
    const t1 = window.setTimeout(scan, 400)

    const mo = new MutationObserver(scheduleScan)
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.clearTimeout(t0)
      window.clearTimeout(t1)
      if (debounceTimer) clearTimeout(debounceTimer)
      mo.disconnect()
      observer?.disconnect()
    }
  }, [pathname])

  return null
}
