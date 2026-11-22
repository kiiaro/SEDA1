import { ChatMessage, ProfessionalConnection } from '../types';
import { supabase } from './supabase';

type ConnectionRow = {
  id: string;
  professional_id: string;
  patient_id: string;
  professional_name: string;
  patient_name: string;
  created_at: string;
};

type MessageRow = {
  id: string;
  connection_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

const toConnection = (row: ConnectionRow): ProfessionalConnection => ({
  id: row.id,
  professionalId: row.professional_id,
  patientId: row.patient_id,
  professionalName: row.professional_name,
  patientName: row.patient_name,
  createdAt: row.created_at,
});

const toMessage = (row: MessageRow): ChatMessage => ({
  id: row.id,
  connectionId: row.connection_id,
  senderId: row.sender_id,
  body: row.body,
  createdAt: row.created_at,
});

export async function loadProfessionalConnections(): Promise<ProfessionalConnection[]> {
  const { data, error } = await supabase
    .from('seda_patient_connections')
    .select('id,professional_id,patient_id,professional_name,patient_name,created_at')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => toConnection(row as ConnectionRow));
}

export async function createPatientInvite(): Promise<string> {
  const { data, error } = await supabase.rpc('create_seda_patient_invite');
  if (error) throw new Error(error.message);
  return String(data);
}

export async function acceptPatientInvite(code: string): Promise<ProfessionalConnection> {
  const { data, error } = await supabase.rpc('accept_seda_patient_invite', { invite_code: code.trim().toUpperCase() });
  if (error) throw new Error(error.message);
  const { data: connection, error: connectionError } = await supabase
    .from('seda_patient_connections')
    .select('id,professional_id,patient_id,professional_name,patient_name,created_at')
    .eq('id', String(data))
    .single();
  if (connectionError) throw new Error(connectionError.message);
  return toConnection(connection as ConnectionRow);
}

export async function loadChatMessages(connectionId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('seda_chat_messages')
    .select('id,connection_id,sender_id,body,created_at')
    .eq('connection_id', connectionId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => toMessage(row as MessageRow));
}

export async function sendChatMessage(connectionId: string, senderId: string, body: string): Promise<ChatMessage> {
  const { data, error } = await supabase
    .from('seda_chat_messages')
    .insert({ connection_id: connectionId, sender_id: senderId, body: body.trim() })
    .select('id,connection_id,sender_id,body,created_at')
    .single();
  if (error) throw new Error(error.message);
  return toMessage(data as MessageRow);
}
