import { ScrollTrigger } from '../lib/gsap'
import { useLenis } from 'lenis/react'

export default function LenisScrollSync() {
  useLenis(() => {
    ScrollTrigger.update()
  })
  return null
}
