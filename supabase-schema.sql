-- ============================================
-- MIROIR STATS — Supabase Schema
-- Exécuter dans Supabase SQL Editor
-- ============================================

-- Extension UUID
create extension if not exists "uuid-ossp";

-- ============================================
-- TABLE: profiles (extension de auth.users)
-- ============================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ============================================
-- TABLE: credits
-- ============================================
create table public.credits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  balance integer default 3 not null check (balance >= 0),
  total_purchased integer default 0 not null,
  total_used integer default 0 not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.credits enable row level security;

create policy "Users can view own credits"
  on public.credits for select
  using (auth.uid() = user_id);

create policy "Service role can manage credits"
  on public.credits for all
  using (auth.role() = 'service_role');

-- ============================================
-- TABLE: transactions
-- ============================================
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('purchase', 'use', 'gift_sent', 'gift_received', 'signup_bonus')),
  credits_amount integer not null,
  stripe_payment_id text,
  stripe_session_id text,
  pack_id text,
  description text,
  recipient_email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.transactions enable row level security;

create policy "Users can view own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Service role can manage transactions"
  on public.transactions for all
  using (auth.role() = 'service_role');

-- ============================================
-- TABLE: analyses
-- ============================================
create table public.analyses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  profile_type text not null check (profile_type in ('search', 'self')),
  criteria jsonb not null,
  result jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.analyses enable row level security;

create policy "Users can view own analyses"
  on public.analyses for select
  using (auth.uid() = user_id);

create policy "Users can insert own analyses"
  on public.analyses for insert
  with check (auth.uid() = user_id);

create policy "Service role can manage analyses"
  on public.analyses for all
  using (auth.role() = 'service_role');

-- ============================================
-- TABLE: gift_tokens (cadeaux viraux)
-- ============================================
create table public.gift_tokens (
  id uuid default uuid_generate_v4() primary key,
  token text unique not null default encode(gen_random_bytes(16), 'hex'),
  sender_id uuid references auth.users(id) on delete cascade not null,
  recipient_email text,
  credits_amount integer default 3 not null,
  stripe_session_id text,
  redeemed boolean default false not null,
  redeemed_by uuid references auth.users(id),
  redeemed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone default (now() + interval '90 days') not null
);

alter table public.gift_tokens enable row level security;

create policy "Service role can manage gift tokens"
  on public.gift_tokens for all
  using (auth.role() = 'service_role');

create policy "Users can view own sent gifts"
  on public.gift_tokens for select
  using (auth.uid() = sender_id);

-- ============================================
-- FUNCTION: handle_new_user
-- Crée automatiquement profile + credits à l'inscription
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );

  insert into public.credits (user_id, balance)
  values (new.id, 3);

  insert into public.transactions (user_id, type, credits_amount, description)
  values (new.id, 'signup_bonus', 3, 'Crédits offerts à l''inscription');

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- FUNCTION: deduct_credit (atomique)
-- ============================================
create or replace function public.deduct_credit(p_user_id uuid)
returns boolean as $$
declare
  v_balance integer;
begin
  select balance into v_balance
  from public.credits
  where user_id = p_user_id
  for update;

  if v_balance is null or v_balance < 1 then
    return false;
  end if;

  update public.credits
  set balance = balance - 1,
      total_used = total_used + 1,
      updated_at = now()
  where user_id = p_user_id;

  insert into public.transactions (user_id, type, credits_amount, description)
  values (p_user_id, 'use', -1, 'Analyse démographique');

  return true;
end;
$$ language plpgsql security definer;

-- ============================================
-- FUNCTION: add_credits (après paiement Stripe)
-- ============================================
create or replace function public.add_credits(
  p_user_id uuid,
  p_amount integer,
  p_pack_id text,
  p_stripe_session_id text
)
returns void as $$
begin
  update public.credits
  set balance = balance + p_amount,
      total_purchased = total_purchased + p_amount,
      updated_at = now()
  where user_id = p_user_id;

  insert into public.transactions (user_id, type, credits_amount, pack_id, stripe_session_id, description)
  values (p_user_id, 'purchase', p_amount, p_pack_id, p_stripe_session_id,
          'Achat pack ' || p_pack_id);
end;
$$ language plpgsql security definer;
