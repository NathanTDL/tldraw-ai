-- Script: create_canvases_table.sql
-- Creates a table to store tldraw canvas data
-- Run this script in your Supabase SQL editor.

-- Enable the uuid-ossp extension for UUID generation
create extension if not exists "uuid-ossp";

-- Main table
create table if not exists public.canvases (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  is_pinned boolean default false,
  data jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Helpful index for fetch ordering
create index if not exists canvases_user_created_idx on public.canvases (user_id, created_at desc);

-- Ensure columns exist if the table was created previously without them
alter table public.canvases
  add column if not exists title text not null default ''::text;
alter table public.canvases
  add column if not exists is_pinned boolean default false;
-- Allow data column to be nullable and have default
alter table public.canvases
  alter column data drop not null;
alter table public.canvases
  alter column data set default '{}'::jsonb;

-- Automatically update `updated_at` on row updates
create or replace function public.handle_canvases_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_canvases_update on public.canvases;
create trigger on_canvases_update
before update on public.canvases
for each row execute procedure public.handle_canvases_updated_at();

-- Row-level security so users can only access their own rows
alter table public.canvases enable row level security;

-- Allow authenticated users to insert their own data
drop policy if exists "Can insert own canvases" on public.canvases;
create policy "Can insert own canvases" on public.canvases
  for insert
  with check (auth.uid() = user_id);

-- Allow owners to select/update/delete their own data
drop policy if exists "Can access own canvases" on public.canvases;
create policy "Can access own canvases" on public.canvases
  for all
  using (auth.uid() = user_id);
