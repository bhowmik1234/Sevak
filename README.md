# 🛡️ Sevak

<div align="center">

**A civic / public-safety platform for India — AI legal assistance + citizen issue reporting**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

*Empowering communities with AI-driven chatbot support and seamless incident reporting.*

</div>

---

Sevak bundles two products behind one React frontend:

1. **SEVAK Legal Assistant** — a RAG chatbot answering questions about Indian law
   (IPC, CrPC, POCSO, DV Act, etc.) for victims of crime or injustice.
2. **ReportBox** — a citizen issue-reporting tool (with media upload, geolocation,
   and phone OTP) plus an admin dashboard for triaging reports.

## Architecture

```
                         ┌────────────────────────┐
                         │   ReportBox-front       │
                         │   React + Vite + Tailwind│
                         └───────────┬────────────┘
              VITE_BACKEND_URL  │     │  VITE_BASE_URL
            (auth / chat)       │     │  (reports / OTP / admin)
                                ▼     ▼
        ┌───────────────────────────┐   ┌──────────────────────────────┐
        │  backend/  (FastAPI)      │   │  ReportBox-Backend/ (Express) │
        │  Legal Assistant + RAG    │   │  Reports, OTP, admin auth      │
        │  Gemini · Qdrant · Prisma │   │  Mongoose · Twilio · JWT       │
        │  PostgreSQL               │   │  MongoDB                        │
        └───────────────────────────┘   └──────────────────────────────┘
```

| Service              | Stack                                                     | Responsibility                          |
| -------------------- | --------------------------------------------------------- | --------------------------------------- |
| `backend/`           | FastAPI, Google Gemini, Qdrant, Prisma + PostgreSQL       | User auth, chat (RAG), PDF ingestion    |
| `ReportBox-Backend/` | Express, Mongoose + MongoDB, Twilio Verify, JWT           | Report CRUD, phone OTP, admin login     |
| `ReportBox-front/`   | React 19, Vite, Tailwind, react-markdown                  | UI for both products                    |

## Repository layout

```
sevak/
├── backend/            # FastAPI — Legal Assistant + RAG
├── ReportBox-Backend/  # Express — reports / OTP / admin
├── ReportBox-front/    # React frontend (serves both products)
└── README.md
```

---

## 1. FastAPI backend (`backend/`)

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
prisma generate
prisma migrate deploy        # or: prisma migrate dev (local)
uvicorn app.main:app --reload
```

Requires a running **Qdrant** (local: `docker run -p 6333:6333 qdrant/qdrant`,
or Qdrant Cloud via `QDRANT_URL`) and a **PostgreSQL** database.

### Environment variables

| Variable                    | Required | Description                                                  |
| --------------------------- | -------- | ------------------------------------------------------------ |
| `DATABASE_URL`              | yes      | PostgreSQL connection string (Prisma)                       |
| `JWT_SECRET`                | yes      | Secret used to sign user JWTs                                |
| `GOOGLE_API_KEY`            | yes      | Google Gemini API key                                       |
| `ADMIN_API_KEY`             | yes\*    | Shared secret for the `/admin/upload-pdf` endpoint           |
| `FRONTEND_URL`              | yes      | Allowed CORS origin (the deployed frontend URL)             |
| `QDRANT_URL` + `QDRANT_API_KEY` | no   | Use Qdrant Cloud; if unset, falls back to host/port          |
| `QDRANT_HOST` / `QDRANT_PORT`   | no   | Local Qdrant (defaults `localhost:6333`)                    |
| `JWT_EXPIRE_MINUTES`        | no       | User token lifetime (default 1440)                          |
| `CLEANUP_INTERVAL_MINUTES`  | no       | How often old messages are purged (default 60)             |
| `MESSAGE_RETENTION_MINUTES` | no       | How long messages are kept (default 1440)                  |

\* Required only if you use the PDF ingestion endpoint.

See [RAG pipeline](#rag-pipeline) below for the provider/verification env vars.

### Key endpoints

| Method | Path                | Auth          | Purpose                          |
| ------ | ------------------- | ------------- | -------------------------------- |
| POST   | `/users/signup`     | —             | Register, returns JWT            |
| POST   | `/auth/login`       | —             | Login, returns JWT               |
| POST   | `/chat/message`     | Bearer JWT    | Ask the legal assistant          |
| GET    | `/chat/history`     | Bearer JWT    | Current user's chat history       |
| POST   | `/admin/upload-pdf` | `X-Admin-Key` | Ingest a PDF (URL or file upload) |

### RAG pipeline

The legal assistant runs a verified retrieval pipeline:

```
query → rewrite → retrieve (Qdrant) → ④ relevance gate → generate → ⑥ groundedness → answer + sources
```

- **Rewrite** — turns a conversational follow-up into a standalone search query.
- **④ Relevance gate (pre-gen)** — if no retrieved chunk clears `RELEVANCE_THRESHOLD`,
  the assistant refuses instead of hallucinating.
- **⑥ Groundedness (post-gen)** — checks the answer is supported by the retrieved
  sources; unverifiable answers get a caveat appended.

Every stage is **pluggable** via env, giving two profiles:

| Stage        | Free profile (default)        | Local / self-host profile        |
| ------------ | ----------------------------- | -------------------------------- |
| Embeddings   | Gemini `text-embedding-004`   | fastembed ONNX (`bge-small`)     |
| Generation   | Gemini flash                  | Ollama (local-first) → API       |
| Rerank       | off                           | cross-encoder                    |
| Groundedness | LLM-as-judge                  | local NLI entailment             |

The free profile loads **no local ML** (fits a 512 MB host). For the local
profile, `pip install -r requirements-local.txt` and install Ollama.

| Variable               | Default                        | Description                                   |
| ---------------------- | ------------------------------ | --------------------------------------------- |
| `EMBEDDINGS_PROVIDER`  | `gemini`                       | `gemini` \| `fastembed`                       |
| `LLM_PROVIDER`         | `gemini`                       | `gemini` \| `ollama` \| `hybrid`              |
| `GEMINI_MODEL`         | `models/gemini-1.5-flash`      | Generation model                              |
| `GEMINI_EMBED_MODEL`   | `models/text-embedding-004`    | Embedding model                               |
| `OLLAMA_HOST` / `OLLAMA_MODEL` | `localhost:11434` / `qwen2.5:3b-instruct` | Local generation        |
| `RETRIEVE_TOP_K` / `FINAL_K` | `20` / `5`               | Candidates retrieved / fed to the LLM         |
| `RELEVANCE_THRESHOLD`  | `0.30`                         | Min cosine score to answer (else refuse)      |
| `RERANK_ENABLED`       | `false`                        | Cross-encoder rerank (self-host)              |
| `GROUNDEDNESS_ENABLED` | `true`                         | Toggle the post-gen check                     |
| `GROUNDEDNESS_METHOD`  | `judge`                        | `judge` (API) \| `nli` (local) \| `off`       |
| `QUERY_REWRITE_ENABLED`| `true`                         | Conversational query rewriting                |

`POST /chat/message` returns `{ reply, sources, grounded, refused }`.

---

## 2. Express backend (`ReportBox-Backend/`)

```bash
cd ReportBox-Backend
npm install
npm start          # nodemon index.js
```

### Environment variables

| Variable               | Required | Description                                  |
| ---------------------- | -------- | -------------------------------------------- |
| `MONGODB_URI`          | yes      | MongoDB connection string                    |
| `JWT_SECRET`           | yes      | Secret used to sign admin JWTs               |
| `ADMIN_PASSWORD`       | yes      | Admin dashboard password (server-side only)  |
| `TWILIO_ACCOUNT_SID`   | yes\*    | Twilio account SID                           |
| `TWILIO_AUTH_TOKEN`    | yes\*    | Twilio auth token                            |
| `TWILIO_SERVICE_SID`   | yes\*    | Twilio Verify service SID                    |
| `FRONTEND_URL`         | no       | Restricts CORS to this origin when set       |
| `PORT`                 | no       | Defaults to 3000                             |

\* Required only for the OTP feature.

### Key endpoints

| Method | Path                   | Auth        | Purpose                       |
| ------ | ---------------------- | ----------- | ----------------------------- |
| POST   | `/api/ReportForm`      | —           | Submit a report (public)      |
| GET    | `/api/ReportForm`      | Bearer JWT  | List reports (admin)          |
| PATCH  | `/api/ReportForm/:id`  | Bearer JWT  | Update report status (admin)  |
| POST   | `/api/admin/login`     | —           | Admin login, returns JWT      |
| POST   | `/api/send-otp`        | rate-limited| Send phone OTP                |
| POST   | `/api/verify-otp`      | rate-limited| Verify phone OTP              |

---

## 3. React frontend (`ReportBox-front/`)

```bash
cd ReportBox-front
npm install
npm run dev
```

### Environment variables (`.env`)

| Variable               | Description                                            |
| ---------------------- | ----------------------------------------------------- |
| `VITE_BACKEND_URL`     | Base URL of the FastAPI backend (auth + chat)         |
| `VITE_BASE_URL`        | Base URL of the Express backend (reports / OTP / admin)|
| `VITE_CLOUDINARY_KEY`  | Cloudinary cloud name for media uploads               |
| `VITE_LOCATION_KEY`    | OpenCage geocoding API key                            |

---

## Security notes

- User and admin passwords are never stored or compared in plaintext: user
  passwords are bcrypt-hashed, and the admin password lives only in the Express
  backend's `ADMIN_PASSWORD` env var.
- All authenticated requests use short-lived JWTs sent as `Authorization: Bearer`.
- Set strong, unique values for `JWT_SECRET` (both backends) and `ADMIN_PASSWORD`.
- OTP endpoints are rate-limited to curb abuse and Twilio cost.

---

## 🤝 Contributing

We welcome community contributions! Please feel free to submit a Pull Request.
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

<div align="center">

**Built with 🛠️ for safer communities**

</div>
