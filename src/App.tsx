import React, { useState, useMemo } from 'react';
import { View, StyleSheet, SafeAreaView, Platform } from 'react-native';
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
  INITIAL_USER,
  INITIAL_APPOINTMENTS,
  INITIAL_FAMILY,
  INITIAL_ALERTS,
  INITIAL_RECORDS,
} from './constants/theme';
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

  // User Profile & Data
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [family, setFamily] = useState<FamilyMember[]>(INITIAL_FAMILY);
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [records, setRecords] = useState<HealthRecord[]>(INITIAL_RECORDS);

  // Elevated Health Vitals State
  const [pressSys, setPressSys] = useState<number>(124);
  const [pressDia, setPressDia] = useState<number>(82);
  const [heartRate, setHeartRate] = useState<number>(72);
  const [glucose, setGlucose] = useState<number>(104);

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
  const handleSaveHealthRecord = (newRec: Partial<HealthRecord>) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const created: HealthRecord = {
      id: `rec_${Date.now()}`,
      date: 'Hoje, ' + now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      time: timeStr,
      systolic: newRec.systolic ?? pressSys,
      diastolic: newRec.diastolic ?? pressDia,
      glucose: newRec.glucose ?? glucose,
      heartRate: newRec.heartRate ?? heartRate,
      mealContext: newRec.mealContext,
      notes: newRec.notes,
      status: newRec.status ?? 'normal',
    };

    setRecords((prev) => [created, ...prev]);

    // Check thresholds for auto-alert
    if (created.systolic >= 140) {
      const alertItem: AlertItem = {
        id: `alt_${Date.now()}`,
        title: 'Pressão Alta Registrada',
        desc: `Aferição de ${created.systolic}/${created.diastolic} mmHg. Repouse 15 minutos.`,
        type: 'danger',
        date: 'Hoje',
        time: timeStr,
        emoji: '🚨',
        color: COLORS.danger,
        actionLabel: 'Ver Pressão',
        actionScreen: 'pressure',
      };
      setAlerts((prev) => [alertItem, ...prev]);
    }
  };

  // Appointments handler
  const handleAddAppointment = (newAppt: Appointment) => {
    setAppointments((prev) => [newAppt, ...prev]);
  };

  const handleCancelAppointment = (id: number) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'cancelled' } : a))
    );
  };

  const handleDismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAddFamilyMember = (newMember: FamilyMember) => {
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
            <SplashScreen onFinish={() => setScreen('onboarding')} />
          )}

          {screen === 'onboarding' && (
            <OnboardingScreen onFinish={() => setScreen('login')} dm={dm} />
          )}

          {screen === 'login' && (
            <LoginScreen
              onLogin={() => {
                setActiveTab('home');
                setScreen('home');
              }}
              onNavigate={(s) => setScreen(s)}
              dm={dm}
            />
          )}

          {screen === 'register' && (
            <RegisterScreen
              onRegisterComplete={() => {
                setActiveTab('home');
                setScreen('home');
              }}
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
              onLogout={() => setScreen('login')}
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
