import { useRef, useEffect, useCallback, createContext, useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
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

export default function TransitionProvider({ children }) {
  const gridRef = useRef(null)
  const textRef = useRef(null)
  const blocksRef = useRef([])
  const headingRef = useRef(null)
  const wordsRef = useRef([])
  const splitRef = useRef(null)
  const busyRef = useRef(false)
  const navigate = useNavigate()
  const location = useLocation()
  const locationRef = useRef(location)
  locationRef.current = location

  useEffect(() => {
    if (!headingRef.current) return

    splitRef.current = new SplitText(headingRef.current, {
      type: 'words',
      wordsClass: 'word',
      mask: 'words',
    })

    wordsRef.current = splitRef.current.words
    gsap.set(wordsRef.current, { y: '100%' })

    return () => splitRef.current?.revert()
  }, [])

  const animateIn = useCallback((onComplete) => {
    const blocks = blocksRef.current.filter(Boolean)
    const words = wordsRef.current
    const tl = gsap.timeline({ onComplete })

    tl.set(gridRef.current, { pointerEvents: 'all' })
    tl.set(textRef.current, { autoAlpha: 1 })
    tl.set(blocks, { transformOrigin: 'left center', scaleX: 0 })
    if (words?.length) tl.set(words, { y: '100%' })

    tl.to(blocks, {
      scaleX: 1,
      duration: 1,
      ease: 'hop',
      stagger: 0.075,
    })

    if (words?.length) {
      tl.to(
        words,
        {
          y: '0%',
          duration: 1,
          ease: 'power4.out',
          stagger: 0.1,
        },
        '-=0.6',
      )
    }

    return tl
  }, [])

  const animateOut = useCallback((onComplete) => {
    const blocks = blocksRef.current.filter(Boolean)
    const words = wordsRef.current

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(gridRef.current, { pointerEvents: 'none' })
        gsap.set(textRef.current, { autoAlpha: 0 })
        onComplete?.()
      },
    })

    tl.set(blocks, { transformOrigin: 'right center', scaleX: 1 })

    if (words?.length) {
      tl.to(words, {
        y: '100%',
        duration: 1,
        ease: 'power4.out',
        stagger: 0.1,
      })
    }

    tl.to(
      blocks,
      {
        scaleX: 0,
        duration: 1,
        ease: 'hop',
        stagger: 0.075,
      },
      words?.length ? '-=1' : 0,
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
        window.scrollTo(0, 0)
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
        if (url.hash) {
          document.querySelector(url.hash)?.scrollIntoView()
        }
        await new Promise((resolve) => animateOut(resolve))
      } finally {
        busyRef.current = false
      }
    },
    [navigate, animateIn, animateOut],
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
        <h1 ref={headingRef}>{BRAND}.</h1>
      </div>

      {children}
    </TransitionContext.Provider>
  )
}
