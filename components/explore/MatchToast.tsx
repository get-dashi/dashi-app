'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { Venue } from '@/lib/types'

interface MatchToastProps {
  venue: Venue | null
  onContinue: () => void
}

export function MatchToast({ venue, onContinue }: MatchToastProps) {
  return (
    <AnimatePresence>
      {venue && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-60 flex flex-col items-center justify-center bg-black/92 backdrop-blur-xl"
        >
          {/* Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(168,85,247,0.2),transparent_60%)]" />

          <div className="relative z-10 text-center px-10">
            {/* Ring */}
            <div className="w-[120px] h-[120px] rounded-full border border-purple-500/40 flex items-center justify-center mx-auto mb-5">
              <div className="w-[90px] h-[90px] rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
            </div>

            <p className="text-[0.6rem] font-black tracking-[0.2em] uppercase text-purple-400 mb-2">Saved</p>
            <h2 className="text-2xl font-black tracking-[-0.03em] mb-1">{venue.name}</h2>
            <p className="text-sm text-white/50 mb-8">{venue.dist} away · Added to itinerary</p>

            {venue.happyHour && (
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-4 mb-6 text-left">
                <p className="text-[0.58rem] font-bold tracking-[0.12em] uppercase text-purple-400 mb-1">Happy Hour</p>
                <p className="text-sm font-bold">{venue.happyHour}</p>
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onContinue}
              className="w-full py-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-extrabold text-sm shadow-lg shadow-purple-500/30 mb-3"
            >
              Keep Exploring
            </motion.button>
            <button
              onClick={onContinue}
              className="text-xs text-white/30 hover:text-white/50 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
