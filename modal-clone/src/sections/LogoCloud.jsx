import { LOGO_CLOUD } from '../data/site'

export default function LogoCloud() {
  return (
    <section className="logos">
      <div className="logos-row">
        {LOGO_CLOUD.row1.map((label) => (
          <span key={label} className="logo-item">{label}</span>
        ))}
      </div>
      <div className="logos-row">
        {LOGO_CLOUD.row2.map((label) => (
          <span key={label} className="logo-item">{label}</span>
        ))}
      </div>
    </section>
  )
}
