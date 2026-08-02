'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect, useCallback } from 'react'
import type { HeatPoint } from '@/components/map/LeafletMap'

const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-[#0d0d0f]">
      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
})

type City = 'austin' | 'monterrey' | 'atlanta' | 'nyc' | 'dallas' | 'miami' | 'cdmx' | 'chicago' | 'la' | 'houston'

const LIVE_CITIES = new Set<City>(['austin', 'monterrey'])
type Layer = 'popularity' | 'dashi'

interface HeatmapResponse {
  points: HeatPoint[]
  totalSwipes?: number
}

const CITY_LABELS: Record<City, string> = {
  austin:    'Austin, TX',
  monterrey: 'Monterrey, MX',
  atlanta:   'Atlanta, GA',
  nyc:       'New York, NY',
  dallas:    'Dallas, TX',
  miami:     'Miami, FL',
  cdmx:      'Ciudad de México',
  chicago:   'Chicago, IL',
  la:        'Los Angeles, CA',
  houston:   'Houston, TX',
}

const CITY_SHORT: Record<City, string> = {
  austin:    'ATX',
  monterrey: 'MTY',
  atlanta:   'ATL',
  nyc:       'NYC',
  dallas:    'DAL',
  miami:     'MIA',
  cdmx:      'CDMX',
  chicago:   'CHI',
  la:        'LA',
  houston:   'HOU',
}

export default function MapPage() {
  const [city, setCity] = useState<City>('austin')
  const [activeLayer, setActiveLayer] = useState<Layer>('popularity')
  const [heatPoints, setHeatPoints] = useState<HeatPoint[]>([])
  const [totalSwipes, setTotalSwipes] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchHeatmap = useCallback(async (c: City, l: Layer) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/heatmap?city=${c}&layer=${l}`)
      if (!res.ok) throw new Error('fetch failed')
      const data = (await res.json()) as HeatmapResponse
      setHeatPoints(data.points ?? [])
      setTotalSwipes(data.totalSwipes ?? 0)
    } catch (err) {
      console.error('[MapPage] heatmap fetch:', err)
      setHeatPoints([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchHeatmap(city, activeLayer)
  }, [city, activeLayer, fetchHeatmap])

  // Top 5 venues by weight for "What's Hot"
  const topVenues = [...heatPoints]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Map area — 58% */}
      <div className="relative flex-[0_0_58%] overflow-hidden">
        <LeafletMap
          venues={[]}
          heatPoints={heatPoints}
          city={city}
          activeLayer={activeLayer}
        />

        {/* Top info pill */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2.5 bg-[#161618]/88 backdrop-blur-xl border border-white/8 rounded-full px-3.5 py-1.5 whitespace-nowrap">
          <span className="text-[0.65rem] font-bold text-white">{CITY_LABELS[city]}</span>
          <span className="w-[5px] h-[5px] rounded-full bg-white/20" />
          <span className="text-[0.6rem] font-semibold text-white/45">
            {heatPoints.length} venues
          </span>
          {totalSwipes > 0 && (
            <>
              <span className="w-[5px] h-[5px] rounded-full bg-white/20" />
              <span className="text-[0.6rem] font-semibold text-purple-400">
                {totalSwipes.toLocaleString()} swipes
              </span>
            </>
          )}
          {loading && (
            <div className="w-3 h-3 border border-purple-500 border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {/* Controls overlay */}
        <div className="absolute top-12 left-0 right-0 z-10 px-3.5 flex flex-col gap-2">
          {/* City toggle */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {(['austin','monterrey','atlanta','nyc','dallas','miami','cdmx','chicago','la','houston'] as City[]).map(c => (
              <button
                key={c}
                onClick={() => setCity(c)}
                className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-[0.6rem] font-bold whitespace-nowrap transition-all backdrop-blur-xl border ${
                  city === c
                    ? 'bg-gradient-to-r from-purple-500/25 to-pink-500/25 border-purple-500/50 text-white'
                    : 'bg-[#161618]/86 border-white/10 text-white/55'
                }`}
              >
                {CITY_SHORT[c]}
              </button>
            ))}
          </div>

          {/* Layer toggle */}
          <div className="flex gap-1.5">
            {(['popularity', 'dashi'] as Layer[]).map(l => (
              <button
                key={l}
                onClick={() => setActiveLayer(l)}
                className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-[0.6rem] font-bold whitespace-nowrap transition-all backdrop-blur-xl border ${
                  activeLayer === l
                    ? 'bg-gradient-to-r from-purple-500/25 to-pink-500/25 border-purple-500/50 text-white'
                    : 'bg-[#161618]/86 border-white/10 text-white/55'
                }`}
              >
                {l === 'popularity' ? 'Popularity' : 'Dashi Picks'}
              </button>
            ))}
          </div>
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
            <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* What's Hot section */}
      <div className="flex-1 overflow-hidden flex flex-col bg-[#0d0d0f] border-t border-white/6">
        <div className="flex items-center gap-2.5 px-4 py-3 flex-shrink-0">
          <h2 className="text-[0.9rem] font-extrabold tracking-[-0.02em]">
            {activeLayer === 'dashi' ? "Dashi's Top Picks" : "What's Hot Tonight"}
          </h2>
          <span className="bg-orange-500/15 border border-orange-500/30 rounded-md px-1.5 py-0.5 text-[0.52rem] font-black tracking-[0.08em] text-orange-400">
            {activeLayer === 'dashi' ? 'PICKS' : 'HOT'}
          </span>
        </div>

        {!LIVE_CITIES.has(city) ? (
          <div className="flex flex-col items-center justify-center py-10 px-8 text-center">
            <div className="text-3xl mb-3">🚧</div>
            <p className="text-white font-bold text-base mb-1">Coming Soon</p>
            <p className="text-white/40 text-xs">Map data for this city is on the way!</p>
          </div>
        ) : topVenues.length === 0 && !loading ? (
          <div className="px-4 pb-4 text-[0.7rem] text-white/30">
            {activeLayer === 'dashi'
              ? 'Dashi data grows as more users swipe. Check back soon.'
              : 'No venue data for this city yet.'}
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto px-4 pb-4 no-scrollbar flex-shrink-0">
            {topVenues.map((v, i) => (
              <div
                key={v.name ?? i}
                className="w-[140px] h-[130px] rounded-2xl overflow-hidden relative flex-shrink-0 cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 to-pink-900/40" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/88 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-2.5">
                  <p className="text-[0.72rem] font-extrabold leading-[1.2] mb-0.5">{v.name ?? 'Venue'}</p>
                  <p className="text-[0.56rem] text-white/55 font-medium">
                    {activeLayer === 'dashi' ? 'Dashi Pick' : 'Popular Spot'}
                  </p>
                </div>
                {/* Weight bar */}
                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-full px-1.5 py-0.5">
                  <span className="text-[0.48rem] font-black text-orange-400">
                    {Math.round(v.weight * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
