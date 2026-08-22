'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

async function shareGuide(name: string) {
  const url = window.location.href
  if (navigator.share) {
    await navigator.share({ title: name, text: `Check out this guide on Dashi: ${name}`, url }).catch(() => {})
  } else {
    navigator.clipboard.writeText(url)
  }
}

type RankTab = 'creator' | 'community'

const GUIDE = {
  name: 'Austin Rooftop Bars',
  author: 'Ricky',
  authorBadge: 'Top Austin Foodie',
  places: 12,
  saves: '4,382',
  rating: '4.7',
  trending: true,
  cover: 'https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=800&q=80',
  description: 'The best rooftop bars in Austin perfect for sunsets, drinks and good vibes.',
}

const CREATOR_RANKING = [
  { rank: 1, name: 'Zanzibar',        sub: 'Rooftop Bar · Downtown Austin',  img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=80&q=70', score: 92, rating: '4.9' },
  { rank: 2, name: 'Devil May Care',  sub: 'Cocktail Bar · Downtown',         img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=80&q=70',  score: 89, rating: '4.9' },
  { rank: 3, name: 'Small Victory',   sub: 'Rooftop Bar · Bar District',      img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=80&q=70', score: 85, rating: '4.7' },
  { rank: 4, name: 'Edge Rooftop',    sub: 'Lounge · Downtown',              img: 'https://images.unsplash.com/photo-1543007631-283050bb3e8c?w=80&q=70',   score: 82, rating: '4.6' },
  { rank: 5, name: 'P6',             sub: 'Rooftop Bar · Downtown',          img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=80&q=70', score: 78, rating: '4.5' },
]
const COMMUNITY_RANKING = [
  { rank: 1, name: 'Zanzibar',        sub: 'Rooftop Bar · Downtown Austin',  img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=80&q=70', score: 95, rating: '4.9' },
  { rank: 2, name: 'Small Victory',   sub: 'Rooftop Bar · Bar District',     img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=80&q=70', score: 91, rating: '4.8' },
  { rank: 3, name: 'P6',             sub: 'Rooftop Bar · Downtown',          img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=80&q=70', score: 87, rating: '4.6' },
  { rank: 4, name: 'Devil May Care',  sub: 'Cocktail Bar · Downtown',        img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=80&q=70',   score: 84, rating: '4.9' },
  { rank: 5, name: 'Edge Rooftop',   sub: 'Lounge · Downtown',              img: 'https://images.unsplash.com/photo-1543007631-283050bb3e8c?w=80&q=70',    score: 79, rating: '4.6' },
]

const RANK_MEDALS = ['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟']

export default function GuideDetailPage() {
  const router = useRouter()
  const [tab, setTab] = useState<RankTab>('creator')
  const [saved, setSaved] = useState(false)
  const [ratingVenue, setRatingVenue] = useState<string | null>(null)

  const venues = tab === 'creator' ? CREATOR_RANKING : COMMUNITY_RANKING

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: '#09090B' }}>
      {/* Header */}
      <div style={{ position: 'relative', height: 200, flexShrink: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={GUIDE.cover} alt={GUIDE.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(9,9,11,1) 0%, rgba(9,9,11,0.4) 60%, rgba(9,9,11,0.2) 100%)' }} />

        {/* Nav icons */}
        <div className="absolute top-4 left-5 right-5 flex items-center justify-between">
          <button onClick={() => router.back()} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div className="flex gap-2">
            <button onClick={() => shareGuide(GUIDE.name)} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
            </button>
            <button style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
            </button>
          </div>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-5 right-5 pb-4">
          <h1 style={{ fontSize: '1.35rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 3 }}>{GUIDE.name}</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="px-5 pt-3">
          {/* Author + badge */}
          <div className="flex items-center gap-2.5 mb-3">
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 900, color: '#fff', flexShrink: 0 }}>R</div>
            <div>
              <p style={{ fontSize: '0.78rem', fontWeight: 700 }}>by {GUIDE.author}</p>
              <p style={{ fontSize: '0.58rem', color: '#EC4899', fontWeight: 700 }}>{GUIDE.authorBadge}</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 mb-3">
            <div className="text-center">
              <p style={{ fontSize: '1.1rem', fontWeight: 900, background: 'linear-gradient(135deg,#7C3AED,#EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{GUIDE.places}</p>
              <p style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>Places</p>
            </div>
            <div style={{ width: 1, height: 28, background: '#25252B' }} />
            <div className="text-center">
              <p style={{ fontSize: '1.1rem', fontWeight: 900, background: 'linear-gradient(135deg,#7C3AED,#EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{GUIDE.saves}</p>
              <p style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>Saves</p>
            </div>
            <div style={{ width: 1, height: 28, background: '#25252B' }} />
            <div className="text-center">
              <p style={{ fontSize: '1.1rem', fontWeight: 900, background: 'linear-gradient(135deg,#7C3AED,#EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{GUIDE.rating}★</p>
              <p style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>Community Rating</p>
            </div>
          </div>

          {/* Trending */}
          {GUIDE.trending && (
            <div className="flex items-center gap-1.5 mb-3">
              <span style={{ fontSize: '0.85rem' }}>🔥</span>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#f97316' }}>Trending this week</span>
            </div>
          )}

          {/* Tab switcher */}
          <div className="flex rounded-[12px] p-1 mb-4" style={{ background: '#151518', border: '1px solid #25252B' }}>
            {[['creator','Creator Ranking'],['community','Community Ranking']] .map(([key, label]) => (
              <button key={key} onClick={() => setTab(key as RankTab)}
                className="flex-1 rounded-[8px] py-2.5 text-center transition-all"
                style={{ background: tab === key ? 'linear-gradient(135deg,#7C3AED,#EC4899)' : 'none', color: tab === key ? '#fff' : 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                {label}
              </button>
            ))}
          </div>

          {/* Venue rankings */}
          <div className="flex flex-col gap-2.5 mb-5">
            {venues.map(venue => (
              <button
                key={venue.name}
                onClick={() => setRatingVenue(venue.name)}
                className="flex items-center gap-3 w-full text-left rounded-[16px] p-3 transition-all active:scale-[0.98]"
                style={{ background: '#151518', border: '1px solid #25252B', cursor: 'pointer' }}
              >
                {/* Rank */}
                <span style={{ fontSize: '1.1rem', width: 28, textAlign: 'center', flexShrink: 0 }}>{RANK_MEDALS[venue.rank - 1]}</span>

                {/* Thumb */}
                <div style={{ width: 48, height: 48, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={venue.img} alt={venue.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: '0.88rem', fontWeight: 800, marginBottom: 2 }}>{venue.name}</p>
                  <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)' }}>{venue.sub}</p>
                </div>

                {/* Score */}
                <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                  <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#FFD60A' }}>★ {venue.rating}</span>
                  <div className="flex items-center gap-1">
                    <div style={{ width: 32, height: 4, borderRadius: 100, background: '#25252B', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${venue.score}%`, background: 'linear-gradient(90deg,#7C3AED,#EC4899)', borderRadius: 100 }} />
                    </div>
                    <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'rgba(168,85,247,0.85)' }}>{venue.score}%</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Remix CTA */}
          <button
            onClick={() => router.push('/guides/austin-rooftops/remix')}
            className="w-full flex items-center justify-center gap-2.5 rounded-[14px] py-3.5 mb-4 transition-all active:scale-[0.98]"
            style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', cursor: 'pointer' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(168,85,247,0.85)" strokeWidth="2" strokeLinecap="round">
              <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
            </svg>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#c4b5fd' }}>Remix This Guide</span>
          </button>
        </div>
      </div>

      {/* Save Guide CTA */}
      <div className="px-5 py-4 flex-shrink-0" style={{ borderTop: '1px solid #25252B' }}>
        <div className="flex gap-3">
          <button
            onClick={() => setSaved(s => !s)}
            className="flex-1 flex items-center justify-center gap-2 rounded-[14px] transition-all active:scale-[0.98]"
            style={{
              height: 52,
              background: saved ? 'linear-gradient(135deg,#7C3AED,#EC4899)' : 'rgba(124,58,237,0.12)',
              border: saved ? 'none' : '1px solid rgba(124,58,237,0.3)',
              cursor: 'pointer',
              boxShadow: saved ? '0 6px 20px rgba(124,58,237,0.4)' : 'none',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? 'white' : 'none'} stroke={saved ? 'white' : '#c4b5fd'} strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: saved ? '#fff' : '#c4b5fd' }}>
              {saved ? 'Saved' : 'Save Guide'}
            </span>
          </button>
          <button style={{ width: 52, height: 52, borderRadius: 14, background: '#151518', border: '1px solid #25252B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Rate Venue Sheet */}
      {ratingVenue && (
        <div className="absolute inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} onClick={() => setRatingVenue(null)}>
          <div className="w-full rounded-t-[28px] px-5 pt-5 pb-8" style={{ background: '#151518', border: '1px solid #25252B' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 100, margin: '0 auto 20px' }} />
            <p style={{ fontSize: '0.72rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{ratingVenue}</p>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: 5 }}>How do you rate this spot?</h2>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginBottom: 18 }}>Your feedback helps others discover the best.</p>

            {[
              { icon: '❤️', label: 'Love it', sub: 'Absolutely amazing', color: '#EC4899' },
              { icon: '🔥', label: 'Must visit', sub: 'One of the best', color: '#f97316' },
              { icon: '👍', label: 'Good', sub: 'Enjoyed it', color: '#a3e635' },
              { icon: '😐', label: 'Overrated', sub: "Wasn't impressed", color: 'rgba(255,255,255,0.4)' },
              { icon: '✕',  label: 'Skip it', sub: 'Not for me', color: '#FF375F' },
            ].map(opt => (
              <button
                key={opt.label}
                onClick={() => setRatingVenue(null)}
                className="w-full flex items-center gap-4 rounded-[14px] px-4 py-3.5 mb-2 transition-all active:scale-[0.98]"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer' }}
              >
                <span style={{ fontSize: '1.2rem', width: 28, textAlign: 'center' }}>{opt.icon}</span>
                <div className="flex-1 text-left">
                  <p style={{ fontSize: '0.88rem', fontWeight: 800, color: opt.color }}>{opt.label}</p>
                  <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)' }}>{opt.sub}</p>
                </div>
              </button>
            ))}

            <div className="mt-3">
              <input
                type="text"
                placeholder="Add a comment (optional)"
                className="w-full rounded-[14px] px-4 py-3 outline-none"
                style={{ background: '#09090B', border: '1px solid #25252B', color: '#fff', fontSize: '0.85rem', fontWeight: 500 }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
