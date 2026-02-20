'use client'
import { motion } from 'framer-motion'
import { Download, Mic2, Music2, Clock, RefreshCw } from 'lucide-react'
import { getDownloadUrl } from '@/utils/api'

interface ResultCardProps {
  jobId: string
  filename: string
  expiresAt: string
  onReset: () => void
}

function WaveformBars({ color, count = 28 }: { color: string; count?: number }) {
  return (
    <div className="flex items-end gap-[2px] h-10">
      {Array.from({ length: count }, (_, i) => {
        const baseH = 30 + Math.sin(i * 0.7) * 20 + Math.random() * 15
        const delay  = (i / count) * 1.2
        return (
          <div
            key={i}
            className="wave-bar rounded-sm flex-1"
            style={{
              height: `${baseH}%`,
              background: color,
              animation: `wave-bar ${0.8 + Math.random() * 0.6}s ease-in-out ${delay}s infinite`,
              opacity: 0.7 + Math.random() * 0.3,
            }}
          />
        )
      })}
    </div>
  )
}

function StemCard({
  label, icon: Icon, color, gradient, jobId, stem, description
}: {
  label: string
  icon: any
  color: string
  gradient: string
  jobId: string
  stem: 'vocals' | 'instrumental'
  description: string
}) {
  const url = getDownloadUrl(jobId, stem)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 flex flex-col gap-4"
      style={{ borderColor: `${color}30` }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: gradient }}>
          <Icon size={18} style={{ color }} />
        </div>
        <div>
          <h3 className="font-semibold" style={{ fontFamily: 'var(--font-display)' }}>{label}</h3>
          <p className="text-xs text-white/35">{description}</p>
        </div>
      </div>

      {/* Animated waveform */}
      <WaveformBars color={color} />

      {/* Download button */}
      <a
        href={url}
        download
        className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        style={{
          background: gradient,
          boxShadow: `0 0 20px ${color}40`,
        }}
      >
        <Download size={15} />
        Download {label}
      </a>
    </motion.div>
  )
}

export default function ResultCard({ jobId, filename, expiresAt, onReset }: ResultCardProps) {
  const expDate = new Date(expiresAt)
  const expStr  = expDate.toLocaleString()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-2xl mx-auto space-y-4"
    >
      {/* Success banner */}
      <div className="glass rounded-2xl px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg text-gradient" style={{ fontFamily: 'var(--font-display)' }}>
            Separation Complete ✨
          </h2>
          <p className="text-xs text-white/35 mt-0.5 truncate max-w-xs">{filename}</p>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
        >
          <RefreshCw size={12} /> New track
        </button>
      </div>

      {/* Stem cards */}
      <div className="grid grid-cols-2 gap-4">
        <StemCard
          label="Vocals"
          icon={Mic2}
          color="#c040ff"
          gradient="linear-gradient(135deg,rgba(192,64,255,0.35),rgba(123,47,255,0.35))"
          jobId={jobId}
          stem="vocals"
          description="Clean vocal track"
        />
        <StemCard
          label="Instrumental"
          icon={Music2}
          color="#00cfff"
          gradient="linear-gradient(135deg,rgba(0,207,255,0.35),rgba(10,111,255,0.35))"
          jobId={jobId}
          stem="instrumental"
          description="Full backing track"
        />
      </div>

      {/* Expiry notice */}
      <div className="flex items-center gap-2 text-xs text-white/25 justify-center">
        <Clock size={11} />
        Files auto-deleted on {expStr}. We don't store your music permanently.
      </div>
    </motion.div>
  )
}
