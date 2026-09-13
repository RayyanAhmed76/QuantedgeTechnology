function trim(value) {
  return String(value ?? '').trim()
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)
}

function isPhone(value) {
  const digits = value.replace(/\D/g, '')
  if (digits.length < 7 || digits.length > 15) return false
  return /^[+]?[\d\s()./-]{7,22}$/.test(value)
}

function isPersonName(value) {
  return value.length >= 2 && value.length <= 80 && /^[\p{L}][\p{L}\s.'’-]*$/u.test(value)
}

function isHttpUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:'
  } catch {
    return false
  }
}

const RESUME_ACCEPT = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])
const RESUME_EXT = /\.(pdf|doc|docx)$/i
const RESUME_MAX_BYTES = 5 * 1024 * 1024

function validateResume(file) {
  if (!file) return 'Please upload your resume (PDF or DOC).'
  if (!RESUME_EXT.test(file.name) && !RESUME_ACCEPT.has(file.type)) {
    return 'Resume must be a PDF or DOC file.'
  }
  if (file.size > RESUME_MAX_BYTES) {
    return 'Resume must be 5 MB or smaller.'
  }
  return ''
}

function requireText(value, label, { min = 2, max = 500 } = {}) {
  if (!value) return `${label} is required.`
  if (value.length < min) return `${label} must be at least ${min} characters.`
  if (value.length > max) return `${label} must be ${max} characters or fewer.`
  return ''
}

export function validateProjectContact(values) {
  const project = trim(values.project)
  const name = trim(values.name)
  const email = trim(values.email)
  const phone = trim(values.phone)
  const privacy = Boolean(values.privacy)

  const errors = {}

  const projectError = requireText(project, 'Project details', { min: 10, max: 2000 })
  if (projectError) errors.project = projectError

  if (!name) errors.name = 'Name is required.'
  else if (!isPersonName(name)) errors.name = 'Enter a valid name.'

  if (!email) errors.email = 'Email is required.'
  else if (!isEmail(email)) errors.email = 'Enter a valid email address.'

  if (!phone) errors.phone = 'Phone number is required.'
  else if (!isPhone(phone)) errors.phone = 'Enter a valid phone number.'

  if (!privacy) errors.privacy = 'Please agree to the Privacy Policy.'

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    values: { project, name, email, phone, privacy },
  }
}

export function validateContactPage(values) {
  const firstName = trim(values.firstName)
  const lastName = trim(values.lastName)
  const email = trim(values.email)
  const phone = trim(values.phone)
  const message = trim(values.message)

  const errors = {}

  if (!firstName) errors.firstName = 'First name is required.'
  else if (!isPersonName(firstName)) errors.firstName = 'Enter a valid first name.'

  if (!lastName) errors.lastName = 'Last name is required.'
  else if (!isPersonName(lastName)) errors.lastName = 'Enter a valid last name.'

  if (!email) errors.email = 'Email is required.'
  else if (!isEmail(email)) errors.email = 'Enter a valid email address.'

  if (!phone) errors.phone = 'Phone number is required.'
  else if (!isPhone(phone)) errors.phone = 'Enter a valid phone number.'

  const messageError = requireText(message, 'Message', { min: 10, max: 2000 })
  if (messageError) errors.message = messageError

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    values: { firstName, lastName, email, phone, message },
  }
}

export function validateCareer(values, resumeFile) {
  const fullName = trim(values.fullName)
  const email = trim(values.email)
  const phone = trim(values.phone)
  const linkedin = trim(values.linkedin)
  const github = trim(values.github)

  const errors = {}

  if (!fullName) errors.fullName = 'Full name is required.'
  else if (!isPersonName(fullName)) errors.fullName = 'Enter a valid full name.'

  if (!email) errors.email = 'Email is required.'
  else if (!isEmail(email)) errors.email = 'Enter a valid email address.'

  if (!phone) errors.phone = 'Phone number is required.'
  else if (!isPhone(phone)) errors.phone = 'Enter a valid phone number.'

  const resumeError = validateResume(resumeFile)
  if (resumeError) errors.resume = resumeError

  if (linkedin && !isHttpUrl(linkedin)) {
    errors.linkedin = 'Enter a valid https URL (https://…).'
  }
  if (github && !isHttpUrl(github)) {
    errors.github = 'Enter a valid https URL (https://…).'
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    values: { fullName, email, phone, linkedin, github },
  }
}

export function validateAdminLogin(values) {
  const email = trim(values.email)
  const password = String(values.password ?? '')

  const errors = {}

  if (!email) errors.email = 'Email is required.'
  else if (!isEmail(email)) errors.email = 'Enter a valid email address.'

  if (!password) errors.password = 'Password is required.'
  else if (password.length < 6) errors.password = 'Password must be at least 6 characters.'

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    values: { email, password },
  }
}

export function firstErrorKey(errors) {
  return Object.keys(errors)[0] || null
}
