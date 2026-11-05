import React, { useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Alert } from 'react-native';
import type { User } from '@supabase/supabase-js';
import { StatusBar } from 'expo-status-bar';
import {
  Screen,
  FontSizeScale,
  Appointment,
  HealthRecord,
  FamilyMember,
  AlertItem,
  UserProfile,
} from './types';
import {
  COLORS,
  getDarkModeTheme,
} from './constants/theme';
import { supabase } from './lib/supabase';
import { deleteItem, insertItem, loadSedaData, saveProfile, updateItem } from './lib/data';
import { MobileShell } from './components/MobileShell';
import { NavBar } from './components/NavBar';

// Screens
import { SplashScreen } from './screens/SplashScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { LoginScreen } from './screens/LoginScreen';
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

export default function App() {
  // Central application state
  const [screen, setScreen] = useState<Screen>('splash');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isSimulatorMode, setIsSimulatorMode] = useState<boolean>(false);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [authNotice, setAuthNotice] = useState('');

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
    setUser(profile);
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

  const handleRegister = async (email: string, password: string, profile: UserProfile) => {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name: profile.name, cpf: profile.cpf, phone: profile.phone, birthDate: profile.birthDate, userType: profile.userType } },
    });
    if (error) throw error;
    if (data.session?.user) {
      await saveProfile(data.session.user.id, profile);
      await hydrate(data.session.user);
    } else {
      setAuthNotice('Confira seu e-mail e abra o link de confirmação para concluir o cadastro.');
      setScreen('login');
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) { Alert.alert('Erro ao sair', error.message); return; }
    setSessionUserId(null);
    setAuthNotice('');
    setRecords([]); setAppointments([]); setFamily([]); setAlerts([]);
    setScreen('login');
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

    await insertItem('seda_health_records', sessionUserId, created);
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
        await insertItem('seda_alerts', sessionUserId, alertItem);
        setAlerts((prev) => [alertItem, ...prev]);
      } catch (error) { Alert.alert('Registro salvo', 'O alerta não pôde ser sincronizado.'); }
    }
  };

  // Appointments handler
  const handleAddAppointment = async (newAppt: Appointment) => {
    if (!sessionUserId) throw new Error('Entre na sua conta para salvar.');
    await insertItem('seda_appointments', sessionUserId, newAppt);
    setAppointments((prev) => [newAppt, ...prev]);
  };

  const handleCancelAppointment = async (id: number) => {
    const appt = appointments.find((item) => item.id === id);
    if (!sessionUserId || !appt) return;
    try { await updateItem('seda_appointments', sessionUserId, { ...appt, status: 'cancelled' as const }); }
    catch (error) { Alert.alert('Não foi possível cancelar', error instanceof Error ? error.message : 'Tente novamente.'); return; }
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'cancelled' } : a))
    );
  };

  const handleDismissAlert = async (id: string) => {
    if (!sessionUserId) return;
    try { await deleteItem('seda_alerts', sessionUserId, id); }
    catch (error) { Alert.alert('Não foi possível dispensar', error instanceof Error ? error.message : 'Tente novamente.'); return; }
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAddFamilyMember = async (newMember: FamilyMember) => {
    if (!sessionUserId) throw new Error('Entre na sua conta para salvar.');
    await insertItem('seda_family_members', sessionUserId, newMember);
    setFamily((prev) => [...prev, newMember]);
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
  ].includes(screen);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: dm.bg }]}>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      <MobileShell
        dm={dm}
        isSimulatorMode={isSimulatorMode}
        onToggleSimulator={() => setIsSimulatorMode(!isSimulatorMode)}
      >
        <View style={styles.screenContainer}>
          {screen === 'splash' && (
            <SplashScreen onFinish={() => {}} />
          )}

          {screen === 'onboarding' && (
            <OnboardingScreen onFinish={() => setScreen('login')} dm={dm} />
          )}

          {screen === 'login' && (
            <LoginScreen
              onLogin={handleLogin}
              notice={authNotice}
              onResetPassword={async (email) => {
                const { error } = await supabase.auth.resetPasswordForEmail(email);
                if (error) throw error;
              }}
              onNavigate={(s) => setScreen(s)}
              dm={dm}
            />
          )}

          {screen === 'register' && (
            <RegisterScreen
              onRegisterComplete={handleRegister}
              onBack={() => setScreen('login')}
              dm={dm}
            />
          )}

          {screen === 'home' && (
            <HomeScreen
              user={user}
              pressSys={pressSys}
              pressDia={pressDia}
              heartRate={heartRate}
              glucose={glucose}
              appointments={appointments}
              records={records}
              onNavigate={(s) => {
                if (['home', 'history', 'alerts', 'family', 'profile'].includes(s)) {
                  setActiveTab(s);
                }
                setScreen(s);
              }}
              dm={dm}
              unreadAlertsCount={alerts.length}
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

          {screen === 'profile' && (
            <ProfileScreen
              user={user}
              onNavigate={(s) => setScreen(s)}
              onLogout={handleLogout}
              dm={dm}
            />
          )}

          {screen === 'settings' && (
            <SettingsScreen
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              fontSize={fontSize}
              setFontSize={setFontSize}
              onBack={() => setScreen('profile')}
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
              onNavigate={(s) => setScreen(s)}
              onBack={() => setScreen('appointments')}
              dm={dm}
            />
          )}
        </View>

        {/* Persistent Accessible NavBar for Main Screens */}
        {showNavBar && (
          <NavBar
            activeTab={activeTab}
            onTabChange={handleNavTabChange}
            dm={dm}
            unreadAlertsCount={alerts.length}
          />
        )}
      </MobileShell>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
    position: 'relative',
  },
});
