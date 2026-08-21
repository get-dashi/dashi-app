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
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())

  // All drag state is refs — zero React re-renders during drag
  const cardRef        = useRef<HTMLDivElement | null>(null)
  const overlayRef     = useRef<HTMLDivElement | null>(null)
  const startX         = useRef(0)
  const startY         = useRef(0)
  const currentX       = useRef(0)
  const isHoriz        = useRef<boolean | null>(null)
  const historyRef     = useRef<{ venue: Venue; action: 'like' | 'pass' }[]>([])
  const venuesRef      = useRef(venues)
  const indexRef       = useRef(currentIndex)
  venuesRef.current    = venues
  indexRef.current     = currentIndex

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

  const prevCount = useRef(venues.length)
  useEffect(() => {
    if (venues.length !== prevCount.current) {
      setCurrentIndex(0)
      historyRef.current = []
      prevCount.current = venues.length
    }
  }, [venues])

  // ── Pure DOM mutations — no setState ─────────────────────────────────────
  const applyTransform = useCallback((dx: number) => {
    const el = cardRef.current
    if (!el) return
    el.style.transition = 'none'
    el.style.transform  = `translateX(${dx}px) rotate(${dx * 0.06}deg)`
    const like = el.querySelector<HTMLElement>('.like-stamp')
    const nope = el.querySelector<HTMLElement>('.nope-stamp')
    const t = 60
    if (dx > 0) {
      if (like) like.style.opacity = String(Math.min(1, (dx - t / 2) / t))
      if (nope) nope.style.opacity = '0'
    } else {
      if (nope) nope.style.opacity = String(Math.min(1, (-dx - t / 2) / t))
      if (like) like.style.opacity = '0'
    }
  }, [])

  const snapBack = useCallback(() => {
    const el = cardRef.current
    if (!el) return
    el.style.transition = 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)'
    el.style.transform  = 'translateX(0) rotate(0deg)'
    const like = el.querySelector<HTMLElement>('.like-stamp')
    const nope = el.querySelector<HTMLElement>('.nope-stamp')
    if (like) like.style.opacity = '0'
    if (nope) nope.style.opacity = '0'
  }, [])

  const flyOut = useCallback((direction: 'left' | 'right', venue: Venue) => {
    const el = cardRef.current
    if (!el) return
    const dx  = direction === 'right' ? 520 : -520
    const rot = direction === 'right' ? 22 : -22
    el.style.transition = 'transform 0.34s cubic-bezier(0.4,0,0.6,1)'
    el.style.transform  = `translateX(${dx}px) rotate(${rot}deg) scale(0.95)`
    setTimeout(() => {
      historyRef.current = [...historyRef.current, { venue, action: direction === 'right' ? 'like' : 'pass' }]
      if (direction === 'right') {
        onLike(venue)
        setLikedIds(prev => new Set(prev).add(venue.id))
      } else {
        onPass(venue)
      }
      setCurrentIndex(i => i + 1)
    }, 320)
  }, [onLike, onPass])

  // ── Button handlers ───────────────────────────────────────────────────────
  const handleLikeClick = useCallback(() => {
    const venue = venuesRef.current[indexRef.current]
    if (!venue) return
    const el = cardRef.current
    const like = el?.querySelector<HTMLElement>('.like-stamp')
    if (like) like.style.opacity = '1'
    flyOut('right', venue)
  }, [flyOut])

  const handlePassClick = useCallback(() => {
    const venue = venuesRef.current[indexRef.current]
    if (!venue) return
    const el = cardRef.current
    const nope = el?.querySelector<HTMLElement>('.nope-stamp')
    if (nope) nope.style.opacity = '1'
    flyOut('left', venue)
  }, [flyOut])

  const handleRewind = useCallback(() => {
    if (historyRef.current.length === 0) return
    const last = historyRef.current.pop()!
    if (last.action === 'like') {
      setLikedIds(prev => { const s = new Set(prev); s.delete(last.venue.id); return s })
    }
    setCurrentIndex(i => Math.max(0, i - 1))
  }, [])

  // ── Native touch — attached imperatively so passive:false actually works ──
  useEffect(() => {
    const overlay = overlayRef.current
    if (!overlay) return

    const onStart = (e: TouchEvent) => {
      startX.current  = e.touches[0].clientX
      startY.current  = e.touches[0].clientY
      currentX.current = 0
      isHoriz.current  = null
    }

    const onMove = (e: TouchEvent) => {
      const dx = e.touches[0].clientX - startX.current
      const dy = e.touches[0].clientY - startY.current

      if (isHoriz.current === null) {
        if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return
        isHoriz.current = Math.abs(dx) > Math.abs(dy)
      }
      if (!isHoriz.current) return   // vertical — let native scroll handle it

      e.preventDefault()             // stops page scroll/rubber-band during horizontal drag
      currentX.current = dx
      applyTransform(dx)             // pure DOM, zero React setState
    }

    const onEnd = () => {
      if (!isHoriz.current) { isHoriz.current = null; return }
      isHoriz.current = null
      const venue = venuesRef.current[indexRef.current]
      if (!venue) return
      if      (currentX.current >  90) flyOut('right', venue)
      else if (currentX.current < -90) flyOut('left',  venue)
      else                             snapBack()
    }

    overlay.addEventListener('touchstart', onStart, { passive: true  })
    overlay.addEventListener('touchmove',  onMove,  { passive: false }) // ← key
    overlay.addEventListener('touchend',   onEnd,   { passive: true  })
    return () => {
      overlay.removeEventListener('touchstart', onStart)
      overlay.removeEventListener('touchmove',  onMove)
      overlay.removeEventListener('touchend',   onEnd)
    }
  }, [applyTransform, flyOut, snapBack])

  // ── Mouse (desktop) ───────────────────────────────────────────────────────
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    startX.current   = e.clientX
    currentX.current = 0
    const onMove = (ev: MouseEvent) => {
      currentX.current = ev.clientX - startX.current
      applyTransform(currentX.current)
    }
    const onUp = () => {
      const venue = venuesRef.current[indexRef.current]
      if (venue) {
        if      (currentX.current >  90) flyOut('right', venue)
        else if (currentX.current < -90) flyOut('left',  venue)
        else                             snapBack()
      }
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
  }, [applyTransform, flyOut, snapBack])

  // ── Render ────────────────────────────────────────────────────────────────
  const visible   = venues.slice(currentIndex, currentIndex + 3)
  const canRewind = historyRef.current.length > 0
  const currentVenue = venues[currentIndex]

  if (!venues.length || currentIndex >= venues.length) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
        <div style={{ fontSize: '3rem' }}>✨</div>
        <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'rgba(255,255,255,0.85)' }}>You&apos;ve seen it all</p>
        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', maxWidth: 240 }}>
          Dashi is adding more spots. Check back soon or try a different vibe.
        </p>
        <button onClick={onEmpty} className="rounded-full px-6 py-3 text-sm font-bold transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)', color: '#fff', marginTop: 8 }}>
          Reset & Start Over
        </button>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 flex flex-col">

      {/* Card area */}
      <div className="flex-1 relative">
        {visible.slice(1).reverse().map((venue, ri) => {
          const pos = (visible.length - 1 - ri) as 1 | 2
          return (
            <V2SwipeCard key={venue.id} venue={venue}
              position={(['second', 'third'] as const)[pos - 1]} />
          )
        })}

        {visible[0] && (
          <V2SwipeCard key={visible[0].id} venue={visible[0]}
            position="top" onRef={el => { cardRef.current = el }} />
        )}

        {/* Drag overlay — touch-action:none is the browser-side lock */}
        {visible[0] && (
          <div
            ref={overlayRef}
            className="absolute inset-0 z-20"
            style={{
              touchAction: 'none',   // ← tells browser: JS owns all touch here
              cursor: 'grab',
              bottom: visible[0].bookingPlatform ? 60 : 0,
            }}
            onMouseDown={onMouseDown}
          />
        )}
      </div>

      {/* Action bar */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, paddingTop: 12, paddingBottom: 8 }}>

        {/* Pass */}
        <button onClick={handlePassClick} className="transition-all active:scale-90"
          style={{ width: 58, height: 58, borderRadius: '50%', background: 'rgba(255,55,95,0.12)', border: '1.5px solid rgba(255,55,95,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(12px)', boxShadow: '0 4px 16px rgba(255,55,95,0.15)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF375F" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Rewind */}
        <button onClick={handleRewind} className="transition-all active:scale-90"
          style={{ width: 44, height: 44, borderRadius: '50%', background: canRewind ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.04)', border: `1.5px solid ${canRewind ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(12px)', opacity: canRewind ? 1 : 0.35, cursor: canRewind ? 'pointer' : 'default' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={canRewind ? '#FBBf24' : 'rgba(255,255,255,0.4)'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/>
          </svg>
        </button>

        {/* Like */}
        <button onClick={handleLikeClick} className="transition-all active:scale-90"
          style={{ width: 58, height: 58, borderRadius: '50%', background: likedIds.has(currentVenue?.id ?? '') ? 'rgba(124,58,237,0.35)' : 'rgba(124,58,237,0.12)', border: `1.5px solid ${likedIds.has(currentVenue?.id ?? '') ? 'rgba(124,58,237,0.8)' : 'rgba(124,58,237,0.4)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(12px)', boxShadow: '0 4px 16px rgba(124,58,237,0.2)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24"
            fill={likedIds.has(currentVenue?.id ?? '') ? '#a78bfa' : 'none'}
            stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>

      </div>
    </div>
  )
}
