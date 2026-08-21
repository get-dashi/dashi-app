'use client'
import { useState } from 'react'
import { getBookingUrl, getBookingLabel, getBookingColor } from '@/lib/booking'
import type { Venue } from '@/lib/types'

interface BookButtonProps {
  venue: Venue
  partySize?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function BookButton({ venue, partySize = 2, size = 'md', className = '' }: BookButtonProps) {
  const [loading, setLoading] = useState(false)
  const url = getBookingUrl(venue, partySize)
  if (!url && !venue.bookingPlatform) return null

  const label = getBookingLabel(venue.bookingPlatform)
  const color = getBookingColor(venue.bookingPlatform)

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-[0.58rem]',
    md: 'px-4 py-2 text-[0.68rem]',
    lg: 'px-5 py-3 text-[0.78rem]',
  }

  const handleBook = () => {
    if (!url) return
    setLoading(true)

    // Fire-and-forget click tracking — never delays the booking
    fetch('/api/booking-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        venueId:   venue.id,
        venueName: venue.name,
        platform:  venue.bookingPlatform,
        city:      venue.city ?? 'austin',
      }),
    }).catch(() => {})

    if (venue.bookingPlatform === 'phone') {
      window.location.href = url
    } else {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
    setTimeout(() => setLoading(false), 1500)
  }

  return (
    <button
      onClick={handleBook}
      disabled={loading || !url}
      className={`rounded-xl font-bold tracking-[-0.01em] transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5 ${sizeClasses[size]} ${className}`}
      style={{ backgroundColor: `${color}20`, border: `1px solid ${color}50`, color }}
    >
      {/* Platform indicator dot */}
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      {loading ? 'Opening...' : label}
    </button>
  )
}
