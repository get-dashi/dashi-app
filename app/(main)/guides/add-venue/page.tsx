'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type VenueType = 'venue' | 'event' | 'note'
type Visibility = 'private' | 'shared' | 'published'

const VENUE_TYPES = ['Restaurant', 'Bar', 'Rooftop Bar', 'Cocktail Bar', 'Coffee Shop', 'Live Music Venue', 'Event Space', 'Hotel', 'Spa', 'Hidden Gem']

const SUGGESTED_TAGS = ['Hidden Gem', 'Romantic', 'Sunset Views', 'Late Night', 'Date Night', 'Dog Friendly', 'Outdoor', 'Live Music', 'Cocktails', 'Instagrammable']

export default function AddVenuePage() {
  const router = useRouter()
  const [type, setType] = useState<VenueType>('venue')
  const [name, setName] = useState('')
  const [venueType, setVenueType] = useState('Rooftop Bar')
  const [location, setLocation] = useState('Austin, TX')
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState<string[]>(['Hidden Gem', 'Romantic'])
  const [visibility, setVisibility] = useState<Visibility>('private')
  const [showTypePicker, setShowTypePicker] = useState(false)
  const [newTag, setNewTag] = useState('')

  const addTag = (tag: string) => {
    if (!tags.includes(tag)) setTags(t => [...t, tag])
  }
  const removeTag = (tag: string) => setTags(t => t.filter(x => x !== tag))

  const canSave = name.trim().length > 0

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: '#09090B' }}>
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex-shrink-0 flex items-center gap-3">
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h1 style={{ fontSize: '1rem', fontWeight: 900 }}>Add Your Own Venue</h1>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="px-5 pb-6">
          {/* Type tabs */}
          <div className="flex gap-2 mb-5">
            {([['venue','Venue'],['event','Event'],['note','Note']] as const).map(([key, label]) => (
              <button key={key} onClick={() => setType(key)}
                className="flex-1 rounded-[12px] py-2.5 transition-all"
                style={{
                  background: type === key ? 'linear-gradient(135deg,#7C3AED,#EC4899)' : '#151518',
                  border: type === key ? 'none' : '1px solid #25252B',
                  color: type === key ? '#fff' : 'rgba(255,255,255,0.45)',
                  fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                  boxShadow: type === key ? '0 4px 14px rgba(124,58,237,0.35)' : 'none',
                }}>
                {label}
              </button>
            ))}
          </div>

          {/* Photo upload */}
          <div
            className="w-full flex flex-col items-center justify-center rounded-[18px] mb-5"
            style={{ height: 130, background: '#151518', border: '1px dashed #25252B', cursor: 'pointer' }}
          >
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(168,85,247,0.7)" strokeWidth="2" strokeLinecap="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(168,85,247,0.7)', marginBottom: 2 }}>Add Photos</p>
            <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>Upload up to 5 photos</p>
          </div>

          {/* Name */}
          <div className="mb-4">
            <p style={{ fontSize: '0.62rem', fontWeight: 800, color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7 }}>Name</p>
            <input
              type="text"
              placeholder="Enter venue name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full rounded-[14px] px-4 py-3.5 outline-none"
              style={{ background: '#151518', border: `1px solid ${name ? 'rgba(124,58,237,0.5)' : '#25252B'}`, color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}
            />
          </div>

          {/* Type */}
          <div className="mb-4" style={{ position: 'relative' }}>
            <p style={{ fontSize: '0.62rem', fontWeight: 800, color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7 }}>Type</p>
            <button
              onClick={() => setShowTypePicker(v => !v)}
              className="w-full flex items-center justify-between rounded-[14px] px-4 py-3.5"
              style={{ background: '#151518', border: '1px solid #25252B', color: '#fff', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}
            >
              {venueType}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {showTypePicker && (
              <div className="absolute left-0 right-0 z-20 rounded-[16px] overflow-hidden mt-1" style={{ background: '#151518', border: '1px solid #25252B', boxShadow: '0 16px 48px rgba(0,0,0,0.7)', maxHeight: 220, overflowY: 'auto' }}>
                {VENUE_TYPES.map(vt => (
                  <button key={vt} onClick={() => { setVenueType(vt); setShowTypePicker(false) }}
                    className="w-full text-left px-4 py-3 transition-all"
                    style={{ background: venueType === vt ? 'rgba(124,58,237,0.15)' : 'transparent', color: venueType === vt ? '#c4b5fd' : 'rgba(255,255,255,0.65)', fontSize: '0.85rem', fontWeight: venueType === vt ? 700 : 500, border: 'none', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {vt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Location */}
          <div className="mb-4">
            <p style={{ fontSize: '0.62rem', fontWeight: 800, color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7 }}>Location</p>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full rounded-[14px] px-4 py-3.5 outline-none pr-36"
                style={{ background: '#151518', border: '1px solid #25252B', color: '#fff', fontSize: '0.88rem', fontWeight: 600 }}
              />
              <button style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(168,85,247,0.8)" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"/>
                </svg>
                <span style={{ fontSize: '0.65rem', color: 'rgba(168,85,247,0.8)', fontWeight: 700 }}>Use current location</span>
              </button>
            </div>
          </div>

          {/* Why do you love it */}
          <div className="mb-4">
            <p style={{ fontSize: '0.62rem', fontWeight: 800, color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7 }}>Why do you love this place?</p>
            <textarea
              placeholder="Unreal sunset views, great cocktails and super chill atmosphere."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-[14px] px-4 py-3.5 outline-none resize-none"
              style={{ background: '#151518', border: '1px solid #25252B', color: '#fff', fontSize: '0.85rem', fontWeight: 500, lineHeight: 1.5 }}
            />
          </div>

          {/* Tags */}
          <div className="mb-5">
            <p style={{ fontSize: '0.62rem', fontWeight: 800, color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Tags</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map(tag => (
                <button key={tag} onClick={() => removeTag(tag)}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all"
                  style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.35)', color: '#c4b5fd', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
                  {tag}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              ))}
              <button style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: 100, padding: '6px 12px', color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
                + Add tag
              </button>
            </div>
            {/* Suggested tags */}
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_TAGS.filter(t => !tags.includes(t)).slice(0, 6).map(tag => (
                <button key={tag} onClick={() => addTag(tag)}
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, padding: '4px 10px', color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontWeight: 600, cursor: 'pointer' }}>
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Privacy model explainer */}
          <div className="rounded-[16px] p-4 mb-5" style={{ background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.2)' }}>
            <div className="flex items-start gap-3">
              <span style={{ fontSize: '1rem', flexShrink: 0 }}>🔒</span>
              <div>
                <p style={{ fontSize: '0.78rem', fontWeight: 800, color: '#c4b5fd', marginBottom: 4 }}>Private by default</p>
                <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
                  Your private venues stay on this device only — never uploaded to Dashi&apos;s servers. Share a one-time snapshot via your phone&apos;s share sheet when you want to include them in a guide.
                </p>
              </div>
            </div>
          </div>

          {/* Visibility */}
          <div>
            <p style={{ fontSize: '0.62rem', fontWeight: 800, color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Visibility</p>
            <div className="flex flex-col gap-2">
              {[
                { key: 'private' as Visibility, icon: '🔒', title: 'Private (only me)', sub: 'Stored on this device only. Never on Dashi servers.' },
                { key: 'shared'  as Visibility, icon: '🔗', title: 'Shared with friends', sub: 'One-time share card via native share sheet.' },
                { key: 'published' as Visibility, icon: '🌐', title: 'Publish to Dashi', sub: 'Community can discover and rate this venue.', highlight: true },
              ].map(opt => (
                <button key={opt.key} onClick={() => setVisibility(opt.key)}
                  className="flex items-start gap-3 rounded-[14px] px-4 py-3.5 text-left w-full transition-all"
                  style={{
                    background: visibility === opt.key ? (opt.highlight ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.06)') : '#151518',
                    border: `1.5px solid ${visibility === opt.key ? (opt.highlight ? 'rgba(124,58,237,0.55)' : 'rgba(255,255,255,0.18)') : '#25252B'}`,
                    cursor: 'pointer',
                  }}>
                  <span style={{ fontSize: '1rem', marginTop: 1 }}>{opt.icon}</span>
                  <div className="flex-1">
                    <p style={{ fontSize: '0.82rem', fontWeight: 800, color: visibility === opt.key && opt.highlight ? '#c4b5fd' : '#fff', marginBottom: 2 }}>{opt.title}</p>
                    <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.4 }}>{opt.sub}</p>
                  </div>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${visibility === opt.key ? (opt.highlight ? '#7C3AED' : '#fff') : 'rgba(255,255,255,0.2)'}`, background: visibility === opt.key ? (opt.highlight ? 'linear-gradient(135deg,#7C3AED,#EC4899)' : '#fff') : 'transparent', flexShrink: 0, marginTop: 2 }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Save CTA */}
      <div className="px-5 py-4 flex-shrink-0" style={{ borderTop: '1px solid #25252B' }}>
        <button
          disabled={!canSave}
          onClick={() => router.back()}
          className="w-full rounded-[14px] transition-all active:scale-[0.98]"
          style={{
            height: 54,
            background: canSave ? 'linear-gradient(135deg,#7C3AED,#EC4899)' : '#25252B',
            color: canSave ? '#fff' : 'rgba(255,255,255,0.3)',
            fontSize: '0.95rem', fontWeight: 800, border: 'none',
            cursor: canSave ? 'pointer' : 'not-allowed',
            boxShadow: canSave ? '0 8px 24px rgba(124,58,237,0.4)' : 'none',
          }}
        >
          {visibility === 'private' ? '🔒 Save to My Venues (Private)' : visibility === 'shared' ? 'Save & Share Venue' : 'Save Venue to Dashi'}
        </button>
      </div>
    </div>
  )
}
