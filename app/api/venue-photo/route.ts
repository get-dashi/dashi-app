import { NextRequest, NextResponse } from 'next/server'

const API_KEY = process.env.GOOGLE_PLACES_API_KEY

const CITY_CONFIG: Record<string, { location: string; radius: number; label: string }> = {
  austin:    { location: '30.2672,-97.7431',   radius: 3000, label: 'Austin' },
  monterrey: { location: '25.6714,-100.3090',  radius: 2000, label: 'Monterrey' },
  atlanta:   { location: '33.7490,-84.3880',   radius: 3000, label: 'Atlanta' },
  nyc:       { location: '40.7580,-73.9855',   radius: 2500, label: 'New York' },
  dallas:    { location: '32.7767,-96.7970',   radius: 3000, label: 'Dallas' },
  miami:     { location: '25.7617,-80.1918',   radius: 2500, label: 'Miami' },
  cdmx:      { location: '19.4326,-99.1332',   radius: 2500, label: 'Mexico City' },
  chicago:   { location: '41.8827,-87.6233',   radius: 3000, label: 'Chicago' },
  la:        { location: '34.0522,-118.2437',  radius: 3000, label: 'Los Angeles' },
  houston:   { location: '29.7604,-95.3698',   radius: 3000, label: 'Houston' },
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('q')
  const city = searchParams.get('city') ?? 'austin'

  if (!name || !API_KEY) return NextResponse.json({ imgUrl: null })

  const cfg = CITY_CONFIG[city] ?? CITY_CONFIG.austin

  // For non-Austin cities, include city name in query to avoid wrong-city matches
  const query = city !== 'austin' ? `${name} ${cfg.label}` : name

  try {
    const searchUrl = [
      'https://maps.googleapis.com/maps/api/place/findplacefromtext/json',
      `?input=${encodeURIComponent(query)}`,
      `&inputtype=textquery`,
      `&locationbias=circle:${cfg.radius}@${cfg.location}`,
      `&fields=photos,place_id,name,geometry`,
      `&key=${API_KEY}`,
    ].join('')

    const res = await fetch(searchUrl, { next: { revalidate: 86400 } })
    const data = await res.json() as {
      candidates?: {
        name?: string
        photos?: { photo_reference: string }[]
        geometry?: { location: { lat: number; lng: number } }
      }[]
    }

    const candidate = data.candidates?.[0]
    if (!candidate?.photos?.[0]) return NextResponse.json({ imgUrl: null })

    // Sanity check: if the candidate name looks completely unrelated, skip it
    const candidateName = (candidate.name ?? '').toLowerCase()
    const searchName = name.toLowerCase()
    const firstWord = searchName.split(' ')[0]
    if (firstWord.length > 3 && !candidateName.includes(firstWord) && !searchName.includes(candidateName.split(' ')[0])) {
      return NextResponse.json({ imgUrl: null })
    }

    const photoRef = candidate.photos[0].photo_reference
    const imgUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photoreference=${photoRef}&key=${API_KEY}`
    return NextResponse.json({ imgUrl })
  } catch {
    return NextResponse.json({ imgUrl: null })
  }
}
