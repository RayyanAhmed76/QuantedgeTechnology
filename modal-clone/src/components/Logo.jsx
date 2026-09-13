import { BRAND } from '../data'

export default function Logo({ size = 28 }) {
  return (
    <span className="logo" aria-label={BRAND}>
      <span
        className="logo-mark"
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
      <span className="logo-word">{BRAND}</span>
    </span>
  )
}
