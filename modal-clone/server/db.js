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
      'career_application',
      'consultancy_inquiry'
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
    service TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    privacy_accepted INTEGER NOT NULL DEFAULT 0,
    ip_hash TEXT,
    user_agent TEXT,
    source_path TEXT,
    source_site TEXT NOT NULL DEFAULT 'main' CHECK (source_site IN ('main', 'consultancy')),
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

function tableSql(name) {
  const row = db.prepare(`SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ?`).get(name)
  return row?.sql || ''
}

function columnNames(table) {
  return db.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name)
}

/** Migrate existing DBs: source_site, consultancy_inquiry, service column. */
function migrateSubmissionsSchema() {
  const sql = tableSql('submissions')
  if (!sql) return

  const cols = columnNames('submissions')
  const needsSite = !cols.includes('source_site')
  const needsConsultancyType = !sql.includes('consultancy_inquiry')

  if (needsSite || needsConsultancyType) {
    db.exec(`
      PRAGMA foreign_keys = OFF;
      BEGIN;
      CREATE TABLE submissions_mig (
        id TEXT PRIMARY KEY,
        form_type TEXT NOT NULL CHECK (form_type IN (
          'project_inquiry',
          'contact_message',
          'career_application',
          'consultancy_inquiry'
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
        service TEXT,
        linkedin_url TEXT,
        github_url TEXT,
        privacy_accepted INTEGER NOT NULL DEFAULT 0,
        ip_hash TEXT,
        user_agent TEXT,
        source_path TEXT,
        source_site TEXT NOT NULL DEFAULT 'main' CHECK (source_site IN ('main', 'consultancy')),
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      INSERT INTO submissions_mig (
        id, form_type, status, name, first_name, last_name, email, phone, message,
        service, linkedin_url, github_url, privacy_accepted, ip_hash, user_agent, source_path,
        source_site, created_at, updated_at
      )
      SELECT
        id, form_type, status, name, first_name, last_name, email, phone, message,
        ${cols.includes('service') ? 'service' : 'NULL'},
        linkedin_url, github_url, privacy_accepted, ip_hash, user_agent, source_path,
        ${needsSite ? `'main'` : `IFNULL(source_site, 'main')`},
        created_at, updated_at
      FROM submissions;
      DROP TABLE submissions;
      ALTER TABLE submissions_mig RENAME TO submissions;
      CREATE INDEX IF NOT EXISTS idx_submissions_type_created
        ON submissions(form_type, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_submissions_email
        ON submissions(email);
      CREATE INDEX IF NOT EXISTS idx_submissions_status
        ON submissions(status);
      CREATE INDEX IF NOT EXISTS idx_submissions_site_created
        ON submissions(source_site, created_at DESC);
      COMMIT;
      PRAGMA foreign_keys = ON;
    `)
    console.log('[db] Migrated submissions schema (source_site / consultancy_inquiry / service)')
    return
  }

  if (!cols.includes('service')) {
    db.exec(`ALTER TABLE submissions ADD COLUMN service TEXT`)
    console.log('[db] Added submissions.service column')
  }
}

migrateSubmissionsSchema()

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_submissions_site_created
    ON submissions(source_site, created_at DESC);
`)

export function ensureAdminSeeded() {
  const email = config.adminEmail.toLowerCase().trim()
  const existing = db.prepare('SELECT id FROM admins WHERE email = ?').get(email)

  if (existing) {
    if (config.adminPasswordSync) {
      const passwordHash = bcrypt.hashSync(config.adminPassword, 12)
      db.prepare('UPDATE admins SET password_hash = ? WHERE id = ?').run(passwordHash, existing.id)
      console.log(`Synced admin credentials for: ${email} (ADMIN_PASSWORD_SYNC=1)`)
    }
    return
  }

  const passwordHash = bcrypt.hashSync(config.adminPassword, 12)
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
