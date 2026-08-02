'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Venue } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './AuthContext'

const LS_KEY = 'dashi_rankings'

export interface RankedVenue {
  venue: Venue
  position: number
  city: string
}

type RankingsMap = Record<string, RankedVenue[]>

function readLS(): RankingsMap {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '{}') } catch { return {} }
}

function writeLS(rankings: RankingsMap) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(rankings)) } catch {}
}

interface RankingsContextType {
  rankings: RankingsMap
  getRankings: (city: string) => RankedVenue[]
  addToRanking: (venue: Venue, city: string, position: number) => void
  removeFromRanking: (venueId: string, city: string) => void
  moveRanking: (venueId: string, city: string, newPosition: number) => void
}

const RankingsContext = createContext<RankingsContextType>({
  rankings: {},
  getRankings: () => [],
  addToRanking: () => {},
  removeFromRanking: () => {},
  moveRanking: () => {},
})

export function RankingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [rankings, setRankings] = useState<RankingsMap>(readLS)

  // On sign-in: load from Supabase and merge
  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase
      .from('rankings')
      .select('venue_id, venue_name, venue_type, city, img, rank_position')
      .eq('user_id', user.id)
      .order('rank_position', { ascending: true })
      .then(({ data }) => {
        if (!data || data.length === 0) return
        setRankings(prev => {
          const next = { ...prev }
          for (const row of data) {
            const city = row.city ?? 'austin'
            if (!next[city]) next[city] = []
            const alreadyExists = next[city].some(r => r.venue.id === row.venue_id)
            if (!alreadyExists) {
              const venue: Venue = {
                id: row.venue_id,
                name: row.venue_name ?? '',
                type: row.venue_type ?? '',
                city,
                dist: '',
                rating: '4.5',
                category: 'restaurant' as const,
                priceLevel: 2,
                img: row.img ?? 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&q=80',
                tags: [],
                promo: false,
                hot: 5,
              }
              next[city].push({ venue, position: row.rank_position, city })
            }
          }
          // Sort each city's rankings by position
          for (const city of Object.keys(next)) {
            next[city] = next[city].sort((a, b) => a.position - b.position)
          }
          writeLS(next)
          return next
        })
      })
  }, [user])

  const getRankings = useCallback(
    (city: string): RankedVenue[] =>
      (rankings[city] ?? []).slice().sort((a, b) => a.position - b.position),
    [rankings]
  )

  const upsertToSupabase = useCallback((venue: Venue, city: string, position: number) => {
    if (!user) return
    const supabase = createClient()
    supabase.from('rankings').upsert({
      user_id: user.id,
      venue_id: venue.id,
      venue_name: venue.name,
      venue_type: venue.type,
      city,
      img: venue.img ?? null,
      rank_position: position,
    }, { onConflict: 'user_id,venue_id,city' }).then(() => {})
  }, [user])

  const deleteFromSupabase = useCallback((venueId: string, city: string) => {
    if (!user) return
    const supabase = createClient()
    supabase.from('rankings')
      .delete()
      .eq('user_id', user.id)
      .eq('venue_id', venueId)
      .eq('city', city)
      .then(() => {})
  }, [user])

  const addToRanking = useCallback((venue: Venue, city: string, position: number) => {
    setRankings(prev => {
      const cityList = [...(prev[city] ?? [])]
      // Remove existing entry for this venue if present
      const existingIdx = cityList.findIndex(r => r.venue.id === venue.id)
      if (existingIdx !== -1) cityList.splice(existingIdx, 1)
      // Remove any entry at the target position
      const posIdx = cityList.findIndex(r => r.position === position)
      if (posIdx !== -1) {
        deleteFromSupabase(cityList[posIdx].venue.id, city)
        cityList.splice(posIdx, 1)
      }
      cityList.push({ venue, position, city })
      cityList.sort((a, b) => a.position - b.position)
      const next = { ...prev, [city]: cityList }
      writeLS(next)
      upsertToSupabase(venue, city, position)
      return next
    })
  }, [upsertToSupabase, deleteFromSupabase])

  const removeFromRanking = useCallback((venueId: string, city: string) => {
    setRankings(prev => {
      const cityList = (prev[city] ?? []).filter(r => r.venue.id !== venueId)
      const next = { ...prev, [city]: cityList }
      writeLS(next)
      deleteFromSupabase(venueId, city)
      return next
    })
  }, [deleteFromSupabase])

  const moveRanking = useCallback((venueId: string, city: string, newPosition: number) => {
    setRankings(prev => {
      const cityList = [...(prev[city] ?? [])]
      const movingIdx = cityList.findIndex(r => r.venue.id === venueId)
      if (movingIdx === -1) return prev

      const moving = cityList[movingIdx]
      const oldPosition = moving.position

      // Find venue at target position and swap
      const targetIdx = cityList.findIndex(r => r.position === newPosition)
      if (targetIdx !== -1) {
        cityList[targetIdx] = { ...cityList[targetIdx], position: oldPosition }
        upsertToSupabase(cityList[targetIdx].venue, city, oldPosition)
      }
      cityList[movingIdx] = { ...moving, position: newPosition }
      upsertToSupabase(moving.venue, city, newPosition)

      cityList.sort((a, b) => a.position - b.position)
      const next = { ...prev, [city]: cityList }
      writeLS(next)
      return next
    })
  }, [upsertToSupabase])

  return (
    <RankingsContext.Provider value={{ rankings, getRankings, addToRanking, removeFromRanking, moveRanking }}>
      {children}
    </RankingsContext.Provider>
  )
}

export const useRankings = () => useContext(RankingsContext)
