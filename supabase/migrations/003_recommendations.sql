CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  google_place_id text NOT NULL,
  venue_name text NOT NULL,
  venue_type text,
  city text NOT NULL DEFAULT 'austin',
  address text,
  notes text,
  lat double precision,
  lng double precision,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, google_place_id)
);

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "recs_read_all" ON recommendations;
CREATE POLICY "recs_read_all" ON recommendations FOR SELECT USING (true);

DROP POLICY IF EXISTS "recs_insert_own" ON recommendations;
CREATE POLICY "recs_insert_own" ON recommendations FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "recs_delete_own" ON recommendations;
CREATE POLICY "recs_delete_own" ON recommendations FOR DELETE USING (auth.uid() = user_id);
