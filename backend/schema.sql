-- ============================================================
-- CardVault - Supabase PostgreSQL Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- -------------------------------------------------------
-- USERS TABLE
-- -------------------------------------------------------
create table if not exists users (
  id          uuid primary key default gen_random_uuid(),
  first_name  text not null,
  last_name   text not null,
  email       text not null unique,
  password    text not null,
  phone       text,
  address     text,
  role        text not null default 'user' check (role in ('admin', 'user')),
  status      text not null default 'active' check (status in ('active', 'inactive', 'suspended')),
  profile_image text default '',
  last_login  timestamptz,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- -------------------------------------------------------
-- CREDIT CARDS TABLE
-- -------------------------------------------------------
create table if not exists credit_cards (
  id                uuid primary key default gen_random_uuid(),
  card_holder_name  text not null,
  card_number       text not null unique,
  expiry_date       text not null,
  cvv               text not null,
  card_type         text not null check (card_type in ('Visa', 'MasterCard', 'Amex', 'Discover', 'RuPay')),
  credit_limit      numeric(12,2) not null check (credit_limit >= 0),
  available_balance numeric(12,2) not null check (available_balance >= 0),
  card_status       text not null default 'active' check (card_status in ('active', 'blocked', 'expired', 'pending')),
  pin               text not null,
  user_id           uuid not null references users(id) on delete cascade,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- -------------------------------------------------------
-- INDEXES
-- -------------------------------------------------------
create index if not exists idx_users_email        on users(email);
create index if not exists idx_cards_user_id      on credit_cards(user_id);
create index if not exists idx_cards_status       on credit_cards(card_status);
create index if not exists idx_cards_holder_name  on credit_cards(card_holder_name);

-- -------------------------------------------------------
-- RPC: card_status_counts  (replaces MongoDB $group aggregate)
-- -------------------------------------------------------
create or replace function card_status_counts()
returns table(card_status text, count bigint)
language sql stable
as $$
  select card_status, count(*) as count
  from credit_cards
  group by card_status;
$$;

-- -------------------------------------------------------
-- RPC: monthly_user_registrations  (replaces MongoDB $group aggregate)
-- -------------------------------------------------------
create or replace function monthly_user_registrations()
returns table(year int, month int, count bigint)
language sql stable
as $$
  select
    extract(year  from created_at)::int as year,
    extract(month from created_at)::int as month,
    count(*)                            as count
  from users
  group by year, month
  order by year, month
  limit 12;
$$;

-- -------------------------------------------------------
-- DISABLE Row Level Security for service-role key usage
-- (service-role key bypasses RLS — safe for backend only)
-- -------------------------------------------------------
alter table users        disable row level security;
alter table credit_cards disable row level security;
