'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ALL_FEATURED_VENUES } from '@/lib/venues'
import { V2CardStack } from '@/components/v2/CardStack'
import type { Venue } from '@/lib/types'

type Pairing = typeof PAIRINGS[number]

// Quick filter chips — all occasions, one axis
const CHIPS = [
  { id: 'date',      emoji: '❤️', label: 'Date night',  mood: 'date' },
  { id: 'group',     emoji: '👥', label: 'Group night', mood: 'dance' },
  { id: 'happy',     emoji: '🥂', label: 'Happy hour',  mood: 'happy' },
  { id: 'celebrate', emoji: '🎉', label: 'Celebration', mood: 'celebrate' },
  { id: 'late',      emoji: '🌙', label: 'Late night',  mood: 'late' },
  { id: 'vibe',      emoji: '✨', label: 'Good vibes',  mood: 'vibe' },
]

const CITIES_DATA = [
  {
    key: 'austin',
    name: 'Austin, TX',
    img: 'https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=600&q=80',
    fallback: 'linear-gradient(135deg,#7C3AED 0%,#EC4899 100%)',
    venues: 120, michelin: 14,
  },
  {
    key: 'monterrey',
    name: 'Monterrey, MX',
    img: 'https://images.unsplash.com/photo-1585672306704-a8abede78d65?w=600&q=80',
    fallback: 'linear-gradient(135deg,#F59E0B 0%,#EF4444 100%)',
    venues: 80, michelin: 4,
  },
  {
    key: 'honolulu',
    name: 'Honolulu, HI',
    img: 'https://images.unsplash.com/photo-1598135753163-6167c1a1ad65?w=600&q=80',
    fallback: 'linear-gradient(135deg,#0EA5E9 0%,#10B981 100%)',
    venues: 95, michelin: 8,
  },
  {
    key: 'kauai',
    name: "Kaua'i, HI",
    img: 'https://images.unsplash.com/photo-1505852679233-d9fd70aff56d?w=600&q=80',
    fallback: 'linear-gradient(135deg,#059669 0%,#0EA5E9 100%)',
    venues: 42, michelin: 2,
  },
  {
    key: 'medellin',
    name: 'Medellín',
    img: 'https://images.unsplash.com/photo-1578307049-f5c042614c1c?w=600&q=80',
    fallback: 'linear-gradient(135deg,#8B5CF6 0%,#EC4899 100%)',
    venues: 68, michelin: 3,
  },
]
const CITIES: Record<string, string> = Object.fromEntries(CITIES_DATA.map(c => [c.key, c.name]))

// Curated pairings — "venue + venue" recommendation combos
const PAIRINGS = [
  {
    id: 'uchi-dmc',
    names: ['Uchi', 'Devil May Care'],
    placeIds: ['ChIJz2Whyx61RIYR7mCeZje-QWw', 'ChIJW02GaiG1RIYR8ZZKBuZOWQg'],
    liveNote: null as string | null,
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
    placeIds: ['ChIJlWBjs7-1RIYRsJt0C41E558', 'ChIJ279pHrG1RIYRicks_tZPpjs'],
    liveNote: 'Band at 9 PM' as string | null,
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
    placeIds: ['ChIJAQBE-7a1RIYRcZNYsxWYIUg'],
    liveNote: null as string | null,
    tagline: 'Best masa in town, then the best block.',
    img: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80',
    rating: '4.8',
    reservation: 'No reservation needed',
    followup: 'Bar crawl afterward',
    cost: '$$',
    tags: ['Mexican', 'Bar Crawl'],
  },
]

type LiveStatus = {
  openNow: boolean
  closingAt: string | null
  minutesUntilClose: number | null
  closingSoon: boolean
  lastCall: boolean
} | null

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
  const [matchedPairing, setMatchedPairing] = useState<Pairing | null>(null)
  const [liveStatus, setLiveStatus] = useState<LiveStatus>(null)
  const [liveLoading, setLiveLoading] = useState(false)
  const initialized = useRef(false)

  // All venues filtered by city + mood for the swipe deck
  const MOOD_TAGS: Record<string, string[]> = {
    date: ['romantic','date','intimate','wine bar','upscale','cocktail'],
    dance: ['club','dance','rooftop','group','nightlife'],
    happy: ['happy hour','bar','cocktail','casual'],
    celebrate: ['celebration','upscale','cocktail','rooftop'],
    late: ['late night','bar','club'],
    vibe: ['craft cocktails','trendy','rooftop','vibes'],
  }
  const filteredVenues = ALL_FEATURED_VENUES.filter(v => {
    const cityMatch = !v.city || v.city === city
    if (!cityMatch) return false
    if (mood === 'all') return true
    const tags = (MOOD_TAGS[mood] ?? []).map(t => t.toLowerCase())
    return v.tags?.some(t => tags.some(m => t.toLowerCase().includes(m)))
  })

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    setSwipedIds(loadSwiped('austin'))
  }, [])

  const pairing = PAIRINGS[pairingIdx % PAIRINGS.length]

  // Fetch live status whenever the visible pairing changes
  useEffect(() => {
    const ids = pairing.placeIds?.join(',')
    if (!ids) return
    setLiveStatus(null)
    setLiveLoading(true)
    fetch(`/api/live-status?ids=${ids}`)
      .then(r => r.json())
      .then((data: { statuses?: { id: string; status: LiveStatus }[] }) => {
        const statuses = (data.statuses ?? []).map(s => s.status).filter(Boolean) as NonNullable<LiveStatus>[]
        const open = statuses.find(s => s.openNow) ?? statuses[0] ?? null
        setLiveStatus(open)
      })
      .catch(() => setLiveStatus(null))
      .finally(() => setLiveLoading(false))
  }, [pairing.id])

  const handleLike = useCallback(() => {
    const liked = pairing
    setSwiping('right')
    setTimeout(() => {
      setSwiping(null)
      setPairingIdx(i => i + 1)
      setMatchedPairing(liked)
    }, 380)
  }, [pairing])

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
      style={{ background: '#09090B', position: 'relative' }}
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
          {/* Photo city picker modal */}
          {showCityMenu && (
            <div
              style={{
                position: 'fixed', inset: 0, zIndex: 200,
                background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)',
                display: 'flex', flexDirection: 'column',
              }}
              onClick={() => setShowCityMenu(false)}
            >
              <div
                onClick={e => e.stopPropagation()}
                style={{
                  margin: 'auto 0 0',
                  background: '#111114',
                  borderRadius: '28px 28px 0 0',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  padding: '0 0 40px',
                  maxHeight: '82vh',
                  overflowY: 'auto',
                }}
              >
                {/* Handle */}
                <div style={{ width: 36, height: 4, borderRadius: 2, background: '#333', margin: '16px auto 0' }} />

                {/* Title */}
                <div style={{ padding: '18px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 900, letterSpacing: '-0.02em' }}>Explore Cities</span>
                  <button onClick={() => setShowCityMenu(false)}
                    style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                    ×
                  </button>
                </div>

                {/* City grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 16px' }}>
                  {CITIES_DATA.map(c => {
                    const active = city === c.key
                    return (
                      <button
                        key={c.key}
                        onClick={() => { setCity(c.key); setShowCityMenu(false) }}
                        style={{
                          position: 'relative', height: 130, borderRadius: 18,
                          overflow: 'hidden', border: 'none', cursor: 'pointer', padding: 0,
                          outline: active ? '2.5px solid transparent' : 'none',
                          boxShadow: active ? '0 0 0 2.5px #7C3AED, 0 0 0 4px rgba(124,58,237,0.25)' : 'none',
                        }}
                      >
                        {/* City photo */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={c.img}
                          alt=""
                          onError={(e) => {
                            const el = e.target as HTMLImageElement
                            el.style.display = 'none'
                            if (el.parentElement) el.parentElement.style.background = c.fallback
                          }}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                        {/* Gradient overlay */}
                        <div style={{
                          position: 'absolute', inset: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.2) 55%, transparent 100%)',
                        }} />
                        {/* LIVE badge */}
                        <div style={{
                          position: 'absolute', top: 8, right: 8,
                          background: active ? 'linear-gradient(135deg, #7C3AED, #EC4899)' : 'rgba(34,197,94,0.85)',
                          backdropFilter: 'blur(8px)',
                          borderRadius: 100, padding: '2px 7px',
                          fontSize: '0.48rem', fontWeight: 800,
                          letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fff',
                        }}>
                          {active ? 'Selected' : 'Live'}
                        </div>
                        {/* City name + stats */}
                        <div style={{ position: 'absolute', bottom: 10, left: 10, textAlign: 'left' }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#fff', lineHeight: 1.2 }}>{c.name}</div>
                          <div style={{ fontSize: '0.52rem', color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>
                            {c.venues} spots · {c.michelin} Michelin
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
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
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', marginBottom: 10 }}>
              {pairing.tagline}
            </p>

            {/* Live layer */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12, minHeight: 24 }}>
              {liveLoading && (
                <div style={{ height: 22, width: 120, borderRadius: 100, background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />
              )}
              {!liveLoading && liveStatus?.openNow && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: liveStatus.lastCall ? 'rgba(239,68,68,0.12)' : liveStatus.closingSoon ? 'rgba(245,158,11,0.12)' : 'rgba(34,197,94,0.1)',
                  border: `1px solid ${liveStatus.lastCall ? 'rgba(239,68,68,0.35)' : liveStatus.closingSoon ? 'rgba(245,158,11,0.35)' : 'rgba(34,197,94,0.3)'}`,
                  borderRadius: 100, padding: '3px 9px',
                }}>
                  <div className="animate-pulse" style={{
                    width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                    background: liveStatus.lastCall ? '#ef4444' : liveStatus.closingSoon ? '#f59e0b' : '#22c55e',
                  }} />
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.07em',
                    color: liveStatus.lastCall ? '#ef4444' : liveStatus.closingSoon ? '#f59e0b' : '#22c55e',
                  }}>
                    {liveStatus.lastCall
                      ? 'LAST CALL'
                      : liveStatus.closingSoon
                      ? `CLOSING SOON · ${liveStatus.minutesUntilClose} MIN`
                      : liveStatus.closingAt
                      ? `OPEN · CLOSES ${liveStatus.closingAt}`
                      : 'OPEN NOW'}
                  </span>
                </div>
              )}
              {!liveLoading && pairing.liveNote && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'rgba(168,85,247,0.1)',
                  border: '1px solid rgba(168,85,247,0.3)',
                  borderRadius: 100, padding: '3px 9px',
                }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.07em', color: '#c4b5fd' }}>
                    🎵 {pairing.liveNote}
                  </span>
                </div>
              )}
            </div>

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
              onClick={() => router.push('/build')}
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

        {/* ── Discover — full venue swipe deck ── */}
        <div style={{ marginTop: 20, marginBottom: 4 }}>
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>
              Discover {CITIES_DATA.find(c => c.key === city)?.name ?? 'Austin'} 📍
            </span>
            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
              Swipe to explore
            </span>
          </div>
          {/* Relative container — V2CardStack fills this */}
          <div style={{ position: 'relative', height: 500, borderRadius: 28, overflow: 'hidden' }}>
            <V2CardStack
              venues={
                // Always show the full Austin deck — city-specific venues added as data grows
                filteredVenues.length > 0
                  ? filteredVenues
                  : ALL_FEATURED_VENUES
              }
              onLike={(v) => console.log('liked', v.name)}
              onPass={(v) => console.log('passed', v.name)}
              onEmpty={() => {}}
            />
          </div>
        </div>
      </div>
      {/* ── Match Sheet ── */}
      {matchedPairing && (
        <div
          style={{
            position: 'absolute', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.72)',
            backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'flex-end',
          }}
          onClick={() => setMatchedPairing(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              background: '#111114',
              borderTop: '1px solid #25252B',
              borderRadius: '28px 28px 0 0',
              padding: '20px 20px 36px',
            }}
          >
            {/* Drag handle */}
            <div style={{ width: 36, height: 4, borderRadius: 2, background: '#333', margin: '0 auto 22px' }} />

            {/* Label */}
            <div style={{
              fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.2em',
              textTransform: 'uppercase', marginBottom: 4,
              background: 'linear-gradient(135deg, #EC4899, #7C3AED)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>You matched ✨</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 4 }}>
              {matchedPairing.names.join(' + ')}
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>
              {matchedPairing.tagline}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

              {/* Just Me */}
              <button
                onClick={() => {
                  try { localStorage.setItem('dashi_pending_plan', JSON.stringify({ type: 'individual', pairing: matchedPairing })) } catch {}
                  setMatchedPairing(null)
                  router.push('/plans')
                }}
                className="w-full flex items-center gap-4 rounded-[18px] px-5 transition-all active:scale-[0.98]"
                style={{ height: 64, background: '#1A1A1E', border: '1px solid #2A2A32', cursor: 'pointer', textAlign: 'left' }}
              >
                <span style={{ fontSize: '1.4rem' }}>👤</span>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>Just Me</div>
                  <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.38)', marginTop: 1 }}>Create a personal itinerary</div>
                </div>
                <svg style={{ marginLeft: 'auto' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>

              {/* With a Group */}
              <button
                onClick={() => {
                  try { localStorage.setItem('dashi_pending_plan', JSON.stringify({ type: 'group', pairing: matchedPairing })) } catch {}
                  setMatchedPairing(null)
                  router.push('/groups')
                }}
                className="w-full flex items-center gap-4 rounded-[18px] px-5 transition-all active:scale-[0.98]"
                style={{
                  height: 64, cursor: 'pointer', textAlign: 'left',
                  background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(236,72,153,0.1))',
                  border: '1px solid rgba(124,58,237,0.35)',
                }}
              >
                <span style={{ fontSize: '1.4rem' }}>👥</span>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>With a Group</div>
                  <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.38)', marginTop: 1 }}>Pick your crew and share the plan</div>
                </div>
                <svg style={{ marginLeft: 'auto' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(168,85,247,0.6)" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>

            </div>
          </div>
        </div>
      )}

    </div>
  )
}
