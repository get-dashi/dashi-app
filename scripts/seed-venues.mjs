#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Parse .env file — strip quotes AND literal \n Vercel bakes in
function parseEnv(filePath) {
  const vars = {}
  for (const line of readFileSync(filePath, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq < 0) continue
    const key = t.slice(0, eq).trim()
    const raw = t.slice(eq + 1).trim()
    // Strip surrounding quotes, then literal \n sequences
    vars[key] = raw.replace(/^["']|["']$/g, '').replace(/\\n/g, '').trim()
  }
  return vars
}

const env = parseEnv(join(__dirname, '..', '.env.production.local'))
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY  = env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || SUPABASE_URL.includes('placeholder')) {
  console.error('❌  No valid SUPABASE_URL found.')
  process.exit(1)
}

console.log('🌐', SUPABASE_URL.split('.')[0].replace('https://', ''))
console.log('🔑 Key prefix:', SERVICE_KEY.slice(0, 40))

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

const restaurants = JSON.parse(
  readFileSync(join(__dirname, '..', 'supabase', 'hhaustin_restaurants.json'), 'utf8')
)

function chunk(arr, size) {
  const out = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

const venueRows = restaurants.map(r => ({
  id:               r.id,
  name:             r.name,
  address:          r.address ?? null,
  city:             'austin',
  neighborhood:     r.neighborhood ?? null,
  cuisine:          r.cuisine ?? null,
  price_range:      r.priceRange ?? null,
  phone:            r.phone ?? null,
  website:          r.website ?? null,
  reservations_url: r.reservations ?? null,
  latitude:         r.latitude ?? null,
  longitude:        r.longitude ?? null,
  rating:           r.rating ?? null,
  atmosphere_tags:  r.atmosphereTags ?? null,
  status:           r.status ?? 'open',
  source:           'hhaustin',
  last_updated:     r.lastUpdated ?? null,
}))

const hhRows = []
for (const r of restaurants) {
  for (const s of r.happyHourSchedule ?? []) {
    hhRows.push({
      venue_id:      r.id,
      days:          s.days,
      start_time:    s.startTime,
      end_time:      s.endTime,
      deals:         r.deals ?? null,
      last_verified: r.lastUpdated ?? null,
    })
  }
}

// Venues
console.log(`\n📍 Upserting ${venueRows.length} venues...`)
let done = 0
for (const c of chunk(venueRows, 50)) {
  const { error } = await supabase.from('venues').upsert(c, { onConflict: 'id' })
  if (error) { console.error('❌ venues:', error.message); process.exit(1) }
  done += c.length
  process.stdout.write(`  ${done}/${venueRows.length}\r`)
}
console.log(`\n  ✅ Venues done`)

// Happy hours
console.log(`\n🍹 Inserting ${hhRows.length} happy hour schedules...`)
const venueIds = [...new Set(hhRows.map(r => r.venue_id))]
await supabase.from('happy_hours').delete().in('venue_id', venueIds)
done = 0
for (const c of chunk(hhRows, 50)) {
  const { error } = await supabase.from('happy_hours').insert(c)
  if (error) { console.error('❌ happy_hours:', error.message); process.exit(1) }
  done += c.length
  process.stdout.write(`  ${done}/${hhRows.length}\r`)
}
console.log(`\n  ✅ Happy hours done`)

console.log('\n🎉 Seed complete!\n')
