'use client'

import { useState, useEffect } from 'react'

interface HappyHourDeal {
  category: 'food' | 'drink' | 'combo'
  description: string
  price?: string
  discount?: string
}

interface TodaySchedule {
  days: string[]
  start: string
  end: string
}

interface HappyHourVenue {
  id: string
  name: string
  address: string | null
  neighborhood: string | null
  cuisine: string | null
  price_range: string | null
  phone: string | null
  website: string | null
  reservations_url: string | null
  latitude: number | null
  longitude: number | null
  rating: number | null
  atmosphere_tags: string[] | null
  happy_hour_active: boolean
  today_schedule: TodaySchedule | null
  deals: HappyHourDeal[] | null
  dist_mi: number | null
}

interface ApiResponse {
  city: string
  day: string
  as_of: string
  total: number
  active_count: number
  venues: HappyHourVenue[]
}

function fmt12h(time24: string): string {
  const [h, m] = time24.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return m === 0 ? `${h12} ${ampm}` : `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

const DEAL_COLORS: Record<string, string> = {
  food:  'rgba(34,197,94,0.12)',
  drink: 'rgba(99,102,241,0.12)',
  combo: 'rgba(245,158,11,0.12)',
}
const DEAL_BORDER: Record<string, string> = {
  food:  'rgba(34,197,94,0.3)',
  drink: 'rgba(99,102,241,0.3)',
  combo: 'rgba(245,158,11,0.3)',
}
const DEAL_TEXT: Record<string, string> = {
  food:  '#22c55e',
  drink: '#818cf8',
  combo: '#f59e0b',
}

function VenueCard({ v }: { v: HappyHourVenue }) {
  const [expanded, setExpanded] = useState(false)
  const topDeals = (v.deals ?? []).slice(0, expanded ? 999 : 4)
  const hasMore  = (v.deals?.length ?? 0) > 4

  return (
    <div
      style={{
        background: '#151518',
        border: `1px solid ${v.happy_hour_active ? 'rgba(34,197,94,0.25)' : '#25252B'}`,
        borderRadius: 20,
        padding: '14px 16px',
        marginBottom: 10,
        boxShadow: v.happy_hour_active ? '0 0 0 1px rgba(34,197,94,0.1)' : 'none',
      }}
    >
      {/* ── Top row ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
            {/* Active pulse */}
            {v.happy_hour_active && (
              <span style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8, flexShrink: 0 }}>
                <span style={{
                  position: 'absolute', inset: 0, borderRadius: '50%', background: '#22c55e',
                  opacity: 0.5, animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
                }} />
                <span style={{ position: 'relative', width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
              </span>
            )}
            <span style={{ fontSize: '0.92rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {v.name}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {v.neighborhood && (
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                📍 {v.neighborhood}
              </span>
            )}
            {v.cuisine && (
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>
                · {v.cuisine}
              </span>
            )}
            {v.price_range && (
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>
                · {v.price_range}
              </span>
            )}
          </div>
        </div>

        {/* Rating + links */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
          {v.rating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#FFD60A"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#FFD60A' }}>{v.rating.toFixed(1)}</span>
            </div>
          )}
          <div style={{ display: 'flex', gap: 6 }}>
            {v.reservations_url && (
              <a href={v.reservations_url} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: '0.58rem', fontWeight: 800, color: '#7C3AED', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 6, padding: '3px 7px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                Reserve
              </a>
            )}
            {v.website && !v.reservations_url && (
              <a href={v.website} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: '0.58rem', fontWeight: 800, color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '3px 7px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                Website
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── Schedule badge ── */}
      {v.today_schedule && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: v.happy_hour_active ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${v.happy_hour_active ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: 8, padding: '4px 9px',
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={v.happy_hour_active ? '#22c55e' : 'rgba(255,255,255,0.4)'} strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: v.happy_hour_active ? '#22c55e' : 'rgba(255,255,255,0.45)' }}>
              {v.happy_hour_active ? 'NOW · ' : ''}{fmt12h(v.today_schedule.start)}–{fmt12h(v.today_schedule.end)}
            </span>
          </div>
          {v.dist_mi !== null && (
            <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
              {v.dist_mi} mi
            </span>
          )}
        </div>
      )}

      {/* ── Specials ── */}
      {topDeals.length > 0 && (
        <div style={{ marginTop: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden' }}>
          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px 6px' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Specials</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {['food','drink','combo'].filter(cat => topDeals.some(d => d.category === cat)).map(cat => (
                <span key={cat} style={{ fontSize: '0.55rem', fontWeight: 700, color: DEAL_TEXT[cat], opacity: 0.8 }}>
                  {cat === 'food' ? '🍽' : cat === 'drink' ? '🍹' : '🎯'} {cat}
                </span>
              ))}
            </div>
          </div>
          {/* Deal rows */}
          {topDeals.map((deal, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '7px 12px',
              borderTop: i === 0 ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.04)',
              background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{
                  width: 3, height: 20, borderRadius: 2, flexShrink: 0,
                  background: DEAL_TEXT[deal.category] ?? 'rgba(255,255,255,0.2)',
                  opacity: 0.7,
                }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'rgba(255,255,255,0.75)' }}>
                  {deal.description}
                </span>
              </div>
              {(deal.price ?? deal.discount) && (
                <span style={{
                  fontSize: '0.8rem', fontWeight: 800,
                  color: DEAL_TEXT[deal.category] ?? '#fff',
                  flexShrink: 0, marginLeft: 8,
                }}>
                  {deal.price ?? deal.discount}
                </span>
              )}
            </div>
          ))}
          {/* Show more */}
          {hasMore && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              style={{
                width: '100%', padding: '8px', fontSize: '0.65rem', fontWeight: 700,
                color: 'rgba(124,58,237,0.85)', background: 'rgba(124,58,237,0.05)',
                border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)',
                cursor: 'pointer',
              }}
            >
              Show {(v.deals?.length ?? 0) - 4} more specials
            </button>
          )}
        </div>
      )}

      {/* ── Atmosphere tags ── */}
      {v.atmosphere_tags && v.atmosphere_tags.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
          {v.atmosphere_tags.slice(0, 4).map(tag => (
            <span key={tag} style={{
              fontSize: '0.58rem', fontWeight: 600,
              color: 'rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 5, padding: '2px 6px',
            }}>
              {tag.replace(/-/g, ' ')}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

interface Props {
  city: string
}

export function HappyHourSection({ city }: Props) {
  const [data, setData]         = useState<ApiResponse | null>(null)
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState<'active' | 'all'>('all')
  const [neighborhood, setNeighborhood] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setData(null)
    const params = new URLSearchParams({ city })
    if (neighborhood) params.set('neighborhood', neighborhood)
    fetch(`/api/happy-hours?${params}`)
      .then(r => r.json())
      .then((d: ApiResponse) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [city, neighborhood])

  const venues = (data?.venues ?? []).filter(v =>
    filter === 'active' ? v.happy_hour_active : true
  )

  // Collect unique neighborhoods for filter
  const neighborhoods = [...new Set(
    (data?.venues ?? []).map(v => v.neighborhood).filter(Boolean)
  )].sort() as string[]

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '1rem', fontWeight: 900, letterSpacing: '-0.02em' }}>Happy Hour 🥂</span>
            {data && data.active_count > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 100, padding: '2px 8px' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#22c55e' }}>
                  {data.active_count} LIVE
                </span>
              </div>
            )}
          </div>
          <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
            {data ? `${data.total} spots in ${city}` : 'Loading…'}
          </p>
        </div>
      </div>

      {/* Active / All toggle */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {(['active', 'all'] as const).map(f => (
          <button key={f}
            onClick={() => setFilter(f)}
            style={{
              fontSize: '0.68rem', fontWeight: 700,
              padding: '5px 14px', borderRadius: 100,
              background: filter === f ? 'linear-gradient(135deg,#7C3AED,#EC4899)' : '#151518',
              border: `1px solid ${filter === f ? 'transparent' : '#25252B'}`,
              color: filter === f ? '#fff' : 'rgba(255,255,255,0.45)',
              cursor: 'pointer',
              boxShadow: filter === f ? '0 4px 14px rgba(124,58,237,0.3)' : 'none',
            }}>
            {f === 'active' ? '🟢 Active now' : 'All today'}
          </button>
        ))}
      </div>

      {/* Neighborhood pills */}
      {neighborhoods.length > 0 && (
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 14, paddingBottom: 2 }}
          className="no-scrollbar">
          <button
            onClick={() => setNeighborhood(null)}
            style={{
              flexShrink: 0, fontSize: '0.65rem', fontWeight: 700,
              padding: '4px 12px', borderRadius: 100,
              background: neighborhood === null ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${neighborhood === null ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
              color: neighborhood === null ? '#fff' : 'rgba(255,255,255,0.4)',
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}>
            All areas
          </button>
          {neighborhoods.map(n => (
            <button key={n}
              onClick={() => setNeighborhood(n === neighborhood ? null : n)}
              style={{
                flexShrink: 0, fontSize: '0.65rem', fontWeight: 700,
                padding: '4px 12px', borderRadius: 100,
                background: neighborhood === n ? 'rgba(124,58,237,0.18)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${neighborhood === n ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: neighborhood === n ? '#a78bfa' : 'rgba(255,255,255,0.4)',
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}>
              {n}
            </button>
          ))}
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ background: '#151518', border: '1px solid #25252B', borderRadius: 20, height: 110, opacity: 1 - i * 0.15 }}
              className="animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && venues.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.35)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>🥂</div>
          <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>
            {filter === 'active' ? 'No active happy hours right now' : 'No venues found'}
          </p>
          <p style={{ fontSize: '0.72rem' }}>
            {filter === 'active' ? "Check \"All today\" to see what's coming up" : 'Try a different neighborhood'}
          </p>
          {filter === 'active' && (
            <button onClick={() => setFilter('all')}
              style={{ marginTop: 14, fontSize: '0.72rem', fontWeight: 700, color: '#a78bfa', background: 'none', border: 'none', cursor: 'pointer' }}>
              Show all today →
            </button>
          )}
        </div>
      )}

      {/* Venue list */}
      {!loading && venues.map(v => <VenueCard key={v.id} v={v} />)}
    </div>
  )
}
