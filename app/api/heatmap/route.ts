import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ALL_FEATURED_VENUES, CITIES_CONFIG } from '@/lib/venues'

const SUPABASE_URL = 'https://vjaxiuzvpmeplwozzbfj.supabase.co'
const SUPABASE_SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqYXhpdXp2cG1lcGx3b3p6YmZqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTAxNDQzOCwiZXhwIjoyMTAwNTkwNDM4fQ.zKnMLzHsD4yOioqi5j-63NDNBb5fpAZL1R5c013qVsc'

const PLACES_RADIUS = 3000 // metres

interface HeatPoint {
  lat: number
  lng: number
  weight: number
  name: string
  swipeCount?: number
}

interface PlacesResult {
  name: string
  geometry: { location: { lat: number; lng: number } }
  user_ratings_total?: number
  place_id: string
}

// ── helpers ────────────────────────────────────────────────────────────────────

function cityKey(raw: string): string {
  if (raw === 'monterrey' || raw === 'mty') return 'monterrey'
  if (raw === 'atlanta' || raw === 'atl') return 'atlanta'
  if (raw === 'nyc' || raw === 'new_york') return 'nyc'
  if (raw === 'dallas' || raw === 'dal') return 'dallas'
  if (raw === 'miami' || raw === 'mia') return 'miami'
  if (raw === 'cdmx' || raw === 'mexico_city') return 'cdmx'
  if (raw === 'chicago' || raw === 'chi') return 'chicago'
  if (raw === 'la' || raw === 'los_angeles') return 'la'
  if (raw === 'houston' || raw === 'hou') return 'houston'
  return 'austin'
}

/** True if two points are within ~50m of each other */
function isTooClose(a: HeatPoint, b: HeatPoint): boolean {
  const dlat = a.lat - b.lat
  const dlng = a.lng - b.lng
  return Math.sqrt(dlat * dlat + dlng * dlng) < 0.0005
}

function dedupe(points: HeatPoint[]): HeatPoint[] {
  const result: HeatPoint[] = []
  for (const p of points) {
    if (!result.some(r => isTooClose(r, p))) {
      result.push(p)
    }
  }
  return result
}

// ── popularity layer ────────────────────────────────────────────────────────────

async function fetchPopularityLayer(city: string): Promise<{ points: HeatPoint[] }> {
  const config = CITIES_CONFIG[city]
  if (!config) return { points: [] }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  const points: HeatPoint[] = []

  // Google Places Nearby Search — bars, restaurants, nightclubs
  const types = ['bar', 'restaurant', 'night_club', 'cafe']
  if (apiKey) {
    for (const type of types) {
      try {
        const url =
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
          `?location=${config.lat},${config.lng}` +
          `&radius=${PLACES_RADIUS}` +
          `&type=${type}` +
          `&key=${apiKey}`
        const res = await fetch(url, { next: { revalidate: 3600 } })
        if (res.ok) {
          const data = (await res.json()) as { results: PlacesResult[] }
          for (const place of data.results ?? []) {
            const lat = place.geometry?.location?.lat
            const lng = place.geometry?.location?.lng
            if (!lat || !lng) continue
            const rawCount = place.user_ratings_total ?? 0
            const weight = Math.min(rawCount / 5000, 1)
            points.push({ lat, lng, weight: Math.max(weight, 0.05), name: place.name })
          }
        }
      } catch {
        // individual type failures are non-fatal
      }
    }
  }

  // Add ALL_FEATURED_VENUES for this city as anchors
  const cityLabel = city
  const featured = ALL_FEATURED_VENUES.filter(
    v => (v.city ?? 'austin') === cityLabel && v.lat && v.lng,
  )
  for (const v of featured) {
    const weight = Math.min((v.hot ?? 5) / 10, 1)
    points.push({ lat: v.lat!, lng: v.lng!, weight, name: v.name })
  }

  // If no API key was set, return featured venues only
  return { points: dedupe(points) }
}

// ── dashi layer ─────────────────────────────────────────────────────────────────

async function fetchDashiLayer(
  city: string,
): Promise<{ points: HeatPoint[]; totalSwipes: number }> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  const cityLabel = city

  // --- swipes ---
  const { data: swipeRows } = await supabase
    .from('swipes')
    .select('venue_id, venue_name, count:id')
    .eq('city', cityLabel)
    .order('count', { ascending: false })
    .limit(100)

  // Fallback: aggregate manually if RPC not available
  const { data: rawSwipes } = await supabase
    .from('swipes')
    .select('venue_id, venue_name')
    .eq('city', cityLabel)
    .limit(5000)

  type VenueAgg = { venue_id: string; venue_name: string; swipe_count: number }
  const swipeMap = new Map<string, VenueAgg>()

  // Aggregate swipes
  const swipeSource = swipeRows ?? rawSwipes ?? []
  for (const row of swipeSource) {
    const id = row.venue_id as string
    const name = (row.venue_name as string) ?? ''
    if (swipeMap.has(id)) {
      swipeMap.get(id)!.swipe_count += (row as { count?: number }).count ?? 1
    } else {
      swipeMap.set(id, { venue_id: id, venue_name: name, swipe_count: (row as { count?: number }).count ?? 1 })
    }
  }

  // --- saves (1.5x weight signal) ---
  const { data: rawSaves } = await supabase
    .from('saves')
    .select('venue_id, venue_data')
    .eq('city', cityLabel)
    .limit(2000)

  const saveMap = new Map<string, number>()
  for (const row of rawSaves ?? []) {
    const id = row.venue_id as string
    saveMap.set(id, (saveMap.get(id) ?? 0) + 1)
  }

  // Combine swipes + saves
  const combined = new Map<string, VenueAgg & { saveCount: number }>(
    [...swipeMap.entries()].map(([k, v]) => [k, { ...v, saveCount: saveMap.get(k) ?? 0 }]),
  )
  // Add venues only in saves
  for (const [id, saveCount] of saveMap.entries()) {
    if (!combined.has(id)) {
      // Try to find name from saves data
      const saveRow = (rawSaves ?? []).find(r => r.venue_id === id)
      const name = (saveRow?.venue_data as { name?: string })?.name ?? ''
      combined.set(id, { venue_id: id, venue_name: name, swipe_count: 0, saveCount })
    }
  }

  // Effective score = swipes + 1.5 * saves
  const scored = [...combined.values()].map(v => ({
    ...v,
    score: v.swipe_count + v.saveCount * 1.5,
  }))
  const maxScore = scored.reduce((m, v) => Math.max(m, v.score), 1)
  const totalSwipes = scored.reduce((s, v) => s + v.swipe_count, 0)

  // Resolve lat/lng
  const featuredMap = new Map(ALL_FEATURED_VENUES.map(v => [v.id, v]))
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  const config = CITIES_CONFIG[city]

  const points: HeatPoint[] = []

  for (const v of scored) {
    const weight = Math.min(v.score / maxScore, 1)
    if (weight < 0.01) continue

    // Try to match by venue_id
    const feat = featuredMap.get(v.venue_id)
    if (feat?.lat && feat?.lng) {
      points.push({ lat: feat.lat, lng: feat.lng, weight, name: v.venue_name || feat.name, swipeCount: v.swipe_count })
      continue
    }

    // Fall back to Google Places text search by name
    if (apiKey && v.venue_name && config) {
      try {
        const url =
          `https://maps.googleapis.com/maps/api/place/findplacefromtext/json` +
          `?input=${encodeURIComponent(v.venue_name)}` +
          `&inputtype=textquery` +
          `&locationbias=circle:${PLACES_RADIUS}@${config.lat},${config.lng}` +
          `&fields=geometry,name` +
          `&key=${apiKey}`
        const res = await fetch(url)
        if (res.ok) {
          const data = (await res.json()) as {
            candidates: { geometry?: { location: { lat: number; lng: number } }; name?: string }[]
          }
          const candidate = data.candidates?.[0]
          if (candidate?.geometry?.location) {
            points.push({
              lat: candidate.geometry.location.lat,
              lng: candidate.geometry.location.lng,
              weight,
              name: v.venue_name,
              swipeCount: v.swipe_count,
            })
          }
        }
      } catch {
        // non-fatal
      }
    }
  }

  // If no real data yet, seed with featured venues weighted by hot score
  if (points.length === 0) {
    const featured = ALL_FEATURED_VENUES.filter(v => (v.city ?? 'austin') === cityLabel && v.lat && v.lng)
    for (const v of featured) {
      points.push({ lat: v.lat!, lng: v.lng!, weight: Math.min((v.hot ?? 5) / 10, 1), name: v.name })
    }
  }

  return { points: dedupe(points), totalSwipes }
}

// ── route handler ───────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const rawCity = searchParams.get('city') ?? 'austin'
  const layer = searchParams.get('layer') ?? 'popularity'
  const city = cityKey(rawCity)

  try {
    if (layer === 'dashi') {
      const result = await fetchDashiLayer(city)
      return NextResponse.json(result, {
        headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' },
      })
    }

    const result = await fetchPopularityLayer(city)
    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300' },
    })
  } catch (err) {
    console.error('[heatmap]', err)
    return NextResponse.json({ points: [], totalSwipes: 0 }, { status: 500 })
  }
}
