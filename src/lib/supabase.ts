import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const envUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const envKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const isRealConfig = Boolean(
  envUrl &&
  envKey &&
  typeof envUrl === 'string' &&
  envUrl.startsWith('http') &&
  !envUrl.includes('placeholder') &&
  !envUrl.includes('example.com')
);

// Demo / in-memory store for AI Studio preview & fallback
export const DEMO_USER_ID = 'demo-user-1234';

const defaultProfile = {
  name: 'Dona Maria Silva',
  cpf: '123.456.789-00',
  phone: '(11) 98765-4321',
  birthDate: '1966-04-12',
  susCard: '898 0012 3456 7890',
  userType: 'Paciente' as const,
  bloodType: 'O+',
  emergencyContact: {
    name: 'Carlos Silva (Filho)',
    phone: '(11) 99876-5432',
    relation: 'Filho / Cuidador',
  },
  conditions: ['Hipertensão Arterial Sistêmica', 'Diabetes Mellitus Tipo 2'],
  medications: [
    { name: 'Losartana Potássica', dosage: '50mg', frequency: '1x ao dia (08:00)', nextTime: '08:00' },
    { name: 'Metformina', dosage: '850mg', frequency: '2x ao dia (após refeições)', nextTime: '12:30' },
    { name: 'Hidroclorotiazida', dosage: '25mg', frequency: '1x pela manhã', nextTime: '08:00' },
  ],
};

const defaultHealthRecords = [
  {
    id: 'rec_1',
    recordedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    hasHeartRate: true,
    measurement: 'pressure' as const,
    date: 'Hoje',
    time: '08:30',
    systolic: 122,
    diastolic: 82,
    glucose: 100,
    heartRate: 72,
    notes: 'Aferição matinal tranquila após medicação',
    status: 'normal' as const,
  },
  {
    id: 'rec_2',
    recordedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    hasHeartRate: false,
    measurement: 'glucose' as const,
    date: 'Hoje',
    time: '07:15',
    systolic: 120,
    diastolic: 80,
    glucose: 98,
    heartRate: 72,
    mealContext: 'before' as const,
    notes: 'Glicemia de jejum excelente',
    status: 'normal' as const,
  },
  {
    id: 'rec_3',
    recordedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    hasHeartRate: true,
    measurement: 'combined' as const,
    date: 'Ontem',
    time: '19:40',
    systolic: 128,
    diastolic: 84,
    glucose: 132,
    heartRate: 76,
    mealContext: 'after' as const,
    notes: 'Duas horas após o jantar',
    status: 'normal' as const,
  },
  {
    id: 'rec_4',
    recordedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    hasHeartRate: true,
    measurement: 'pressure' as const,
    date: 'Anteontem',
    time: '16:00',
    systolic: 142,
    diastolic: 92,
    glucose: 105,
    heartRate: 85,
    notes: 'Após caminhada e calor',
    status: 'danger' as const,
  },
];

const defaultAppointments = [
  {
    id: 101,
    doctor: 'Dr. Roberto Guimarães',
    specialty: 'Clínico Geral / UBS Central',
    date: '2026-12-15',
    time: '09:00',
    type: 'presencial' as const,
    status: 'confirmed' as const,
    location: 'UBS Vila Esperança - Sala 04',
    bookedBy: 'UBS Vila Esperança',
    notes: 'Consulta de rotina do programa Hiperdia e renovação de receitas',
  },
  {
    id: 102,
    doctor: 'Dra. Camila Ramos',
    specialty: 'Cardiologia',
    date: '2026-12-28',
    time: '14:30',
    type: 'presencial' as const,
    status: 'confirmed' as const,
    location: 'AME Especialidades Central',
    bookedBy: 'Regulação SUS',
    notes: 'Levar mapa de pressão arterial dos últimos 30 dias',
  },
];

const defaultFamily = [
  {
    id: 'fam_1',
    name: 'Carlos Silva',
    relation: 'Filho / Cuidador',
    role: 'Familiar' as const,
    phone: '(11) 99876-5432',
    avatarBg: '#00b690',
    initials: 'CS',
    status: 'online' as const,
    lastSeen: 'Agora',
  },
  {
    id: 'fam_2',
    name: 'Ana Carolina Silva',
    relation: 'Filha',
    role: 'Familiar' as const,
    phone: '(11) 98123-4567',
    avatarBg: '#264d8c',
    initials: 'AS',
    status: 'away' as const,
    lastSeen: 'Há 2h',
  },
];

const defaultAlerts = [
  {
    id: 'alt_1',
    title: 'Horário do Remédio: Losartana',
    desc: 'Tomar 1 comprimido (50mg) com água. Não pule a dose da manhã.',
    type: 'warn' as const,
    date: 'Hoje',
    time: '08:00',
    emoji: '💊',
    color: '#00b690',
    actionLabel: 'Ver Pressão',
    actionScreen: 'pressure' as const,
  },
  {
    id: 'alt_2',
    title: 'Registrar Glicemia',
    desc: 'Lembre-se de registrar sua glicemia pós-prandial hoje.',
    type: 'info' as const,
    date: 'Hoje',
    time: '14:00',
    emoji: '🩸',
    color: '#264d8c',
    actionLabel: 'Registrar',
    actionScreen: 'glucose' as const,
  },
];

export function getDemoSeedData(role: 'Paciente' | 'Familiar' | 'Profissional' = 'Paciente') {
  const profile =
    role === 'Profissional'
      ? {
          ...defaultProfile,
          name: 'Roberto Guimarães',
          userType: 'Profissional' as const,
          susCard: '',
          bloodType: '',
          conditions: [],
          medications: [],
          professionalInfo: {
            councilRegister: 'CRM-SP 148920',
            specialty: 'Clínico Geral · Hiperdia',
            clinicName: 'UBS Vila Esperança',
          },
        }
      : role === 'Familiar'
        ? {
            ...defaultProfile,
            name: 'Carlos Silva',
            userType: 'Familiar' as const,
            susCard: '',
            bloodType: '',
            monitoredPatient: {
              name: 'Dona Maria Silva',
              relation: 'Mãe',
              phone: '(11) 98765-4321',
              birthDate: '1966-04-12',
              conditions: ['Hipertensão Arterial Sistêmica', 'Diabetes Mellitus Tipo 2'],
              notes: 'Acompanhamento Hiperdia · UBS Vila Esperança',
            },
            caregiverNotes: [
              'Dona Maria fez caminhada leve de 20 minutos hoje pela manhã.',
              'Medicamento das 08h tomado com um copo cheio de água.',
            ],
            medicationsTakenToday: {
              'Losartana Potássica-08:00': true,
              'Hidroclorotiazida-08:00': true,
            },
          }
        : { ...defaultProfile };
  const now = new Date();
  const makeLocalIso = (dayOffset: number, hour: number, minute: number) =>
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset, hour, minute, 0).toISOString();

  const seededRecords = defaultHealthRecords.map((r, index) => {
    const offsets = [
      { dayOffset: 0, hour: 8, minute: 30 },
      { dayOffset: 0, hour: 7, minute: 15 },
      { dayOffset: -1, hour: 19, minute: 40 },
      { dayOffset: -2, hour: 16, minute: 0 },
    ];
    const cfg = offsets[index] ?? { dayOffset: 0, hour: 8, minute: 0 };
    return { ...r, recordedAt: makeLocalIso(cfg.dayOffset, cfg.hour, cfg.minute) };
  });

  const makeLocalDateStr = (dayOffset: number) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const seededAppointments = defaultAppointments.map((a, index) => ({
    ...a,
    date: index === 0 ? makeLocalDateStr(2) : makeLocalDateStr(32),
  }));

  return {
    profile,
    records: seededRecords,
    appointments: seededAppointments,
    family: defaultFamily.map((f) => ({ ...f })),
    alerts: defaultAlerts.map((al) => ({ ...al })),
    connections: defaultConnections.map((c) => ({
      id: c.id,
      professionalId: c.professional_id,
      patientId: c.patient_id,
      professionalName: c.professional_name,
      patientName: c.patient_name,
      createdAt: c.created_at,
    })),
  };
}

const defaultConnections = [
  {
    id: 'conn_1',
    professional_id: 'prof_dr_roberto',
    patient_id: DEMO_USER_ID,
    professional_name: 'Dr. Roberto Guimarães (UBS Central)',
    patient_name: 'Dona Maria Silva',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const defaultMessages = [
  {
    id: 'msg_1',
    connection_id: 'conn_1',
    sender_id: 'prof_dr_roberto',
    body: 'Olá, Dona Maria! Estou acompanhando seus registros de pressão e glicemia aqui pelo sistema da UBS.',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg_2',
    connection_id: 'conn_1',
    sender_id: DEMO_USER_ID,
    body: 'Bom dia, Doutor! Estou tomando os remédios certinho e medindo todos os dias.',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg_3',
    connection_id: 'conn_1',
    sender_id: 'prof_dr_roberto',
    body: 'Excelente! Os valores estão bem controlados esta semana. Nos vemos na consulta dia 15.',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
];

class MockStorage {
  private memory = new Map<string, string>();

  async getItem(key: string): Promise<string | null> {
    try {
      const fromAsync = await AsyncStorage.getItem(key);
      if (fromAsync !== null) return fromAsync;
    } catch {
      // Fallback to in-memory map
    }
    return this.memory.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.memory.set(key, value);
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      // Ignore in-memory fallback
    }
  }

  async removeItem(key: string): Promise<void> {
    this.memory.delete(key);
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // Ignore
    }
  }
}

const mockStore = new MockStorage();

function createMockSupabaseClient() {
  const authListeners = new Set<(event: string, session: any) => void>();
  const channelListeners = new Map<string, Set<(payload: any) => void>>();

  // Initialize pre-seeded demo tables in storage if empty
  const initDemoData = async () => {
    const initialized = await mockStore.getItem('seda_mock_initialized');
    if (!initialized) {
      await mockStore.setItem('seda_mock_initialized', 'true');
      await mockStore.setItem(
        'seda_profiles',
        JSON.stringify([
          {
            user_id: DEMO_USER_ID,
            payload: defaultProfile,
            updated_at: new Date().toISOString(),
          },
        ])
      );
      await mockStore.setItem(
        'seda_health_records',
        JSON.stringify(
          defaultHealthRecords.map((r) => ({
            id: r.id,
            user_id: DEMO_USER_ID,
            payload: r,
            created_at: r.recordedAt,
          }))
        )
      );
      await mockStore.setItem(
        'seda_appointments',
        JSON.stringify(
          defaultAppointments.map((a) => ({
            id: String(a.id),
            user_id: DEMO_USER_ID,
            payload: a,
            created_at: new Date().toISOString(),
          }))
        )
      );
      await mockStore.setItem(
        'seda_family_members',
        JSON.stringify(
          defaultFamily.map((f) => ({
            id: f.id,
            user_id: DEMO_USER_ID,
            payload: f,
            created_at: new Date().toISOString(),
          }))
        )
      );
      await mockStore.setItem(
        'seda_alerts',
        JSON.stringify(
          defaultAlerts.map((al) => ({
            id: al.id,
            user_id: DEMO_USER_ID,
            payload: al,
            created_at: new Date().toISOString(),
          }))
        )
      );
      await mockStore.setItem('seda_patient_connections', JSON.stringify(defaultConnections));
      await mockStore.setItem('seda_chat_messages', JSON.stringify(defaultMessages));
    }
  };

  void initDemoData();

  const getTableRows = async (table: string): Promise<any[]> => {
    await initDemoData();
    const raw = await mockStore.getItem(table);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  };

  const setTableRows = async (table: string, rows: any[]): Promise<void> => {
    await mockStore.setItem(table, JSON.stringify(rows));
  };

  const notifyChange = (table: string, type: string, record: any) => {
    channelListeners.forEach((callbacks, channelKey) => {
      if (channelKey.includes(table) || channelKey.includes('seda-')) {
        callbacks.forEach((cb) => {
          try {
            cb({ eventType: type, new: record, old: record });
          } catch {
            // ignore listener error
          }
        });
      }
    });
  };

  const auth = {
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      authListeners.add(callback);
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              authListeners.delete(callback);
            },
          },
        },
      };
    },

    getUser: async () => {
      await initDemoData();
      const rawUser = await mockStore.getItem('seda_auth_user');
      if (rawUser) {
        try {
          const user = JSON.parse(rawUser);
          return { data: { user }, error: null };
        } catch {
          // parse error
        }
      }
      return { data: { user: null }, error: null };
    },

    signInWithPassword: async ({ email }: { email: string; password?: string }) => {
      await initDemoData();
      const normalizedEmail = email.trim().toLowerCase();
      const isDemo =
        normalizedEmail.includes('maria') ||
        normalizedEmail.includes('demo') ||
        normalizedEmail.includes('seda') ||
        normalizedEmail === 'voce@exemplo.com';

      const user = {
        id: isDemo ? DEMO_USER_ID : `user_${Date.now()}`,
        email: normalizedEmail,
        user_metadata: isDemo
          ? {
              name: defaultProfile.name,
              cpf: defaultProfile.cpf,
              phone: defaultProfile.phone,
              birthDate: defaultProfile.birthDate,
              userType: defaultProfile.userType,
            }
          : {
              name: normalizedEmail.split('@')[0],
              userType: 'Paciente',
            },
      };

      await mockStore.setItem('seda_auth_user', JSON.stringify(user));
      const session = { user, access_token: 'mock-session-token' };
      authListeners.forEach((cb) => cb('SIGNED_IN', session));
      return { data: { user, session }, error: null };
    },

    signUp: async ({
      email,
      options,
    }: {
      email: string;
      password?: string;
      options?: { data?: Record<string, any> };
    }) => {
      await initDemoData();
      const normalizedEmail = email.trim().toLowerCase();
      const user = {
        id: `user_${Date.now()}`,
        email: normalizedEmail,
        user_metadata: options?.data ?? {
          name: normalizedEmail.split('@')[0],
          userType: 'Paciente',
        },
      };
      await mockStore.setItem('seda_auth_user', JSON.stringify(user));
      const session = { user, access_token: 'mock-session-token' };
      authListeners.forEach((cb) => cb('SIGNED_IN', session));
      return { data: { user, session }, error: null };
    },

    signOut: async () => {
      await mockStore.removeItem('seda_auth_user');
      authListeners.forEach((cb) => cb('SIGNED_OUT', null));
      return { error: null };
    },

    updateUser: async () => {
      const { data } = await auth.getUser();
      return { data: { user: data.user }, error: null };
    },

    signInWithOAuth: async ({ options }: { provider: string; options?: any }) => {
      await initDemoData();
      const preferredRole = ['Paciente', 'Familiar', 'Profissional'].includes(options?.data?.userType)
        ? options.data.userType
        : 'Paciente';
      const user = {
        id: 'user_google_alisson',
        email: 'alissoncalazans09@gmail.com',
        user_metadata: {
          name: 'Alisson Calazans',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          userType: preferredRole,
          phone: '(11) 98765-4321',
          birthDate: '1985-06-20',
        },
      };
      await mockStore.setItem('seda_auth_user', JSON.stringify(user));
      const session = { user, access_token: 'mock-google-session-token' };
      authListeners.forEach((cb) => cb('SIGNED_IN', session));
      return { data: { user, session, url: null }, error: null };
    },

    resetPasswordForEmail: async () => {
      return { error: null };
    },
  };

  const createQueryBuilder = (table: string) => {
    let selectFields: string | null = null;
    const filters: Array<{ col: string; val: any }> = [];
    let orderCol: string | null = null;
    let orderAsc: boolean = true;
    let isSingle = false;
    let isMaybeSingle = false;

    // Async execution handler
    const execute = async () => {
      const rows = await getTableRows(table);
      let filtered = rows.filter((r) => {
        for (const f of filters) {
          if (String(r[f.col]) !== String(f.val)) return false;
        }
        return true;
      });

      if (orderCol) {
        filtered = filtered.sort((a, b) => {
          const valA = a[orderCol!] ?? '';
          const valB = b[orderCol!] ?? '';
          if (valA < valB) return orderAsc ? -1 : 1;
          if (valA > valB) return orderAsc ? 1 : -1;
          return 0;
        });
      }

      let dataToReturn: any = filtered;

      if (selectFields && selectFields !== '*') {
        const fields = selectFields.split(',').map((s) => s.trim());
        if (fields.length === 1 && fields[0] === 'payload') {
          dataToReturn = filtered.map((r) => ({ payload: r.payload }));
        } else {
          dataToReturn = filtered.map((r) => {
            const rowObj: any = {};
            fields.forEach((k) => {
              rowObj[k] = r[k];
            });
            return rowObj;
          });
        }
      }

      if (isSingle) {
        return { data: dataToReturn[0] ?? null, error: null };
      }
      if (isMaybeSingle) {
        return { data: dataToReturn[0] ?? null, error: null };
      }
      return { data: dataToReturn, error: null };
    };

    const builder: any = {
      select: (fields: string = '*') => {
        selectFields = fields;
        return builder;
      },
      eq: (col: string, val: any) => {
        filters.push({ col, val });
        return builder;
      },
      order: (col: string, options?: { ascending?: boolean }) => {
        orderCol = col;
        orderAsc = options?.ascending ?? true;
        return builder;
      },
      maybeSingle: () => {
        isMaybeSingle = true;
        return execute();
      },
      single: () => {
        isSingle = true;
        return execute();
      },
      upsert: async (record: any) => {
        const rows = await getTableRows(table);
        const key = record.user_id ? 'user_id' : 'id';
        const idx = rows.findIndex((r) => String(r[key]) === String(record[key]));
        if (idx >= 0) {
          rows[idx] = { ...rows[idx], ...record };
        } else {
          rows.push(record);
        }
        await setTableRows(table, rows);
        notifyChange(table, 'UPSERT', record);
        return { data: record, error: null };
      },
      insert: (record: any) => {
        const insertPromise = (async () => {
          const rows = await getTableRows(table);
          const newItems = Array.isArray(record) ? record : [record];
          const stampedItems = newItems.map((item) => ({
            id: item.id || `gen_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            created_at: item.created_at || new Date().toISOString(),
            ...item,
          }));
          rows.unshift(...stampedItems);
          await setTableRows(table, rows);
          stampedItems.forEach((it) => notifyChange(table, 'INSERT', it));
          return stampedItems;
        })();

        // Chainable for .select().single()
        const chain: any = {
          select: () => ({
            single: async () => {
              const inserted = await insertPromise;
              return { data: inserted[0], error: null };
            },
            then: async (resolve: any, reject: any) => {
              try {
                const inserted = await insertPromise;
                resolve({ data: inserted, error: null });
              } catch (e) {
                reject(e);
              }
            },
          }),
          then: async (resolve: any, reject: any) => {
            try {
              const inserted = await insertPromise;
              resolve({ data: inserted, error: null });
            } catch (e) {
              reject(e);
            }
          },
        };
        return chain;
      },
      update: (patch: any) => {
        const updatePromise = async () => {
          const rows = await getTableRows(table);
          let updatedCount = 0;
          const updatedItems: any[] = [];
          for (let i = 0; i < rows.length; i++) {
            let matches = true;
            for (const f of filters) {
              if (String(rows[i][f.col]) !== String(f.val)) {
                matches = false;
                break;
              }
            }
            if (matches) {
              rows[i] = { ...rows[i], ...patch };
              updatedItems.push(rows[i]);
              updatedCount++;
            }
          }
          await setTableRows(table, rows);
          updatedItems.forEach((it) => notifyChange(table, 'UPDATE', it));
          return updatedItems;
        };

        const updateChain: any = {
          eq: (col: string, val: any) => {
            filters.push({ col, val });
            return updateChain;
          },
          select: (fields?: string) => ({
            then: async (resolve: any, reject: any) => {
              try {
                const updated = await updatePromise();
                const mapped = fields?.includes('id') ? updated.map((u) => ({ id: u.id })) : updated;
                resolve({ data: mapped, error: null });
              } catch (e) {
                reject(e);
              }
            },
          }),
          then: async (resolve: any, reject: any) => {
            try {
              const updated = await updatePromise();
              resolve({ data: updated, error: null });
            } catch (e) {
              reject(e);
            }
          },
        };
        return updateChain;
      },
      delete: () => {
        const deleteChain: any = {
          eq: (col: string, val: any) => {
            filters.push({ col, val });
            return deleteChain;
          },
          then: async (resolve: any, reject: any) => {
            try {
              const rows = await getTableRows(table);
              const remaining = rows.filter((r) => {
                for (const f of filters) {
                  if (String(r[f.col]) === String(f.val)) return false;
                }
                return true;
              });
              await setTableRows(table, remaining);
              notifyChange(table, 'DELETE', { filters });
              resolve({ data: null, error: null });
            } catch (e) {
              reject(e);
            }
          },
        };
        return deleteChain;
      },
      then: (resolve: any, reject: any) => {
        execute().then(resolve, reject);
      },
    };

    return builder;
  };

  const channel = (channelName: string) => {
    let listeners = channelListeners.get(channelName);
    if (!listeners) {
      listeners = new Set();
      channelListeners.set(channelName, listeners);
    }
    const currentListeners = listeners;

    const channelObj: any = {
      on: (_event: string, _filter: any, callback: (payload: any) => void) => {
        currentListeners.add(callback);
        return channelObj;
      },
      subscribe: () => channelObj,
    };
    return channelObj;
  };

  const removeChannel = async (targetChannel: any) => {
    channelListeners.forEach((set, key) => {
      channelListeners.delete(key);
    });
  };

  const rpc = async (fnName: string, args?: any) => {
    await initDemoData();
    if (fnName === 'create_seda_patient_invite') {
      const code = `SEDA-${Math.floor(1000 + Math.random() * 9000)}`;
      return { data: code, error: null };
    }
    if (fnName === 'accept_seda_patient_invite') {
      const connections = await getTableRows('seda_patient_connections');
      const newConn = {
        id: `conn_${Date.now()}`,
        professional_id: 'prof_dr_roberto',
        patient_id: DEMO_USER_ID,
        professional_name: 'Dr. Roberto Guimarães (UBS Central)',
        patient_name: 'Dona Maria Silva',
        created_at: new Date().toISOString(),
      };
      connections.unshift(newConn);
      await setTableRows('seda_patient_connections', connections);
      notifyChange('seda_patient_connections', 'INSERT', newConn);
      return { data: newConn.id, error: null };
    }
    return { data: null, error: null };
  };

  return {
    auth,
    from: createQueryBuilder,
    channel,
    removeChannel,
    rpc,
  } as any;
}

export const supabase = isRealConfig
  ? createClient(envUrl!, envKey!, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : createMockSupabaseClient();
