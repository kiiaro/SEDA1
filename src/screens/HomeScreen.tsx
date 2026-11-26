import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  PanResponder,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowRight,
  BellRing,
  Calendar,
  CalendarPlus,
  Check,
  Droplets,
  Heart,
  HeartPulse,
  Phone,
  Pill,
  Stethoscope,
  Users,
} from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import {
  Appointment,
  DarkModeTheme,
  HealthRecord,
  ProfessionalConnection,
  Screen,
  UserProfile,
} from '../types';
import { FadeInItem, MotionButton as TouchableOpacity, useReducedMotion } from '../components/Motion';
import {
  buildWeekDays,
  classifyGlucose,
  classifyPressure,
  getAppointmentProximity,
  getDaySummary,
  getGreetingByHour,
  getNextUpcomingAppointment,
  getWeekRangeLabel,
  resolveWeekSwipeDelta,
  shouldShowCheckinCard,
  toLocalDateKey,
} from '../lib/healthUtils';

interface HomeScreenProps {
  user: UserProfile;
  pressSys: number;
  pressDia: number;
  heartRate: number;
  glucose: number;
  appointments: Appointment[];
  records: HealthRecord[];
  connections: ProfessionalConnection[];
  onNavigate: (screen: Screen) => void;
  dm: DarkModeTheme;
  unreadAlertsCount: number;
  refreshing: boolean;
  onRefresh: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  user,
  appointments,
  records,
  connections,
  onNavigate,
  dm,
  refreshing,
  onRefresh,
}) => {
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => toLocalDateKey(today), [today]);

  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [selectedDayKey, setSelectedDayKey] = useState<string>(todayKey);
  const [medTakenToday, setMedTakenToday] = useState<boolean>(false);

  const reducedMotion = useReducedMotion();
  const weekSlideAnim = useRef(new Animated.Value(0)).current;
  const weekOpacityAnim = useRef(new Animated.Value(1)).current;
  const heroPulse = useRef(new Animated.Value(1)).current;
  const cardShiftAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (reducedMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(heroPulse, {
          toValue: 1.09,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(heroPulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [heroPulse, reducedMotion]);

  const weekDays = useMemo(
    () => buildWeekDays(today, weekOffset, records),
    [today, weekOffset, records]
  );

  const weekRangeLabel = useMemo(() => getWeekRangeLabel(weekDays), [weekDays]);

  const selectedDay = useMemo(
    () => weekDays.find((d) => d.key === selectedDayKey) ?? weekDays.find((d) => d.isToday) ?? weekDays[0],
    [weekDays, selectedDayKey]
  );

  const daySummary = useMemo(
    () => getDaySummary(records, selectedDay?.key ?? todayKey, today),
    [records, selectedDay, todayKey, today]
  );

  const nextAppt = useMemo(() => getNextUpcomingAppointment(appointments), [appointments]);
  const latestAppt = useMemo(() => {
    if (nextAppt) return nextAppt;
    const completed = appointments
      .filter((a) => a.status === 'completed')
      .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
    return completed[0] ?? null;
  }, [appointments, nextAppt]);
  const apptProximity = useMemo(
    () => getAppointmentProximity(nextAppt, today),
    [nextAppt, today]
  );

  const animateWeekTransition = (delta: number, applyWeekChange: () => void) => {
    if (reducedMotion) {
      applyWeekChange();
      return;
    }

    const exitX = delta > 0 ? -34 : 34;
    const enterX = delta > 0 ? 34 : -34;

    Animated.parallel([
      Animated.timing(weekSlideAnim, {
        toValue: exitX,
        duration: 115,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(weekOpacityAnim, {
        toValue: 0,
        duration: 110,
        useNativeDriver: true,
      }),
    ]).start(() => {
      applyWeekChange();
      weekSlideAnim.setValue(enterX);
      weekOpacityAnim.setValue(0);
      Animated.parallel([
        Animated.timing(weekSlideAnim, {
          toValue: 0,
          duration: 240,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(weekOpacityAnim, {
          toValue: 1,
          duration: 240,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const changeWeek = (delta: number) => {
    const nextOffset = weekOffset + delta;
    const nextDays = buildWeekDays(today, nextOffset, records);
    animateWeekTransition(delta, () => {
      setWeekOffset(nextOffset);
      if (nextOffset === 0) {
        setSelectedDayKey(todayKey);
      } else if (nextDays[0]) {
        setSelectedDayKey(nextDays[0].key);
      }
    });
  };

  const changeWeekRef = useRef(changeWeek);
  changeWeekRef.current = changeWeek;
  const reducedMotionRef = useRef(reducedMotion);
  reducedMotionRef.current = reducedMotion;

  const weekPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 10 && Math.abs(gs.dx) > Math.abs(gs.dy) * 1.15,
      onMoveShouldSetPanResponderCapture: (_, gs) =>
        Math.abs(gs.dx) > 12 && Math.abs(gs.dx) > Math.abs(gs.dy) * 1.15,
      onPanResponderMove: (_, gs) => {
        if (reducedMotionRef.current) return;
        const clampedDx = Math.max(-56, Math.min(56, gs.dx * 0.48));
        weekSlideAnim.setValue(clampedDx);
        weekOpacityAnim.setValue(Math.max(0.58, 1 - Math.abs(gs.dx) / 190));
      },
      onPanResponderRelease: (_, gs) => {
        const delta = resolveWeekSwipeDelta(gs.dx, gs.vx);
        if (delta !== 0) {
          changeWeekRef.current(delta);
        } else if (!reducedMotionRef.current) {
          Animated.parallel([
            Animated.spring(weekSlideAnim, {
              toValue: 0,
              speed: 24,
              bounciness: 6,
              useNativeDriver: true,
            }),
            Animated.timing(weekOpacityAnim, {
              toValue: 1,
              duration: 160,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
      onPanResponderTerminate: () => {
        if (!reducedMotionRef.current) {
          Animated.parallel([
            Animated.spring(weekSlideAnim, {
              toValue: 0,
              speed: 24,
              bounciness: 6,
              useNativeDriver: true,
            }),
            Animated.timing(weekOpacityAnim, {
              toValue: 1,
              duration: 160,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  const selectDay = (key: string) => {
    setSelectedDayKey(key);
    if (!reducedMotion) {
      cardShiftAnim.setValue(0.96);
      Animated.spring(cardShiftAnim, {
        toValue: 1,
        speed: 24,
        bounciness: 7,
        useNativeDriver: true,
      }).start();
    }
  };

  const jumpToToday = () => {
    if (weekOffset !== 0) {
      const dir = weekOffset > 0 ? -1 : 1;
      animateWeekTransition(dir, () => {
        setWeekOffset(0);
        selectDay(todayKey);
      });
      return;
    }
    selectDay(todayKey);
  };

  const nameParts = user.name.trim().split(/\s+/);
  const displayFirst =
    ['Dona', 'Sr.', 'Sra.', 'Dr.', 'Dra.'].includes(nameParts[0]) && nameParts[1]
      ? `${nameParts[0]} ${nameParts[1]}`
      : nameParts[0] || 'Usuário';
  const initials =
    nameParts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || 'S';

  const greeting = getGreetingByHour(new Date().getHours());
  const pressureRec = daySummary.pressureRecord;
  const glucoseRec = daySummary.glucoseRecord;
  const pressureClass = pressureRec
    ? classifyPressure(pressureRec.systolic, pressureRec.diastolic)
    : null;
  const glucoseClass = glucoseRec
    ? classifyGlucose(glucoseRec.glucose, glucoseRec.mealContext)
    : null;

  const hasMeds = user.medications.length > 0;
  const primaryMed = hasMeds ? user.medications[0] : null;
  const hasClinician = connections.length > 0;
  const primaryClinician = hasClinician ? connections[0] : null;

  const showCheckin = shouldShowCheckinCard(daySummary, Boolean(selectedDay?.isFuture));

  const selectedDayTitle = selectedDay?.isToday
    ? 'Hoje'
    : `${selectedDay?.label}, ${selectedDay?.dayNum} ${selectedDay?.monthShort}`;
  const selectedDayPhrase = selectedDay?.isToday
    ? 'hoje'
    : `em ${selectedDayTitle.toLowerCase()}`;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: dm.bg }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.primary}
          colors={[COLORS.primary, COLORS.secondary]}
        />
      }
    >
      {/* Clean Minimalist Header with SOS Phone Button beside Profile Avatar */}
      <FadeInItem delay={0}>
        <View style={styles.topBar}>
          <Text style={[styles.greetingTitle, { color: dm.text }]}>
            {greeting}, {displayFirst}
          </Text>

          <View style={styles.topRightActions}>
            <TouchableOpacity
              onPress={() => onNavigate('emergency')}
              activeOpacity={0.85}
              style={styles.sosHeaderBtn}
              accessibilityRole="button"
              accessibilityLabel="Emergência SOS"
            >
              <Phone size={18} color="#FFFFFF" strokeWidth={2.4} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onNavigate('profile')}
              activeOpacity={0.85}
              style={[styles.avatarBtn, { borderColor: COLORS.primary }]}
              accessibilityLabel="Abrir Perfil"
            >
              {user.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
              ) : (
                <View style={[styles.avatarCircle, { backgroundColor: COLORS.secondary }]}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </FadeInItem>

      {/* Transparent Minimalist Pinterest-Style Weekly Strip (Gesture Swipe Navigation) */}
      <FadeInItem delay={50}>
        <View style={styles.calendarSection}>
          <View style={styles.calendarCardMeta}>
            <Text style={[styles.weekRangeText, { color: dm.sub }]}>{weekRangeLabel}</Text>
            {(weekOffset !== 0 || selectedDayKey !== todayKey) && (
              <TouchableOpacity
                onPress={jumpToToday}
                accessibilityRole="button"
                accessibilityLabel="Voltar para hoje"
                style={[styles.todayChip, { backgroundColor: 'rgba(0, 182, 144, 0.12)' }]}
              >
                <Text style={styles.todayChipText}>Hoje</Text>
              </TouchableOpacity>
            )}
          </View>

          <View
            {...weekPanResponder.panHandlers}
            testID="weekly-calendar-swipe-area"
            accessibilityHint="Deslize para os lados para trocar de semana"
            style={[
              styles.calendarGestureArea,
              Platform.OS === 'web' ? ({ touchAction: 'pan-y', userSelect: 'none' } as any) : null,
            ]}
          >
            <Animated.View
              style={[
                styles.calendarStrip,
                {
                  opacity: weekOpacityAnim,
                  transform: [{ translateX: weekSlideAnim }],
                },
              ]}
            >
              {weekDays.map((day) => {
                const isSelected = day.key === (selectedDay?.key ?? todayKey);
                const isPastUnselected = day.isPast && !isSelected;
                const isTodayUnselected = day.isToday && !isSelected;

                return (
                  <TouchableOpacity
                    key={day.key}
                    onPress={() => selectDay(day.key)}
                    activeOpacity={0.75}
                    style={[
                      styles.dayColumn,
                      isSelected && styles.dayColumnSelected,
                      isPastUnselected && styles.dayColumnPast,
                    ]}
                    accessibilityLabel={`Selecionar ${day.label} dia ${day.dayNum}`}
                  >
                    <Text
                      style={[
                        styles.dayLabel,
                        {
                          color: isSelected
                            ? COLORS.primary
                            : isTodayUnselected
                              ? COLORS.secondary
                              : dm.sub,
                          fontWeight: isSelected || day.isToday ? '800' : '600',
                        },
                      ]}
                    >
                      {day.label}
                    </Text>

                    <View
                      style={[
                        styles.dayCircle,
                        isSelected
                          ? {
                              backgroundColor: COLORS.primary,
                              shadowColor: COLORS.primary,
                              shadowOpacity: 0.34,
                              shadowRadius: 10,
                              shadowOffset: { width: 0, height: 4 },
                              elevation: 4,
                            }
                          : isTodayUnselected
                            ? {
                                backgroundColor: 'transparent',
                                borderColor: COLORS.secondary,
                                borderWidth: 1.75,
                              }
                            : {
                                backgroundColor: 'transparent',
                              },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayNum,
                          {
                            color: isSelected
                              ? '#FFFFFF'
                              : isPastUnselected
                                ? dm.sub
                                : dm.text,
                            fontWeight: isSelected || day.isToday ? '800' : '600',
                          },
                        ]}
                      >
                        {day.dayNum}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.dayMarker,
                        day.recordCount > 0
                          ? {
                              backgroundColor: isSelected
                                ? COLORS.primary
                                : isPastUnselected
                                  ? 'rgba(0, 182, 144, 0.5)'
                                  : COLORS.primary,
                            }
                          : { backgroundColor: 'transparent' },
                      ]}
                    />
                  </TouchableOpacity>
                );
              })}
            </Animated.View>
          </View>
        </View>
      </FadeInItem>

      {/* Pinterest-Inspired Check-in Hero Card (disappears once check-in/records exist for the day) */}
      {showCheckin && (
        <FadeInItem delay={110}>
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeadingRow}>
              <Text style={[styles.sectionHeadingText, { color: dm.text }]}>
                Check-in · {selectedDayTitle}
              </Text>
              <TouchableOpacity onPress={() => onNavigate('dashboard')}>
                <Text style={styles.seeAllText}>Análises</Text>
              </TouchableOpacity>
            </View>

            <LinearGradient
              colors={dm.isDark ? ['#12283A', '#162238'] : ['#F2FCF9', '#E6F8F4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.checkinHeroCard,
                { borderColor: dm.isDark ? '#264d8c' : '#BDEFE3' },
              ]}
            >
              <View style={styles.checkinTopRow}>
                <View style={styles.checkinTextBox}>
                  <Text
                    style={[
                      styles.checkinTitle,
                      { color: dm.isDark ? '#F8FAFC' : '#000000' },
                    ]}
                  >
                    Como está sua saúde hoje?
                  </Text>
                  <Text
                    style={[
                      styles.checkinDesc,
                      { color: dm.isDark ? '#CBD5E1' : '#334155' },
                    ]}
                  >
                    {`Nenhum registro ${selectedDayPhrase}. Respire fundo e faça sua aferição.`}
                  </Text>
                </View>

                <Animated.View
                  style={[
                    styles.pulseIllustration,
                    { transform: [{ scale: heroPulse }] },
                  ]}
                >
                  <View style={styles.pulseOuterGlow} />
                  <View
                    style={[
                      styles.pulseBody,
                      { backgroundColor: dm.isDark ? '#0B1323' : '#FFFFFF' },
                    ]}
                  >
                    <HeartPulse size={26} color={COLORS.primary} />
                  </View>
                </Animated.View>
              </View>

              <TouchableOpacity
                onPress={() => onNavigate('pressure')}
                activeOpacity={0.85}
                style={styles.checkinButton}
              >
                <Text style={styles.checkinButtonText}>Fazer Check-in Agora</Text>
                <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </FadeInItem>
      )}

      {/* Pinterest Masonry 2-Column Editorial Feed */}
      <FadeInItem delay={170}>
        <Animated.View
          style={[
            styles.sectionWrap,
            { transform: [{ scale: cardShiftAnim }] },
          ]}
        >
          <View style={styles.sectionHeadingRow}>
            <Text style={[styles.sectionHeadingText, { color: dm.text }]}>
              Diário Rápido de Saúde
            </Text>
            <View style={styles.sectionLinksRow}>
              <TouchableOpacity onPress={() => onNavigate('dashboard')}>
                <Text style={styles.seeAllText}>Análises</Text>
              </TouchableOpacity>
              <Text style={[styles.sectionLinkSep, { color: dm.sub }]}>·</Text>
              <TouchableOpacity onPress={() => onNavigate('history')}>
                <Text style={styles.seeAllText}>Ver todos</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.masonryColumns}>
            {/* Left Masonry Column */}
            <View style={styles.masonryCol}>
              {/* Tall Pin: Pressão Arterial */}
              <TouchableOpacity
                onPress={() => onNavigate('pressure')}
                activeOpacity={0.85}
                style={[
                  styles.pinCard,
                  styles.pinCardTall,
                  {
                    backgroundColor: dm.card,
                    borderColor: dm.border,
                  },
                ]}
              >
                <View style={styles.pinHeader}>
                  <View style={[styles.quickIconCircle, { backgroundColor: 'rgba(0, 182, 144, 0.12)' }]}>
                    <Heart size={17} color={COLORS.primary} />
                  </View>
                  <Text style={[styles.pinMetaKicker, { color: COLORS.primary }]}>Pressão</Text>
                </View>

                {pressureRec ? (
                  <>
                    <Text style={[styles.pinBigValue, { color: dm.text }]}>
                      {pressureRec.systolic}/{pressureRec.diastolic}
                    </Text>
                    <Text style={[styles.pinSubUnit, { color: dm.sub }]}>
                      mmHg · {pressureClass?.level === 'normal' ? 'Na meta' : pressureClass?.level === 'warn' ? 'Atenção' : 'Elevada'}
                    </Text>
                    <Text style={[styles.pinFooterText, { color: COLORS.primary }]}>
                      {pressureRec.time} · {selectedDayTitle}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={[styles.pinEmptyValue, { color: dm.text }]}>Sem registro</Text>
                    <Text style={[styles.pinEmptyDesc, { color: dm.sub }]}>
                      Nenhuma aferição salva {selectedDayPhrase}.
                    </Text>
                    <Text style={[styles.pinFooterText, { color: COLORS.primary }]}>
                      Toque para aferir
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Compact Pin: Glicemia Capilar */}
              <TouchableOpacity
                onPress={() => onNavigate('glucose')}
                activeOpacity={0.85}
                style={[
                  styles.pinCard,
                  {
                    backgroundColor: dm.card,
                    borderColor: dm.border,
                  },
                ]}
              >
                <View style={styles.pinHeader}>
                  <View style={[styles.quickIconCircle, { backgroundColor: 'rgba(38, 77, 140, 0.12)' }]}>
                    <Droplets size={17} color={COLORS.secondary} />
                  </View>
                  <Text style={[styles.pinMetaKicker, { color: COLORS.secondary }]}>Glicemia</Text>
                </View>

                {glucoseRec ? (
                  <>
                    <Text style={[styles.pinValue, { color: dm.text }]}>
                      {glucoseRec.glucose} <Text style={[styles.pinUnitInline, { color: dm.sub }]}>mg/dL</Text>
                    </Text>
                    <Text style={[styles.pinDesc, { color: dm.sub }]}>
                      {glucoseRec.mealContext === 'after' ? 'Pós-refeição' : 'Em jejum'} · {glucoseClass?.label}
                    </Text>
                    <Text style={[styles.pinFooterText, { color: COLORS.secondary }]}>
                      {glucoseRec.time} · {selectedDayTitle}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={[styles.pinEmptyValue, { color: dm.text }]}>Sem registro</Text>
                    <Text style={[styles.pinEmptyDesc, { color: dm.sub }]}>
                      Nenhuma medição de glicose neste dia.
                    </Text>
                    <Text style={[styles.pinFooterText, { color: COLORS.secondary }]}>
                      Toque para registrar
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Right Masonry Column (Staggered Rhythm) */}
            <View style={styles.masonryCol}>
              {/* Compact Pin: Remédios */}
              <TouchableOpacity
                onPress={() => onNavigate(hasMeds ? 'alerts' : 'profile')}
                activeOpacity={0.85}
                style={[
                  styles.pinCard,
                  {
                    backgroundColor: dm.card,
                    borderColor: hasMeds && medTakenToday ? COLORS.primary : dm.border,
                  },
                ]}
              >
                <View style={styles.pinHeader}>
                  <View style={[styles.quickIconCircle, { backgroundColor: 'rgba(0, 182, 144, 0.12)' }]}>
                    <Pill size={17} color={COLORS.primary} />
                  </View>
                  <Text style={[styles.pinMetaKicker, { color: COLORS.primary }]}>Remédios</Text>
                </View>

                {hasMeds && primaryMed ? (
                  <>
                    <Text style={[styles.pinValue, { color: dm.text }]} numberOfLines={2}>
                      {primaryMed.name}
                    </Text>
                    <Text style={[styles.pinDesc, { color: dm.sub }]}>
                      {primaryMed.dosage} · {primaryMed.nextTime || 'Diário'}
                      {user.medications.length > 1 ? ` · +${user.medications.length - 1}` : ''}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setMedTakenToday((v) => !v)}
                      accessibilityRole="button"
                      accessibilityLabel={medTakenToday ? 'Desmarcar remédio tomado' : 'Marcar remédio tomado'}
                      style={[
                        styles.medCheckBtn,
                        {
                          backgroundColor: medTakenToday
                            ? COLORS.primary
                            : 'rgba(0, 182, 144, 0.1)',
                        },
                      ]}
                    >
                      <Check size={13} color={medTakenToday ? '#FFFFFF' : COLORS.primary} />
                      <Text
                        style={[
                          styles.medCheckText,
                          { color: medTakenToday ? '#FFFFFF' : COLORS.primary },
                        ]}
                      >
                        {medTakenToday ? 'Dose confirmada' : 'Confirmar dose'}
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={[styles.pinEmptyValue, { color: dm.text }]}>Nenhum remédio</Text>
                    <Text style={[styles.pinEmptyDesc, { color: dm.sub }]}>
                      Nenhuma medicação cadastrada na prescrição.
                    </Text>
                    <Text style={[styles.pinFooterText, { color: COLORS.primary }]}>
                      Abrir prescrição
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Tall Pin: Equipe Clínica */}
              <TouchableOpacity
                onPress={() => onNavigate('connections')}
                activeOpacity={0.85}
                style={[
                  styles.pinCard,
                  styles.pinCardTall,
                  {
                    backgroundColor: dm.isDark ? '#162238' : '#F4F7FB',
                    borderColor: dm.border,
                  },
                ]}
              >
                <View style={styles.pinHeader}>
                  <View style={[styles.quickIconCircle, { backgroundColor: 'rgba(38, 77, 140, 0.14)' }]}>
                    {hasClinician ? (
                      <Users size={17} color={COLORS.secondary} />
                    ) : (
                      <Stethoscope size={17} color={COLORS.secondary} />
                    )}
                  </View>
                  <Text style={[styles.pinMetaKicker, { color: COLORS.secondary }]}>Equipe</Text>
                </View>

                {hasClinician && primaryClinician ? (
                  <>
                    <Text style={[styles.pinValue, { color: dm.text }]} numberOfLines={2}>
                      {primaryClinician.professionalName}
                    </Text>
                    <Text style={[styles.pinDesc, { color: dm.sub }]}>
                      {connections.length} profissional(is) vinculado(s) ao seu acompanhamento SUS.
                    </Text>
                    <View style={[styles.teamBubble, { backgroundColor: dm.card, borderColor: dm.border }]}>
                      <Text style={[styles.teamBubbleText, { color: dm.sub }]} numberOfLines={2}>
                        Canal direto aberto para dúvidas e envio de medições.
                      </Text>
                    </View>
                    <Text style={[styles.pinFooterText, { color: COLORS.secondary }]}>
                      Abrir conversa
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={[styles.pinEmptyValue, { color: dm.text }]}>Nenhum clínico</Text>
                    <Text style={[styles.pinEmptyDesc, { color: dm.sub }]}>
                      Você ainda não possui médico ou UBS vinculada.
                    </Text>
                    <Text style={[styles.pinFooterText, { color: COLORS.secondary }]}>
                      Conectar via QR Code
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </FadeInItem>

      {/* Últimas Consultas Card (with upcoming soon reminder & empty state) */}
      <FadeInItem delay={260}>
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeadingRow}>
            <Text style={[styles.sectionHeadingText, { color: dm.text }]}>
              Últimas Consultas
            </Text>
            <TouchableOpacity onPress={() => onNavigate('appointments')}>
              <Text style={styles.seeAllText}>Ver agenda</Text>
            </TouchableOpacity>
          </View>

          {latestAppt ? (
            <View
              style={[
                styles.apptCard,
                {
                  backgroundColor: dm.card,
                  borderColor: apptProximity.isSoon ? COLORS.primary : dm.border,
                },
              ]}
            >
              {apptProximity.isSoon && apptProximity.message && (
                <View style={styles.soonBanner}>
                  <View style={styles.soonBannerLeft}>
                    <BellRing size={14} color={COLORS.primary} />
                    <Text style={styles.soonBannerText}>
                      {apptProximity.message}
                    </Text>
                  </View>
                  {apptProximity.countdownLabel && (
                    <Text style={styles.soonCountdownText}>
                      {apptProximity.countdownLabel}
                    </Text>
                  )}
                </View>
              )}

              <View style={styles.apptHeaderRow}>
                <View style={styles.apptIconBox}>
                  <Calendar size={18} color={COLORS.secondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.apptDoctor, { color: dm.text }]}>
                    {latestAppt.doctor}
                  </Text>
                  <Text style={[styles.apptLocation, { color: dm.sub }]}>
                    {latestAppt.specialty} · {latestAppt.location}
                  </Text>
                </View>
                <Text style={styles.susMetaText}>SUS</Text>
              </View>

              <View style={[styles.apptDivider, { backgroundColor: dm.border }]} />

              <View style={styles.apptFooterRow}>
                <Text style={[styles.apptDateText, { color: dm.text }]}>
                  {latestAppt.date} · {latestAppt.time}
                </Text>
                <TouchableOpacity
                  onPress={() => onNavigate('appointments')}
                  style={styles.apptDetailBtn}
                >
                  <Text style={styles.apptDetailBtnText}>Detalhes</Text>
                  <ArrowRight size={14} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View
              style={[
                styles.apptCard,
                styles.emptyApptCard,
                {
                  backgroundColor: dm.card,
                  borderColor: dm.border,
                },
              ]}
            >
              <View style={styles.apptHeaderRow}>
                <View style={styles.apptIconBox}>
                  <CalendarPlus size={18} color={COLORS.secondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.apptDoctor, { color: dm.text }]}>
                    Nenhuma consulta marcada
                  </Text>
                  <Text style={[styles.apptLocation, { color: dm.sub }]}>
                    Agende sua próxima consulta ou retorno na UBS.
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => onNavigate('new_appointment')}
                style={[styles.scheduleApptBtn, { backgroundColor: 'rgba(0, 182, 144, 0.12)' }]}
              >
                <Text style={styles.scheduleApptBtnText}>Agendar consulta</Text>
                <ArrowRight size={14} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </FadeInItem>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 38 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  greetingTitle: {
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: -0.7,
    flex: 1,
    paddingRight: 12,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sosHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarBtn: {
    padding: 2,
    borderRadius: 24,
    borderWidth: 2,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  calendarSection: {
    backgroundColor: 'transparent',
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 10,
    gap: 8,
  },
  calendarCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    minHeight: 24,
  },
  weekRangeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  todayChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  todayChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  calendarGestureArea: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
    paddingVertical: 2,
  },
  calendarStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayColumn: {
    alignItems: 'center',
    gap: 5,
    flex: 1,
    paddingVertical: 2,
  },
  dayColumnSelected: {
    transform: [{ scale: 1.04 }],
  },
  dayColumnPast: {
    opacity: 0.52,
  },
  dayLabel: {
    fontSize: 11,
    letterSpacing: -0.1,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNum: {
    fontSize: 14,
  },
  dayMarker: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  sectionWrap: {
    paddingHorizontal: 20,
    marginTop: 16,
    gap: 10,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeadingText: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  sectionLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionLinkSep: {
    fontSize: 12,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  checkinHeroCard: {
    padding: 20,
    borderRadius: 26,
    borderWidth: 1,
    gap: 16,
  },
  checkinTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkinTextBox: {
    flex: 1,
    paddingRight: 12,
    gap: 5,
  },
  checkinTitle: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 25,
    letterSpacing: -0.5,
  },
  checkinDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  pulseIllustration: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pulseOuterGlow: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 182, 144, 0.16)',
  },
  pulseBody: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkinButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  checkinButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  masonryColumns: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  masonryCol: {
    flex: 1,
    gap: 12,
  },
  pinCard: {
    padding: 15,
    borderRadius: 22,
    borderWidth: 1,
    gap: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 1,
  },
  pinCardTall: {
    minHeight: 156,
    justifyContent: 'space-between',
  },
  pinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quickIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinMetaKicker: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  pinBigValue: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  pinSubUnit: {
    fontSize: 11,
    fontWeight: '500',
  },
  pinValue: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  pinUnitInline: {
    fontSize: 11,
    fontWeight: '500',
  },
  pinDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  pinEmptyValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  pinEmptyDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  pinFooterText: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  medCheckBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginTop: 2,
  },
  medCheckText: {
    fontSize: 11,
    fontWeight: '700',
  },
  teamBubble: {
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  teamBubbleText: {
    fontSize: 11,
    lineHeight: 15,
  },
  apptCard: {
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
    gap: 10,
  },
  soonBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 182, 144, 0.12)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 8,
  },
  soonBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  soonBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  soonCountdownText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  emptyApptCard: {
    gap: 12,
  },
  apptHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  apptIconBox: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: 'rgba(38, 77, 140, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  apptDoctor: {
    fontSize: 14,
    fontWeight: '800',
  },
  apptLocation: {
    fontSize: 12,
    lineHeight: 16,
  },
  susMetaText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.4,
  },
  apptDivider: {
    height: 1,
    opacity: 0.6,
  },
  apptFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  apptDateText: {
    fontSize: 12,
    fontWeight: '700',
  },
  apptDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  apptDetailBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  scheduleApptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 14,
  },
  scheduleApptBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
