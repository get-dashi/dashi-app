'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CATEGORIES = ['Bars & Nightlife', 'Restaurants', 'Date Night', 'Brunch', 'Live Music', 'Rooftops', 'Coffee & Cafes', 'Hidden Gems', 'Sushi & Japanese', 'Taco Spots']
const COVER_OPTIONS = [
  'https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=600&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
]
type Visibility = 'private' | 'shared' | 'published'

export default function CreateGuidePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [category, setCategory] = useState('Bars & Nightlife')
  const [visibility, setVisibility] = useState<Visibility>('published')
  const [coverImg, setCoverImg] = useState(COVER_OPTIONS[0])
  const [showCoverPicker, setShowCoverPicker] = useState(false)
  const [showCatPicker, setShowCatPicker] = useState(false)
  const placesAdded = 12

  const canPublish = name.trim().length > 0

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: '#09090B' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 flex-shrink-0">
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 600 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <h1 style={{ fontSize: '1rem', fontWeight: 900 }}>Create New Guide</h1>
        <div style={{ width: 28 }} />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Cover photo */}
        <div style={{ position: 'relative', height: 180, background: '#151518', marginBottom: 24 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={coverImg} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />
          <button
            onClick={() => setShowCoverPicker(true)}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all active:scale-95"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit Cover
          </button>
        </div>

        <div className="px-5 flex flex-col gap-5 pb-6">
          {/* Name */}
          <div>
            <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Guide Name</p>
            <input
              type="text"
              placeholder="Austin Rooftop Bars"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full rounded-[14px] px-4 py-3.5 outline-none"
              style={{ background: '#151518', border: `1px solid ${name ? 'rgba(124,58,237,0.5)' : '#25252B'}`, color: '#fff', fontSize: '0.92rem', fontWeight: 600 }}
            />
          </div>

          {/* Description */}
          <div>
            <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Describe your guide</p>
            <textarea
              placeholder="The best rooftop bars in Austin perfect for sunsets, drinks and good vibes."
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows={3}
              className="w-full rounded-[14px] px-4 py-3.5 outline-none resize-none"
              style={{ background: '#151518', border: '1px solid #25252B', color: '#fff', fontSize: '0.85rem', fontWeight: 500, lineHeight: 1.5 }}
            />
          </div>

          {/* Category */}
          <div style={{ position: 'relative' }}>
            <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Category</p>
            <button
              onClick={() => setShowCatPicker(v => !v)}
              className="w-full flex items-center justify-between rounded-[14px] px-4 py-3.5 text-left"
              style={{ background: '#151518', border: '1px solid #25252B', color: '#fff', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}
            >
              {category}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {showCatPicker && (
              <div className="absolute left-0 right-0 z-20 rounded-[16px] overflow-hidden mt-1"
                style={{ background: '#151518', border: '1px solid #25252B', boxShadow: '0 16px 48px rgba(0,0,0,0.7)', maxHeight: 240, overflowY: 'auto' }}>
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => { setCategory(cat); setShowCatPicker(false) }}
                    className="w-full text-left px-4 py-3 transition-all"
                    style={{ background: category === cat ? 'rgba(124,58,237,0.15)' : 'transparent', color: category === cat ? '#c4b5fd' : 'rgba(255,255,255,0.65)', fontSize: '0.85rem', fontWeight: category === cat ? 700 : 500, border: 'none', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add places */}
          <div>
            <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Add places</p>
            <button
              className="w-full flex items-center justify-between rounded-[14px] px-4 py-3.5"
              style={{ background: '#151518', border: '1px solid #25252B', color: '#fff', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}
            >
              <span>{placesAdded > 0 ? `${placesAdded} venues added` : 'Search & add venues…'}</span>
              <div className="flex items-center gap-2">
                {placesAdded > 0 && <span style={{ background: 'linear-gradient(135deg,#7C3AED,#EC4899)', borderRadius: 100, padding: '2px 8px', fontSize: '0.62rem', fontWeight: 800, color: '#fff' }}>{placesAdded}</span>}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </button>
          </div>

          {/* Visibility */}
          <div>
            <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Visibility</p>
            <div className="flex flex-col gap-2.5">
              {[
                { key: 'private' as Visibility, icon: '🔒', title: 'Private (only me)', sub: 'Only you can see this guide' },
                { key: 'shared'  as Visibility, icon: '🔗', title: 'Shared with friends', sub: 'People with link can view' },
                { key: 'published' as Visibility, icon: '🌐', title: 'Publish to Dashi', sub: 'Anyone on Dashi can discover and rank', highlight: true },
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setVisibility(opt.key)}
                  className="flex items-start gap-3.5 rounded-[16px] px-4 py-4 text-left w-full transition-all"
                  style={{
                    background: visibility === opt.key
                      ? (opt.highlight ? 'rgba(124,58,237,0.18)' : 'rgba(255,255,255,0.07)')
                      : '#151518',
                    border: `1.5px solid ${visibility === opt.key
                      ? (opt.highlight ? 'rgba(124,58,237,0.6)' : 'rgba(255,255,255,0.2)')
                      : '#25252B'}`,
                    boxShadow: visibility === opt.key && opt.highlight ? '0 0 0 3px rgba(124,58,237,0.12)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: '1.2rem', marginTop: 1 }}>{opt.icon}</span>
                  <div className="flex-1">
                    <p style={{ fontSize: '0.85rem', fontWeight: 800, color: visibility === opt.key && opt.highlight ? '#c4b5fd' : '#fff', marginBottom: 2 }}>{opt.title}</p>
                    <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)' }}>{opt.sub}</p>
                  </div>
                  {/* Radio dot */}
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', border: `2px solid ${visibility === opt.key ? (opt.highlight ? '#7C3AED' : '#fff') : 'rgba(255,255,255,0.25)'}`,
                    background: visibility === opt.key ? (opt.highlight ? 'linear-gradient(135deg,#7C3AED,#EC4899)' : '#fff') : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2,
                  }}>
                    {visibility === opt.key && <div style={{ width: 8, height: 8, borderRadius: '50%', background: visibility === opt.key && !opt.highlight ? '#09090B' : 'transparent' }} />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Publish CTA */}
      <div className="px-5 py-4 flex-shrink-0" style={{ borderTop: '1px solid #25252B' }}>
        <button
          disabled={!canPublish}
          onClick={() => router.push('/guides/austin-rooftops')}
          className="w-full rounded-[14px] transition-all active:scale-[0.98]"
          style={{
            height: 54,
            background: canPublish ? 'linear-gradient(135deg,#7C3AED,#EC4899)' : '#25252B',
            color: canPublish ? '#fff' : 'rgba(255,255,255,0.3)',
            fontSize: '0.95rem', fontWeight: 800, border: 'none',
            cursor: canPublish ? 'pointer' : 'not-allowed',
            boxShadow: canPublish ? '0 8px 24px rgba(124,58,237,0.4)' : 'none',
          }}
        >
          {visibility === 'published' ? 'Publish Guide to Dashi ✨' : visibility === 'shared' ? 'Save & Share Guide' : 'Save Guide'}
        </button>
      </div>

      {/* Cover picker sheet */}
      {showCoverPicker && (
        <div className="absolute inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.75)' }} onClick={() => setShowCoverPicker(false)}>
          <div className="w-full rounded-t-[28px] px-5 pt-5 pb-8" style={{ background: '#151518', border: '1px solid #25252B' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 100, margin: '0 auto 16px' }} />
            <p style={{ fontSize: '0.88rem', fontWeight: 800, marginBottom: 14, textAlign: 'center' }}>Choose Cover Photo</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {COVER_OPTIONS.map((img, i) => (
                <button key={i} onClick={() => { setCoverImg(img); setShowCoverPicker(false) }}
                  className="rounded-[16px] overflow-hidden transition-all"
                  style={{ height: 100, border: coverImg === img ? '2px solid #7C3AED' : '2px solid transparent', cursor: 'pointer', boxShadow: coverImg === img ? '0 0 0 3px rgba(124,58,237,0.3)' : 'none' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
            <button style={{ width: '100%', height: 46, borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid #25252B', color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
              📷  Upload from Camera Roll
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
