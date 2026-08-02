-- Venue visits (user marks a place as "been here")
CREATE TABLE IF NOT EXISTS visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  venue_id text NOT NULL,
  venue_name text NOT NULL,
  venue_type text,
  city text NOT NULL DEFAULT 'austin',
  img text,
  visited_at timestamptz DEFAULT now(),
  UNIQUE(user_id, venue_id)
);

-- Personal Top 10 rankings per city
CREATE TABLE IF NOT EXISTS rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  venue_id text NOT NULL,
  venue_name text NOT NULL,
  venue_type text,
  city text NOT NULL DEFAULT 'austin',
  img text,
  rank_position integer NOT NULL CHECK (rank_position BETWEEN 1 AND 10),
  ranked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, city, rank_position),
  UNIQUE(user_id, venue_id, city)
);

ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE rankings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "visits_read_own" ON visits;
CREATE POLICY "visits_read_own" ON visits FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "visits_insert_own" ON visits;
CREATE POLICY "visits_insert_own" ON visits FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "visits_delete_own" ON visits;
CREATE POLICY "visits_delete_own" ON visits FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "rankings_read_own" ON rankings;
CREATE POLICY "rankings_read_own" ON rankings FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "rankings_insert_own" ON rankings;
CREATE POLICY "rankings_insert_own" ON rankings FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "rankings_update_own" ON rankings;
CREATE POLICY "rankings_update_own" ON rankings FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "rankings_delete_own" ON rankings;
CREATE POLICY "rankings_delete_own" ON rankings FOR DELETE USING (auth.uid() = user_id);
