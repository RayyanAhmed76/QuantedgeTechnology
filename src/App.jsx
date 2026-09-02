import { useEffect, useRef, useState } from 'react'

/* ---------- scroll reveal hook ---------- */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12 }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

const Arrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M7 17L17 7M17 7H8M17 7V16" />
  </svg>
)

/* =================== HEADER =================== */
function Header() {
  return (
    <header className="header">
      <a href="#top" className="logo">Fello</a>
      <nav className="nav">
        <a href="#work">Work</a>
        <a href="#about">About</a>
        <a href="#services">Services</a>
        <a href="#partners">Partners</a>
        <span className="nav-item">Industries <span className="caret">▾</span></span>
        <a href="#blog">Blog</a>
      </nav>
      <a href="#contact" className="btn-pill">Contact Us <span className="knob" /></a>
    </header>
  )
}

/* =================== HERO =================== */
function Hero() {
  const services = ['Creative Strategy', 'Brand Identity', 'Creative Content', 'Web Design']
  return (
    <section className="hero" id="top">
      <div className="hero-inner">
        <div className="hero-fluid" />
        <div className="hero-content">
          <div className="hero-services">
            {services.map((s) => <span key={s}>{s}</span>)}
          </div>
          <h1 className="hero-headline">
            Top tech marketing agency.{' '}
            <span className="fade">Building brands that drive innovative ideas</span>
          </h1>
          <div className="hero-copyright">© 2026 Fello® Agency</div>
          <div className="hero-card">
            <div className="avatar" />
            <div className="meta">
              <div className="role"><b>Director of Business</b> Development <br />at Fello®</div>
              <div className="name">Zachary Ronski</div>
              <button className="mini">Let's talk <span className="knob" /></button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* =================== CLIENTS =================== */
function Clients() {
  const logos = ['Lenovo', 'Mosaic', 'NGen', 'Qualcomm', 'LYNTRIS', 'XANADU',
    'Prollenium', 'Hipo', 'Sphere', 'Revanesse', 'Zapata']
  return (
    <section className="block container" id="partners">
      <div className="section-tag reveal"><span className="dot">+</span> Our clients</div>
      <div className="clients-grid">
        {logos.slice(0, 6).map((l) => (
          <div className="client-card reveal" key={l}>{l}</div>
        ))}
      </div>
      <p className="clients-note reveal">
        We help tech companies make their brands feel as innovative as their products.
        Here are some of our recent projects.
      </p>
    </section>
  )
}

/* =================== WORK =================== */
function Work() {
  const projects = [
    { c: 'p1', t: 'Redefining Science-First Aesthetics', s: 'The Art of Subtle Refinement', tags: ['Strategy', 'Brand Identity', 'Creative Content'], y: '2025' },
    { c: 'p2', t: 'Advancing Manufacturing with Additive 3D Printing', s: 'Additive 3D Printing', tags: ['Creative Content', 'Strategy'], y: '2025' },
    { c: 'p3', t: 'Making Quantum Computer Matter', s: 'Making Quantum Computer Matter', tags: ['Creative Content', 'Strategy'], y: '2024' },
    { c: 'p4', t: 'Collaborating In Augmented Reality', s: 'Collaborating In Augmented Reality', tags: ['Creative Content'], y: '2023' },
  ]
  return (
    <section className="block container" id="work">
      <div className="work-head reveal">Work.</div>
      <div className="work-grid">
        {projects.map((p) => (
          <div className={`project ${p.c} reveal`} key={p.t}>
            <div className="thumb"><span>{p.s}</span></div>
            <div className="project-meta">
              <h3>{p.t}</h3>
              <div className="tags">
                {p.tags.map((t) => <span key={t}>{t}</span>)}
                <span className="year">/ {p.y}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* =================== WHY CHOOSE US =================== */
function WhyChooseUs() {
  return (
    <section className="block container">
      <div className="section-tag reveal" style={{ marginBottom: 34 }}><span className="dot">+</span> Why choose us</div>
      <h2 className="why-head reveal">Building Innovative Brands In The Tech Industry</h2>
      <div className="why-cta reveal">
        Your journey begins with a conversation. Let's talk today.
        <a href="#contact" className="btn-pill">Let's talk <span className="knob" /></a>
      </div>
      <div className="why-split">
        <div />
        <p className="why-blurb reveal">
          <b>No fluff. Just sharp,</b> strategic creative. We build brands and campaigns
          that work—smart ideas, clean execution, and real impact, project after project.
        </p>
      </div>
      <div className="stats-row" style={{ marginTop: 90 }}>
        <div className="stat reveal">
          <div className="num"><Counter to={70} suffix="%" /></div>
          <div className="idx">01</div>
          <p>Of launches led to follow-on growth projects. We've delivered 50+ projects that help companies generate real results.</p>
        </div>
        <div className="stat reveal">
          <div className="num"><Counter to={8} suffix="+" /></div>
          <div className="idx">02</div>
          <p>Verticals covered including AI, Web3, robotics, biotech, and climate tech.</p>
        </div>
      </div>
    </section>
  )
}

/* count-up */
function Counter({ to, suffix = '' }) {
  const ref = useRef(null)
  const [val, setVal] = useState(0)
  useEffect(() => {
    const el = ref.current
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        const dur = 1400, start = performance.now()
        const tick = (now) => {
          const p = Math.min((now - start) / dur, 1)
          const eased = 1 - Math.pow(1 - p, 3)
          setVal(Math.round(eased * to))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
        io.disconnect()
      }
    }, { threshold: 0.5 })
    if (el) io.observe(el)
    return () => io.disconnect()
  }, [to])
  return <span ref={ref}>{val}{suffix}</span>
}

/* =================== SERVICES =================== */
function Services() {
  const items = [
    { n: '001', t: 'Strategy', d: 'Data-backed, insight-driven brand and marketing strategies that drive clarity, consistency, and connection at every touchpoint.', cats: ['Brand Strategy', 'Campaign Development', 'Communications Strategy'] },
    { n: '002', t: 'Brand identity', d: 'Bold, ownable brand systems that express who you are and carve out lasting emotional resonance with your audience.', cats: ['Visual Identity', 'Creative Direction', 'Art Direction', 'Logo Design', 'Design Systems'] },
    { n: '003', t: 'Creative Content', d: "Compelling visuals, motion, and storytelling built to earn attention, build trust, and elevate your brand's presence across platforms.", cats: ['Film Production', 'Motion Design', 'Product Photography', 'Case Study Content'] },
    { n: '004', t: 'Web Design', d: 'Modern, conversion-focused websites that blend seamless UX with a sharp, strategic point of view—built to perform.', cats: ['Website Design', 'UX Strategy', 'Backend Development', 'Brand Application'] },
  ]
  return (
    <section className="block container" id="services">
      <div className="services">
        <div className="container">
          <div className="services-head">
            <div className="section-tag light reveal"><span className="dot">+</span> What we do</div>
            <span className="count" style={{ color: 'rgba(255,255,255,.4)' }}>(4)</span>
          </div>
          <div className="services-head reveal"><h2>Services.</h2></div>
          <div className="services-list">
            {items.map((it) => (
              <div className="service reveal" key={it.n}>
                <div className="sidx">({it.n})</div>
                <h3>{it.t}</h3>
                <div className="desc">{it.d}</div>
                <div className="cats">
                  <span className="lbl">Categories</span>
                  {it.cats.map((c) => <span key={c}>{c}</span>)}
                </div>
              </div>
            ))}
          </div>
          <div className="services-cta reveal">
            <a href="#contact" className="btn-pill btn-light">Get started <span className="knob" /></a>
          </div>
        </div>
      </div>
    </section>
  )
}

/* =================== ABOUT =================== */
function About() {
  return (
    <section className="block container" id="about">
      <div className="section-tag about-tag reveal"><span className="dot">+</span> About us</div>
      <p className="about-copy reveal">
        Our mission is to redefine boundaries, captivate audiences, and drive advancement
        through visionary strategies and cutting-edge campaigns in the tech industry.{' '}
        <span className="fade">
          As a tech marketing agency, we work with bright ideas, innovative tech products,
          and thought-leaders from industries such as manufacturing, life science, hardware,
          defence, and many more.
        </span>
      </p>
    </section>
  )
}

/* =================== TESTIMONIALS =================== */
function Testimonials() {
  const cards = [
    { q: 'Fello delivered smart, strategic creative that elevated our brand.', n: 'Kaitlin Daley', r: 'CMO, Prollenium Medical Technologies' },
    { q: 'You can tell Fello truly has passion for innovation and technology.', n: 'Adam Gellert', r: 'Founder, Hipo' },
    { q: 'The new website has more than tripled our lead generation efforts.', n: 'Alexandra Corey', r: 'Marketing Director, Sphere Tech' },
  ]
  const stats = [
    { to: 184, suffix: 'M+', p: 'Raised by clients post-collaboration' },
    { to: 11, suffix: '+', p: 'Impactful builds from brief to launch' },
    { to: 35, suffix: '%', p: 'Client satisfaction rate' },
    { to: 9, suffix: '%', p: 'faster time-to-market with our creative help' },
  ]
  return (
    <section className="block container">
      <div className="section-tag reveal" style={{ marginBottom: 30 }}><span className="dot">+</span> Testimonials</div>
      <div className="testi-head reveal">
        <h2>Recognized By The Best.</h2>
        <div className="rating"><span className="big">4.9</span><span className="slash">/5</span></div>
      </div>
      <p className="testi-sub reveal">We've delivered 25+ projects that help companies generate real results.</p>
      <div className="why-cta reveal" style={{ marginBottom: 10 }}>
        Trusted by clients worldwide
        <a href="#" className="btn-pill">Read our reviews <span className="knob" /></a>
      </div>
      <div className="testi-grid">
        {cards.map((c) => (
          <div className="testi-card reveal" key={c.n}>
            <div className="stars">★★★★★</div>
            <div className="quote">{c.q}</div>
            <div className="who">
              <div className="n">{c.n}</div>
              <div className="r">{c.r}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="bigstats">
        {stats.map((s) => (
          <div className="bigstat reveal" key={s.p}>
            <div className="num"><Counter to={s.to} suffix={s.suffix} /></div>
            <p>{s.p}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* =================== FAQ =================== */
function FAQ() {
  const data = [
    { q: 'What exactly do we do?', a: "We're a creative partner for tech companies. We build brands, launch products, run campaigns, and create content that actually drives growth." },
    { q: 'Do you only work with tech companies?', a: 'Not exclusively — but tech is our bread and butter. We thrive in fast-moving, innovation-led spaces where smart strategy and sharp creative make the biggest impact.' },
    { q: 'Do you offer retainers or just project work?', a: "Both. If you need a sprint to launch something, we'll do it. If you want a long-term partner across design, content, and strategy — that's where we shine." },
    { q: 'What makes you different from other agencies?', a: "We're intentionally small and nimble. That means faster turnarounds, fewer layers, and more direct collaboration. You work with the people doing the work — not a bloated account team." },
    { q: 'How do you help tech companies grow?', a: "We combine brand, content, and go-to-market strategy into one clear plan. That means fewer silos, faster execution, and more momentum—whether you're raising a round, launching a product, or entering a new market." },
  ]
  const [open, setOpen] = useState(0)
  return (
    <section className="block container">
      <div className="faq-grid">
        <div>
          <div className="section-tag reveal" style={{ marginBottom: 30 }}><span className="dot">+</span> FAQ</div>
          <div className="faq-title reveal">
            FAQ.
            <span className="sub">Got questions? We've got answers. Here's everything you need to know about working with us.</span>
          </div>
        </div>
        <div className="faq-list">
          {data.map((d, i) => (
            <div className={`faq-item reveal ${open === i ? 'open' : ''}`} key={d.q}>
              <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
                {d.q}
                <span className="faq-icon">+</span>
              </button>
              <div className="faq-a">{d.a}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* =================== BLOG =================== */
function Blog() {
  const posts = [
    { date: 'September 2, 2026', t: 'How Much Does a Rebrand Cost? A 5-Tier Breakdown for B2B Tech' },
    { date: 'September 2, 2026', t: 'How Much of Your Seed Round Should Go to Brand and Go-to-Market' },
  ]
  return (
    <section className="block container" id="blog">
      <div className="blog-head reveal">
        <h2>Newest trends and insights from our team.</h2>
        <a href="#" className="btn-pill">See all <span className="knob" /></a>
      </div>
      <div className="blog-grid">
        {posts.map((p) => (
          <div className="blog-card reveal" key={p.t}>
            <div className="date">{p.date}</div>
            <h3>{p.t}</h3>
          </div>
        ))}
        <div className="blog-feature reveal"><span>What's new in tech?</span></div>
      </div>
    </section>
  )
}

/* =================== CONTACT =================== */
function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', agree: false })
  const submit = (e) => {
    e.preventDefault()
    alert('Thanks ' + (form.name || 'there') + "! We'll be in touch shortly.")
  }
  return (
    <section className="block container" id="contact">
      <div className="contact">
        <div className="contact-inner">
          <div className="contact-left">
            <div className="section-tag light reveal" style={{ marginBottom: 24 }}><span className="dot">+</span> Have a project in mind?</div>
            <h2 className="reveal">Let's talk.</h2>
            <p className="reveal">Tell us about your project whether it's a brand, campaign, or marketing.</p>
            <div className="contact-points">
              <div className="cp reveal"><b>Quick response.</b><span>If you're ready to create and collaborate, we'd love to hear from you.</span></div>
              <div className="cp reveal"><b>Clear next steps.</b><span>After the consultation, we'll provide you with a detailed plan and timeline.</span></div>
            </div>
          </div>
          <form className="contact-form reveal" onSubmit={submit}>
            <div className="field">
              <label>Your name*</label>
              <input placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="field">
              <label>E-mail*</label>
              <input type="email" placeholder="hello@site.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="field">
              <label>Phone Number*</label>
              <input placeholder="+1 703-701-9964" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            </div>
            <label className="agree">
              <input type="checkbox" checked={form.agree} onChange={(e) => setForm({ ...form, agree: e.target.checked })} required />
              I agree with the <b>Privacy Policy</b> of Fello.
            </label>
            <button className="btn-submit" type="submit">Send Message</button>
          </form>
        </div>
      </div>
    </section>
  )
}

/* =================== FOOTER =================== */
function Footer() {
  return (
    <footer className="footer container">
      <div className="footer-top">
        <div>
          <div className="phone">+1 (647)-879-4904</div>
          <a className="email" href="mailto:contact@fello.agency"><span className="dot">+</span>contact@fello.agency</a>
          <h4>Find us</h4>
          <div className="addr">694 Queen St W Third Floor,<br />Toronto, ON M6J 1E7<br />Canada</div>
        </div>
        <div>
          <h4>Navigation</h4>
          <div className="footer-links">
            <a href="#top">Home</a><a href="#about">About</a><a href="#work">Work</a>
            <a href="#services">Services</a><a href="#blog">Blog</a>
            <a href="#partners">Partners</a><a href="#contact">Contact</a>
          </div>
        </div>
        <div>
          <h4>Industries</h4>
          <div className="footer-links">
            <a href="#">Quantum Computing</a><a href="#">Advanced Manufacturing</a>
            <a href="#">MedTech &amp; Life Science</a><a href="#">Defense &amp; Aerospace</a>
          </div>
          <h4 style={{ marginTop: 40 }}>Social</h4>
          <div className="footer-links social">
            <a href="#">Linkedin <Arrow /></a>
            <a href="#">Instagram <Arrow /></a>
            <a href="#">Clutch Reviews <Arrow /></a>
          </div>
        </div>
      </div>
      <div className="footer-word">
        <div className="big">Fello<sup>®</sup></div>
        <div className="tag">Agency</div>
      </div>
      <div className="footer-bottom">
        <span>© 2025 Fello Agency</span>
        <span>Privacy Policy · Terms of Service</span>
      </div>
    </footer>
  )
}

/* =================== APP =================== */
export default function App() {
  useReveal()
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Clients />
        <Work />
        <WhyChooseUs />
        <Services />
        <About />
        <Testimonials />
        <FAQ />
        <Blog />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
