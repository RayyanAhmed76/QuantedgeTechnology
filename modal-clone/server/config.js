import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

dotenv.config({ path: path.join(root, '.env') })

export const config = {
  port: Number(process.env.API_PORT || 8787),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  dbPath: process.env.DB_PATH || path.join(root, 'data', 'app.sqlite'),
  uploadRoot: process.env.UPLOAD_ROOT || path.join(root, 'data', 'uploads'),
  ipHashSecret: process.env.IP_HASH_SECRET || 'dev-change-me-quantedge-ip',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@quantedge.local',
  adminPassword: process.env.ADMIN_PASSWORD || 'ChangeMeNow!123',
  cookieName: 'qe_admin_session',
  maxResumeBytes: 5 * 1024 * 1024,
  sessionTtlMs: 1000 * 60 * 60 * 12,
}
