'use client'
import { useState } from 'react'
import { Shield, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function LegalBanner() {
  const [dismissed, setDismissed] = useState(false)

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="glass border border-yellow-500/20 rounded-xl px-4 py-3 flex items-start gap-3 max-w-2xl mx-auto"
        >
          <Shield size={15} className="text-yellow-400 mt-0.5 shrink-0" />
          <p className="text-xs text-white/45 leading-relaxed">
            <span className="text-yellow-400 font-medium">Legal notice: </span>
            Only upload audio you own or have rights to process. By using Split AI you agree to our{' '}
            <a href="/terms" className="underline hover:text-white/70 transition-colors">Terms of Service</a>.
            Uploaded files are automatically deleted after 24 hours and are never shared or stored permanently.
          </p>
          <button
            onClick={() => setDismissed(true)}
            className="text-white/25 hover:text-white/60 transition-colors shrink-0 mt-0.5"
          >
            <X size={13} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
