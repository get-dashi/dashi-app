'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { V2SwipeCard } from './SwipeCard'
import type { Venue } from '@/lib/types'

interface CardStackProps {
  venues: Venue[]
  onLike: (venue: Venue) => void
  onPass: (venue: Venue) => void
  onEmpty: () => void
  persistKey?: string
}

export function V2CardStack({ venues, onLike, onPass, onEmpty, persistKey }: CardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const cardRef = useRef<HTMLDivElement | null>(null)
  const dragOverlayRef = useRef<HTMLDivElement | null>(null)
  const startX = useRef(0)
  const startY = useRef(0)
  const currentX = useRef(0)
  const isHorizontalSwipe = useRef<boolean | null>(null)
  const historyRef = useRef<{ venue: Venue; action: 'like' | 'pass' }[]>([])
  const lsKey = persistKey ? `dashi_deck_${persistKey}` : null

  useEffect(() => {
    if (!lsKey) return
    try {
      const saved = parseInt(localStorage.getItem(lsKey) ?? '0', 10)
      if (saved > 0 && saved < venues.length) setCurrentIndex(saved)
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lsKey])

  useEffect(() => {
    if (!lsKey) return
    try { localStorage.setItem(lsKey, String(currentIndex)) } catch { /* ignore */ }
  }, [currentIndex, lsKey])

  const prevVenueCount = useRef(venues.length)
  useEffect(() => {
    if (venues.length !== prevVenueCount.current) {
      setCurrentIndex(0)
      historyRef.current = []
      prevVenueCount.current = venues.length
    }
  }, [venues])

  const applyTransform = useCallback((dx: number) => {
    const el = cardRef.current
    if (!el) return
    el.style.transform = `translateX(${dx}px) rotate(${dx * 0.06}deg) scale(1)`
    el.style.transition = 'none'
    const likeStamp = el.querySelector<HTMLElement>('.like-stamp')
    const nopeStamp = el.querySelector<HTMLElement>('.nope-stamp')
    const t = 60
    if (dx > 0) {
      if (likeStamp) likeStamp.style.opacity = String(Math.min(1, (dx - t / 2) / t))
      if (nopeStamp) nopeStamp.style.opacity = '0'
    } else {
      if (nopeStamp) nopeStamp.style.opacity = String(Math.min(1, (-dx - t / 2) / t))
      if (likeStamp) likeStamp.style.opacity = '0'
    }
  }, [])

  const snapBack = useCallback(() => {
    const el = cardRef.current
    if (!el) return
    el.style.transform = 'translateX(0) rotate(0deg) scale(1)'
    el.style.transition = 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)'
    el.querySelector<HTMLElement>('.like-stamp')!.style.opacity = '0'
    el.querySelector<HTMLElement>('.nope-stamp')!.style.opacity = '0'
  }, [])

  const flyOut = useCallback((direction: 'left' | 'right', venue: Venue) => {
    const el = cardRef.current
    if (!el) return
    const dx = direction === 'right' ? 520 : -520
    el.style.transform = `translateX(${dx}px) rotate(${direction === 'right' ? 22 : -22}deg) scale(0.95)`
    el.style.transition = 'transform 0.34s cubic-bezier(0.4,0,0.6,1)'
    setTimeout(() => {
      const action = direction === 'right' ? 'like' : 'pass'
      historyRef.current = [...historyRef.current, { venue, action }]
      if (direction === 'right') {
        onLike(venue)
        setLikedIds(prev => new Set(prev).add(venue.id))
      } else {
        onPass(venue)
      }
      setCurrentIndex(i => i + 1)
    }, 320)
  }, [onLike, onPass])

  // Programmatic like/pass for buttons
  const handleLikeClick = useCallback(() => {
    const venue = venues[currentIndex]
    if (!venue) return
    const el = cardRef.current
    if (el) {
      const likeStamp = el.querySelector<HTMLElement>('.like-stamp')
      if (likeStamp) likeStamp.style.opacity = '1'
    }
    flyOut('right', venue)
  }, [venues, currentIndex, flyOut])

  const handlePassClick = useCallback(() => {
    const venue = venues[currentIndex]
    if (!venue) return
    const el = cardRef.current
    if (el) {
      const nopeStamp = el.querySelector<HTMLElement>('.nope-stamp')
      if (nopeStamp) nopeStamp.style.opacity = '1'
    }
    flyOut('left', venue)
  }, [venues, currentIndex, flyOut])

  const handleRewind = useCallback(() => {
    if (historyRef.current.length === 0 || currentIndex === 0) return
    const last = historyRef.current[historyRef.current.length - 1]
    historyRef.current = historyRef.current.slice(0, -1)
    // If the last action was a like, remove from liked
    if (last.action === 'like') {
      setLikedIds(prev => { const s = new Set(prev); s.delete(last.venue.id); return s })
    }
    setCurrentIndex(i => i - 1)
  }, [currentIndex])

  // ── Native touch handlers (attached with passive:false so preventDefault works) ──
  const venueIndexRef = useRef(currentIndex)
  venueIndexRef.current = currentIndex
  const venuesRef = useRef(venues)
  venuesRef.current = venues

  useEffect(() => {
    const el = dragOverlayRef.current
    if (!el) return

    const handleTouchStart = (e: TouchEvent) => {
      startX.current = e.touches[0].clientX
      startY.current = e.touches[0].clientY
      currentX.current = 0
      isHorizontalSwipe.current = null
      setIsDragging(false)
    }

    const handleTouchMove = (e: TouchEvent) => {
      const dx = e.touches[0].clientX - startX.current
      const dy = e.touches[0].clientY - startY.current

      if (isHorizontalSwipe.current === null) {
        if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return
        isHorizontalSwipe.current = Math.abs(dx) > Math.abs(dy)
      }

      if (!isHorizontalSwipe.current) return

      // This actually works because listener is non-passive
      e.preventDefault()
      currentX.current = dx
      setIsDragging(true)
      applyTransform(dx)
    }

    const handleTouchEnd = () => {
      setIsDragging(false)
      const wasHorizontal = isHorizontalSwipe.current
      isHorizontalSwipe.current = null
      if (!wasHorizontal) return
      const venue = venuesRef.current[venueIndexRef.current]
      if (!venue) return
      if (currentX.current > 90) flyOut('right', venue)
      else if (currentX.current < -90) flyOut('left', venue)
      else snapBack()
    }

    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchmove',  handleTouchMove,  { passive: false })  // must be non-passive
    el.addEventListener('touchend',   handleTouchEnd,   { passive: true })

    return () => {
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchmove',  handleTouchMove)
      el.removeEventListener('touchend',   handleTouchEnd)
    }
  }, [applyTransform, flyOut, snapBack])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    startX.current = e.clientX
    currentX.current = 0
    setIsDragging(true)
    const handleMove = (ev: MouseEvent) => {
      currentX.current = ev.clientX - startX.current
      applyTransform(currentX.current)
    }
    const handleUp = () => {
      setIsDragging(false)
      const venue = venues[currentIndex]
      if (!venue) return
      if (currentX.current > 90) flyOut('right', venue)
      else if (currentX.current < -90) flyOut('left', venue)
      else snapBack()
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
  }, [venues, currentIndex, applyTransform, flyOut, snapBack])

  const visible = venues.slice(currentIndex, currentIndex + 3)
  const canRewind = historyRef.current.length > 0

  if (venues.length === 0 || currentIndex >= venues.length) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
        <div style={{ fontSize: '3rem' }}>✨</div>
        <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'rgba(255,255,255,0.85)' }}>You&apos;ve seen it all</p>
        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', maxWidth: 240 }}>
          Dashi is adding more spots. Check back soon or try a different vibe.
        </p>
        <button
          onClick={onEmpty}
          className="rounded-full px-6 py-3 text-sm font-bold transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)', color: '#fff', marginTop: 8 }}
        >
          Reset & Start Over
        </button>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 flex flex-col">

      {/* ── Card area ── */}
      <div className="flex-1 relative">
        {/* Back cards */}
        {visible.slice(1).reverse().map((venue, ri) => {
          const pos = (visible.length - 1 - ri) as 1 | 2
          return (
            <V2SwipeCard
              key={venue.id}
              venue={venue}
              position={(['second', 'third'] as const)[pos - 1]}
            />
          )
        })}

        {/* Top card */}
        {visible[0] && (
          <V2SwipeCard
            key={visible[0].id}
            venue={visible[0]}
            position="top"
            onRef={el => { cardRef.current = el }}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          />
        )}

        {/* Drag overlay — touch events attached via useEffect with passive:false */}
        {visible[0] && (
          <div
            ref={dragOverlayRef}
            className="absolute inset-0 z-20"
            style={{ cursor: isDragging ? 'grabbing' : 'grab', bottom: visible[0].bookingPlatform ? 60 : 0 }}
            onMouseDown={onMouseDown}
          />
        )}
      </div>

      {/* ── Action bar ── */}
      <div style={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        paddingTop: 12,
        paddingBottom: 8,
      }}>
        {/* Pass / X */}
        <button
          onClick={handlePassClick}
          className="transition-all active:scale-90"
          style={{
            width: 58, height: 58, borderRadius: '50%',
            background: 'rgba(255,55,95,0.12)',
            border: '1.5px solid rgba(255,55,95,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 16px rgba(255,55,95,0.15)',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF375F" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Rewind */}
        <button
          onClick={handleRewind}
          className="transition-all active:scale-90"
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: canRewind ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.04)',
            border: `1.5px solid ${canRewind ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.1)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(12px)',
            opacity: canRewind ? 1 : 0.35,
            cursor: canRewind ? 'pointer' : 'default',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={canRewind ? '#FBBf24' : 'rgba(255,255,255,0.4)'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10"/>
            <path d="M3.51 15a9 9 0 1 0 .49-3.5"/>
          </svg>
        </button>

        {/* Like / Heart */}
        <button
          onClick={handleLikeClick}
          className="transition-all active:scale-90"
          style={{
            width: 58, height: 58, borderRadius: '50%',
            background: likedIds.has(venues[currentIndex]?.id ?? '')
              ? 'rgba(124,58,237,0.35)'
              : 'rgba(124,58,237,0.12)',
            border: `1.5px solid ${likedIds.has(venues[currentIndex]?.id ?? '') ? 'rgba(124,58,237,0.8)' : 'rgba(124,58,237,0.4)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 16px rgba(124,58,237,0.2)',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24"
            fill={likedIds.has(venues[currentIndex]?.id ?? '') ? '#a78bfa' : 'none'}
            stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
