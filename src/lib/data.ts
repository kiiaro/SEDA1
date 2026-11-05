import { AlertItem, Appointment, FamilyMember, HealthRecord, UserProfile } from '../types';
import { supabase } from './supabase';

type Table = 'seda_health_records' | 'seda_appointments' | 'seda_family_members' | 'seda_alerts';

function check(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

async function loadItems<T>(table: Table, userId: string): Promise<T[]> {
  const { data, error } = await supabase.from(table).select('payload').eq('user_id', userId).order('created_at', { ascending: false });
  check(error);
  return (data ?? []).map((row) => row.payload as T);
}

export async function loadSedaData(userId: string) {
  const [profileResult, records, appointments, family, alerts] = await Promise.all([
    supabase.from('seda_profiles').select('payload').eq('user_id', userId).maybeSingle(),
    loadItems<HealthRecord>('seda_health_records', userId),
    loadItems<Appointment>('seda_appointments', userId),
    loadItems<FamilyMember>('seda_family_members', userId),
    loadItems<AlertItem>('seda_alerts', userId),
  ]);
  check(profileResult.error);
  const today = new Date().toLocaleDateString('sv-SE');
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString('sv-SE');
  const datedRecords = records.map((record) => {
    if (!record.recordedAt) return record;
    const date = new Date(record.recordedAt);
    const key = date.toLocaleDateString('sv-SE');
    const label = key === today ? 'Hoje' : key === yesterday ? 'Ontem' : date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    return { ...record, date: label, time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) };
  });
  return { profile: profileResult.data?.payload as UserProfile | undefined, records: datedRecords, appointments, family, alerts };
}

export async function saveProfile(userId: string, profile: UserProfile) {
  const { error } = await supabase.from('seda_profiles').upsert({ user_id: userId, payload: profile, updated_at: new Date().toISOString() });
  check(error);
}

export async function insertItem<T extends { id: string | number }>(table: Table, userId: string, item: T) {
  const { error } = await supabase.from(table).insert({ id: String(item.id), user_id: userId, payload: item });
  check(error);
}

export async function updateItem<T extends { id: string | number }>(table: Table, userId: string, item: T) {
  const { data, error } = await supabase.from(table).update({ payload: item }).eq('id', String(item.id)).eq('user_id', userId).select('id');
  check(error);
  if (!data?.length) throw new Error('Registro não encontrado.');
}

export async function deleteItem(table: Table, userId: string, id: string) {
  const { error } = await supabase.from(table).delete().eq('id', id).eq('user_id', userId);
  check(error);
}
