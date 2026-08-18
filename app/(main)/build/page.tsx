'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const WHO_OPTIONS = [
  { id: 'couple',   label: 'Couple',   emoji: '👫' },
  { id: 'friends',  label: 'Friends',  emoji: '👥' },
  { id: 'family',   label: 'Family',   emoji: '👨‍👩‍👧' },
  { id: 'visitors', label: 'Visitors', emoji: '🧳' },
]

export default function BuildMyNightPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: '#09090B' }}>
      {/* Header */}
      <div className="px-5 pt-4 pb-0 flex-shrink-0">
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        <h1 style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 6 }}>
          Build My Night ✨
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', marginBottom: 28 }}>
          Who are you with?
        </p>
      </div>

      {/* Who options */}
      <div className="flex-1 px-5 flex flex-col gap-3">
        {WHO_OPTIONS.map(opt => (
          <button
            key={opt.id}
            onClick={() => setSelected(opt.id)}
            className="flex items-center gap-4 rounded-[18px] px-5 py-4.5 transition-all active:scale-[0.98] w-full text-left"
            style={{
              background: selected === opt.id ? 'rgba(124,58,237,0.12)' : '#151518',
              border: `1.5px solid ${selected === opt.id ? 'rgba(124,58,237,0.5)' : '#25252B'}`,
              cursor: 'pointer',
              boxShadow: selected === opt.id ? '0 0 0 3px rgba(124,58,237,0.1)' : 'none',
              padding: '18px 20px',
            }}
          >
            <span style={{ fontSize: '1.4rem' }}>{opt.emoji}</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: selected === opt.id ? '#fff' : 'rgba(255,255,255,0.75)' }}>
              {opt.label}
            </span>
          </button>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="px-5 py-5 flex-shrink-0">
        <button
          onClick={() => selected && router.push('/groups/weekend-crew/plan')}
          disabled={!selected}
          className="w-full rounded-[14px] transition-all active:scale-[0.98]"
          style={{
            height: 56,
            background: selected ? 'linear-gradient(135deg, #EC4899, #7C3AED)' : '#25252B',
            color: selected ? '#fff' : 'rgba(255,255,255,0.3)',
            fontSize: '1rem', fontWeight: 800, border: 'none',
            cursor: selected ? 'pointer' : 'not-allowed',
            boxShadow: selected ? '0 8px 24px rgba(236,72,153,0.4)' : 'none',
            marginBottom: 10,
          }}
        >
          Next
        </button>
        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
          Dashi will create the perfect night based on your vibe.
        </p>
      </div>
    </div>
  )
}
