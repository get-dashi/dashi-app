'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

interface PlaceResult {
  google_place_id: string
  name: string
  address: string
  lat: number
  lng: number
  type: string
}

interface AddSpotModalProps {
  open: boolean
  onClose: () => void
  city?: string
  userId: string | null
  onAdded?: (venue: {
    google_place_id: string
    venue_name: string
    venue_type: string | null
    city: string
    address: string | null
    lat: number | null
    lng: number | null
    recommendation_count: number
    recommended_by_me: boolean
  }) => void
}

type ModalState = 'search' | 'confirm' | 'success' | 'error'

export function AddSpotModal({
  open,
  onClose,
  city = 'austin',
  userId,
  onAdded,
}: AddSpotModalProps) {
  const [query, setQuery] = useState('')
  const [places, setPlaces] = useState<PlaceResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [selected, setSelected] = useState<PlaceResult | null>(null)
  const [notes, setNotes] = useState('')
  const [state, setState] = useState<ModalState>('search')
  const [submitLoading, setSubmitLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [addedName, setAddedName] = useState('')

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setState('search')
      setQuery('')
      setPlaces([])
      setSelected(null)
      setNotes('')
      setErrorMessage('')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const searchPlaces = useCallback(
    async (q: string) => {
      if (q.length < 2) {
        setPlaces([])
        return
      }
      setSearchLoading(true)
      try {
        const res = await fetch(
          `/api/places-search?q=${encodeURIComponent(q)}&city=${encodeURIComponent(city)}`
        )
        const json = (await res.json()) as { places?: PlaceResult[]; error?: string }
        setPlaces(json.places ?? [])
      } catch {
        setPlaces([])
      } finally {
        setSearchLoading(false)
      }
    },
    [city]
  )

  const handleQueryChange = (value: string) => {
    setQuery(value)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => searchPlaces(value), 300)
  }

  const handleSelect = (place: PlaceResult) => {
    setSelected(place)
    setPlaces([])
    setQuery('')
    setState('confirm')
  }

  const handleSubmit = async () => {
    if (!selected || !userId) return
    setSubmitLoading(true)
    setErrorMessage('')

    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          google_place_id: selected.google_place_id,
          venue_name: selected.name,
          venue_type: selected.type,
          city,
          address: selected.address,
          lat: selected.lat,
          lng: selected.lng,
          notes: notes.trim() || undefined,
        }),
      })

      const json = (await res.json()) as { success?: boolean; error?: string }

      if (!res.ok) {
        setErrorMessage(json.error ?? 'Something went wrong.')
        setState('error')
        return
      }

      setAddedName(selected.name)
      setState('success')

      if (onAdded) {
        onAdded({
          google_place_id: selected.google_place_id,
          venue_name: selected.name,
          venue_type: selected.type,
          city,
          address: selected.address,
          lat: selected.lat,
          lng: selected.lng,
          recommendation_count: 1,
          recommended_by_me: true,
        })
      }
    } catch {
      setErrorMessage('Network error. Please try again.')
      setState('error')
    } finally {
      setSubmitLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="relative w-full max-w-md rounded-t-[28px] pb-safe overflow-hidden"
        style={{ background: '#161618', maxHeight: '90vh' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/15" />
        </div>

        <div className="px-5 pb-8 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 28px)' }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-5 mt-2">
            <h2 className="text-[1.1rem] font-black tracking-[-0.02em]">Add a Spot</h2>
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white/70 transition-colors text-[0.75rem] font-bold"
            >
              Close
            </button>
          </div>

          {/* Not signed in */}
          {!userId ? (
            <div className="text-center py-8">
              <p className="text-white/50 text-[0.85rem] mb-4">
                Sign in to add your recommendations
              </p>
              <Link
                href="/login"
                className="inline-block px-6 py-2.5 rounded-full text-[0.75rem] font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white"
              >
                Sign in
              </Link>
            </div>
          ) : state === 'success' ? (
            /* Success state */
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <p className="text-white font-bold text-[0.95rem] mb-1">Added!</p>
              <p className="text-white/50 text-[0.78rem]">
                {addedName} is now on Dashi.
              </p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2.5 rounded-full text-[0.75rem] font-bold bg-white/8 text-white/70 border border-white/10"
              >
                Done
              </button>
            </div>
          ) : state === 'error' ? (
            /* Error state */
            <div className="text-center py-8">
              <p className="text-red-400 text-[0.85rem] mb-4">{errorMessage}</p>
              <button
                onClick={() => { setState('confirm'); setErrorMessage('') }}
                className="px-6 py-2.5 rounded-full text-[0.75rem] font-bold bg-white/8 text-white/70 border border-white/10"
              >
                Try again
              </button>
            </div>
          ) : state === 'confirm' && selected ? (
            /* Confirm selected place */
            <div>
              <button
                onClick={() => { setState('search'); setSelected(null) }}
                className="flex items-center gap-1.5 text-white/40 text-[0.7rem] mb-4 hover:text-white/60 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                Back
              </button>

              {/* Place card */}
              <div className="rounded-[16px] p-4 mb-4" style={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-[0.9rem] font-extrabold mb-0.5">{selected.name}</p>
                <p className="text-[0.65rem] text-white/40 mb-1">{selected.type}</p>
                <p className="text-[0.6rem] text-white/30 leading-relaxed">{selected.address}</p>
              </div>

              {/* Notes */}
              <label className="block mb-1.5">
                <span className="text-[0.7rem] text-white/50 font-medium">Why do you love it? <span className="text-white/25">(optional)</span></span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value.slice(0, 200))}
                placeholder="Amazing happy hour, best tacos in town..."
                rows={3}
                className="w-full rounded-[12px] px-4 py-3 text-[0.78rem] text-white placeholder-white/25 resize-none outline-none border border-white/8 focus:border-purple-500/50 transition-colors"
                style={{ background: '#1c1c1e' }}
              />
              <div className="flex justify-end mb-5">
                <span className="text-[0.6rem] text-white/25">{notes.length}/200</span>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitLoading}
                className="w-full py-3.5 rounded-full font-bold text-[0.85rem] text-white transition-all disabled:opacity-60"
                style={{ background: 'linear-gradient(to right, #a855f7, #ec4899)' }}
              >
                {submitLoading ? 'Adding...' : 'Add to Dashi'}
              </button>
            </div>
          ) : (
            /* Search state */
            <div>
              <p className="text-[0.72rem] text-white/40 mb-4 leading-relaxed">
                Search for a bar, restaurant, or venue to add it to the community list.
              </p>

              {/* Search input */}
              <div className="relative mb-2">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  placeholder="Search venues..."
                  className="w-full pl-10 pr-4 py-3 rounded-[14px] text-[0.82rem] text-white placeholder-white/25 outline-none border border-white/8 focus:border-purple-500/50 transition-colors"
                  style={{ background: '#1c1c1e' }}
                />
                {searchLoading && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    <div className="w-3.5 h-3.5 border-2 border-purple-500/40 border-t-purple-500 rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Results dropdown */}
              {places.length > 0 && (
                <div className="rounded-[16px] overflow-hidden border border-white/6" style={{ background: '#1c1c1e' }}>
                  {places.map((place, i) => (
                    <button
                      key={place.google_place_id}
                      onClick={() => handleSelect(place)}
                      className={`w-full text-left px-4 py-3.5 hover:bg-white/4 transition-colors ${
                        i > 0 ? 'border-t border-white/5' : ''
                      }`}
                    >
                      <p className="text-[0.82rem] font-bold text-white mb-0.5">{place.name}</p>
                      <p className="text-[0.6rem] text-white/40 truncate">{place.address}</p>
                    </button>
                  ))}
                </div>
              )}

              {query.length >= 2 && !searchLoading && places.length === 0 && (
                <p className="text-center text-white/30 text-[0.72rem] py-4">
                  No venues found for &ldquo;{query}&rdquo;
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
