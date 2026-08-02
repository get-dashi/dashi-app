'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Header } from '@/components/layout/Header'
import { MoodFilter } from '@/components/explore/MoodFilter'
import { CardStack } from '@/components/explore/CardStack'
import { MatchToast } from '@/components/explore/MatchToast'
import { Modal } from '@/components/ui/Modal'
import { BookButton } from '@/components/booking/BookButton'
import { ALL_FEATURED_VENUES, filterVenues } from '@/lib/venues'
import { useSaves } from '@/contexts/SavesContext'
import { useVisits } from '@/contexts/VisitsContext'
import { useRankings } from '@/contexts/RankingsContext'
import { useToast } from '@/contexts/ToastContext'
import type { Venue } from '@/lib/types'

function getSwipedKey(city: string) { return `dashi_swiped_${city}` }
function getIndexKey(city: string)  { return `dashi_idx_${city}` }

function loadSwiped(city: string): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(getSwipedKey(city)) ?? '[]') as string[]) }
  catch { return new Set() }
}
function saveSwiped(city: string, ids: Set<string>) {
  try { localStorage.setItem(getSwipedKey(city), JSON.stringify([...ids])) } catch { /* ignore */ }
}
function loadIndex(city: string): number {
  try { return parseInt(localStorage.getItem(getIndexKey(city)) ?? '0', 10) || 0 }
  catch { return 0 }
}
function saveIndex(city: string, idx: number) {
  try { localStorage.setItem(getIndexKey(city), String(idx)) } catch { /* ignore */ }
}

export default function ExplorePage() {
  const [mood, setMood] = useState('all')
  const [city, setCity] = useState('austin')
  const [cardIndex, setCardIndex] = useState(0)
  const [swipedIds, setSwipedIds] = useState<Set<string>>(new Set())
  const [matchVenue, setMatchVenue] = useState<Venue | null>(null)
  const [savedDrawerOpen, setSavedDrawerOpen] = useState(false)
  const [venues, setVenues] = useState<Venue[]>(() =>
    ALL_FEATURED_VENUES.filter(v => v.city === 'austin' || !v.city)
  )
  const fetchedCities = useRef<Set<string>>(new Set())
  const initialized = useRef(false)

  const { saveVenue, savedVenues, unsaveVenue, clearAllSaves } = useSaves()
  const { isVisited, markVisited, unmarkVisited } = useVisits()
  const { addToRanking, getRankings } = useRankings()
  const { showToast } = useToast()
  const [rankItVenue, setRankItVenue] = useState<Venue | null>(null)

  // Restore swiped IDs and index from localStorage on first mount
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    const swiped = loadSwiped('austin')
    const idx = loadIndex('austin')
    setSwipedIds(swiped)
    setCardIndex(idx)
  }, [])

  // Background fetch from Google Places — never rebuilds stack, only appends
  useEffect(() => {
    if (fetchedCities.current.has(city)) return
    fetchedCities.current.add(city)

    const featured = ALL_FEATURED_VENUES.filter(v => city === 'austin' ? (v.city === 'austin' || !v.city) : v.city === city)
    setVenues(featured)

    fetch(`/api/venues?city=${city}`)  
      .then(r => r.json())
      .then(({ venues: googleVenues }: { venues: Venue[] }) => {
        if (!Array.isArray(googleVenues)) return
        setVenues(prev => {
          const existingNames = new Set(prev.map(v => v.name.toLowerCase()))
          const newVenues = googleVenues.filter(v => !existingNames.has(v.name.toLowerCase()))
          return [...prev, ...newVenues]
        })
      })
      .catch(() => { /* Google Places unavailable — featured picks still show */ })
  }, [city])

  // Filter out already-swiped venues, then apply mood filter
  const unswiped = venues.filter(v => !swipedIds.has(v.id))
  const filtered = filterVenues(unswiped, mood)

  const recordSwipe = useCallback((venue: Venue, currentCity: string) => {
    setSwipedIds(prev => {
      const next = new Set(prev)
      next.add(venue.id)
      saveSwiped(currentCity, next)
      return next
    })
    setCardIndex(i => {
      const next = i + 1
      saveIndex(currentCity, next)
      return next
    })
  }, [])

  const handleLike = useCallback((venue: Venue) => {
    saveVenue(venue)
    setMatchVenue(venue)
    recordSwipe(venue, city)
  }, [saveVenue, recordSwipe, city])

  const handlePass = useCallback((venue: Venue) => {
    showToast(`Passed on ${venue.name}`, 'info', 1500)
    recordSwipe(venue, city)
  }, [showToast, recordSwipe, city])

  const handleEmpty = useCallback(() => {
    // Seen everything — reset swiped history for this city so deck refreshes
    setSwipedIds(new Set())
    saveSwiped(city, new Set())
    saveIndex(city, 0)
    setCardIndex(0)
    setMood('all')
  }, [city])

  const handleMoodChange = (newMood: string) => {
    setMood(newMood)
  }

  // Action buttons
  const handleActionLike = () => {
    const venue = filtered[cardIndex]
    if (!venue) return
    handleLike(venue)
  }

  const handleActionPass = () => {
    const venue = filtered[cardIndex]
    if (!venue) return
    handlePass(venue)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <Header
        onSavesClick={() => setSavedDrawerOpen(true)}
        showCitySelector
        city={city}
        onCityChange={(c) => {
          setCity(c)
          setMood('all')
          // Restore per-city swiped state
          const swiped = loadSwiped(c)
          const idx = loadIndex(c)
          setSwipedIds(swiped)
          setCardIndex(idx)
          // Load featured for new city immediately; background fetch will merge Google Places
          const featured = ALL_FEATURED_VENUES.filter(v => c === 'austin' ? (v.city === 'austin' || !v.city) : v.city === c)
          setVenues(featured)
        }}
      />

      {/* Mood filters */}
      <MoodFilter active={mood} onChange={handleMoodChange} />

      {/* Card area */}
      <div className="flex-1 relative overflow-hidden px-5">
        <CardStack
          venues={filtered}
          currentIndex={cardIndex}
          onLike={handleLike}
          onPass={handlePass}
          onEmpty={handleEmpty}
        />
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-5 px-5 py-4 flex-shrink-0">
        {/* Pass */}
        <button
          onClick={handleActionPass}
          className="w-[60px] h-[60px] rounded-full flex items-center justify-center bg-red-500/12 border border-red-500/30 transition-all active:scale-90"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff375f" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Info */}
        <button className="w-[48px] h-[48px] rounded-full flex items-center justify-center bg-white/7 border border-white/12">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </button>

        {/* Like */}
        <button
          onClick={handleActionLike}
          className="w-[68px] h-[68px] rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/35 transition-all active:scale-90"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>

      {/* Match Toast */}
      <MatchToast venue={matchVenue} onContinue={() => setMatchVenue(null)} />

      {/* Rank It Sheet */}
      {rankItVenue && (
        <ExploreRankItSheet
          venue={rankItVenue}
          city={city}
          onClose={() => setRankItVenue(null)}
          getRankings={getRankings}
          addToRanking={addToRanking}
          showToast={showToast}
        />
      )}

      {/* Saved Drawer */}
      <Modal open={savedDrawerOpen} onClose={() => setSavedDrawerOpen(false)} title={`Saved (${savedVenues.length})`}>
        {savedVenues.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/30 text-sm mb-6">No saved venues yet. Start swiping!</p>
            <button
              onClick={() => {
                setSwipedIds(new Set())
                saveSwiped(city, new Set())
                saveIndex(city, 0)
                setCardIndex(0)
                setSavedDrawerOpen(false)
                showToast('Deck reset — all venues back', 'success')
              }}
              className="text-xs font-bold text-white/30 underline hover:text-white/60 transition-colors"
            >
              Reset deck
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 max-h-[60vh] overflow-y-auto no-scrollbar">
            {savedVenues.map(venue => {
              const visited = isVisited(venue.id)
              return (
                <div key={venue.id} className="flex items-center gap-3.5 bg-[#1c1c1e] rounded-2xl p-3.5">
                  <img
                    src={venue.img}
                    alt={venue.name}
                    className="rounded-xl object-cover flex-shrink-0"
                    style={{ width: 52, height: 52 }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{venue.name}</p>
                    <p className="text-xs text-white/40">{venue.type} · {venue.dist}</p>
                    {venue.happyHour && (
                      <p className="text-xs font-bold text-purple-400 mt-0.5">{venue.happyHour}</p>
                    )}
                    {venue.bookingPlatform && (
                      <div className="mt-1.5">
                        <BookButton venue={venue} size="sm" />
                      </div>
                    )}
                  </div>
                  {/* Visited checkmark */}
                  <button
                    onClick={() => {
                      if (visited) {
                        unmarkVisited(venue.id)
                        showToast(`Removed from visited`, 'info', 2000)
                      } else {
                        markVisited(venue)
                        showToast(`Marked as visited! Rank it?`, 'success', 4000)
                        setRankItVenue(venue)
                      }
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0"
                    style={{
                      background: visited ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${visited ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.1)'}`,
                    }}
                    aria-label={visited ? `Unmark ${venue.name} as visited` : `Mark ${venue.name} as visited`}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke={visited ? '#22c55e' : 'rgba(255,255,255,0.3)'}
                      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </button>
                  {/* Remove button */}
                  <button
                    onClick={() => unsaveVenue(venue.id)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
                    aria-label={`Remove ${venue.name}`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                    </svg>
                  </button>
                </div>
              )
            })}

            {/* Bottom actions */}
            <div className="flex items-center justify-between pt-2 pb-1 border-t border-white/8 mt-1">
              <button
                onClick={() => {
                  setSwipedIds(new Set())
                  saveSwiped(city, new Set())
                  saveIndex(city, 0)
                  setCardIndex(0)
                  setSavedDrawerOpen(false)
                  showToast('Deck reset — all venues back', 'success')
                }}
                className="text-[0.7rem] font-bold text-white/35 hover:text-white/60 transition-colors"
              >
                Reset deck
              </button>
              <button
                onClick={() => {
                  clearAllSaves()
                }}
                className="text-[0.7rem] font-bold text-red-400/60 hover:text-red-400 transition-colors"
              >
                Clear all
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

// ─── Explore-page Rank It Sheet ─────────────────────────────────────────────

function ExploreRankItSheet({
  venue,
  city,
  onClose,
  getRankings,
  addToRanking,
  showToast,
}: {
  venue: Venue
  city: string
  onClose: () => void
  getRankings: (city: string) => { venue: Venue; position: number; city: string }[]
  addToRanking: (venue: Venue, city: string, position: number) => void
  showToast: (msg: string, type?: 'success' | 'error' | 'info', duration?: number) => void
}) {
  const currentRankings = getRankings(city)

  const handleSlot = (position: number) => {
    addToRanking(venue, city, position)
    showToast(`${venue.name} ranked #${position}!`, 'success')
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[390px] bg-[#161618] rounded-t-[28px] p-5 pb-8"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />
        <p className="text-[0.88rem] font-black mb-1">Rank &ldquo;{venue.name}&rdquo;</p>
        <p className="text-[0.65rem] text-white/40 mb-4">
          Choose a position in your Top 10 for {city === 'monterrey' ? 'Monterrey' : 'Austin'}
        </p>
        <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto no-scrollbar">
          {Array.from({ length: 10 }, (_, i) => i + 1).map(pos => {
            const occupant = currentRankings.find(r => r.position === pos)
            return (
              <button
                key={pos}
                onClick={() => handleSlot(pos)}
                className="flex items-center gap-3 px-4 py-3 rounded-[14px] bg-white/5 border border-white/8 hover:bg-white/10 transition-all active:scale-98 text-left"
              >
                <span
                  className="w-7 text-center font-black text-[0.9rem] flex-shrink-0"
                  style={{
                    color: pos === 1 ? '#ffd60a' : pos === 2 ? 'rgba(255,255,255,0.7)' : pos === 3 ? '#f97316' : 'rgba(255,255,255,0.3)',
                  }}
                >
                  {pos}
                </span>
                {occupant ? (
                  <span className="text-[0.75rem] text-white/60 truncate">{occupant.venue.name}</span>
                ) : (
                  <span className="text-[0.75rem] text-white/25">Empty slot</span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
