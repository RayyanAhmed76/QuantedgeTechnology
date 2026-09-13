async function parseJson(res) {
  const text = await res.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = null
  }
  if (!res.ok) {
    const message = data?.error || `Request failed (${res.status})`
    throw new Error(message)
  }
  return data
}

export async function submitProject(payload) {
  const res = await fetch('/api/submissions/project', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Source-Path': window.location.pathname,
    },
    body: JSON.stringify(payload),
  })
  return parseJson(res)
}

export async function submitContact(payload) {
  const res = await fetch('/api/submissions/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Source-Path': window.location.pathname,
    },
    body: JSON.stringify(payload),
  })
  return parseJson(res)
}

export async function submitCareer(formData) {
  formData.set('sourcePath', window.location.pathname)
  const res = await fetch('/api/submissions/career', {
    method: 'POST',
    headers: {
      'X-Source-Path': window.location.pathname,
    },
    body: formData,
  })
  return parseJson(res)
}

export async function adminLogin(email, password, captchaToken = '') {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, captchaToken }),
  })
  return parseJson(res)
}

export async function adminCaptchaConfig() {
  const res = await fetch('/api/admin/captcha-config', { credentials: 'include' })
  return parseJson(res)
}

export async function adminLogout() {
  const res = await fetch('/api/admin/logout', {
    method: 'POST',
    credentials: 'include',
  })
  return parseJson(res)
}

export async function adminMe() {
  const res = await fetch('/api/admin/me', { credentials: 'include' })
  return parseJson(res)
}

export async function adminListSubmissions(params = {}) {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value) qs.set(key, value)
  })
  const res = await fetch(`/api/admin/submissions?${qs}`, { credentials: 'include' })
  return parseJson(res)
}

export async function adminGetSubmission(id) {
  const res = await fetch(`/api/admin/submissions/${id}`, { credentials: 'include' })
  return parseJson(res)
}

export async function adminUpdateStatus(id, status) {
  const res = await fetch(`/api/admin/submissions/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  return parseJson(res)
}

export async function adminDeleteSubmission(id) {
  const res = await fetch(`/api/admin/submissions/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  return parseJson(res)
}

/** Load resume as JSON (base64) so browser download managers cannot intercept it. */
export async function adminFetchFileBlob(submissionId, fileId, mimeType = 'application/pdf') {
  const res = await fetch(
    `/api/admin/submissions/${submissionId}/files/${fileId}/content`,
    { credentials: 'include' },
  )
  const data = await parseJson(res)
  if (!data?.base64) {
    throw new Error('Empty file received from server')
  }
  const binary = atob(data.base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new Blob([bytes], {
    type: (data.mimeType || mimeType || 'application/pdf').split(';')[0].trim(),
  })
}
