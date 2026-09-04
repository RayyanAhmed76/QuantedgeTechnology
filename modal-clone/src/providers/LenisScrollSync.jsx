import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLenis } from 'lenis/react'

export default function LenisScrollSync() {
  useLenis(() => {
    ScrollTrigger.update()
  })
  return null
}
