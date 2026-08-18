'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type GuideTab = 'mine' | 'shared' | 'favorites'

const MY_GUIDES = [
  { id: 'austin-rooftops',  name: 'Austin Rooftop Bars',      count: 12, updated: '2d ago',  vis: 'Published', saves: '4.3K', rating: '4.7', img: 'https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=120&q=70' },
  { id: 'rooftop-drinks',   name: 'Rooftop Drinks',            count: 18, updated: '1w ago',  vis: 'Shared',    saves: '892',  rating: '4.5', img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=120&q=70' },
  { id: 'brunch-favorites', name: 'Brunch Favorites',          count: 15, updated: '3d ago',  vis: 'Private',   saves: null,   rating: null,  img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=120&q=70' },
  { id: 'best-sushi',       name: 'Best Sushi in Austin',      count: 9,  updated: '5d ago',  vis: 'Published', saves: '1.2K', rating: '4.8', img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=120&q=70' },
  { id: 'live-music',       name: 'Live Music Nights',         count: 20, updated: '1w ago',  vis: 'Shared',    saves: '341',  rating: '4.6', img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=120&q=70' },
]
const SHARED_GUIDES = [
  { id: 'sofias-tacos', name: "Sofia's Taco Spots", count: 8, updated: '4d ago', vis: 'Shared', saves: '621', rating: '4.7', img: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=120&q=70' },
  { id: 'sarahs-date',  name: 'Austin Date Night Spots', count: 15, updated: '2w ago', vis: 'Published', saves: '2.1K', rating: '4.8', img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=120&q=70' },
]

const VIS_STYLE = {
  Published: { icon: '🌐', color: '#a78bfa', bg: 'rgba(124,58,237,0.12)', border: 'rgba(124,58,237,0.3)' },
  Private:   { icon: '🔒', color: 'rgba(255,255,255,0.35)', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' },
  Shared:    { icon: '🔗', color: 'rgba(236,72,153,0.85)', bg: 'rgba(236,72,153,0.1)', border: 'rgba(236,72,153,0.25)' },
} as const

export default function GuidesPage() {
  const router = useRouter()
  const [tab, setTab] = useState<GuideTab>('mine')

  const guides = tab === 'mine' ? MY_GUIDES : tab === 'shared' ? SHARED_GUIDES : MY_GUIDES.filter(g => g.vis !== 'Private')

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: '#09090B' }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-0 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.03em' }}>My Guides</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/v2/guides/discover')}
              style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
            <button style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 mb-4 rounded-full p-1" style={{ background: '#151518', border: '1px solid #25252B', width: 'fit-content' }}>
          {([['mine','My Guides'],['shared','Shared'],['favorites','Favorites']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              style={{
                borderRadius: 100, padding: '6px 16px',
                background: tab === key ? 'linear-gradient(135deg,#7C3AED,#EC4899)' : 'none',
                color: tab === key ? '#fff' : 'rgba(255,255,255,0.45)',
                fontSize: '0.72rem', fontWeight: 700, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* Create New Guide */}
        <button
          onClick={() => router.push('/v2/guides/create')}
          className="w-full flex items-center justify-center gap-2 rounded-[14px] py-3.5 mb-4 transition-all active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg,#7C3AED,#EC4899)', border: 'none', cursor: 'pointer', boxShadow: '0 6px 20px rgba(124,58,237,0.4)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fff' }}>Create New Guide</span>
        </button>
      </div>

      {/* Guide list */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 no-scrollbar">
        <div className="flex flex-col gap-2.5">
          {guides.map(guide => {
            const vs = VIS_STYLE[guide.vis as keyof typeof VIS_STYLE]
            return (
              <button
                key={guide.id}
                onClick={() => router.push(`/v2/guides/${guide.id}`)}
                className="w-full text-left flex items-center gap-3.5 rounded-[18px] p-3.5 transition-all active:scale-[0.98]"
                style={{ background: '#151518', border: '1px solid #25252B', cursor: 'pointer' }}
              >
                {/* Thumb */}
                <div style={{ width: 62, height: 62, borderRadius: 14, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={guide.img} alt={guide.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {guide.vis === 'Published' && (
                    <div style={{ position: 'absolute', bottom: 4, left: 4, background: 'rgba(124,58,237,0.85)', borderRadius: 4, padding: '1px 5px', fontSize: '0.42rem', fontWeight: 900, color: '#fff', letterSpacing: '0.06em' }}>LIVE</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: '0.88rem', fontWeight: 800, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{guide.name}</p>
                  <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.38)', marginBottom: 5 }}>
                    {guide.count} places · Updated {guide.updated}
                  </p>
                  <div className="flex items-center gap-2">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: vs.bg, border: `1px solid ${vs.border}`, borderRadius: 100, padding: '2px 8px', fontSize: '0.52rem', fontWeight: 700, color: vs.color }}>
                      {vs.icon} {guide.vis}
                    </span>
                    {guide.saves && (
                      <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.35)' }}>
                        {guide.saves} saves
                      </span>
                    )}
                    {guide.rating && (
                      <span style={{ fontSize: '0.58rem', color: '#FFD60A', fontWeight: 700 }}>★ {guide.rating}</span>
                    )}
                  </div>
                </div>

                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2" strokeLinecap="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            )
          })}

          {/* Discover separator */}
          <div className="flex items-center gap-3 mt-2 mb-1">
            <div style={{ flex: 1, height: 1, background: '#25252B' }} />
            <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)', fontWeight: 600 }}>COMMUNITY</span>
            <div style={{ flex: 1, height: 1, background: '#25252B' }} />
          </div>

          {/* Discover CTA */}
          <button
            onClick={() => router.push('/v2/guides/discover')}
            className="w-full flex items-center gap-3.5 rounded-[18px] p-4 transition-all active:scale-[0.98]"
            style={{ background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.22)', cursor: 'pointer' }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(168,85,247,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <div className="flex-1">
              <p style={{ fontSize: '0.88rem', fontWeight: 800, color: '#c4b5fd' }}>Discover Guides</p>
              <p style={{ fontSize: '0.63rem', color: 'rgba(168,85,247,0.55)' }}>Trending · Nearby · Curated by locals</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(168,85,247,0.4)" strokeWidth="2" strokeLinecap="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
