import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import { config } from './config.js'
import { ensureAdminSeeded } from './db.js'
import { ensureUploadRoot } from './storage/local.js'
import publicRoutes from './routes/public.js'
import adminRoutes from './routes/admin.js'

ensureUploadRoot()
ensureAdminSeeded()

const app = express()

app.set('trust proxy', 1)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'same-site' },
  }),
)
app.use(
  cors({
    origin(origin, callback) {
      // Non-browser / same-origin tools may omit Origin
      if (!origin) return callback(null, true)
      if (config.corsOrigins.includes(origin)) return callback(null, true)
      return callback(null, false)
    },
    credentials: true,
  }),
)
app.use(express.json({ limit: '32kb' }))
app.use(express.urlencoded({ extended: false, limit: '32kb' }))
app.use(cookieParser())

const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many submissions. Try again later.' },
})

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again later.' },
})

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

const careerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many submissions. Try again later.' },
})

app.use('/api/submissions/career', careerLimiter)
app.use('/api/submissions', formLimiter, publicRoutes)
app.use('/api/admin/login', loginLimiter)
app.use('/api/admin', adminRoutes)

app.use((err, _req, res, _next) => {
  console.error(err)
  const status = err.status || 500
  res.status(status).json({
    error: status === 500 ? 'Internal server error' : err.message || 'Request failed',
  })
})

app.listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`)
})
