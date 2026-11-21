-- SEDA1: dados privados por conta autenticada.
create table if not exists public.seda_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  updated_at timestamptz not null default now()
);

create table if not exists public.seda_health_records (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  created_at timestamptz not null default now()
);

create table if not exists public.seda_appointments (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  created_at timestamptz not null default now()
);

create table if not exists public.seda_family_members (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  created_at timestamptz not null default now()
);

create table if not exists public.seda_alerts (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  created_at timestamptz not null default now()
);

create index if not exists seda_health_records_owner_date on public.seda_health_records (user_id, created_at desc);
create index if not exists seda_appointments_owner_date on public.seda_appointments (user_id, created_at desc);
create index if not exists seda_family_members_owner_date on public.seda_family_members (user_id, created_at desc);
create index if not exists seda_alerts_owner_date on public.seda_alerts (user_id, created_at desc);

alter table public.seda_profiles enable row level security;
alter table public.seda_health_records enable row level security;
alter table public.seda_appointments enable row level security;
alter table public.seda_family_members enable row level security;
alter table public.seda_alerts enable row level security;

grant select, insert, update, delete on public.seda_profiles to authenticated;
grant select, insert, update, delete on public.seda_health_records to authenticated;
grant select, insert, update, delete on public.seda_appointments to authenticated;
grant select, insert, update, delete on public.seda_family_members to authenticated;
grant select, insert, update, delete on public.seda_alerts to authenticated;

create policy "seda_profiles_owner" on public.seda_profiles
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "seda_health_records_owner" on public.seda_health_records
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "seda_appointments_owner" on public.seda_appointments
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "seda_family_members_owner" on public.seda_family_members
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "seda_alerts_owner" on public.seda_alerts
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
