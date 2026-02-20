# 🎵 Split AI — Vocal & Instrumental Separator

> AI-powered music stem separation using Meta's Demucs model.
> Upload any song → get clean vocals + full instrumental in seconds.

![Split AI](https://img.shields.io/badge/AI-Demucs_htdemucs-7b2fff?style=flat-square)
![Stack](https://img.shields.io/badge/Stack-Next.js_+_FastAPI-0a6fff?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-00cfff?style=flat-square)

---

## ✨ Features

- 🎤 **Vocal separation** — clean, isolated vocal track
- 🎸 **Instrumental** — full backing track (drums + bass + other)
- ⚡ **htdemucs model** — Meta's best hybrid transformer model
- 🔒 **Auto-delete** — files removed after 24 hours
- 📱 **Beautiful UI** — animated dark luxury interface
- 🐳 **Docker ready** — one command to deploy

---

## 🏗️ Architecture

```
┌─────────────────┐         ┌───────────────────────────────┐
│   Next.js UI    │──────▶  │        FastAPI Backend         │
│                 │  HTTP   │                                │
│ • Drag & drop   │         │ • /api/upload   → job queue    │
│ • Live progress │◀──────  │ • /api/status   → poll state   │
│ • Download      │  JSON   │ • /api/download → serve stems  │
└─────────────────┘         └──────────────┬────────────────┘
                                           │
                                   ┌───────▼────────┐
                                   │  AudioProcessor │
                                   │                │
                                   │  demucs 4.0    │
                                   │  torchaudio    │
                                   │  ffmpeg        │
                                   └───────┬────────┘
                                           │
                              ┌────────────▼──────────────┐
                              │      storage/outputs/      │
                              │  {job_id}/vocals.wav       │
                              │  {job_id}/instrumental.wav │
                              │  (auto-deleted after 24h)  │
                              └────────────────────────────┘
```

---

## 🚀 Quick Start

### Option A — Docker (recommended)

```bash
git clone https://github.com/your-username/splitai
cd splitai
docker-compose up --build
```

Open: http://localhost:3000

---

### Option B — Manual

**Backend:**
```bash
cd backend

# Install system deps (Ubuntu/Debian)
sudo apt install ffmpeg python3.11

# Install Python packages
pip install -r requirements.txt

# Run API
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm install

# Set API URL
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

npm run dev
```

Open: http://localhost:3000

---

## ☁️ Hosting Guide

### Recommended (GPU)

| Provider | Spec | Notes |
|----------|------|-------|
| **RunPod** | RTX 3090, 24 GB | Cheapest GPU, ~$0.22/hr |
| **AWS EC2** | g4dn.xlarge (T4) | Reliable, ~$0.53/hr |
| **Lambda Labs** | A100 | Best quality, ~$1.10/hr |

> ⚡ GPU makes processing 10-20× faster. CPU works but takes 2–5 min per song.

### CPU-only (Budget)

Any VPS with **4+ GB RAM** will work on CPU:
- Hetzner CX31 (~€5/mo)
- DigitalOcean Droplet 4 GB

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend URL |

---

## 📁 Project Structure

```
splitai/
├── backend/
│   ├── main.py          # FastAPI app, routes
│   ├── processor.py     # Demucs audio processing
│   ├── models.py        # Pydantic schemas
│   ├── scheduler.py     # 24h auto-cleanup
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── index.tsx     # Main page
│   │   │   └── terms.tsx     # Terms of service
│   │   ├── components/
│   │   │   ├── AnimatedBackground.tsx
│   │   │   ├── DropZone.tsx
│   │   │   ├── ProgressCard.tsx
│   │   │   ├── ResultCard.tsx
│   │   │   └── LegalBanner.tsx
│   │   ├── hooks/
│   │   │   └── useJobPoller.ts
│   │   └── utils/
│   │       └── api.ts
│   ├── package.json
│   └── Dockerfile
│
└── docker-compose.yml
```

---

## ⚖️ Legal Considerations

1. **Terms of Service** — included at `/terms` page
2. **Copyright notice** — shown on upload via LegalBanner
3. **No permanent storage** — auto-delete after 24h (enforced by scheduler.py)
4. **User responsibility** — users must only upload files they own

---

## 🛠️ API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload` | Upload audio file |
| `GET` | `/api/status/{job_id}` | Poll job progress |
| `GET` | `/api/download/{job_id}/{stem}` | Download stem (vocals/instrumental) |
| `DELETE` | `/api/job/{job_id}` | Manually delete job |
| `GET` | `/health` | Health check |

---

## 🧪 Supported Formats

MP3 · WAV · FLAC · M4A · OGG · Max 100 MB

---

## 📄 License

MIT — free to use, modify, and deploy.
