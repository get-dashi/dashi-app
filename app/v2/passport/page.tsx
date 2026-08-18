'use client'

import { useRouter } from 'next/navigation'

const TOP_CITIES = [
  { city: 'Austin', flag: '🤠', places: 89, bar: 100 },
  { city: 'Mexico City', flag: '🇲🇽', places: 23, bar: 26 },
  { city: 'Miami', flag: '🌴', places: 15, bar: 17 },
]

export default function V2PassportPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: '#09090B' }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-0 flex-shrink-0">
        <h1 style={{ fontSize: '1.3rem', fontWeight: 900, letterSpacing: '-0.02em', textAlign: 'center', marginBottom: 20 }}>
          Your Dashi Passport
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-5 no-scrollbar">
        {/* Profile card */}
        <div className="rounded-[24px] p-5 mb-4" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(236,72,153,0.15) 100%)', border: '1px solid rgba(124,58,237,0.3)' }}>
          <div className="flex items-center gap-3.5 mb-5">
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontWeight: 900, color: '#fff', flexShrink: 0, boxShadow: '0 6px 20px rgba(124,58,237,0.4)' }}>R</div>
            <div>
              <p style={{ fontSize: '1.1rem', fontWeight: 900 }}>Ricky</p>
              <p style={{ fontSize: '0.68rem', fontWeight: 800, background: 'linear-gradient(135deg,#7C3AED,#EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Top Austin Foodie ✨
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Places Visited', value: '127', icon: '📍' },
              { label: 'Guides Created', value: '43',  icon: '📖' },
              { label: 'Points',         value: '18.7K', icon: '⚡' },
            ].map(s => (
              <div key={s.label} className="rounded-[16px] p-3 text-center" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ fontSize: '1rem', marginBottom: 3 }}>{s.icon}</p>
                <p style={{ fontSize: '1.15rem', fontWeight: 900, background: 'linear-gradient(135deg,#7C3AED,#EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</p>
                <p style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, marginTop: 3, lineHeight: 1.3 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Cities */}
        <div className="rounded-[20px] p-4 mb-4" style={{ background: '#151518', border: '1px solid #25252B' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 800, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Top Cities</p>
          {TOP_CITIES.map((c, i) => (
            <div key={c.city} style={{ marginBottom: i < TOP_CITIES.length - 1 ? 14 : 0 }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: '1.1rem' }}>{c.flag}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{c.city}</span>
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, background: 'linear-gradient(135deg,#7C3AED,#EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {c.places} places
                </span>
              </div>
              <div style={{ height: 5, borderRadius: 100, background: '#25252B', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${c.bar}%`, background: 'linear-gradient(90deg,#7C3AED,#EC4899)', borderRadius: 100 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Group Activity shortcut */}
        <button
          onClick={() => router.push('/v2/passport-activity')}
          className="w-full flex items-center gap-3.5 rounded-[20px] p-4 mb-4 transition-all active:scale-[0.98]"
          style={{ background: '#151518', border: '1px solid #25252B', cursor: 'pointer' }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(236,72,153,0.12)', border: '1px solid rgba(236,72,153,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(236,72,153,0.85)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className="flex-1">
            <p style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f9a8d4', marginBottom: 2 }}>Group Activity</p>
            <p style={{ fontSize: '0.63rem', color: 'rgba(255,255,255,0.38)' }}>Weekend Crew · 23 plans · 4.8★ avg</p>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>

        {/* Badges */}
        <div className="rounded-[20px] p-4 mb-4" style={{ background: '#151518', border: '1px solid #25252B' }}>
          <div className="flex items-center justify-between mb-12">
            <p style={{ fontSize: '0.72rem', fontWeight: 800, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Badges Earned</p>
            <span style={{ fontSize: '0.65rem', color: '#EC4899', fontWeight: 700 }}>12 of 30</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { e: '🌮', l: 'Taco Club',     unlocked: true },
              { e: '🍣', l: 'Omakase Club',  unlocked: true },
              { e: '⭐', l: 'Michelin Hunt', unlocked: true },
              { e: '🔥', l: 'Hestia Regular',unlocked: true },
              { e: '🌆', l: 'Rooftop Royal', unlocked: true },
              { e: '🥂', l: 'Fine Diner',    unlocked: true },
              { e: '🎵', l: 'Music Lover',   unlocked: false },
              { e: '🌍', l: 'World Explorer',unlocked: false },
            ].map(b => (
              <div key={b.l} className="flex flex-col items-center gap-1.5 rounded-[14px] p-3" style={{ background: b.unlocked ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${b.unlocked ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.06)'}`, opacity: b.unlocked ? 1 : 0.45 }}>
                <span style={{ fontSize: '1.4rem' }}>{b.e}</span>
                <p style={{ fontSize: '0.48rem', fontWeight: 700, color: b.unlocked ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.25)', textAlign: 'center', lineHeight: 1.3 }}>{b.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
