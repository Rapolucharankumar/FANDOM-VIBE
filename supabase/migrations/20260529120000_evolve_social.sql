-- 🌌 Fandom Vibe Evolve Schema Migration
-- Evolving Fandom Vibe from MVP to a production social platform.

-- 1. Alter users table to support handle
alter table public.users add column if not exists handle text unique;

-- Backfill handles for existing users (extracting from username)
update public.users set handle = lower(replace(username, ' ', '')) where handle is null;

-- 2. Create follows table
create table if not exists public.follows (
  follower_id uuid not null references public.users(id) on delete cascade,
  following_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id),
  constraint no_self_follow check (follower_id != following_id)
);

-- 3. Create likes table
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, post_id)
);

-- 4. Create saved_posts table
create table if not exists public.saved_posts (
  user_id uuid not null references public.users(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, post_id)
);

-- 5. Create vibe_matches cache table
create table if not exists public.vibe_matches (
  user_id_1 uuid references public.users(id) on delete cascade,
  user_id_2 uuid references public.users(id) on delete cascade,
  match_percentage integer not null check (match_percentage >= 0 and match_percentage <= 100),
  shared_fandoms text[] default '{}',
  shared_hobbies text[] default '{}',
  shared_vibes text[] default '{}',
  updated_at timestamptz default now(),
  primary key (user_id_1, user_id_2),
  constraint ordered_ids check (user_id_1 < user_id_2)
);

-- 6. Create signals (notifications) table
create table if not exists public.signals (
  id uuid primary key default gen_random_uuid(),
  receiver_id uuid not null references public.users(id) on delete cascade,
  sender_id uuid references public.users(id) on delete cascade,
  type text not null, -- 'like', 'comment', 'vibe_match_join', 'new_post_match', 'follow'
  title text not null,
  body text,
  link text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS for new tables
alter table public.follows enable row level security;
alter table public.likes enable row level security;
alter table public.saved_posts enable row level security;
alter table public.vibe_matches enable row level security;
alter table public.signals enable row level security;

-- 7. Define Row Level Security (RLS) Policies

-- Follows RLS
create policy "Follows are readable by everyone" on public.follows
  for select using (true);

create policy "Users can follow others" on public.follows
  for insert with check (auth.uid() = follower_id);

create policy "Users can unfollow others" on public.follows
  for delete using (auth.uid() = follower_id);

-- Likes RLS
create policy "Likes are readable by everyone" on public.likes
  for select using (true);

create policy "Users can like posts" on public.likes
  for insert with check (auth.uid() = user_id);

create policy "Users can unlike posts" on public.likes
  for delete using (auth.uid() = user_id);

-- Saved Posts RLS
create policy "Saved posts are private to owner" on public.saved_posts
  for select using (auth.uid() = user_id);

create policy "Users can bookmark posts" on public.saved_posts
  for insert with check (auth.uid() = user_id);

create policy "Users can unbookmark posts" on public.saved_posts
  for delete using (auth.uid() = user_id);

-- Vibe Matches RLS
create policy "Vibe matches are readable by involved users" on public.vibe_matches
  for select using (auth.uid() = user_id_1 or auth.uid() = user_id_2);

-- Signals RLS
create policy "Signals are readable by recipient" on public.signals
  for select using (auth.uid() = receiver_id);

create policy "Signals are manageable by recipient" on public.signals
  for all using (auth.uid() = receiver_id);

create policy "Authenticated users can create signals" on public.signals
  for insert with check (auth.uid() = sender_id or sender_id is null);

-- 8. Functions and Triggers for Vibe Matching Algorithm

-- A function to compute the vibe match percentage between two sets of attributes:
-- Formula: 45% Vibes + 35% Hobbies + 20% Fandoms
create or replace function public.calculate_match_percentage(
  fandoms1 text[], fandoms2 text[],
  hobbies1 text[], hobbies2 text[],
  vibes1 text[], vibes2 text[]
) returns jsonb as $$
declare
  intersection_fandoms text[] := '{}';
  union_fandoms text[] := '{}';
  jaccard_fandom double precision := 0.0;
  
  intersection_hobbies text[] := '{}';
  union_hobbies text[] := '{}';
  jaccard_hobby double precision := 0.0;
  
  intersection_vibes text[] := '{}';
  union_vibes text[] := '{}';
  jaccard_vibe double precision := 0.0;
  
  total_pct integer;
begin
  -- ensure arrays are not null
  fandoms1 := coalesce(fandoms1, '{}');
  fandoms2 := coalesce(fandoms2, '{}');
  hobbies1 := coalesce(hobbies1, '{}');
  hobbies2 := coalesce(hobbies2, '{}');
  vibes1 := coalesce(vibes1, '{}');
  vibes2 := coalesce(vibes2, '{}');

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

  -- Vibe similarity
  if array_length(vibes1, 1) > 0 or array_length(vibes2, 1) > 0 then
    select array(select unnest(vibes1) intersect select unnest(vibes2)) into intersection_vibes;
    select array(select unnest(vibes1) union select unnest(vibes2)) into union_vibes;
    if array_length(union_vibes, 1) > 0 then
      jaccard_vibe := array_length(intersection_vibes, 1)::double precision / array_length(union_vibes, 1)::double precision;
    end if;
  end if;

  total_pct := round((jaccard_vibe * 45.0) + (jaccard_hobby * 35.0) + (jaccard_fandom * 20.0));
  
  return jsonb_build_object(
    'percentage', total_pct,
    'shared_fandoms', coalesce(intersection_fandoms, '{}'),
    'shared_hobbies', coalesce(intersection_hobbies, '{}'),
    'shared_vibes', coalesce(intersection_vibes, '{}')
  );
end;
$$ language plpgsql immutable;

-- A function to recalculate the matches for a target user with all other users
create or replace function public.recalculate_user_vibe_matches(target_user_id uuid)
returns void as $$
declare
  other_user record;
  match_result jsonb;
  uid_first uuid;
  uid_second uuid;
begin
  for other_user in 
    select id, fandoms, hobbies, vibes from public.users where id != target_user_id
  loop
    -- compute match
    select public.calculate_match_percentage(
      u.fandoms, other_user.fandoms,
      u.hobbies, other_user.hobbies,
      u.vibes, other_user.vibes
    )
    into match_result
    from public.users u where u.id = target_user_id;

    -- order ids to satisfy ordered_ids check (user_id_1 < user_id_2)
    if target_user_id < other_user.id then
      uid_first := target_user_id;
      uid_second := other_user.id;
    else
      uid_first := other_user.id;
      uid_second := target_user_id;
    end if;

    insert into public.vibe_matches (
      user_id_1, user_id_2, match_percentage,
      shared_fandoms, shared_hobbies, shared_vibes, updated_at
    )
    values (
      uid_first, uid_second, coalesce((match_result->>'percentage')::integer, 0),
      array(select value from jsonb_array_elements_text(coalesce(match_result->'shared_fandoms', '[]'::jsonb)) as value),
      array(select value from jsonb_array_elements_text(coalesce(match_result->'shared_hobbies', '[]'::jsonb)) as value),
      array(select value from jsonb_array_elements_text(coalesce(match_result->'shared_vibes', '[]'::jsonb)) as value),
      now()
    )
    on conflict (user_id_1, user_id_2) do update set
      match_percentage = excluded.match_percentage,
      shared_fandoms = excluded.shared_fandoms,
      shared_hobbies = excluded.shared_hobbies,
      shared_vibes = excluded.shared_vibes,
      updated_at = now();
  end loop;
end;
$$ language plpgsql;

-- Trigger to recalculate match whenever a user profile changes
create or replace function public.on_user_profile_change()
returns trigger as $$
begin
  perform public.recalculate_user_vibe_matches(new.id);
  return new;
end;
$$ language plpgsql;

drop trigger if exists user_profile_change_trigger on public.users;
create trigger user_profile_change_trigger
after insert or update of fandoms, hobbies, vibes on public.users
for each row execute function public.on_user_profile_change();

-- 9. Enable Realtime Replication
alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.comments;
alter publication supabase_realtime add table public.likes;
alter publication supabase_realtime add table public.follows;
alter publication supabase_realtime add table public.signals;

-- 10. Automatically create public profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, username, handle, profile_image, bio)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'Dreamer_' || substr(new.id::text, 1, 6)),
    coalesce(new.raw_user_meta_data->>'username', 'dreamer_' || substr(new.id::text, 1, 6)),
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
