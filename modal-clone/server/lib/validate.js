const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const URL_RE = /^https:\/\/[^\s]+$/i

function clean(value) {
  return String(value ?? '').trim()
}

function requireLen(value, { min = 1, max, label }) {
  const v = clean(value)
  if (v.length < min || v.length > max) {
    throw Object.assign(new Error(`${label} must be between ${min} and ${max} characters`), {
      status: 400,
    })
  }
  return v
}

function optionalUrl(value, label) {
  const v = clean(value)
  if (!v) return null
  if (v.length > 500 || !URL_RE.test(v)) {
    throw Object.assign(new Error(`${label} must be a valid https URL`), { status: 400 })
  }
  return v
}

function email(value) {
  const v = requireLen(value, { max: 254, label: 'Email' }).toLowerCase()
  if (!EMAIL_RE.test(v)) {
    throw Object.assign(new Error('Email is invalid'), { status: 400 })
  }
  return v
}

function phone(value) {
  const v = requireLen(value, { min: 7, max: 30, label: 'Phone' })
  if (!/^[0-9+\-().\s]+$/.test(v)) {
    throw Object.assign(new Error('Phone number is invalid'), { status: 400 })
  }
  return v
}

function honeypotOk(body) {
  const trap = clean(body.company_website || body.website || '')
  if (trap) {
    throw Object.assign(new Error('Rejected'), { status: 400, code: 'honeypot' })
  }
}

export function validateProject(body) {
  honeypotOk(body)
  if (!body.privacy && body.privacy !== true && body.privacy !== 'on' && body.privacy !== 'true') {
    throw Object.assign(new Error('Privacy agreement is required'), { status: 400 })
  }
  return {
    formType: 'project_inquiry',
    name: requireLen(body.name, { max: 120, label: 'Name' }),
    email: email(body.email),
    phone: phone(body.phone),
    message: requireLen(body.project ?? body.message, { max: 5000, label: 'Project' }),
    privacyAccepted: 1,
  }
}

export function validateContact(body) {
  honeypotOk(body)
  const firstName = requireLen(body.firstName ?? body.first_name, { max: 80, label: 'First name' })
  const lastName = requireLen(body.lastName ?? body.last_name, { max: 80, label: 'Last name' })
  return {
    formType: 'contact_message',
    firstName,
    lastName,
    name: `${firstName} ${lastName}`,
    email: email(body.email),
    phone: phone(body.phone),
    message: requireLen(body.message, { max: 5000, label: 'Message' }),
    privacyAccepted: 0,
  }
}

export function validateCareer(body) {
  honeypotOk(body)
  return {
    formType: 'career_application',
    name: requireLen(body.fullName ?? body.full_name ?? body.name, { max: 120, label: 'Full name' }),
    email: email(body.email),
    phone: phone(body.phone),
    linkedinUrl: optionalUrl(body.linkedin ?? body.linkedin_url, 'LinkedIn URL'),
    githubUrl: optionalUrl(body.github ?? body.github_url, 'GitHub URL'),
    privacyAccepted: 0,
  }
}

/** Consultancy site contact / inquiry form (tagged source_site=consultancy). */
export function validateConsultancy(body) {
  honeypotOk(body)

  let name = clean(body.name ?? body.fullName ?? body.full_name)
  if (!name) {
    const firstName = clean(body.firstName ?? body.first_name)
    const lastName = clean(body.lastName ?? body.last_name)
    if (firstName || lastName) {
      name = `${firstName} ${lastName}`.trim()
    }
  }
  name = requireLen(name, { max: 120, label: 'Name' })

  const phoneRaw = clean(body.phone)
  const phoneValue = phoneRaw ? phone(body.phone) : null

  let message = requireLen(body.message ?? body.project ?? body.inquiry, {
    max: 5000,
    label: 'Message',
  })
  const company = clean(body.company ?? body.organization)
  if (company) {
    if (company.length > 160) {
      throw Object.assign(new Error('Company must be at most 160 characters'), { status: 400 })
    }
    message = `Company: ${company}\n\n${message}`
  }

  const service = requireLen(body.service ?? body.guidance ?? body.serviceInterest, {
    max: 200,
    label: 'Service',
  })

  const privacy =
    body.privacy === true || body.privacy === 'on' || body.privacy === 'true' || body.privacy === 1

  return {
    formType: 'consultancy_inquiry',
    name,
    email: email(body.email),
    phone: phoneValue,
    message,
    service,
    privacyAccepted: privacy ? 1 : 0,
    sourceSite: 'consultancy',
  }
}
