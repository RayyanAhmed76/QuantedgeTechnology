import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import { db, writeAudit } from '../db.js'
import { config } from '../config.js'

function expiryIso(ms = config.sessionTtlMs) {
  return new Date(Date.now() + ms).toISOString().replace('T', ' ').slice(0, 19)
}

function createSession(adminId) {
  const id = crypto.randomUUID()
  const expiresAt = expiryIso()
  db.prepare('INSERT INTO sessions (id, admin_id, expires_at) VALUES (?, ?, ?)').run(
    id,
    adminId,
    expiresAt,
  )
  return { id, expiresAt }
}

export function destroySession(sessionId) {
  if (!sessionId) return
  db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId)
}

export function getSessionAdmin(sessionId) {
  if (!sessionId) return null
  const row = db
    .prepare(
      `SELECT a.id, a.email, s.expires_at
       FROM sessions s
       JOIN admins a ON a.id = s.admin_id
       WHERE s.id = ?`,
    )
    .get(sessionId)
  if (!row) return null
  if (new Date(row.expires_at + 'Z') < new Date()) {
    destroySession(sessionId)
    return null
  }
  return { id: row.id, email: row.email }
}

export function loginAdmin(email, password) {
  const admin = db
    .prepare('SELECT id, email, password_hash FROM admins WHERE email = ?')
    .get(String(email || '').trim().toLowerCase())
  if (!admin || !bcrypt.compareSync(String(password || ''), admin.password_hash)) {
    throw Object.assign(new Error('Invalid email or password'), { status: 401 })
  }
  db.prepare(`UPDATE admins SET last_login_at = datetime('now') WHERE id = ?`).run(admin.id)
  const session = createSession(admin.id)
  writeAudit({ adminId: admin.id, action: 'login' })
  return { admin: { id: admin.id, email: admin.email }, session }
}

export function requireAdmin(req, res, next) {
  const sessionId = req.cookies?.[config.cookieName]
  const admin = getSessionAdmin(sessionId)
  if (!admin) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  req.admin = admin
  req.sessionId = sessionId
  next()
}

export function setSessionCookie(res, sessionId) {
  res.cookie(config.cookieName, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: config.sessionTtlMs,
    path: '/',
  })
}

export function clearSessionCookie(res) {
  res.clearCookie(config.cookieName, { path: '/' })
}
