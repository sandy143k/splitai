'use client'
import { motion } from 'framer-motion'
import { Loader2, Mic2, Music2, Zap } from 'lucide-react'

interface ProgressCardProps {
  progress: number
  status: string
  filename: string
}

const STAGES = [
  { label: 'Uploading',   threshold:  10, icon: Zap },
  { label: 'Analysing',   threshold:  30, icon: Mic2 },
  { label: 'AI Separating', threshold: 80, icon: Music2 },
  { label: 'Finalising',  threshold:  95, icon: Zap },
]

function currentStage(progress: number) {
  let stage = STAGES[0]
  for (const s of STAGES) { if (progress >= s.threshold) stage = s }
  return stage
}

export default function ProgressCard({ progress, status, filename }: ProgressCardProps) {
  const stage = currentStage(progress)
  const Icon = stage.icon
  const isError = status === 'error'

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto glass rounded-2xl p-8"
    >
      {/* File name */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,rgba(123,47,255,.3),rgba(10,111,255,.3))' }}>
          <Music2 size={18} className="text-brand-purple" />
        </div>
        <div>
          <p className="text-sm text-white/80 font-medium truncate max-w-xs">{filename}</p>
          <p className="text-xs text-white/30">Processing with htdemucs</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full relative"
            style={{ background: isError
              ? '#ef4444'
              : 'linear-gradient(90deg, #7b2fff, #0a6fff, #00cfff)' }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: 'easeOut', duration: 0.5 }}
          >
            {/* Shimmer on bar */}
            {!isError && progress < 100 && (
              <div className="absolute inset-0 shimmer opacity-60" />
            )}
          </motion.div>
        </div>
        <div className="flex justify-between mt-1.5 text-xs text-white/35">
          <span>{isError ? 'Error occurred' : stage.label}</span>
          <span>{progress}%</span>
        </div>
      </div>

      {/* Stage indicators */}
      <div className="flex gap-2 mt-5">
        {STAGES.map((s, i) => {
          const done = progress >= s.threshold
          const active = s.label === stage.label && !isError
          return (
            <div key={s.label} className="flex-1 text-center">
              <div className={`
                h-1 rounded-full mb-2 transition-all duration-500
                ${done ? 'bg-brand-purple' : 'bg-white/8'}
                ${active ? 'animate-pulse' : ''}
              `} />
              <p className={`text-[10px] ${done ? 'text-white/60' : 'text-white/20'}`}>
                {s.label}
              </p>
            </div>
          )
        })}
      </div>

      {/* Spinner */}
      {!isError && progress < 100 && (
        <div className="flex justify-center mt-6">
          <Loader2 size={20} className="text-brand-purple animate-spin" />
        </div>
      )}
    </motion.div>
  )
}
