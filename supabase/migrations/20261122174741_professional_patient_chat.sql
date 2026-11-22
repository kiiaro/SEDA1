-- Patient-controlled professional connections and private live chat.
create table if not exists public.seda_patient_connections (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  professional_id uuid not null references auth.users(id) on delete cascade,
  patient_id uuid not null references auth.users(id) on delete cascade,
  professional_name text not null,
  patient_name text not null,
  created_at timestamptz not null default now(),
  constraint seda_patient_connections_distinct_users check (professional_id <> patient_id),
  constraint seda_patient_connections_unique_pair unique (professional_id, patient_id)
);

create table if not exists public.seda_patient_invites (
  code text primary key,
  professional_id uuid not null references auth.users(id) on delete cascade,
  professional_name text not null,
  patient_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  claimed_at timestamptz
);

create table if not exists public.seda_chat_messages (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  connection_id uuid not null references public.seda_patient_connections(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists seda_patient_connections_professional_date
  on public.seda_patient_connections (professional_id, created_at desc);
create index if not exists seda_patient_connections_patient_date
  on public.seda_patient_connections (patient_id, created_at desc);
create index if not exists seda_chat_messages_connection_date
  on public.seda_chat_messages (connection_id, created_at desc);

alter table public.seda_patient_connections enable row level security;
alter table public.seda_patient_invites enable row level security;
alter table public.seda_chat_messages enable row level security;

revoke all on public.seda_patient_connections from anon, authenticated;
revoke all on public.seda_patient_invites from anon, authenticated;
revoke all on public.seda_chat_messages from anon, authenticated;
grant select, delete on public.seda_patient_connections to authenticated;
grant select, insert on public.seda_chat_messages to authenticated;

drop policy if exists seda_patient_connections_participant_read on public.seda_patient_connections;
create policy seda_patient_connections_participant_read on public.seda_patient_connections
  for select to authenticated
  using ((select auth.uid()) in (professional_id, patient_id));

drop policy if exists seda_patient_connections_participant_delete on public.seda_patient_connections;
create policy seda_patient_connections_participant_delete on public.seda_patient_connections
  for delete to authenticated
  using ((select auth.uid()) in (professional_id, patient_id));

drop policy if exists seda_chat_messages_participant_read on public.seda_chat_messages;
create policy seda_chat_messages_participant_read on public.seda_chat_messages
  for select to authenticated
  using (exists (
    select 1 from public.seda_patient_connections c
    where c.id = connection_id
      and (select auth.uid()) in (c.professional_id, c.patient_id)
  ));

drop policy if exists seda_chat_messages_participant_send on public.seda_chat_messages;
create policy seda_chat_messages_participant_send on public.seda_chat_messages
  for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and exists (
      select 1 from public.seda_patient_connections c
      where c.id = connection_id
        and (select auth.uid()) in (c.professional_id, c.patient_id)
    )
  );

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create or replace function private.create_seda_patient_invite()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  caller_name text;
  generated_code text;
begin
  select coalesce(nullif(p.payload ->> 'name', ''), 'Profissional')
    into caller_name
    from public.seda_profiles p where p.user_id = caller_id
      and p.payload ->> 'userType' = 'Profissional';
  if caller_id is null or caller_name is null then
    raise exception 'Somente contas profissionais podem criar convites.' using errcode = '42501';
  end if;
  generated_code := 'SEDA-' || upper(pg_catalog.substr(pg_catalog.replace(pg_catalog.gen_random_uuid()::text, '-', ''), 1, 10));
  insert into public.seda_patient_invites (code, professional_id, professional_name)
    values (generated_code, caller_id, caller_name);
  return generated_code;
end;
$$;

create or replace function private.accept_seda_patient_invite(invite_code text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  caller_name text;
  invite_row public.seda_patient_invites%rowtype;
  connection_id uuid;
begin
  select coalesce(nullif(p.payload ->> 'name', ''), 'Paciente')
    into caller_name
    from public.seda_profiles p where p.user_id = caller_id
      and p.payload ->> 'userType' = 'Paciente';
  if caller_id is null or caller_name is null then
    raise exception 'Somente contas de pacientes podem aceitar convites.' using errcode = '42501';
  end if;

  select * into invite_row
    from public.seda_patient_invites i
    where i.code = upper(btrim(invite_code))
      and i.patient_id is null
      and i.claimed_at is null
      and i.expires_at > now()
    for update;
  if not found or invite_row.professional_id = caller_id then
    raise exception 'Código inválido, expirado ou já utilizado.' using errcode = '22023';
  end if;

  insert into public.seda_patient_connections (professional_id, patient_id, professional_name, patient_name)
    values (invite_row.professional_id, caller_id, invite_row.professional_name, caller_name)
    on conflict (professional_id, patient_id) do update
      set professional_name = excluded.professional_name, patient_name = excluded.patient_name
    returning id into connection_id;

  update public.seda_patient_invites
    set patient_id = caller_id, claimed_at = now()
    where code = invite_row.code;
  return connection_id;
end;
$$;

create or replace function public.create_seda_patient_invite()
returns text
language sql
security invoker
set search_path = ''
as $$ select private.create_seda_patient_invite(); $$;

create or replace function public.accept_seda_patient_invite(invite_code text)
returns uuid
language sql
security invoker
set search_path = ''
as $$ select private.accept_seda_patient_invite(invite_code); $$;

revoke all on function private.create_seda_patient_invite() from public, anon;
revoke all on function private.accept_seda_patient_invite(text) from public, anon;
grant execute on function private.create_seda_patient_invite() to authenticated;
grant execute on function private.accept_seda_patient_invite(text) to authenticated;
revoke all on function public.create_seda_patient_invite() from public, anon;
revoke all on function public.accept_seda_patient_invite(text) from public, anon;
grant execute on function public.create_seda_patient_invite() to authenticated;
grant execute on function public.accept_seda_patient_invite(text) to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_catalog.pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'seda_chat_messages'
  ) then
    alter publication supabase_realtime add table public.seda_chat_messages;
  end if;
end;
$$;
