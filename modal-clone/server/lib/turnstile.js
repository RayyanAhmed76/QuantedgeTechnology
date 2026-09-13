import { config } from '../config.js'

/**
 * Verify Cloudflare Turnstile token when configured.
 * If TURNSTILE_SECRET_KEY is unset, captcha is skipped (including production).
 * When a secret is set, token verification is required.
 */
export async function verifyTurnstileToken(token, remoteip) {
  const secret = config.turnstileSecretKey

  if (!secret) {
    return { skipped: true }
  }

  const value = String(token || '').trim()
  if (!value) {
    throw Object.assign(new Error('Please complete the captcha'), { status: 400 })
  }

  const body = new URLSearchParams()
  body.set('secret', secret)
  body.set('response', value)
  if (remoteip) body.set('remoteip', String(remoteip))

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  const data = await res.json().catch(() => null)
  if (!data?.success) {
    throw Object.assign(new Error('Captcha verification failed. Please try again.'), {
      status: 400,
    })
  }

  return { skipped: false }
}
