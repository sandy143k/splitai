'use client'
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Shield, Clock } from 'lucide-react'

import AnimatedBackground from '@/components/AnimatedBackground'
import DropZone           from '@/components/DropZone'
import ProgressCard       from '@/components/ProgressCard'
import ResultCard         from '@/components/ResultCard'
import LegalBanner        from '@/components/LegalBanner'
import { uploadAudio }    from '@/utils/api'
import { useJobPoller }   from '@/hooks/useJobPoller'

type Phase = 'idle' | 'uploading' | 'processing' | 'done' | 'error'

export default function Home() {
  const [phase, setPhase]     = useState<Phase>('idle')
  const [jobId, setJobId]     = useState<string | null>(null)
  const [file, setFile]       = useState<File | null>(null)
  const [uploadPct, setUploadPct] = useState(0)
  const [uploadErr, setUploadErr] = useState<string | null>(null)

  const { status, startPolling } = useJobPoller()

  const handleFile = useCallback(async (f: File) => {
    setFile(f)
    setUploadErr(null)
    setPhase('uploading')
    setUploadPct(0)

    try {
      const id = await uploadAudio(f, pct => setUploadPct(pct))
      setJobId(id)
      setPhase('processing')
      startPolling(id)
    } catch (e: any) {
      setUploadErr(e.response?.data?.detail ?? e.message ?? 'Upload failed')
      setPhase('error')
    }
  }, [startPolling])

  const reset = () => {
    setPhase('idle'); setJobId(null); setFile(null)
    setUploadPct(0); setUploadErr(null)
  }

  const currentStatus = status?.status ?? phase
  const isDone  = currentStatus === 'done'
  const isError = currentStatus === 'error' || phase === 'error'

  const progress = phase === 'uploading'
    ? Math.round(uploadPct * 0.10)
    : status?.progress ?? 0

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4 py-16 overflow-hidden">
      <AnimatedBackground />

      {/* Vignette */}
      <div className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 25%, rgba(4,3,12,.55) 65%, rgba(2,1,8,.94) 100%)',
          zIndex: 1,
        }}
      />

      <div className="relative z-10 w-full max-w-3xl flex flex-col items-center gap-8">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-center"
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-xl btn-glow flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <span
              className="text-xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Split<span className="text-gradient">AI</span>
            </span>
          </div>

          <h1
            className="text-5xl md:text-6xl font-extrabold leading-none mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <span className="text-gradient">Split any song</span>
            <br />
            <span className="text-white/90">in seconds.</span>
          </h1>
          <p className="text-white/45 text-lg max-w-md mx-auto leading-relaxed">
            AI-powered vocal & instrumental separation.
            Upload once, download two perfect stems.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {[
              { icon: Zap,    text: 'htdemucs model' },
              { icon: Shield, text: 'No permanent storage' },
              { icon: Clock,  text: 'Auto-delete in 24h' },
            ].map(({ icon: Icon, text }) => (
              <span
                key={text}
                className="flex items-center gap-1.5 text-xs text-white/40 glass px-3 py-1.5 rounded-full"
              >
                <Icon size={11} className="text-brand-purple" />
                {text}
              </span>
            ))}
          </div>
        </motion.div>

        {/* ── Legal Banner ── */}
        <LegalBanner />

        {/* ── Main interaction area ── */}
        <div className="w-full">
          <AnimatePresence mode="wait">

            {/* IDLE: dropzone */}
            {phase === 'idle' && (
              <motion.div key="drop"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
              >
                <DropZone onFile={handleFile} />
              </motion.div>
            )}

            {/* UPLOADING / PROCESSING */}
            {(phase === 'uploading' || phase === 'processing') && !isDone && (
              <motion.div key="progress"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <ProgressCard
                  progress={progress}
                  status={status?.status ?? phase}
                  filename={file?.name ?? ''}
                />
              </motion.div>
            )}

            {/* DONE */}
            {isDone && status && (
              <motion.div key="done"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <ResultCard
                  jobId={status.id}
                  filename={status.filename}
                  expiresAt={status.expires_at}
                  onReset={reset}
                />
              </motion.div>
            )}

            {/* ERROR */}
            {isError && (
              <motion.div key="error"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="glass rounded-2xl p-8 text-center max-w-2xl mx-auto"
              >
                <p className="text-red-400 mb-2 font-semibold">Something went wrong</p>
                <p className="text-white/35 text-sm mb-5">
                  {status?.error ?? uploadErr ?? 'Unknown error. Please try again.'}
                </p>
                <button onClick={reset} className="btn-glow px-6 py-2.5 rounded-full text-sm text-white">
                  Try Again
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* ── Footer ── */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          className="text-xs text-white/18 text-center"
        >
          Split AI · Powered by{' '}
          <a href="https://github.com/facebookresearch/demucs" target="_blank" rel="noopener"
            className="underline hover:text-white/40 transition-colors">
            Meta Demucs
          </a>
          {' '}· Files deleted after 24 hours
        </motion.p>

      </div>
    </main>
  )
}
