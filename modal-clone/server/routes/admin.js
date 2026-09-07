import { Router } from 'express'
import { db, writeAudit } from '../db.js'
import {
  loginAdmin,
  requireAdmin,
  setSessionCookie,
  clearSessionCookie,
  destroySession,
} from '../lib/auth.js'
import { readLocalFileBuffer } from '../storage/local.js'

const router = Router()

const FORM_LABELS = {
  project_inquiry: 'Project inquiry',
  contact_message: 'Contact message',
  career_application: 'Career application',
}

router.post('/login', (req, res, next) => {
  try {
    const { admin, session } = loginAdmin(req.body?.email, req.body?.password)
    setSessionCookie(res, session.id)
    res.json({ admin })
  } catch (err) {
    next(err)
  }
})

router.post('/logout', requireAdmin, (req, res) => {
  destroySession(req.sessionId)
  clearSessionCookie(res)
  writeAudit({ adminId: req.admin.id, action: 'logout' })
  res.json({ ok: true })
})

router.get('/me', requireAdmin, (req, res) => {
  res.json({ admin: req.admin })
})

router.get('/submissions', requireAdmin, (req, res) => {
  const formType = String(req.query.form_type || '').trim()
  const status = String(req.query.status || '').trim()
  const q = String(req.query.q || '').trim()

  const where = []
  const params = {}

  if (['project_inquiry', 'contact_message', 'career_application'].includes(formType)) {
    where.push('s.form_type = @formType')
    params.formType = formType
  }
  if (['new', 'reviewed', 'archived', 'spam'].includes(status)) {
    where.push('s.status = @status')
    params.status = status
  }
  if (q) {
    where.push('(s.email LIKE @q OR s.name LIKE @q OR IFNULL(s.message, "") LIKE @q)')
    params.q = `%${q.replace(/[%_]/g, '')}%`
  }

  const sql = `
    SELECT
      s.id, s.form_type, s.status, s.name, s.first_name, s.last_name,
      s.email, s.phone, s.message, s.linkedin_url, s.github_url,
      s.source_path, s.created_at,
      f.id AS file_id, f.original_name AS file_name
    FROM submissions s
    LEFT JOIN submission_files f ON f.submission_id = s.id
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY s.created_at DESC
    LIMIT 200
  `

  const rows = db.prepare(sql).all(params).map((row) => ({
    id: row.id,
    formType: row.form_type,
    formLabel: FORM_LABELS[row.form_type] || row.form_type,
    status: row.status,
    name: row.name,
    email: row.email,
    phone: row.phone,
    preview: row.message ? String(row.message).slice(0, 140) : null,
    createdAt: row.created_at,
    hasFile: Boolean(row.file_id),
    fileId: row.file_id || null,
    fileName: row.file_name || null,
  }))

  res.json({ items: rows })
})

router.get('/submissions/:id', requireAdmin, (req, res) => {
  const row = db
    .prepare(
      `SELECT s.*, f.id AS file_id, f.original_name AS file_name, f.mime_type, f.size_bytes
       FROM submissions s
       LEFT JOIN submission_files f ON f.submission_id = s.id
       WHERE s.id = ?`,
    )
    .get(req.params.id)

  if (!row) {
    return res.status(404).json({ error: 'Not found' })
  }

  writeAudit({
    adminId: req.admin.id,
    action: 'view_submission',
    entityType: 'submission',
    entityId: row.id,
  })

  res.json({
    id: row.id,
    formType: row.form_type,
    formLabel: FORM_LABELS[row.form_type] || row.form_type,
    status: row.status,
    name: row.name,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    message: row.message,
    linkedinUrl: row.linkedin_url,
    githubUrl: row.github_url,
    privacyAccepted: Boolean(row.privacy_accepted),
    sourcePath: row.source_path,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    file: row.file_id
      ? {
          id: row.file_id,
          originalName: row.file_name,
          mimeType: row.mime_type,
          sizeBytes: row.size_bytes,
        }
      : null,
  })
})

router.patch('/submissions/:id', requireAdmin, (req, res, next) => {
  try {
    const status = String(req.body?.status || '')
    if (!['new', 'reviewed', 'archived', 'spam'].includes(status)) {
      throw Object.assign(new Error('Invalid status'), { status: 400 })
    }
    const existing = db.prepare('SELECT id FROM submissions WHERE id = ?').get(req.params.id)
    if (!existing) {
      return res.status(404).json({ error: 'Not found' })
    }
    db.prepare(
      `UPDATE submissions SET status = ?, updated_at = datetime('now') WHERE id = ?`,
    ).run(status, req.params.id)
    writeAudit({
      adminId: req.admin.id,
      action: 'status_change',
      entityType: 'submission',
      entityId: req.params.id,
      meta: { status },
    })
    res.json({ ok: true, status })
  } catch (err) {
    next(err)
  }
})

router.get('/submissions/:id/files/:fileId/content', requireAdmin, (req, res, next) => {
  try {
    const file = db
      .prepare(
        `SELECT f.*, s.id AS submission_id
         FROM submission_files f
         JOIN submissions s ON s.id = f.submission_id
         WHERE f.id = ? AND s.id = ?`,
      )
      .get(req.params.fileId, req.params.id)

    if (!file) {
      return res.status(404).json({ error: 'File not found' })
    }
    if (file.storage_backend !== 'local') {
      return res.status(501).json({ error: 'S3 download not configured yet' })
    }

    const buffer = readLocalFileBuffer(file.stored_key)
    writeAudit({
      adminId: req.admin.id,
      action: 'preview_file',
      entityType: 'submission_file',
      entityId: file.id,
      meta: { submissionId: file.submission_id },
    })

    res.setHeader('Cache-Control', 'no-store')
    res.json({
      originalName: file.original_name,
      mimeType: file.mime_type || 'application/pdf',
      sizeBytes: file.size_bytes,
      base64: buffer.toString('base64'),
    })
  } catch (err) {
    next(err)
  }
})

export default router
