from pydantic import BaseModel
from typing import Optional

class JobResponse(BaseModel):
    job_id: str
    status: str
    message: str

class JobStatus(BaseModel):
    id: str
    status: str
    progress: int
    filename: str
    created_at: str
    expires_at: str
    vocals_url: Optional[str]       = None
    instrumental_url: Optional[str] = None
    error: Optional[str]            = None
