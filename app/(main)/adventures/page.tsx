'use client'

import { useState } from 'react'
import { useSaves } from '@/contexts/SavesContext'
import { useVisits } from '@/contexts/VisitsContext'
import { getMichelinTier } from '@/lib/venues'
import type { Venue } from '@/lib/types'

type Tab = 'saved' | 'visited'

function VenueRow({ venue, visited, onToggleVisit }: { venue: Venue; visited: boolean; onToggleVisit: () => void }) {
  const tier = getMichelinTier(venue.name)
  return (
    <div className="flex items-center gap-3 bg-[#161618] rounded-[16px] border border-white/6 p-3">
      <img
        src={venue.img}
        alt={venue.name}
        className="w-[52px] h-[52px] rounded-[12px] object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <p className="text-[0.85rem] font-extrabold truncate">{venue.name}</p>
          {tier === 'star' && <span className="text-[0.55rem] font-black text-red-400 flex-shrink-0">★</span>}
          {tier === 'bib' && <span className="text-[0.55rem] font-black text-orange-400 flex-shrink-0">Ⓑ</span>}
        </div>
        <p className="text-[0.6rem] text-white/40 truncate mb-1">{venue.type} · {venue.dist}</p>
        {venue.happyHour && (
          <p className="text-[0.58rem] font-bold text-purple-400 truncate">{venue.happyHour}</p>
        )}
        {venue.liveStatus && venue.liveStatus.length > 0 && (
          <div className="flex gap-1 flex-wrap mt-0.5">
            {venue.liveStatus.map((s, i) => (
              <span key={i} className="text-[0.48rem] font-black uppercase tracking-wider bg-white/8 px-1.5 py-0.5 rounded-full text-white/60">{s}</span>
            ))}
          </div>
        )}
      </div>
      <button
        onClick={onToggleVisit}
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
        style={{
          background: visited ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${visited ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.1)'}`,
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke={visited ? '#22c55e' : 'rgba(255,255,255,0.3)'}
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </button>
    </div>
  )
}

export default function AdventuresPage() {
  const { savedVenues } = useSaves()
  const { isVisited, markVisited, unmarkVisited, visitedVenues } = useVisits()
  const [tab, setTab] = useState<Tab>('saved')

  const displayVenues: Venue[] = tab === 'saved' ? savedVenues : visitedVenues

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#0d0d0f]">
      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-5 pb-3" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
        <h1 className="text-[1.3rem] font-black tracking-[-0.03em] mb-4">Plans</h1>

        {/* Tabs */}
        <div className="flex gap-2 bg-white/5 rounded-[14px] p-1">
          {([['saved', 'Saved'], ['visited', 'Been There']] as [Tab, string][]).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="flex-1 py-2 rounded-[10px] text-[0.72rem] font-extrabold transition-all"
              style={tab === id ? {
                background: 'linear-gradient(to right, #a855f7, #ec4899)',
                color: 'white',
              } : {
                background: 'transparent',
                color: 'rgba(255,255,255,0.4)',
              }}
            >
              {label}
              {id === 'saved' && savedVenues.length > 0 && (
                <span className="ml-1.5 text-[0.6rem] opacity-70">{savedVenues.length}</span>
              )}
              {id === 'visited' && visitedVenues.length > 0 && (
                <span className="ml-1.5 text-[0.6rem] opacity-70">{visitedVenues.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-5 pb-8 no-scrollbar">
        {displayVenues.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-1">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                {tab === 'saved'
                  ? <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                  : <><polyline points="20 6 9 17 4 12"/></>}
              </svg>
            </div>
            <p className="text-white/40 text-[0.85rem] font-semibold">
              {tab === 'saved' ? 'Nothing saved yet' : 'No visits logged yet'}
            </p>
            <p className="text-white/25 text-[0.72rem]">
              {tab === 'saved'
                ? 'Swipe right on venues you want to go to'
                : 'Check off saved venues once you\'ve been'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 pt-1">
            {displayVenues.map(venue => (
              <VenueRow
                key={venue.id}
                venue={venue}
                visited={isVisited(venue.id)}
                onToggleVisit={() => isVisited(venue.id) ? unmarkVisited(venue.id) : markVisited(venue)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
