'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const VOTE_OPTIONS = [
  { id: 'loro',      name: 'Loro',  sub: 'Asian Smokehouse', rating: '4.7', reviews: '2,348', price: '$$',   area: 'Downtown',     dist: '1.2 mi', img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=120&q=75' },
  { id: 'uchi',      name: 'Uchi',  sub: 'Japanese · Sushi', rating: '4.8', reviews: '3,124', price: '$$$$', area: 'South Congress', dist: '1.6 mi', img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=120&q=75' },
  { id: 'este',      name: 'Este',  sub: 'Mexican · Contemporary', rating: '4.6', reviews: '1,842', price: '$$$', area: 'East Austin', dist: '2.1 mi', img: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=120&q=75' },
  { id: 'p6',        name: 'P6',    sub: 'Steakhouse',       rating: '4.5', reviews: '892',   price: '$$$$', area: 'Downtown',      dist: '1.5 mi', img: 'https://images.unsplash.com/photo-1558030006-450675393462?w=120&q=75' },
]

type VoteChoice = 'love' | 'maybe' | 'skip'

export default function VotePage() {
  const router = useRouter()
  const [votes, setVotes] = useState<Record<string, VoteChoice>>({})

  const vote = (id: string, choice: VoteChoice) => {
    setVotes(prev => {
      const next = { ...prev }
      if (prev[id] === choice) delete next[id]
      else next[id] = choice
      return next
    })
  }

  const allVoted = VOTE_OPTIONS.every(v => votes[v.id])

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: '#09090B' }}>
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex-shrink-0">
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        <h1 style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.02em', textAlign: 'center' }}>Vote</h1>
        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 3 }}>
          Everyone vote on your top choices
        </p>

        {/* Step progress mini */}
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {/* Step 1 done */}
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #7C3AED, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 900, color: '#fff' }}>✓</div>
          <div style={{ width: 32, height: 1, background: 'rgba(124,58,237,0.5)' }} />
          {/* Step 2 active */}
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #7C3AED, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.62rem', fontWeight: 900, color: '#fff', boxShadow: '0 0 12px rgba(236,72,153,0.4)' }}>2</div>
          <div style={{ width: 32, height: 1, background: '#25252B' }} />
          {/* Step 3 */}
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#25252B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.62rem', fontWeight: 900, color: 'rgba(255,255,255,0.3)' }}>3</div>
          <div style={{ width: 32, height: 1, background: '#25252B' }} />
          {/* Step 4 */}
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#25252B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.62rem', fontWeight: 900, color: 'rgba(255,255,255,0.3)' }}>4</div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 no-scrollbar">
        <div className="flex flex-col gap-3 pt-1">
          {VOTE_OPTIONS.map(venue => {
            const myVote = votes[venue.id]
            return (
              <div
                key={venue.id}
                className="flex items-center gap-3 rounded-[18px] p-3.5 transition-all"
                style={{
                  background: '#151518',
                  border: `1.5px solid ${myVote ? 'rgba(124,58,237,0.4)' : '#25252B'}`,
                }}
              >
                {/* Thumbnail */}
                <div style={{ width: 72, height: 72, borderRadius: 14, overflow: 'hidden', flexShrink: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={venue.img} alt={venue.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: '0.92rem', fontWeight: 800, marginBottom: 1 }}>{venue.name}</p>
                  <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.45)', marginBottom: 3 }}>{venue.sub}</p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span style={{ fontSize: '0.6rem', color: '#FFD60A', fontWeight: 700 }}>★ {venue.rating}</span>
                    <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)' }}>({venue.reviews})</span>
                    <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)' }}>·</span>
                    <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{venue.price}</span>
                    <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)' }}>·</span>
                    <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 2 }}>
                      📍 {venue.area} · {venue.dist}
                    </span>
                  </div>
                </div>

                {/* Vote column */}
                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => vote(venue.id, 'love')}
                    className="flex items-center gap-1 rounded-[10px] px-2.5 py-2 transition-all active:scale-90"
                    style={{
                      background: myVote === 'love' ? 'rgba(236,72,153,0.2)' : 'rgba(255,255,255,0.05)',
                      border: `1.5px solid ${myVote === 'love' ? 'rgba(236,72,153,0.6)' : 'rgba(255,255,255,0.08)'}`,
                      cursor: 'pointer', minWidth: 58,
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill={myVote === 'love' ? '#EC4899' : 'none'} stroke={myVote === 'love' ? '#EC4899' : 'rgba(255,255,255,0.4)'} strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    <span style={{ fontSize: '0.62rem', fontWeight: 800, color: myVote === 'love' ? '#EC4899' : 'rgba(255,255,255,0.4)' }}>Love</span>
                  </button>
                  <button
                    onClick={() => vote(venue.id, 'skip')}
                    className="flex items-center gap-1 rounded-[10px] px-2.5 py-1.5 transition-all active:scale-90"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer', minWidth: 58,
                    }}
                  >
                    <span style={{ fontSize: '0.62rem', fontWeight: 700, color: myVote === 'skip' ? '#FF375F' : 'rgba(255,255,255,0.3)', textDecoration: myVote === 'skip' ? 'underline' : 'none' }}>
                      {myVote === 'maybe' ? '♡ Maybe' : '↩ Skip'}
                    </span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 flex-shrink-0">
        {/* "Votes are private" badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>Votes are private</span>
          </div>
          {allVoted && (
            <div className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span style={{ fontSize: '0.65rem', color: '#4ade80', fontWeight: 700 }}>Everyone has voted! ✓</span>
            </div>
          )}
        </div>

        <button
          onClick={() => router.push('/groups/weekend-crew/match')}
          disabled={!allVoted}
          className="w-full rounded-[14px] transition-all active:scale-[0.98]"
          style={{
            height: 54,
            background: allVoted ? 'linear-gradient(135deg, #7C3AED, #EC4899)' : '#25252B',
            color: allVoted ? '#fff' : 'rgba(255,255,255,0.3)',
            fontSize: '0.95rem', fontWeight: 800, border: 'none', cursor: allVoted ? 'pointer' : 'not-allowed',
            boxShadow: allVoted ? '0 8px 24px rgba(124,58,237,0.4)' : 'none',
          }}
        >
          {allVoted ? 'See Results →' : `Vote all ${Object.keys(votes).length}/${VOTE_OPTIONS.length} to continue`}
        </button>
      </div>
    </div>
  )
}
