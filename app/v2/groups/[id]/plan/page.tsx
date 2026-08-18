'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Step = 1 | 2 | 3 | 4

const STEPS = [
  { n: 1, label: 'Preferences' },
  { n: 2, label: 'Vote' },
  { n: 3, label: 'Itinerary' },
  { n: 4, label: 'Confirm' },
]

// Settings-row pickers
const PREF_OPTIONS: Record<string, string[]> = {
  cuisine:    ['Any', 'Japanese', 'Mexican', 'Italian', 'American', 'BBQ', 'Thai'],
  vibe:       ['Lively', 'Chill', 'Romantic', 'Upscale', 'Casual', 'Rooftop'],
  budget:     ['$25–$50', '$50–$100', '$100–$150', '$150+'],
  drinks:     ['Yes please', 'Maybe', 'No thanks'],
  dietary:    ['None', 'Vegetarian', 'Vegan', 'Gluten Free', 'Halal'],
  homeTime:   ['10 PM', '11 PM', 'Around Midnight', '1 AM', 'No limit'],
}

function PrefRow({
  icon, label, value, options, onChange,
}: { icon: string; label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-4 transition-all active:bg-white/5"
        style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <span style={{ fontSize: '1.1rem', width: 24, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
        <span style={{ flex: 1, fontSize: '0.88rem', fontWeight: 600, color: '#fff' }}>{label}</span>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#EC4899', marginRight: 6 }}>{value}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-4 z-20 rounded-[16px] overflow-hidden"
          style={{ top: '100%', background: '#151518', border: '1px solid #25252B', boxShadow: '0 12px 40px rgba(0,0,0,0.6)', minWidth: 160 }}
        >
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false) }}
              className="w-full text-left px-4 py-3 transition-all"
              style={{
                background: value === opt ? 'rgba(236,72,153,0.15)' : 'transparent',
                color: value === opt ? '#EC4899' : 'rgba(255,255,255,0.7)',
                fontSize: '0.82rem',
                fontWeight: value === opt ? 700 : 500,
                border: 'none', cursor: 'pointer',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const PREF_ROWS = [
  { key: 'cuisine', icon: '🍽', label: 'Cuisine',             defaultVal: 'Any' },
  { key: 'vibe',    icon: '✨', label: 'Vibe',                defaultVal: 'Lively' },
  { key: 'budget',  icon: '💵', label: 'Budget',              defaultVal: '$50–$100' },
  { key: 'drinks',  icon: '🍸', label: 'Drinks',              defaultVal: 'Yes please' },
  { key: 'dietary', icon: '🥗', label: 'Dietary Restrictions',defaultVal: 'Vegetarian' },
  { key: 'homeTime',icon: '🏠', label: 'Home Time',           defaultVal: 'Around Midnight' },
]

const TIMELINE_STOPS = [
  { time: '6:00 PM',  type: 'Happy Hour',  name: 'Small Victory',         sub: 'Rooftop · Cocktails · 0.8 mi',       img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=80&q=70' },
  { time: '7:30 PM',  type: 'Dinner',      name: 'Loro Asian Smokehouse', sub: 'Asian · $$$ · 1.2 mi',               img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=80&q=70' },
  { time: '9:30 PM',  type: 'Live Music',  name: 'Elephant Room',         sub: 'Live Jazz · 1.0 mi',                 img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=80&q=70' },
  { time: '11:30 PM', type: 'Late Night',  name: "Goldie's",              sub: 'Cocktails · 0.6 mi',                 img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=80&q=70' },
]

export default function PlanPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [prefs, setPrefs] = useState<Record<string, string>>(
    Object.fromEntries(PREF_ROWS.map(r => [r.key, r.defaultVal]))
  )
  const [note, setNote] = useState('')

  const setPref = (key: string, val: string) => setPrefs(p => ({ ...p, [key]: val }))

  const nextStep = () => {
    if (step < 4) setStep((step + 1) as Step)
    if (step === 2) router.push('/v2/groups/weekend-crew/vote')
  }

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: '#09090B' }}>
      {/* Header */}
      <div className="px-5 pt-4 pb-0 flex-shrink-0">
        <button
          onClick={() => { if (step > 1) setStep((step - 1) as Step); else router.back() }}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', marginBottom: 2 }}>Plan: Friday, May 31</p>
        <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>Austin, TX</p>

        {/* Step progress — circles with connecting lines */}
        <div className="flex items-center mb-4">
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex items-center" style={{ flex: i < STEPS.length - 1 ? 1 : 0 }}>
              <div className="flex flex-col items-center" style={{ minWidth: 32 }}>
                <div
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: 28, height: 28,
                    background: step > s.n ? 'linear-gradient(135deg, #7C3AED, #EC4899)' : step === s.n ? 'linear-gradient(135deg, #7C3AED, #EC4899)' : '#25252B',
                    border: step === s.n ? '2px solid rgba(236,72,153,0.5)' : 'none',
                    boxShadow: step === s.n ? '0 0 12px rgba(236,72,153,0.4)' : 'none',
                    fontSize: '0.62rem',
                    fontWeight: 900,
                    color: step >= s.n ? '#fff' : 'rgba(255,255,255,0.3)',
                  }}
                >
                  {step > s.n ? '✓' : s.n}
                </div>
                <span style={{ fontSize: '0.52rem', color: step >= s.n ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)', fontWeight: step === s.n ? 800 : 500, marginTop: 4 }}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 1, background: step > s.n ? 'linear-gradient(90deg, #7C3AED, #EC4899)' : '#25252B', margin: '0 4px', marginBottom: 16 }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar">

        {step === 1 && (
          <>
            <div className="px-5 mb-4">
              <h2 style={{ fontSize: '1.3rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6 }}>
                What are you in the mood for?
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>
                Help Dashi find the perfect night for the group.
              </p>
            </div>

            {/* Pref rows */}
            <div className="mx-5 rounded-[20px] overflow-hidden" style={{ background: '#151518', border: '1px solid #25252B' }}>
              {PREF_ROWS.map((row, i) => (
                <div key={row.key} style={{ borderBottom: i < PREF_ROWS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                  <PrefRow
                    icon={row.icon}
                    label={row.label}
                    value={prefs[row.key]}
                    options={PREF_OPTIONS[row.key]}
                    onChange={v => setPref(row.key, v)}
                  />
                </div>
              ))}
            </div>

            {/* Optional note */}
            <div className="px-5 mt-3 mb-4 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              <input
                type="text"
                placeholder="Add a note for the group (optional)"
                value={note}
                onChange={e => setNote(e.target.value)}
                style={{ flex: 1, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', outline: 'none', fontWeight: 500 }}
              />
            </div>
          </>
        )}

        {step === 2 && (
          <div className="px-5 pt-2">
            <h2 style={{ fontSize: '1.3rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 4 }}>
              Waiting for votes…
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>
              Preferences sent! Everyone has to vote before results show.
            </p>
            <div className="rounded-[20px] overflow-hidden" style={{ background: '#151518', border: '1px solid #25252B' }}>
              {['Ricky', 'Sofia', 'Jake', 'Maria'].map((name, i, arr) => (
                <div key={name} className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{name}</span>
                  {name === 'Ricky'
                    ? <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#4ade80' }}>✓ Voted</span>
                    : <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>Waiting…</span>
                  }
                </div>
              ))}
            </div>
            <button onClick={() => router.push('/v2/groups/weekend-crew/vote')} style={{ marginTop: 16, fontSize: '0.8rem', color: '#EC4899', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
              Preview venue options →
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="px-5 pt-2">
            <h2 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: 4 }}>Tonight&apos;s Itinerary</h2>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>Built from your group&apos;s preferences</p>

            {TIMELINE_STOPS.map((stop, i) => (
              <div key={stop.name} className="flex gap-3 mb-0">
                {/* Time + dot + line */}
                <div className="flex flex-col items-center" style={{ minWidth: 60, flexShrink: 0 }}>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', marginBottom: 6 }}>{stop.time}</span>
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
                    boxShadow: '0 0 8px rgba(124,58,237,0.5)',
                  }} />
                  {i < TIMELINE_STOPS.length - 1 && (
                    <div style={{ width: 2, flex: 1, minHeight: 36, background: 'rgba(124,58,237,0.3)', borderRadius: 1, margin: '4px 0' }} />
                  )}
                </div>

                {/* Card */}
                <div className="flex-1 flex items-start gap-3 rounded-[14px] p-3 mb-4" style={{ background: '#151518', border: '1px solid #25252B' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.55rem', fontWeight: 800, color: 'rgba(168,85,247,0.8)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{stop.type}</p>
                    <p style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: 2 }}>{stop.name}</p>
                    <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>{stop.sub}</p>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={stop.img} alt={stop.name} style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 4 && (
          <div className="px-5 pt-4 text-center flex flex-col items-center gap-4">
            <div style={{ fontSize: '3rem' }}>🎉</div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 900 }}>Plan confirmed!</h2>
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)' }}>Sharing with Weekend Crew…</p>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="px-5 py-4 flex-shrink-0">
        {step === 1 && (
          <button
            onClick={() => setStep(2)}
            className="w-full rounded-[14px] transition-all active:scale-[0.98]"
            style={{ height: 54, background: 'linear-gradient(135deg, #7C3AED, #EC4899)', color: '#fff', fontSize: '0.95rem', fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(124,58,237,0.4)' }}
          >
            Next: Vote on Options
          </button>
        )}
        {step === 2 && (
          <button
            onClick={() => setStep(3)}
            className="w-full rounded-[14px] transition-all active:scale-[0.98]"
            style={{ height: 54, background: 'linear-gradient(135deg, #7C3AED, #EC4899)', color: '#fff', fontSize: '0.95rem', fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(124,58,237,0.4)' }}
          >
            See Itinerary →
          </button>
        )}
        {step === 3 && (
          <div className="flex flex-col gap-2.5">
            <button onClick={() => setStep(4)} className="w-full rounded-[14px] transition-all active:scale-[0.98]" style={{ height: 54, background: 'linear-gradient(135deg, #7C3AED, #EC4899)', color: '#fff', fontSize: '0.95rem', fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(124,58,237,0.4)' }}>
              Approve Plan
            </button>
            <button style={{ height: 46, background: 'none', border: '1px solid #25252B', borderRadius: 14, color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
              Edit Plan
            </button>
          </div>
        )}
        {step === 4 && (
          <button onClick={() => router.push('/v2/groups/weekend-crew/match')} className="w-full rounded-[14px] transition-all active:scale-[0.98]" style={{ height: 54, background: 'linear-gradient(135deg, #7C3AED, #EC4899)', color: '#fff', fontSize: '0.95rem', fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(124,58,237,0.4)' }}>
            Share with Group 🎉
          </button>
        )}
      </div>
    </div>
  )
}
