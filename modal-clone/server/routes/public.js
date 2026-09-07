import { Router } from 'express'
import multer from 'multer'
import crypto from 'node:crypto'
import { db, hashIp } from '../db.js'
import { config } from '../config.js'
import { validateProject, validateContact, validateCareer } from '../lib/validate.js'
import { validateResume } from '../lib/files.js'
import { buildStoredKey, putLocalFile, sha256 } from '../storage/local.js'

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
      id, form_type, name, first_name, last_name, email, phone, message,
      linkedin_url, github_url, privacy_accepted, ip_hash, user_agent, source_path
    ) VALUES (
      @id, @formType, @name, @firstName, @lastName, @email, @phone, @message,
      @linkedinUrl, @githubUrl, @privacyAccepted, @ipHash, @userAgent, @sourcePath
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
    linkedinUrl: data.linkedinUrl || null,
    githubUrl: data.githubUrl || null,
    privacyAccepted: data.privacyAccepted || 0,
    ipHash: extras.ipHash,
    userAgent: extras.userAgent,
    sourcePath: extras.sourcePath || null,
  })
  return id
}

router.post('/project', (req, res, next) => {
  try {
    if (req.body?.company_website) {
      return res.status(201).json({ id: crypto.randomUUID(), ok: true })
    }
    const data = validateProject(req.body || {})
    const id = insertSubmission(data, meta(req))
    res.status(201).json({ id })
  } catch (err) {
    next(err)
  }
})

router.post('/contact', (req, res, next) => {
  try {
    if (req.body?.company_website) {
      return res.status(201).json({ id: crypto.randomUUID(), ok: true })
    }
    const data = validateContact(req.body || {})
    const id = insertSubmission(data, meta(req))
    res.status(201).json({ id })
  } catch (err) {
    next(err)
  }
})

router.post('/career', upload.single('resume'), async (req, res, next) => {
  try {
    if (req.body?.company_website) {
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

export default router
