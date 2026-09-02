import { useState } from 'react'

/* ---------- Small building blocks ---------- */

function Logo({ size = 30 }) {
  return (
    <span className="logo" aria-label="Modal">
      <svg width={size} height={size} viewBox="0 0 40 40" className="logo-mark">
        <path d="M8 26 L20 6 L24 12 L14 30 Z" fill="#4f8cff" />
        <path d="M18 30 L28 12 L32 18 L24 32 Z" fill="#7db0ff" />
      </svg>
      <span className="logo-word">Modal</span>
    </span>
  )
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M4 12L12 4M12 4H5M12 4V11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ---------- Announcement bar ---------- */

function Announcement() {
  return (
    <div className="announce">
      <span>Runtime, the conference for engineers running AI in production. Oct. 1 in SF&nbsp;&nbsp;</span>
      <a href="#">Register now →</a>
    </div>
  )
}

/* ---------- Navbar ---------- */

const NAV = ['Product', 'Solutions', 'Resources', 'Customers', 'Pricing', 'Docs']

function Navbar() {
  return (
    <header className="nav-wrap">
      <nav className="nav">
        <Logo />
        <ul className="nav-links">
          {NAV.map((n) => (
            <li key={n}><a href="#">{n}</a></li>
          ))}
        </ul>
        <div className="nav-right">
          <a href="#" className="login">Log In</a>
          <a href="#" className="signup">
            Sign Up
            <span className="signup-icon"><ArrowIcon /></span>
          </a>
        </div>
      </nav>
    </header>
  )
}

/* ---------- Hero ---------- */

function Hero() {
  return (
    <section className="hero">
      <h1>
        <span className="accent">AI infrastructure</span> that<br />developers love
      </h1>
      <p className="hero-sub">
        Run inference, training, batch processing, and sandboxes with sub-second
        cold starts, instant autoscaling, and a developer experience that feels local.
      </p>
      <div className="hero-cta">
        <a href="#" className="btn btn-primary">Get Started</a>
        <a href="#" className="btn btn-dark">Contact Us</a>
      </div>
      <div className="hero-glow" />
    </section>
  )
}

/* ---------- Logo cloud ---------- */

const LOGOS_ROW1 = ['DOORDASH', 'Meta', 'FATHOM', 'hume', 'ramp', 'Cognition', 'runway', 'SUNO', 'blend']
const LOGOS_ROW2 = ['lovable', 'David AI', 'Contextual AI', 'PostHog', 'Physical Intelligence', 'Resolve.ai', 'Decagon', 'Applied Compute']

function LogoCloud() {
  return (
    <section className="logos">
      <div className="logos-row">
        {LOGOS_ROW1.map((l) => <span key={l} className="logo-item">{l}</span>)}
      </div>
      <div className="logos-row">
        {LOGOS_ROW2.map((l) => <span key={l} className="logo-item">{l}</span>)}
      </div>
    </section>
  )
}

/* ---------- Code / terminal mock ---------- */

function TerminalCard({ title, children }) {
  return (
    <div className="terminal">
      <div className="terminal-bar">
        <span className="dot" /><span className="dot" /><span className="dot" />
        {title && <span className="terminal-title">{title}</span>}
      </div>
      <div className="terminal-body">{children}</div>
    </div>
  )
}

const CODE_LINES = [
  <><span className="c-var">inference_image</span> = (</>,
  <>{'    '}Image.debian_slim()</>,
  <>{'    '}.uv_pip_install(</>,
  <>{'        '}<span className="c-str">"torch==2.7.1"</span>,</>,
  <>{'        '}<span className="c-str">"transformers==4.53.2"</span>,</>,
  <>{'    '})</>,
  <>)</>,
  <><span className="c-dec">@app.function</span>(image=inference_image, gpu=<span className="c-str">"B200"</span>)</>,
  <><span className="c-kw">def</span> <span className="c-fn">inference</span>():</>,
  <>{'    '}...</>,
]

function ProductionCloud() {
  return (
    <section className="section">
      <h2 className="section-title">The production cloud for AI.</h2>
      <div className="grid-2">
        <div className="feature">
          <TerminalCard>
            <pre className="code">
              {CODE_LINES.map((line, i) => (
                <div className="code-line" key={i}>
                  <span className="ln">{String(i + 1).padStart(2, '0')}</span>
                  <span>{line}</span>
                </div>
              ))}
            </pre>
          </TerminalCard>
          <p className="eyebrow">MODAL SDK</p>
          <h3 className="feature-title">Your cloud environment, in code.</h3>
          <p className="feature-text">
            Stay in Python, ship to the cloud. Composable primitives that specify
            everything from logic to hardware in one place.
          </p>
        </div>

        <div className="feature">
          <TerminalCard title="Stable Diffusion Cold Starts">
            <div className="bench">
              {[
                ['Modal (with memory snapshots)', '0.00s', 6, 'accent'],
                ['Modal', '0.00s', 10, 'accent'],
                ['Provider A', '0s', 42, ''],
                ['Provider B', '0s', 55, ''],
                ['Kubernetes + EC2', '0s', 78, ''],
              ].map(([label, time, w, cls]) => (
                <div className="bench-row" key={label}>
                  <div className="bench-head">
                    <span className={`bench-label ${cls}`}>{label}</span>
                    <span className="bench-time">{time}</span>
                  </div>
                  <div className="bench-track">
                    <div className={`bench-fill ${cls}`} style={{ width: `${w}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </TerminalCard>
          <p className="eyebrow">AI-NATIVE RUNTIME</p>
          <h3 className="feature-title">Built for speed, at any scale.</h3>
          <p className="feature-text">
            Engineered from the ground up for heavy AI workloads, with super-fast
            autoscaling and containers that boot instantly.
          </p>
        </div>
      </div>
    </section>
  )
}

/* ---------- GPU / scaling feature ---------- */

function ScaleFeatures() {
  return (
    <section className="section">
      <div className="grid-2">
        <div className="feature">
          <TerminalCard>
            <pre className="code code-lg">
              <div className="code-line">
                <span className="ln">01</span>
                <span>
                  <span className="c-dec">@app.function</span>(
                  <span className="gpu-pill gpu-ghost">gpu="B200"</span>
                </span>
              </div>
              <div className="code-line">
                <span className="ln" />
                <span><span className="gpu-pill gpu-active">gpu="A100"</span>{'   '})</span>
              </div>
              <div className="code-line">
                <span className="ln" />
                <span><span className="gpu-pill gpu-ghost">gpu="H100"</span></span>
              </div>
            </pre>
            <div className="mini-grid">
              <div><span className="mini-label">Capacity</span></div>
              <div><span className="mini-label">Regions</span></div>
            </div>
          </TerminalCard>
          <p className="eyebrow">ELASTIC SCALE</p>
          <h3 className="feature-title">Autoscale from 0 to 1000+ GPUs, instantly.</h3>
          <p className="feature-text">
            Modal routes workloads across clouds and regions in real time. Get the
            GPUs you need in seconds, with no commitments or capacity planning.
          </p>
        </div>

        <div className="feature">
          <TerminalCard title="● Live Usage">
            <div className="usage">
              <div className="usage-stats">
                <div><span className="dim">Time</span> 00:00am</div>
                <div><span className="dim">Containers</span> 4</div>
                <div><span className="dim">GPU Utilization</span> 87%</div>
              </div>
              <div className="usage-charthead">
                <span>H100s</span><span>1028 GPUs</span>
              </div>
              <svg className="usage-chart" viewBox="0 0 400 120" preserveAspectRatio="none">
                <polyline
                  points="0,110 40,95 80,100 120,70 160,85 200,55 240,70 280,35 320,60 360,20 400,40"
                  fill="none" stroke="#4f8cff" strokeWidth="2.5"
                />
                <polygon
                  points="0,110 40,95 80,100 120,70 160,85 200,55 240,70 280,35 320,60 360,20 400,40 400,120 0,120"
                  fill="url(#chartGrad)"
                />
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f8cff" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#4f8cff" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </TerminalCard>
          <p className="eyebrow">OBSERVABILITY</p>
          <h3 className="feature-title">Out-of-the-box observability.</h3>
          <p className="feature-text">
            Integrated logging and full visibility into every function, sandbox, and
            container. The observability tools to build robust, production-ready
            applications.
          </p>
        </div>
      </div>
    </section>
  )
}

/* ---------- Workloads ---------- */

const WORKLOADS = [
  { title: 'Inference', text: 'Serve models with sub-second cold starts and instant autoscaling.' },
  { title: 'Fine-tuning & training', text: 'Run distributed training across thousands of GPUs on demand.' },
  { title: 'Sandboxes', text: 'Safely run AI-generated code in secure, isolated containers.' },
  { title: 'Batch processing', text: 'Fan out to thousands of containers for massive parallel jobs.' },
  { title: 'Notebooks', text: 'Prototype interactively with the compute you need, when you need it.' },
  { title: 'Compute at scale', text: 'A single platform for every stage of the AI lifecycle.' },
]

function Workloads() {
  return (
    <section className="workloads">
      <div className="workloads-inner">
        <p className="eyebrow dark">WORKLOADS</p>
        <h2 className="section-title dark">Build full-scale AI systems.</h2>
        <div className="grid-3">
          {WORKLOADS.map((w) => (
            <article className="wl-card" key={w.title}>
              <div className="wl-visual">
                <svg width="56" height="56" viewBox="0 0 40 40">
                  <path d="M8 26 L20 6 L24 12 L14 30 Z" fill="#4f8cff" />
                  <path d="M18 30 L28 12 L32 18 L24 32 Z" fill="#7db0ff" />
                </svg>
              </div>
              <h3 className="wl-title">{w.title}</h3>
              <p className="wl-text">{w.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- CTA band ---------- */

function CtaBand() {
  return (
    <section className="cta-band">
      <div className="cta-glow" />
      <h2 className="cta-title">Ship your first app in minutes.</h2>
      <div className="hero-cta">
        <a href="#" className="btn btn-primary">Get Started</a>
        <a href="#" className="btn btn-dark">Contact Us</a>
      </div>
    </section>
  )
}

/* ---------- Footer ---------- */

const FOOTER = {
  Products: ['Inference', 'Sandboxes', 'Training', 'Notebooks', 'Batch', 'Core Platform'],
  Resources: ['Documentation', 'Pricing', 'Slack Community', 'Articles', 'GPU Glossary', 'LLM Engine Advisor', 'Model Library'],
  Company: ['About', 'Blog', 'Careers', 'Events', 'Privacy Policy', 'Security & Privacy', 'Terms'],
  'Popular Examples': ['Serve your own LLM API', 'Create custom art of your pet', 'Deploy OpenCode agents in a cloud Sandbox'],
}

function SocialIcon({ children }) {
  return <span className="social">{children}</span>
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Logo size={34} />
          <p className="footer-tag">
            <span className="accent">AI infrastructure</span> that developers love
          </p>
          <div className="socials">
            <SocialIcon>𝕏</SocialIcon>
            <SocialIcon>in</SocialIcon>
            <SocialIcon>#</SocialIcon>
            <SocialIcon>◗</SocialIcon>
            <SocialIcon>▶</SocialIcon>
          </div>
          <p className="copyright">© Modal 2026</p>
        </div>
        <div className="footer-cols">
          {Object.entries(FOOTER).map(([head, items]) => (
            <div className="footer-col" key={head}>
              <h4>{head}</h4>
              <ul>
                {items.map((i) => <li key={i}><a href="#">{i}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}

/* ---------- App ---------- */

export default function App() {
  return (
    <div className="app">
      <Announcement />
      <Navbar />
      <main>
        <Hero />
        <LogoCloud />
        <ProductionCloud />
        <ScaleFeatures />
        <Workloads />
        <CtaBand />
      </main>
      <Footer />
    </div>
  )
}
