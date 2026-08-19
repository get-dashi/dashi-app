'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { V2SwipeCard } from './SwipeCard'
import type { Venue } from '@/lib/types'

interface CardStackProps {
  venues: Venue[]
  onLike: (venue: Venue) => void
  onPass: (venue: Venue) => void
  onEmpty: () => void
  persistKey?: string   // localStorage key to survive tab navigation
}

export function V2CardStack({ venues, onLike, onPass, onEmpty, persistKey }: CardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const cardRef = useRef<HTMLDivElement | null>(null)
  const startX = useRef(0)
  const startY = useRef(0)
  const currentX = useRef(0)
  const lsKey = persistKey ? `dashi_deck_${persistKey}` : null

  // Restore saved position on mount
  useEffect(() => {
    if (!lsKey) return
    try {
      const saved = parseInt(localStorage.getItem(lsKey) ?? '0', 10)
      if (saved > 0 && saved < venues.length) setCurrentIndex(saved)
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lsKey]) // only on mount / key change

  // Persist whenever index advances
  useEffect(() => {
    if (!lsKey) return
    try { localStorage.setItem(lsKey, String(currentIndex)) } catch { /* ignore */ }
  }, [currentIndex, lsKey])

  // Reset index when venues change (city/mood switch)
  const prevVenueCount = useRef(venues.length)
  useEffect(() => {
    if (venues.length !== prevVenueCount.current) {
      setCurrentIndex(0)
      prevVenueCount.current = venues.length
    }
  }, [venues])

  const applyTransform = useCallback((dx: number) => {
    const el = cardRef.current
    if (!el) return
    const rotation = dx * 0.06
    el.style.transform = `translateX(${dx}px) rotate(${rotation}deg) scale(1)`
    el.style.transition = 'none'

    // Opacity of stamps
    const likeStamp = el.querySelector<HTMLElement>('.like-stamp')
    const nopeStamp = el.querySelector<HTMLElement>('.nope-stamp')
    const threshold = 60
    if (dx > 0) {
      if (likeStamp) likeStamp.style.opacity = String(Math.min(1, (dx - threshold / 2) / threshold))
      if (nopeStamp) nopeStamp.style.opacity = '0'
    } else {
      if (nopeStamp) nopeStamp.style.opacity = String(Math.min(1, (-dx - threshold / 2) / threshold))
      if (likeStamp) likeStamp.style.opacity = '0'
    }
  }, [])

  const snapBack = useCallback(() => {
    const el = cardRef.current
    if (!el) return
    el.style.transform = 'translateX(0) rotate(0deg) scale(1)'
    el.style.transition = 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)'
    const likeStamp = el.querySelector<HTMLElement>('.like-stamp')
    const nopeStamp = el.querySelector<HTMLElement>('.nope-stamp')
    if (likeStamp) likeStamp.style.opacity = '0'
    if (nopeStamp) nopeStamp.style.opacity = '0'
  }, [])

  const flyOut = useCallback((direction: 'left' | 'right', venue: Venue) => {
    const el = cardRef.current
    if (!el) return
    const dx = direction === 'right' ? 500 : -500
    const rotation = direction === 'right' ? 20 : -20
    el.style.transform = `translateX(${dx}px) rotate(${rotation}deg) scale(0.95)`
    el.style.transition = 'transform 0.36s cubic-bezier(0.4,0,0.6,1)'
    setTimeout(() => {
      if (direction === 'right') onLike(venue)
      else onPass(venue)
      setCurrentIndex(i => i + 1)
      // Don't touch el — it's a stale ref to the card that just flew out.
      // React unmounts it; resetting the transform causes the flash.
    }, 340)
  }, [onLike, onPass])

  // Touch handlers
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
    currentX.current = 0
    setIsDragging(true)
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return
    const dx = e.touches[0].clientX - startX.current
    currentX.current = dx
    applyTransform(dx)
  }, [isDragging, applyTransform])

  const onTouchEnd = useCallback(() => {
    setIsDragging(false)
    const venue = venues[currentIndex]
    if (!venue) return
    const threshold = 90
    if (currentX.current > threshold) flyOut('right', venue)
    else if (currentX.current < -threshold) flyOut('left', venue)
    else snapBack()
  }, [venues, currentIndex, flyOut, snapBack])

  // Mouse handlers
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
      const threshold = 90
      if (currentX.current > threshold) flyOut('right', venue)
      else if (currentX.current < -threshold) flyOut('left', venue)
      else snapBack()
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
  }, [venues, currentIndex, applyTransform, flyOut, snapBack])

  const visible = venues.slice(currentIndex, currentIndex + 3)

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
    <div className="absolute inset-0">
      {/* Render back cards first (no interaction) */}
      {visible.slice(1).reverse().map((venue, ri) => {
        const pos = (visible.length - 1 - ri) as 1 | 2
        const positions = ['second', 'third'] as const
        return (
          <V2SwipeCard
            key={venue.id}
            venue={venue}
            position={positions[pos - 1]}
          />
        )
      })}

      {/* Top card — interactive */}
      {visible[0] && (
        <V2SwipeCard
          key={visible[0].id}
          venue={visible[0]}
          position="top"
          onRef={el => { cardRef.current = el }}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        />
      )}

      {/* Invisible drag overlay on top card */}
      {visible[0] && (
        <div
          className="absolute inset-0 z-20"
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
        />
      )}
    </div>
  )
}
