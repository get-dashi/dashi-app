'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import type { Venue } from '@/lib/types'
import { getMichelinTier } from '@/lib/venues'

interface SwipeCardProps {
  venue: Venue
  position: 'top' | 'second' | 'third'
  style?: React.CSSProperties
  onRef?: (el: HTMLDivElement | null) => void
}

const photoCache: Record<string, string | null> = {}

function useVenuePhoto(venue: Venue) {
  const isGeneric = venue.img.includes('unsplash.com')
  const cacheKey = `${venue.name}|${venue.city ?? 'austin'}`
  const [imgSrc, setImgSrc] = useState(venue.img)

  useEffect(() => {
    if (!isGeneric) return
    if (cacheKey in photoCache) {
      if (photoCache[cacheKey]) setImgSrc(photoCache[cacheKey]!)
      return
    }
    fetch(`/api/venue-photo?q=${encodeURIComponent(venue.name)}&city=${venue.city ?? 'austin'}&v=3`)
      .then(r => r.json())
      .then(({ imgUrl }: { imgUrl: string | null }) => {
        photoCache[cacheKey] = imgUrl
        if (imgUrl) setImgSrc(imgUrl)
      })
      .catch(() => { photoCache[cacheKey] = null })
  }, [venue.name, venue.city, isGeneric, cacheKey])

  return imgSrc
}

export function V2SwipeCard({ venue, position, style, onRef }: SwipeCardProps) {
  const michelinTier = getMichelinTier(venue.name)
  const imgSrc = useVenuePhoto(venue)

  const positionStyles: Record<string, React.CSSProperties> = {
    top:    { zIndex: 10, transform: 'scale(1) translateY(0px)' },
    second: { zIndex: 9,  transform: 'scale(0.96) translateY(14px)' },
    third:  { zIndex: 8,  transform: 'scale(0.92) translateY(28px)' },
  }

  return (
    <div
      ref={onRef}
      className="absolute select-none touch-none"
      style={{
        // Fill the entire container — consistent height for every card
        inset: 0,
        borderRadius: 28,
        overflow: 'hidden',
        boxShadow: '0 24px 72px rgba(0,0,0,0.75)',
        transformOrigin: 'bottom center',
        // Always transition — so second→top animates smoothly.
        // The drag handler overrides this with el.style.transition='none' during drags.
        transition: 'transform 0.32s cubic-bezier(0.25,0.46,0.45,0.94)',
        cursor: position === 'top' ? 'grab' : 'default',
        ...positionStyles[position],
        ...style,
      }}
    >
      {/* ── Full-bleed background photo ── */}
      <Image
        src={imgSrc}
        alt={venue.name}
        fill
        className="object-cover pointer-events-none"
        sizes="390px"
        priority={position === 'top'}
        unoptimized={imgSrc.includes('googleapis.com')}
      />

      {/* ── Gradient overlays ── */}
      {/* Top fade for readability of badges */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 35%)' }} />
      {/* Bottom fade for content */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.75) 30%, rgba(0,0,0,0.3) 55%, transparent 75%)' }} />

      {/* ── SAVE / PASS stamps ── */}
      <div className="like-stamp absolute top-10 left-5 z-20 pointer-events-none"
        style={{ border: '2.5px solid #7C3AED', color: '#7C3AED', fontSize: '1rem', fontWeight: 900, letterSpacing: '0.1em', padding: '6px 14px', borderRadius: 10, opacity: 0, transform: 'rotate(-12deg)', textShadow: '0 0 20px rgba(124,58,237,0.5)' }}>
        SAVE ♥
      </div>
      <div className="nope-stamp absolute top-10 right-5 z-20 pointer-events-none"
        style={{ border: '2.5px solid #FF375F', color: '#FF375F', fontSize: '1rem', fontWeight: 900, letterSpacing: '0.1em', padding: '6px 14px', borderRadius: 10, opacity: 0, transform: 'rotate(12deg)' }}>
        PASS ✕
      </div>

      {/* ── Top-left badges ── */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
        {venue.featured && !michelinTier && (
          <span className="text-[0.52rem] font-black tracking-[0.1em] uppercase px-2.5 py-1.5 rounded-[8px]"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)', color: '#fff' }}>
            Featured
          </span>
        )}
        {venue.glutenFree && (
          <span className="text-[0.52rem] font-black tracking-[0.08em] uppercase px-2.5 py-1.5 rounded-[8px]"
            style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)', color: '#4ade80' }}>
            GF
          </span>
        )}
      </div>

      {/* ── Top-right badges ── */}
      <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-1.5">
        {michelinTier && (
          <div className="flex items-center gap-1.5 rounded-[8px] px-2.5 py-1.5"
            style={{
              background: michelinTier === 'star' ? 'rgba(127,29,29,0.7)' : michelinTier === 'bib' ? 'rgba(120,53,15,0.7)' : 'rgba(30,30,40,0.75)',
              border: `1px solid ${michelinTier === 'star' ? 'rgba(239,68,68,0.5)' : michelinTier === 'bib' ? 'rgba(249,115,22,0.4)' : 'rgba(255,255,255,0.2)'}`,
              backdropFilter: 'blur(12px)',
            }}>
            <span style={{ fontSize: michelinTier === 'star' ? '0.85rem' : '0.7rem', color: michelinTier === 'star' ? '#f87171' : michelinTier === 'bib' ? '#fb923c' : 'rgba(255,255,255,0.6)' }}>
              {michelinTier === 'star' ? '★' : michelinTier === 'bib' ? 'Ⓑ' : '●'}
            </span>
            <span style={{ fontSize: '0.48rem', fontWeight: 800, letterSpacing: '0.09em', textTransform: 'uppercase', color: michelinTier === 'star' ? '#fca5a5' : michelinTier === 'bib' ? '#fdba74' : 'rgba(255,255,255,0.55)' }}>
              {michelinTier === 'star' ? 'Michelin ★ 2025' : michelinTier === 'bib' ? 'Bib Gourmand' : 'Recommended'}
            </span>
          </div>
        )}
        {venue.karaoke && (
          <div className="flex items-center gap-1 rounded-[8px] px-2.5 py-1.5"
            style={{ background: 'rgba(88,28,135,0.5)', border: '1px solid rgba(124,58,237,0.4)', backdropFilter: 'blur(12px)' }}>
            <span style={{ fontSize: '0.65rem' }}>🎤</span>
            <span style={{ fontSize: '0.48rem', fontWeight: 800, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#c4b5fd' }}>Karaoke</span>
          </div>
        )}
      </div>

      {/* ── Bottom content — pinned to bottom of card ── */}
      <div className="absolute bottom-0 left-0 right-0 z-10" style={{ padding: '0 20px 20px' }}>

        {/* Tags */}
        <div className="flex gap-1.5 flex-wrap mb-2">
          {venue.tags.slice(0, 3).map(tag => (
            <span key={tag} style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', borderRadius: 100, padding: '3px 10px', fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)' }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Name */}
        <h2 style={{ fontSize: '1.45rem', fontWeight: 900, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: 5 }}>
          {venue.name}
        </h2>

        {/* Meta */}
        <div className="flex items-center gap-2 mb-3" style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.68rem' }}>
          <span>{venue.type}</span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', display: 'inline-block' }} />
          <span>{venue.dist}</span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', display: 'inline-block' }} />
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#FFD60A', fontWeight: 700 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#FFD60A"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            {venue.rating}
          </span>
        </div>

        {/* Curator note */}
        {venue.curatorNote && (
          <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, marginBottom: 10 }} className="line-clamp-2">
            <span style={{ fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>Ricky: </span>
            {venue.curatorNote}
          </p>
        )}

        {/* Live chips */}
        {venue.liveStatus && venue.liveStatus.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mb-2">
            {venue.liveStatus.map((chip, i) => (
              <span key={i} style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', borderRadius: 100, padding: '3px 9px', fontSize: '0.52rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' }}>
                {chip}
              </span>
            ))}
          </div>
        )}

        {/* Happy Hour */}
        {venue.happyHour && (
          <div style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.35)', borderRadius: 10, padding: '7px 12px', fontSize: '0.62rem', fontWeight: 700, color: '#fb923c', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ background: '#f97316', color: '#000', fontSize: '0.42rem', fontWeight: 900, padding: '2px 6px', borderRadius: 4, letterSpacing: '0.1em' }}>HH</span>
            {venue.happyHour}
          </div>
        )}

        {/* Reserve CTA */}
        {venue.bookingPlatform && (
          <a
            href={venue.bookingPlatform === 'resy' ? `https://resy.com/cities/austin/venues/${venue.bookingId ?? ''}` : '#'}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-[12px] transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)', color: '#fff', fontWeight: 800, fontSize: '0.8rem', height: 44, boxShadow: '0 6px 20px rgba(124,58,237,0.4)' }}
            onClick={e => e.stopPropagation()}
          >
            Reserve on {venue.bookingPlatform === 'resy' ? 'Resy' : venue.bookingPlatform === 'opentable' ? 'OpenTable' : 'SevenRooms'}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7"/><path d="M7 7h10v10"/>
            </svg>
          </a>
        )}
      </div>

      {/* ── Heart button — always bottom-right above content ── */}
      <button
        className="absolute z-20 transition-all active:scale-90"
        style={{
          bottom: venue.bookingPlatform ? 76 : 20,
          right: 20,
          width: 44, height: 44, borderRadius: '50%',
          background: 'rgba(236,72,153,0.2)',
          border: '1.5px solid rgba(236,72,153,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(12px)',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>
    </div>
  )
}
