-- Molit — initial schema. Plain Postgres; runs on Supabase, Neon, RDS, or local.
-- Apply with:  npm run db:migrate   (or paste into the Supabase SQL editor)

create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique,
  name text,
  currency text not null default 'USD',
  timezone text not null default 'UTC',
  monthly_summary boolean not null default true,
  pending_delete_until timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  amount numeric(14,2) not null,
  currency text not null,
  note text not null,
  category text not null default 'other',
  occurred_at timestamptz not null default now(),
  local_date date not null,
  source text not null default 'whatsapp',
  raw_text text,
  wa_message_id text,
  created_at timestamptz not null default now()
);
create index if not exists expenses_user_local_date_idx on expenses (user_id, local_date);

create table if not exists processed_messages (
  wa_message_id text primary key,
  created_at timestamptz not null default now()
);

create table if not exists login_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists monthly_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  month date not null,
  total numeric(14,2) not null,
  count integer not null,
  sent_at timestamptz not null default now()
);
create unique index if not exists monthly_summaries_user_month_idx on monthly_summaries (user_id, month);
