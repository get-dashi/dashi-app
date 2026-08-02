'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { ALL_FEATURED_VENUES, FEATURED_VENUES, MTY_FEATURED_VENUES, getMichelinTier, CITIES_CONFIG } from '@/lib/venues'
import type { Venue } from '@/lib/types'
import type { RankedVenue } from '@/contexts/RankingsContext'
import { BookButton } from '@/components/booking/BookButton'
import { AddSpotModal } from '@/components/recommendations/AddSpotModal'
import { RecommendationCount } from '@/components/recommendations/RecommendationCount'
import { useAuth } from '@/contexts/AuthContext'
import { useSaves } from '@/contexts/SavesContext'
import { useVisits } from '@/contexts/VisitsContext'
import { useRankings } from '@/contexts/RankingsContext'
import { useToast } from '@/contexts/ToastContext'
import { useUserLists } from '@/contexts/UserListsContext'

// ─── Curated Lists ──────────────────────────────────────────────────────────

interface CuratedList {
  id: string
  title: string
  subtitle: string
  city: string
  venueIds: string[]
}

const CURATED_LISTS: CuratedList[] = [
  // Austin
  {
    id: 'atx-weekend',
    title: 'Perfect Austin Weekend',
    subtitle: 'The essential 48-hour itinerary',
    city: 'austin',
    venueIds: ['feat-2', 'feat-1', 'feat-3', 'feat-31', 'feat-28', 'feat-50', 'feat-72', 'feat-26'],
  },
  {
    id: 'atx-date',
    title: 'Best Date Night',
    subtitle: 'Romantic and impressive',
    city: 'austin',
    venueIds: ['feat-2', 'feat-1', 'feat-36', 'feat-82', 'feat-33', 'feat-50'],
  },
  {
    id: 'atx-michelin',
    title: 'Michelin Experience',
    subtitle: 'From the official guide',
    city: 'austin',
    venueIds: ['feat-1', 'feat-2', 'feat-3', 'feat-36', 'feat-82', 'feat-33', 'feat-14', 'feat-4', 'feat-52', 'feat-94'],
  },
  {
    id: 'atx-rooftop',
    title: 'Best Rooftops & Patios',
    subtitle: 'Al fresco Austin',
    city: 'austin',
    venueIds: ['feat-49', 'feat-77', 'feat-86', 'feat-67', 'feat-93'],
  },
  {
    id: 'atx-pool-day',
    title: '🏊 Best Pool Day Passes',
    subtitle: 'Hotel pools, daybeds & sun',
    city: 'austin',
    venueIds: ['pool-008', 'pool-010', 'pool-001', 'pool-014', 'pool-013', 'pool-003', 'pool-004', 'pool-007', 'pool-009', 'pool-011', 'pool-012', 'pool-006', 'pool-005'],
  },
  {
    id: 'atx-experiences',
    title: '✈️ Best Austin Experiences',
    subtitle: 'Book something unforgettable',
    city: 'austin',
    venueIds: ['exp-001', 'exp-004', 'exp-002', 'exp-003', 'exp-005', 'exp-006', 'exp-007'],
  },
  {
    id: 'atx-first',
    title: 'First Time in Austin',
    subtitle: "The classics you can't miss",
    city: 'austin',
    venueIds: ['feat-31', 'feat-3', 'feat-18', 'feat-72', 'feat-26', 'feat-28'],
  },
  {
    id: 'atx-bachelorette',
    title: 'Bachelor/Bachelorette Weekend',
    subtitle: 'Go big',
    city: 'austin',
    venueIds: ['feat-72', 'feat-28', 'feat-8', 'feat-53', 'feat-12', 'feat-68'],
  },
  {
    id: 'atx-local',
    title: 'Local Favorites',
    subtitle: 'No tourist traps',
    city: 'austin',
    venueIds: ['feat-5', 'feat-32', 'feat-65', 'feat-78', 'feat-19', 'feat-17'],
  },
  {
    id: 'atx-sports',
    title: 'Best Sports Bars',
    subtitle: 'Game day sorted',
    city: 'austin',
    venueIds: ['feat-97', 'feat-98', 'feat-99', 'feat-100', 'feat-101', 'feat-102', 'feat-103', 'feat-104', 'feat-105', 'feat-106', 'feat-107'],
  },
  // Atlanta
  {
    id: 'atl-weekend',
    title: 'Perfect Atlanta Weekend',
    subtitle: 'The essential 48-hour ATL experience',
    city: 'atlanta',
    venueIds: ['atl-001', 'atl-004', 'atl-011', 'atl-019', 'atl-021', 'atl-025', 'atl-015'],
  },
  {
    id: 'atl-michelin',
    title: 'Michelin Atlanta',
    subtitle: 'From the official guide',
    city: 'atlanta',
    venueIds: ['atl-001', 'atl-002', 'atl-003', 'atl-011', 'atl-020', 'atl-021', 'atl-025'],
  },
  {
    id: 'atl-date-night',
    title: 'Best Date Night ATL',
    subtitle: 'Romantic and impressive',
    city: 'atlanta',
    venueIds: ['atl-001', 'atl-002', 'atl-008', 'atl-012', 'atl-029', 'atl-030'],
  },
  {
    id: 'atl-classics',
    title: 'Atlanta Classics',
    subtitle: 'The spots that define the city',
    city: 'atlanta',
    venueIds: ['atl-015', 'atl-021', 'atl-031', 'atl-004', 'atl-011', 'atl-019'],
  },
  {
    id: 'atl-nightlife',
    title: 'ATL After Dark',
    subtitle: 'Bars, clubs, and late nights',
    city: 'atlanta',
    venueIds: ['atl-011', 'atl-015', 'atl-016', 'atl-017', 'atl-019', 'atl-035', 'atl-040'],
  },
  // NYC
  {
    id: 'nyc-weekend',
    title: 'Perfect NYC Weekend',
    subtitle: 'The essential Manhattan experience',
    city: 'nyc',
    venueIds: ['nyc-003', 'nyc-011', 'nyc-020', 'nyc-017', 'nyc-018', 'nyc-024', 'nyc-043'],
  },
  {
    id: 'nyc-michelin',
    title: 'Michelin Manhattan',
    subtitle: 'Stars from one to three',
    city: 'nyc',
    venueIds: ['nyc-001', 'nyc-002', 'nyc-003', 'nyc-004', 'nyc-005', 'nyc-007', 'nyc-009', 'nyc-010'],
  },
  {
    id: 'nyc-date-night',
    title: 'NYC Date Night',
    subtitle: 'Impressive without trying too hard',
    city: 'nyc',
    venueIds: ['nyc-011', 'nyc-013', 'nyc-022', 'nyc-026', 'nyc-036', 'nyc-044'],
  },
  {
    id: 'nyc-classics',
    title: 'New York Classics',
    subtitle: "The city's soul on a plate",
    city: 'nyc',
    venueIds: ['nyc-017', 'nyc-014', 'nyc-018', 'nyc-035', 'nyc-038', 'nyc-043'],
  },
  {
    id: 'nyc-cocktails',
    title: 'Best Bars in Manhattan',
    subtitle: 'World-class drinking',
    city: 'nyc',
    venueIds: ['nyc-020', 'nyc-021', 'nyc-022', 'nyc-024', 'nyc-026', 'nyc-027', 'nyc-023'],
  },
  {
    id: 'nyc-splurge',
    title: 'NYC Splurge Night',
    subtitle: 'When money is no object',
    city: 'nyc',
    venueIds: ['nyc-004', 'nyc-001', 'nyc-024', 'nyc-045', 'nyc-032'],
  },
  // Dallas
  { id:'dal-weekend', title:'Perfect Dallas Weekend', subtitle:'The essential Dallas experience',      city:'dallas', venueIds:['dal-001','dal-009','dal-016','dal-010','dal-018','dal-007'] },
  { id:'dal-michelin', title:'Michelin Dallas',        subtitle:'Stars in the Lone Star State',         city:'dallas', venueIds:['dal-001','dal-002','dal-003','dal-004','dal-005','dal-006'] },
  { id:'dal-bbq',      title:'Dallas BBQ Trail',       subtitle:'Smoke rings and cold beer',            city:'dallas', venueIds:['dal-009','dal-010'] },
  // Miami
  { id:'mia-weekend', title:'Perfect Miami Weekend',   subtitle:'The full Miami experience',            city:'miami',  venueIds:['mia-002','mia-007','mia-015','mia-016','mia-008','mia-018'] },
  { id:'mia-michelin', title:'Michelin Miami',          subtitle:'Florida\'s starred restaurants',       city:'miami',  venueIds:['mia-001','mia-002','mia-003','mia-004','mia-005','mia-009'] },
  { id:'mia-vibes',    title:'Miami Vibes',             subtitle:'See and be seen',                      city:'miami',  venueIds:['mia-006','mia-015','mia-016','mia-018','mia-017'] },
  // Mexico City
  { id:'cdmx-noche',   title:'Una Noche Perfecta en CDMX', subtitle:'Lo mejor de la capital',          city:'cdmx',   venueIds:['cdmx-001','cdmx-005','cdmx-010','cdmx-009','cdmx-013'] },
  { id:'cdmx-michelin',title:'Guía Michelin CDMX',     subtitle:'Estrellas en la Ciudad de México',    city:'cdmx',   venueIds:['cdmx-001','cdmx-002','cdmx-003','cdmx-004','cdmx-005','cdmx-006','cdmx-007','cdmx-008'] },
  { id:'cdmx-clasicos',title:'CDMX Clásicos',          subtitle:'El alma de la ciudad en un plato',    city:'cdmx',   venueIds:['cdmx-005','cdmx-008','cdmx-009','cdmx-010','cdmx-014','cdmx-015'] },
  // Chicago
  { id:'chi-weekend',  title:'Perfect Chicago Weekend', subtitle:'The essential Chicago experience',    city:'chicago',venueIds:['chi-001','chi-006','chi-017','chi-011','chi-004','chi-016'] },
  { id:'chi-michelin', title:'Michelin Chicago',        subtitle:'3 stars to Bib Gourmand',             city:'chicago',venueIds:['chi-001','chi-002','chi-003','chi-004','chi-005','chi-007','chi-009'] },
  { id:'chi-night',    title:'Chicago Night Out',       subtitle:'West Loop to Wicker Park',            city:'chicago',venueIds:['chi-006','chi-017','chi-019','chi-011','chi-014'] },
  // Los Angeles
  { id:'la-weekend',   title:'Perfect LA Weekend',      subtitle:'From Kaiseki to Venice Beach',         city:'la',     venueIds:['la-002','la-010','la-016','la-012','la-008','la-017'] },
  { id:'la-michelin',  title:'Michelin Los Angeles',    subtitle:'LA\'s starred tables',                  city:'la',     venueIds:['la-001','la-002','la-003','la-004','la-005','la-006','la-007'] },
  { id:'la-eats',      title:'LA Eats',                 subtitle:'Tacos to kaiseki and everything between',city:'la',   venueIds:['la-008','la-009','la-011','la-013','la-014','la-012'] },
  // Houston
  { id:'hou-best',     title:'Best of Houston',         subtitle:'The culinary capital of Texas',        city:'houston',venueIds:['hou-001','hou-004','hou-006','hou-007','hou-009','hou-014','hou-003'] },
  { id:'hou-date',     title:'Houston Date Night',      subtitle:'Impressive without trying too hard',   city:'houston',venueIds:['hou-001','hou-002','hou-005','hou-014','hou-008'] },
  // Monterrey
  {
    id: 'mty-noche',
    title: 'Noche Perfecta en Monterrey',
    subtitle: 'La experiencia completa',
    city: 'monterrey',
    venueIds: ['mty-074', 'mty-075', 'mty-051', 'mty-050', 'mty-063', 'mty-008'],
  },
  {
    id: 'mty-michelin',
    title: 'Guía Michelin MTY',
    subtitle: 'Lo mejor de la guía oficial',
    city: 'monterrey',
    venueIds: ['mty-074', 'mty-075', 'mty-076', 'mty-060', 'mty-062', 'mty-053', 'mty-004', 'mty-029'],
  },
  {
    id: 'mty-brunch',
    title: 'Brunch y Café',
    subtitle: 'Las mejores mañanas',
    city: 'monterrey',
    venueIds: ['mty-004', 'mty-015', 'mty-017', 'mty-003', 'mty-002', 'mty-056'],
  },
  {
    id: 'mty-cita',
    title: 'Noche de Cita',
    subtitle: 'Romántico e impresionante',
    city: 'monterrey',
    venueIds: ['mty-057', 'mty-075', 'mty-051', 'mty-043', 'mty-064', 'mty-067'],
  },
]

const LIVE_CITIES = new Set(['austin', 'monterrey'])

const CATEGORIES = [
  { id: 'all',        label: 'All' },
  { id: 'restaurant', label: 'Restaurants' },
  { id: 'bar',        label: 'Bars' },
  { id: 'sports',     label: 'Sports Bars' },
  { id: 'night_club', label: 'Nightlife' },
  { id: 'cafe',       label: 'Cafes' },
]

function rankScore(v: Venue): number {
  const r = parseFloat(v.rating) || 4.0
  const h = v.hot ?? 5
  return r * 4 + h * 0.6 + (v.priceLevel ?? 2) * 0.2
}

interface CommunityVenue {
  google_place_id: string
  venue_name: string
  venue_type: string | null
  city: string
  address: string | null
  lat: number | null
  lng: number | null
  recommendation_count: number
  recommended_by_me: boolean
}

// ─── Rank It Sheet ──────────────────────────────────────────────────────────

function RankItSheet({
  venue,
  city,
  onClose,
}: {
  venue: Venue
  city: string
  onClose: () => void
}) {
  const { getRankings, addToRanking } = useRankings()
  const { showToast } = useToast()
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
        <p className="text-[0.65rem] text-white/40 mb-4">Choose a position in your Top 10 for {city === 'monterrey' ? 'Monterrey' : city === 'atlanta' ? 'Atlanta' : city === 'nyc' ? 'New York' : 'Austin'}</p>
        <div className="flex flex-col gap-2">
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

// ─── Add From Visited Sheet ──────────────────────────────────────────────────

function AddFromVisitedSheet({
  city,
  onClose,
}: {
  city: string
  onClose: () => void
}) {
  const { visitedVenues } = useVisits()
  const { getRankings, addToRanking } = useRankings()
  const { showToast } = useToast()
  const currentRankings = getRankings(city)
  const rankedIds = new Set(currentRankings.map(r => r.venue.id))
  const available = visitedVenues.filter(v => !rankedIds.has(v.id))
  const nextPosition = Math.min((currentRankings.length + 1), 10)

  const handleAdd = (venue: Venue) => {
    addToRanking(venue, city, nextPosition)
    showToast(`Added ${venue.name} at #${nextPosition}`, 'success')
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
        <p className="text-[0.88rem] font-black mb-1">Add from Visited</p>
        <p className="text-[0.65rem] text-white/40 mb-4">Venues you&apos;ve been to, not yet ranked</p>
        {available.length === 0 ? (
          <p className="text-center text-sm text-white/30 py-8">
            No unranked visited venues. Mark more places as visited first.
          </p>
        ) : (
          <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto no-scrollbar">
            {available.map(venue => (
              <button
                key={venue.id}
                onClick={() => handleAdd(venue)}
                className="flex items-center gap-3 px-3.5 py-3 rounded-[14px] bg-white/5 border border-white/8 hover:bg-white/10 transition-all active:scale-98 text-left"
              >
                <img
                  src={venue.img}
                  alt={venue.name}
                  className="w-10 h-10 rounded-[10px] object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[0.82rem] font-bold truncate">{venue.name}</p>
                  <p className="text-[0.6rem] text-white/40 truncate">{venue.type}</p>
                </div>
                <span className="text-[0.65rem] font-bold text-white/30 flex-shrink-0">+ #{nextPosition}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function ListsPage() {
  const { user } = useAuth()
  const { saveVenue, isSaved } = useSaves()
  const { visitedVenues } = useVisits()
  const { getRankings, removeFromRanking, moveRanking } = useRankings()
  const { showToast } = useToast()
  const { createList, hasListForSource } = useUserLists()

  const [city, setCity] = useState('austin')
  const [category, setCategory] = useState('all')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [communityVenues, setCommunityVenues] = useState<CommunityVenue[]>([])
  const [communityLoading, setCommunityLoading] = useState(true)
  const [rankItVenue, setRankItVenue] = useState<Venue | null>(null)
  const [addFromVisited, setAddFromVisited] = useState(false)
  const [viewingList, setViewingList] = useState<CuratedList | null>(null)

  // City rankings (personal Top 10)
  const cityRankings = getRankings(city)

  // Curated lists filtered by city
  const filteredLists = CURATED_LISTS.filter(l => l.city === city)

  // Section C: city ranked list
  const ranked = useMemo(() => {
    return ALL_FEATURED_VENUES
      .filter(v => city === 'austin' ? (!v.city || v.city === 'austin') : v.city === city)
      .filter(v => category === 'all' || v.category === category)
      .sort((a, b) => rankScore(b) - rankScore(a))
      .slice(0, 20)
  }, [city, category])

  const curatedNames = useMemo(
    () => new Set(ranked.map(v => v.name.toLowerCase())),
    [ranked]
  )

  const fetchCommunity = useCallback(async () => {
    setCommunityLoading(true)
    try {
      const params = new URLSearchParams({ city })
      if (user?.id) params.set('userId', user.id)
      const res = await fetch(`/api/recommendations?${params.toString()}`)
      const json = (await res.json()) as { venues?: CommunityVenue[] }
      setCommunityVenues(json.venues ?? [])
    } catch {
      setCommunityVenues([])
    } finally {
      setCommunityLoading(false)
    }
  }, [city, user?.id])

  useEffect(() => {
    fetchCommunity()
  }, [fetchCommunity])

  const communityPicks = useMemo(
    () => communityVenues.filter(v => !curatedNames.has(v.venue_name.toLowerCase())),
    [communityVenues, curatedNames]
  )

  const handleAdded = useCallback((newVenue: CommunityVenue) => {
    setCommunityVenues(prev => {
      const existing = prev.find(v => v.google_place_id === newVenue.google_place_id)
      if (existing) {
        return prev.map(v =>
          v.google_place_id === newVenue.google_place_id
            ? { ...v, recommendation_count: v.recommendation_count + 1, recommended_by_me: true }
            : v
        )
      }
      return [newVenue, ...prev]
    })
  }, [])

  // Save entire curated list
  const handleSaveList = (list: CuratedList, venues: Venue[]) => {
    if (hasListForSource(list.id)) {
      showToast('Already in My Lists', 'success')
      return
    }
    createList(list.title, venues.map(v => v.id), list.id)
    let savedCount = 0
    for (const venue of venues) {
      if (!isSaved(venue.id)) {
        saveVenue(venue)
        savedCount++
      }
    }
    showToast(
      savedCount > 0
        ? `Saved ${savedCount} venue${savedCount > 1 ? 's' : ''} from "${list.title}"`
        : `"${list.title}" added to My Lists`,
      'success'
    )
  }

  const venueMap = useMemo(() => new Map(ALL_FEATURED_VENUES.map(v => [v.id, v])), [])

  // Top-rated venues for the selected city (used as fallback filler)
  const cityTopVenues = useMemo(() =>
    ALL_FEATURED_VENUES
      .filter(v => city === 'austin' ? (!v.city || v.city === 'austin') : v.city === city)
      .sort((a, b) => rankScore(b) - rankScore(a)),
    [city]
  )

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#0d0d0f]">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex-shrink-0">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h1 className="text-[1.4rem] font-black tracking-[-0.03em]">Lists</h1>
            <p className="text-[0.7rem] text-white/35">Curated picks, your Top 10, and city rankings.</p>
          </div>
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex-shrink-0 mt-0.5 px-4 py-2 rounded-full text-[0.65rem] font-bold text-white transition-all active:scale-95"
            style={{ background: 'linear-gradient(to right, #a855f7, #ec4899)' }}
          >
            Add a Spot
          </button>
        </div>

        {/* City dropdown */}
        <div className="mt-3">
          <select
            value={city}
            onChange={e => { setCity(e.target.value); setCategory('all') }}
            className="bg-white/8 border border-white/12 text-white text-[0.78rem] font-semibold rounded-xl px-3 py-2 pr-8 appearance-none cursor-pointer outline-none focus:border-purple-500/60 transition-colors"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
          >
            <option value="austin">Austin, TX</option>
            <option value="nyc">New York, NY</option>
            <option value="chicago">Chicago, IL</option>
            <option value="la">Los Angeles, CA</option>
            <option value="miami">Miami, FL</option>
            <option value="dallas">Dallas, TX</option>
            <option value="houston">Houston, TX</option>
            <option value="atlanta">Atlanta, GA</option>
            <option value="monterrey">Monterrey, MX</option>
            <option value="cdmx">Ciudad de México</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6 no-scrollbar">

        {!LIVE_CITIES.has(city) ? (
          <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
            <div className="text-4xl mb-4">🚧</div>
            <h3 className="text-white font-bold text-xl mb-2">Coming Soon</h3>
            <p className="text-white/50 text-sm">We&apos;re curating the best spots in {CITIES_CONFIG[city]?.label ?? city.toUpperCase()}. Check back soon!</p>
            <button
              onClick={() => setCity('austin')}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl text-sm"
            >
              Back to Austin
            </button>
          </div>
        ) : (
          <>

        {/* ─── Section A: Curated Lists ──────────────────────────────── */}
        <div className="mb-8">
          <div className="mb-3">
            <h2 className="text-[0.9rem] font-black tracking-[-0.02em]">Curated Lists</h2>
            <p className="text-[0.62rem] text-white/30">Hand-picked collections for every occasion</p>
          </div>
          <div className="flex flex-col gap-3">
            {filteredLists.map(list => {
              const resolvedVenues = list.venueIds.map(id => venueMap.get(id)).filter(Boolean) as Venue[]
              // Pad with top-rated city venues if list is shorter than 6
              const MIN_LIST_SIZE = 6
              const existingIds = new Set(resolvedVenues.map(v => v.id))
              const fillers = cityTopVenues.filter(v => !existingIds.has(v.id)).slice(0, Math.max(0, MIN_LIST_SIZE - resolvedVenues.length))
              const venues = [...resolvedVenues, ...fillers]
              const inMyLists = hasListForSource(list.id)
              return (
                <div
                  key={list.id}
                  className="rounded-[20px] p-4 border border-white/8"
                  style={{ background: '#1c1c1e' }}
                >
                  {/* Venue thumbnails strip */}
                  <div className="flex gap-1.5 mb-3">
                    {venues.slice(0, 4).map((v, i) => (
                      <img
                        key={v.id}
                        src={v.img}
                        alt={v.name}
                        className="rounded-[10px] object-cover flex-shrink-0"
                        style={{ width: 52, height: 52, opacity: i === 3 && venues.length > 4 ? 0.6 : 1 }}
                      />
                    ))}
                    {venues.length > 4 && (
                      <div className="w-[52px] h-[52px] rounded-[10px] flex-shrink-0 flex items-center justify-center bg-white/8 border border-white/10">
                        <span className="text-[0.62rem] font-black text-white/50">+{venues.length - 4}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[0.9rem] font-extrabold leading-tight mb-0.5">{list.title}</p>
                      <p className="text-[0.62rem] text-white/40 mb-2">{list.subtitle}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[0.55rem] font-bold px-2 py-0.5 rounded-full bg-white/8 text-white/50">
                          {venues.length} venues
                        </span>
                        <span className="text-[0.55rem] font-bold px-2 py-0.5 rounded-full text-purple-400"
                          style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.2)' }}>
                          {city === 'austin' ? 'Austin' : city === 'monterrey' ? 'Monterrey' : city === 'nyc' ? 'New York' : city === 'atlanta' ? 'Atlanta' : city === 'dallas' ? 'Dallas' : city === 'miami' ? 'Miami' : city === 'chicago' ? 'Chicago' : city === 'la' ? 'Los Angeles' : city === 'houston' ? 'Houston' : city === 'cdmx' ? 'CDMX' : city}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleSaveList(list, venues)}
                        className="px-3.5 py-2 rounded-full text-[0.62rem] font-bold text-white transition-all active:scale-95"
                        style={{
                          background: inMyLists
                            ? 'rgba(255,255,255,0.1)'
                            : 'linear-gradient(to right, #a855f7, #ec4899)',
                          color: inMyLists ? 'rgba(255,255,255,0.5)' : 'white',
                        }}
                      >
                        {inMyLists ? '✓ In My Lists' : 'Save List'}
                      </button>
                      <button
                        onClick={() => setViewingList(list)}
                        className="text-[0.62rem] font-bold text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        View All
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ─── Section B: Your Top 10 ────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-[0.9rem] font-black tracking-[-0.02em]">
                Your Top 10 &middot; {city === 'monterrey' ? 'Monterrey' : city === 'atlanta' ? 'Atlanta' : city === 'nyc' ? 'New York' : 'Austin'}
              </h2>
              <p className="text-[0.62rem] text-white/30">Your personal ranking</p>
            </div>
            {visitedVenues.length > 0 && cityRankings.length < 10 && (
              <button
                onClick={() => setAddFromVisited(true)}
                className="text-[0.62rem] font-bold px-3 py-1.5 rounded-full border border-white/15 text-white/60 hover:bg-white/8 transition-all active:scale-95"
              >
                + Add from Visited
              </button>
            )}
          </div>

          {cityRankings.length === 0 ? (
            <div className="rounded-[20px] p-6 border border-white/6 text-center" style={{ background: '#161618' }}>
              <div className="w-10 h-10 rounded-full bg-white/6 flex items-center justify-center mx-auto mb-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
              </div>
              <p className="text-[0.78rem] font-bold text-white/50 mb-1">No rankings yet</p>
              <p className="text-[0.62rem] text-white/30 leading-relaxed">
                Mark venues as visited from your Saved list,<br />then rank your favorites here.
              </p>
              {visitedVenues.length > 0 && (
                <button
                  onClick={() => setAddFromVisited(true)}
                  className="mt-4 px-5 py-2.5 rounded-full text-[0.65rem] font-bold text-white transition-all active:scale-95"
                  style={{ background: 'linear-gradient(to right, #a855f7, #ec4899)' }}
                >
                  Add from Visited
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {cityRankings.map((ranked, idx) => (
                <PersonalRankRow
                  key={ranked.venue.id}
                  rankedVenue={ranked}
                  city={city}
                  isFirst={idx === 0}
                  isLast={idx === cityRankings.length - 1}
                  onMoveUp={() => {
                    if (ranked.position <= 1) return
                    moveRanking(ranked.venue.id, city, ranked.position - 1)
                  }}
                  onMoveDown={() => {
                    if (ranked.position >= 10) return
                    moveRanking(ranked.venue.id, city, ranked.position + 1)
                  }}
                  onRemove={() => removeFromRanking(ranked.venue.id, city)}
                />
              ))}

              {cityRankings.length < 10 && (
                <button
                  onClick={() => setAddFromVisited(true)}
                  className="flex items-center justify-center gap-2 rounded-[16px] py-3 border border-dashed border-white/15 text-white/35 text-[0.7rem] font-bold hover:border-white/25 hover:text-white/50 transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Add from Visited ({10 - cityRankings.length} slots left)
                </button>
              )}
            </div>
          )}
        </div>

        {/* ─── Section C: City Rankings ─────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-[0.9rem] font-black tracking-[-0.02em]">City Rankings</h2>
              <p className="text-[0.62rem] text-white/30">The best spots in {city === 'monterrey' ? 'Monterrey' : city === 'atlanta' ? 'Atlanta' : city === 'nyc' ? 'New York' : 'Austin'}, ranked</p>
            </div>
          </div>

          {/* Category filter */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-3">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`rounded-full px-3.5 py-1.5 text-[0.6rem] font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                  category === cat.id
                    ? 'bg-white/15 text-white border border-white/20'
                    : 'text-white/35 border border-white/8 bg-transparent'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {ranked.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-white/30 text-sm">No venues in this category yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {ranked.map((venue, i) => (
                <TopVenueRow
                  key={venue.id}
                  venue={venue}
                  rank={i + 1}
                  onRankIt={() => setRankItVenue(venue)}
                />
              ))}
            </div>
          )}

          {/* Community Picks */}
          {!communityLoading && communityPicks.length > 0 && (
            <div className="mt-8">
              <div className="mb-3">
                <h2 className="text-[0.9rem] font-black tracking-[-0.02em] mb-0.5">Community Picks</h2>
                <p className="text-[0.62rem] text-white/30">Added by Dashi users</p>
              </div>
              <div className="flex flex-col gap-2.5">
                {communityPicks.map(venue => (
                  <CommunityVenueRow key={venue.google_place_id} venue={venue} />
                ))}
              </div>
            </div>
          )}

          {/* More Top Picks fallback — always shown after the ranked list */}
          {!communityLoading && (() => {
            const rankedIds = new Set(ranked.map(v => v.id))
            const morePicks = cityTopVenues.filter(v => !rankedIds.has(v.id)).slice(0, 10)
            if (morePicks.length === 0) return null
            return (
              <div className="mt-8">
                <div className="mb-3">
                  <h2 className="text-[0.9rem] font-black tracking-[-0.02em] mb-0.5">More Top Picks</h2>
                  <p className="text-[0.62rem] text-white/30">More highly-rated spots you might love</p>
                </div>
                <div className="flex flex-col gap-2.5">
                  {morePicks.map((venue, i) => (
                    <TopVenueRow
                      key={venue.id}
                      venue={venue}
                      rank={ranked.length + i + 1}
                      onRankIt={() => setRankItVenue(venue)}
                    />
                  ))}
                </div>
              </div>
            )
          })()}

          {communityLoading && (
            <div className="mt-8">
              <div className="h-3 w-32 rounded-full bg-white/6 mb-4" />
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 rounded-[20px] bg-white/4 mb-2.5 animate-pulse" />
              ))}
            </div>
          )}
        </div>
          </>
        )}
      </div>

      {/* Modals */}
      <AddSpotModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        city={city}
        userId={user?.id ?? null}
        onAdded={handleAdded}
      />

      {rankItVenue && (
        <RankItSheet
          venue={rankItVenue}
          city={city}
          onClose={() => setRankItVenue(null)}
        />
      )}

      {addFromVisited && (
        <AddFromVisitedSheet
          city={city}
          onClose={() => setAddFromVisited(false)}
        />
      )}

      {viewingList && (
        <ViewAllModal
          list={viewingList}
          venueMap={venueMap}
          cityTopVenues={cityTopVenues}
          isSaved={isSaved}
          saveVenue={saveVenue}
          hasListForSource={hasListForSource}
          onSaveList={(venues) => handleSaveList(viewingList, venues)}
          onClose={() => setViewingList(null)}
        />
      )}
    </div>
  )
}

// ─── View All Modal ─────────────────────────────────────────────────────────

function ViewAllModal({
  list,
  venueMap,
  cityTopVenues,
  isSaved,
  saveVenue,
  hasListForSource,
  onSaveList,
  onClose,
}: {
  list: CuratedList
  venueMap: Map<string, Venue>
  cityTopVenues: Venue[]
  isSaved: (id: string) => boolean
  saveVenue: (v: Venue) => void
  hasListForSource: (id: string) => boolean
  onSaveList: (venues: Venue[]) => void
  onClose: () => void
}) {
  const resolvedVenues = list.venueIds.map(id => venueMap.get(id)).filter(Boolean) as Venue[]
  const existingIds = new Set(resolvedVenues.map(v => v.id))
  const fillers = cityTopVenues.filter(v => !existingIds.has(v.id)).slice(0, Math.max(0, 6 - resolvedVenues.length))
  const venues = [...resolvedVenues, ...fillers]
  const inMyLists = hasListForSource(list.id)

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#161618] rounded-t-[28px] max-h-[88vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* drag handle */}
        <div className="w-8 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-1 flex-shrink-0" />

        {/* header */}
        <div className="flex items-start justify-between px-5 pt-3 pb-4 flex-shrink-0">
          <div className="flex-1 min-w-0 pr-3">
            <p className="text-[1rem] font-black leading-tight mb-0.5">{list.title}</p>
            <p className="text-[0.62rem] text-white/40 mb-1">{list.subtitle}</p>
            <span className="text-[0.55rem] font-bold px-2 py-0.5 rounded-full bg-white/8 text-white/50">
              {venues.length} venues
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 hover:bg-white/15 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* scrollable venue list */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-2">
          <div className="flex flex-col gap-2.5">
            {venues.map(venue => (
              <div key={venue.id} className="flex items-center gap-3 rounded-[16px] p-3 bg-white/4 border border-white/6">
                <img
                  src={venue.img}
                  alt={venue.name}
                  className="rounded-[10px] object-cover flex-shrink-0"
                  style={{ width: 56, height: 56 }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[0.85rem] font-extrabold truncate leading-tight mb-0.5">{venue.name}</p>
                  <p className="text-[0.6rem] text-white/40 truncate mb-1">{venue.type}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-0.5 text-[0.58rem] font-bold text-yellow-400">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="#ffd60a">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                      {venue.rating}
                    </span>
                    {venue.tags?.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[0.5rem] font-bold px-1.5 py-0.5 rounded bg-white/6 text-white/40">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => { if (!isSaved(venue.id)) saveVenue(venue) }}
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
                  style={{ background: isSaved(venue.id) ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.08)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={isSaved(venue.id) ? '#a855f7' : 'none'} stroke={isSaved(venue.id) ? '#a855f7' : 'rgba(255,255,255,0.5)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* sticky bottom save button */}
        <div className="px-5 pt-3 pb-8 flex-shrink-0 border-t border-white/6 mt-2">
          <button
            onClick={() => { onSaveList(venues); if (!inMyLists) onClose() }}
            className="w-full py-3.5 rounded-[16px] text-[0.78rem] font-black text-white transition-all active:scale-98"
            style={{
              background: inMyLists
                ? 'rgba(255,255,255,0.08)'
                : 'linear-gradient(to right, #a855f7, #ec4899)',
              color: inMyLists ? 'rgba(255,255,255,0.4)' : 'white',
            }}
          >
            {inMyLists ? '✓ In My Lists' : 'Save List'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Personal Rank Row ──────────────────────────────────────────────────────

function PersonalRankRow({
  rankedVenue,
  city: _city,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  rankedVenue: RankedVenue
  city: string
  isFirst: boolean
  isLast: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
}) {
  const { venue, position } = rankedVenue
  const rankColor =
    position === 1 ? '#ffd60a' :
    position === 2 ? 'rgba(255,255,255,0.7)' :
    position === 3 ? '#f97316' :
    'rgba(255,255,255,0.25)'

  return (
    <div className="flex items-center gap-3 rounded-[18px] p-3 border border-white/6" style={{ background: '#161618' }}>
      <span
        className="w-7 text-center font-black text-[0.95rem] flex-shrink-0"
        style={{ color: rankColor }}
      >
        {position}
      </span>
      <img
        src={venue.img}
        alt={venue.name}
        className="rounded-[10px] object-cover flex-shrink-0"
        style={{ width: 52, height: 52 }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-[0.82rem] font-extrabold truncate">{venue.name}</p>
        <p className="text-[0.6rem] text-white/40 truncate">{venue.type}</p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={onMoveUp}
          disabled={isFirst}
          className="w-7 h-7 rounded-full flex items-center justify-center text-white/30 hover:text-white/70 disabled:opacity-20 transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15"/>
          </svg>
        </button>
        <button
          onClick={onMoveDown}
          disabled={isLast}
          className="w-7 h-7 rounded-full flex items-center justify-center text-white/30 hover:text-white/70 disabled:opacity-20 transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        <button
          onClick={onRemove}
          className="w-7 h-7 rounded-full flex items-center justify-center text-white/30 hover:text-red-400 transition-all"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

// ─── Top Venue Row ──────────────────────────────────────────────────────────

function TopVenueRow({ venue, rank, onRankIt }: { venue: Venue; rank: number; onRankIt: () => void }) {
  const michelinTier = getMichelinTier(venue.name)
  const isTop3 = rank <= 3

  const rankColor =
    rank === 1 ? 'text-yellow-400' :
    rank === 2 ? 'text-white/60' :
    rank === 3 ? 'text-orange-400' :
    'text-white/22'

  return (
    <div className={`flex items-center gap-3.5 rounded-[20px] p-3.5 border transition-all ${
      isTop3
        ? 'bg-gradient-to-r from-purple-500/8 to-pink-500/6 border-purple-500/20'
        : 'bg-[#161618] border-white/6'
    }`}>
      <div className={`w-8 text-center font-black text-[0.95rem] flex-shrink-0 ${rankColor}`}>
        {rank}
      </div>
      <img
        src={venue.img}
        alt={venue.name}
        className="rounded-[12px] object-cover flex-shrink-0"
        style={{ width: 52, height: 52 }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <p className="text-[0.88rem] font-extrabold truncate leading-tight">{venue.name}</p>
        </div>
        <p className="text-[0.6rem] text-white/40 truncate mb-1">{venue.type}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1 text-[0.58rem] font-bold text-yellow-400">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="#ffd60a">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            {venue.rating}
          </span>
          {michelinTier === 'star' && (
            <span className="text-[0.5rem] font-black px-1.5 py-0.5 rounded bg-red-900/40 border border-red-500/40 text-red-400">
              Michelin
            </span>
          )}
          {michelinTier === 'bib' && (
            <span className="text-[0.5rem] font-black px-1.5 py-0.5 rounded bg-orange-900/30 border border-orange-500/35 text-orange-400">
              Bib Gourmand
            </span>
          )}
          {michelinTier === 'recommended' && (
            <span className="text-[0.5rem] font-black px-1.5 py-0.5 rounded bg-white/6 border border-white/15 text-white/50">
              M Recommended
            </span>
          )}
          {venue.comoComi && !michelinTier && (
            <span className="text-[0.5rem] font-black px-1.5 py-0.5 rounded bg-amber-900/30 border border-amber-500/35 text-amber-400">
              Como Comi
            </span>
          )}
          {(venue.hot ?? 0) >= 9 && (
            <span className="text-[0.5rem] font-bold px-1.5 py-0.5 rounded bg-pink-500/12 border border-pink-500/25 text-pink-400">
              Hot
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <span className="text-[0.55rem] text-white/25 font-medium">{venue.dist}</span>
        {venue.bookingPlatform && (
          <BookButton venue={venue} size="sm" />
        )}
        {venue.resortPassUrl && (
          <a
            href={venue.resortPassUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[0.52rem] font-bold px-2 py-1 rounded-full border border-cyan-500/40 text-cyan-400/80 hover:bg-cyan-500/10 transition-all active:scale-95 whitespace-nowrap"
          >
            🏊 Day Pass
          </a>
        )}
        {venue.airbnbUrl && (
          <a
            href={venue.airbnbUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[0.52rem] font-bold px-2 py-1 rounded-full border border-rose-500/40 text-rose-400/80 hover:bg-rose-500/10 transition-all active:scale-95 whitespace-nowrap"
          >
            ✈️ Book
          </a>
        )}
        <button
          onClick={onRankIt}
          className="text-[0.52rem] font-bold px-2 py-1 rounded-full border border-purple-500/30 text-purple-400/70 hover:bg-purple-500/10 transition-all active:scale-95"
        >
          Rank it
        </button>
      </div>
    </div>
  )
}

// ─── Community Venue Row ────────────────────────────────────────────────────

function CommunityVenueRow({ venue }: { venue: CommunityVenue }) {
  return (
    <div className="flex items-center gap-3.5 rounded-[20px] p-3.5 border bg-[#161618] border-white/6">
      <div className="w-10 h-10 rounded-[10px] flex-shrink-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(236,72,153,0.1))' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(168,85,247,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[0.85rem] font-extrabold truncate leading-tight">{venue.venue_name}</p>
        <p className="text-[0.6rem] text-white/40 truncate mb-1">{venue.venue_type ?? 'Venue'}</p>
        {venue.address && (
          <p className="text-[0.58rem] text-white/25 truncate">{venue.address}</p>
        )}
      </div>
      <div className="flex-shrink-0">
        <RecommendationCount count={venue.recommendation_count} size="sm" />
      </div>
    </div>
  )
}
