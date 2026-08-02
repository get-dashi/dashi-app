'use client'

import { useEffect, useRef, useCallback } from 'react'
import type { Venue } from '@/lib/types'
import { SwipeCard } from './SwipeCard'

interface CardStackProps {
  venues: Venue[]
  currentIndex: number
  onLike: (venue: Venue) => void
  onPass: (venue: Venue) => void
  onEmpty: () => void
}

const SWIPE_THRESHOLD = 80
const ROTATION_FACTOR = 0.12

export function CardStack({ venues, currentIndex, onLike, onPass, onEmpty }: CardStackProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dragCardRef = useRef<HTMLDivElement | null>(null)
  const startXRef = useRef(0)
  const startYRef = useRef(0)
  const currentXRef = useRef(0)
  const isDraggingRef = useRef(false)
  const activeIndexRef = useRef<number | null>(null)

  const visible = venues.slice(currentIndex, currentIndex + 3)

  const doSwipe = useCallback((direction: 'like' | 'pass') => {
    const card = dragCardRef.current
    if (!card) return
    const idxAttr = card.dataset.venueIndex
    if (idxAttr === undefined) return
    const idx = parseInt(idxAttr, 10)
    const venue = venues[idx]
    if (!venue) return

    // Remove active class immediately to prevent double-trigger
    card.classList.add('gone')
    card.style.transition = `transform 0.3s ease`
    card.style.transform = direction === 'like'
      ? `translateX(150%) rotate(20deg)`
      : `translateX(-150%) rotate(-20deg)`

    dragCardRef.current = null

    if (direction === 'like') onLike(venue)
    else onPass(venue)
  }, [venues, onLike, onPass])

  const handlePointerDown = useCallback((e: PointerEvent) => {
    const target = e.target as Element
    const card = target.closest('[data-venue-index]') as HTMLDivElement | null
    if (!card) return

    const idxAttr = card.dataset.venueIndex
    if (idxAttr === undefined) return
    const idx = parseInt(idxAttr, 10)

    // Only allow dragging the top card (currentIndex)
    if (idx !== currentIndex) return
    if (card.classList.contains('gone')) return

    dragCardRef.current = card
    activeIndexRef.current = idx
    startXRef.current = e.clientX
    startYRef.current = e.clientY
    currentXRef.current = 0
    isDraggingRef.current = true
    card.style.transition = 'none'
    card.setPointerCapture(e.pointerId)
    e.preventDefault()
  }, [currentIndex])

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDraggingRef.current || !dragCardRef.current) return
    const dx = e.clientX - startXRef.current
    currentXRef.current = dx
    const rotation = dx * ROTATION_FACTOR
    dragCardRef.current.style.transform = `translateX(${dx}px) rotate(${rotation}deg)`

    // Show stamps
    const like = dragCardRef.current.querySelector('.like-stamp') as HTMLElement | null
    const nope = dragCardRef.current.querySelector('.nope-stamp') as HTMLElement | null
    const ratio = Math.min(Math.abs(dx) / SWIPE_THRESHOLD, 1)
    if (like) like.style.opacity = dx > 0 ? String(ratio) : '0'
    if (nope) nope.style.opacity = dx < 0 ? String(ratio) : '0'
  }, [])

  const handlePointerUp = useCallback((_e: PointerEvent) => {
    if (!isDraggingRef.current || !dragCardRef.current) return
    isDraggingRef.current = false
    const dx = currentXRef.current

    if (dx > SWIPE_THRESHOLD) {
      doSwipe('like')
    } else if (dx < -SWIPE_THRESHOLD) {
      doSwipe('pass')
    } else {
      // Snap back
      dragCardRef.current.style.transition = 'transform 0.3s cubic-bezier(.4,0,.2,1)'
      dragCardRef.current.style.transform = 'translateX(0) rotate(0deg)'
      const like = dragCardRef.current.querySelector('.like-stamp') as HTMLElement | null
      const nope = dragCardRef.current.querySelector('.nope-stamp') as HTMLElement | null
      if (like) like.style.opacity = '0'
      if (nope) nope.style.opacity = '0'
    }
  }, [doSwipe])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('pointerdown', handlePointerDown, { passive: false })
    el.addEventListener('pointermove', handlePointerMove, { passive: true })
    el.addEventListener('pointerup', handlePointerUp)
    el.addEventListener('pointercancel', handlePointerUp)
    return () => {
      el.removeEventListener('pointerdown', handlePointerDown)
      el.removeEventListener('pointermove', handlePointerMove)
      el.removeEventListener('pointerup', handlePointerUp)
      el.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [handlePointerDown, handlePointerMove, handlePointerUp])

  if (visible.length === 0) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-10">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 opacity-60">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
        <h3 className="text-lg font-extrabold mb-2">You&apos;ve seen them all</h3>
        <p className="text-sm text-white/40 leading-relaxed mb-6">Check your saved venues or reset to explore again</p>
        <button onClick={onEmpty} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-extrabold text-sm px-7 py-3.5 rounded-full">
          Start Over
        </button>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="absolute inset-0">
      {visible.map((venue, i) => {
        const pos = i === 0 ? 'top' : i === 1 ? 'second' : 'third'
        const vIdx = currentIndex + i
        return (
          <SwipeCard
            key={venue.id}
            venue={venue}
            position={pos}
            venueIndex={vIdx}
          />
        )
      })}
      <p className="absolute bottom-3 left-0 right-0 text-center text-[0.58rem] text-white/20 pointer-events-none">
        Drag to swipe · or use buttons below
      </p>
    </div>
  )
}
