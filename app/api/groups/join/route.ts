import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqYXhpdXp2cG1lcGx3b3p6YmZqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTAxNDQzOCwiZXhwIjoyMTAwNTkwNDM4fQ.zKnMLzHsD4yOioqi5j-63NDNBb5fpAZL1R5c013qVsc'
const SUPABASE_URL = 'https://vjaxiuzvpmeplwozzbfj.supabase.co'

function getAdmin() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
}

interface GroupRow {
  id: string
  code: string
  name: string
  creator_id: string
  city: string
  created_at: string
}

// POST /api/groups/join
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { code?: string; userId?: string }
    const { code, userId } = body

    if (!code || !userId) {
      return NextResponse.json({ error: 'code and userId required' }, { status: 400 })
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

    const typedGroup = group as GroupRow

    // Upsert to handle already-member case gracefully
    const { error: memberError } = await supabase
      .from('group_members')
      .upsert({ group_id: typedGroup.id, user_id: userId }, { onConflict: 'group_id,user_id', ignoreDuplicates: true })

    if (memberError) {
      console.error('Join group member error:', memberError)
      return NextResponse.json({ error: memberError.message }, { status: 500 })
    }

    return NextResponse.json({ group: typedGroup })
  } catch (err) {
    console.error('POST /api/groups/join error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
