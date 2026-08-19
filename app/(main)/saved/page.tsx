'use client'

import { useState } from 'react'
import { useSaves } from '@/contexts/SavesContext'
import { useRouter } from 'next/navigation'

export default function SavedPage() {
  const { savedVenues, unsaveVenue } = useSaves()
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function handleDelete(id: string) {
    setDeletingId(id)
    setTimeout(() => {
      unsaveVenue(id)
      setDeletingId(null)
    }, 260)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: '#09090B' }}>

      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex-shrink-0 flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.03em' }}>Saved</h1>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
            {savedVenues.length} {savedVenues.length === 1 ? 'place' : 'places'}
          </p>
        </div>
        {savedVenues.length > 0 && (
          <button
            onClick={() => router.push('/plans')}
            className="flex items-center gap-2 rounded-[12px] px-4 py-2.5 transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(124,58,237,0.4)' }}
          >
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fff' }}>Plan Night ✨</span>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 no-scrollbar">

        {savedVenues.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center pb-10">
            <div style={{ fontSize: '3.5rem' }}>💖</div>
            <p style={{ fontSize: '1.1rem', fontWeight: 900, letterSpacing: '-0.02em' }}>Nothing saved yet</p>
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, maxWidth: 240 }}>
              Swipe right on any venue to save it here
            </p>
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 rounded-full px-6 py-3 transition-all active:scale-95 mt-2"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)', border: 'none', cursor: 'pointer', boxShadow: '0 6px 20px rgba(124,58,237,0.4)' }}
            >
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fff' }}>Start Exploring</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 pt-1">
            {savedVenues.map((venue) => (
              <div
                key={venue.id}
                className="flex items-center gap-3.5 rounded-[18px] p-3.5 transition-all"
                style={{
                  background: '#151518',
                  border: '1px solid #25252B',
                  opacity: deletingId === venue.id ? 0 : 1,
                  transform: deletingId === venue.id ? 'translateX(60px) scale(0.95)' : 'none',
                  transition: 'opacity 0.25s ease, transform 0.25s ease',
                }}
              >
                {/* Thumbnail */}
                <div style={{ width: 64, height: 64, borderRadius: 14, overflow: 'hidden', flexShrink: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={venue.img} alt={venue.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {venue.name}
                  </p>
                  <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginBottom: 5 }}>
                    {venue.type} · {venue.dist}
                    {venue.rating && (
                      <span style={{ color: '#FFD60A', fontWeight: 700, marginLeft: 6 }}>★ {venue.rating}</span>
                    )}
                  </p>
                  <div className="flex gap-1.5 flex-wrap">
                    {(venue.tags ?? []).slice(0, 2).map((tag: string) => (
                      <span key={tag} style={{ fontSize: '0.52rem', fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)', color: 'rgba(168,85,247,0.8)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => handleDelete(venue.id)}
                  className="flex items-center justify-center rounded-full transition-all active:scale-90"
                  style={{ width: 38, height: 38, flexShrink: 0, background: 'rgba(239,68,68,0.1)', border: '1.5px solid rgba(239,68,68,0.3)', cursor: 'pointer' }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6"/><path d="M14 11v6"/>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
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
