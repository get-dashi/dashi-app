'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ALL_FEATURED_VENUES } from '@/lib/venues'
import { useSaves } from '@/contexts/SavesContext'
import type { Venue } from '@/lib/types'

const LIVE_CITIES = new Set(['austin', 'monterrey', 'honolulu', 'kauai', 'medellin'])

const CITY_OPTIONS = [
  { value: 'austin',    label: 'Austin, TX' },
  { value: 'monterrey', label: 'Monterrey, MX' },
  { value: 'honolulu',  label: 'Honolulu, HI' },
  { value: 'kauai',     label: "Kaua'i, HI" },
  { value: 'medellin',  label: 'Medellín, COL' },
]

const CATEGORY_FILTERS = [
  { id: 'all',        label: 'All' },
  { id: 'restaurant', label: 'Restaurants' },
  { id: 'bar',        label: 'Bars' },
  { id: 'sports',     label: 'Sports Bars' },
  { id: 'night_club', label: 'Nightlife' },
  { id: 'cafe',       label: 'Cafes' },
]

function VenueCard({ venue }: { venue: Venue }) {
  const { isSaved, saveVenue, unsaveVenue } = useSaves()
  const toggleSave = (v: Venue) => isSaved(v.id) ? unsaveVenue(v.id) : saveVenue(v)
  const saved = isSaved(venue.id)

  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl border border-white/8 bg-[#1c1c1e] active:scale-[0.98] transition-transform">
      <img
        src={venue.img}
        alt={venue.name}
        className="w-[58px] h-[58px] rounded-xl object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-[0.88rem] font-extrabold leading-tight truncate">{venue.name}</p>
        <p className="text-[0.65rem] text-white/40 mb-1 truncate">{venue.type}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[0.6rem] font-bold text-yellow-400">★ {venue.rating}</span>
          <span className="text-white/20 text-[0.5rem]">•</span>
          <span className="text-[0.6rem] text-white/35">{'$'.repeat(venue.priceLevel)}</span>
          {venue.tags.slice(0, 2).map(t => (
            <span key={t} className="text-[0.5rem] font-semibold px-1.5 py-0.5 rounded-full bg-white/6 text-white/40">
              {t}
            </span>
          ))}
        </div>
      </div>
      <button
        onClick={() => toggleSave(venue)}
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
        style={{
          background: saved
            ? 'linear-gradient(to right, #a855f7, #ec4899)'
            : 'rgba(255,255,255,0.07)',
          border: saved ? 'none' : '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill={saved ? 'white' : 'none'}
          stroke={saved ? 'white' : 'rgba(255,255,255,0.5)'}
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
      </button>
    </div>
  )
}

export default function SearchPage() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [city, setCity] = useState('austin')
  const [category, setCategory] = useState('all')

  // Auto-focus the search input on mount
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 120)
    return () => clearTimeout(t)
  }, [])

  const cityVenues = useMemo(() =>
    ALL_FEATURED_VENUES.filter(v =>
      city === 'austin' ? (!v.city || v.city === 'austin') : v.city === city
    ),
    [city]
  )

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return cityVenues
      .filter(v => category === 'all' || v.category === category)
      .filter(v => {
        if (!q) return true
        return (
          v.name.toLowerCase().includes(q) ||
          v.type.toLowerCase().includes(q) ||
          v.tags.some(t => t.toLowerCase().includes(q))
        )
      })
      .sort((a, b) => (b.hot ?? 5) - (a.hot ?? 5))
  }, [cityVenues, query, category])

  const showEmpty = query.trim().length > 0 && results.length === 0
  const showDefault = !query.trim()

  return (
    <div className="flex flex-col h-full bg-[#0d0d0f]">
      {/* Header */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 16px)' }}>
        <h1 className="text-[1.15rem] font-black tracking-[-0.03em] mb-3">Search</h1>

        {/* Search input */}
        <div className="relative mb-3">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="rgba(255,255,255,0.3)" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Bars, restaurants, vibes..."
            className="w-full bg-white/7 border border-white/10 rounded-2xl pl-10 pr-10 py-3 text-[0.88rem] text-white placeholder:text-white/25 outline-none focus:border-purple-500/50 transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>

        {/* City + Category row */}
        <div className="flex gap-2 items-center">
          <select
            value={city}
            onChange={e => setCity(e.target.value)}
            className="bg-white/8 border border-white/12 text-white text-[0.72rem] font-semibold rounded-xl px-3 py-2 pr-7 appearance-none cursor-pointer outline-none focus:border-purple-500/60 transition-colors flex-shrink-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 8px center',
            }}
          >
            {CITY_OPTIONS.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>

          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {CATEGORY_FILTERS.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className="flex-shrink-0 rounded-full px-3 py-1.5 text-[0.58rem] font-bold whitespace-nowrap transition-all"
                style={{
                  background: category === cat.id
                    ? 'linear-gradient(to right, #a855f7, #ec4899)'
                    : 'rgba(255,255,255,0.07)',
                  color: category === cat.id ? 'white' : 'rgba(255,255,255,0.4)',
                  border: category === cat.id ? 'none' : '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 no-scrollbar">
        {/* Coming Soon state for non-live cities */}
        {!LIVE_CITIES.has(city) ? (
          <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
            <div className="text-4xl mb-4">🚧</div>
            <h3 className="text-white font-bold text-xl mb-2">Coming Soon</h3>
            <p className="text-white/50 text-sm">We&apos;re building out this city. Check back soon!</p>
            <button
              onClick={() => setCity('austin')}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl text-sm"
            >
              Back to Austin
            </button>
          </div>
        ) : (
          <>
        {/* Default state — no query */}
        {showDefault && (
          <div>
            <p className="text-[0.65rem] font-bold text-white/25 uppercase tracking-widest mb-3">
              Top picks — {CITY_OPTIONS.find(c => c.value === city)?.label}
            </p>
            <div className="flex flex-col gap-2">
              {results.slice(0, 20).map(v => <VenueCard key={v.id} venue={v} />)}
            </div>
          </div>
        )}

        {/* Search results */}
        {!showDefault && !showEmpty && (
          <div>
            <p className="text-[0.65rem] font-bold text-white/25 uppercase tracking-widest mb-3">
              {results.length} result{results.length !== 1 ? 's' : ''}
            </p>
            <div className="flex flex-col gap-2">
              {results.map(v => <VenueCard key={v.id} venue={v} />)}
            </div>
          </div>
        )}

        {/* Empty state */}
        {showEmpty && (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <div className="text-3xl opacity-30">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <p className="text-white/30 text-[0.85rem] font-semibold">No results for &ldquo;{query}&rdquo;</p>
            <p className="text-white/20 text-[0.72rem]">Try a different name, type, or city</p>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  )
}
