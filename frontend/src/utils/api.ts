import axios from 'axios'

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 30_000,
})

export interface JobStatus {
  id: string
  status: 'queued' | 'processing' | 'done' | 'error'
  progress: number
  filename: string
  created_at: string
  expires_at: string
  vocals_url: string | null
  instrumental_url: string | null
  error: string | null
}

/** Upload audio file, returns job_id */
export async function uploadAudio(
  file: File,
  onUploadProgress?: (pct: number) => void
): Promise<string> {
  const form = new FormData()
  form.append('file', file)

  const res = await API.post('/api/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: e => {
      if (onUploadProgress && e.total) {
        onUploadProgress(Math.round((e.loaded / e.total) * 100))
      }
    },
  })
  return res.data.job_id
}

/** Poll job status */
export async function getJobStatus(jobId: string): Promise<JobStatus> {
  const res = await API.get(`/api/status/${jobId}`)
  return res.data
}

/** Get download URL for a stem */
export function getDownloadUrl(jobId: string, stem: 'vocals' | 'instrumental'): string {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  return `${base}/api/download/${jobId}/${stem}`
}
