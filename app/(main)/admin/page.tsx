'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

const ADMIN_EMAILS = ['rickyflores.atx@gmail.com', 'r4atx@icloud.com']

interface Stats {
  users: number
  newUsersThisWeek: number
  saves: number
  groups: number
  visits: number
  topVenues: { name: string; count: number }[]
}

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="bg-[#161618] rounded-[18px] border border-white/7 p-5">
      <p className="text-[0.6rem] font-bold tracking-[0.08em] uppercase text-white/35 mb-2">{label}</p>
      <p className="text-[2rem] font-black tracking-[-0.04em] leading-none" style={{
        background: 'linear-gradient(135deg, #a855f7, #ec4899)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>{value}</p>
      {sub && <p className="text-[0.6rem] text-white/30 mt-1.5">{sub}</p>}
    </div>
  )
}

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email)

  useEffect(() => {
    if (!user) { router.replace('/login'); return }
    if (!isAdmin) { router.replace('/'); return }

    fetch('/api/admin/stats')
      .then(r => r.json())
      .then((data: Stats) => setStats(data))
      .catch(() => setError('Could not load stats'))
      .finally(() => setLoading(false))
  }, [user, isAdmin, router])

  if (!user || !isAdmin) return null

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#0d0d0f]">
      <div className="flex-shrink-0 px-5 pt-5 pb-3 border-b border-white/6" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
        <div className="flex items-center justify-between">
          <h1 className="text-[1.15rem] font-black tracking-[-0.03em]">Admin</h1>
          <span className="text-[0.55rem] font-black tracking-[0.1em] uppercase px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
            Dashi HQ
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-10 no-scrollbar">
        {loading && (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-2xl p-5 text-center">
            <p className="text-red-400 text-sm font-semibold">{error}</p>
          </div>
        )}

        {stats && (
          <div className="pt-5 flex flex-col gap-4">
            {/* Key stats */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Total Users" value={stats.users} sub={`+${stats.newUsersThisWeek} this week`} />
              <StatCard label="Total Saves" value={stats.saves} />
              <StatCard label="Groups Created" value={stats.groups} />
              <StatCard label="Places Visited" value={stats.visits} />
            </div>

            {/* Top saved venues */}
            {stats.topVenues.length > 0 && (
              <div className="bg-[#161618] rounded-[18px] border border-white/7 p-5">
                <p className="text-[0.6rem] font-bold tracking-[0.08em] uppercase text-white/35 mb-4">Top Saved Venues</p>
                <div className="flex flex-col gap-3">
                  {stats.topVenues.map((v, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-[0.75rem] font-black w-5 text-right flex-shrink-0"
                        style={{ color: i === 0 ? '#ffd60a' : i === 1 ? 'rgba(255,255,255,0.5)' : i === 2 ? '#f97316' : 'rgba(255,255,255,0.2)' }}>
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[0.78rem] font-bold truncate">{v.name}</p>
                      </div>
                      <span className="text-[0.65rem] font-bold text-white/40 flex-shrink-0">{v.count} saves</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
