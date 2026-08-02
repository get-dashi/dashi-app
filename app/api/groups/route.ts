import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqYXhpdXp2cG1lcGx3b3p6YmZqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTAxNDQzOCwiZXhwIjoyMTAwNTkwNDM4fQ.zKnMLzHsD4yOioqi5j-63NDNBb5fpAZL1R5c013qVsc'
const SUPABASE_URL = 'https://vjaxiuzvpmeplwozzbfj.supabase.co'

function getAdmin() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
}

// 6-char code: uppercase letters + digits, no O, 0, I, 1
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

interface GroupRow {
  id: string
  code: string
  name: string
  creator_id: string
  city: string
  created_at: string
}

interface MemberRow {
  user_id: string
  joined_at: string
  profiles: { name: string | null } | { name: string | null }[] | null
}

// POST /api/groups — create a group
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { name?: string; city?: string; userId?: string }
    const { name = 'Night Out', city = 'austin', userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    const supabase = getAdmin()

    // Try up to 5 times to find a unique code
    let code = ''
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = generateCode()
      const { data } = await supabase.from('groups').select('id').eq('code', candidate).maybeSingle()
      if (!data) {
        code = candidate
        break
      }
    }

    if (!code) {
      return NextResponse.json({ error: 'Could not generate unique code' }, { status: 500 })
    }

    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert({ code, name, city, creator_id: userId })
      .select()
      .single()

    if (groupError || !group) {
      console.error('Group insert error:', groupError)
      return NextResponse.json({ error: groupError?.message ?? 'Failed to create group' }, { status: 500 })
    }

    // Add creator as first member
    const { error: memberError } = await supabase
      .from('group_members')
      .insert({ group_id: (group as GroupRow).id, user_id: userId })

    if (memberError) {
      console.error('Member insert error:', memberError)
    }

    return NextResponse.json({ group: group as GroupRow })
  } catch (err) {
    console.error('POST /api/groups error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/groups?code=XXXXX — fetch group by code
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json({ error: 'code required' }, { status: 400 })
    }

    const supabase = getAdmin()

    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('*')
      .eq('code', code.toUpperCase())
      .maybeSingle()

    if (groupError || !group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    const { data: members, error: membersError } = await supabase
      .from('group_members')
      .select('user_id, joined_at, profiles(name)')
      .eq('group_id', (group as GroupRow).id)

    if (membersError) {
      console.error('Members fetch error:', membersError)
    }

    const typedMembers = (members ?? []) as unknown as MemberRow[]

    return NextResponse.json({
      group: group as GroupRow,
      members: typedMembers,
      memberCount: typedMembers.length,
    })
  } catch (err) {
    console.error('GET /api/groups error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
