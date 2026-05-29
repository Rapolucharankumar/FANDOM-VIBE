create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  bio text,
  profile_image text,
  fandoms text[] default '{}',
  hobbies text[] default '{}',
  vibes text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists public.spaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  cover_image text,
  created_at timestamptz default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  content text,
  image_url text,
  space_id uuid references public.spaces(id) on delete set null,
  mood_tag text,
  music_link text,
  created_at timestamptz default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

alter table public.users enable row level security;
alter table public.spaces enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;

create policy "Profiles are readable" on public.users for select using (true);
create policy "Users manage own profile" on public.users for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "Spaces are readable" on public.spaces for select using (true);

create policy "Posts are readable" on public.posts for select using (true);
create policy "Users create own posts" on public.posts for insert with check (auth.uid() = user_id);
create policy "Users update own posts" on public.posts for update using (auth.uid() = user_id);
create policy "Users delete own posts" on public.posts for delete using (auth.uid() = user_id);

create policy "Comments are readable" on public.comments for select using (true);
create policy "Users create own comments" on public.comments for insert with check (auth.uid() = user_id);
create policy "Users update own comments" on public.comments for update using (auth.uid() = user_id);
create policy "Users delete own comments" on public.comments for delete using (auth.uid() = user_id);
