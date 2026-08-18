'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Visibility = 'private' | 'shared' | 'published'

export default function RemixGuidePage() {
  const router = useRouter()
  const [name, setName] = useState('My Austin Date Night Spots')
  const [visibility, setVisibility] = useState<Visibility>('private')

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: '#09090B' }}>
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex-shrink-0">
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', marginBottom: 20, display: 'flex', alignItems: 'center' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 no-scrollbar">
        {/* Remix icon + title */}
        <div className="flex flex-col items-center text-center mb-8 pt-4">
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="url(#remix-g)" strokeWidth="2" strokeLinecap="round">
              <defs>
                <linearGradient id="remix-g" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7C3AED"/><stop offset="100%" stopColor="#EC4899"/>
                </linearGradient>
              </defs>
              <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
              <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 8 }}>Remix This Guide</h1>
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', maxWidth: 260, lineHeight: 1.55 }}>
            Make it your own version. Add, remove or reorder places.
          </p>
        </div>

        {/* Original guide credit */}
        <div className="flex items-center gap-3 rounded-[14px] p-3.5 mb-5" style={{ background: '#151518', border: '1px solid #25252B' }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=80&q=70" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div className="flex-1">
            <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>Remixing</p>
            <p style={{ fontSize: '0.85rem', fontWeight: 800 }}>Austin Rooftop Bars</p>
            <p style={{ fontSize: '0.62rem', color: '#EC4899', fontWeight: 700 }}>by Ricky · 12 places</p>
          </div>
        </div>

        {/* New name */}
        <div className="mb-5">
          <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>New Guide Name</p>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full rounded-[14px] px-4 py-3.5 outline-none"
            style={{ background: '#151518', border: '1px solid rgba(124,58,237,0.4)', color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}
          />
        </div>

        {/* Visibility */}
        <div className="mb-6">
          <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Who can see this?</p>
          {[
            { key: 'private' as Visibility, icon: '🔒', title: 'Private (only me)' },
            { key: 'shared'  as Visibility, icon: '🔗', title: 'Shared with friends' },
            { key: 'published' as Visibility, icon: '🌐', title: 'Publish to Dashi', highlight: true },
          ].map(opt => (
            <button key={opt.key} onClick={() => setVisibility(opt.key)}
              className="w-full flex items-center gap-3.5 rounded-[14px] px-4 py-3.5 mb-2 text-left transition-all"
              style={{
                background: visibility === opt.key ? (opt.highlight ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.07)') : '#151518',
                border: `1.5px solid ${visibility === opt.key ? (opt.highlight ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.2)') : '#25252B'}`,
                cursor: 'pointer',
              }}>
              <span style={{ fontSize: '1.1rem' }}>{opt.icon}</span>
              <span style={{ flex: 1, fontSize: '0.85rem', fontWeight: 700, color: visibility === opt.key && opt.highlight ? '#c4b5fd' : '#fff' }}>{opt.title}</span>
              <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${visibility === opt.key ? (opt.highlight ? '#7C3AED' : '#fff') : 'rgba(255,255,255,0.2)'}`, background: visibility === opt.key ? (opt.highlight ? 'linear-gradient(135deg,#7C3AED,#EC4899)' : '#fff') : 'transparent', flexShrink: 0 }} />
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 py-4 flex-shrink-0" style={{ borderTop: '1px solid #25252B' }}>
        <button
          onClick={() => router.push('/v2/guides/remixes')}
          className="w-full rounded-[14px] transition-all active:scale-[0.98]"
          style={{ height: 54, background: 'linear-gradient(135deg,#7C3AED,#EC4899)', color: '#fff', fontSize: '0.95rem', fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(124,58,237,0.4)' }}
        >
          Create Remix
        </button>
      </div>
    </div>
  )
}
