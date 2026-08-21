'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GradientButton } from '@/components/v2/GradientButton'

const FALLBACK_STOPS = [
  { time: '6:00 PM', type: 'Happy Hour', name: "Whisler's", sub: 'East 6th · Cocktails', emoji: '🍹', open: true },
  { time: '7:30 PM', type: 'Dinner', name: 'Suerte', sub: 'Upscale Mexican · Resy', emoji: '🌮', open: true, bookable: true },
  { time: '9:30 PM', type: 'Live Music', name: 'Parish', sub: 'Live Music Venue', emoji: '🎵', open: false },
  { time: '11:30 PM', type: 'Late Night', name: 'Rainey St.', sub: 'Bar District', emoji: '🌃', open: false },
]

const VENUE_EMOJIS: Record<string, string> = {
  restaurant: '🍽', bar: '🍸', cocktail: '🥂', music: '🎵', late: '🌃', default: '✨',
}

const STOP_TIMES = ['7:00 PM', '9:00 PM', '11:00 PM']
const STOP_TYPES = ['Dinner', 'Drinks', 'Late Night']

function stopsFromPairing(pairing: { names: string[]; tags?: string[]; cost?: string; reservation?: string }) {
  return pairing.names.map((name, i) => ({
    time: STOP_TIMES[i] ?? `${10 + i}:00 PM`,
    type: STOP_TYPES[i] ?? 'Stop',
    name,
    sub: pairing.cost ? `${pairing.cost} · Dashi pick` : 'Dashi pick',
    emoji: i === 0 ? '🍽' : '🍸',
    open: true,
    bookable: i === 0 && !!pairing.reservation?.includes('available'),
  }))
}

const PAST_PLANS = [
  {
    id: '1',
    title: 'Hestia Night',
    date: 'Aug 12, 2026',
    group: 'Weekend Crew',
    stops: 3,
    emoji: '🔥',
    img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&q=75',
  },
  {
    id: '2',
    title: 'East 6th Bar Crawl',
    date: 'Jul 28, 2026',
    group: 'Boys Night Out',
    stops: 4,
    emoji: '🥃',
    img: 'https://images.unsplash.com/photo-1543007631-283050bb3e8c?w=300&q=75',
  },
]

type BuiltStop = {
  time: string; type: string; name: string;
  sub: string; emoji: string; open: boolean; bookable: boolean;
}

export default function V2PlansPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'tonight' | 'past'>('tonight')
  const [pendingPairing, setPendingPairing] = useState<{ names: string[]; tagline: string; cost?: string; reservation?: string } | null>(null)
  const [builtStops, setBuiltStops] = useState<BuiltStop[] | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('dashi_pending_plan')
      if (!raw) return
      const data = JSON.parse(raw)
      localStorage.removeItem('dashi_pending_plan')
      if (data?.type === 'individual' && data?.pairing) {
        setPendingPairing(data.pairing)
      } else if (data?.type === 'buildMyNight' && Array.isArray(data?.stops)) {
        setBuiltStops(data.stops)
      }
    } catch { /* ignore */ }
  }, [])

  const tonightStops = builtStops ?? (pendingPairing ? stopsFromPairing(pendingPairing) : FALLBACK_STOPS)

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: '#09090B' }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex-shrink-0">
        <h1 style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.03em' }}>Plans</h1>
        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Tonight and beyond</p>

        {/* Tab switcher */}
        <div className="flex gap-1 mt-4 rounded-[14px] p-1" style={{ background: '#151518', border: '1px solid #25252B' }}>
          {(['tonight', 'past'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 rounded-[10px] py-2 text-center transition-all"
              style={{
                background: tab === t ? 'linear-gradient(135deg, #7C3AED, #EC4899)' : 'none',
                color: tab === t ? '#fff' : 'rgba(255,255,255,0.4)',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: tab === t ? '0 4px 12px rgba(124,58,237,0.35)' : 'none',
                textTransform: 'capitalize',
              }}
            >
              {t === 'tonight' ? "Tonight's Plan" : 'Past Plans'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 no-scrollbar">

        {tab === 'tonight' && (
          <div className="pt-2">
            {/* Source badge */}
            {builtStops ? (
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div style={{ fontSize: '1.2rem' }}>✨</div>
                  <div>
                    <p style={{ fontSize: '0.82rem', fontWeight: 800 }}>{builtStops.length} stops tonight</p>
                    <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)' }}>Built from your saved venues</p>
                  </div>
                </div>
                <span style={{
                  fontSize: '0.6rem', fontWeight: 800, padding: '4px 10px', borderRadius: 100,
                  background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', color: '#c4b5fd',
                }}>My Night ✨</span>
              </div>
            ) : pendingPairing ? (
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div style={{ fontSize: '1.2rem' }}>✨</div>
                  <div>
                    <p style={{ fontSize: '0.82rem', fontWeight: 800 }}>{pendingPairing.names.join(' + ')}</p>
                    <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)' }}>Your Dashi match · Just you</p>
                  </div>
                </div>
                <span style={{
                  fontSize: '0.6rem', fontWeight: 800, padding: '4px 10px', borderRadius: 100,
                  background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', color: '#c4b5fd',
                }}>
                  New ✨
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div style={{ fontSize: '1.2rem' }}>🎉</div>
                  <div>
                    <p style={{ fontSize: '0.82rem', fontWeight: 800 }}>Weekend Crew</p>
                    <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)' }}>4 people · 94% match</p>
                  </div>
                </div>
                <span style={{
                  fontSize: '0.6rem', fontWeight: 800, padding: '4px 10px', borderRadius: 100,
                  background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80',
                }}>
                  Approved ✓
                </span>
              </div>
            )}

            {/* Timeline */}
            <div className="flex flex-col gap-0 mb-5">
              {tonightStops.map((stop, i) => (
                <div key={stop.name} className="flex gap-3">
                  {/* Line + dot */}
                  <div className="flex flex-col items-center" style={{ width: 28, flexShrink: 0 }}>
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: stop.open
                        ? 'linear-gradient(135deg, #7C3AED, #EC4899)'
                        : '#25252B',
                      border: stop.open ? 'none' : '2px solid #25252B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      boxShadow: stop.open ? '0 0 16px rgba(124,58,237,0.5)' : 'none',
                      flexShrink: 0,
                    }}>
                      {stop.open ? stop.emoji : <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>{stop.emoji}</span>}
                    </div>
                    {i < tonightStops.length - 1 && (
                      <div style={{
                        width: 2,
                        flex: 1,
                        minHeight: 32,
                        background: stop.open
                          ? 'linear-gradient(to bottom, rgba(124,58,237,0.6), rgba(236,72,153,0.3))'
                          : 'rgba(255,255,255,0.08)',
                        margin: '2px 0',
                      }} />
                    )}
                  </div>

                  {/* Card */}
                  <div className="flex-1 rounded-[16px] p-3.5 mb-3 flex items-center gap-3"
                    style={{
                      background: stop.open ? '#151518' : 'rgba(21,21,24,0.5)',
                      border: `1px solid ${stop.open ? '#25252B' : 'rgba(37,37,43,0.5)'}`,
                    }}>
                    <div className="flex-1">
                      <p style={{ fontSize: '0.55rem', fontWeight: 800, color: 'rgba(168,85,247,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{stop.time} · {stop.type}</p>
                      <p style={{ fontSize: '0.92rem', fontWeight: 800, color: stop.open ? '#fff' : 'rgba(255,255,255,0.4)' }}>{stop.name}</p>
                      <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{stop.sub}</p>
                    </div>
                    {stop.bookable && (
                      <button
                        className="rounded-[10px] px-3 py-2 flex-shrink-0 transition-all active:scale-95"
                        style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)', color: '#fff', fontSize: '0.65rem', fontWeight: 800, border: 'none', cursor: 'pointer' }}
                      >
                        Reserve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom actions */}
            <div className="flex gap-2.5">
              <GradientButton size="md" style={{ flex: 2 }} onClick={() => router.push('/groups/weekend-crew/plan')}>
                Edit Plan
              </GradientButton>
              <button
                style={{
                  flex: 1, height: 52, borderRadius: 14,
                  background: 'none', border: '1px solid #25252B',
                  color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                }}
              >
                Share
              </button>
            </div>
          </div>
        )}

        {tab === 'past' && (
          <div className="pt-2 flex flex-col gap-3">
            {PAST_PLANS.map(plan => (
              <button
                key={plan.id}
                className="w-full text-left rounded-[20px] overflow-hidden transition-all active:scale-[0.98]"
                style={{ background: '#151518', border: '1px solid #25252B' }}
              >
                <div style={{ position: 'relative', height: 120 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={plan.img} alt={plan.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 100%)' }} />
                  <div style={{ position: 'absolute', bottom: 10, left: 14 }}>
                    <p style={{ fontSize: '1rem', fontWeight: 900 }}>{plan.emoji} {plan.title}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>{plan.group} · {plan.stops} stops</p>
                    <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)' }}>{plan.date}</p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
