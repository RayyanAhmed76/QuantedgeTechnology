# Production deploy (AWS EC2)

This guide covers what the repo is ready for. You still provision AWS, DNS, and secrets.

## What was prepared in the repo

- Cloudflare **Turnstile** optional (admin + public forms) — skipped when keys are unset
- Optional Turnstile on **public forms** via `PUBLIC_FORM_CAPTCHA=1` (only if you want it)
- Honeypot fields, rate limits, Helmet, CORS allowlist, hashed IPs
- Admin session cookie: `HttpOnly`, `Secure` (prod), `SameSite=Lax`, path `/api/admin`
- Production refuses weak/default `ADMIN_PASSWORD` / `IP_HASH_SECRET`
- `.env.example` with production variables
- Sample Nginx + systemd unit under `deploy/`
- Client URL validation aligned to **https://** (matches API)
- `/api/health` → `{ ok: true }` only (no env leakage)

## Security model (important)

**DevTools / Inspect cannot be “blocked.”** Anyone can see HTML, JS, and network calls. Protection is **server-side**:

| Layer | What it does |
|-------|----------------|
| Validation | Rejects bad/oversized payloads |
| Honeypot | Silent fake success if bots fill hidden `company_website` |
| Rate limits | 20 forms / 15 min; career 8; login 10 |
| Turnstile | Stops scripted spam when enabled |
| CORS | Only listed browser origins |
| Admin auth | bcrypt + session cookie (not localStorage) |
| Consultancy key | Server-to-server `X-Site-Key` (not in the browser) |

Client-side checks are UX only. Never put secrets in `VITE_*` / `NEXT_PUBLIC_*`.

## 1. Cloudflare Turnstile (optional)

Not required. Leave keys empty to skip captcha on admin login and public forms.

If you want captcha later:

1. Create a Turnstile widget at https://dash.cloudflare.com/
2. Add to server `.env`:

```env
TURNSTILE_SITE_KEY=your_site_key
TURNSTILE_SECRET_KEY=your_secret_key
VITE_TURNSTILE_SITE_KEY=your_site_key
# Optional — also require captcha on public contact / project / career:
PUBLIC_FORM_CAPTCHA=1
```

3. Rebuild the frontend after setting `VITE_TURNSTILE_SITE_KEY` (`npm run build`).
4. With keys set, captcha is enforced. Without keys, login and forms work without captcha.

## 2. EC2 outline

1. Ubuntu 22.04/24.04, Elastic IP, security group: `22` (your IP), `80`, `443` only.
2. Install Node 20+, Nginx, Certbot.
3. App path example: `/var/www/quantedge` (this `modal-clone` folder contents).
4. Persist data on disk (or dedicated EBS):

```env
DB_PATH=/var/lib/quantedge/app.sqlite
UPLOAD_ROOT=/var/lib/quantedge/uploads
```

5. Production `.env` (never commit):

```env
NODE_ENV=production
API_PORT=8787
CORS_ORIGIN=https://quantedgedatasolutions.com
IP_HASH_SECRET=<long-random>
ADMIN_EMAIL=...
ADMIN_PASSWORD=<strong-unique-min-12-chars>
# Turnstile optional — omit keys to skip captcha
# TURNSTILE_SITE_KEY=...
# TURNSTILE_SECRET_KEY=...
# VITE_TURNSTILE_SITE_KEY=...
# PUBLIC_FORM_CAPTCHA=1
VITE_CONSULTANCY_URL=https://quantedgedatasolutions.com/consultancy
CONSULTANCY_SITE_KEY=<long-random-shared-with-consultancy-app>
DB_PATH=/var/lib/quantedge/app.sqlite
UPLOAD_ROOT=/var/lib/quantedge/uploads
```

To rotate the admin password later: set new `ADMIN_PASSWORD` and temporarily `ADMIN_PASSWORD_SYNC=1`, restart API once, then remove `ADMIN_PASSWORD_SYNC`.

### Consultancy forms (same admin inbox)

Local:

| Var | Value |
|-----|--------|
| Main/API `CORS_ORIGIN` | `http://localhost:5173,http://localhost:3000` |
| Main/API `CONSULTANCY_SITE_KEY` | same string as consultancy `SITE_KEY` |
| Main `VITE_CONSULTANCY_URL` | `http://localhost:3000` |
| Consultancy `API_BASE_URL` | `http://localhost:8787` |
| Consultancy `SITE_KEY` | same as `CONSULTANCY_SITE_KEY` (**server-only**) |

Consultancy Next.js `/api/contact` validates + rate-limits, then forwards:

```http
POST {API_BASE_URL}/api/submissions/consultancy
X-Site-Key: {SITE_KEY}
Content-Type: application/json
```

Rows appear in admin with type **Consultancy** and source **Consultancy site**.

On EC2 (path `/consultancy`), set `VITE_CONSULTANCY_URL` and consultancy `API_BASE_URL` / `SITE_KEY` on the **server**; never expose the site key as `NEXT_PUBLIC_*` in production.

6. Install & build:

```bash
cd /var/www/quantedge
npm ci
npm run build
```

7. API via systemd:

```bash
sudo cp deploy/quantedge-api.service.example /etc/systemd/system/quantedge-api.service
# edit WorkingDirectory / EnvironmentFile paths if needed
sudo systemctl daemon-reload
sudo systemctl enable --now quantedge-api
```

8. Nginx: copy `deploy/nginx.conf.example`, set domain + `root` to `.../dist`, enable site, then Certbot.

9. DNS A record → Elastic IP.

## 3. Backups (you must schedule)

Daily copy of:

- SQLite file (`DB_PATH`)
- `UPLOAD_ROOT` (resumes)

Example: sync to S3 with `aws s3 sync` via cron.

## 4. Post-deploy checklist

- [ ] `https://yourdomain.com/api/health` → `{ ok: true }`
- [ ] Public contact / project / career forms submit
- [ ] Consultancy form via Next BFF shows in admin (source = Consultancy)
- [ ] `/admin/login` works (with Turnstile only if keys are set)
- [ ] Admin session cookie is Secure + path `/api/admin`
- [ ] Resume PDF preview is sandboxed; downloads require admin session
- [ ] Favicon / titles look correct (hard-refresh)
- [ ] Mobile + desktop smoke QA

## 5. Not automated here

- Creating the EC2 instance, DNS, SSL certs
- Rotating passwords that may have been shared
- Legal review of privacy/cookie copy
- Full device QA
