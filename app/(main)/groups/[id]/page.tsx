'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { GradientButton } from '@/components/v2/GradientButton'

const AVATAR_COLORS = ['#7C3AED', '#EC4899', '#3B82F6', '#10B981', '#F59E0B']
const LS_KEY = 'dashi_my_groups'

interface SavedGroup {
  id: string; code: string; name: string; emoji: string
  city: string; memberCount: number; isCreator: boolean; joinedAt: number
}

export default function GroupDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [group, setGroup] = useState<SavedGroup | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    try {
      const groups: SavedGroup[] = JSON.parse(localStorage.getItem(LS_KEY) ?? '[]')
      const found = groups.find(g => g.id === id || g.code === id)
      if (found) setGroup(found)
    } catch {}
  }, [id])

  function copyCode() {
    if (!group) return
    navigator.clipboard.writeText(group.code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  async function shareGroup() {
    if (!group) return
    const text = `Join my group "${group.name}" on Dashi! Code: ${group.code}`
    if (navigator.share) {
      await navigator.share({ title: 'Join my Dashi group', text, url: `https://app.get-dashi.com/join?code=${group.code}` })
    } else {
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!group) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-4" style={{ background: '#09090B' }}>
        <div style={{ fontSize: '2.5rem' }}>🤔</div>
        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>Group not found</p>
        <button onClick={() => router.back()} style={{ color: 'rgba(168,85,247,0.8)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>
          ← Go back
        </button>
      </div>
    )
  }

  // Fake member avatars based on count
  const members = Array.from({ length: group.memberCount }, (_, i) => ({
    name: i === 0 ? 'You' : `Member ${i + 1}`,
    role: i === 0 && group.isCreator ? 'Admin' : undefined,
  }))

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: '#09090B' }}>
      <div className="px-5 pt-5 pb-3 flex-shrink-0">
        <button onClick={() => router.back()} className="flex items-center gap-2 mb-4"
          style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Groups
        </button>

        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center rounded-2xl flex-shrink-0"
            style={{ width: 60, height: 60, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', fontSize: '1.8rem' }}>
            {group.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h1 style={{ fontSize: '1.3rem', fontWeight: 900, letterSpacing: '-0.02em' }}>{group.name}</h1>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>📍 {group.city}</p>
          </div>
          {/* Share */}
          <button onClick={shareGroup}
            style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-3 mt-4">
          {[{ label: 'Members', value: group.memberCount }, { label: 'City', value: group.city.split(',')[0] }, { label: 'Code', value: group.code }].map(stat => (
            <div key={stat.label} className="flex-1 rounded-[14px] p-3 text-center" style={{ background: '#151518', border: '1px solid #25252B' }}>
              <p style={{ fontSize: stat.label === 'Code' ? '0.9rem' : '1.3rem', fontWeight: 900, background: 'linear-gradient(135deg, #7C3AED, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: stat.label === 'Code' ? '0.1em' : 0 }}>
                {stat.value}
              </p>
              <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginTop: 1 }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4 no-scrollbar">
        {/* Plan CTA */}
        <GradientButton fullWidth size="lg" onClick={() => router.push(`/groups/${id}/plan`)} style={{ marginBottom: 16, marginTop: 8 }}>
          <span>Plan This Night</span>
          <span style={{ fontSize: '1.1rem' }}>✨</span>
        </GradientButton>

        {/* Members */}
        <div className="rounded-[20px] p-4 mb-3" style={{ background: '#151518', border: '1px solid #25252B' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: 14, color: 'rgba(255,255,255,0.7)' }}>Members · {group.memberCount}</p>
          <div className="flex flex-col gap-3">
            {members.map((member, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex items-center justify-center rounded-full flex-shrink-0"
                  style={{ width: 38, height: 38, background: AVATAR_COLORS[i % AVATAR_COLORS.length], fontSize: '0.72rem', fontWeight: 800, color: '#fff' }}>
                  {member.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>{member.name}</p>
                  {member.role && <p style={{ fontSize: '0.6rem', color: 'rgba(168,85,247,0.8)', fontWeight: 700 }}>{member.role}</p>}
                </div>
              </div>
            ))}
            <button onClick={shareGroup} className="flex items-center gap-2 mt-1 py-2"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(168,85,247,0.8)', fontSize: '0.78rem', fontWeight: 700 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Invite friends
            </button>
          </div>
        </div>

        {/* Invite code */}
        <div className="rounded-[20px] p-4" style={{ background: '#151518', border: '1px solid #25252B' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: 8, color: 'rgba(255,255,255,0.7)' }}>Invite Code</p>
          <div className="flex items-center justify-between rounded-[12px] px-4 py-3" style={{ background: '#09090B', border: '1px solid #25252B' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 900, letterSpacing: '0.15em', background: 'linear-gradient(135deg, #7C3AED, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {group.code}
            </span>
            <button onClick={copyCode}
              style={{ fontSize: '0.7rem', color: copied ? '#4ade80' : 'rgba(255,255,255,0.4)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}>
              {copied ? 'Copied ✓' : 'Copy'}
            </button>
          </div>
          <button onClick={shareGroup}
            className="w-full mt-3 rounded-[12px] py-2.5 transition-all active:scale-[0.98]"
            style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', color: 'rgba(168,85,247,0.9)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
            📤 Share invite link
          </button>
        </div>
      </div>
    </div>
  )
}
