# Deploying Sevak (free tier)

This guide deploys the whole stack on free services:

| Piece | Folder | Host (free) |
| ----- | ------ | ----------- |
| React frontend | `ReportBox-front/` | **Vercel** |
| FastAPI (Legal Assistant + RAG) | `backend/` | **Render** (free web service) |
| Express (reports / OTP / admin) | `ReportBox-Backend/` | **Vercel** (serverless) |
| PostgreSQL (Prisma) | — | **Neon** |
| MongoDB | — | **MongoDB Atlas** (M0) |
| Vector DB | — | **Pinecone** (serverless, free starter) |
| LLM + embeddings | — | **Google Gemini API** |

You'll create **two Vercel projects** from this one repo (frontend + Express),
each with a different **Root Directory**.

---

## 0. Prerequisites

- GitHub repo pushed (this one).
- Accounts (all free): Neon, MongoDB Atlas, Pinecone, Google AI Studio (Gemini),
  Render, Vercel.

> Never commit real secrets. Each folder has a `.env.example` listing the
> variable **names** — copy it to `.env` locally, and set the real values in the
> host dashboards for production.

---

## 1. Provision the datastores

### Neon (PostgreSQL — for FastAPI)
1. Create a project → copy the **pooled** connection string → `DATABASE_URL`.
2. Tables (incl. the new `Feedback` table) are created automatically by
   `prisma migrate deploy` during the Render build.

### MongoDB Atlas (for Express)
1. Create a free **M0** cluster.
2. Database Access → add a user. Network Access → allow `0.0.0.0/0` (serverless
   IPs are dynamic).
3. Copy the connection string → `MONGODB_URI`.

### Pinecone (vector DB — for FastAPI)
1. Create a free account → create an **API key** → `PINECONE_API_KEY`.
2. You do **not** need to pre-create the index. The app auto-creates index
   `sevak` (serverless, `aws` / `us-east-1`, dimension 768 to match Gemini
   embeddings) on first ingest. `VECTOR_STORE=pinecone` is already in `render.yml`.

### Gemini API key
1. In Google AI Studio, create an API key → `GOOGLE_API_KEY`.

---

## 2. Deploy the FastAPI backend → Render

Settings (or use `backend/render.yml` as a reference):

- **Root directory:** `backend`
- **Build command:** `pip install -r requirements.txt && prisma generate && prisma migrate deploy`
- **Start command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Environment variables:** set everything from `backend/.env.example`. Most
  important: `DATABASE_URL`, `JWT_SECRET`, `GOOGLE_API_KEY`, `VECTOR_STORE=pinecone`,
  `PINECONE_API_KEY`, `ADMIN_API_KEY`, and `FRONTEND_URL` (set after step 4).

Note the deployed URL, e.g. `https://sevak-fastapi.onrender.com` → this is the
frontend's `VITE_BACKEND_URL`.

---

## 3. Deploy the Express backend → Vercel (project #1)

`ReportBox-Backend/vercel.json` and `index.js` are already serverless-ready
(the app is exported and only calls `listen()` off-Vercel; the Mongo connection
is cached across invocations).

1. New Project → import the repo → set **Root Directory** to `ReportBox-Backend`.
2. Environment variables (from `ReportBox-Backend/.env.example`): `MONGODB_URI`,
   `JWT_SECRET`, `ADMIN_PASSWORD`, `FRONTEND_URL` (set after step 4), and the
   Twilio vars only if you use OTP.
3. Deploy. Note the URL, e.g. `https://sevak-reportbox.vercel.app` → this is the
   frontend's `VITE_BASE_URL`. Quick check: `GET /` returns `hello`.

---

## 4. Deploy the frontend → Vercel (project #2)

1. New Project → import the same repo → set **Root Directory** to
   `ReportBox-front` (Vercel auto-detects Vite; SPA routing is handled by
   `ReportBox-front/vercel.json`).
2. Environment variables (from `ReportBox-front/.env.example`):
   - `VITE_BACKEND_URL` = the Render URL (step 2)
   - `VITE_BASE_URL` = the Express Vercel URL (step 3)
   - `VITE_CLOUDINARY_KEY`, `VITE_LOCATION_KEY`
   - **Do NOT set `VITE_BASE`** — at the domain root it must stay `/` (the
     default). `VITE_BASE=/Sevak/` is only for GitHub Pages.
3. Deploy. Note the URL, e.g. `https://sevak.vercel.app`.

---

## 5. Wire up CORS

Set `FRONTEND_URL` to the **exact** frontend URL from step 4 (full origin, no
trailing path), then redeploy both backends:

- Render (FastAPI): `FRONTEND_URL=https://sevak.vercel.app`
- Vercel (Express): `FRONTEND_URL=https://sevak.vercel.app`

---

## 6. Seed the vector DB (required!)

An empty index means the assistant refuses every question. After the FastAPI
service is up, ingest the law PDFs in `backend/law/` via the admin endpoint using
your `ADMIN_API_KEY` (`POST /admin/upload-pdf` with the `X-Admin-Key` header), or
the helper in `backend/scripts/`. Pinecone's `sevak` index is created
automatically on the first ingest.

---

## Env var matrix (what goes where)

| Variable | FastAPI (Render) | Express (Vercel) | Frontend (Vercel) |
| -------- | :--: | :--: | :--: |
| `DATABASE_URL` (Neon) | ✅ | | |
| `MONGODB_URI` (Atlas) | | ✅ | |
| `VECTOR_STORE=pinecone` + `PINECONE_API_KEY` | ✅ | | |
| `GOOGLE_API_KEY` | ✅ | | |
| `JWT_SECRET` | ✅ | ✅ (separate value) | |
| `ADMIN_API_KEY` | ✅ | | |
| `ADMIN_PASSWORD` | | ✅ | |
| `TWILIO_*` (optional) | | ✅ | |
| `FRONTEND_URL` = frontend Vercel URL | ✅ | ✅ | |
| `VITE_BACKEND_URL` = Render URL | | | ✅ |
| `VITE_BASE_URL` = Express Vercel URL | | | ✅ |
| `VITE_CLOUDINARY_KEY` / `VITE_LOCATION_KEY` | | | ✅ |

---

## Gotchas

- **CORS is exact-origin.** `FRONTEND_URL` must be your **production** Vercel URL.
  Vercel *preview* deployments (per-commit URLs) have different origins and will
  be blocked unless you add them — test on the production domain.
- **Render free sleeps** after ~15 min idle → ~50s cold start on the first
  request. Free tier gives **750 instance-hours/month per account**, so keep only
  **one** always-on Render service (FastAPI); Vercel functions have no such cap.
- **Pinecone free starter** allows one index and is always-on (no keep-alive
  needed). The index dimension (768) must match the embedder — don't switch
  embedding providers without re-ingesting.
- **Seed the vector DB** or chat will only ever refuse.
- **Twilio is not free** (trial credit only, and texts only verified numbers).
  OTP is optional — the app works without it.
- **Gemini free tier** has rate limits; fine for demos.
- **Feedback table:** created by `prisma migrate deploy` on Render. If you skip
  migrations, the feedback endpoint silently no-ops (chat is unaffected).

---

## Hosting the frontend on GitHub Pages instead?

This repo also includes a Pages path (`.github/workflows/deploy-frontend.yml`,
`public/404.html`, `VITE_BASE`). If you prefer Pages over Vercel for the
frontend, see the workflow file and set `VITE_BASE=/<repo>/`. Otherwise you can
delete those Pages-only artifacts.
