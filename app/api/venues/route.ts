import { NextRequest, NextResponse } from 'next/server'

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY

const PLACE_TYPES = ['bar', 'restaurant', 'night_club', 'cafe']

interface PlaceResult {
  place_id: string
  name: string
  rating?: number
  user_ratings_total?: number
  price_level?: number
  types: string[]
  vicinity?: string
  geometry: { location: { lat: number; lng: number } }
  photos?: { photo_reference: string }[]
  opening_hours?: { open_now: boolean }
}

function getCategoryFromTypes(types: string[]): string {
  if (types.includes('night_club')) return 'night_club'
  if (types.includes('bar'))        return 'bar'
  if (types.includes('cafe'))       return 'cafe'
  if (types.includes('restaurant')) return 'restaurant'
  return 'bar'
}

function calcDist(lat: number, lng: number, originLat: number, originLng: number): string {
  const R = 3958.8
  const dLat = (lat - originLat) * Math.PI / 180
  const dLng = (lng - originLng) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(originLat*Math.PI/180)*Math.cos(lat*Math.PI/180)*Math.sin(dLng/2)**2
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(1)
}

function transformPlace(place: PlaceResult, originLat: number, originLng: number) {
  const category = getCategoryFromTypes(place.types)
  const rating = place.rating ?? 4.0
  const totalRatings = place.user_ratings_total ?? 0
  const priceLevel = place.price_level ?? 2

  // Hotness score
  const r = Math.max(0, (rating - 3.5) / 1.5)
  const pop = Math.min(totalRatings, 1000) / 1000
  let hot = Math.max(1, Math.min(10, Math.round(r * 6 + pop * 4)))
  if (category === 'bar' || category === 'night_club') hot = Math.min(10, hot + 1)

  const tags: string[] = []
  if (category === 'bar') tags.push('Bar')
  else if (category === 'restaurant') tags.push('Restaurant')
  else if (category === 'cafe') tags.push('Coffee Shop')
  else if (category === 'night_club') tags.push('Nightclub')
  if (priceLevel >= 3) tags.push('Upscale')
  else if (priceLevel <= 1) tags.push('Affordable')

  // Photo
  const photo = place.photos?.[0]?.photo_reference
  const img = photo
    ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photoreference=${photo}&key=${GOOGLE_PLACES_API_KEY}`
    : 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&q=80'

  return {
    id: `gp-${place.place_id}`,
    name: place.name,
    type: category === 'bar' ? 'Bar' : category === 'restaurant' ? 'Restaurant' : category === 'cafe' ? 'Coffee Shop' : 'Nightclub',
    dist: `${calcDist(place.geometry.location.lat, place.geometry.location.lng, originLat, originLng)} mi`,
    rating: rating.toFixed(1),
    category,
    priceLevel,
    img,
    tags: tags.slice(0, 2),
    promo: false,
    hot,
    vicinity: place.vicinity,
    lat: place.geometry.location.lat,
    lng: place.geometry.location.lng,
  }
}

export async function GET(request: NextRequest) {
  if (!GOOGLE_PLACES_API_KEY) {
    return NextResponse.json({ error: 'Google Places API key not configured' }, { status: 503 })
  }

  const { searchParams } = new URL(request.url)
  const city = searchParams.get('city') ?? 'austin'

  const ORIGINS: Record<string, { lat: number; lng: number }> = {
    austin:    { lat: 30.2672,  lng: -97.7431  },
    monterrey: { lat: 25.6714,  lng: -100.3090 },
    atlanta:   { lat: 33.7490,  lng: -84.3880  },
    nyc:       { lat: 40.7580,  lng: -73.9855  },
    dallas:    { lat: 32.7767,  lng: -96.7970  },
    miami:     { lat: 25.7617,  lng: -80.1918  },
    cdmx:      { lat: 19.4326,  lng: -99.1332  },
    chicago:   { lat: 41.8827,  lng: -87.6233  },
    la:        { lat: 34.0522,  lng: -118.2437 },
    houston:   { lat: 29.7604,  lng: -95.3698  },
  }
  const origin = ORIGINS[city] ?? ORIGINS.austin

  const venues: ReturnType<typeof transformPlace>[] = []

  for (const type of PLACE_TYPES) {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${origin.lat},${origin.lng}&radius=3000&type=${type}&key=${GOOGLE_PLACES_API_KEY}`
    try {
      const res = await fetch(url, { next: { revalidate: 3600 } })
      const data = await res.json() as { results: PlaceResult[] }
      if (data.results) {
        venues.push(...data.results.slice(0, 10).map(p => transformPlace(p, origin.lat, origin.lng)))
      }
    } catch (err) {
      console.error(`Places API error for ${type}:`, err)
    }
  }

  return NextResponse.json({ venues })
}
