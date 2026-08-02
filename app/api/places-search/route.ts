import { NextRequest, NextResponse } from 'next/server'

interface PlacesTextSearchResult {
  place_id: string
  name: string
  formatted_address: string
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  types: string[]
}

interface PlacesTextSearchResponse {
  results: PlacesTextSearchResult[]
  status: string
}

function inferType(types: string[]): string {
  if (types.includes('night_club')) return 'Night Club'
  if (types.includes('bar')) return 'Bar'
  if (types.includes('cafe')) return 'Cafe'
  if (types.includes('restaurant')) return 'Restaurant'
  if (types.includes('food')) return 'Food'
  return 'Venue'
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim() ?? ''
  const city = searchParams.get('city') ?? 'austin'

  if (!q || q.length < 2) {
    return NextResponse.json({ places: [] })
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Places API not configured' }, { status: 500 })
  }

  const query = encodeURIComponent(`${q} in ${city}`)
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${apiKey}`

  const res = await fetch(url, { next: { revalidate: 3600 } })

  if (!res.ok) {
    return NextResponse.json({ error: 'Places API error' }, { status: 502 })
  }

  const json = (await res.json()) as PlacesTextSearchResponse

  if (json.status !== 'OK' && json.status !== 'ZERO_RESULTS') {
    console.error('Places API status:', json.status)
    return NextResponse.json({ error: `Places API status: ${json.status}` }, { status: 502 })
  }

  const places = (json.results ?? []).slice(0, 5).map((r) => ({
    google_place_id: r.place_id,
    name: r.name,
    address: r.formatted_address,
    lat: r.geometry.location.lat,
    lng: r.geometry.location.lng,
    type: inferType(r.types),
  }))

  return NextResponse.json({ places })
}
