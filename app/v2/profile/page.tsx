'use client'

import { useRouter } from 'next/navigation'
import { GradientButton } from '@/components/v2/GradientButton'

const PREF_TAGS = ['Japanese', 'Mexican', 'Cocktails', 'Date Night', 'Rooftop', 'Live Music']

export default function V2ProfilePage() {
  const router = useRouter()

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: '#09090B' }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-5">
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.03em' }}>Profile</h1>
          <button
            style={{
              fontSize: '0.72rem', fontWeight: 700, padding: '6px 14px', borderRadius: 10,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
            }}
          >
            Edit
          </button>
        </div>

        {/* Avatar + name */}
        <div className="flex flex-col items-center pb-5" style={{ borderBottom: '1px solid #25252B' }}>
          <div
            className="flex items-center justify-center rounded-full mb-3"
            style={{
              width: 80, height: 80,
              background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
              fontSize: '2rem', fontWeight: 900, color: '#fff',
              boxShadow: '0 8px 30px rgba(124,58,237,0.4)',
            }}
          >
            R
          </div>
          <p style={{ fontSize: '1.2rem', fontWeight: 900 }}>Ricky Flores</p>
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>@r4atx · Austin, TX</p>

          {/* Mini stats */}
          <div className="flex gap-6 mt-4">
            {[
              { label: 'Saved', value: 3 },
              { label: 'Plans', value: 23 },
              { label: 'Groups', value: 3 },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p style={{ fontSize: '1.1rem', fontWeight: 900, background: 'linear-gradient(135deg, #7C3AED, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</p>
                <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 no-scrollbar">
        {/* Preferences */}
        <div className="rounded-[20px] p-4 mb-3 mt-3" style={{ background: '#151518', border: '1px solid #25252B' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 800, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>My Preferences</p>
          <div className="flex flex-wrap gap-2">
            {PREF_TAGS.map(tag => (
              <span
                key={tag}
                className="rounded-full px-3 py-1.5"
                style={{
                  background: 'rgba(124,58,237,0.15)',
                  border: '1px solid rgba(124,58,237,0.3)',
                  color: 'rgba(168,85,247,0.9)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                }}
              >
                {tag}
              </span>
            ))}
            <button
              style={{
                borderRadius: 100, padding: '6px 12px',
                background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
              }}
            >
              + Add
            </button>
          </div>
        </div>

        {/* Settings links */}
        <div className="rounded-[20px] overflow-hidden mb-3" style={{ background: '#151518', border: '1px solid #25252B' }}>
          {[
            { label: 'Passport & Activity', emoji: '🗺️', href: '/v2/passport' },
            { label: 'Notification Preferences', emoji: '🔔', href: '#' },
            { label: 'Connected Accounts', emoji: '🔗', href: '#' },
            { label: 'Privacy & Data', emoji: '🔒', href: '#' },
          ].map((item, i) => (
            <button
              key={item.label}
              onClick={() => item.href !== '#' && router.push(item.href)}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all active:bg-white/5"
              style={{ borderBottom: i < 3 ? '1px solid #25252B' : 'none', background: 'none', cursor: 'pointer' }}
            >
              <span style={{ fontSize: '1.1rem' }}>{item.emoji}</span>
              <span style={{ flex: 1, fontSize: '0.85rem', fontWeight: 600 }}>{item.label}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          ))}
        </div>

        {/* City selector */}
        <div className="rounded-[20px] p-4 mb-5" style={{ background: '#151518', border: '1px solid #25252B' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 800, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Home City</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span style={{ fontSize: '1.2rem' }}>🤠</span>
              <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>Austin, TX</span>
            </div>
            <button style={{
              fontSize: '0.72rem', fontWeight: 700, padding: '5px 12px', borderRadius: 10,
              background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
              color: 'rgba(168,85,247,0.8)', cursor: 'pointer',
            }}>
              Change
            </button>
          </div>
        </div>

        {/* Sign out */}
        <button
          className="w-full rounded-[14px] py-3 transition-all active:scale-[0.98]"
          style={{ background: 'rgba(255,55,95,0.08)', border: '1px solid rgba(255,55,95,0.2)', color: '#FF375F', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer' }}
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
