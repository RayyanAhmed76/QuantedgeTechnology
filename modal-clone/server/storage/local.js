import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { config } from '../config.js'

export function ensureUploadRoot() {
  fs.mkdirSync(config.uploadRoot, { recursive: true })
}

function monthKey(date = new Date()) {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  return `${y}/${m}`
}

export function buildStoredKey(ext) {
  const safeExt = ext.startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`
  return `resumes/${monthKey()}/${crypto.randomUUID()}${safeExt}`
}

export function absolutePathForKey(storedKey) {
  const normalized = path.normalize(storedKey).replace(/^(\.\.(\/|\\|$))+/, '')
  const full = path.join(config.uploadRoot, normalized)
  if (!full.startsWith(path.resolve(config.uploadRoot))) {
    throw Object.assign(new Error('Invalid storage key'), { status: 400 })
  }
  return full
}

export async function putLocalFile(storedKey, buffer) {
  const full = absolutePathForKey(storedKey)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  await fs.promises.writeFile(full, buffer, { flag: 'wx' })
  return { storageBackend: 'local', storedKey }
}

export function readLocalFileBuffer(storedKey) {
  const full = absolutePathForKey(storedKey)
  if (!fs.existsSync(full)) {
    throw Object.assign(new Error('File not found'), { status: 404 })
  }
  return fs.readFileSync(full)
}

export function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex')
}
