-- Enable required extensions (Supabase usually has these)
create extension if not exists pgcrypto;

-- User credits balance table
create table if not exists public.user_credits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance integer not null default 0,
  updated_at timestamp with time zone not null default now()
);

-- Transactions table
create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('purchase','consume','refund')),
  amount integer not null check (amount > 0),
  metadata jsonb,
  created_at timestamp with time zone not null default now()
);

-- Helpful index
create index if not exists credit_transactions_user_id_idx on public.credit_transactions(user_id);

-- Ensure a row exists for a user
create or replace function public.ensure_user_credits(p_user_id uuid)
returns void as $$
begin
  insert into public.user_credits(user_id, balance)
  values (p_user_id, 0)
  on conflict (user_id) do nothing;
end;
$$ language plpgsql security definer;

-- Add credits atomically
create or replace function public.add_credits(p_user_id uuid, p_amount integer, p_metadata jsonb default '{}'::jsonb)
returns integer as $$
declare
  new_balance integer;
begin
  -- If called as a normal user, only allow adding to self
  if auth.uid() is not null and auth.uid() <> p_user_id then
    raise exception 'FORBIDDEN';
  end if;
  perform public.ensure_user_credits(p_user_id);
  update public.user_credits
    set balance = balance + p_amount,
        updated_at = now()
    where user_id = p_user_id
    returning balance into new_balance;

  insert into public.credit_transactions(user_id, type, amount, metadata)
  values (p_user_id, 'purchase', p_amount, p_metadata);

  return new_balance;
end;
$$ language plpgsql security definer;

-- Consume credits atomically if sufficient
create or replace function public.consume_credits(p_user_id uuid, p_amount integer, p_metadata jsonb default '{}'::jsonb)
returns integer as $$
declare
  new_balance integer;
begin
  -- Only allow consuming for self (service role has auth.uid() null and bypasses this)
  if auth.uid() is not null and auth.uid() <> p_user_id then
    raise exception 'FORBIDDEN';
  end if;
  perform public.ensure_user_credits(p_user_id);
  update public.user_credits
    set balance = balance - p_amount,
        updated_at = now()
    where user_id = p_user_id
      and balance >= p_amount
    returning balance into new_balance;

  if new_balance is null then
    raise exception 'INSUFFICIENT_CREDITS';
  end if;

  insert into public.credit_transactions(user_id, type, amount, metadata)
  values (p_user_id, 'consume', p_amount, p_metadata);

  return new_balance;
end;
$$ language plpgsql security definer;

-- RLS policies (lock down by default)
alter table public.user_credits enable row level security;
alter table public.credit_transactions enable row level security;

-- Allow users to view their own balance and transactions
drop policy if exists user_credits_select_self on public.user_credits;
create policy user_credits_select_self on public.user_credits
  for select
  using (auth.uid() = user_id);

drop policy if exists credit_transactions_select_self on public.credit_transactions;
create policy credit_transactions_select_self on public.credit_transactions
  for select
  using (auth.uid() = user_id);

-- Optionally, allow insert of a row for self (not required if server uses service role)
drop policy if exists user_credits_insert_self on public.user_credits;
create policy user_credits_insert_self on public.user_credits
  for insert
  with check (auth.uid() = user_id);
