-- Groups table
CREATE TABLE IF NOT EXISTS groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL DEFAULT 'Night Out',
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  city text NOT NULL DEFAULT 'austin',
  created_at timestamptz DEFAULT now()
);

-- Group members
CREATE TABLE IF NOT EXISTS group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Anyone can read a group by code (for joining)
DROP POLICY IF EXISTS "groups_read_by_code" ON groups;
CREATE POLICY "groups_read_by_code" ON groups FOR SELECT USING (true);

-- Authenticated users can create groups
DROP POLICY IF EXISTS "groups_insert" ON groups;
CREATE POLICY "groups_insert" ON groups FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Members can read their group memberships
DROP POLICY IF EXISTS "group_members_read" ON group_members;
CREATE POLICY "group_members_read" ON group_members FOR SELECT USING (true);

-- Authenticated users can join groups
DROP POLICY IF EXISTS "group_members_insert" ON group_members;
CREATE POLICY "group_members_insert" ON group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
