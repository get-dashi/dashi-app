'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Venue } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './AuthContext'

const LS_KEY = 'dashi_saved_venues'

function readLS(): Venue[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]') } catch { return [] }
}

function writeLS(venues: Venue[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(venues)) } catch {}
}

interface SavesContextType {
  savedVenues: Venue[]
  isSaved: (venueId: string) => boolean
  saveVenue: (venue: Venue) => void
  unsaveVenue: (venueId: string) => void
  clearAllSaves: () => void
  savesCount: number
}

const SavesContext = createContext<SavesContextType>({
  savedVenues: [],
  isSaved: () => false,
  saveVenue: () => {},
  unsaveVenue: () => {},
  clearAllSaves: () => {},
  savesCount: 0,
})

export function SavesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [savedVenues, setSavedVenues] = useState<Venue[]>(readLS)

  // When user signs in: load their Supabase saves and MERGE (never overwrite)
  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase
      .from('saves')
      .select('venue_id, venue_name, venue_type, city')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (!data || data.length === 0) return
        setSavedVenues(prev => {
          const existingIds = new Set(prev.map(v => v.id))
          const fromDB: Venue[] = data
            .filter(row => !existingIds.has(row.venue_id))
            .map(row => ({
              id: row.venue_id,
              name: row.venue_name ?? '',
              type: row.venue_type ?? '',
              city: row.city ?? 'austin',
              dist: '',
              rating: '4.5',
              category: 'restaurant' as const,
              priceLevel: 2,
              img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&q=80',
              tags: [],
              promo: false,
              hot: 5,
            }))
          const merged = [...prev, ...fromDB]
          writeLS(merged)
          return merged
        })
      })
  }, [user])

  const isSaved = useCallback((venueId: string) =>
    savedVenues.some(v => v.id === venueId), [savedVenues])

  const saveVenue = useCallback((venue: Venue) => {
    setSavedVenues(prev => {
      if (prev.some(v => v.id === venue.id)) return prev
      const next = [...prev, venue]
      writeLS(next)
      return next
    })
    if (user) {
      const supabase = createClient()
      supabase.from('saves').upsert({
        user_id: user.id,
        venue_id: venue.id,
        venue_name: venue.name,
        venue_type: venue.type,
        city: venue.city ?? 'austin',
        promo_code: venue.promoCode ?? null,
      }, { onConflict: 'user_id,venue_id' }).then(() => {})
    }
  }, [user])

  const unsaveVenue = useCallback((venueId: string) => {
    setSavedVenues(prev => {
      const next = prev.filter(v => v.id !== venueId)
      writeLS(next) // write synchronously — don't rely on effect
      return next
    })
    if (user) {
      const supabase = createClient()
      supabase.from('saves')
        .delete()
        .eq('user_id', user.id)
        .eq('venue_id', venueId)
        .then(() => {})
    }
  }, [user])

  const clearAllSaves = useCallback(() => {
    setSavedVenues([])
    writeLS([])
    if (user) {
      const supabase = createClient()
      supabase.from('saves').delete().eq('user_id', user.id).then(() => {})
    }
  }, [user])

  return (
    <SavesContext.Provider value={{
      savedVenues,
      isSaved,
      saveVenue,
      unsaveVenue,
      clearAllSaves,
      savesCount: savedVenues.length,
    }}>
      {children}
    </SavesContext.Provider>
  )
}

export const useSaves = () => useContext(SavesContext)
