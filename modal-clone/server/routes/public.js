import { Router } from 'express'
import multer from 'multer'
import crypto from 'node:crypto'
import { db, hashIp } from '../db.js'
import { config } from '../config.js'
import {
  validateProject,
  validateContact,
  validateCareer,
  validateConsultancy,
} from '../lib/validate.js'
import { validateResume } from '../lib/files.js'
import { buildStoredKey, putLocalFile, sha256 } from '../storage/local.js'
import { verifyTurnstileToken } from '../lib/turnstile.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxResumeBytes, files: 1 },
})

const router = Router()

function meta(req) {
  return {
    ipHash: hashIp(req.ip),
    userAgent: String(req.get('user-agent') || '').slice(0, 400),
    sourcePath: String(req.get('x-source-path') || req.body?.sourcePath || '').slice(0, 200),
  }
}

function insertSubmission(data, extras) {
  const id = crypto.randomUUID()
  db.prepare(
    `INSERT INTO submissions (
      id, form_type, name, first_name, last_name, email, phone, message, service,
      linkedin_url, github_url, privacy_accepted, ip_hash, user_agent, source_path, source_site
    ) VALUES (
      @id, @formType, @name, @firstName, @lastName, @email, @phone, @message, @service,
      @linkedinUrl, @githubUrl, @privacyAccepted, @ipHash, @userAgent, @sourcePath, @sourceSite
    )`,
  ).run({
    id,
    formType: data.formType,
    name: data.name || null,
    firstName: data.firstName || null,
    lastName: data.lastName || null,
    email: data.email,
    phone: data.phone || null,
    message: data.message || null,
    service: data.service || null,
    linkedinUrl: data.linkedinUrl || null,
    githubUrl: data.githubUrl || null,
    privacyAccepted: data.privacyAccepted || 0,
    ipHash: extras.ipHash,
    userAgent: extras.userAgent,
    sourcePath: extras.sourcePath || null,
    sourceSite: data.sourceSite || 'main',
  })
  return id
}

function requireConsultancySiteKey(req, res, next) {
  if (!config.consultancySiteKey) {
    return res.status(503).json({ error: 'Consultancy intake is not configured' })
  }
  const key = String(req.get('x-site-key') || req.get('x-consultancy-key') || '').trim()
  const expected = config.consultancySiteKey
  const a = Buffer.from(key)
  const b = Buffer.from(expected)
  const ok =
    a.length === b.length && a.length > 0 && crypto.timingSafeEqual(a, b)
  if (!ok) {
    return res.status(401).json({ error: 'Invalid or missing site key' })
  }
  return next()
}

function isHoneypot(body) {
  return Boolean(String(body?.company_website || body?.website || '').trim())
}

async function requirePublicCaptcha(req, _res, next) {
  try {
    if (!config.publicFormCaptcha) return next()
    const token =
      req.body?.captchaToken ||
      req.body?.turnstileToken ||
      req.get('x-captcha-token') ||
      ''
    await verifyTurnstileToken(token, req.ip)
    next()
  } catch (err) {
    next(err)
  }
}

/** Public site key for optional form captcha (safe to expose). */
router.get('/captcha-config', (_req, res) => {
  const enabled = Boolean(config.publicFormCaptcha && config.turnstileSiteKey)
  res.json({
    siteKey: enabled ? config.turnstileSiteKey : '',
    enabled,
  })
})

router.post('/project', requirePublicCaptcha, (req, res, next) => {
  try {
    if (isHoneypot(req.body)) {
      return res.status(201).json({ id: crypto.randomUUID(), ok: true })
    }
    const data = validateProject(req.body || {})
    const id = insertSubmission(data, meta(req))
    res.status(201).json({ id })
  } catch (err) {
    next(err)
  }
})

router.post('/contact', requirePublicCaptcha, (req, res, next) => {
  try {
    if (isHoneypot(req.body)) {
      return res.status(201).json({ id: crypto.randomUUID(), ok: true })
    }
    const data = validateContact(req.body || {})
    const id = insertSubmission(data, meta(req))
    res.status(201).json({ id })
  } catch (err) {
    next(err)
  }
})

router.post('/career', upload.single('resume'), requirePublicCaptcha, async (req, res, next) => {
  try {
    if (isHoneypot(req.body)) {
      // File stays in memory only (multer memoryStorage) — never written to disk
      return res.status(201).json({ id: crypto.randomUUID(), ok: true })
    }
    const data = validateCareer(req.body || {})
    const file = await validateResume(req.file, config.maxResumeBytes)
    const storedKey = buildStoredKey(file.ext)
    const digest = sha256(file.buffer)
    await putLocalFile(storedKey, file.buffer)

    const id = insertSubmission(data, meta(req))
    const fileId = crypto.randomUUID()
    db.prepare(
      `INSERT INTO submission_files (
        id, submission_id, field_name, original_name, stored_key,
        storage_backend, mime_type, size_bytes, sha256
      ) VALUES (?, ?, 'resume', ?, ?, 'local', ?, ?, ?)`,
    ).run(fileId, id, file.originalName, storedKey, file.mimeType, file.sizeBytes, digest)

    res.status(201).json({ id })
  } catch (err) {
    next(err)
  }
})

/**
 * Consultancy website forms.
 * Requires header: X-Site-Key: <CONSULTANCY_SITE_KEY>
 * Prefer sending this key from a server/BFF — never ship it as VITE_/NEXT_PUBLIC_ in production.
 */
router.post('/consultancy', requireConsultancySiteKey, (req, res, next) => {
  try {
    if (isHoneypot(req.body)) {
      return res.status(201).json({ id: crypto.randomUUID(), ok: true })
    }
    const data = validateConsultancy(req.body || {})
    const id = insertSubmission(data, meta(req))
    res.status(201).json({ id, sourceSite: 'consultancy' })
  } catch (err) {
    next(err)
  }
})

export default router
