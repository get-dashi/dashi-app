'use client'

import { useRouter } from 'next/navigation'
import { GradientButton } from '@/components/v2/GradientButton'

const AVATAR_COLORS = ['#7C3AED', '#EC4899', '#3B82F6', '#10B981', '#F59E0B']

const GROUP_DATA: Record<string, {
  name: string; emoji: string; city: string;
  members: { name: string; role?: string }[]
  lastOuting: string; plans: number; spots: number
}> = {
  'weekend-crew': {
    name: 'Weekend Crew',
    emoji: '🎉',
    city: 'Austin, TX',
    members: [
      { name: 'Ricky', role: 'Admin' },
      { name: 'Sofia' },
      { name: 'Jake' },
      { name: 'Maria' },
    ],
    lastOuting: 'Hestia · 3 days ago',
    plans: 12,
    spots: 38,
  },
  'boys-night': {
    name: 'Boys Night Out',
    emoji: '🥃',
    city: 'Austin, TX',
    members: [{ name: 'Ricky', role: 'Admin' }, { name: 'Carlos' }, { name: 'Marco' }],
    lastOuting: "Whisler's · Last Friday",
    plans: 7,
    spots: 21,
  },
  'mexico-trip': {
    name: 'Mexico City Trip',
    emoji: '✈️',
    city: 'CDMX',
    members: [
      { name: 'Ricky', role: 'Admin' },
      { name: 'Sofia' }, { name: 'Lena' }, { name: 'Diego' }, { name: 'Ana' },
    ],
    lastOuting: 'Pujol · Oct 2025',
    plans: 3,
    spots: 14,
  },
}

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  // Unwrap params — in a real app we'd use React.use() or useParams
  // For the mock, we'll use a default
  const group = GROUP_DATA['weekend-crew']

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: '#09090B' }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex-shrink-0">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-4"
          style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Groups
        </button>

        <div className="flex items-center gap-4">
          <div
            className="flex items-center justify-center rounded-2xl flex-shrink-0"
            style={{ width: 60, height: 60, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', fontSize: '1.8rem' }}
          >
            {group.emoji}
          </div>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 900, letterSpacing: '-0.02em' }}>{group.name}</h1>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>📍 {group.city}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-3 mt-4">
          {[
            { label: 'Members', value: group.members.length },
            { label: 'Plans', value: group.plans },
            { label: 'Spots Tried', value: group.spots },
          ].map(stat => (
            <div key={stat.label} className="flex-1 rounded-[14px] p-3 text-center" style={{ background: '#151518', border: '1px solid #25252B' }}>
              <p style={{ fontSize: '1.3rem', fontWeight: 900, background: 'linear-gradient(135deg, #7C3AED, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {stat.value}
              </p>
              <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginTop: 1 }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 no-scrollbar">
        {/* Plan This Night CTA */}
        <GradientButton
          fullWidth
          size="lg"
          onClick={() => router.push('/groups/weekend-crew/plan')}
          style={{ marginBottom: 16, marginTop: 8 }}
        >
          <span>Plan This Night</span>
          <span style={{ fontSize: '1.1rem' }}>✨</span>
        </GradientButton>

        {/* Members */}
        <div className="rounded-[20px] p-4 mb-3" style={{ background: '#151518', border: '1px solid #25252B' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: 14, color: 'rgba(255,255,255,0.7)' }}>
            Members · {group.members.length}
          </p>
          <div className="flex flex-col gap-3">
            {group.members.map((member, i) => (
              <div key={member.name} className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center rounded-full flex-shrink-0"
                  style={{
                    width: 38,
                    height: 38,
                    background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: '#fff',
                  }}
                >
                  {member.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>{member.name}</p>
                  {member.role && (
                    <p style={{ fontSize: '0.6rem', color: 'rgba(168,85,247,0.8)', fontWeight: 700 }}>{member.role}</p>
                  )}
                </div>
              </div>
            ))}
            <button
              className="flex items-center gap-2 mt-1 py-2"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(168,85,247,0.8)', fontSize: '0.78rem', fontWeight: 700 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Invite friends
            </button>
          </div>
        </div>

        {/* Last outing */}
        <div className="rounded-[20px] p-4 mb-3" style={{ background: '#151518', border: '1px solid #25252B' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: 10, color: 'rgba(255,255,255,0.7)' }}>Last Outing</p>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>{group.lastOuting}</p>
        </div>

        {/* Invite code */}
        <div className="rounded-[20px] p-4" style={{ background: '#151518', border: '1px solid #25252B' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: 8, color: 'rgba(255,255,255,0.7)' }}>Invite Code</p>
          <div className="flex items-center justify-between rounded-[12px] px-4 py-3" style={{ background: '#09090B', border: '1px solid #25252B' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 900, letterSpacing: '0.15em', background: 'linear-gradient(135deg, #7C3AED, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              WKND42
            </span>
            <button style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
