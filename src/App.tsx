import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert, Keyboard, Platform } from 'react-native';
import type { User } from '@supabase/supabase-js';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  Screen,
  FontSizeScale,
  Appointment,
  HealthRecord,
  FamilyMember,
  AlertItem,
  UserProfile,
  ProfessionalConnection,
} from './types';
import {
  COLORS,
  getDarkModeTheme,
} from './constants/theme';
import { DEMO_USER_ID, getDemoSeedData, supabase } from './lib/supabase';
import { deleteItem, insertItem, loadSedaData, saveProfile, updateItem } from './lib/data';
import { MobileShell } from './components/MobileShell';
import { NavBar } from './components/NavBar';
import { QuickRegisterModal } from './components/QuickRegisterModal';
import { ScreenEntrance } from './components/Motion';
import { GlobalCSS } from './components/GlobalCSS';

// Screens
import { SplashScreen } from './screens/SplashScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { LoginScreen } from './screens/LoginScreen';
import { ResetPasswordScreen } from './screens/ResetPasswordScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { HomeScreen } from './screens/HomeScreen';
import { PressureScreen } from './screens/PressureScreen';
import { GlucoseScreen } from './screens/GlucoseScreen';
import { VoiceScreen } from './screens/VoiceScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { AlertsScreen } from './screens/AlertsScreen';
import { FamilyScreen } from './screens/FamilyScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { EmergencyScreen } from './screens/EmergencyScreen';
import { AppointmentsScreen } from './screens/AppointmentsScreen';
import { NewAppointmentScreen } from './screens/NewAppointmentScreen';
import { ProfessionalDashboardScreen } from './screens/ProfessionalDashboardScreen';
import { ConnectionsScreen } from './screens/ConnectionsScreen';
import { ChatScreen } from './screens/ChatScreen';
import { EditProfileScreen } from './screens/EditProfileScreen';
import { SupportScreen } from './screens/SupportScreen';
import { FamilyDashboardScreen } from './screens/FamilyDashboardScreen';
import { acceptPatientInvite, createPatientInvite, loadProfessionalConnections } from './lib/professional';

const getWebRedirectUrl = () => {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.location?.origin) return undefined;
  return `${window.location.origin}/`;
};

export default function App() {
  // Central application state
  const [screen, setScreen] = useState<Screen>('splash');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isSimulatorMode, setIsSimulatorMode] = useState<boolean>(false);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [authNotice, setAuthNotice] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [quickRegisterOpen, setQuickRegisterOpen] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setScreen('reset_password');
    });
    return () => subscription.unsubscribe();
  }, []);

  // User Profile & Data
  const [user, setUser] = useState<UserProfile>({
    name: 'Usuário', cpf: '', phone: '', birthDate: '', susCard: '', userType: 'Paciente',
    bloodType: '', emergencyContact: { name: '', phone: '', relation: '' },
    conditions: [], medications: [],
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [family, setFamily] = useState<FamilyMember[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [connections, setConnections] = useState<ProfessionalConnection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<ProfessionalConnection | null>(null);
  const [supportReturnTo, setSupportReturnTo] = useState<Screen>('profile');

  // Elevated Health Vitals State
  const [pressSys, setPressSys] = useState<number>(120);
  const [pressDia, setPressDia] = useState<number>(80);
  const [heartRate, setHeartRate] = useState<number>(70);
  const [glucose, setGlucose] = useState<number>(100);

  const hydrate = async (authUser: User) => {
    const data = await loadSedaData(authUser.id);
    const profile: UserProfile = data.profile ?? {
      name: String(authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuário'),
      cpf: String(authUser.user_metadata?.cpf || ''), phone: String(authUser.user_metadata?.phone || ''),
      birthDate: String(authUser.user_metadata?.birthDate || ''), susCard: '',
      userType: ['Paciente', 'Familiar', 'Profissional'].includes(authUser.user_metadata?.userType)
        ? authUser.user_metadata.userType : 'Paciente',
      bloodType: '', emergencyContact: { name: '', phone: '', relation: '' }, conditions: [], medications: [],
    };
    if (!data.profile) await saveProfile(authUser.id, profile);
    const userConnections = profile.userType === 'Paciente' || profile.userType === 'Profissional'
      ? await loadProfessionalConnections()
      : [];
    setUser(profile);
    setConnections(userConnections);
    setRecords(data.records);
    setAppointments(data.appointments);
    setFamily(data.family);
    setAlerts(data.alerts);
    const lastPressure = data.records.find((r) => r.measurement !== 'glucose');
    const lastGlucose = data.records.find((r) => r.measurement !== 'pressure');
    const lastPulse = data.records.find((r) => r.hasHeartRate);
    if (lastPressure) { setPressSys(lastPressure.systolic); setPressDia(lastPressure.diastolic); }
    if (lastPulse) setHeartRate(lastPulse.heartRate);
    if (lastGlucose) setGlucose(lastGlucose.glucose);
    setSessionUserId(authUser.id);
    setActiveTab('home');
    setScreen('home');
  };

  useEffect(() => {
    let active = true;
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        const rawRole = params.get('role');
        const role: UserProfile['userType'] =
          rawRole === 'Profissional' || rawRole === 'Familiar' || rawRole === 'Paciente'
            ? rawRole
            : 'Paciente';
        const isEmpty = params.get('empty') === '1';
        const seed = getDemoSeedData(role);
        const profile = isEmpty ? { ...seed.profile, medications: [] } : seed.profile;
        const seededRecords = isEmpty ? [] : seed.records;
        const seededAppointments = isEmpty ? [] : seed.appointments;
        const seededConnections = isEmpty ? [] : seed.connections;
        setUser(profile);
        setConnections(seededConnections);
        setRecords(seededRecords);
        setAppointments(seededAppointments);
        setFamily(seed.family);
        setAlerts(seed.alerts);
        const lastPressure = seededRecords.find((r) => r.measurement !== 'glucose');
        const lastGlucose = seededRecords.find((r) => r.measurement !== 'pressure');
        const lastPulse = seededRecords.find((r) => r.hasHeartRate);
        if (lastPressure) { setPressSys(lastPressure.systolic); setPressDia(lastPressure.diastolic); }
        if (lastPulse && lastPulse.heartRate !== undefined) setHeartRate(lastPulse.heartRate);
        if (lastGlucose) setGlucose(lastGlucose.glucose);
        setSessionUserId(DEMO_USER_ID);
        const requestedScreen = params.get('screen') as Screen | null;
        const validScreens: Screen[] = [
          'home', 'pressure', 'glucose', 'voice', 'history', 'dashboard', 'alerts',
          'family', 'connections', 'profile', 'edit_profile', 'settings', 'emergency',
          'appointments', 'new_appointment', 'support', 'onboarding', 'splash',
        ];
        const targetScreen = requestedScreen && validScreens.includes(requestedScreen) ? requestedScreen : 'home';
        if (['home', 'history', 'alerts', 'family', 'profile', 'dashboard', 'appointments', 'connections'].includes(targetScreen)) {
          setActiveTab(targetScreen);
        }
        setScreen(targetScreen);
        return () => { active = false; };
      }
    }
    supabase.auth.getUser().then(async ({ data, error }) => {
      if (!active) return;
      if (error || !data.user) { setScreen('login'); return; }
      try { await hydrate(data.user); }
      catch { if (active) { setAuthNotice('Não foi possível carregar seus dados. Verifique a conexão e entre novamente.'); setScreen('login'); } }
    });
    return () => { active = false; };
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setAuthNotice('');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error('E-mail ou senha inválidos, ou conta ainda não confirmada.');
    if (!data.user) throw new Error('Não foi possível carregar sua conta.');
    await hydrate(data.user);
  };

  const handleUpdatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    await supabase.auth.signOut();
    setAuthNotice('Senha atualizada. Entre com a nova senha.');
    setScreen('login');
  };

  const handleLoginGoogle = async (preferredRole?: UserProfile['userType']) => {
    setAuthNotice('');
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getWebRedirectUrl(),
          data: preferredRole ? { userType: preferredRole } : undefined,
        } as any,
      });
      if (error) throw error;
      if (data?.session?.user) {
        await hydrate(data.session.user);
      } else {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) await hydrate(userData.user);
      }
    } catch (err) {
      Alert.alert('Erro ao entrar com Google', err instanceof Error ? err.message : 'Tente novamente.');
    }
  };

  const handleRegister = async (email: string, password: string, profile: UserProfile) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { name: profile.name, cpf: profile.cpf, phone: profile.phone, birthDate: profile.birthDate, userType: profile.userType } },
      });
      if (error) {
        if (error.message?.toLowerCase().includes('rate') || error.message?.toLowerCase().includes('limit')) {
          throw new Error('Limite de envio de e-mails do servidor atingido (Rate limit). Use o botão "Continuar com o Google" para cadastro instantâneo!');
        }
        throw error;
      }
      if (data.session?.user) {
        await saveProfile(data.session.user.id, profile);
        await hydrate(data.session.user);
      } else {
        setAuthNotice('Conta criada! Caso demore o envio do e-mail por limite da API, acesse diretamente com sua senha ou com o Google.');
        setScreen('login');
      }
    } catch (err: any) {
      if (err.message?.toLowerCase().includes('rate') || err.message?.toLowerCase().includes('limit')) {
        throw new Error('Limite de envio de e-mails atingido (Rate limit). Use "Continuar com o Google" para cadastrar e entrar imediatamente!');
      }
      throw err;
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) { Alert.alert('Erro ao sair', error.message); return; }
    setSessionUserId(null);
    setAuthNotice('');
    setRecords([]); setAppointments([]); setFamily([]); setAlerts([]);
    setConnections([]); setSelectedConnection(null);
    setScreen('login');
  };

  const handleRefresh = async () => {
    if (!sessionUserId) return;
    if (sessionUserId === DEMO_USER_ID) return;
    setRefreshing(true);
    try {
      const data = await loadSedaData(sessionUserId);
      const userConnections = user.userType === 'Paciente' || user.userType === 'Profissional'
        ? await loadProfessionalConnections()
        : [];
      if (data.profile) setUser(data.profile);
      setRecords(data.records);
      setAppointments(data.appointments);
      setFamily(data.family);
      setAlerts(data.alerts);
      setConnections(userConnections);
    } catch (error) {
      Alert.alert('Não foi possível atualizar', error instanceof Error ? error.message : 'Tente novamente.');
    } finally { setRefreshing(false); }
  };

  // Appearance & Accessibility Settings
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<FontSizeScale>('normal');

  // Accessible font scaling calculation
  const fontScaleRatio = useMemo(() => {
    if (fontSize === 'xl') return 1.26;
    if (fontSize === 'large') return 1.12;
    return 1;
  }, [fontSize]);

  const dm = useMemo(() => getDarkModeTheme(darkMode), [darkMode]);

  // Record Saver
  const handleSaveHealthRecord = async (newRec: Partial<HealthRecord>) => {
    if (!sessionUserId) throw new Error('Entre na sua conta para salvar.');
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const created: HealthRecord = {
      id: `rec_${Date.now()}`,
      recordedAt: now.toISOString(),
      hasHeartRate: newRec.heartRate !== undefined,
      measurement: newRec.systolic !== undefined && newRec.glucose !== undefined
        ? 'combined' : newRec.systolic !== undefined ? 'pressure' : 'glucose',
      date: 'Hoje, ' + now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      time: newRec.time ?? timeStr,
      systolic: newRec.systolic ?? pressSys,
      diastolic: newRec.diastolic ?? pressDia,
      glucose: newRec.glucose ?? glucose,
      heartRate: newRec.heartRate ?? heartRate,
      mealContext: newRec.mealContext,
      notes: newRec.notes,
      status: newRec.status ?? (
        (newRec.systolic !== undefined && (newRec.systolic >= 140 || (newRec.diastolic ?? 0) >= 90)) ||
        (newRec.glucose !== undefined && newRec.glucose > (newRec.mealContext === 'after' ? 180 : 130))
          ? 'danger' : newRec.glucose !== undefined && newRec.glucose < 70 ? 'warn' : 'normal'
      ),
    };

    const isDemo = sessionUserId === DEMO_USER_ID;
    if (!isDemo) {
      await insertItem('seda_health_records', sessionUserId, created);
    }
    setRecords((prev) => [created, ...prev]);

    // Check thresholds for auto-alert
    if (newRec.systolic !== undefined && (created.systolic >= 140 || created.diastolic >= 90)) {
      const alertItem: AlertItem = {
        id: `alt_${Date.now()}`,
        title: 'Leitura de pressão elevada',
        desc: `Aferição de ${created.systolic}/${created.diastolic} mmHg. Confirme a leitura e converse com sua equipe de saúde.`,
        type: 'danger',
        date: 'Hoje',
        time: timeStr,
        emoji: '🚨',
        color: COLORS.danger,
        actionLabel: 'Ver Pressão',
        actionScreen: 'pressure',
      };
      try {
        if (!isDemo) {
          await insertItem('seda_alerts', sessionUserId, alertItem);
        }
        setAlerts((prev) => [alertItem, ...prev]);
      } catch (error) { Alert.alert('Registro salvo', 'O alerta não pôde ser sincronizado.'); }
    }
  };

  // Appointments handler
  const handleAddAppointment = async (newAppt: Appointment) => {
    if (!sessionUserId) throw new Error('Entre na sua conta para salvar.');
    if (sessionUserId !== DEMO_USER_ID) {
      await insertItem('seda_appointments', sessionUserId, newAppt);
    }
    setAppointments((prev) => [newAppt, ...prev]);
  };

  const handleCancelAppointment = async (id: number) => {
    const appt = appointments.find((item) => item.id === id);
    if (!sessionUserId || !appt) return;
    if (sessionUserId !== DEMO_USER_ID) {
      try { await updateItem('seda_appointments', sessionUserId, { ...appt, status: 'cancelled' as const }); }
      catch (error) { Alert.alert('Não foi possível cancelar', error instanceof Error ? error.message : 'Tente novamente.'); return; }
    }
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'cancelled' } : a))
    );
  };

  const handleDismissAlert = async (id: string) => {
    if (!sessionUserId) return;
    if (sessionUserId !== DEMO_USER_ID) {
      try { await deleteItem('seda_alerts', sessionUserId, id); }
      catch (error) { Alert.alert('Não foi possível dispensar', error instanceof Error ? error.message : 'Tente novamente.'); return; }
    }
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAddFamilyMember = async (newMember: FamilyMember) => {
    if (!sessionUserId) throw new Error('Entre na sua conta para salvar.');
    if (sessionUserId !== DEMO_USER_ID) {
      await insertItem('seda_family_members', sessionUserId, newMember);
    }
    setFamily((prev) => [...prev, newMember]);
  };

  const handleCreatePatientInvite = async () => {
    if (sessionUserId === DEMO_USER_ID) {
      return `SEDA-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    return createPatientInvite();
  };

  const handleAcceptPatientInvite = async (code: string) => {
    if (sessionUserId === DEMO_USER_ID) {
      const connection: ProfessionalConnection = {
        id: `conn_${Date.now()}`,
        professionalId: 'prof_demo',
        patientId: DEMO_USER_ID,
        professionalName: `Dr. Roberto Guimarães (${code.trim().toUpperCase()})`,
        patientName: user.name,
        createdAt: new Date().toISOString(),
      };
      setConnections((current) => [connection, ...current]);
      return;
    }
    const connection = await acceptPatientInvite(code);
    setConnections((current) => current.some((item) => item.id === connection.id) ? current : [connection, ...current]);
  };

  const handleRefreshConnections = useCallback(async () => {
    if (sessionUserId === DEMO_USER_ID) return;
    const refreshed = await loadProfessionalConnections();
    setConnections(refreshed);
  }, [sessionUserId]);

  const handleRemoveConnection = async (connection: ProfessionalConnection) => {
    if (sessionUserId !== DEMO_USER_ID) {
      const { error } = await supabase.from('seda_patient_connections').delete().eq('id', connection.id);
      if (error) throw new Error(error.message);
    }
    setConnections((current) => current.filter((item) => item.id !== connection.id));
  };

  const handleOpenChat = (connection: ProfessionalConnection) => {
    setSelectedConnection(connection);
    setActiveTab('connections');
    setScreen('chat');
  };

  const handleUpdateUserInline = async (profile: UserProfile) => {
    if (sessionUserId && sessionUserId !== DEMO_USER_ID) {
      await saveProfile(sessionUserId, profile);
    }
    setUser(profile);
  };

  const handleSaveProfile = async (profile: UserProfile) => {
    if (!sessionUserId) throw new Error('Entre na sua conta para atualizar o perfil.');
    if (sessionUserId !== DEMO_USER_ID) {
      await saveProfile(sessionUserId, profile);
    }
    setUser(profile);
    if (profile.userType === 'Paciente' || profile.userType === 'Profissional') {
      if (sessionUserId !== DEMO_USER_ID) {
        try {
          const refreshed = await loadProfessionalConnections();
          setConnections(refreshed);
        } catch {
          // Keep current connections if offline
        }
      }
    }
    setScreen('profile');
  };

  const handleNavTabChange = (targetScreen: Screen) => {
    setActiveTab(targetScreen);
    setScreen(targetScreen);
  };

  // Determine if bottom navigation bar should be visible
  const showNavBar = [
    'home',
    'history',
    'alerts',
    'family',
    'profile',
    'dashboard',
    'appointments',
    'connections',
  ].includes(screen);

  return (
    <SafeAreaProvider>
      <GlobalCSS />
      <MobileShell
        dm={dm}
        isSimulatorMode={isSimulatorMode}
        onToggleSimulator={() => setIsSimulatorMode(!isSimulatorMode)}
      >
        <ScreenEntrance key={screen} style={styles.screenContainer}>
          {screen === 'splash' && (
            <SplashScreen />
          )}

          {screen === 'onboarding' && (
            <OnboardingScreen onFinish={() => setScreen('login')} dm={dm} />
          )}

          {screen === 'login' && (
            <LoginScreen
              onLogin={handleLogin}
              onLoginGoogle={handleLoginGoogle}
              notice={authNotice}
              onResetPassword={async (email) => {
                const redirectTo = getWebRedirectUrl();
                const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
                if (error) throw error;
              }}
              onNavigate={(s) => setScreen(s)}
              dm={dm}
            />
          )}

          {screen === 'reset_password' && (
            <ResetPasswordScreen onSave={handleUpdatePassword} onBack={() => setScreen('login')} dm={dm} />
          )}

          {screen === 'register' && (
            <RegisterScreen
              onRegisterComplete={handleRegister}
              onLoginGoogle={handleLoginGoogle}
              onBack={() => setScreen('login')}
              dm={dm}
            />
          )}

          {screen === 'home' && user.userType === 'Profissional' && (
            <ProfessionalDashboardScreen
              user={user}
              connections={connections}
              appointments={appointments}
              onCreateInvite={handleCreatePatientInvite}
              onOpenChat={handleOpenChat}
              onNavigate={(target) => {
                if (['home', 'connections', 'appointments', 'profile'].includes(target)) setActiveTab(target);
                setScreen(target);
              }}
              dm={dm}
            />
          )}

          {screen === 'home' && user.userType === 'Familiar' && (
            <FamilyDashboardScreen
              user={user}
              appointments={appointments}
              records={records}
              unreadAlertsCount={alerts.length}
              onUpdateUser={handleUpdateUserInline}
              onNavigate={(s) => {
                if (['home', 'history', 'alerts', 'family', 'profile'].includes(s)) {
                  setActiveTab(s);
                }
                setScreen(s);
              }}
              dm={dm}
            />
          )}

          {screen === 'home' && user.userType === 'Paciente' && (
            <HomeScreen
              user={user}
              pressSys={pressSys}
              pressDia={pressDia}
              heartRate={heartRate}
              glucose={glucose}
              appointments={appointments}
              records={records}
              connections={connections}
              onNavigate={(s) => {
                if (['home', 'history', 'alerts', 'family', 'profile', 'connections'].includes(s)) {
                  setActiveTab(s);
                }
                setScreen(s);
              }}
              dm={dm}
              unreadAlertsCount={alerts.length}
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          )}

          {screen === 'pressure' && (
            <PressureScreen
              pressSys={pressSys}
              setPressSys={setPressSys}
              pressDia={pressDia}
              setPressDia={setPressDia}
              heartRate={heartRate}
              setHeartRate={setHeartRate}
              onSaveRecord={handleSaveHealthRecord}
              records={records}
              onOpenVoice={() => setScreen('voice')}
              onBack={() => setScreen('home')}
              dm={dm}
              fontSizeScale={fontScaleRatio}
            />
          )}

          {screen === 'glucose' && (
            <GlucoseScreen
              glucose={glucose}
              setGlucose={setGlucose}
              onSaveRecord={handleSaveHealthRecord}
              records={records}
              onOpenVoice={() => setScreen('voice')}
              onBack={() => setScreen('home')}
              dm={dm}
              fontSizeScale={fontScaleRatio}
            />
          )}

          {screen === 'voice' && (
            <VoiceScreen
              onSaveRecognizedRecord={handleSaveHealthRecord}
              onBack={() => setScreen('home')}
              dm={dm}
              fontSizeScale={fontScaleRatio}
            />
          )}

          {screen === 'history' && (
            <HistoryScreen
              records={records}
              onNavigate={(s) => setScreen(s)}
              onOpenQuickRegister={() => setQuickRegisterOpen(true)}
              dm={dm}
            />
          )}

          {screen === 'dashboard' && (
            <DashboardScreen
              records={records}
              onBack={() => setScreen('home')}
              dm={dm}
            />
          )}

          {screen === 'alerts' && (
            <AlertsScreen
              alerts={alerts}
              onDismissAlert={handleDismissAlert}
              onNavigate={(s) => setScreen(s)}
              onBack={() => setScreen('home')}
              dm={dm}
            />
          )}

          {screen === 'family' && (
            <FamilyScreen
              family={family}
              onAddMember={handleAddFamilyMember}
              onBack={() => setScreen('home')}
              dm={dm}
            />
          )}

          {screen === 'connections' && sessionUserId && (
            <ConnectionsScreen
              user={user}
              userId={sessionUserId}
              connections={connections}
              onCreateInvite={handleCreatePatientInvite}
              onAcceptInvite={handleAcceptPatientInvite}
              onRefreshConnections={handleRefreshConnections}
              onRemoveConnection={handleRemoveConnection}
              onOpenChat={handleOpenChat}
              onBack={() => {
                setActiveTab('home');
                setScreen('home');
              }}
              dm={dm}
            />
          )}

          {screen === 'chat' && selectedConnection && sessionUserId && (
            <ChatScreen
              connection={selectedConnection}
              userId={sessionUserId}
              peerName={user.userType === 'Profissional' ? selectedConnection.patientName : selectedConnection.professionalName}
              onBack={() => { setActiveTab('connections'); setScreen('connections'); }}
              dm={dm}
            />
          )}

          {screen === 'profile' && (
            <ProfileScreen
              user={user}
              onNavigate={(s) => {
                if (s === 'support') setSupportReturnTo('profile');
                setScreen(s);
              }}
              onUpdateAvatar={async (avatarUrl) => {
                const updated = { ...user, avatarUrl };
                if (sessionUserId && sessionUserId !== DEMO_USER_ID) {
                  await saveProfile(sessionUserId, updated);
                }
                setUser(updated);
              }}
              onLogout={handleLogout}
              dm={dm}
            />
          )}

          {screen === 'edit_profile' && (
            <EditProfileScreen user={user} onSave={handleSaveProfile} onBack={() => setScreen('profile')} dm={dm} />
          )}

          {screen === 'support' && (
            <SupportScreen onBack={() => setScreen(supportReturnTo)} dm={dm} />
          )}

          {screen === 'settings' && (
            <SettingsScreen
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              fontSize={fontSize}
              setFontSize={setFontSize}
              onBack={() => setScreen('profile')}
              onSupport={() => { setSupportReturnTo('settings'); setScreen('support'); }}
              dm={dm}
            />
          )}

          {screen === 'emergency' && (
            <EmergencyScreen
              family={family}
              onBack={() => setScreen('home')}
              dm={dm}
            />
          )}

          {screen === 'appointments' && (
            <AppointmentsScreen
              appointments={appointments}
              onCancelAppointment={handleCancelAppointment}
              onNavigate={(s) => setScreen(s)}
              onBack={() => setScreen('home')}
              dm={dm}
            />
          )}

          {screen === 'new_appointment' && (
            <NewAppointmentScreen
              onSaveAppointment={handleAddAppointment}
              userName={user.name}
              userType={user.userType}
              onNavigate={(s) => setScreen(s)}
              onBack={() => setScreen('appointments')}
              dm={dm}
            />
          )}
        </ScreenEntrance>

        {/* Persistent Accessible NavBar for Main Screens */}
        {showNavBar && !keyboardVisible && (
          <NavBar
            activeTab={activeTab}
            onTabChange={handleNavTabChange}
            onQuickAction={() => setQuickRegisterOpen(true)}
            dm={dm}
            unreadAlertsCount={alerts.length}
            userType={user.userType}
          />
        )}

        <QuickRegisterModal
          visible={quickRegisterOpen}
          onClose={() => setQuickRegisterOpen(false)}
          onSelect={(targetScreen) => setScreen(targetScreen)}
          dm={dm}
          userType={user.userType}
          monitoredPatientName={user.monitoredPatient?.name}
        />
      </MobileShell>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    position: 'relative',
  },
});
