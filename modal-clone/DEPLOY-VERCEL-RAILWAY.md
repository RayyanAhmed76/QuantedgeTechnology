# Deploy: Vercel (frontend) + Railway (API) + Vercel (consultancy)

This replaces the old single-EC2 layout. Visitors only see your Namecheap domain.

```
quantedgedatasolutions.com          → Vercel (modal-clone Vite)
quantedgedatasolutions.com/api/*    → rewrite → Railway (Express + SQLite)
quantedgedatasolutions.com/consultancy → rewrite → Vercel (consultancy Next.js)
```

## 1. Railway (API)

1. New project from GitHub. **Root Directory:** `modal-clone` (if repo is `fello-clone`).
2. Uses `Dockerfile.railway` via `railway.toml` (builds `better-sqlite3`).
3. **Volume** mounted at `/data`.
4. Variables:

```env
NODE_ENV=production
CORS_ORIGIN=https://quantedgedatasolutions.com,https://www.quantedgedatasolutions.com
IP_HASH_SECRET=<long-random>
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=<12+-char-strong>
DB_PATH=/data/app.sqlite
UPLOAD_ROOT=/data/uploads
CONSULTANCY_SITE_KEY=<shared-secret>
```

5. Networking → Generate domain. Test: `https://YOUR.up.railway.app/api/health` → `{"ok":true}`.

Optional: add custom domain `api.quantedgedatasolutions.com` on Railway (CNAME in Namecheap).

## 2. Consultancy Vercel project

Repo: `consultancy` (folder `D:\consultancy` / its GitHub remote).

- Framework: Next.js (auto). Keep `basePath: "/consultancy"`.
- Env:

```env
NEXT_PUBLIC_SITE_URL=https://quantedgedatasolutions.com/consultancy
API_BASE_URL=https://quantedgedatasolutions.com
SITE_KEY=<same-as-CONSULTANCY_SITE_KEY>
```

- Deploy and copy the `*.vercel.app` URL (e.g. `https://quantedge-consultancy.vercel.app`).

## 3. Main site Vercel project

Repo: `fello-clone` (or wherever `modal-clone` lives).

- **Root Directory:** `modal-clone`
- Edit `vercel.json` before deploy — replace placeholders:

```json
"destination": "https://YOUR.up.railway.app/api/:path*"
"destination": "https://YOUR-CONSULTANCY.vercel.app/consultancy"
"destination": "https://YOUR-CONSULTANCY.vercel.app/consultancy/:path*"
```

- Build env:

```env
VITE_CONSULTANCY_URL=https://quantedgedatasolutions.com/consultancy
VITE_GA_ID=
VITE_TURNSTILE_SITE_KEY=
```

- Domains: add `quantedgedatasolutions.com` and `www`.

## 4. Namecheap DNS

Point **only** the main Vercel project (values Vercel shows), typically:

| Type | Host | Value |
|------|------|--------|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

Remove old AWS/EC2 records.

## 5. Checklist

- [ ] `https://quantedgedatasolutions.com` — main site
- [ ] `https://quantedgedatasolutions.com/api/health` — `{"ok":true}`
- [ ] Contact / career forms → admin inbox
- [ ] `/admin` login
- [ ] Consultancy card “Learn more” → `/consultancy`
- [ ] Consultancy form → same Railway inbox (`consultancy_inquiry`)

## Local vs production

| Concern | Local | Production |
|---------|--------|------------|
| Frontend | `npm run dev` | Vercel |
| API | `npm run start:api` / `dev:api` | Railway |
| Consultancy | `npm run dev` in consultancy | Vercel project B |
| Forms API URL | `http://localhost:8787` | `https://quantedgedatasolutions.com` (rewrite) |
