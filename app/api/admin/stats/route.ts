import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const [
      { count: userCount },
      { count: saveCount },
      { count: groupCount },
      { count: visitCount },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('saves').select('*', { count: 'exact', head: true }),
      supabase.from('groups').select('*', { count: 'exact', head: true }),
      supabase.from('visits').select('*', { count: 'exact', head: true }),
    ])

    // Recent signups (last 7 days)
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { count: newUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', since)

    // Top saved venues
    const { data: topSaves } = await supabase
      .from('saves')
      .select('venue_data')
      .limit(500)

    const venueCounts: Record<string, { name: string; count: number }> = {}
    for (const row of topSaves ?? []) {
      const v = row.venue_data as { id?: string; name?: string }
      if (!v?.id) continue
      venueCounts[v.id] = { name: v.name ?? v.id, count: (venueCounts[v.id]?.count ?? 0) + 1 }
    }
    const topVenues = Object.values(venueCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return NextResponse.json({
      users: userCount ?? 0,
      newUsersThisWeek: newUsers ?? 0,
      saves: saveCount ?? 0,
      groups: groupCount ?? 0,
      visits: visitCount ?? 0,
      topVenues,
    })
  } catch (err) {
    console.error('Admin stats error:', err)
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 })
  }
}
