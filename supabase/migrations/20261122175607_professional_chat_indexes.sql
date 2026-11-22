-- Keep invite access RPC-only and index referencing columns for cleanup/query plans.
drop policy if exists seda_patient_invites_no_direct_access on public.seda_patient_invites;
create policy seda_patient_invites_no_direct_access on public.seda_patient_invites
  for all to authenticated
  using (false)
  with check (false);

create index if not exists seda_patient_invites_professional_id
  on public.seda_patient_invites (professional_id);
create index if not exists seda_patient_invites_patient_id
  on public.seda_patient_invites (patient_id);
create index if not exists seda_chat_messages_sender_id
  on public.seda_chat_messages (sender_id);
