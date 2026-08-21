'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

// ─── Types ───────────────────────────────────────────────────────────────────

interface SavedGroup {
  id: string
  code: string
  name: string
  emoji: string
  city: string
  memberCount: number
  isCreator: boolean
  joinedAt: number
}

const LS_KEY       = 'dashi_my_groups'
const GUEST_ID_KEY = 'dashi_guest_id'

function getUserId(authId?: string): string {
  if (authId) return authId
  if (typeof window === 'undefined') return 'guest'
  let id = localStorage.getItem(GUEST_ID_KEY)
  if (!id) { id = `guest_${Date.now()}_${Math.random().toString(36).slice(2)}`; localStorage.setItem(GUEST_ID_KEY, id) }
  return id
}

function readGroups(): SavedGroup[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]') } catch { return [] }
}
function saveGroups(g: SavedGroup[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(g)) } catch {}
}

// ─── Recommended crew templates ───────────────────────────────────────────────

const CREW_TEMPLATES = [
  { name: 'Weekend Crew',    emoji: '🎉', desc: 'Your go-to night out group'         },
  { name: 'Date Night',      emoji: '❤️', desc: 'Just the two of you, always a vibe' },
  { name: 'Foodie Squad',    emoji: '🍽️', desc: 'The group that lives to eat'         },
  { name: "Girls' Night",    emoji: '💃', desc: 'The crew that knows how to party'   },
  { name: "Boys' Night",     emoji: '🥃', desc: 'Cold drinks, good company'          },
  { name: 'Family Crew',     emoji: '👨‍👩‍👧', desc: 'Spots everyone can enjoy'           },
  { name: 'Work Happy Hour', emoji: '💼', desc: '5pm Friday, every Friday'           },
  { name: 'Travel Buddies',  emoji: '✈️', desc: 'Planning the next adventure'        },
]

const CITY_OPTIONS = [
  { key: 'austin',    label: 'Austin, TX'    },
  { key: 'monterrey', label: 'Monterrey, MX' },
  { key: 'nyc',       label: 'New York, NY'  },
  { key: 'miami',     label: 'Miami, FL'     },
  { key: 'chicago',   label: 'Chicago, IL'   },
]

const AVATAR_COLORS = ['#7C3AED','#EC4899','#3B82F6','#10B981','#F59E0B','#EF4444']

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StackedAvatars({ count, names }: { count: number; names?: string[] }) {
  const display = names?.length ? names : Array.from({ length: Math.min(count, 4) }, (_, i) => String(i))
  return (
    <div className="flex">
      {display.slice(0, 4).map((n, i) => (
        <div key={i} style={{ width: 26, height: 26, marginLeft: i > 0 ? -7 : 0, borderRadius: '50%', background: AVATAR_COLORS[i % AVATAR_COLORS.length], border: '2px solid #09090B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', fontWeight: 800, color: '#fff', zIndex: 4 - i }}>
          {typeof n === 'string' && n.length > 1 ? n.slice(0, 2).toUpperCase() : '?'}
        </div>
      ))}
      {count > 4 && (
        <div style={{ width: 26, height: 26, marginLeft: -7, borderRadius: '50%', background: '#25252B', border: '2px solid #09090B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.48rem', fontWeight: 800, color: 'rgba(255,255,255,0.5)', zIndex: 0 }}>
          +{count - 4}
        </div>
      )}
    </div>
  )
}

// ─── Group card ───────────────────────────────────────────────────────────────

function GroupCard({ group, onRemove }: { group: SavedGroup; onRemove: () => void }) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  function copyCode(e: React.MouseEvent) {
    e.stopPropagation()
    navigator.clipboard.writeText(group.code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <div className="rounded-[20px] p-4" style={{ background: '#151518', border: '1px solid #25252B' }}>
      <div className="flex items-start gap-3.5 mb-3.5">
        {/* Emoji */}
        <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>
          {group.emoji}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <p style={{ fontSize: '0.95rem', fontWeight: 900, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{group.name}</p>
            <button
              onClick={e => { e.stopPropagation(); onRemove() }}
              style={{ flexShrink: 0, width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <StackedAvatars count={group.memberCount} />
            <button
              onClick={copyCode}
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-all active:scale-95"
              style={{ background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.07)', border: `1px solid ${copied ? 'rgba(34,197,94,0.35)' : 'rgba(255,255,255,0.1)'}` }}
            >
              {copied ? (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              ) : (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              )}
              <span style={{ fontSize: '0.62rem', fontWeight: 800, color: copied ? '#4ade80' : 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', fontFamily: 'monospace' }}>
                {copied ? 'Copied!' : group.code}
              </span>
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={() => router.push(`/groups/${group.id}`)}
        className="w-full flex items-center justify-center gap-2 rounded-[12px] py-2.5 transition-all active:scale-[0.98]"
        style={{ background: 'linear-gradient(135deg,#7C3AED,#EC4899)', color: '#fff', fontWeight: 800, fontSize: '0.8rem', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(124,58,237,0.3)' }}
      >
        Plan a Night ✨
      </button>
    </div>
  )
}

// ─── Template card ────────────────────────────────────────────────────────────

function TemplateCard({ name, emoji, desc, onStart }: { name: string; emoji: string; desc: string; onStart: () => void }) {
  return (
    <button
      onClick={onStart}
      className="text-left rounded-[18px] p-3.5 flex items-center gap-3 transition-all active:scale-[0.97]"
      style={{ background: '#151518', border: '1px solid #25252B', width: '100%' }}
    >
      <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
        {emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '0.82rem', fontWeight: 800, marginBottom: 2 }}>{name}</p>
        <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.4 }}>{desc}</p>
      </div>
      <div style={{ flexShrink: 0, width: 28, height: 28, borderRadius: '50%', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(168,85,247,0.9)" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </div>
    </button>
  )
}

// ─── Create group sheet ───────────────────────────────────────────────────────

function CreateSheet({ prefill, onClose, onCreate }: {
  prefill?: { name: string; emoji: string }
  onClose: () => void
  onCreate: (name: string, emoji: string, city: string) => Promise<void>
}) {
  const [name, setName] = useState(prefill?.name ?? '')
  const [emoji, setEmoji] = useState(prefill?.emoji ?? '🎉')
  const [city, setCity] = useState('austin')
  const [loading, setLoading] = useState(false)
  const EMOJIS = ['🎉','🥃','✈️','🍜','🎵','🏖️','💃','🎤','❤️','🍽️','💼','🎂','👨‍👩‍👧','🔥','⭐','🌮']

  async function submit() {
    if (!name.trim() || loading) return
    setLoading(true)
    try { await onCreate(name.trim(), emoji, city) } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div className="w-full max-w-[390px] rounded-t-[28px] px-5 pt-3 pb-10" style={{ background: '#161618', border: '1px solid rgba(255,255,255,0.07)' }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: '#333', margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: 16 }}>Create a Crew</h2>

        {/* Emoji */}
        <div className="flex gap-2 flex-wrap mb-4">
          {EMOJIS.map(e => (
            <button key={e} onClick={() => setEmoji(e)}
              style={{ width: 40, height: 40, borderRadius: 10, fontSize: '1.1rem', background: emoji === e ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.05)', border: `1.5px solid ${emoji === e ? 'rgba(124,58,237,0.6)' : 'transparent'}`, cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {e}
            </button>
          ))}
        </div>

        {/* Name */}
        <input
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Crew name (e.g. Weekend Crew)"
          style={{ width: '100%', background: '#09090B', border: '1px solid #25252B', borderRadius: 12, padding: '12px 14px', color: '#fff', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', marginBottom: 12 }}
        />

        {/* City */}
        <select value={city} onChange={e => setCity(e.target.value)}
          style={{ width: '100%', background: '#09090B', border: '1px solid #25252B', borderRadius: 12, padding: '11px 14px', color: '#fff', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none', marginBottom: 18, appearance: 'none', cursor: 'pointer' }}>
          {CITY_OPTIONS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
        </select>

        <button onClick={submit} disabled={!name.trim() || loading}
          style={{ width: '100%', padding: '14px', borderRadius: 14, background: name.trim() && !loading ? 'linear-gradient(135deg,#7C3AED,#EC4899)' : 'rgba(255,255,255,0.08)', color: name.trim() && !loading ? '#fff' : 'rgba(255,255,255,0.3)', fontWeight: 800, fontSize: '0.9rem', border: 'none', cursor: name.trim() && !loading ? 'pointer' : 'default', transition: 'all 0.2s' }}>
          {loading ? 'Creating…' : 'Create Crew'}
        </button>
      </div>
    </div>
  )
}

// ─── Join sheet ───────────────────────────────────────────────────────────────

function JoinSheet({ onClose, onJoin }: { onClose: () => void; onJoin: (code: string) => Promise<void> }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    const clean = code.replace(/\s/g, '').toUpperCase()
    if (clean.length !== 6 || loading) return
    setLoading(true); setError('')
    try { await onJoin(clean) }
    catch (e) { setError(e instanceof Error ? e.message : 'Group not found') }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div className="w-full max-w-[390px] rounded-t-[28px] px-5 pt-3 pb-10" style={{ background: '#161618' }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: '#333', margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: 6 }}>Join a Crew</h2>
        <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>Enter the 6-character code your crew shared with you</p>

        <input
          autoFocus
          value={code}
          onChange={e => { setCode(e.target.value.toUpperCase().slice(0, 6)); setError('') }}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="ABCD34"
          maxLength={6}
          style={{ width: '100%', background: '#09090B', border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : '#25252B'}`, borderRadius: 12, padding: '14px', color: '#fff', fontSize: '1.4rem', fontFamily: 'monospace', fontWeight: 800, letterSpacing: '0.2em', textAlign: 'center', outline: 'none', marginBottom: error ? 8 : 18 }}
        />
        {error && <p style={{ fontSize: '0.72rem', color: '#f87171', marginBottom: 14, textAlign: 'center' }}>{error}</p>}

        <button onClick={submit} disabled={code.length !== 6 || loading}
          style={{ width: '100%', padding: '14px', borderRadius: 14, background: code.length === 6 && !loading ? 'linear-gradient(135deg,#7C3AED,#EC4899)' : 'rgba(255,255,255,0.08)', color: code.length === 6 && !loading ? '#fff' : 'rgba(255,255,255,0.3)', fontWeight: 800, fontSize: '0.9rem', border: 'none', cursor: code.length === 6 && !loading ? 'pointer' : 'default' }}>
          {loading ? 'Joining…' : 'Join Crew'}
        </button>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function GroupsPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [myGroups, setMyGroups] = useState<SavedGroup[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [createPrefill, setCreatePrefill] = useState<{ name: string; emoji: string } | undefined>()
  const [pendingPairing, setPendingPairing] = useState<{ names: string[]; tagline: string } | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    setMyGroups(readGroups())
    try {
      const raw = localStorage.getItem('dashi_pending_plan')
      if (!raw) return
      const data = JSON.parse(raw)
      if (data?.type === 'group' && data?.pairing) setPendingPairing(data.pairing)
    } catch {}
  }, [])

  const handleCreate = useCallback(async (name: string, emoji: string, city: string) => {
    const userId = getUserId(user?.id)
    const res = await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, city, userId }),
    })
    if (!res.ok) throw new Error('Failed to create group')
    const { group } = await res.json() as { group: { id: string; code: string; name: string; city: string } }

    const newGroup: SavedGroup = {
      id: group.id, code: group.code, name, emoji, city: group.city,
      memberCount: 1, isCreator: true, joinedAt: Date.now(),
    }
    setMyGroups(prev => {
      const next = [newGroup, ...prev]
      saveGroups(next)
      return next
    })
    setShowCreate(false)
    // Navigate to group detail
    router.push(`/groups/${group.id}`)
  }, [user?.id, router])

  const handleJoin = useCallback(async (code: string) => {
    const userId = getUserId(user?.id)
    const res = await fetch('/api/groups/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, userId }),
    })
    const data = await res.json() as { group?: { id: string; code: string; name: string; city: string }; error?: string }
    if (!res.ok) throw new Error(data.error ?? 'Group not found')

    const { group } = data
    if (!group) throw new Error('Group not found')

    const joined: SavedGroup = {
      id: group.id, code: group.code, name: group.name, emoji: '🎉',
      city: group.city, memberCount: 1, isCreator: false, joinedAt: Date.now(),
    }
    setMyGroups(prev => {
      // avoid duplicates
      if (prev.some(g => g.id === joined.id)) return prev
      const next = [joined, ...prev]
      saveGroups(next)
      return next
    })
    setShowJoin(false)
    router.push(`/groups/${group.id}`)
  }, [user?.id, router])

  function removeGroup(id: string) {
    setMyGroups(prev => {
      const next = prev.filter(g => g.id !== id)
      saveGroups(next)
      return next
    })
  }

  function startFromTemplate(t: typeof CREW_TEMPLATES[number]) {
    setCreatePrefill({ name: t.name, emoji: t.emoji })
    setShowCreate(true)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: '#09090B' }}>

      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-3 flex-shrink-0 flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.03em' }}>Crews</h1>
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Plan nights with your people</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setShowJoin(true) }}
            className="flex items-center gap-1.5 rounded-full px-3.5 py-2 transition-all active:scale-95"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem', fontWeight: 700 }}>
            Join
          </button>
          <button onClick={() => { setCreatePrefill(undefined); setShowCreate(true) }}
            className="flex items-center gap-1.5 rounded-[12px] px-4 py-2.5 transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#EC4899)', color: '#fff', fontSize: '0.78rem', fontWeight: 800, boxShadow: '0 4px 16px rgba(124,58,237,0.35)', border: 'none' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Crew
          </button>
        </div>
      </div>

      {/* ── Match context banner ── */}
      {pendingPairing && (
        <div className="mx-5 mb-1 rounded-[16px] px-4 py-3 flex items-center gap-3 flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.15),rgba(236,72,153,0.1))', border: '1px solid rgba(124,58,237,0.3)' }}>
          <span style={{ fontSize: '1.1rem' }}>✨</span>
          <div>
            <p style={{ fontSize: '0.78rem', fontWeight: 800 }}>Planning: {pendingPairing.names.join(' + ')}</p>
            <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)' }}>Pick a crew to share this night with</p>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-5 pb-6 no-scrollbar">

        {/* ── My Crews ── */}
        {myGroups.length > 0 && (
          <div className="mb-7">
            <p style={{ fontSize: '0.68rem', fontWeight: 800, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>My Crews</p>
            <div className="flex flex-col gap-3">
              {myGroups.map(g => (
                <GroupCard key={g.id} group={g} onRemove={() => removeGroup(g.id)} />
              ))}
            </div>
          </div>
        )}

        {/* ── Empty state ── */}
        {myGroups.length === 0 && (
          <div className="flex flex-col items-center text-center py-8 mb-7 rounded-[20px]" style={{ background: '#151518', border: '1px solid #25252B' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>👥</div>
            <p style={{ fontSize: '0.92rem', fontWeight: 900, marginBottom: 6 }}>No crews yet</p>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, maxWidth: 240, marginBottom: 16 }}>
              Create a crew, invite your people, and start planning nights out together.
            </p>
            <div className="flex gap-2">
              <button onClick={() => { setCreatePrefill(undefined); setShowCreate(true) }}
                className="rounded-full px-5 py-2.5 transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#EC4899)', color: '#fff', fontWeight: 800, fontSize: '0.8rem', border: 'none', cursor: 'pointer' }}>
                Create a Crew
              </button>
              <button onClick={() => setShowJoin(true)}
                className="rounded-full px-5 py-2.5 transition-all active:scale-95"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                Join with Code
              </button>
            </div>
          </div>
        )}

        {/* ── Recommended Crews ── */}
        <div>
          <p style={{ fontSize: '0.68rem', fontWeight: 800, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Recommended Crews</p>
          <div className="flex flex-col gap-2.5">
            {CREW_TEMPLATES.map(t => (
              <TemplateCard
                key={t.name}
                name={t.name} emoji={t.emoji} desc={t.desc}
                onStart={() => startFromTemplate(t)}
              />
            ))}
          </div>
        </div>

      </div>

      {showCreate && (
        <CreateSheet
          prefill={createPrefill}
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
      {showJoin && (
        <JoinSheet
          onClose={() => setShowJoin(false)}
          onJoin={handleJoin}
        />
      )}
    </div>
  )
}
