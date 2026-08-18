'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type DiscoverTab = 'trending' | 'nearby' | 'saved' | 'new'

const GUIDES = [
  { id: 'sarahs-date',    name: 'Austin Date Night Spots', author: 'Sarah',  badge: 'Top Contributor', saves: '2.1K', rating: '4.8', img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=120&q=70', trending: true },
  { id: 'hidden-speak',   name: 'Hidden Speakeasies',      author: 'Mike',   badge: 'Cocktail Expert', saves: '1.4K', rating: '4.9', img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=120&q=70', trending: false },
  { id: 'michelin-favs',  name: 'Michelin Favorites',      author: 'Jenny',  badge: null,              saves: '3.2K', rating: '4.7', img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=120&q=70', trending: true },
  { id: 'best-brunch',    name: 'Best Brunch in Austin',   author: 'Alex',   badge: 'Top Contributor', saves: '1.8K', rating: '4.6', img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=120&q=70', trending: false },
  { id: 'live-legends',   name: 'Live Music Legends',      author: 'Chris',  badge: 'Music Lover',     saves: '1.2K', rating: '4.5', img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=120&q=70', trending: false },
  { id: 'austin-rooftops','name': 'Austin Rooftop Bars',   author: 'Ricky',  badge: 'Top Austin Foodie',saves: '4.3K',rating: '4.7', img: 'https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=120&q=70', trending: true },
]

export default function DiscoverGuidesPage() {
  const router = useRouter()
  const [tab, setTab] = useState<DiscoverTab>('trending')
  const [search, setSearch] = useState('')

  const filtered = GUIDES.filter(g =>
    !search || g.name.toLowerCase().includes(search.toLowerCase()) || g.author.toLowerCase().includes(search.toLowerCase())
  )
  const displayed = tab === 'trending' ? filtered.filter(g => g.trending) : filtered
  const sorted = tab === 'saved' ? [...displayed].sort((a,b) => parseFloat(b.saves) - parseFloat(a.saves)) : displayed

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: '#09090B' }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex-shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '-0.02em' }}>Discover Guides</h1>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 rounded-[14px] px-4 mb-4" style={{ height: 46, background: '#151518', border: '1px solid #25252B' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search guides, people, or places"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 outline-none"
            style={{ background: 'none', border: 'none', color: '#fff', fontSize: '0.85rem', fontWeight: 500 }}
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 pb-1">
          {([['trending','Trending'],['nearby','Nearby'],['saved','Most Saved'],['new','New']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className="flex-shrink-0 rounded-full px-4 py-2 transition-all"
              style={{
                background: tab === key ? 'linear-gradient(135deg,#7C3AED,#EC4899)' : '#151518',
                border: tab === key ? 'none' : '1px solid #25252B',
                color: tab === key ? '#fff' : 'rgba(255,255,255,0.5)',
                fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                boxShadow: tab === key ? '0 4px 14px rgba(124,58,237,0.35)' : 'none',
              }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Guide cards */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 no-scrollbar">
        <div className="flex flex-col gap-3 pt-1">
          {sorted.map(guide => (
            <button
              key={guide.id}
              onClick={() => router.push(`/guides/${guide.id}`)}
              className="w-full text-left rounded-[20px] overflow-hidden transition-all active:scale-[0.98]"
              style={{ background: '#151518', border: '1px solid #25252B', cursor: 'pointer' }}
            >
              <div className="flex items-center gap-3.5 p-3.5">
                {/* Thumb */}
                <div style={{ width: 72, height: 72, borderRadius: 14, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={guide.img} alt={guide.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {guide.trending && (
                    <div style={{ position: 'absolute', top: 4, left: 4, background: 'rgba(249,115,22,0.9)', borderRadius: 4, padding: '1px 5px', fontSize: '0.4rem', fontWeight: 900, color: '#fff' }}>🔥</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{guide.name}</p>
                  <div className="flex items-center gap-1.5 mb-3">
                    <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.45)' }}>by {guide.author}</span>
                    {guide.badge && (
                      <>
                        <span style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.2)' }}>·</span>
                        <span style={{ fontSize: '0.58rem', fontWeight: 700, color: '#EC4899' }}>{guide.badge}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#FFD60A' }}>★ {guide.rating}</span>
                    <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)' }}>{guide.saves} saves</span>
                  </div>
                </div>

                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
