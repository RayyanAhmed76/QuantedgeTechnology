import { fileTypeFromBuffer } from 'file-type'

const ALLOWED = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
}

// DOC/DOCX magic can be flaky for old .doc; also accept by extension+zip for docx
const EXT_MIME = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

function extname(name = '') {
  const i = name.lastIndexOf('.')
  return i >= 0 ? name.slice(i).toLowerCase() : ''
}

function sanitizeOriginalName(name = 'resume.pdf') {
  return name.replace(/[^\w.\-()+\s]/g, '_').slice(0, 180) || 'resume.pdf'
}

export async function validateResume(file, maxBytes) {
  if (!file) {
    throw Object.assign(new Error('Resume file is required'), { status: 400 })
  }
  if (file.size > maxBytes) {
    throw Object.assign(new Error('Resume must be 5MB or smaller'), { status: 400 })
  }

  const ext = extname(file.originalname)
  if (!Object.prototype.hasOwnProperty.call(EXT_MIME, ext)) {
    throw Object.assign(new Error('Only PDF, DOC, and DOCX resumes are allowed'), { status: 400 })
  }

  const detected = await fileTypeFromBuffer(file.buffer)
  let mime = detected?.mime

  if (ext === '.pdf') {
    if (mime && mime !== 'application/pdf') {
      throw Object.assign(new Error('Invalid PDF file'), { status: 400 })
    }
    // PDF may not always be detected; check header
    const head = file.buffer.subarray(0, 5).toString('utf8')
    if (head !== '%PDF-') {
      throw Object.assign(new Error('Invalid PDF file'), { status: 400 })
    }
    mime = 'application/pdf'
  } else if (ext === '.docx') {
    // DOCX is a ZIP
    if (mime && mime !== 'application/zip' && !ALLOWED[mime]) {
      throw Object.assign(new Error('Invalid DOCX file'), { status: 400 })
    }
    mime = EXT_MIME['.docx']
  } else if (ext === '.doc') {
    mime = EXT_MIME['.doc']
  }

  return {
    originalName: sanitizeOriginalName(file.originalname),
    ext,
    mimeType: mime,
    sizeBytes: file.size,
    buffer: file.buffer,
  }
}
