import { BRAND } from '../data'

export default function Logo({ size = 30 }) {
  return (
    <span className="logo" aria-label={BRAND}>
      <svg width={size} height={size} viewBox="0 0 40 40" className="logo-mark">
        <path d="M8 26 L20 6 L24 12 L14 30 Z" fill="#D2FF00" />
        <path d="M18 30 L28 12 L32 18 L24 32 Z" fill="#E8FF66" />
      </svg>
      <span className="logo-word">{BRAND}</span>
    </span>
  )
}
