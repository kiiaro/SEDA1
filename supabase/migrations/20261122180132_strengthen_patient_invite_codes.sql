-- Use a 96-bit random token and accept it with or without separators.
create or replace function private.create_seda_patient_invite()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  caller_name text;
  token text := upper(pg_catalog.replace(pg_catalog.gen_random_uuid()::text, '-', ''));
  generated_code text;
begin
  select coalesce(nullif(p.payload ->> 'name', ''), 'Profissional')
    into caller_name
    from public.seda_profiles p where p.user_id = caller_id
      and p.payload ->> 'userType' = 'Profissional';
  if caller_id is null or caller_name is null then
    raise exception 'Somente contas profissionais podem criar convites.' using errcode = '42501';
  end if;
  generated_code := 'SEDA-' || pg_catalog.substr(token, 1, 8) || '-' || pg_catalog.substr(token, 9, 8) || '-' || pg_catalog.substr(token, 17, 8);
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
  normalized_code text := pg_catalog.regexp_replace(pg_catalog.upper(pg_catalog.btrim(invite_code)), '[^A-Z0-9]', '', 'g');
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
    where pg_catalog.regexp_replace(i.code, '-', '', 'g') = normalized_code
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
