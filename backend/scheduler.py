"""
Auto-delete output files older than 24 hours.
Runs as an asyncio background task.
"""
import asyncio
import shutil
from datetime import datetime, timezone
from pathlib import Path


async def cleanup_old_files(output_dir: Path, jobs: dict, interval_hours: int = 1):
    """
    Every `interval_hours`, scan jobs and delete those older than 24 h.
    """
    while True:
        await asyncio.sleep(interval_hours * 3600)
        now = datetime.now(timezone.utc)

        expired = [
            job_id for job_id, job in list(jobs.items())
            if _is_expired(job.get("expires_at"), now)
        ]

        for job_id in expired:
            # Remove output directory
            folder = output_dir / job_id
            if folder.exists():
                shutil.rmtree(folder, ignore_errors=True)
            jobs.pop(job_id, None)
            print(f"[Cleanup] Deleted expired job {job_id}")

        if expired:
            print(f"[Cleanup] Removed {len(expired)} expired job(s).")


def _is_expired(expires_at: str | None, now: datetime) -> bool:
    if not expires_at:
        return False
    try:
        exp = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        return now >= exp
    except ValueError:
        return False
