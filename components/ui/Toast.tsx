'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useToast, type ToastMessage } from '@/contexts/ToastContext'
import { X } from 'lucide-react'

function ToastItem({ toast }: { toast: ToastMessage }) {
  const { dismissToast } = useToast()

  const colors = {
    success: 'border-green-500/30 bg-green-500/10 text-green-400',
    error:   'border-red-500/30   bg-red-500/10   text-red-400',
    info:    'border-purple-500/30 bg-purple-500/10 text-purple-400',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-sm font-semibold backdrop-blur-sm ${colors[toast.type]}`}
    >
      <span>{toast.message}</span>
      <button onClick={() => dismissToast(toast.id)} className="opacity-60 hover:opacity-100 transition-opacity">
        <X size={14} />
      </button>
    </motion.div>
  )
}

export function ToastContainer() {
  const { toasts } = useToast()

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[calc(100%-32px)] max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
