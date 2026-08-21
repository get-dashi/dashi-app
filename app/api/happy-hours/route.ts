import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/**
 * GET /api/happy-hours
 *
 * Query params:
 *   city        string  (default: 'austin')
 *   neighborhood string  (optional filter)
 *   active_now  boolean (default: false) — only return venues in HH right now
 *   lat         number  (optional, for distance sort)
 *   lng         number  (optional, for distance sort)
 *   limit       number  (default: 50, max: 200)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const city         = searchParams.get('city') ?? 'austin'
  const neighborhood = searchParams.get('neighborhood') ?? null
  const activeNow    = searchParams.get('active_now') === 'true'
  const lat          = parseFloat(searchParams.get('lat') ?? '')
  const lng          = parseFloat(searchParams.get('lng') ?? '')
  const limit        = Math.min(parseInt(searchParams.get('limit') ?? '50'), 200)

  // Current Austin time
  const now       = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }))
  const todayName = DAY_NAMES[now.getDay()]
  const nowMins   = now.getHours() * 60 + now.getMinutes()

  // ── Query venues ────────────────────────────────────────────────────────────
  let venueQuery = supabase
    .from('venues')
    .select(`
      id, name, address, neighborhood, cuisine, price_range,
      phone, website, reservations_url,
      latitude, longitude, rating, atmosphere_tags, status,
      happy_hours (
        id, days, start_time, end_time, deals
      )
    `)
    .eq('city', city)
    .eq('status', 'open')
    .limit(limit)

  if (neighborhood) venueQuery = venueQuery.eq('neighborhood', neighborhood)

  const { data: venues, error } = await venueQuery

  if (error) {
    console.error('happy-hours query error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // ── Attach active HH flag ───────────────────────────────────────────────────
  function parseTimeMins(t: string): number {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }

  function isActiveNow(schedules: { days: string[]; start_time: string; end_time: string }[]): boolean {
    return schedules.some(s => {
      if (!s.days.includes(todayName)) return false
      const start = parseTimeMins(s.start_time)
      const end   = parseTimeMins(s.end_time)
      // Handle midnight crossover
      return end < start ? nowMins >= start || nowMins < end : nowMins >= start && nowMins < end
    })
  }

  function distanceMi(vLat: number, vLng: number): number | null {
    if (!isFinite(lat) || !isFinite(lng)) return null
    const R = 3958.8
    const dLat = (vLat - lat) * Math.PI / 180
    const dLng = (vLng - lng) * Math.PI / 180
    const a = Math.sin(dLat / 2) ** 2
      + Math.cos(lat * Math.PI / 180) * Math.cos(vLat * Math.PI / 180) * Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let results = (venues ?? []).map((v: any) => {
    const schedules = v.happy_hours ?? []
    const active = isActiveNow(schedules)
    const dist = v.latitude && v.longitude ? distanceMi(v.latitude, v.longitude) : null

    // Find today's schedule for display
    const todaySchedule = schedules.find((s: { days: string[] }) => s.days.includes(todayName)) ?? schedules[0] ?? null

    return {
      id:             v.id,
      name:           v.name,
      address:        v.address,
      neighborhood:   v.neighborhood,
      cuisine:        v.cuisine,
      price_range:    v.price_range,
      phone:          v.phone,
      website:        v.website,
      reservations_url: v.reservations_url,
      latitude:       v.latitude,
      longitude:      v.longitude,
      rating:         v.rating,
      atmosphere_tags: v.atmosphere_tags,
      happy_hour_active: active,
      today_schedule: todaySchedule
        ? { days: todaySchedule.days, start: todaySchedule.start_time, end: todaySchedule.end_time }
        : null,
      deals:          todaySchedule?.deals ?? null,
      all_schedules:  schedules,
      dist_mi:        dist !== null ? Math.round(dist * 10) / 10 : null,
    }
  })

  if (activeNow) {
    results = results.filter(v => v.happy_hour_active)
  }

  // Sort: active first, then by distance (if provided), then by name
  results.sort((a, b) => {
    if (a.happy_hour_active !== b.happy_hour_active) return a.happy_hour_active ? -1 : 1
    if (a.dist_mi !== null && b.dist_mi !== null) return a.dist_mi - b.dist_mi
    return a.name.localeCompare(b.name)
  })

  return NextResponse.json({
    city,
    neighborhood: neighborhood ?? null,
    as_of: now.toISOString(),
    day: todayName,
    total: results.length,
    active_count: results.filter(v => v.happy_hour_active).length,
    venues: results,
  }, {
    headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' },
  })
}
