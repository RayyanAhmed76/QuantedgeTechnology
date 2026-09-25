import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

dotenv.config({ path: path.join(root, '.env') })

const isProduction = process.env.NODE_ENV === 'production'

function parseCorsOrigins(value) {
  return String(value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

const corsOrigins = parseCorsOrigins(
  process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000',
)

const DEFAULT_ADMIN_PASSWORD = 'ChangeMeNow!123'
const adminPassword = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD
const adminEmail = process.env.ADMIN_EMAIL || 'admin@quantedge.local'

/** Only re-hash/update existing admin when explicitly requested. */
const adminPasswordSync = process.env.ADMIN_PASSWORD_SYNC === '1'

export const config = {
  isProduction,
  // Railway/Render inject PORT; local/dev uses API_PORT
  port: Number(process.env.PORT || process.env.API_PORT || 8787),
  corsOrigins,
  dbPath: process.env.DB_PATH || path.join(root, 'data', 'app.sqlite'),
  uploadRoot: process.env.UPLOAD_ROOT || path.join(root, 'data', 'uploads'),
  ipHashSecret: process.env.IP_HASH_SECRET || 'dev-change-me-quantedge-ip',
  adminEmail,
  adminPassword,
  adminPasswordSync,
  turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY || '',
  turnstileSiteKey: process.env.TURNSTILE_SITE_KEY || process.env.VITE_TURNSTILE_SITE_KEY || '',
  /** When "1", public contact/project/career require Turnstile */
  publicFormCaptcha: process.env.PUBLIC_FORM_CAPTCHA === '1',
  /** Shared secret: consultancy BFF sends as X-Site-Key (keep off VITE_/NEXT_PUBLIC_ in production) */
  consultancySiteKey: (process.env.CONSULTANCY_SITE_KEY || '').trim(),
  cookieName: 'qe_admin_session',
  /** Limit cookie scope so marketing pages do not send the admin session */
  cookiePath: '/api/admin',
  maxResumeBytes: 5 * 1024 * 1024,
  sessionTtlMs: 1000 * 60 * 60 * 12,
}

if (isProduction) {
  const fatal = []
  if (!process.env.ADMIN_PASSWORD || adminPassword === DEFAULT_ADMIN_PASSWORD) {
    fatal.push('ADMIN_PASSWORD must be set to a strong unique value (not the default).')
  }
  if (adminPassword.length < 12) {
    fatal.push('ADMIN_PASSWORD must be at least 12 characters.')
  }
  if (!process.env.IP_HASH_SECRET || process.env.IP_HASH_SECRET === 'dev-change-me-quantedge-ip') {
    fatal.push('IP_HASH_SECRET must be set to a strong unique value.')
  }
  if (!corsOrigins.length || corsOrigins.some((o) => o.includes('localhost'))) {
    console.warn('[config] WARNING: CORS_ORIGIN should be your live HTTPS domain(s) in production.')
  }
  if (!config.consultancySiteKey) {
    console.warn(
      '[config] WARNING: CONSULTANCY_SITE_KEY missing — consultancy form intake will reject requests.',
    )
  }
  if (fatal.length) {
    console.error('[config] Refusing to start in production:\n- ' + fatal.join('\n- '))
    process.exit(1)
  }
}
