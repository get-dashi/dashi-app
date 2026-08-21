-- Migration: 005_venues_happy_hours.sql
-- Venue catalog (seeded from HH Austin, extendable to other cities)

CREATE TABLE IF NOT EXISTS venues (
  id text PRIMARY KEY,                    -- slug, e.g. "bills-oyster"
  name text NOT NULL,
  address text,
  city text NOT NULL DEFAULT 'austin',
  neighborhood text,
  cuisine text,
  price_range text,                       -- '$', '$$', '$$$', '$$$$'
  phone text,
  website text,
  reservations_url text,
  latitude double precision,
  longitude double precision,
  rating double precision,
  atmosphere_tags text[],                 -- e.g. ['casual','patio','dog-friendly']
  status text DEFAULT 'open',            -- 'open' | 'closed' | 'unknown'
  source text DEFAULT 'hhaustin',         -- data provenance
  last_updated date,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS venues_city_idx ON venues(city);
CREATE INDEX IF NOT EXISTS venues_neighborhood_idx ON venues(neighborhood);

-- Happy hour schedules + deals
CREATE TABLE IF NOT EXISTS happy_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id text NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  days text[] NOT NULL,                  -- e.g. ['Monday','Tuesday','Friday']
  start_time time NOT NULL,             -- 15:00
  end_time time NOT NULL,               -- 17:30
  deals jsonb,                           -- [{category, description, price, discount}]
  notes text,
  last_verified date,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS happy_hours_venue_idx ON happy_hours(venue_id);

-- RLS: public read
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE happy_hours ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "venues_read_all" ON venues;
CREATE POLICY "venues_read_all" ON venues FOR SELECT USING (true);

DROP POLICY IF EXISTS "happy_hours_read_all" ON happy_hours;
CREATE POLICY "happy_hours_read_all" ON happy_hours FOR SELECT USING (true);
