import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import { config } from './config.js'

fs.mkdirSync(path.dirname(config.dbPath), { recursive: true })

export const db = new Database(config.dbPath)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY,
    form_type TEXT NOT NULL CHECK (form_type IN (
      'project_inquiry',
      'contact_message',
      'career_application'
    )),
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN (
      'new', 'reviewed', 'archived', 'spam'
    )),
    name TEXT,
    first_name TEXT,
    last_name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    privacy_accepted INTEGER NOT NULL DEFAULT 0,
    ip_hash TEXT,
    user_agent TEXT,
    source_path TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_submissions_type_created
    ON submissions(form_type, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_submissions_email
    ON submissions(email);
  CREATE INDEX IF NOT EXISTS idx_submissions_status
    ON submissions(status);

  CREATE TABLE IF NOT EXISTS submission_files (
    id TEXT PRIMARY KEY,
    submission_id TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL DEFAULT 'resume',
    original_name TEXT NOT NULL,
    stored_key TEXT NOT NULL UNIQUE,
    storage_backend TEXT NOT NULL CHECK (storage_backend IN ('local', 's3')),
    mime_type TEXT NOT NULL,
    size_bytes INTEGER NOT NULL,
    sha256 TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_login_at TEXT
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    admin_id TEXT NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS audit_events (
    id TEXT PRIMARY KEY,
    admin_id TEXT,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    meta TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`)

export function ensureAdminSeeded() {
  const email = config.adminEmail.toLowerCase().trim()
  const passwordHash = bcrypt.hashSync(config.adminPassword, 12)
  const existing = db.prepare('SELECT id FROM admins WHERE email = ?').get(email)

  if (existing) {
    db.prepare('UPDATE admins SET password_hash = ? WHERE id = ?').run(passwordHash, existing.id)
    console.log(`Synced admin credentials for: ${email}`)
    return
  }

  const id = crypto.randomUUID()
  db.prepare(
    `INSERT INTO admins (id, email, password_hash) VALUES (?, ?, ?)`,
  ).run(id, email, passwordHash)

  console.log(`Seeded admin user: ${email}`)
}

export function hashIp(ip) {
  if (!ip) return null
  return crypto.createHmac('sha256', config.ipHashSecret).update(ip).digest('hex')
}

export function writeAudit({ adminId = null, action, entityType = null, entityId = null, meta = null }) {
  db.prepare(
    `INSERT INTO audit_events (id, admin_id, action, entity_type, entity_id, meta)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(
    crypto.randomUUID(),
    adminId,
    action,
    entityType,
    entityId,
    meta ? JSON.stringify(meta) : null,
  )
}
