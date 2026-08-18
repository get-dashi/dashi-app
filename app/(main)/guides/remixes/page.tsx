'use client'

import { useRouter } from 'next/navigation'

const REMIXES = [
  { id: 'r1', name: 'Austin Date Night Spots', note: '(Original)', author: 'Ricky', places: 12, rating: '4.8', img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=80&q=70' },
  { id: 'r2', name: 'Austin Date Night Spots Under $100', note: null, author: 'Mike',  places: 8,  rating: '4.6', img: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=80&q=70' },
  { id: 'r3', name: 'Girls Night Out in Austin',          note: null, author: 'Sarah', places: 10, rating: '4.7', img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=80&q=70' },
  { id: 'r4', name: 'Anniversary Dinner Ideas',           note: null, author: 'Jen',   places: 7,  rating: '4.9', img: 'https://images.unsplash.com/photo-1479615183899-f6d56b4c8af4?w=80&q=70' },
]

export default function RemixesPage() {
  const router = useRouter()
  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: '#09090B' }}>
      <div className="px-5 pt-5 pb-3 flex-shrink-0">
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 4 }}>Ricky&apos;s Remixes</h1>
        <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.38)', marginBottom: 20 }}>Your custom versions of community guides</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4 no-scrollbar">
        <div className="flex flex-col gap-2.5">
          {REMIXES.map(r => (
            <button key={r.id} onClick={() => router.push('/guides/austin-rooftops')}
              className="w-full text-left flex items-center gap-3.5 rounded-[18px] p-3.5 transition-all active:scale-[0.98]"
              style={{ background: '#151518', border: '1px solid #25252B', cursor: 'pointer' }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, overflow: 'hidden', flexShrink: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.img} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p style={{ fontSize: '0.85rem', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</p>
                  {r.note && <span style={{ fontSize: '0.55rem', color: 'rgba(124,58,237,0.7)', fontWeight: 700, flexShrink: 0 }}>{r.note}</span>}
                </div>
                <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.38)' }}>by {r.author} · {r.places} places</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#FFD60A' }}>★ {r.rating}</span>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          ))}
        </div>

        <button
          onClick={() => router.push('/guides')}
          className="w-full rounded-[14px] py-3.5 mt-4 transition-all active:scale-[0.98]"
          style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', color: '#c4b5fd', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer' }}>
          View All Remixes
        </button>
      </div>
    </div>
  )
}
