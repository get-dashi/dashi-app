'use client'

import { useState, useRef, useEffect } from 'react'

/**
 * SplashVideo — plays every time the app is opened.
 * Drop your video at /public/dashi-intro.mp4 to activate.
 * Tap anywhere or wait for it to end to dismiss.
 */
export function SplashVideo() {
  const [phase, setPhase] = useState<'active' | 'fadeout' | 'done'>('active')
  const videoRef = useRef<HTMLVideoElement>(null)
  const didDismiss = useRef(false)

  const dismiss = () => {
    if (didDismiss.current) return
    didDismiss.current = true
    setPhase('fadeout')
    setTimeout(() => setPhase('done'), 700)
  }

  useEffect(() => {
    const v = videoRef.current
    if (!v) return

    v.play().catch(() => {
      // Autoplay blocked (e.g. browser policy) — skip the splash
      dismiss()
    })
  }, [])

  if (phase === 'done') return null

  return (
    <div
      onClick={dismiss}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 9999,
        background: '#000',
        cursor: 'pointer',
        opacity: phase === 'fadeout' ? 0 : 1,
        transition: phase === 'fadeout' ? 'opacity 0.7s ease' : 'none',
      }}
    >
      <video
        ref={videoRef}
        src="/dashi-intro.mp4"
        playsInline
        muted
        preload="auto"
        onEnded={dismiss}
        onError={dismiss}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />

      {/* Subtle vignette at bottom */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 40%)',
          pointerEvents: 'none',
        }}
      />

      {/* Skip hint — fades in after 1s */}
      <div
        style={{
          position: 'absolute',
          bottom: 28,
          right: 18,
          fontSize: '0.6rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase',
          animation: 'dashiSplashFadeIn 0.6s ease 1s both',
        }}
      >
        Tap to skip
      </div>

      <style>{`
        @keyframes dashiSplashFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
