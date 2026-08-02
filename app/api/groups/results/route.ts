import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqYXhpdXp2cG1lcGx3b3p6YmZqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTAxNDQzOCwiZXhwIjoyMTAwNTkwNDM4fQ.zKnMLzHsD4yOioqi5j-63NDNBb5fpAZL1R5c013qVsc'
const SUPABASE_URL = 'https://vjaxiuzvpmeplwozzbfj.supabase.co'

function getAdmin() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
}

interface MemberRow {
  user_id: string
}

interface SaveRow {
  user_id: string
  venue_id: string
  venue_name: string
  venue_type: string
  city: string
}

interface ProfileRow {
  id: string
  name: string | null
}

export interface VenueResult {
  venue_id: string
  venue_name: string
  venue_type: string
  city: string
  savedBy: string[]
  count: number
  tier: 'top' | 'strong' | 'maybe'
}

// GET /api/groups/results?groupId=xxx
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const groupId = searchParams.get('groupId')

    if (!groupId) {
      return NextResponse.json({ error: 'groupId required' }, { status: 400 })
    }

    const supabase = getAdmin()

    // Get all group members
    const { data: members, error: membersError } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', groupId)

    if (membersError) {
      console.error('Results members error:', membersError)
      return NextResponse.json({ results: [] })
    }

    const typedMembers = (members ?? []) as MemberRow[]
    const memberCount = typedMembers.length

    if (memberCount === 0) {
      return NextResponse.json({ results: [] })
    }

    const memberIds = typedMembers.map(m => m.user_id)

    // Get all saves for all members
    const { data: saves, error: savesError } = await supabase
      .from('saves')
      .select('user_id, venue_id, venue_name, venue_type, city')
      .in('user_id', memberIds)

    if (savesError) {
      console.error('Results saves error:', savesError)
      return NextResponse.json({ results: [] })
    }

    const typedSaves = (saves ?? []) as SaveRow[]

    // Get profiles to map user_id → name
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name')
      .in('id', memberIds)

    const profileMap = new Map<string, string>()
    for (const p of ((profiles ?? []) as ProfileRow[])) {
      profileMap.set(p.id, p.name ?? p.id.slice(0, 8))
    }

    // Compute overlap
    const venueMap = new Map<string, { venue_name: string; venue_type: string; city: string; savers: Set<string> }>()

    for (const save of typedSaves) {
      if (!venueMap.has(save.venue_id)) {
        venueMap.set(save.venue_id, {
          venue_name: save.venue_name,
          venue_type: save.venue_type ?? '',
          city: save.city ?? '',
          savers: new Set(),
        })
      }
      venueMap.get(save.venue_id)!.savers.add(save.user_id)
    }

    const results: VenueResult[] = Array.from(venueMap.entries())
      .map(([venue_id, data]) => {
        const count = data.savers.size
        const savedBy = Array.from(data.savers).map(uid => profileMap.get(uid) ?? uid.slice(0, 8))
        const tier: VenueResult['tier'] =
          count === memberCount ? 'top' : count >= Math.ceil(memberCount / 2) ? 'strong' : 'maybe'
        return {
          venue_id,
          venue_name: data.venue_name,
          venue_type: data.venue_type,
          city: data.city,
          savedBy,
          count,
          tier,
        }
      })
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count
        return a.venue_name.localeCompare(b.venue_name)
      })

    return NextResponse.json({ results })
  } catch (err) {
    console.error('GET /api/groups/results error:', err)
    return NextResponse.json({ results: [] })
  }
}
