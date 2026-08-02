'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Venue } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './AuthContext'

const LS_KEY = 'dashi_visits'

function readLS(): Venue[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]') } catch { return [] }
}

function writeLS(venues: Venue[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(venues)) } catch {}
}

interface VisitsContextType {
  visitedVenues: Venue[]
  isVisited: (venueId: string) => boolean
  markVisited: (venue: Venue) => void
  unmarkVisited: (venueId: string) => void
}

const VisitsContext = createContext<VisitsContextType>({
  visitedVenues: [],
  isVisited: () => false,
  markVisited: () => {},
  unmarkVisited: () => {},
})

export function VisitsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [visitedVenues, setVisitedVenues] = useState<Venue[]>(readLS)

  // On sign-in: load from Supabase and merge with local
  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase
      .from('visits')
      .select('venue_id, venue_name, venue_type, city, img')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (!data || data.length === 0) return
        setVisitedVenues(prev => {
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
              img: row.img ?? 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&q=80',
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

  const isVisited = useCallback(
    (venueId: string) => visitedVenues.some(v => v.id === venueId),
    [visitedVenues]
  )

  const markVisited = useCallback((venue: Venue) => {
    setVisitedVenues(prev => {
      if (prev.some(v => v.id === venue.id)) return prev
      const next = [...prev, venue]
      writeLS(next)
      return next
    })
    if (user) {
      const supabase = createClient()
      supabase.from('visits').upsert({
        user_id: user.id,
        venue_id: venue.id,
        venue_name: venue.name,
        venue_type: venue.type,
        city: venue.city ?? 'austin',
        img: venue.img ?? null,
      }, { onConflict: 'user_id,venue_id' }).then(() => {})
    }
  }, [user])

  const unmarkVisited = useCallback((venueId: string) => {
    setVisitedVenues(prev => {
      const next = prev.filter(v => v.id !== venueId)
      writeLS(next)
      return next
    })
    if (user) {
      const supabase = createClient()
      supabase.from('visits')
        .delete()
        .eq('user_id', user.id)
        .eq('venue_id', venueId)
        .then(() => {})
    }
  }, [user])

  return (
    <VisitsContext.Provider value={{ visitedVenues, isVisited, markVisited, unmarkVisited }}>
      {children}
    </VisitsContext.Provider>
  )
}

export const useVisits = () => useContext(VisitsContext)
