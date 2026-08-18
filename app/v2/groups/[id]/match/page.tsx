'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

function Confetti() {
  const [particles] = useState(() => {
    const colors = ['#7C3AED', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#fff', '#ffd60a']
    return Array.from({ length: 48 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 2,
      size: Math.random() * 7 + 4,
      spin: Math.random() * 720,
    }))
  })
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.x}%`,
          top: '-12px',
          width: p.size,
          height: p.size,
          background: p.color,
          borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          animation: `confettiFall 3.5s ${p.delay}s ease-in forwards`,
          opacity: 0,
        }} />
      ))}
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(0)    rotate(0deg);       opacity: 1; }
          100% { transform: translateY(920px) rotate(720deg);    opacity: 0; }
        }
      `}</style>
    </div>
  )
}

const TIMELINE = [
  { time: '6:00 PM',  type: 'Happy Hour', name: 'Small Victory',         sub: 'Rooftop · Cocktails · 0.8 mi',  img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=80&q=70' },
  { time: '7:30 PM',  type: 'Dinner',     name: 'Loro Asian Smokehouse', sub: 'Asian · $$$ · 1.2 mi',          img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=80&q=70' },
  { time: '9:30 PM',  type: 'Live Music', name: 'The Continental Club',  sub: 'Live Music · 1.0 mi',            img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=80&q=70' },
  { time: '11:30 PM', type: 'Late Night', name: "Goldie's",              sub: 'Cocktails · 0.6 mi',             img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=80&q=70' },
]

export default function MatchPage() {
  const router = useRouter()
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 400)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="flex flex-col h-full overflow-hidden relative" style={{ background: '#09090B' }}>
      <Confetti />

      <div className="flex-1 overflow-y-auto px-5 pb-4 no-scrollbar relative z-10">
        {/* Match header */}
        <div className="flex flex-col items-center pt-8 pb-5 text-center">
          <h1 style={{ fontSize: '1.7rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 6 }}>
            It&apos;s a match! 🎉
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', marginBottom: 20, maxWidth: 260 }}>
            Dashi found the perfect night for everyone.
          </p>

          {/* 94% gauge + match info side by side */}
          <div className="flex items-center gap-5 w-full">
            {/* Ring gauge */}
            <div style={{ position: 'relative', width: 88, height: 88, flexShrink: 0 }}>
              <svg viewBox="0 0 88 88" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                <defs>
                  <linearGradient id="gauge-g" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7C3AED"/>
                    <stop offset="100%" stopColor="#EC4899"/>
                  </linearGradient>
                </defs>
                <circle cx="44" cy="44" r="38" fill="none" stroke="#25252B" strokeWidth="6"/>
                <circle
                  cx="44" cy="44" r="38"
                  fill="none"
                  stroke="url(#gauge-g)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 38}`}
                  strokeDashoffset={`${2 * Math.PI * 38 * (1 - (revealed ? 0.94 : 0))}`}
                  transform="rotate(-90 44 44)"
                  style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{
                  fontSize: '1.15rem', fontWeight: 900,
                  background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  opacity: revealed ? 1 : 0, transition: 'opacity 0.5s',
                }}>94%</span>
              </div>
            </div>

            {/* Match text */}
            <div className="text-left flex-1">
              <p style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: 4 }}>Group Match</p>
              <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
                High match on cuisine, vibe, budget and time preferences.
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex flex-col gap-0 mb-5">
          {TIMELINE.map((stop, i) => (
            <div key={stop.name} className="flex items-start gap-3">
              {/* Time column */}
              <div style={{ width: 56, flexShrink: 0, paddingTop: 4 }}>
                <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>{stop.time}</span>
              </div>

              {/* Dot + line */}
              <div className="flex flex-col items-center" style={{ flexShrink: 0, width: 14 }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
                  boxShadow: '0 0 8px rgba(236,72,153,0.5)',
                  marginTop: 5,
                }} />
                {i < TIMELINE.length - 1 && (
                  <div style={{ width: 2, flex: 1, minHeight: 44, background: 'rgba(124,58,237,0.35)', borderRadius: 1, margin: '4px 0' }} />
                )}
              </div>

              {/* Card */}
              <div className="flex-1 flex items-center gap-3 rounded-[14px] p-3 mb-3" style={{ background: '#151518', border: '1px solid #25252B' }}>
                <div className="flex-1">
                  <p style={{ fontSize: '0.52rem', fontWeight: 800, color: 'rgba(168,85,247,0.8)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{stop.type}</p>
                  <p style={{ fontSize: '0.88rem', fontWeight: 800, lineHeight: 1.2, marginBottom: 2 }}>{stop.name}</p>
                  <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)' }}>{stop.sub}</p>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={stop.img} alt={stop.name} style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTAs */}
      <div className="px-5 py-4 flex-shrink-0 flex flex-col gap-2.5 relative z-10">
        <button
          onClick={() => router.push('/v2/plans')}
          className="w-full rounded-[14px] transition-all active:scale-[0.98]"
          style={{ height: 54, background: 'linear-gradient(135deg, #7C3AED, #EC4899)', color: '#fff', fontSize: '0.95rem', fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(124,58,237,0.4)' }}
        >
          Approve Plan
        </button>
        <button
          onClick={() => router.push('/v2/groups/weekend-crew/plan')}
          style={{ height: 46, background: 'none', border: '1px solid #25252B', borderRadius: 14, color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
        >
          Edit Plan
        </button>
      </div>
    </div>
  )
}
