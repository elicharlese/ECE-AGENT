-- Create agents table and RLS policies
-- Run this in Supabase SQL editor

create extension if not exists pgcrypto;

create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  model text,
  avatar_url text,
  capabilities text[] not null default '{}',
  mcp_tools text[] not null default '{}',
  status text not null check (status in ('online','offline','busy')) default 'online',
  system_prompt text,
  created_at timestamptz not null default now()
);

alter table public.agents enable row level security;

-- Policies: owner-only access
create policy if not exists "Agents select own" on public.agents
for select using (user_id = auth.uid());

create policy if not exists "Agents insert self" on public.agents
for insert with check (user_id = auth.uid());

create policy if not exists "Agents update own" on public.agents
for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy if not exists "Agents delete own" on public.agents
for delete using (user_id = auth.uid());
