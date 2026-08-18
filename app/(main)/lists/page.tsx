'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type ListTab = 'mine' | 'shared' | 'favorites'

const MY_LISTS = [
  {
    id: 'austin-date-night',
    name: 'Austin Date Night Spots',
    count: 12,
    updated: '2d ago',
    visibility: 'Public' as const,
    img: 'https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=120&q=70',
  },
  {
    id: 'rooftop-drinks',
    name: 'Rooftop Drinks',
    count: 18,
    updated: '1w ago',
    visibility: 'Shared' as const,
    img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=120&q=70',
  },
  {
    id: 'brunch-favorites',
    name: 'Brunch Favorites',
    count: 15,
    updated: '3d ago',
    visibility: 'Private' as const,
    img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=120&q=70',
  },
  {
    id: 'best-sushi',
    name: 'Best Sushi in Austin',
    count: 9,
    updated: '5d ago',
    visibility: 'Private' as const,
    img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=120&q=70',
  },
  {
    id: 'live-music',
    name: 'Live Music Nights',
    count: 20,
    updated: '1w ago',
    visibility: 'Private' as const,
    img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=120&q=70',
  },
]

const SHARED_LISTS = [
  {
    id: 'shared-tacos',
    name: "Sofia's Taco Spots",
    count: 8,
    updated: '4d ago',
    visibility: 'Shared' as const,
    img: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=120&q=70',
  },
  {
    id: 'shared-rooftops',
    name: 'Best Rooftops ATX',
    count: 6,
    updated: '2w ago',
    visibility: 'Shared' as const,
    img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=120&q=70',
  },
]

function VisibilityBadge({ v }: { v: 'Public' | 'Private' | 'Shared' }) {
  const cfg = {
    Public:  { icon: '🌐', color: 'rgba(168,85,247,0.7)', bg: 'rgba(124,58,237,0.12)', border: 'rgba(124,58,237,0.25)' },
    Private: { icon: '🔒', color: 'rgba(255,255,255,0.35)', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' },
    Shared:  { icon: '👥', color: 'rgba(236,72,153,0.8)', bg: 'rgba(236,72,153,0.1)', border: 'rgba(236,72,153,0.25)' },
  }[v]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 100,
      padding: '2px 8px', fontSize: '0.55rem', fontWeight: 700, color: cfg.color,
    }}>
      {cfg.icon} {v}
    </span>
  )
}

export default function ListsPage() {
  const router = useRouter()
  const [tab, setTab] = useState<ListTab>('mine')
  const [showCreate, setShowCreate] = useState(false)
  const [newListName, setNewListName] = useState('')

  const lists = tab === 'mine' ? MY_LISTS : tab === 'shared' ? SHARED_LISTS : MY_LISTS.filter(l => l.visibility !== 'Private')

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: '#09090B' }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.03em' }}>My Lists</h1>
          <div className="flex items-center gap-2.5">
            {/* Plus / add */}
            <button
              onClick={() => setShowCreate(true)}
              style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
            {/* Bell */}
            <button style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 rounded-full p-1 mb-4" style={{ background: '#151518', border: '1px solid #25252B', width: 'fit-content' }}>
          {([['mine','My Lists'],['shared','Shared with me'],['favorites','Favorites']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className="rounded-full px-4 py-1.5 transition-all"
              style={{
                background: tab === key ? 'linear-gradient(135deg,#7C3AED,#EC4899)' : 'none',
                color: tab === key ? '#fff' : 'rgba(255,255,255,0.45)',
                fontSize: '0.72rem', fontWeight: 700, border: 'none', cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* Create New List */}
        <button
          onClick={() => setShowCreate(true)}
          className="w-full flex items-center justify-center gap-2 rounded-[14px] py-3.5 mb-2 transition-all active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg,#7C3AED,#EC4899)', border: 'none', cursor: 'pointer', boxShadow: '0 6px 20px rgba(124,58,237,0.35)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fff' }}>Create New List</span>
        </button>
      </div>

      {/* List items */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 no-scrollbar">
        <div className="flex flex-col gap-2.5">
          {lists.map(list => (
            <button
              key={list.id}
              onClick={() => router.push(`/lists/${list.id}`)}
              className="w-full text-left flex items-center gap-3 rounded-[18px] p-3.5 transition-all active:scale-[0.98]"
              style={{ background: '#151518', border: '1px solid #25252B', cursor: 'pointer' }}
            >
              {/* Cover thumbnail */}
              <div style={{ width: 60, height: 60, borderRadius: 14, overflow: 'hidden', flexShrink: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={list.img} alt={list.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: '0.88rem', fontWeight: 800, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{list.name}</p>
                <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginBottom: 5 }}>
                  {list.count} places · Updated {list.updated}
                </p>
                <VisibilityBadge v={list.visibility} />
              </div>

              {/* Chevron or bell */}
              <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                {list.visibility === 'Private' && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
                    <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
                  </svg>
                )}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </button>
          ))}

          {/* My Venues shortcut */}
          <button
            onClick={() => router.push('/lists/my-venues')}
            className="w-full flex items-center gap-3 rounded-[18px] p-3.5 transition-all active:scale-[0.98]"
            style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.25)', cursor: 'pointer' }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(168,85,247,0.9)" strokeWidth="2" strokeLinecap="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div className="flex-1">
              <p style={{ fontSize: '0.88rem', fontWeight: 800, color: '#c4b5fd' }}>My Venues</p>
              <p style={{ fontSize: '0.65rem', color: 'rgba(168,85,247,0.55)' }}>Your private spots & hidden gems</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(168,85,247,0.4)" strokeWidth="2" strokeLinecap="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Create List Modal */}
      {showCreate && (
        <div
          className="absolute inset-0 z-50 flex items-end"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowCreate(false)}
        >
          <div
            className="w-full rounded-t-[28px] px-5 pt-5 pb-8"
            style={{ background: '#151518', border: '1px solid #25252B' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 100, margin: '0 auto 20px' }} />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 900, marginBottom: 16 }}>Create New List</h2>

            <input
              type="text"
              placeholder="List name (e.g. Austin Date Night Spots)"
              value={newListName}
              onChange={e => setNewListName(e.target.value)}
              className="w-full rounded-[14px] px-4 py-3.5 mb-4 outline-none"
              style={{ background: '#09090B', border: '1px solid #25252B', color: '#fff', fontSize: '0.9rem', fontWeight: 500 }}
            />

            {/* Visibility picker */}
            <p style={{ fontSize: '0.72rem', fontWeight: 800, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Visibility</p>
            <div className="flex gap-2 mb-5">
              {[
                { label: 'Private', icon: '🔒' },
                { label: 'Shared', icon: '👥' },
                { label: 'Public', icon: '🌐' },
              ].map(v => (
                <button key={v.label} className="flex-1 flex flex-col items-center gap-1.5 rounded-[14px] py-3 transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #25252B', cursor: 'pointer' }}>
                  <span style={{ fontSize: '1.2rem' }}>{v.icon}</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.55)' }}>{v.label}</span>
                </button>
              ))}
            </div>

            <button
              disabled={!newListName.trim()}
              onClick={() => { router.push('/lists/austin-date-night'); setShowCreate(false) }}
              className="w-full rounded-[14px] transition-all active:scale-[0.98]"
              style={{
                height: 52, background: newListName.trim() ? 'linear-gradient(135deg,#7C3AED,#EC4899)' : '#25252B',
                color: newListName.trim() ? '#fff' : 'rgba(255,255,255,0.3)',
                fontSize: '0.92rem', fontWeight: 800, border: 'none', cursor: newListName.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              Create List
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
