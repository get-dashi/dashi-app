'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import type { Venue } from '@/lib/types'
import { getMichelinTier } from '@/lib/venues'
import { BookButton } from '@/components/booking/BookButton'

interface SwipeCardProps {
  venue: Venue
  position: 'top' | 'second' | 'third'
  venueIndex: number
  style?: React.CSSProperties
  onRef?: (el: HTMLDivElement | null) => void
}

// Simple in-memory cache so we don't re-fetch the same venue photo
const photoCache: Record<string, string | null> = {}

function useVenuePhoto(venue: Venue) {
  const isGeneric = venue.img.includes('unsplash.com')
  const cacheKey = `${venue.name}|${venue.city ?? 'austin'}`

  const [imgSrc, setImgSrc] = useState(venue.img)

  useEffect(() => {
    if (!isGeneric) return // Already has a real photo (Google Places)
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
      .catch(() => {
        photoCache[cacheKey] = null
      })
  }, [venue.name, venue.city, isGeneric, cacheKey])

  return imgSrc
}

export function SwipeCard({ venue, position, venueIndex, style, onRef }: SwipeCardProps) {
  const michelinTier = getMichelinTier(venue.name)
  const imgSrc = useVenuePhoto(venue)

  const positionStyles = {
    top:    { zIndex: 10, transform: 'scale(1) translateY(0)' },
    second: { zIndex: 9,  transform: 'scale(0.96) translateY(16px)' },
    third:  { zIndex: 8,  transform: 'scale(0.92) translateY(32px)' },
  }

  return (
    <div
      ref={onRef}
      data-venue-index={venueIndex}
      className="absolute w-full rounded-[28px] overflow-hidden cursor-grab select-none touch-none"
      style={{
        ...positionStyles[position],
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        transformOrigin: 'bottom center',
        transition: 'transform 0.08s ease',
        ...style,
      }}
    >
      {/* Like/Nope stamps */}
      <div className="like-stamp absolute top-10 left-5 z-20 border-[3px] border-green-400 text-green-400 text-lg font-black tracking-wider px-4 py-2 rounded-lg opacity-0 pointer-events-none" style={{ transform: 'rotate(-12deg)' }}>
        SAVE
      </div>
      <div className="nope-stamp absolute top-10 right-5 z-20 border-[3px] border-red-400 text-red-400 text-lg font-black tracking-wider px-4 py-2 rounded-lg opacity-0 pointer-events-none" style={{ transform: 'rotate(12deg)' }}>
        PASS
      </div>

      {/* Featured badge — shows for featured venues unless they have a Star or Bib badge */}
      {venue.featured && michelinTier !== 'star' && michelinTier !== 'bib' && (
        <div className="absolute top-3.5 left-3.5 z-[15] bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[0.52rem] font-black tracking-[0.1em] uppercase px-2.5 py-1.5 rounded-lg">
          Featured
        </div>
      )}

      {/* Michelin badge — Star and Bib only; Recommended tier intentionally excluded */}
      {(michelinTier === 'star' || michelinTier === 'bib') && (
        <div className={`absolute top-3.5 right-3.5 z-[15] flex flex-col items-center rounded-[10px] px-2.5 py-1.5 border ${
          michelinTier === 'star'        ? 'bg-red-900/40 border-red-500/50'
          : michelinTier === 'bib'       ? 'bg-orange-900/35 border-orange-500/40'
          :                               'bg-neutral-800/70 border-white/20'
        }`}>
          <span className={`font-black leading-none ${
            michelinTier === 'star'        ? 'text-[0.95rem] text-red-400'
            : michelinTier === 'bib'       ? 'text-[0.75rem] text-orange-400 italic'
            :                               'text-[0.65rem] text-white/70'
          }`}>
            {michelinTier === 'star' ? '★' : michelinTier === 'bib' ? 'B' : 'M'}
          </span>
          <span className="text-[0.38rem] font-black tracking-[0.1em] uppercase text-white/80 mt-0.5 whitespace-nowrap">
            {michelinTier === 'star' ? 'Michelin' : michelinTier === 'bib' ? 'Bib Gourmand' : 'Recommended'}
          </span>
        </div>
      )}

      {/* Image */}
      <div className="relative w-full h-[420px]">
        <Image
          src={imgSrc}
          alt={venue.name}
          fill
          className="object-cover pointer-events-none transition-opacity duration-500"
          sizes="(max-width: 420px) 100vw, 390px"
          priority={position === 'top'}
          unoptimized={imgSrc.includes('googleapis.com')}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)' }} />

        {/* Card body */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          {/* Tags */}
          <div className="flex gap-1.5 flex-wrap mb-2.5">
            {venue.tags.slice(0, 2).map(tag => (
              <span key={tag} className="bg-white/12 backdrop-blur-[10px] rounded-full px-2.5 py-1 text-[0.55rem] font-bold tracking-[0.06em] uppercase">
                {tag}
              </span>
            ))}
          </div>

          {/* Name */}
          <h2 className="text-[1.3rem] font-black tracking-[-0.02em] leading-[1.1] mb-1">{venue.name}</h2>

          {/* Meta */}
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-[0.65rem] text-white/60">{venue.type}</span>
            <span className="w-[3px] h-[3px] rounded-full bg-white/30" />
            <span className="text-[0.65rem] text-white/40">{venue.dist}</span>
            <span className="w-[3px] h-[3px] rounded-full bg-white/30" />
            <span className="flex items-center gap-1 text-[0.65rem] font-bold text-yellow-400">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#ffd60a"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              {venue.rating}
            </span>
          </div>

          {/* Description */}
          {venue.description && (
            <p className="text-[0.68rem] text-white/55 leading-[1.55] mb-2.5 line-clamp-2">{venue.description}</p>
          )}

          {/* Happy Hour */}
          {venue.happyHour && (
            <div className="bg-orange-500/15 border border-orange-500/40 rounded-[10px] px-3 py-2 text-[0.62rem] font-bold text-orange-400 flex items-center gap-1.5">
              <span className="bg-orange-500 text-black text-[0.45rem] font-black px-1.5 py-0.5 rounded tracking-wider">HH</span>
              {venue.happyHour}
            </div>
          )}

          {/* Recommendation count */}
          {(venue.recommendationCount ?? 0) > 0 && (
            <div className="mt-2">
              <span className="text-[0.55rem] font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {venue.recommendationCount} {venue.recommendationCount === 1 ? 'person' : 'people'} added this
              </span>
            </div>
          )}

          {/* Booking button */}
          {venue.bookingPlatform && (
            <div className="mt-2">
              <BookButton venue={venue} size="sm" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
