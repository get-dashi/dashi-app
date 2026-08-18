'use client'

import { useSaves } from '@/contexts/SavesContext'
import { GradientButton } from '@/components/v2/GradientButton'
import { useRouter } from 'next/navigation'

// Fallback placeholder venues for demo
const DEMO_SAVED = [
  { id: 'suerte', name: 'Suerte', type: 'Upscale Mexican', dist: '1.1 mi', rating: '4.8', img: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=200&q=75', tags: ['Mexican', 'Upscale'] },
  { id: 'hestia', name: 'Hestia', type: 'Wood-Fire Kitchen', dist: '0.8 mi', rating: '4.8', img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&q=75', tags: ['American', 'Wood-Fire'] },
  { id: 'uchi', name: 'Uchi Austin', type: 'Upscale Japanese', dist: '1.2 mi', rating: '4.6', img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=200&q=75', tags: ['Japanese', 'Omakase'] },
]

export default function V2SavedPage() {
  const { savedVenues, unsaveVenue } = useSaves()
  const router = useRouter()

  const display = savedVenues.length > 0 ? savedVenues : DEMO_SAVED as typeof savedVenues

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: '#09090B' }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex-shrink-0 flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.03em' }}>Saved</h1>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{display.length} places</p>
        </div>
        {display.length > 0 && (
          <GradientButton size="sm" onClick={() => router.push('/v2/groups/weekend-crew/plan')}>
            Plan with These ✨
          </GradientButton>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 no-scrollbar">
        {display.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div style={{ fontSize: '3rem' }}>💖</div>
            <p style={{ fontSize: '1rem', fontWeight: 800 }}>Nothing saved yet</p>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Heart venues while exploring to save them here</p>
            <GradientButton onClick={() => router.push('/v2')}>Start Exploring</GradientButton>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pt-2">
            {display.map((venue, i) => (
              <div
                key={venue.id ?? i}
                className="flex items-center gap-3.5 rounded-[18px] p-3.5 transition-all"
                style={{ background: '#151518', border: '1px solid #25252B' }}
              >
                {/* Thumbnail */}
                <div style={{ width: 64, height: 64, borderRadius: 14, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={venue.img}
                    alt={venue.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: 2 }}>{venue.name}</p>
                  <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>
                    {(venue as typeof DEMO_SAVED[0]).type} · {(venue as typeof DEMO_SAVED[0]).dist}
                  </p>
                  <div className="flex gap-1.5 mt-1.5">
                    {((venue as typeof DEMO_SAVED[0]).tags ?? []).slice(0, 2).map((tag: string) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: '0.52rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 100,
                          background: 'rgba(124,58,237,0.15)',
                          border: '1px solid rgba(124,58,237,0.25)',
                          color: 'rgba(168,85,247,0.8)',
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Heart (remove) */}
                <button
                  onClick={() => unsaveVenue(venue.id)}
                  style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: 'rgba(236,72,153,0.15)',
                    border: '1.5px solid rgba(236,72,153,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', flexShrink: 0,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#EC4899" stroke="#EC4899" strokeWidth="0">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
