import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://vjaxiuzvpmeplwozzbfj.supabase.co'
const SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqYXhpdXp2cG1lcGx3b3p6YmZqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTAxNDQzOCwiZXhwIjoyMTAwNTkwNDM4fQ.zKnMLzHsD4yOioqi5j-63NDNBb5fpAZL1R5c013qVsc'
const ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqYXhpdXp2cG1lcGx3b3p6YmZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwMTQ0MzgsImV4cCI6MjEwMDU5MDQzOH0.iK8fx4PONk07jRiCxNC6o1q0XHu4kdTzt4iCsXNf3kc'

function getAdmin() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
}

function getAnon() {
  return createClient(SUPABASE_URL, ANON_KEY)
}

interface RecommendationRow {
  google_place_id: string
  venue_name: string
  venue_type: string | null
  city: string
  address: string | null
  lat: number | null
  lng: number | null
  user_id: string
}

// GET /api/recommendations?city=austin&userId=<optional>
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const city = searchParams.get('city') ?? 'austin'
    const userId = searchParams.get('userId') ?? null

    const supabase = getAdmin()

    const { data, error } = await supabase
      .from('recommendations')
      .select('google_place_id, venue_name, venue_type, city, address, lat, lng, user_id')
      .eq('city', city)

    if (error) {
      console.error('GET /api/recommendations error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const rows = (data ?? []) as RecommendationRow[]

    // Aggregate by google_place_id
    const map = new Map<string, {
      google_place_id: string
      venue_name: string
      venue_type: string | null
      city: string
      address: string | null
      lat: number | null
      lng: number | null
      recommendation_count: number
      recommended_by_me: boolean
    }>()

    for (const row of rows) {
      const existing = map.get(row.google_place_id)
      if (existing) {
        existing.recommendation_count += 1
        if (userId && row.user_id === userId) existing.recommended_by_me = true
      } else {
        map.set(row.google_place_id, {
          google_place_id: row.google_place_id,
          venue_name: row.venue_name,
          venue_type: row.venue_type,
          city: row.city,
          address: row.address,
          lat: row.lat,
          lng: row.lng,
          recommendation_count: 1,
          recommended_by_me: userId ? row.user_id === userId : false,
        })
      }
    }

    const venues = Array.from(map.values()).sort(
      (a, b) => b.recommendation_count - a.recommendation_count
    )

    return NextResponse.json({ venues })
  } catch (err) {
    console.error('GET /api/recommendations unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

interface PostBody {
  userId: string
  google_place_id: string
  venue_name: string
  venue_type?: string
  city?: string
  address?: string
  lat?: number
  lng?: number
  notes?: string
}

// POST /api/recommendations
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PostBody
    const {
      userId,
      google_place_id,
      venue_name,
      venue_type,
      city = 'austin',
      address,
      lat,
      lng,
      notes,
    } = body

    if (!userId || !google_place_id || !venue_name) {
      return NextResponse.json(
        { error: 'userId, google_place_id, and venue_name are required' },
        { status: 400 }
      )
    }

    const supabase = getAdmin()

    const { data, error } = await supabase
      .from('recommendations')
      .insert({
        user_id: userId,
        google_place_id,
        venue_name,
        venue_type: venue_type ?? null,
        city,
        address: address ?? null,
        lat: lat ?? null,
        lng: lng ?? null,
        notes: notes ?? null,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'You already added this spot.' },
          { status: 409 }
        )
      }
      console.error('POST /api/recommendations error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, recommendation: data })
  } catch (err) {
    console.error('POST /api/recommendations unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/recommendations?userId=&google_place_id=
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const google_place_id = searchParams.get('google_place_id')

    if (!userId || !google_place_id) {
      return NextResponse.json(
        { error: 'userId and google_place_id are required' },
        { status: 400 }
      )
    }

    const supabase = getAdmin()

    const { error } = await supabase
      .from('recommendations')
      .delete()
      .eq('user_id', userId)
      .eq('google_place_id', google_place_id)

    if (error) {
      console.error('DELETE /api/recommendations error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/recommendations unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
