import os
import uuid
import asyncio
import shutil
from datetime import datetime, timedelta
from pathlib import Path

from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from models import JobStatus, JobResponse

app = FastAPI(
    title="Split AI API",
    description="AI-powered vocal and instrumental separator",
    version="1.0.0"
)

# ── CORS: allow all origins (fixes Vercel → Render connection) ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("storage/uploads")
OUTPUT_DIR = Path("storage/outputs")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

jobs: dict[str, dict] = {}


@app.get("/health")
async def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


@app.post("/api/upload", response_model=JobResponse)
async def upload_audio(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    allowed = {".mp3", ".wav", ".flac", ".m4a", ".ogg"}
    ext = Path(file.filename).suffix.lower()
    if ext not in allowed:
        raise HTTPException(status_code=400, detail=f"Unsupported type '{ext}'.")

    contents = await file.read()
    if len(contents) > 50 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large. Max 50 MB.")

    job_id = str(uuid.uuid4())
    upload_path = UPLOAD_DIR / f"{job_id}{ext}"
    with open(upload_path, "wb") as f:
        f.write(contents)

    jobs[job_id] = {
        "id":               job_id,
        "status":           "queued",
        "progress":         0,
        "filename":         file.filename,
        "created_at":       datetime.utcnow().isoformat(),
        "expires_at":       (datetime.utcnow() + timedelta(hours=24)).isoformat(),
        "vocals_url":       None,
        "instrumental_url": None,
        "error":            None,
    }

    background_tasks.add_task(process_audio, job_id, upload_path)
    return JobResponse(job_id=job_id, status="queued", message="Processing started.")


async def process_audio(job_id: str, input_path: Path):
    try:
        jobs[job_id]["status"]   = "processing"
        jobs[job_id]["progress"] = 10

        output_dir = OUTPUT_DIR / job_id
        output_dir.mkdir(exist_ok=True)

        def progress_cb(pct: int):
            jobs[job_id]["progress"] = pct

        await asyncio.get_event_loop().run_in_executor(
            None, _run_separation,
            str(input_path), str(output_dir), progress_cb
        )

        jobs[job_id].update({
            "status":           "done",
            "progress":         100,
            "vocals_url":       f"/api/download/{job_id}/vocals",
            "instrumental_url": f"/api/download/{job_id}/instrumental",
        })

    except Exception as e:
        jobs[job_id].update({"status": "error", "progress": 0, "error": str(e)})
    finally:
        try:
            os.remove(input_path)
        except Exception:
            pass


def _run_separation(input_path, output_dir, progress_cb):
    from processor import AudioProcessor
    AudioProcessor().separate(input_path, output_dir, progress_cb)


@app.get("/api/status/{job_id}", response_model=JobStatus)
async def job_status(job_id: str):
    job = jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    return JobStatus(**job)


@app.get("/api/download/{job_id}/{stem}")
async def download_stem(job_id: str, stem: str):
    if stem not in ("vocals", "instrumental"):
        raise HTTPException(status_code=400, detail="Invalid stem.")
    job = jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    if job["status"] != "done":
        raise HTTPException(status_code=202, detail="Not ready yet.")
    file_path = OUTPUT_DIR / job_id / f"{stem}.wav"
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found.")
    return FileResponse(
        path=str(file_path),
        media_type="audio/wav",
        filename=f"{Path(job['filename']).stem}_{stem}.wav",
    )


@app.delete("/api/job/{job_id}")
async def delete_job(job_id: str):
    job = jobs.pop(job_id, None)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    folder = OUTPUT_DIR / job_id
    if folder.exists():
        shutil.rmtree(folder)
    return {"message": "Deleted."}
