'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ALL_FEATURED_VENUES } from '@/lib/venues'
import { useUserLists } from '@/contexts/UserListsContext'
import type { Venue } from '@/lib/types'

// ─── Seed published community guides ───────────────────────────────────────
const COMMUNITY_GUIDES = [
  { id: 'cg-1', name: "Austin's Best Rooftops",   author: '@sofia_atx',   city: 'austin',    venues: 12, votes: 4312, userVoted: false, tags: ['Rooftop','Cocktails'],   img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=300&q=70' },
  { id: 'cg-2', name: 'East 6th After Dark',       author: '@rick_eats',   city: 'austin',    venues: 9,  votes: 2891, userVoted: false, tags: ['Nightlife','Bars'],      img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300&q=70' },
  { id: 'cg-3', name: 'Michelin Trail ATX',        author: '@josefdines', city: 'austin',    venues: 7,  votes: 1940, userVoted: false, tags: ['Michelin','Fine Dining'], img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&q=70' },
  { id: 'cg-4', name: 'Monterrey Mariscos',        author: '@rickyatx',   city: 'monterrey', venues: 8,  votes: 1230, userVoted: false, tags: ['Seafood','Local'],       img: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=300&q=70' },
  { id: 'cg-5', name: 'Brunch in El Poblado',      author: '@medliving',  city: 'medellin',  venues: 11, votes: 987,  userVoted: false, tags: ['Brunch','Café'],         img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&q=70' },
  { id: 'cg-6', name: 'Honolulu Hidden Gems',      author: '@hnl_eats',   city: 'honolulu',  venues: 14, votes: 743,  userVoted: false, tags: ['Hidden Gems','Local'],   img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&q=70' },
  { id: 'cg-7', name: 'Date Night Done Right ATX', author: '@sarahcooks', city: 'austin',    venues: 10, votes: 632,  userVoted: false, tags: ['Date Night','Romantic'], img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&q=70' },
  { id: 'cg-8', name: 'MTY Coffee Culture',        author: '@carafan',    city: 'monterrey', venues: 6,  votes: 498,  userVoted: false, tags: ['Coffee','Café'],         img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=70' },
]

const CITIES = ['all', 'austin', 'monterrey', 'honolulu', 'kauai', 'medellin'] as const
type CityFilter = typeof CITIES[number]

const CITY_LABEL: Record<string, string> = {
  all: 'All Cities', austin: 'Austin', monterrey: 'Monterrey',
  honolulu: 'Honolulu', kauai: "Kaua'i", medellin: 'Medellín',
}

const EMOJI_OPTIONS = ['🌃','🍜','🍸','🎵','🌮','☕','🍣','🥂','🍕','🔥','✨','🌴']

export default function GuidesPage() {
  const router = useRouter()
  const { userLists, createList, addVenueToList, publishList, unpublishList } = useUserLists()

  const [tab, setTab]                   = useState<'mine' | 'discover'>('discover')
  const [search, setSearch]             = useState('')
  const [cityFilter, setCityFilter]     = useState<CityFilter>('all')
  const [votes, setVotes]               = useState(() => Object.fromEntries(COMMUNITY_GUIDES.map(g => [g.id, { count: g.votes, voted: false }])))

  // Add-to-guide flow
  const [addTarget, setAddTarget]       = useState<Venue | null>(null)   // venue being added
  const [pickingList, setPickingList]   = useState(false)                // list picker open
  const [newListName, setNewListName]   = useState('')
  const [newListEmoji, setNewListEmoji] = useState('🌃')
  const [addedMsg, setAddedMsg]         = useState<string | null>(null)  // success toast

  // Publish confirm
  const [publishTarget, setPublishTarget] = useState<string | null>(null)

  const searchRef = useRef<HTMLInputElement>(null)

  // Venue search results
  const venueResults = useMemo(() => {
    if (search.length < 2) return []
    const q = search.toLowerCase()
    return ALL_FEATURED_VENUES.filter(v =>
      v.name.toLowerCase().includes(q) ||
      v.type?.toLowerCase().includes(q) ||
      v.tags?.some(t => t.toLowerCase().includes(q))
    ).slice(0, 12)
  }, [search])

  // Community guides filtered
  const communityGuides = useMemo(() => {
    return COMMUNITY_GUIDES
      .filter(g => cityFilter === 'all' || g.city === cityFilter)
      .sort((a, b) => votes[b.id].count - votes[a.id].count)
  }, [cityFilter, votes])

  function handleVote(id: string) {
    setVotes(prev => {
      const cur = prev[id]
      return { ...prev, [id]: { count: cur.voted ? cur.count - 1 : cur.count + 1, voted: !cur.voted } }
    })
  }

  function handleAddToList(listId: string) {
    if (!addTarget) return
    addVenueToList(listId, addTarget.id)
    setPickingList(false)
    setAddTarget(null)
    setAddedMsg(`Added to guide ✓`)
    setTimeout(() => setAddedMsg(null), 2500)
  }

  function handleCreateAndAdd() {
    if (!addTarget || !newListName.trim()) return
    const list = createList(newListName.trim(), [addTarget.id], { emoji: newListEmoji })
    setPickingList(false)
    setAddTarget(null)
    setNewListName('')
    setAddedMsg(`"${list.name}" created ✓`)
    setTimeout(() => setAddedMsg(null), 2500)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: '#09090B' }}>

      {/* ─── Header ─── */}
      <div className="px-5 pt-5 pb-0 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.03em' }}>Guides</h1>
          <button
            onClick={() => { setTab('mine'); setTimeout(() => searchRef.current?.focus(), 100) }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg,#7C3AED,#EC4899)', border: 'none', borderRadius: 20, padding: '7px 14px', cursor: 'pointer' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fff' }}>New Guide</span>
          </button>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-1 mb-4 rounded-[14px] p-1" style={{ background: '#151518', border: '1px solid #25252B' }}>
          {(['discover','mine'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 rounded-[10px] py-2 transition-all"
              style={{ background: tab === t ? 'linear-gradient(135deg,#7C3AED,#EC4899)' : 'none', color: tab === t ? '#fff' : 'rgba(255,255,255,0.4)', fontSize: '0.78rem', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: tab === t ? '0 4px 12px rgba(124,58,237,0.35)' : 'none' }}>
              {t === 'discover' ? '🌐 Community' : '📋 My Guides'}
            </button>
          ))}
        </div>
      </div>

      {/* ─── DISCOVER tab ─── */}
      {tab === 'discover' && (
        <div className="flex flex-col flex-1 overflow-hidden">

          {/* City filter pills */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar px-5 pb-2 flex-shrink-0">
            {CITIES.map(c => (
              <button key={c} onClick={() => setCityFilter(c)}
                className="flex-shrink-0 rounded-full px-3 py-1.5 transition-all"
                style={{ background: cityFilter === c ? 'linear-gradient(135deg,#7C3AED,#EC4899)' : '#151518', border: `1px solid ${cityFilter === c ? 'transparent' : '#25252B'}`, color: cityFilter === c ? '#fff' : 'rgba(255,255,255,0.5)', fontSize: '0.68rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                {CITY_LABEL[c]}
              </button>
            ))}
          </div>

          {/* Section label */}
          <div className="px-5 mb-2 flex-shrink-0 flex items-center justify-between">
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Ranked by community ↑
            </span>
            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)' }}>{communityGuides.length} guides</span>
          </div>

          {/* Guide list */}
          <div className="flex-1 overflow-y-auto px-5 pb-4 no-scrollbar flex flex-col gap-3">
            {communityGuides.map((guide, rank) => {
              const v = votes[guide.id]
              return (
                <div key={guide.id}
                  className="rounded-[20px] overflow-hidden"
                  style={{ background: '#151518', border: '1px solid #25252B' }}
                >
                  {/* Photo strip */}
                  <div style={{ position: 'relative', height: 110 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={guide.img} alt={guide.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)' }} />
                    {/* Rank badge */}
                    <div style={{ position: 'absolute', top: 10, left: 10, width: 28, height: 28, borderRadius: '50%', background: rank < 3 ? 'linear-gradient(135deg,#7C3AED,#EC4899)' : 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.62rem', fontWeight: 900, color: '#fff', backdropFilter: 'blur(8px)' }}>
                      #{rank + 1}
                    </div>
                    {/* City badge */}
                    <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', borderRadius: 100, padding: '2px 8px', fontSize: '0.48rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      {CITY_LABEL[guide.city]}
                    </div>
                    {/* Name */}
                    <div style={{ position: 'absolute', bottom: 10, left: 12, right: 60 }}>
                      <p style={{ fontSize: '0.9rem', fontWeight: 900, letterSpacing: '-0.01em', lineHeight: 1.2 }}>{guide.name}</p>
                      <p style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{guide.author} · {guide.venues} spots</p>
                    </div>
                  </div>

                  {/* Bottom row: tags + vote */}
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <div className="flex gap-1.5 flex-wrap">
                      {guide.tags.map(tag => (
                        <span key={tag} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, padding: '2px 8px', fontSize: '0.52rem', fontWeight: 700, color: 'rgba(255,255,255,0.55)' }}>{tag}</span>
                      ))}
                    </div>
                    {/* Upvote */}
                    <button
                      onClick={() => handleVote(guide.id)}
                      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all active:scale-90"
                      style={{ background: v.voted ? 'linear-gradient(135deg,#7C3AED,#EC4899)' : 'rgba(255,255,255,0.07)', border: v.voted ? 'none' : '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', flexShrink: 0 }}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill={v.voted ? 'white' : 'none'} stroke={v.voted ? 'white' : 'rgba(255,255,255,0.6)'} strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg>
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: v.voted ? '#fff' : 'rgba(255,255,255,0.6)' }}>{v.count.toLocaleString()}</span>
                    </button>
                  </div>
                </div>
              )
            })}

            {communityGuides.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>
                No guides for this city yet.<br/>Be the first to publish one!
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── MY GUIDES tab ─── */}
      {tab === 'mine' && (
        <div className="flex flex-col flex-1 overflow-hidden">

          {/* Search bar */}
          <div className="px-5 mb-3 flex-shrink-0">
            <div className="flex items-center gap-2.5 rounded-[14px] px-4"
              style={{ height: 46, background: '#151518', border: '1px solid #25252B' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                ref={searchRef}
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search any venue to add to a guide…"
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: '0.8rem', fontFamily: 'inherit' }}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}>×</button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-4 no-scrollbar">

            {/* Venue search results */}
            {venueResults.length > 0 && (
              <div className="mb-5">
                <p style={{ fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
                  {venueResults.length} results — tap + to add to a guide
                </p>
                <div className="flex flex-col gap-2">
                  {venueResults.map(v => (
                    <div key={v.id} className="flex items-center gap-3 rounded-[14px] px-3 py-2.5"
                      style={{ background: '#151518', border: '1px solid #25252B' }}>
                      {/* Thumbnail */}
                      <div style={{ width: 44, height: 44, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={v.img} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p style={{ fontSize: '0.82rem', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.name}</p>
                        <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)' }}>{v.type} · {v.dist}</p>
                      </div>
                      <button
                        onClick={() => { setAddTarget(v); setPickingList(true) }}
                        className="flex items-center gap-1 rounded-full px-3 py-1.5 transition-all active:scale-90 flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#7C3AED,#EC4899)', border: 'none', cursor: 'pointer' }}
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#fff' }}>Add</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* My guides */}
            {search.length < 2 && (
              <>
                <p style={{ fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
                  My Guides ({userLists.length})
                </p>

                {userLists.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem', lineHeight: 1.7 }}>
                    No guides yet.<br/>Search a venue above to start your first one.
                  </div>
                )}

                <div className="flex flex-col gap-2.5">
                  {userLists.map(list => {
                    const preview = ALL_FEATURED_VENUES.find(v => list.venueIds.includes(v.id))
                    return (
                      <div key={list.id} className="rounded-[18px] overflow-hidden"
                        style={{ background: '#151518', border: `1px solid ${list.published ? 'rgba(124,58,237,0.4)' : '#25252B'}` }}>
                        <div className="flex items-center gap-3 p-3.5">
                          {/* Emoji / photo */}
                          <div style={{ width: 54, height: 54, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: preview ? 'none' : 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                            {preview
                              ? <img src={preview.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> // eslint-disable-line @next/next/no-img-element
                              : (list.emoji ?? '📋')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p style={{ fontSize: '0.88rem', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{list.name}</p>
                            <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.38)', marginTop: 2 }}>{list.venueIds.length} places</p>
                            {/* Status badge */}
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 4, background: list.published ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${list.published ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 100, padding: '2px 8px', fontSize: '0.5rem', fontWeight: 800, color: list.published ? '#c4b5fd' : 'rgba(255,255,255,0.35)' }}>
                              {list.published ? '🌐 Published on Dashi' : '🔒 Private'}
                            </span>
                          </div>
                          {/* Publish / unpublish */}
                          <button
                            onClick={() => setPublishTarget(list.id)}
                            className="rounded-[10px] px-3 py-2 transition-all active:scale-95 flex-shrink-0"
                            style={{ background: list.published ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#7C3AED,#EC4899)', border: list.published ? '1px solid rgba(255,255,255,0.1)' : 'none', color: list.published ? 'rgba(255,255,255,0.4)' : '#fff', fontSize: '0.62rem', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}
                          >
                            {list.published ? 'Unpublish' : 'Publish ↑'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Guide templates */}
                <div style={{ marginTop: 20 }}>
                  <p style={{ fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Start from a template</p>
                  <div className="flex flex-col gap-2">
                    {[
                      { emoji: '🏙️', name: 'Best Rooftops in Austin',   category: 'Rooftops',        desc: 'The best rooftop bars for sunsets and good vibes' },
                      { emoji: '🍷', name: 'Date Night Done Right',       category: 'Date Night',      desc: 'Romantic spots perfect for a special night out' },
                      { emoji: '🍖', name: 'Austin BBQ Trail',             category: 'Restaurants',     desc: 'From Franklin to La Barbecue — the definitive list' },
                      { emoji: '🍹', name: 'Best Cocktail Bars',           category: 'Bars & Nightlife',desc: 'Craft cocktails and creative menus across Austin' },
                      { emoji: '☕',  name: 'Coffee & Work Spots',          category: 'Coffee & Cafes',  desc: 'Best cafes to get work done or catch up with friends' },
                      { emoji: '🌮', name: 'Taco Tour ATX',               category: 'Restaurants',     desc: 'From breakfast tacos to late-night street tacos' },
                    ].map(t => (
                      <button key={t.name}
                        onClick={() => { createList(t.name, [], { emoji: t.emoji, description: t.desc, category: t.category }); }}
                        className="flex items-center gap-3 rounded-[14px] px-3.5 py-3 transition-all active:scale-[0.98] text-left w-full"
                        style={{ background: '#151518', border: '1px solid #25252B', cursor: 'pointer' }}
                      >
                        <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{t.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</p>
                          <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{t.category}</p>
                        </div>
                        <div style={{ flexShrink: 0, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 8, padding: '4px 10px', fontSize: '0.62rem', fontWeight: 800, color: '#c4b5fd' }}>Use</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Create new blank guide */}
                <button
                  onClick={() => router.push('/guides/create')}
                  className="w-full flex items-center justify-center gap-2 rounded-[14px] py-3.5 mt-4 transition-all active:scale-[0.98]"
                  style={{ background: 'rgba(124,58,237,0.1)', border: '1px dashed rgba(124,58,237,0.35)', cursor: 'pointer' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(168,85,247,0.8)" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'rgba(168,85,247,0.8)' }}>Create blank guide</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── Add-to-guide sheet ─── */}
      {pickingList && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'flex-end' }}
          onClick={() => { setPickingList(false); setAddTarget(null) }}>
          <div onClick={e => e.stopPropagation()}
            style={{ width: '100%', background: '#111114', borderTop: '1px solid #25252B', borderRadius: '28px 28px 0 0', padding: '20px 20px 40px', maxHeight: '80vh', overflowY: 'auto' }}>

            <div style={{ width: 36, height: 4, borderRadius: 2, background: '#333', margin: '0 auto 20px' }} />

            {addTarget ? (
              <>
                <p style={{ fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(168,85,247,0.8)', marginBottom: 4 }}>Adding to guide</p>
                <p style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: 20 }}>{addTarget.name}</p>
              </>
            ) : (
              <p style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: 20 }}>Create a Guide</p>
            )}

            {/* Existing lists */}
            {addTarget && userLists.length > 0 && (
              <>
                <p style={{ fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Add to existing guide</p>
                <div className="flex flex-col gap-2 mb-5">
                  {userLists.map(list => {
                    const already = list.venueIds.includes(addTarget.id)
                    return (
                      <button key={list.id}
                        onClick={() => !already && handleAddToList(list.id)}
                        disabled={already}
                        className="flex items-center gap-3 rounded-[14px] px-4 py-3 transition-all active:scale-[0.98]"
                        style={{ background: already ? 'rgba(34,197,94,0.07)' : '#1A1A1E', border: `1px solid ${already ? 'rgba(34,197,94,0.25)' : '#2A2A32'}`, cursor: already ? 'default' : 'pointer', textAlign: 'left' }}>
                        <span style={{ fontSize: '1.2rem' }}>{list.emoji ?? '📋'}</span>
                        <div className="flex-1">
                          <p style={{ fontSize: '0.85rem', fontWeight: 800, color: already ? '#4ade80' : '#fff' }}>{list.name}</p>
                          <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)' }}>{list.venueIds.length} places</p>
                        </div>
                        {already
                          ? <span style={{ fontSize: '0.6rem', color: '#4ade80', fontWeight: 700 }}>Added ✓</span>
                          : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                        }
                      </button>
                    )
                  })}
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div style={{ flex: 1, height: 1, background: '#25252B' }} />
                  <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', fontWeight: 600 }}>OR CREATE NEW</span>
                  <div style={{ flex: 1, height: 1, background: '#25252B' }} />
                </div>
              </>
            )}

            {/* New guide form */}
            <p style={{ fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>New guide</p>

            {/* Emoji picker */}
            <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
              {EMOJI_OPTIONS.map(e => (
                <button key={e} onClick={() => setNewListEmoji(e)}
                  className="flex-shrink-0 transition-all active:scale-90"
                  style={{ width: 38, height: 38, borderRadius: 10, background: newListEmoji === e ? 'linear-gradient(135deg,#7C3AED,#EC4899)' : 'rgba(255,255,255,0.05)', border: newListEmoji === e ? 'none' : '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {e}
                </button>
              ))}
            </div>

            <input
              autoFocus
              value={newListName}
              onChange={e => setNewListName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreateAndAdd()}
              placeholder="Guide name…"
              style={{ width: '100%', background: '#1A1A1E', border: '1px solid #2A2A32', borderRadius: 12, padding: '12px 16px', color: '#fff', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', marginBottom: 12 }}
            />

            <button
              onClick={handleCreateAndAdd}
              disabled={!newListName.trim()}
              className="w-full rounded-[14px] transition-all active:scale-[0.98]"
              style={{ height: 52, background: newListName.trim() ? 'linear-gradient(135deg,#EC4899,#7C3AED)' : '#25252B', color: newListName.trim() ? '#fff' : 'rgba(255,255,255,0.25)', fontSize: '0.95rem', fontWeight: 800, border: 'none', cursor: newListName.trim() ? 'pointer' : 'not-allowed', boxShadow: newListName.trim() ? '0 6px 20px rgba(124,58,237,0.4)' : 'none' }}>
              {addTarget ? `Create & add ${newListEmoji}` : `Create guide ${newListEmoji}`}
            </button>
          </div>
        </div>
      )}

      {/* ─── Publish confirm sheet ─── */}
      {publishTarget && (() => {
        const list = userLists.find(l => l.id === publishTarget)
        if (!list) return null
        return (
          <div style={{ position: 'absolute', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'flex-end' }}
            onClick={() => setPublishTarget(null)}>
            <div onClick={e => e.stopPropagation()}
              style={{ width: '100%', background: '#111114', borderTop: '1px solid #25252B', borderRadius: '28px 28px 0 0', padding: '24px 20px 40px' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: '#333', margin: '0 auto 24px' }} />

              {list.published ? (
                <>
                  <p style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: 8 }}>Unpublish this guide?</p>
                  <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginBottom: 24, lineHeight: 1.6 }}>
                    "{list.name}" will be removed from the community and no longer rankable.
                  </p>
                  <button onClick={() => { unpublishList(publishTarget); setPublishTarget(null) }}
                    className="w-full rounded-[14px] transition-all active:scale-[0.98]"
                    style={{ height: 52, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: '0.95rem', fontWeight: 800, cursor: 'pointer', marginBottom: 10 }}>
                    Unpublish
                  </button>
                  <button onClick={() => setPublishTarget(null)}
                    style={{ width: '100%', height: 44, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}>🌐</div>
                  <p style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: 8 }}>Publish to Dashi?</p>
                  <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginBottom: 6, lineHeight: 1.6 }}>
                    "{list.name}" will be visible to everyone on Dashi. The community can rank it, save it, and remix it.
                  </p>
                  <p style={{ fontSize: '0.72rem', color: 'rgba(168,85,247,0.7)', marginBottom: 24, fontWeight: 700 }}>
                    📍 {list.venueIds.length} venues will be contributed to the Dashi city database.
                  </p>
                  <button onClick={() => { publishList(publishTarget); setPublishTarget(null) }}
                    className="w-full rounded-[14px] transition-all active:scale-[0.98]"
                    style={{ height: 52, background: 'linear-gradient(135deg,#7C3AED,#EC4899)', border: 'none', color: '#fff', fontSize: '0.95rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 6px 20px rgba(124,58,237,0.4)', marginBottom: 10 }}>
                    Publish on Dashi ↑
                  </button>
                  <button onClick={() => setPublishTarget(null)}
                    style={{ width: '100%', height: 44, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', cursor: 'pointer' }}>
                    Not yet
                  </button>
                </>
              )}
            </div>
          </div>
        )
      })()}

      {/* ─── Success toast ─── */}
      {addedMsg && (
        <div style={{ position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#7C3AED,#EC4899)', borderRadius: 100, padding: '10px 20px', zIndex: 300, whiteSpace: 'nowrap', boxShadow: '0 8px 24px rgba(124,58,237,0.5)', fontSize: '0.78rem', fontWeight: 800, color: '#fff' }}>
          {addedMsg}
        </div>
      )}

    </div>
  )
}
