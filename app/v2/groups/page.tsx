'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GradientButton } from '@/components/v2/GradientButton'

interface MockGroup {
  id: string
  name: string
  emoji: string
  members: string[]
  lastOuting?: string
  nextOuting?: string
  city: string
}

const MOCK_GROUPS: MockGroup[] = [
  {
    id: 'weekend-crew',
    name: 'Weekend Crew',
    emoji: '🎉',
    members: ['Ricky', 'Sofia', 'Jake', 'Maria'],
    lastOuting: 'Hestia · 3 days ago',
    nextOuting: 'Planning…',
    city: 'Austin, TX',
  },
  {
    id: 'boys-night',
    name: 'Boys Night Out',
    emoji: '🥃',
    members: ['Ricky', 'Carlos', 'Marco'],
    lastOuting: 'Whisler\'s · Last Fri',
    city: 'Austin, TX',
  },
  {
    id: 'mexico-trip',
    name: 'Mexico City Trip',
    emoji: '✈️',
    members: ['Ricky', 'Sofia', 'Lena', 'Diego', 'Ana'],
    lastOuting: 'Pujol · Oct 2025',
    city: 'CDMX',
  },
]

const AVATAR_COLORS = ['#7C3AED', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444']

function MemberAvatars({ names }: { names: string[] }) {
  return (
    <div className="flex">
      {names.slice(0, 4).map((name, i) => (
        <div
          key={name}
          className="flex items-center justify-center rounded-full border-2"
          style={{
            width: 28,
            height: 28,
            marginLeft: i > 0 ? -8 : 0,
            background: AVATAR_COLORS[i % AVATAR_COLORS.length],
            borderColor: '#09090B',
            fontSize: '0.55rem',
            fontWeight: 800,
            color: '#fff',
            zIndex: names.length - i,
          }}
        >
          {name.slice(0, 2).toUpperCase()}
        </div>
      ))}
      {names.length > 4 && (
        <div
          className="flex items-center justify-center rounded-full border-2"
          style={{
            width: 28,
            height: 28,
            marginLeft: -8,
            background: '#25252B',
            borderColor: '#09090B',
            fontSize: '0.52rem',
            fontWeight: 800,
            color: 'rgba(255,255,255,0.6)',
            zIndex: 0,
          }}
        >
          +{names.length - 4}
        </div>
      )}
    </div>
  )
}

export default function V2GroupsPage() {
  const router = useRouter()
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState('🎉')

  const EMOJIS = ['🎉', '🥃', '✈️', '🍜', '🎵', '🏖️', '💃', '🎤']

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: '#09090B' }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex-shrink-0 flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.03em' }}>Groups</h1>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Plan nights with your crew</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-[12px] px-4 py-2.5 transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)', color: '#fff', fontSize: '0.78rem', fontWeight: 800, boxShadow: '0 4px 16px rgba(124,58,237,0.4)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Group
        </button>
      </div>

      {/* Group list */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 no-scrollbar">
        <div className="flex flex-col gap-3 pt-1">
          {MOCK_GROUPS.map(group => (
            <button
              key={group.id}
              onClick={() => router.push(`/v2/groups/${group.id}`)}
              className="w-full text-left rounded-[20px] p-4 transition-all active:scale-[0.98]"
              style={{ background: '#151518', border: '1px solid #25252B' }}
            >
              <div className="flex items-start gap-3.5">
                {/* Emoji avatar */}
                <div
                  className="flex items-center justify-center rounded-2xl flex-shrink-0"
                  style={{ width: 52, height: 52, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)', fontSize: '1.5rem' }}
                >
                  {group.emoji}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '-0.01em' }}>{group.name}</p>
                    <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
                      {group.city}
                    </span>
                  </div>

                  <MemberAvatars names={group.members} />

                  <div className="flex items-center justify-between mt-2.5">
                    {group.lastOuting && (
                      <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)' }}>
                        Last: {group.lastOuting}
                      </p>
                    )}
                    {group.nextOuting && (
                      <span
                        style={{
                          fontSize: '0.6rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 100,
                          background: 'rgba(124,58,237,0.2)',
                          color: '#a78bfa',
                        }}
                      >
                        {group.nextOuting}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Plan This Night CTA */}
              <div
                className="flex items-center justify-center gap-2 rounded-[12px] mt-3.5 transition-all"
                style={{
                  height: 44,
                  background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
                }}
              >
                <span>Plan This Night</span>
                <span style={{ fontSize: '1rem' }}>✨</span>
              </div>
            </button>
          ))}

          {/* Join group CTA */}
          <button
            className="w-full rounded-[20px] p-5 flex flex-col items-center gap-2 transition-all active:scale-[0.98]"
            style={{ background: '#151518', border: '1px dashed #25252B' }}
          >
            <div
              className="flex items-center justify-center rounded-full"
              style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Join a group with a code</p>
          </button>
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreate && (
        <div
          className="absolute inset-0 z-50 flex items-end"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowCreate(false)}
        >
          <div
            className="w-full rounded-t-[28px] px-5 pt-5 pb-8"
            style={{ background: '#151518', border: '1px solid #25252B' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ width: 40, height: 4, borderRadius: 100, background: 'rgba(255,255,255,0.15)', margin: '0 auto 20px' }} />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: 16 }}>Create a Group</h2>

            {/* Emoji picker */}
            <div className="flex gap-2.5 mb-4 flex-wrap">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => setNewEmoji(e)}
                  className="flex items-center justify-center rounded-2xl transition-all"
                  style={{
                    width: 44,
                    height: 44,
                    fontSize: '1.3rem',
                    background: newEmoji === e ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.05)',
                    border: `1.5px solid ${newEmoji === e ? 'rgba(124,58,237,0.6)' : 'rgba(255,255,255,0.1)'}`,
                  }}
                >
                  {e}
                </button>
              ))}
            </div>

            {/* Name input */}
            <input
              type="text"
              placeholder="Group name (e.g. Weekend Crew)"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="w-full rounded-[14px] px-4 py-3.5 mb-5 outline-none"
              style={{
                background: '#09090B',
                border: '1px solid #25252B',
                color: '#fff',
                fontSize: '0.9rem',
                fontWeight: 600,
              }}
            />

            <GradientButton
              fullWidth
              size="lg"
              disabled={!newName.trim()}
              onClick={() => {
                router.push(`/v2/groups/weekend-crew`)
                setShowCreate(false)
              }}
            >
              Create Group →
            </GradientButton>
          </div>
        </div>
      )}
    </div>
  )
}
