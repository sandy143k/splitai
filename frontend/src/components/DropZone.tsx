'use client'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Music, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface DropZoneProps {
  onFile: (file: File) => void
  disabled?: boolean
}

const ACCEPTED = { 'audio/*': ['.mp3', '.wav', '.flac', '.m4a', '.ogg'] }
const MAX_MB = 100

export default function DropZone({ onFile, disabled }: DropZoneProps) {
  const [dragErr, setDragErr] = useState<string | null>(null)

  const onDrop = useCallback((accepted: File[], rejected: any[]) => {
    setDragErr(null)
    if (rejected.length > 0) {
      setDragErr('Unsupported file. Please upload MP3, WAV, FLAC, M4A or OGG (max 100 MB).')
      return
    }
    const file = accepted[0]
    if (file.size > MAX_MB * 1024 * 1024) {
      setDragErr(`File too large. Max ${MAX_MB} MB.`)
      return
    }
    onFile(file)
  }, [onFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxFiles: 1,
    disabled,
  })

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        {...(getRootProps() as any)}
        whileHover={!disabled ? { scale: 1.01 } : {}}
        whileTap={!disabled  ? { scale: 0.99 } : {}}
        className={`
          relative rounded-2xl p-10 text-center cursor-pointer transition-all duration-300
          glass border-2
          ${isDragActive
            ? 'border-brand-neon-b shadow-[0_0_40px_rgba(0,207,255,0.3)]'
            : 'border-brand-purple/30 hover:border-brand-purple/60 hover:shadow-[0_0_30px_rgba(123,47,255,0.2)]'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {/* Shimmer on drag */}
        <AnimatePresence>
          {isDragActive && (
            <motion.div
              className="absolute inset-0 rounded-2xl shimmer"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>

        <input {...getInputProps()} />

        {/* Icon */}
        <motion.div
          animate={{ y: isDragActive ? -8 : 0 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="flex justify-center mb-5"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-brand-purple/20 rounded-full blur-xl scale-150" />
            <div className="relative w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(123,47,255,0.3), rgba(10,111,255,0.3))' }}>
              {isDragActive
                ? <Music size={36} className="text-neon-blue animate-bounce" />
                : <Upload size={36} className="text-brand-purple" />
              }
            </div>
          </div>
        </motion.div>

        {/* Text */}
        <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          {isDragActive ? (
            <span className="text-gradient">Drop your track here</span>
          ) : (
            <span>Drag & drop your audio file</span>
          )}
        </h3>
        <p className="text-sm text-white/40 mb-4">
          MP3 · WAV · FLAC · M4A · OGG &nbsp;·&nbsp; Max 100 MB
        </p>

        <button
          type="button"
          disabled={disabled}
          className="btn-glow px-6 py-2.5 rounded-full text-sm font-medium text-white pointer-events-none"
        >
          Browse Files
        </button>
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {dragErr && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 mt-3 text-sm text-red-400 px-2"
          >
            <AlertCircle size={14} />
            {dragErr}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
