-- Run this in your Supabase SQL Editor

create table rooms (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  host_id text not null,
  host_name text not null,
  guest_id text,
  guest_name text,
  status text default 'waiting', -- 'waiting' | 'ready' | 'playing' | 'finished'
  state jsonb,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table rooms enable row level security;

-- Allow anyone to read/write (simple public game)
create policy "Public access" on rooms
  for all using (true) with check (true);

-- Enable Realtime for the rooms table
alter publication supabase_realtime add table rooms;
