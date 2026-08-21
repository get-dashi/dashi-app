import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const SUPABASE_URL     = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

// POST /api/booking-click
// Logs a booking click for affiliate program reporting.
// Fire-and-forget from the client — always returns 200.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      venueId?:   string
      venueName?: string
      platform?:  string
      city?:      string
      userId?:    string | null
    }

    const { venueId, venueName, platform, city, userId } = body

    if (!venueId || !platform) {
      return NextResponse.json({ ok: true }) // silent — don't break the UI
    }

    if (SERVICE_ROLE_KEY && SUPABASE_URL) {
      const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
      await supabase.from('booking_clicks').insert({
        venue_id:   venueId,
        venue_name: venueName ?? '',
        platform,
        city:       city ?? 'austin',
        user_id:    userId ?? null,
      })
      // Ignore insert errors — table may not exist yet
    }
  } catch {
    // Never throw — click tracking must never break the booking flow
  }

  return NextResponse.json({ ok: true })
}
