'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import { useSaves } from '@/contexts/SavesContext'
import { useUserLists, type UserList } from '@/contexts/UserListsContext'
import { useRouter } from 'next/navigation'
import type { Venue } from '@/lib/types'
import { ALL_FEATURED_VENUES } from '@/lib/venues'

// ─── Timeline builder (for Build My Night) ──────────────────────────────────

function venueTypePriority(v: Venue) {
  const t = (v.type ?? '').toLowerCase()
  const tags = (v.tags ?? []).join(' ').toLowerCase()
  if (tags.includes('brunch') || t.includes('cafe')) return -1
  if (t.includes('restaurant') || v.featured) return 0
  if (t.includes('bar') || tags.includes('cocktail')) return 1
  return 2
}
const STOP_CFGS = [
  { time: '6:30 PM',  type: 'Happy Hour'  },
  { time: '8:00 PM',  type: 'Dinner'      },
  { time: '9:30 PM',  type: 'Drinks'      },
  { time: '11:00 PM', type: 'Late Night'  },
  { time: '12:30 AM', type: 'After Hours' },
]
const TIME_OFF: Record<number, number> = { 1: 1, 2: 1, 3: 0, 4: 0, 5: 0 }
function buildTimeline(venues: Venue[]) {
  const sorted = [...venues].sort((a, b) => venueTypePriority(a) - venueTypePriority(b)).slice(0, 5)
  const off = TIME_OFF[sorted.length] ?? 0
  return sorted.map((venue, i) => {
    const cfg = STOP_CFGS[i + off] ?? STOP_CFGS[i]
    const t = (venue.type ?? '').toLowerCase()
    const tags = (venue.tags ?? []).join(' ').toLowerCase()
    let type = cfg.type
    if (t.includes('restaurant') || venue.featured)    type = 'Dinner'
    else if (t.includes('bar') || tags.includes('cocktail')) type = 'Drinks'
    else if (t.includes('club') || tags.includes('late'))    type = 'Late Night'
    const emoji = type === 'Dinner' ? '🍽️' : type === 'Happy Hour' ? '🍹' : type === 'Drinks' ? '🍸' : type === 'Late Night' || type === 'After Hours' ? '🌃' : '✨'
    return { time: cfg.time, type, name: venue.name, sub: [venue.type, venue.dist].filter(Boolean).join(' · '), emoji, open: i < 2, bookable: !!(venue.bookingPlatform) }
  })
}

// ─── Emoji picker options ────────────────────────────────────────────────────

const EMOJI_OPTIONS = ['🍹','🌮','❤️','👯','👨‍👩‍👧','🎉','⭐','🌙','🎵','🥂','🍽️','🌃','🔥','💫','🎭','🏆','🌿','☀️','🎨','📍']

const GUIDE_SUGGESTIONS = [
  { name: 'Date Night',        emoji: '❤️' },
  { name: 'Austin Taco Guide', emoji: '🌮' },
  { name: 'Best Cocktails',    emoji: '🍹' },
  { name: "Girls' Weekend",    emoji: '👯' },
  { name: 'Family Favorites',  emoji: '👨‍👩‍👧' },
]

// ─── Swipe-to-remove row ─────────────────────────────────────────────────────

const DELETE_W = 76

function SwipeToRemoveRow({ onRemove, openId, id, setOpenId, children }: {
  onRemove: () => void
  openId: string | null
  id: string
  setOpenId: (id: string | null) => void
  children: React.ReactNode
}) {
  const [offset, setOffset] = useState(0)
  const startX = useRef(0)
  const dragging = useRef(false)
  const revealed = offset <= -DELETE_W * 0.95

  // Force close when another row opens
  const isThisOpen = openId === id
  const wasOpen = useRef(false)
  if (!isThisOpen && wasOpen.current) { wasOpen.current = false; if (offset !== 0) setOffset(0) }
  if (isThisOpen) wasOpen.current = true

  const onTouchStart = (e: React.TouchEvent) => { startX.current = e.touches[0].clientX; dragging.current = true }
  const onTouchMove  = (e: React.TouchEvent) => {
    if (!dragging.current) return
    const base = isThisOpen ? -DELETE_W : 0
    setOffset(Math.min(0, Math.max(-(DELETE_W + 20), base + e.touches[0].clientX - startX.current)))
  }
  const onTouchEnd   = () => {
    dragging.current = false
    if (offset < -DELETE_W * 0.45) { setOffset(-DELETE_W); setOpenId(id) }
    else { setOffset(0); setOpenId(null) }
  }

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 18 }}>
      <div
        style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: DELETE_W, background: '#ef4444', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, cursor: 'pointer' }}
        onClick={onRemove}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        </svg>
        <span style={{ fontSize: '0.48rem', fontWeight: 800, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Remove</span>
      </div>
      <div
        style={{ transform: `translateX(${offset}px)`, transition: dragging.current ? 'none' : 'transform 0.28s cubic-bezier(0.25,0.46,0.45,0.94)' }}
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        onClick={() => { if (revealed) { setOffset(0); setOpenId(null) } }}
      >
        {children}
      </div>
    </div>
  )
}

// ─── Collection cover ────────────────────────────────────────────────────────

function CollectionCover({ venues, emoji, gradient }: { venues: Venue[]; emoji: string; gradient?: string }) {
  const photos = venues.slice(0, 4).map(v => v.img)
  if (photos.length === 0) {
    return (
      <div style={{ width: '100%', height: '100%', background: gradient ?? 'linear-gradient(135deg,#1c1c2e,#252540)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem' }}>
        {emoji}
      </div>
    )
  }
  if (photos.length === 1) return <img src={photos[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  if (photos.length < 4) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${photos.length}, 1fr)`, height: '100%', gap: 1 }}>
        {photos.map((img, i) => <img key={i} src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />)}
      </div>
    )
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', height: '100%', gap: 1 }}>
      {photos.map((img, i) => <img key={i} src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />)}
    </div>
  )
}

// ─── Collection grid card ────────────────────────────────────────────────────

function GuideCard({ name, emoji, venues, gradient, onTap, onDelete }: {
  name: string; emoji: string; venues: Venue[]
  gradient?: string; onTap: () => void; onDelete?: () => void
}) {
  return (
    <button
      onClick={onTap}
      className="relative rounded-[20px] overflow-hidden transition-all active:scale-[0.96] text-left"
      style={{ background: '#151518', border: '1px solid #25252B', height: 158 }}
    >
      <CollectionCover venues={venues} emoji={emoji} gradient={gradient} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 12px' }}>
        <p style={{ fontSize: '0.82rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
          {emoji} {name}
        </p>
        <p style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
          {venues.length === 0 ? 'Empty · tap to add' : `${venues.length} ${venues.length === 1 ? 'spot' : 'spots'}`}
        </p>
      </div>
      {onDelete && (
        <button
          onClick={e => { e.stopPropagation(); onDelete() }}
          style={{ position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="2.8" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}
    </button>
  )
}

// ─── New guide sheet ─────────────────────────────────────────────────────────

function NewGuideSheet({ onClose, onCreate }: { onClose: () => void; onCreate: (name: string, emoji: string) => void }) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('📍')

  function submit() {
    const trimmed = name.trim()
    if (!trimmed) return
    onCreate(trimmed, emoji)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div className="w-full max-w-[390px] rounded-t-[28px] pb-10" style={{ background: '#161618', border: '1px solid rgba(255,255,255,0.07)' }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: '#333', margin: '14px auto 0' }} />

        {/* Suggestions */}
        <div style={{ padding: '16px 20px 0' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Quick start</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
            {GUIDE_SUGGESTIONS.map(s => (
              <button key={s.name} onClick={() => { setName(s.name); setEmoji(s.emoji) }}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all active:scale-95"
                style={{ background: name === s.name ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.06)', border: `1px solid ${name === s.name ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.1)'}`, fontSize: '0.72rem', fontWeight: 700, color: name === s.name ? '#c4b5fd' : 'rgba(255,255,255,0.6)' }}>
                {s.emoji} {s.name}
              </button>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '0 20px' }} />

        {/* Name input */}
        <div style={{ padding: '16px 20px 0' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Guide name</p>
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="e.g. Best Cocktails"
            style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '11px 14px', color: '#fff', fontSize: '0.92rem', fontFamily: 'inherit', outline: 'none' }}
          />
        </div>

        {/* Emoji row */}
        <div style={{ padding: '14px 20px 0' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Icon</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {EMOJI_OPTIONS.map(e => (
              <button key={e} onClick={() => setEmoji(e)}
                style={{ width: 38, height: 38, borderRadius: 10, fontSize: '1.2rem', background: emoji === e ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.06)', border: `1.5px solid ${emoji === e ? 'rgba(124,58,237,0.6)' : 'transparent'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Create button */}
        <div style={{ padding: '18px 20px 0' }}>
          <button onClick={submit}
            style={{ width: '100%', padding: '14px', borderRadius: 14, background: name.trim() ? 'linear-gradient(135deg, #7C3AED, #EC4899)' : 'rgba(255,255,255,0.08)', color: name.trim() ? '#fff' : 'rgba(255,255,255,0.3)', fontWeight: 800, fontSize: '0.9rem', border: 'none', cursor: name.trim() ? 'pointer' : 'default', transition: 'all 0.2s' }}>
            Create Guide
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Add-from-saves sheet ────────────────────────────────────────────────────

function AddFromSavesSheet({ savedVenues, excludeIds, onAdd, onClose }: {
  savedVenues: Venue[]; excludeIds: Set<string>
  onAdd: (v: Venue) => void; onClose: () => void
}) {
  const available = savedVenues.filter(v => !excludeIds.has(v.id))
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div className="w-full max-w-[390px] rounded-t-[28px] pb-10" style={{ background: '#161618', maxHeight: '70vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: '#333', margin: '14px auto 6px', flexShrink: 0 }} />
        <div style={{ padding: '8px 20px 12px', flexShrink: 0 }}>
          <p style={{ fontWeight: 900, fontSize: '1rem' }}>Add from Saves</p>
          <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{available.length} venue{available.length !== 1 ? 's' : ''} available</p>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }} className="no-scrollbar">
          {available.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem', padding: '32px 0' }}>All your saves are already in this guide</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {available.map(v => (
                <button key={v.id} onClick={() => onAdd(v)}
                  className="flex items-center gap-3 rounded-[14px] p-3 text-left transition-all active:scale-[0.98]"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer' }}>
                  <img src={v.img} alt={v.name} style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 800, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.name}</p>
                    <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)' }}>{v.type} · {v.dist}</p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(168,85,247,0.7)" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Collection detail view ──────────────────────────────────────────────────

function CollectionDetail({ name, emoji, venues, isAllSaves, onBack, onRemove, onAddMore, onBuildNight, onReorder, onClearAll }: {
  name: string; emoji: string; venues: Venue[]; isAllSaves?: boolean
  onBack: () => void; onRemove: (id: string) => void
  onAddMore?: () => void; onBuildNight: () => void
  onReorder?: (next: Venue[]) => void
  onClearAll?: () => void
}) {
  const [openRowId, setOpenRowId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)

  // ── drag-and-drop state ──
  const [order, setOrder] = useState<Venue[]>(venues)
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null)
  const [dragOffsetY, setDragOffsetY] = useState(0)
  const [targetIdx, setTargetIdx] = useState<number | null>(null)
  const startY = useRef(0)
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])
  // Stable refs so window listeners avoid stale closures
  const draggingIdxRef = useRef<number | null>(null)
  const targetIdxRef = useRef<number | null>(null)

  // Sync external venue changes into local order
  const prevVenues = useRef(venues)
  if (venues !== prevVenues.current) {
    prevVenues.current = venues
    setOrder(venues)
  }

  const getTargetIdx = useCallback((clientY: number): number => {
    let best = draggingIdxRef.current ?? 0
    let bestDist = Infinity
    rowRefs.current.forEach((row, i) => {
      if (!row) return
      const rect = row.getBoundingClientRect()
      const center = rect.top + rect.height / 2
      const d = Math.abs(clientY - center)
      if (d < bestDist) { bestDist = d; best = i }
    })
    return best
  }, [])

  // Attach window-level listeners so moves aren't blocked by child touch handlers
  const onHandleTouchStart = useCallback((e: React.TouchEvent, idx: number) => {
    e.stopPropagation()
    startY.current = e.touches[0].clientY
    draggingIdxRef.current = idx
    targetIdxRef.current = idx
    setDraggingIdx(idx)
    setTargetIdx(idx)
    setDragOffsetY(0)

    function handleMove(ev: TouchEvent) {
      const dy = ev.touches[0].clientY - startY.current
      setDragOffsetY(dy)
      const t = getTargetIdx(ev.touches[0].clientY)
      targetIdxRef.current = t
      setTargetIdx(t)
    }

    function handleEnd() {
      const from = draggingIdxRef.current
      const to   = targetIdxRef.current
      if (from !== null && to !== null && from !== to) {
        setOrder(prev => {
          const next = [...prev]
          const [moved] = next.splice(from, 1)
          next.splice(to, 0, moved)
          onReorder?.(next)
          return next
        })
      }
      draggingIdxRef.current = null
      targetIdxRef.current   = null
      setDraggingIdx(null)
      setTargetIdx(null)
      setDragOffsetY(0)
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('touchend',  handleEnd)
    }

    window.addEventListener('touchmove', handleMove, { passive: true })
    window.addEventListener('touchend',  handleEnd)
  }, [getTargetIdx, onReorder])

  function handleRemove(id: string) {
    setDeletingId(id)
    setTimeout(() => { onRemove(id); setDeletingId(null) }, 260)
  }

  const ITEM_H = 88 // approximate row height

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: '#09090B' }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex-shrink-0 flex items-center gap-3">
        <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 900, letterSpacing: '-0.02em' }}>{emoji} {name}</h1>
          <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{venues.length} {venues.length === 1 ? 'spot' : 'spots'}</p>
        </div>
        {isAllSaves && venues.length > 0 && (
          <button
            onClick={() => {
              if (confirmClear) { onClearAll?.(); setConfirmClear(false) }
              else { setConfirmClear(true); setTimeout(() => setConfirmClear(false), 3000) }
            }}
            className="transition-all active:scale-95"
            style={{ flexShrink: 0, borderRadius: 100, padding: '7px 13px', fontSize: '0.68rem', fontWeight: 800, cursor: 'pointer', border: `1px solid ${confirmClear ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.12)'}`, background: confirmClear ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)', color: confirmClear ? '#f87171' : 'rgba(255,255,255,0.5)' }}>
            {confirmClear ? 'Tap to confirm' : 'Delete All'}
          </button>
        )}
        {onAddMore && (
          <button onClick={onAddMore}
            style={{ flexShrink: 0, background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 100, padding: '7px 14px', fontSize: '0.7rem', fontWeight: 800, color: '#c4b5fd', cursor: 'pointer' }}>
            + Add
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-5 pb-28 no-scrollbar">
        {venues.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center pb-16">
            <div style={{ fontSize: '3rem' }}>{emoji}</div>
            <p style={{ fontSize: '1rem', fontWeight: 900 }}>Guide is empty</p>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', maxWidth: 220, lineHeight: 1.6 }}>Save venues from Explore, then add them here</p>
            {onAddMore && (
              <button onClick={onAddMore}
                className="rounded-full px-6 py-3 mt-2 transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#EC4899)', color: '#fff', fontWeight: 800, fontSize: '0.85rem', border: 'none', cursor: 'pointer' }}>
                Add from Saves
              </button>
            )}
          </div>
        ) : (
          <>
            <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', textAlign: 'right', marginBottom: 8 }}>
              {isAllSaves ? '← swipe to delete' : '← swipe to remove · hold ≡ to reorder'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'relative' }}>
              {order.map((venue, i) => {
                const isDragging = draggingIdx === i
                // shift items to make gap for dragged item
                let shift = 0
                if (draggingIdx !== null && targetIdx !== null && draggingIdx !== targetIdx && !isDragging) {
                  if (draggingIdx < targetIdx && i > draggingIdx && i <= targetIdx) shift = -ITEM_H - 8
                  if (draggingIdx > targetIdx && i >= targetIdx && i < draggingIdx) shift = ITEM_H + 8
                }
                return (
                  <div
                    key={venue.id}
                    ref={el => { rowRefs.current[i] = el }}
                    style={{
                      transform: isDragging
                        ? `translateY(${dragOffsetY}px) scale(1.03)`
                        : `translateY(${shift}px)`,
                      transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.25,0.46,0.45,0.94)',
                      zIndex: isDragging ? 20 : 1,
                      position: 'relative',
                      opacity: deletingId === venue.id ? 0 : 1,
                      boxShadow: isDragging ? '0 16px 48px rgba(0,0,0,0.6)' : 'none',
                      borderRadius: 18,
                    }}
                  >
                    <SwipeToRemoveRow
                      id={venue.id}
                      openId={isDragging ? null : openRowId}
                      setOpenId={setOpenRowId}
                      onRemove={() => handleRemove(venue.id)}
                    >
                      <div className="flex items-center gap-3.5 rounded-[18px] p-3.5" style={{ background: '#151518', border: '1px solid #25252B' }}>
                        <img src={venue.img} alt={venue.name} style={{ width: 60, height: 60, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 800, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{venue.name}</p>
                          <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
                            {venue.type} · {venue.dist}
                            {venue.rating && <span style={{ color: '#FFD60A', fontWeight: 700, marginLeft: 6 }}>★ {venue.rating}</span>}
                          </p>
                          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                            {(venue.tags ?? []).slice(0, 2).map(tag => (
                              <span key={tag} style={{ fontSize: '0.5rem', fontWeight: 700, padding: '2px 7px', borderRadius: 100, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)', color: 'rgba(168,85,247,0.8)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{tag}</span>
                            ))}
                          </div>
                        </div>
                        {/* Drag handle */}
                        <div
                          onTouchStart={e => onHandleTouchStart(e, i)}
                          style={{ flexShrink: 0, padding: '8px 4px', cursor: 'grab', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none', opacity: 0.35 }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                            <line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="18" x2="16" y2="18"/>
                          </svg>
                        </div>
                      </div>
                    </SwipeToRemoveRow>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Build My Night FAB */}
      {venues.length >= 1 && (
        <div className="absolute left-0 right-0 flex justify-center" style={{ bottom: 84, pointerEvents: 'none' }}>
          <button onClick={onBuildNight}
            className="flex items-center gap-2.5 rounded-full transition-all active:scale-95"
            style={{ pointerEvents: 'all', background: 'linear-gradient(135deg,#7C3AED,#EC4899)', boxShadow: '0 8px 32px rgba(124,58,237,0.5),0 2px 8px rgba(0,0,0,0.4)', padding: '14px 26px', border: 'none', cursor: 'pointer' }}>
            <span style={{ fontSize: '1rem' }}>✨</span>
            <span style={{ fontSize: '0.88rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.01em' }}>Build My Night</span>
            {venues.length >= 2 && (
              <span style={{ fontSize: '0.62rem', fontWeight: 800, background: 'rgba(255,255,255,0.2)', borderRadius: 100, padding: '2px 7px', color: 'rgba(255,255,255,0.9)' }}>
                {venues.length} stops
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function SavedPage() {
  const { savedVenues, unsaveVenue, reorderVenues, clearAllSaves } = useSaves()
  const { userLists, createList, deleteList, addVenueToList, removeVenueFromList } = useUserLists()
  const router = useRouter()

  const [viewingId, setViewingId] = useState<string | null>(null)  // null = grid
  const [newGuideOpen, setNewGuideOpen] = useState(false)
  const [addFromSavesListId, setAddFromSavesListId] = useState<string | null>(null)
  const [deckReset, setDeckReset] = useState(false)

  // Venue lookup map
  const venueMap = useMemo(() => {
    const map = new Map<string, Venue>()
    ALL_FEATURED_VENUES.forEach(v => map.set(v.id, v))
    savedVenues.forEach(v => map.set(v.id, v))
    return map
  }, [savedVenues])

  function resolveVenues(ids: string[]): Venue[] {
    return ids.map(id => venueMap.get(id)).filter(Boolean) as Venue[]
  }

  function buildMyNight(venues: Venue[]) {
    const stops = buildTimeline(venues)
    try { localStorage.setItem('dashi_pending_plan', JSON.stringify({ type: 'buildMyNight', stops })) } catch {}
    router.push('/plans')
  }

  function resetDeck() {
    try { Object.keys(localStorage).filter(k => k.startsWith('dashi_deck_')).forEach(k => localStorage.removeItem(k)) } catch {}
    setDeckReset(true)
    setTimeout(() => setDeckReset(false), 1800)
  }

  // ── Viewing a specific list ──
  if (viewingId) {
    if (viewingId === 'all-saves') {
      return (
        <>
          <CollectionDetail
            name="All Saves" emoji="❤️" venues={savedVenues} isAllSaves
            onBack={() => setViewingId(null)}
            onRemove={id => unsaveVenue(id)}
            onClearAll={() => { clearAllSaves(); setViewingId(null) }}
            onBuildNight={() => buildMyNight(savedVenues)}
            onReorder={next => reorderVenues(next)}
          />
        </>
      )
    }
    const list = userLists.find(l => l.id === viewingId)
    if (list) {
      const venues = resolveVenues(list.venueIds)
      const excludeIds = new Set(list.venueIds)
      return (
        <>
          <CollectionDetail
            name={list.name} emoji={list.emoji ?? '📍'} venues={venues}
            onBack={() => setViewingId(null)}
            onRemove={id => removeVenueFromList(list.id, id)}
            onAddMore={() => setAddFromSavesListId(list.id)}
            onBuildNight={() => buildMyNight(venues)}
            onReorder={next => {
              // persist new order by rebuilding venueIds
              const nextIds = next.map(v => v.id)
              // update via context: replace all then re-add in order
              nextIds.forEach((id, _i) => { /* already in list; just reorder */ })
              // Quick approach: delete + re-add is complex; for now update localStorage directly
              const stored = JSON.parse(localStorage.getItem('dashi_user_lists') ?? '[]')
              const updated = stored.map((l: UserList) => l.id === list.id ? { ...l, venueIds: nextIds } : l)
              localStorage.setItem('dashi_user_lists', JSON.stringify(updated))
            }}
          />
          {addFromSavesListId === list.id && (
            <AddFromSavesSheet
              savedVenues={savedVenues}
              excludeIds={excludeIds}
              onAdd={v => addVenueToList(list.id, v.id)}
              onClose={() => setAddFromSavesListId(null)}
            />
          )}
        </>
      )
    }
  }

  // ── Collections grid ──
  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: '#09090B' }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex-shrink-0 flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.03em' }}>My Guides</h1>
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
            {savedVenues.length} saved · {userLists.length} {userLists.length === 1 ? 'guide' : 'guides'}
          </p>
        </div>
        {/* Reset Deck */}
        <button onClick={resetDeck}
          className="flex items-center gap-1.5 rounded-full px-3.5 py-2 transition-all active:scale-95"
          style={{ background: deckReset ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.06)', border: `1px solid ${deckReset ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}` }}>
          {deckReset ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round">
              <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
          )}
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: deckReset ? '#4ade80' : 'rgba(255,255,255,0.5)' }}>
            {deckReset ? 'Reset!' : 'Reset Deck'}
          </span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6 no-scrollbar">

        {/* New guide button */}
        <button
          onClick={() => setNewGuideOpen(true)}
          className="w-full flex items-center justify-center gap-2 rounded-[18px] py-3.5 mb-5 transition-all active:scale-[0.98]"
          style={{ background: 'rgba(124,58,237,0.1)', border: '1.5px dashed rgba(124,58,237,0.35)', cursor: 'pointer' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(168,85,247,0.8)" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'rgba(168,85,247,0.8)' }}>New Guide</span>
        </button>

        {/* Collections grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {/* All Saves — always first */}
          <GuideCard
            name="All Saves" emoji="❤️" venues={savedVenues}
            gradient="linear-gradient(135deg,#7C3AED,#EC4899)"
            onTap={() => setViewingId('all-saves')}
          />

          {/* User guides */}
          {userLists.map(list => {
            const venues = resolveVenues(list.venueIds)
            return (
              <GuideCard
                key={list.id}
                name={list.name} emoji={list.emoji ?? '📍'} venues={venues}
                onTap={() => setViewingId(list.id)}
                onDelete={() => deleteList(list.id)}
              />
            )
          })}

          {/* Empty-state suggestion cards (shown when no user guides) */}
          {userLists.length === 0 && GUIDE_SUGGESTIONS.slice(0, 3).map(s => (
            <button key={s.name}
              onClick={() => { createList(s.name, [], { emoji: s.emoji }); }}
              className="rounded-[20px] overflow-hidden transition-all active:scale-[0.96] text-left"
              style={{ background: '#151518', border: '1.5px dashed #25252B', height: 158, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
              <span style={{ fontSize: '2rem', opacity: 0.5 }}>{s.emoji}</span>
              <div style={{ textAlign: 'center', padding: '0 8px' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 800, color: 'rgba(255,255,255,0.35)' }}>{s.name}</p>
                <p style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.2)', marginTop: 2 }}>Tap to create</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* New Guide sheet */}
      {newGuideOpen && (
        <NewGuideSheet
          onClose={() => setNewGuideOpen(false)}
          onCreate={(name, emoji) => {
            const list = createList(name, [], { emoji })
            setNewGuideOpen(false)
            setViewingId(list.id)
          }}
        />
      )}
    </div>
  )
}
