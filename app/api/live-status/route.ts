import { NextRequest, NextResponse } from 'next/server'

interface OHPeriodEnd {
  day: number
  time: string
}
interface OHPeriod {
  open: OHPeriodEnd
  close?: OHPeriodEnd
}
interface PlaceDetails {
  opening_hours?: {
    open_now: boolean
    periods?: OHPeriod[]
  }
  business_status?: string
}
interface DetailsResponse {
  result?: PlaceDetails
  status: string
}

function formatTime(hours: number, minutes: number): string {
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const h = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
  const m = minutes > 0 ? `:${String(minutes).padStart(2, '0')}` : ''
  return `${h}${m} ${ampm}`
}

export interface VenueLiveStatus {
  openNow: boolean
  closingAt: string | null
  minutesUntilClose: number | null
  closingSoon: boolean  // ≤ 90 min
  lastCall: boolean     // ≤ 30 min
}

function computeStatus(details: PlaceDetails): VenueLiveStatus {
  const oh = details.opening_hours
  const openNow = oh?.open_now ?? false
  const empty: VenueLiveStatus = { openNow, closingAt: null, minutesUntilClose: null, closingSoon: false, lastCall: false }

  if (!openNow || !oh?.periods?.length) return empty

  const now = new Date()
  // Absolute minutes from Sunday midnight for current moment
  const nowAbs = now.getDay() * 1440 + now.getHours() * 60 + now.getMinutes()

  for (const period of oh.periods) {
    if (!period.close) continue
    const oh = parseInt(period.open.time.slice(0, 2), 10)
    const om = parseInt(period.open.time.slice(2), 10)
    const ch = parseInt(period.close.time.slice(0, 2), 10)
    const cm = parseInt(period.close.time.slice(2), 10)

    const openAbs = period.open.day * 1440 + oh * 60 + om
    const closeAbs = period.close.day * 1440 + ch * 60 + cm

    if (nowAbs >= openAbs && nowAbs < closeAbs) {
      const minutesUntilClose = closeAbs - nowAbs
      const closingAt = formatTime(ch, cm)
      return {
        openNow: true,
        closingAt,
        minutesUntilClose,
        closingSoon: minutesUntilClose <= 90,
        lastCall: minutesUntilClose <= 30,
      }
    }
  }

  return empty
}

// GET /api/live-status?ids=placeId1,placeId2
export async function GET(req: NextRequest) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'not configured' }, { status: 503 })

  const { searchParams } = new URL(req.url)
  const ids = (searchParams.get('ids') ?? '').split(',').filter(Boolean).slice(0, 4)
  if (!ids.length) return NextResponse.json({ statuses: [] })

  const statuses = await Promise.all(
    ids.map(async (id) => {
      try {
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${id}&fields=opening_hours,business_status&key=${apiKey}`
        const res = await fetch(url, { next: { revalidate: 300 } })
        const data = (await res.json()) as DetailsResponse
        if (data.status !== 'OK' || !data.result) return { id, status: null }
        return { id, status: computeStatus(data.result) }
      } catch {
        return { id, status: null }
      }
    })
  )

  return NextResponse.json({ statuses })
}
