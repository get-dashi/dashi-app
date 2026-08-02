'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useSaves } from '@/contexts/SavesContext'
import { useVisits } from '@/contexts/VisitsContext'
import { useRankings } from '@/contexts/RankingsContext'
import { useUserLists, type UserList } from '@/contexts/UserListsContext'
import { getMichelinTier, ALL_FEATURED_VENUES } from '@/lib/venues'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export default function ProfilePage() {
  const { user, profile, signOut } = useAuth()
  const { savedVenues } = useSaves()
  const { visitedVenues } = useVisits()
  const { rankings } = useRankings()
  const { userLists, deleteList, addVenueToList } = useUserLists()
  const [addingToList, setAddingToList] = useState<UserList | null>(null)

  // Dining Passport stats
  const citiesVisited = new Set(visitedVenues.map(v => v.city ?? 'austin')).size
  const placesVisited = visitedVenues.length
  const michelinStarsVisited = visitedVenues.filter(v => getMichelinTier(v.name) === 'star').length
  const top10Cities = Object.keys(rankings).filter(c => (rankings[c] ?? []).length > 0).length

  // Current city for Top 10 preview (default austin)
  const currentCity = profile?.city ?? 'austin'
  const cityRankings = (rankings[currentCity] ?? []).slice().sort((a, b) => a.position - b.position).slice(0, 3)

  const initials = profile?.name
    ? profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?'

  const isGuest = !user

  if (isGuest) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {/* Guest header */}
          <div className="flex flex-col items-center px-5 py-8 text-center">
            <div className="w-[72px] h-[72px] rounded-full bg-white/10 border border-white/15 flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h2 className="text-lg font-extrabold mb-1">You&apos;re browsing as a guest</h2>
            <p className="text-sm text-white/50 mb-6 leading-relaxed">Sign in to save venues, create groups, and track your nights out.</p>

            <Link href="/login" className="w-full max-w-xs py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-extrabold text-sm shadow-lg shadow-purple-500/25 flex items-center justify-center">
              Sign In
            </Link>
            <Link href="/signup" className="mt-3 text-xs text-white/40 hover:text-white/60 transition-colors">
              Create account
            </Link>
          </div>

          {/* Stats (zeros for guest) */}
          <GuestStats />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {addingToList && (
        <AddVenueModal
          list={addingToList}
          addVenueToList={addVenueToList}
          onClose={() => setAddingToList(null)}
        />
      )}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-8">
        {/* Avatar + name */}
        <div className="flex flex-col items-center py-6 text-center">
          <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-[1.6rem] font-black text-white shadow-[0_0_0_4px_rgba(168,85,247,0.2),0_8px_24px_rgba(168,85,247,0.3)] mb-3.5">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : initials}
          </div>
          <h2 className="text-lg font-black tracking-[-0.02em] mb-1">{profile?.name ?? 'Explorer'}</h2>
          <p className="text-[0.65rem] text-white/40 font-medium">
            {profile?.city === 'monterrey' ? 'Monterrey, MX' : 'Austin, TX'} · Member since {profile?.created_at ? new Date(profile.created_at).getFullYear() : '2026'}
          </p>
        </div>

        {/* Dining Passport */}
        <div className="mb-5">
          <p className="text-[0.72rem] font-extrabold mb-3 text-white">Dining Passport</p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {[
              { num: citiesVisited, label: 'Cities Visited' },
              { num: placesVisited, label: 'Places Visited' },
              { num: michelinStarsVisited, label: 'Michelin Stars' },
              { num: top10Cities, label: 'Top 10s Built' },
            ].map(s => (
              <div key={s.label} className="bg-[#161618] rounded-[16px] border border-white/6 px-4 py-3 text-center">
                <p className="text-xl font-black tracking-[-0.03em] gradient-text mb-0.5">{s.num}</p>
                <p className="text-[0.5rem] font-semibold text-white/35 uppercase tracking-[0.06em]">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Top 10 preview */}
          {cityRankings.length > 0 && (
            <div className="bg-[#161618] rounded-[16px] border border-white/6 p-3.5">
              <p className="text-[0.65rem] font-extrabold text-white/60 mb-2.5">
                Your Top 10 &middot; {currentCity === 'monterrey' ? 'Monterrey' : 'Austin'}
              </p>
              <div className="flex flex-col gap-2">
                {cityRankings.map(r => (
                  <div key={r.venue.id} className="flex items-center gap-2.5">
                    <span
                      className="w-6 text-center font-black text-[0.85rem] flex-shrink-0"
                      style={{
                        color: r.position === 1 ? '#ffd60a' : r.position === 2 ? 'rgba(255,255,255,0.6)' : '#f97316',
                      }}
                    >
                      {r.position}
                    </span>
                    <img
                      src={r.venue.img}
                      alt={r.venue.name}
                      className="w-9 h-9 rounded-[9px] object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[0.75rem] font-bold truncate">{r.venue.name}</p>
                      <p className="text-[0.58rem] text-white/35 truncate">{r.venue.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex bg-[#161618] rounded-[20px] border border-white/6 mb-5 overflow-hidden">
          {[
            { num: savedVenues.length, label: 'Saved' },
            { num: profile?.nights_out ?? 0, label: 'Nights Out' },
            { num: profile?.preferences?.length ?? 0, label: 'Vibes' },
          ].map((s, i) => (
            <div key={i} className={`flex-1 py-4 text-center ${i > 0 ? 'border-l border-white/6' : ''}`}>
              <p className="text-xl font-black tracking-[-0.03em] gradient-text mb-0.5">{s.num}</p>
              <p className="text-[0.52rem] font-semibold text-white/35 uppercase tracking-[0.06em]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Preferences */}
        {(profile?.preferences?.length ?? 0) > 0 && (
          <div className="mb-5">
            <p className="text-[0.72rem] font-extrabold mb-3 text-white">Vibe</p>
            <div className="flex flex-wrap gap-2">
              {(profile?.preferences ?? []).map(p => (
                <span key={p} className="px-4 py-2 rounded-full text-[0.65rem] font-bold text-purple-300"
                  style={{ background: 'linear-gradient(#161618,#161618) padding-box, linear-gradient(135deg,#a855f7,#ec4899) border-box', border: '1.5px solid transparent' }}>
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Saved places preview */}
        {savedVenues.length > 0 && (
          <div className="mb-5">
            <p className="text-[0.72rem] font-extrabold mb-3 text-white">Saved Places</p>
            <div className="flex flex-col gap-2">
              {savedVenues.slice(0, 3).map(v => (
                <div key={v.id} className="flex items-center bg-[#161618] rounded-[14px] border border-white/6 p-3 gap-3">
                  <div className="w-9 h-9 rounded-[10px] bg-purple-500/12 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.78rem] font-bold truncate">{v.name}</p>
                    <p className="text-[0.58rem] text-white/38">{v.type}</p>
                    {v.happyHour && <p className="text-[0.58rem] font-bold text-purple-400">{v.happyHour}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Lists section */}
        {userLists.length > 0 && (
          <div className="mb-5">
            <p className="text-[0.72rem] font-extrabold mb-3 text-white">My Lists</p>
            <div className="flex flex-col gap-3">
              {userLists.map(list => (
                <MyListCard
                  key={list.id}
                  list={list}
                  onDelete={() => {
                    if (window.confirm(`Delete "${list.name}"?`)) deleteList(list.id)
                  }}
                  onAddVenue={() => setAddingToList(list)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="bg-[#161618] rounded-[18px] border border-white/6 overflow-hidden">
          {[
            { label: 'Preferences', href: '/profile/preferences' },
            { label: 'Account Settings', href: '/settings/account' },
            { label: 'Notifications', href: '/settings/account' },
          ].map(row => (
            <Link
              key={row.href}
              href={row.href}
              className="flex items-center justify-between px-4 py-3.5 border-b border-white/5 last:border-b-0 hover:bg-white/3 transition-colors"
            >
              <span className="text-[0.78rem] font-semibold">{row.label}</span>
              <ChevronRight size={14} className="text-white/25" />
            </Link>
          ))}
          <button
            onClick={signOut}
            className="w-full flex items-center justify-between px-4 py-3.5 border-t border-white/5 text-red-400 hover:bg-red-500/5 transition-colors"
          >
            <span className="text-[0.78rem] font-semibold">Sign Out</span>
            <ChevronRight size={14} className="text-red-400/40" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── MyListCard ──────────────────────────────────────────────────────────────

function MyListCard({
  list,
  onDelete,
  onAddVenue,
}: {
  list: UserList
  onDelete: () => void
  onAddVenue: () => void
}) {
  const venueMap = new Map(ALL_FEATURED_VENUES.map(v => [v.id, v]))
  const thumbnails = list.venueIds
    .map(id => venueMap.get(id))
    .filter(Boolean)
    .slice(0, 3) as (typeof ALL_FEATURED_VENUES)[number][]

  return (
    <div className="bg-[#161618] rounded-[16px] border border-white/6 p-3.5">
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex-1 min-w-0">
          <p className="text-[0.9rem] font-extrabold truncate leading-tight">{list.name}</p>
          <span className="text-[0.55rem] font-bold px-2 py-0.5 rounded-full bg-white/8 text-white/50">
            {list.venueIds.length} venue{list.venueIds.length !== 1 ? 's' : ''}
          </span>
        </div>
        <button
          onClick={onDelete}
          className="w-7 h-7 rounded-full bg-white/6 flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex gap-1.5">
          {thumbnails.map(v => (
            <img
              key={v.id}
              src={v.img}
              alt={v.name}
              className="rounded-[8px] object-cover flex-shrink-0"
              style={{ width: 40, height: 40 }}
            />
          ))}
        </div>
        <button
          onClick={onAddVenue}
          className="ml-auto px-3 py-1.5 rounded-full text-[0.6rem] font-bold border border-white/15 text-white/50 hover:bg-white/8 hover:text-white/70 transition-all active:scale-95 flex-shrink-0"
        >
          + Add Venue
        </button>
      </div>
    </div>
  )
}

// ─── AddVenueModal ───────────────────────────────────────────────────────────

function AddVenueModal({
  list,
  addVenueToList,
  onClose,
}: {
  list: UserList
  addVenueToList: (listId: string, venueId: string) => void
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const [added, setAdded] = useState<Set<string>>(new Set())

  const results = ALL_FEATURED_VENUES.filter(v => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return v.name.toLowerCase().includes(q) || v.type.toLowerCase().includes(q)
  }).slice(0, 30)

  const handleAdd = (venueId: string) => {
    addVenueToList(list.id, venueId)
    setAdded(prev => new Set(prev).add(venueId))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#161618] rounded-t-[28px] max-h-[88vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-8 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-1 flex-shrink-0" />

        <div className="flex items-center justify-between px-5 pt-3 pb-3 flex-shrink-0">
          <p className="text-[0.9rem] font-black">Add to &ldquo;{list.name}&rdquo;</p>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/15 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="px-5 pb-3 flex-shrink-0">
          <input
            type="text"
            placeholder="Search venues..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-white/8 border border-white/12 rounded-[12px] px-4 py-2.5 text-[0.78rem] text-white placeholder-white/30 outline-none focus:border-purple-500/60 transition-colors"
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-4">
          <div className="flex flex-col gap-2">
            {results.map(venue => {
              const isAdded = added.has(venue.id) || list.venueIds.includes(venue.id)
              return (
                <button
                  key={venue.id}
                  onClick={() => !isAdded && handleAdd(venue.id)}
                  className="flex items-center gap-3 rounded-[14px] p-3 bg-white/4 border border-white/6 hover:bg-white/8 transition-all text-left w-full"
                  disabled={isAdded}
                >
                  <img
                    src={venue.img}
                    alt={venue.name}
                    className="rounded-[9px] object-cover flex-shrink-0"
                    style={{ width: 40, height: 40 }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.8rem] font-bold truncate">{venue.name}</p>
                    <p className="text-[0.6rem] text-white/40 truncate">{venue.type}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {isAdded ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="px-5 pt-3 pb-8 flex-shrink-0 border-t border-white/6">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-[16px] text-[0.78rem] font-black text-white transition-all active:scale-98"
            style={{ background: 'linear-gradient(to right, #a855f7, #ec4899)' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── GuestStats ──────────────────────────────────────────────────────────────

function GuestStats() {
  return (
    <div className="px-5">
      <div className="flex bg-[#161618] rounded-[20px] border border-white/6 mb-5 overflow-hidden">
        {[{ num: 0, label: 'Saved' }, { num: 0, label: 'Nights Out' }, { num: 0, label: 'Vibes' }].map((s, i) => (
          <div key={i} className={`flex-1 py-4 text-center ${i > 0 ? 'border-l border-white/6' : ''}`}>
            <p className="text-xl font-black tracking-[-0.03em] text-white/20 mb-0.5">—</p>
            <p className="text-[0.52rem] font-semibold text-white/25 uppercase tracking-[0.06em]">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
