import { useState, useEffect, useCallback, useRef } from 'react'
import { getJobStatus, JobStatus } from '@/utils/api'

interface UseJobPollerResult {
  status: JobStatus | null
  isPolling: boolean
  error: string | null
  startPolling: (jobId: string) => void
  stopPolling: () => void
}

export function useJobPoller(): UseJobPollerResult {
  const [status, setStatus]     = useState<JobStatus | null>(null)
  const [isPolling, setPolling] = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const timerRef                = useRef<NodeJS.Timeout | null>(null)
  const jobIdRef                = useRef<string | null>(null)

  const stopPolling = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setPolling(false)
  }, [])

  const poll = useCallback(async () => {
    if (!jobIdRef.current) return
    try {
      const s = await getJobStatus(jobIdRef.current)
      setStatus(s)
      if (s.status === 'done' || s.status === 'error') {
        stopPolling()
      }
    } catch (e: any) {
      setError(e.message ?? 'Failed to fetch status')
      stopPolling()
    }
  }, [stopPolling])

  const startPolling = useCallback((jobId: string) => {
    jobIdRef.current = jobId
    setError(null)
    setPolling(true)
    poll()
    timerRef.current = setInterval(poll, 2000)
  }, [poll])

  useEffect(() => () => stopPolling(), [stopPolling])

  return { status, isPolling, error, startPolling, stopPolling }
}
