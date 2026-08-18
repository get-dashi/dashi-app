'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ALL_FEATURED_VENUES } from '@/lib/venues'
import type { Venue } from '@/lib/types'

// Quick filter chips — all occasions, one axis
const CHIPS = [
  { id: 'date',      emoji: '❤️', label: 'Date night',  mood: 'date' },
  { id: 'group',     emoji: '👥', label: 'Group night', mood: 'dance' },
  { id: 'happy',     emoji: '🥂', label: 'Happy hour',  mood: 'happy' },
  { id: 'celebrate', emoji: '🎉', label: 'Celebration', mood: 'celebrate' },
  { id: 'late',      emoji: '🌙', label: 'Late night',  mood: 'late' },
  { id: 'vibe',      emoji: '✨', label: 'Good vibes',  mood: 'vibe' },
]

const CITIES: Record<string, string> = {
  austin:    'Austin, TX',
  monterrey: 'Monterrey, MX',
  honolulu:  'Honolulu, HI',
  kauai:     "Kaua'i, HI",
  medellin:  'Medellín',
}

// Curated pairings — "venue + venue" recommendation combos
const PAIRINGS = [
  {
    id: 'uchi-dmc',
    names: ['Uchi', 'Devil May Care'],
    tagline: 'Perfect for a romantic night out.',
    img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80',
    rating: '4.9',
    reservation: 'Reservation available: 7:30 PM',
    followup: 'Cocktails afterward',
    cost: '$$$',
    tags: ['Japanese', 'Omakase'],
  },
  {
    id: 'hestia-white-horse',
    names: ['Hestia', 'White Horse'],
    tagline: 'Wood-fire dinner, then honky-tonk.',
    img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
    rating: '4.8',
    reservation: 'Reservation available: 8:00 PM',
    followup: 'Live music 9:30 PM',
    cost: '$$$',
    tags: ['Wood-Fire', 'American'],
  },
  {
    id: 'suerte-rainey',
    names: ['Suerte', 'Rainey St.'],
    tagline: 'Best masa in town, then the best block.',
    img: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80',
    rating: '4.8',
    reservation: 'No reservation needed',
    followup: 'Bar crawl afterward',
    cost: '$$',
    tags: ['Mexican', 'Bar Crawl'],
  },
]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'Good night'
}

function getSwipedKey(city: string) { return `dashi_v2_swiped_${city}` }
function loadSwiped(city: string): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(getSwipedKey(city)) ?? '[]') as string[]) } catch { return new Set() }
}
function saveSwiped(city: string, ids: Set<string>) {
  try { localStorage.setItem(getSwipedKey(city), JSON.stringify([...ids])) } catch { /* */ }
}

export default function V2ExplorePage() {
  const router = useRouter()
  const [mood, setMood] = useState('all')
  const [city, setCity] = useState('austin')
  const [swipedIds, setSwipedIds] = useState<Set<string>>(new Set())
  const [showCityMenu, setShowCityMenu] = useState(false)
  const [pairingIdx, setPairingIdx] = useState(0)
  const [swiping, setSwiping] = useState<null | 'left' | 'right'>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    setSwipedIds(loadSwiped('austin'))
  }, [])

  const pairing = PAIRINGS[pairingIdx % PAIRINGS.length]

  const handleLike = useCallback(() => {
    setSwiping('right')
    setTimeout(() => {
      setSwiping(null)
      setPairingIdx(i => i + 1)
    }, 380)
  }, [])

  const handlePass = useCallback(() => {
    setSwiping('left')
    setTimeout(() => {
      setSwiping(null)
      setPairingIdx(i => i + 1)
    }, 380)
  }, [])

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ background: '#09090B' }}
      onClick={() => showCityMenu && setShowCityMenu(false)}
    >
      {/* ── Header ── */}
      <div className="px-5 pt-4 pb-0 flex-shrink-0 flex items-center justify-between">
        {/* City picker */}
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setShowCityMenu(v => !v) }}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="rgba(168,85,247,0.9)"/>
            </svg>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fff' }}>{CITIES[city]}</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          {showCityMenu && (
            <div className="absolute top-full left-0 mt-2 rounded-2xl overflow-hidden z-50"
              style={{ background: '#151518', border: '1px solid #25252B', minWidth: 180, boxShadow: '0 20px 60px rgba(0,0,0,0.7)' }}>
              {Object.entries(CITIES).map(([key, label]) => (
                <button key={key}
                  onClick={(e) => { e.stopPropagation(); setCity(key); setShowCityMenu(false) }}
                  className="w-full text-left px-4 py-3 transition-all"
                  style={{
                    background: city === key ? 'rgba(124,58,237,0.15)' : 'transparent',
                    color: city === key ? '#fff' : 'rgba(255,255,255,0.55)',
                    fontSize: '0.8rem', fontWeight: city === key ? 700 : 500,
                  }}>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Bell */}
          <button style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>
          {/* Avatar */}
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #7C3AED, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900, color: '#fff' }}>R</div>
        </div>
      </div>

      {/* ── Greeting ── */}
      <div className="px-5 pt-3 pb-0 flex-shrink-0">
        <p suppressHydrationWarning style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', marginBottom: 2 }}>
          {getGreeting()}, Ricky 👋
        </p>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 12 }}>
          What are we doing{' '}
          <span style={{ background: 'linear-gradient(135deg, #EC4899, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            tonight?
          </span>
        </h1>

        {/* Quick chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-3">
          {CHIPS.map(chip => {
            const active = mood === chip.mood
            return (
              <button key={chip.id}
                onClick={() => setMood(active ? 'all' : chip.mood)}
                className="flex-shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all whitespace-nowrap"
                style={{
                  background: active ? 'linear-gradient(135deg, #7C3AED, #EC4899)' : '#151518',
                  border: `1px solid ${active ? 'transparent' : '#25252B'}`,
                  color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                  fontSize: '0.72rem', fontWeight: 700,
                  boxShadow: active ? '0 4px 14px rgba(124,58,237,0.35)' : 'none',
                }}>
                <span style={{ fontSize: '0.75rem' }}>{chip.emoji}</span>
                {chip.label}
              </button>
            )
          })}
        </div>

        {/* AI Search — secondary affordance */}
        <button
          className="w-full flex items-center gap-2.5 rounded-2xl px-4 mb-3 transition-all active:scale-[0.99]"
          style={{ height: 42, background: '#151518', border: '1px solid #25252B' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" strokeLinecap="round">
            <defs>
              <linearGradient id="search-g" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7C3AED"/><stop offset="100%" stopColor="#EC4899"/>
              </linearGradient>
            </defs>
            <path d="M12 2l1.09 3.26L16.5 4l-2.18 2.5L15.5 10l-3.5-2.24L8.5 10l1.18-3.5L7.5 4l3.41 1.26L12 2z" fill="url(#search-g)"/>
          </svg>
          <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>Ask Dashi anything…</span>
        </button>
      </div>

      {/* ── Tonight's Match ── */}
      <div className="flex-1 overflow-y-auto px-5 pb-2 no-scrollbar">
        <div className="flex items-center justify-between mb-3">
          <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Tonight&apos;s Match ✨</span>
          <button style={{ fontSize: '0.72rem', color: 'rgba(168,85,247,0.85)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>See all</button>
        </div>

        {/* Recommendation card */}
        <div
          className="rounded-[24px] overflow-hidden transition-all"
          style={{
            background: '#151518',
            border: '1px solid #25252B',
            boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
            transform: swiping === 'right'
              ? 'translateX(140%) rotate(16deg)'
              : swiping === 'left'
              ? 'translateX(-140%) rotate(-16deg)'
              : 'translateX(0) rotate(0deg)',
            transition: swiping ? 'transform 0.38s cubic-bezier(0.4,0,0.6,1)' : 'none',
          }}
        >
          {/* Photo */}
          <div style={{ position: 'relative', height: 200 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pairing.img}
              alt={pairing.names.join(' + ')}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            {/* Gradient overlay */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />

            {/* Venue name pills */}
            <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
              {pairing.names.map(name => (
                <span key={name}
                  style={{
                    background: 'rgba(21,21,24,0.85)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 100,
                    padding: '4px 10px',
                    fontSize: '0.6rem',
                    fontWeight: 800,
                    color: 'rgba(255,255,255,0.9)',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}>
                  {name}
                </span>
              ))}
            </div>

            {/* Heart */}
            <button
              onClick={handleLike}
              style={{
                position: 'absolute', top: 10, right: 12,
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(21,21,24,0.7)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>

            {/* Rating */}
            <div style={{ position: 'absolute', bottom: 10, left: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#FFD60A"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#FFD60A' }}>{pairing.rating}</span>
            </div>
          </div>

          {/* Card body */}
          <div style={{ padding: '16px 16px 0' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 4 }}>
              {pairing.names.join(' + ')}
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', marginBottom: 14 }}>
              {pairing.tagline}
            </p>

            {/* Detail rows */}
            <div className="flex flex-col gap-2.5 mb-4">
              {[
                { icon: '🗓', text: pairing.reservation },
                { icon: '🍸', text: pairing.followup },
                { icon: '💰', text: `Estimated cost: ${pairing.cost}` },
              ].map(row => (
                <div key={row.text} className="flex items-center gap-2.5">
                  <span style={{ fontSize: '0.8rem', width: 18, textAlign: 'center', flexShrink: 0 }}>{row.icon}</span>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{row.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div
            style={{ padding: '12px 16px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            {/* Pass / X */}
            <button
              onClick={handlePass}
              className="flex items-center justify-center rounded-full transition-all active:scale-90"
              style={{
                width: 52, height: 52,
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                cursor: 'pointer',
              }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            {/* Plan This Night */}
            <button
              onClick={() => router.push('/v2/build')}
              className="flex items-center gap-2 rounded-[12px] px-5 py-2.5 transition-all active:scale-95"
              style={{
                background: 'rgba(124,58,237,0.12)',
                border: '1px solid rgba(124,58,237,0.3)',
                color: '#c4b5fd',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}>
              Build My Night ✨
            </button>

            {/* Like / Heart */}
            <button
              onClick={handleLike}
              className="flex items-center justify-center rounded-full transition-all active:scale-90"
              style={{
                width: 52, height: 52,
                background: 'linear-gradient(135deg, #EC4899, #7C3AED)',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(236,72,153,0.45)',
              }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="0">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Secondary cards peek */}
        <div className="flex gap-3 mt-4 pb-2">
          {[
            { name: 'Rooftop at\nThe Line Hotel', rating: '4.7', img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=200&q=75', details: ['Sunset views', 'Great cocktails', 'No reservation needed', 'Estimated cost: $$'] },
            { name: 'Loro\nAsian Smokehouse', rating: '4.6', img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&q=75', details: ['Fun atmosphere', 'Group-friendly', 'Reservation: 7:00 PM', 'Estimated cost: $$$'] },
          ].map((card, i) => (
            <div key={i} className="flex-1 rounded-[18px] overflow-hidden" style={{ background: '#151518', border: '1px solid #25252B' }}>
              <div style={{ position: 'relative', height: 100 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={card.img} alt={card.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)' }} />
                {/* Rating */}
                <div style={{ position: 'absolute', top: 6, left: 8, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="#FFD60A"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#FFD60A' }}>{card.rating}</span>
                </div>
                {/* Heart */}
                <div style={{ position: 'absolute', top: 6, right: 8, width: 24, height: 24, borderRadius: '50%', background: 'rgba(236,72,153,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="#EC4899"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </div>
                {/* Name over image */}
                <div style={{ position: 'absolute', bottom: 6, left: 8, right: 8 }}>
                  <p style={{ fontSize: '0.65rem', fontWeight: 900, lineHeight: 1.2, whiteSpace: 'pre-line' }}>{card.name}</p>
                </div>
              </div>
              {/* Details */}
              <div style={{ padding: '8px 8px 10px' }}>
                {card.details.map((d, di) => (
                  <p key={di} style={{ fontSize: '0.52rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{d}</p>
                ))}
              </div>
              {/* Pass/X */}
              <div style={{ padding: '0 8px 8px', display: 'flex', justifyContent: 'center' }}>
                <button style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
