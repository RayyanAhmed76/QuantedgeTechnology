import { useRef, useEffect, useCallback, createContext, useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLenis } from 'lenis/react'
import gsap from 'gsap'
import CustomEase from 'gsap/CustomEase'
import SplitText from 'gsap/SplitText'
import { BRAND } from '../data'

gsap.registerPlugin(CustomEase, SplitText)
CustomEase.create('hop', '0.9, 0, 0.1, 1')

const ROWS = 4
const TransitionContext = createContext(null)

export function usePageTransition() {
  const ctx = useContext(TransitionContext)
  if (!ctx) {
    throw new Error('usePageTransition must be used within TransitionProvider')
  }
  return ctx
}

function resolveTo(to, location) {
  if (typeof to === 'string') {
    return new URL(to, window.location.origin)
  }
  const pathname = to.pathname ?? location.pathname
  const search = to.search ?? ''
  const hash = to.hash ?? ''
  return new URL(`${pathname}${search}${hash}`, window.location.origin)
}

function hideOverlay(grid, text, blocks) {
  if (grid) {
    grid.classList.remove('is-active')
    gsap.set(grid, { pointerEvents: 'none', visibility: 'hidden' })
  }
  if (text) {
    gsap.set(text, { autoAlpha: 0, visibility: 'hidden' })
  }
  if (blocks?.length) {
    gsap.set(blocks, { scaleX: 0, clearProps: 'transformOrigin' })
  }
}

function showOverlay(grid, text) {
  if (grid) {
    grid.classList.add('is-active')
    gsap.set(grid, { pointerEvents: 'all', visibility: 'visible' })
  }
  if (text) {
    gsap.set(text, { autoAlpha: 1, visibility: 'visible' })
  }
}

export default function TransitionProvider({ children }) {
  const gridRef = useRef(null)
  const textRef = useRef(null)
  const logoRef = useRef(null)
  const blocksRef = useRef([])
  const headingRef = useRef(null)
  const wordsRef = useRef([])
  const splitRef = useRef(null)
  const busyRef = useRef(false)
  const navigate = useNavigate()
  const location = useLocation()
  const locationRef = useRef(location)
  const lenis = useLenis()
  const lenisRef = useRef(lenis)
  locationRef.current = location
  lenisRef.current = lenis

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  useEffect(() => {
    if (!headingRef.current) return undefined

    splitRef.current = new SplitText(headingRef.current, {
      type: 'words',
      wordsClass: 'word',
      mask: 'words',
    })

    wordsRef.current = splitRef.current.words
    gsap.set(wordsRef.current, { y: '100%' })
    if (logoRef.current) {
      gsap.set(logoRef.current, { autoAlpha: 0, y: 18, scale: 0.88 })
    }

    // Ensure overlay starts fully inert (no leftover from HMR / interrupted tweens)
    hideOverlay(gridRef.current, textRef.current, blocksRef.current.filter(Boolean))

    return () => splitRef.current?.revert()
  }, [])

  const scrollToTop = useCallback(() => {
    const instance = lenisRef.current
    if (instance) {
      instance.scrollTo(0, { immediate: true })
    }
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [])

  const animateIn = useCallback((onComplete) => {
    const blocks = blocksRef.current.filter(Boolean)
    const words = wordsRef.current
    const logo = logoRef.current
    const tl = gsap.timeline({ onComplete })

    showOverlay(gridRef.current, textRef.current)
    tl.set(blocks, { transformOrigin: 'left center', scaleX: 0 })
    if (words?.length) tl.set(words, { y: '100%' })
    if (logo) tl.set(logo, { autoAlpha: 0, y: 18, scale: 0.88 })

    tl.to(blocks, {
      scaleX: 1,
      duration: 1,
      ease: 'hop',
      stagger: 0.075,
    })

    if (logo) {
      tl.to(
        logo,
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.75,
          ease: 'power4.out',
        },
        '-=0.7',
      )
    }

    if (words?.length) {
      tl.to(
        words,
        {
          y: '0%',
          duration: 1,
          ease: 'power4.out',
          stagger: 0.1,
        },
        logo ? '-=0.55' : '-=0.6',
      )
    }

    return tl
  }, [])

  const animateOut = useCallback((onComplete) => {
    const blocks = blocksRef.current.filter(Boolean)
    const words = wordsRef.current
    const logo = logoRef.current

    const tl = gsap.timeline({
      onComplete: () => {
        hideOverlay(gridRef.current, textRef.current, blocks)
        onComplete?.()
      },
    })

    tl.set(blocks, { transformOrigin: 'right center', scaleX: 1 })

    if (logo) {
      tl.to(logo, {
        autoAlpha: 0,
        y: 14,
        scale: 0.92,
        duration: 0.55,
        ease: 'power3.in',
      })
    }

    if (words?.length) {
      tl.to(
        words,
        {
          y: '100%',
          duration: 1,
          ease: 'power4.out',
          stagger: 0.1,
        },
        logo ? '-=0.35' : 0,
      )
    }

    tl.to(
      blocks,
      {
        scaleX: 0,
        duration: 1,
        ease: 'hop',
        stagger: 0.075,
      },
      words?.length || logo ? '-=1' : 0,
    )

    return tl
  }, [])

  const transitionTo = useCallback(
    async (to) => {
      if (busyRef.current) return

      const url = resolveTo(to, locationRef.current)
      const nextPath = url.pathname + url.search
      const current = locationRef.current

      if (url.pathname === current.pathname && url.search === (current.search || '')) {
        if (url.hash) {
          document.querySelector(url.hash)?.scrollIntoView({ behavior: 'smooth' })
        }
        return
      }

      busyRef.current = true

      try {
        await new Promise((resolve) => animateIn(resolve))
        navigate(nextPath + url.hash)
        scrollToTop()
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
        scrollToTop()
        if (url.hash) {
          document.querySelector(url.hash)?.scrollIntoView()
        }
        await new Promise((resolve) => animateOut(resolve))
      } catch {
        hideOverlay(gridRef.current, textRef.current, blocksRef.current.filter(Boolean))
      } finally {
        busyRef.current = false
      }
    },
    [navigate, animateIn, animateOut, scrollToTop],
  )

  return (
    <TransitionContext.Provider value={{ transitionTo }}>
      <div ref={gridRef} className="transition-grid" aria-hidden="true">
        {Array.from({ length: ROWS }).map((_, i) => (
          <div
            key={i}
            className="transition-block"
            ref={(el) => {
              blocksRef.current[i] = el
            }}
          />
        ))}
      </div>

      <div ref={textRef} className="transition-text" aria-hidden="true">
        <div className="transition-brand">
          <span className="transition-logo-anchor">
            <span ref={logoRef} className="transition-logo" aria-hidden="true" />
          </span>
          <h1 ref={headingRef}>{BRAND}.</h1>
        </div>
      </div>

      {children}
    </TransitionContext.Provider>
  )
}
