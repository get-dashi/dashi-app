'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import type { VenueResult } from '@/app/api/groups/results/route'

type View = 'home' | 'create' | 'join' | 'active' | 'results'

interface ActiveGroup {
  id: string
  code: string
  name: string
  city: string
  created_by: string
}

interface GroupMemberInfo {
  user_id: string
  joined_at: string
  profiles: { name: string | null } | null
}

const LOCAL_KEY = 'dashi_group'

function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

const AVATAR_COLORS = [
  'bg-purple-500/60 text-purple-200',
  'bg-pink-500/60 text-pink-200',
  'bg-blue-500/60 text-blue-200',
  'bg-green-500/60 text-green-200',
  'bg-amber-500/60 text-amber-200',
  'bg-rose-500/60 text-rose-200',
]

function Avatar({ name, size = 'md', index = 0 }: { name: string | null; size?: 'sm' | 'md'; index?: number }) {
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length]
  const dim = size === 'sm' ? 'w-[22px] h-[22px] text-[0.5rem]' : 'w-9 h-9 text-[0.75rem]'
  return (
    <div className={`${dim} ${color} rounded-full flex items-center justify-center font-extrabold border-2 border-[#0d0d0f] flex-shrink-0`}>
      {getInitials(name)}
    </div>
  )
}

export default function GroupsPage() {
  const { user, profile } = useAuth()
  const { showToast } = useToast()

  const [view, setView] = useState<View>('home')
  const [activeGroup, setActiveGroup] = useState<ActiveGroup | null>(null)
  const [results, setResults] = useState<VenueResult[]>([])
  const [members, setMembers] = useState<GroupMemberInfo[]>([])
  const [memberCount, setMemberCount] = useState(0)

  // Create form state
  const [groupName, setGroupName] = useState('Night Out')
  const [groupCity, setGroupCity] = useState<string>('austin')
  const [creating, setCreating] = useState(false)

  // Join form state
  const [joinCode, setJoinCode] = useState('')
  const [joining, setJoining] = useState(false)

  // Results state
  const [loadingResults, setLoadingResults] = useState(false)

  // Load persisted group from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as ActiveGroup
        setActiveGroup(parsed)
        setView('active')
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  // Fetch members whenever activeGroup changes
  const fetchMembers = useCallback(async (code: string) => {
    try {
      const res = await fetch(`/api/groups?code=${code}`)
      if (res.ok) {
        const data = await res.json() as { members: GroupMemberInfo[]; memberCount: number }
        setMembers(data.members ?? [])
        setMemberCount(data.memberCount ?? 0)
      }
    } catch {
      // non-fatal
    }
  }, [])

  useEffect(() => {
    if (activeGroup) {
      fetchMembers(activeGroup.code)
    }
  }, [activeGroup, fetchMembers])

  function persistGroup(group: ActiveGroup) {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(group))
    setActiveGroup(group)
    setView('active')
  }

  function leaveGroup() {
    localStorage.removeItem(LOCAL_KEY)
    setActiveGroup(null)
    setMembers([])
    setMemberCount(0)
    setResults([])
    setView('home')
  }

  async function createGroup() {
    if (!user) return
    setCreating(true)
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: groupName, city: groupCity, userId: user.id }),
      })
      const data = await res.json() as { group?: ActiveGroup; error?: string }
      if (!res.ok || !data.group) {
        showToast(data.error ?? 'Could not create group', 'error')
        return
      }
      persistGroup(data.group)
      showToast('Group created!', 'success')
    } catch {
      showToast('Network error', 'error')
    } finally {
      setCreating(false)
    }
  }

  async function joinGroup() {
    if (!user || !joinCode.trim()) return
    setJoining(true)
    try {
      const res = await fetch('/api/groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: joinCode.trim().toUpperCase(), userId: user.id }),
      })
      const data = await res.json() as { group?: ActiveGroup; error?: string }
      if (!res.ok || !data.group) {
        showToast(data.error ?? 'Group not found', 'error')
        return
      }
      setJoinCode('')
      persistGroup(data.group)
      showToast('Joined group!', 'success')
    } catch {
      showToast('Network error', 'error')
    } finally {
      setJoining(false)
    }
  }

  async function loadResults() {
    if (!activeGroup) return
    setLoadingResults(true)
    try {
      const res = await fetch(`/api/groups/results?groupId=${activeGroup.id}`)
      const data = await res.json() as { results: VenueResult[] }
      setResults(data.results ?? [])
      setView('results')
    } catch {
      showToast('Could not load results', 'error')
    } finally {
      setLoadingResults(false)
    }
  }

  function copyInviteLink() {
    if (!activeGroup) return
    navigator.clipboard
      .writeText(`https://app.get-dashi.com/join/${activeGroup.code}`)
      .then(() => showToast('Invite link copied', 'success'))
      .catch(() => showToast('Copy failed', 'error'))
  }

  // ── Home view ──────────────────────────────────────────────────────────────
  if (view === 'home') {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex items-center px-5 py-4 flex-shrink-0">
          <h1 className="text-xl font-black tracking-[-0.03em]">Groups</h1>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-6 no-scrollbar flex flex-col gap-4">
          {/* Explainer */}
          <div className="bg-[#161618] rounded-[22px] border border-white/7 p-5">
            <p className="text-[0.8rem] font-bold mb-1 tracking-[-0.01em]">Plan a night out together</p>
            <p className="text-[0.65rem] text-white/45 leading-relaxed">
              Create a group, share the code with friends, and see which venues everyone saved. The places you all agree on float to the top.
            </p>
          </div>

          {/* CTA buttons */}
          <button
            onClick={() => setView('create')}
            className="w-full py-4 rounded-[18px] bg-gradient-to-r from-purple-500 to-pink-500 text-white font-extrabold text-[0.9rem] shadow-lg shadow-purple-500/25 tracking-[-0.01em] active:scale-[0.98] transition-transform"
          >
            Create Group
          </button>

          <button
            onClick={() => setView('join')}
            className="w-full py-4 rounded-[18px] bg-[#161618] border border-white/10 text-white font-extrabold text-[0.9rem] tracking-[-0.01em] active:scale-[0.98] transition-transform"
          >
            Join with Code
          </button>
        </div>
      </div>
    )
  }

  // ── Create view ────────────────────────────────────────────────────────────
  if (view === 'create') {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0">
          <button
            onClick={() => setView('home')}
            className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center active:bg-white/15 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="text-xl font-black tracking-[-0.03em]">New Group</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-6 no-scrollbar flex flex-col gap-4">
          {!user ? (
            <div className="bg-[#161618] rounded-[22px] border border-white/7 p-6 text-center">
              <p className="text-[0.85rem] font-bold mb-2">Sign in to create a group</p>
              <p className="text-[0.65rem] text-white/45">You need an account to create and manage groups.</p>
            </div>
          ) : (
            <>
              <div className="bg-[#161618] rounded-[22px] border border-white/7 p-5 flex flex-col gap-4">
                <div>
                  <label className="text-[0.6rem] font-bold tracking-[0.08em] uppercase text-white/40 block mb-2">
                    Group Name
                  </label>
                  <input
                    value={groupName}
                    onChange={e => setGroupName(e.target.value)}
                    placeholder="Night Out"
                    maxLength={40}
                    className="w-full bg-white/6 border border-white/10 rounded-xl px-3.5 py-3 text-[0.85rem] font-semibold text-white outline-none placeholder:text-white/30 focus:border-purple-500/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[0.6rem] font-bold tracking-[0.08em] uppercase text-white/40 block mb-2">
                    City
                  </label>
                  <select
                    value={groupCity}
                    onChange={e => setGroupCity(e.target.value)}
                    className="w-full bg-white/8 border border-white/12 text-white text-[0.78rem] font-semibold rounded-xl px-3 py-2.5 pr-8 appearance-none cursor-pointer outline-none focus:border-purple-500/60 transition-colors"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
                  >
                    <option value="austin">Austin, TX</option>
                    <option value="monterrey">Monterrey, MX</option>
                    <option value="honolulu">Honolulu, HI</option>
                    <option value="kauai">Kauaʻi, HI</option>
                    <option value="medellin">Medellín, COL</option>
                  </select>
                </div>
              </div>

              <button
                onClick={createGroup}
                disabled={creating || !groupName.trim()}
                className="w-full py-4 rounded-[18px] bg-gradient-to-r from-purple-500 to-pink-500 text-white font-extrabold text-[0.9rem] shadow-lg shadow-purple-500/25 tracking-[-0.01em] active:scale-[0.98] transition-transform disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Group'}
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  // ── Join view ──────────────────────────────────────────────────────────────
  if (view === 'join') {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0">
          <button
            onClick={() => setView('home')}
            className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center active:bg-white/15 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="text-xl font-black tracking-[-0.03em]">Join Group</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-6 no-scrollbar flex flex-col gap-4">
          {!user ? (
            <div className="bg-[#161618] rounded-[22px] border border-white/7 p-6 text-center">
              <p className="text-[0.85rem] font-bold mb-2">Sign in to join a group</p>
              <p className="text-[0.65rem] text-white/45">You need an account to join groups.</p>
            </div>
          ) : (
            <div className="bg-[#161618] rounded-[22px] border border-white/7 p-5 flex flex-col gap-4">
              <div>
                <label className="text-[0.6rem] font-bold tracking-[0.08em] uppercase text-white/40 block mb-2">
                  Group Code
                </label>
                <input
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                  placeholder="ABC123"
                  className="w-full bg-white/6 border border-white/10 rounded-xl px-3.5 py-3 text-[1.1rem] font-black text-white outline-none placeholder:text-white/25 focus:border-purple-500/50 transition-colors tracking-[0.12em] text-center"
                />
              </div>
              <button
                onClick={joinGroup}
                disabled={joining || joinCode.length < 4}
                className="w-full py-4 rounded-[18px] bg-gradient-to-r from-purple-500 to-pink-500 text-white font-extrabold text-[0.9rem] shadow-lg shadow-purple-500/25 tracking-[-0.01em] active:scale-[0.98] transition-transform disabled:opacity-50"
              >
                {joining ? 'Joining...' : 'Join Group'}
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Active group view ──────────────────────────────────────────────────────
  if (view === 'active' && activeGroup) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0">
          <h1 className="text-xl font-black tracking-[-0.03em]">Groups</h1>
          <span className="text-[0.6rem] font-bold text-white/30 tracking-[0.06em] uppercase">Active</span>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-6 no-scrollbar flex flex-col gap-4">
          {/* Group card */}
          <div className="bg-[#161618] rounded-[22px] border border-purple-500/20 p-5">
            <p className="text-[0.55rem] font-bold tracking-[0.1em] uppercase text-purple-400 mb-1.5">Active Group</p>
            <h2 className="text-lg font-black tracking-[-0.02em] mb-3">{activeGroup.name}</h2>

            {/* Member avatars */}
            <div className="flex items-center gap-2 mb-2.5">
              {members.slice(0, 6).map((m, i) => (
                <Avatar key={m.user_id} name={m.profiles?.name ?? null} index={i} />
              ))}
              {memberCount > 6 && (
                <div className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center text-[0.65rem] font-bold text-white/50 border-2 border-[#0d0d0f]">
                  +{memberCount - 6}
                </div>
              )}
            </div>

            <p className="text-[0.62rem] text-white/40 mb-4">
              {memberCount} {memberCount === 1 ? 'member' : 'members'}
              {activeGroup.city ? ` · ${{ austin:'Austin', monterrey:'Monterrey', honolulu:'Honolulu', kauai:"Kaua'i", medellin:'Medellín' }[activeGroup.city] ?? activeGroup.city}` : ''}
            </p>

            {/* Code display */}
            <div className="bg-black/30 rounded-[14px] border border-white/8 px-4 py-3 mb-4 flex items-center justify-between">
              <div>
                <p className="text-[0.52rem] font-bold tracking-[0.08em] uppercase text-white/35 mb-0.5">Group Code</p>
                <p className="text-[1.2rem] font-black tracking-[0.15em] text-white">{activeGroup.code}</p>
              </div>
              <button
                onClick={copyInviteLink}
                className="px-3 py-1.5 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-400 text-[0.65rem] font-bold active:bg-purple-500/25 transition-colors"
              >
                Copy Link
              </button>
            </div>

            {/* CTA */}
            <button
              onClick={loadResults}
              disabled={loadingResults}
              className="w-full py-3.5 rounded-[14px] bg-gradient-to-r from-purple-500 to-pink-500 text-white font-extrabold text-[0.85rem] shadow-lg shadow-purple-500/25 tracking-[-0.01em] active:scale-[0.98] transition-transform disabled:opacity-60"
            >
              {loadingResults ? 'Loading...' : 'See Group Plan'}
            </button>
          </div>

          {/* How it works tip */}
          <div className="bg-[#161618] rounded-[18px] border border-white/6 p-4">
            <p className="text-[0.72rem] font-bold mb-1 tracking-[-0.01em]">How it works</p>
            <p className="text-[0.62rem] text-white/40 leading-relaxed">
              Share the code above with your crew. Everyone swipes and saves venues independently. When everyone has saved some spots, tap "See Group Plan" to see where you all agree.
            </p>
          </div>

          {/* Leave */}
          <button
            onClick={leaveGroup}
            className="w-full py-3 rounded-[14px] bg-transparent border border-white/10 text-white/40 font-bold text-[0.75rem] active:bg-white/5 transition-colors"
          >
            Leave Group
          </button>
        </div>
      </div>
    )
  }

  // ── Results view ───────────────────────────────────────────────────────────
  if (view === 'results') {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0">
          <button
            onClick={() => setView('active')}
            className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center active:bg-white/15 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="text-xl font-black tracking-[-0.03em]">Group Plan</h1>
          {activeGroup && (
            <span className="ml-auto text-[0.6rem] font-bold text-white/30 tracking-[0.04em]">{activeGroup.name}</span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-6 no-scrollbar">
          {results.length === 0 ? (
            <div className="bg-[#161618] rounded-[22px] border border-white/7 p-8 text-center mt-2">
              <p className="text-[0.85rem] font-bold mb-2">Nothing here yet</p>
              <p className="text-[0.65rem] text-white/40 leading-relaxed">
                Swipe more venues and check back once everyone has saved some spots.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 mt-1">
              {results.map(r => (
                <div key={r.venue_id} className="bg-[#161618] rounded-[18px] border border-white/7 p-4">
                  <div className="mb-2">
                    {r.tier === 'top' && (
                      <span className="inline-block rounded-md px-2 py-0.5 text-[0.5rem] font-black tracking-[0.08em] uppercase bg-green-500/20 text-green-400 border border-green-500/30">
                        Top Pick
                      </span>
                    )}
                    {r.tier === 'strong' && (
                      <span className="inline-block rounded-md px-2 py-0.5 text-[0.5rem] font-black tracking-[0.08em] uppercase bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        Strong Match
                      </span>
                    )}
                    {r.tier === 'maybe' && (
                      <span className="inline-block rounded-md px-2 py-0.5 text-[0.5rem] font-black tracking-[0.08em] uppercase bg-white/8 text-white/40 border border-white/10">
                        Maybe
                      </span>
                    )}
                  </div>
                  <h4 className="text-[0.9rem] font-extrabold tracking-[-0.02em] mb-0.5">{r.venue_name}</h4>
                  <p className="text-[0.6rem] text-white/40 mb-3">{r.venue_type}</p>

                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1">
                      {r.savedBy.slice(0, 5).map((name, i) => (
                        <Avatar key={i} name={name} size="sm" index={i} />
                      ))}
                    </div>
                    <span className="text-[0.58rem] text-white/35 font-medium ml-1">
                      {r.savedBy.join(', ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Fallback — should not reach here
  return null
}
