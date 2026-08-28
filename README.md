# Smriti — Cognitive Gaming and Memory Assistance

Hackathon MVP for **Problem Statement 26003 — MDoNER**: an AI-based cognitive gaming and memory assistance platform for elderly people in the North Eastern Region (NER), with a Khasi-ready demonstration.

This repository is the project root (not a nested `eldercare-ai/` folder).

## This is not a medical product

The system provides **cognitive engagement**, **memory assistance**, **reminders**, **activity tracking**, and **caregiver support**.

It does **not** diagnose, treat, cure, or predict dementia or any disease. Scores are **Cognitive Performance Score** / **Activity Performance Score** (activity engagement), not clinical findings. Alerts never imply that a condition is worsening.

## Current status

**Phase 4 complete:** Offline rule-based Adaptive Cognitive Engine (per-game difficulty, Cognitive Performance Score, IndexedDB). No FastAPI or MongoDB.

| Phase | Status |
|-------|--------|
| 1 — Docs and folders | Done |
| 2 — React PWA foundation, elderly design system | Done |
| 3 — Five cognitive games (offline) | Done |
| 4 — Adaptive difficulty (offline engine) | Done |
| 5 — Reminders and daily routine | Planned |
| 6 — i18n and Khasi content architecture | Planned |
| 7 — Voice abstraction | Planned |
| 9–11 — FastAPI, local MongoDB, JWT auth | Planned |
| 12 — Offline sync | Planned |
| 13–14 — Caregiver dashboard, analytics, alerts | Planned |
| 15 — Security, tests, accessibility, performance | Planned |

## Intended stack (not installed in Phase 1)

**Frontend:** React, TypeScript, Vite, Tailwind CSS, React Router, Zustand, Dexie.js, IndexedDB, vite-plugin-pwa, Recharts, Lucide React.

**Backend:** Python, FastAPI, Pydantic, PyMongo, JWT, bcrypt or Argon2.

**Data:** Local MongoDB (`mongodb://localhost:27017`, database `eldercare_ai`). The browser never talks to MongoDB.

**AI:** On-device rule-based `AdaptiveDifficultyEngine` (no LLM per game). Voice is an interface; no fake offline Khasi STT/TTS.

## How to run

1. Frontend: `cd frontend` then `npm install` and `npm run dev`.
2. Copy `.env.example` to `.env` when the API exists (Phase 9+). Never commit `.env`.
3. Backend: Python venv, `pip install -r backend/requirements.txt`, `uvicorn` (Phase 9+).
4. MongoDB: native install on `localhost:27017`, **or** optional `docker compose up` for MongoDB only. Docker is not required.

## Architecture in one paragraph

The patient device is a React PWA. UI state lives in Zustand; durable data lives in Dexie/IndexedDB. Games, reminders, routines, and adaptive difficulty work with no network. When FastAPI is reachable, a local sync queue pushes events to MongoDB. Caregiver views use the same app with role-based routing. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Product requirements](docs/PRODUCT_REQUIREMENTS.md)
- [Database](docs/DATABASE.md)
- [Offline-first](docs/OFFLINE.md)
- [Khasi and NER content](docs/KHASI.md)
- [API contract (planned)](docs/API.md)

## Security

Secrets live in `.env` (gitignored). Frontend must never contain MongoDB credentials or real patient data. Demo seeds must be labeled **DEMO**.

## 🚀 Deployment

We recommend deploying the **Frontend** to Vercel, the **Backend** to Render, and the **Database** to MongoDB Atlas.

### 1. Database (MongoDB Atlas)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and create a free cluster.
2. Under **Network Access**, allow IP `0.0.0.0/0` (or specifically Render's IPs).
3. Under **Database Access**, create a user with a password.
4. Go to **Databases -> Connect -> Drivers** and copy your Connection String. It should look like `mongodb+srv://<username>:<password>@cluster.mongodb.net/eldercare_ai?retryWrites=true&w=majority`.

### 2. Backend (Render)
1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New -> Blueprint**.
2. Connect your GitHub repository.
3. Render will automatically detect the `render.yaml` file in the root of your repository and configure the FastAPI web service.
4. During setup, it will ask you for two Environment Variables:
   - `MONGODB_URI`: Paste the connection string from step 1.
   - `CORS_ORIGINS`: Set this to your future Vercel frontend URL (e.g., `https://smriti-app.vercel.app`). You can put `*` temporarily if needed.
5. Deploy and copy your Render URL (e.g., `https://smriti-backend.onrender.com`).

### 3. Frontend (Vercel)
1. Push your code to GitHub.
2. Go to [Vercel](https://vercel.com/) and click **Add New -> Project**.
3. Import your GitHub repository.
4. Expand the **Build and Output Settings** and set the **Root Directory** to `frontend`.
5. Under **Environment Variables**, add:
   - `VITE_API_URL`: Paste your Render backend URL (e.g., `https://smriti-backend.onrender.com`).
6. Click **Deploy**. Vercel will automatically read the `vercel.json` file for routing and deploy your React app!
