-- Enable uuid extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES TABLE (expanded from base: id, name, city, created_at)
-- ============================================================
create table if not exists public.profiles (
  id            uuid references auth.users on delete cascade primary key,
  name          text,
  city          text default 'austin',
  avatar_url    text,
  bio           text,
  preferences   text[] default '{}',
  saves_count   int default 0,
  nights_out    int default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ============================================================
-- SAVES TABLE
-- ============================================================
create table if not exists public.saves (
  id           uuid default uuid_generate_v4() primary key,
  user_id      uuid references public.profiles(id) on delete cascade not null,
  venue_id     text not null,
  venue_data   jsonb not null,
  created_at   timestamptz default now(),
  unique(user_id, venue_id)
);

-- ============================================================
-- SWIPES TABLE
-- ============================================================
create table if not exists public.swipes (
  id           uuid default uuid_generate_v4() primary key,
  user_id      uuid references public.profiles(id) on delete cascade not null,
  venue_id     text not null,
  direction    text check (direction in ('like','pass')) not null,
  created_at   timestamptz default now(),
  unique(user_id, venue_id)
);

-- ============================================================
-- GROUPS TABLE
-- ============================================================
create table if not exists public.groups (
  id           uuid default uuid_generate_v4() primary key,
  name         text not null,
  code         text unique not null,
  creator_id   uuid references public.profiles(id) on delete cascade not null,
  created_at   timestamptz default now()
);

-- ============================================================
-- GROUP MEMBERS TABLE
-- ============================================================
create table if not exists public.group_members (
  id           uuid default uuid_generate_v4() primary key,
  group_id     uuid references public.groups(id) on delete cascade not null,
  user_id      uuid references public.profiles(id) on delete cascade not null,
  joined_at    timestamptz default now(),
  unique(group_id, user_id)
);

-- ============================================================
-- RLS POLICIES
-- ============================================================
alter table public.profiles enable row level security;
alter table public.saves enable row level security;
alter table public.swipes enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;

-- Profiles
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Saves
create policy "Users can manage own saves" on public.saves
  for all using (auth.uid() = user_id);

-- Swipes
create policy "Users can manage own swipes" on public.swipes
  for all using (auth.uid() = user_id);

-- Groups
create policy "Users can view groups they belong to" on public.groups
  for select using (
    id in (select group_id from public.group_members where user_id = auth.uid())
    or creator_id = auth.uid()
  );
create policy "Users can create groups" on public.groups
  for insert with check (auth.uid() = creator_id);
create policy "Creators can update groups" on public.groups
  for update using (auth.uid() = creator_id);

-- Group members
create policy "Group members can view group membership" on public.group_members
  for select using (
    group_id in (select group_id from public.group_members where user_id = auth.uid())
  );
create policy "Users can join groups" on public.group_members
  for insert with check (auth.uid() = user_id);

-- ============================================================
-- TRIGGER: auto-create profile on user signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, city)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'austin'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- TRIGGER: update updated_at on profile changes
-- ============================================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at();

-- ============================================================
-- STORAGE: avatars bucket
-- ============================================================
insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

create policy "Avatar images are publicly accessible" on storage.objects
  for select using (bucket_id = 'avatars');
create policy "Users can upload their own avatar" on storage.objects
  for insert with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users can update their own avatar" on storage.objects
  for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users can delete their own avatar" on storage.objects
  for delete using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
