'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

/* ─────────────────────────────────────────────
   Photo slides — swap src with your own shots
   when you have the real video frames.
───────────────────────────────────────────── */
const SLIDES = [
  {
    src: 'https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=900&q=90',
    pos: 'center 40%',
    eye: 'Austin, Texas',
    name: 'Discover Your City.',
  },
  {
    src: 'https://images.unsplash.com/photo-1470338745628-171cf53de3a8?w=900&q=90',
    pos: 'center 55%',
    eye: "Tonight's Vibe",
    name: 'Cocktails & Good Times.',
  },
  {
    src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=90',
    pos: 'center 45%',
    eye: 'Top Picks',
    name: 'The Best Tables in Town.',
  },
  {
    src: 'https://images.unsplash.com/photo-1517263904808-5dc91e3e7044?w=900&q=90',
    pos: 'center 40%',
    eye: 'Your Night Starts Here',
    name: 'Plan It With Dashi.',
  },
]

const SLIDE_MS = 2900   // ms each slide holds

export function SplashSlideshow() {
  const [phase, setPhase]         = useState<'in' | 'exit' | 'done'>('in')
  const [cur, setCur]             = useState(0)
  const [labelShow, setLabelShow] = useState(true)
  const [progKey, setProgKey]     = useState(0)   // forces CSS animation restart
  const dismissed = useRef(false)
  const tickRef   = useRef<ReturnType<typeof setInterval> | null>(null)
  const exitRef   = useRef<ReturnType<typeof setTimeout> | null>(null)

  const dismiss = useCallback(() => {
    if (dismissed.current) return
    dismissed.current = true
    if (tickRef.current)  clearInterval(tickRef.current)
    if (exitRef.current)  clearTimeout(exitRef.current)
    setPhase('exit')
    setTimeout(() => setPhase('done'), 750)
  }, [])

  const advance = useCallback((next: number) => {
    setLabelShow(false)
    setTimeout(() => {
      setCur(next)
      setProgKey(k => k + 1)
      setTimeout(() => setLabelShow(true), 80)
    }, 350)
  }, [])

  useEffect(() => {
    let idx = 0
    tickRef.current = setInterval(() => {
      idx++
      if (idx < SLIDES.length) {
        advance(idx)
      }
    }, SLIDE_MS)

    // auto-dismiss after all slides
    exitRef.current = setTimeout(dismiss, SLIDES.length * SLIDE_MS + 400)

    return () => {
      if (tickRef.current) clearInterval(tickRef.current)
      if (exitRef.current) clearTimeout(exitRef.current)
    }
  }, [advance, dismiss])

  if (phase === 'done') return null

  const slide = SLIDES[cur]

  return (
    <>
      <style>{`
        @keyframes dsProgressFill {
          from { width: 0% }
          to   { width: 100% }
        }
        @keyframes dsLabelUp {
          from { opacity: 0; transform: translateY(10px) }
          to   { opacity: 1; transform: translateY(0) }
        }
        @keyframes dsIn {
          to { opacity: 1 }
        }
        @keyframes dsOut {
          0%   { opacity: 1; transform: scale(1);    filter: blur(0) }
          100% { opacity: 0; transform: scale(1.32); filter: blur(18px) }
        }
      `}</style>

      {/* ── Root overlay ── */}
      <div
        onClick={dismiss}
        style={{
          position: 'absolute', inset: 0, zIndex: 9999,
          cursor: 'pointer', overflow: 'hidden',
          background: '#000',
          animation: phase === 'exit'
            ? 'dsOut 0.75s ease forwards'
            : 'dsIn 0.5s ease forwards',
        }}
      >

        {/* ── Photo slides (crossfade) ── */}
        {SLIDES.map((s, i) => (
          <div
            key={i}
            style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url(${s.src})`,
              backgroundSize: 'cover',
              backgroundPosition: s.pos,
              opacity: i === cur ? 1 : 0,
              transition: 'opacity 1.1s ease',
              filter: 'brightness(0.84) contrast(1.14) saturate(0.78)',
              transform: 'translateZ(0)',
            }}
          />
        ))}

        {/* ── Gradient overlay ── */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: [
            'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.18) 65%, rgba(0,0,0,0.4) 100%)',
            'linear-gradient(to right, rgba(0,0,0,0.35) 0%, transparent 50%)',
          ].join(', '),
        }} />

        {/* ── Subtle brand tint ── */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'rgba(124,58,237,0.04)',
          mixBlendMode: 'screen',
        }} />

        {/* ── Top-left: Dashi brand ── */}
        <div style={{ position: 'absolute', top: 28, left: 20, zIndex: 10 }}>
          <div style={{
            fontSize: '1rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#fff',
          }}>
            Dashi
          </div>
          <div style={{
            fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.22em',
            textTransform: 'uppercase', marginTop: 2,
            background: 'linear-gradient(135deg, #EC4899, #7C3AED)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Austin, Texas
          </div>
        </div>

        {/* ── Top-right: skip hint ── */}
        <div style={{
          position: 'absolute', top: 34, right: 20, zIndex: 10,
          fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
        }}>
          Tap to skip
        </div>

        {/* ── Bottom-left: slide label ── */}
        {labelShow && (
          <div style={{
            position: 'absolute', bottom: 44, left: 20, zIndex: 10,
            display: 'flex', flexDirection: 'column', gap: 5,
          }}>
            <div style={{
              fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.24em',
              textTransform: 'uppercase',
              background: 'linear-gradient(135deg, #EC4899, #7C3AED)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              animation: 'dsLabelUp 0.45s ease both',
            }}>
              {slide.eye}
            </div>
            <div style={{
              fontSize: 'clamp(1.35rem, 6vw, 1.75rem)', fontWeight: 300,
              lineHeight: 1.1, color: '#fff',
              animation: 'dsLabelUp 0.45s 0.08s ease both',
            }}>
              {slide.name}
            </div>
          </div>
        )}

        {/* ── Bottom-right: dot indicators ── */}
        <div style={{
          position: 'absolute', bottom: 52, right: 20, zIndex: 10,
          display: 'flex', gap: 5, alignItems: 'center',
        }}>
          {SLIDES.map((_, i) => (
            <div
              key={i}
              style={{
                height: 5,
                width: i === cur ? 20 : 5,
                borderRadius: 3,
                background: i === cur
                  ? 'linear-gradient(135deg, #EC4899, #7C3AED)'
                  : 'rgba(255,255,255,0.28)',
                transition: 'width 0.35s ease, background 0.35s ease',
              }}
            />
          ))}
        </div>

        {/* ── Progress bar ── */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 2, zIndex: 10,
          background: 'rgba(255,255,255,0.07)',
          overflow: 'hidden',
        }}>
          <div
            key={progKey}
            style={{
              height: '100%',
              background: 'linear-gradient(to right, #EC4899, #7C3AED)',
              animation: `dsProgressFill ${SLIDE_MS}ms linear forwards`,
            }}
          />
        </div>

      </div>
    </>
  )
}
