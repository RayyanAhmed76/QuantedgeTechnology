import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useLenis } from 'lenis/react'

/**
 * Reset scroll on every route change (Lenis + native).
 * Complements TransitionProvider.scrollToTop for direct navigations.
 */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation()
  const lenis = useLenis()

  useEffect(() => {
    if (hash) return undefined

    const reset = () => {
      if (lenis) {
        lenis.scrollTo(0, { immediate: true })
      }
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }

    reset()
    const id = requestAnimationFrame(reset)
    return () => cancelAnimationFrame(id)
  }, [pathname, search, hash, lenis])

  return null
}
