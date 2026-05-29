-- 🌌 Fandom Vibe Evolve Schema Migration
-- Evolving Fandom Vibe into a production social platform with the requested schema.

-- 1. Drop old tables if they exist (cascading constraints)
drop table if exists public.vibe_matches cascade;
drop table if exists public.signals cascade;
drop table if exists public.notifications cascade;
drop table if exists public.saved_posts cascade;
drop table if exists public.likes cascade;
drop table if exists public.follows cascade;
drop table if exists public.comments cascade;
drop table if exists public.posts cascade;
drop table if exists public.space_members cascade;
drop table if exists public.spaces cascade;
drop table if exists public.users cascade;
drop table if exists public.profiles cascade;

-- 2. Create profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  fandoms text[] default '{}',
  hobbies text[] default '{}',
  aesthetics text[] default '{}',
  mood_tags text[] default '{}',
  created_at timestamptz default now()
);

-- 3. Create spaces table
create table public.spaces (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text not null,
  cover_image text,
  vibe text, -- mapping to aesthetics
  created_at timestamptz default now()
);

-- 4. Create space_members junction table [NEW]
create table public.space_members (
  space_id uuid not null references public.spaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (space_id, user_id)
);

-- 5. Create posts table
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  space_id uuid references public.spaces(id) on delete set null,
  content text,
  image_url text,
  mood_tag text,
  music_link text,
  created_at timestamptz default now()
);

-- 6. Create comments table
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

-- 7. Create likes table
create table public.likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, post_id)
);

-- 8. Create follows table
create table public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique (follower_id, following_id),
  constraint no_self_follow check (follower_id != following_id)
);

-- 9. Create notifications table [REPLACED signals]
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null, -- 'like', 'comment', 'follow', 'space_activity'
  content text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- 10. Create saved_posts table
create table public.saved_posts (
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, post_id)
);

-- 11. Create vibe_matches cache table
create table public.vibe_matches (
  user_id_1 uuid references public.profiles(id) on delete cascade,
  user_id_2 uuid references public.profiles(id) on delete cascade,
  match_percentage integer not null check (match_percentage >= 0 and match_percentage <= 100),
  shared_fandoms text[] default '{}',
  shared_hobbies text[] default '{}',
  shared_aesthetics text[] default '{}',
  updated_at timestamptz default now(),
  primary key (user_id_1, user_id_2),
  constraint ordered_ids check (user_id_1 < user_id_2)
);

-- 12. Enable Row Level Security (RLS) for all tables
alter table public.profiles enable row level security;
alter table public.spaces enable row level security;
alter table public.space_members enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.follows enable row level security;
alter table public.notifications enable row level security;
alter table public.saved_posts enable row level security;
alter table public.vibe_matches enable row level security;

-- 13. Define Row Level Security (RLS) Policies

-- Profiles RLS
create policy "Profiles are readable by everyone" on public.profiles for select using (true);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);

-- Spaces RLS
create policy "Spaces are readable by everyone" on public.spaces for select using (true);
create policy "Allow auth users to insert spaces" on public.spaces for insert with check (auth.role() = 'authenticated');

-- Space Members RLS
create policy "Space members are readable by everyone" on public.space_members for select using (true);
create policy "Users can join a space" on public.space_members for insert with check (auth.uid() = user_id);
create policy "Users can leave a space" on public.space_members for delete using (auth.uid() = user_id);

-- Posts RLS
create policy "Posts are readable by everyone" on public.posts for select using (true);
create policy "Users can create own posts" on public.posts for insert with check (auth.uid() = user_id);
create policy "Users can update own posts" on public.posts for update using (auth.uid() = user_id);
create policy "Users can delete own posts" on public.posts for delete using (auth.uid() = user_id);

-- Comments RLS
create policy "Comments are readable by everyone" on public.comments for select using (true);
create policy "Users can create own comments" on public.comments for insert with check (auth.uid() = user_id);
create policy "Users can update own comments" on public.comments for update using (auth.uid() = user_id);
create policy "Users can delete own comments" on public.comments for delete using (auth.uid() = user_id);

-- Likes RLS
create policy "Likes are readable by everyone" on public.likes for select using (true);
create policy "Users can like posts" on public.likes for insert with check (auth.uid() = user_id);
create policy "Users can unlike posts" on public.likes for delete using (auth.uid() = user_id);

-- Follows RLS
create policy "Follows are readable by everyone" on public.follows for select using (true);
create policy "Users can follow" on public.follows for insert with check (auth.uid() = follower_id);
create policy "Users can unfollow" on public.follows for delete using (auth.uid() = follower_id);

-- Notifications RLS
create policy "Notifications are readable by owner" on public.notifications for select using (auth.uid() = user_id);
create policy "Notifications are manageable by owner" on public.notifications for all using (auth.uid() = user_id);
create policy "Allow authenticated users to create notifications" on public.notifications for insert with check (auth.role() = 'authenticated');

-- Saved Posts RLS
create policy "Saved posts are readable by owner" on public.saved_posts for select using (auth.uid() = user_id);
create policy "Users can save posts" on public.saved_posts for insert with check (auth.uid() = user_id);
create policy "Users can unsave posts" on public.saved_posts for delete using (auth.uid() = user_id);

-- Vibe Matches RLS
create policy "Vibe matches are readable by involved users" on public.vibe_matches for select using (auth.uid() = user_id_1 or auth.uid() = user_id_2);


-- 14. Vibe Matching Similarity Function & Triggers (Jaccard Index)
drop function if exists public.calculate_match_percentage(text[], text[], text[], text[], text[], text[]) cascade;
drop function if exists public.recalculate_user_vibe_matches(uuid) cascade;

create or replace function public.calculate_match_percentage(
  fandoms1 text[], fandoms2 text[],
  hobbies1 text[], hobbies2 text[],
  aesthetics1 text[], aesthetics2 text[]
) returns jsonb as $$
declare
  intersection_fandoms text[] := '{}';
  union_fandoms text[] := '{}';
  jaccard_fandom double precision := 0.0;
  
  intersection_hobbies text[] := '{}';
  union_hobbies text[] := '{}';
  jaccard_hobby double precision := 0.0;
  
  intersection_aesthetics text[] := '{}';
  union_aesthetics text[] := '{}';
  jaccard_aesthetic double precision := 0.0;
  
  total_pct integer;
begin
  fandoms1 := coalesce(fandoms1, '{}');
  fandoms2 := coalesce(fandoms2, '{}');
  hobbies1 := coalesce(hobbies1, '{}');
  hobbies2 := coalesce(hobbies2, '{}');
  aesthetics1 := coalesce(aesthetics1, '{}');
  aesthetics2 := coalesce(aesthetics2, '{}');

  -- Fandom similarity
  if array_length(fandoms1, 1) > 0 or array_length(fandoms2, 1) > 0 then
    select array(select unnest(fandoms1) intersect select unnest(fandoms2)) into intersection_fandoms;
    select array(select unnest(fandoms1) union select unnest(fandoms2)) into union_fandoms;
    if array_length(union_fandoms, 1) > 0 then
      jaccard_fandom := array_length(intersection_fandoms, 1)::double precision / array_length(union_fandoms, 1)::double precision;
    end if;
  end if;

  -- Hobby similarity
  if array_length(hobbies1, 1) > 0 or array_length(hobbies2, 1) > 0 then
    select array(select unnest(hobbies1) intersect select unnest(hobbies2)) into intersection_hobbies;
    select array(select unnest(hobbies1) union select unnest(hobbies2)) into union_hobbies;
    if array_length(union_hobbies, 1) > 0 then
      jaccard_hobby := array_length(intersection_hobbies, 1)::double precision / array_length(union_hobbies, 1)::double precision;
    end if;
  end if;

  -- Aesthetic similarity
  if array_length(aesthetics1, 1) > 0 or array_length(aesthetics2, 1) > 0 then
    select array(select unnest(aesthetics1) intersect select unnest(aesthetics2)) into intersection_aesthetics;
    select array(select unnest(aesthetics1) union select unnest(aesthetics2)) into union_aesthetics;
    if array_length(union_aesthetics, 1) > 0 then
      jaccard_aesthetic := array_length(intersection_aesthetics, 1)::double precision / array_length(union_aesthetics, 1)::double precision;
    end if;
  end if;

  -- Weight: 45% Aesthetics + 35% Hobbies + 20% Fandoms
  total_pct := round((jaccard_aesthetic * 45.0) + (jaccard_hobby * 35.0) + (jaccard_fandom * 20.0));
  
  return jsonb_build_object(
    'percentage', total_pct,
    'shared_fandoms', coalesce(intersection_fandoms, '{}'),
    'shared_hobbies', coalesce(intersection_hobbies, '{}'),
    'shared_aesthetics', coalesce(intersection_aesthetics, '{}')
  );
end;
$$ language plpgsql immutable;

-- Recalculate matches trigger function
create or replace function public.recalculate_user_vibe_matches(target_user_id uuid)
returns void as $$
declare
  other_user record;
  match_result jsonb;
  uid_first uuid;
  uid_second uuid;
begin
  for other_user in 
    select id, fandoms, hobbies, aesthetics from public.profiles where id != target_user_id
  loop
    select public.calculate_match_percentage(
      p.fandoms, other_user.fandoms,
      p.hobbies, other_user.hobbies,
      p.aesthetics, other_user.aesthetics
    )
    into match_result
    from public.profiles p where p.id = target_user_id;

    if target_user_id < other_user.id then
      uid_first := target_user_id;
      uid_second := other_user.id;
    else
      uid_first := other_user.id;
      uid_second := target_user_id;
    end if;

    insert into public.vibe_matches (
      user_id_1, user_id_2, match_percentage,
      shared_fandoms, shared_hobbies, shared_aesthetics, updated_at
    )
    values (
      uid_first, uid_second, coalesce((match_result->>'percentage')::integer, 0),
      array(select value from jsonb_array_elements_text(coalesce(match_result->'shared_fandoms', '[]'::jsonb)) as value),
      array(select value from jsonb_array_elements_text(coalesce(match_result->'shared_hobbies', '[]'::jsonb)) as value),
      array(select value from jsonb_array_elements_text(coalesce(match_result->'shared_aesthetics', '[]'::jsonb)) as value),
      now()
    )
    on conflict (user_id_1, user_id_2) do update set
      match_percentage = excluded.match_percentage,
      shared_fandoms = excluded.shared_fandoms,
      shared_hobbies = excluded.shared_hobbies,
      shared_aesthetics = excluded.shared_aesthetics,
      updated_at = now();
  end loop;
end;
$$ language plpgsql;

create or replace function public.on_user_profile_change()
returns trigger as $$
begin
  perform public.recalculate_user_vibe_matches(new.id);
  return new;
end;
$$ language plpgsql;

drop trigger if exists user_profile_change_trigger on public.profiles;
create trigger user_profile_change_trigger
after insert or update of fandoms, hobbies, aesthetics on public.profiles
for each row execute function public.on_user_profile_change();


-- 15. Automatically create profile row when user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url, bio)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'dreamer_' || substr(new.id::text, 1, 6)),
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'username', 'Dreamer'),
    'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=600&q=80',
    'Dreamer who recently joined the fandom city.'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- 16. Enable Realtime Replication
alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.comments;
alter publication supabase_realtime add table public.likes;
alter publication supabase_realtime add table public.follows;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.space_members;


-- 17. Seed default spaces
insert into public.spaces (id, name, description, cover_image, vibe) values
  ('550e8400-e29b-41d4-a716-446655440001', 'Midnight Thoughts', 'Late-night notes, lyrical confessions, and soft chaos after 12.', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80', 'Midnight Energy'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Cozy Cafe', 'Warm drinks, reading corners, gentle playlists, and comfort posts.', 'https://images.unsplash.com/photo-1511081692775-05d0f180a065?auto=format&fit=crop&w=1200&q=80', 'Cozy Cafe'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Fashion Room', 'Idol airport looks, streetwear edits, thrift finds, and fit checks.', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80', 'Streetwear'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Producer Space', 'Beat snippets, desk setups, lyric drafts, and late-session energy.', 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=80', 'Film Aesthetic'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Anime & K-Drama Club', 'Watchlists, edits, emotional scenes, and comfort-character devotion.', 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1200&q=80', 'Dreamcore')
on conflict (name) do update set
  description = excluded.description,
  cover_image = excluded.cover_image,
  vibe = excluded.vibe;


-- 18. Supabase Storage Buckets configuration
insert into storage.buckets (id, name, public)
values 
  ('avatars', 'avatars', true),
  ('posts', 'posts', true),
  ('spaces', 'spaces', true)
on conflict (id) do nothing;

-- 19. Storage Security Policies
drop policy if exists "Public Access to Avatars" on storage.objects;
drop policy if exists "Public Access to Posts" on storage.objects;
drop policy if exists "Public Access to Spaces" on storage.objects;
drop policy if exists "Allow authenticated avatar uploads" on storage.objects;
drop policy if exists "Allow authenticated post uploads" on storage.objects;
drop policy if exists "Allow authenticated space cover uploads" on storage.objects;

create policy "Public Access to Avatars" on storage.objects for select using (bucket_id = 'avatars');
create policy "Public Access to Posts" on storage.objects for select using (bucket_id = 'posts');
create policy "Public Access to Spaces" on storage.objects for select using (bucket_id = 'spaces');

create policy "Allow authenticated avatar uploads" on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Allow authenticated post uploads" on storage.objects for insert
  with check (bucket_id = 'posts' and auth.role() = 'authenticated');

create policy "Allow authenticated space cover uploads" on storage.objects for insert
  with check (bucket_id = 'spaces' and auth.role() = 'authenticated');
