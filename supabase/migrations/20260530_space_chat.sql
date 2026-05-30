-- 🎙️ Space Live Chat Migration
-- Adds real-time chat messaging to community spaces

-- 1. Create space_messages table
create table if not exists public.space_messages (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) <= 500),
  created_at timestamptz default now()
);

-- 2. Index for fast per-space message queries
create index if not exists idx_space_messages_space_id_created
  on public.space_messages (space_id, created_at desc);

-- 3. Enable RLS
alter table public.space_messages enable row level security;

-- 4. RLS Policies
create policy "Space messages are readable by everyone"
  on public.space_messages for select using (true);

create policy "Authenticated users can send space messages"
  on public.space_messages for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own space messages"
  on public.space_messages for delete
  using (auth.uid() = user_id);

-- 5. Enable Realtime replication
alter publication supabase_realtime add table public.space_messages;
