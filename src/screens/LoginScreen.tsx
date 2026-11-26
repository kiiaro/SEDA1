import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, EyeOff, ArrowRight } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { DarkModeTheme, Screen } from '../types';
import { MotionButton as TouchableOpacity } from '../components/Motion';
import { useInputVisibility } from '../components/useInputVisibility';
import { friendlyAuthError } from '../lib/googleAuth';

interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onResetPassword: (email: string) => Promise<void>;
  onGoogleAuth: () => Promise<void>;
  notice?: string;
  onNavigate: (screen: Screen) => void;
  dm: DarkModeTheme;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onResetPassword, onGoogleAuth, notice, onNavigate, dm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'pass' | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [googleBusy, setGoogleBusy] = useState(false);
  const passwordRef = useRef<TextInput>(null);
  const { width } = useWindowDimensions();
  const compact = width < 380;
  const { scrollRef, keepInputVisible } = useInputVisibility();

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setMessage('Informe seu e-mail e sua senha.');
      return;
    }
    setBusy(true);
    setMessage('');
    try { await onLogin(email.trim().toLowerCase(), password); }
    catch (error) { setMessage(friendlyAuthError(error)); }
    finally { setBusy(false); }
  };

  const handleForgotPass = async () => {
    if (!email.trim()) { setMessage('Digite seu e-mail para recuperar a senha.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setMessage('Confira o formato do e-mail e tente novamente.'); return; }
    setBusy(true);
    setMessage('');
    try { await onResetPassword(email.trim().toLowerCase()); setMessage('Se este e-mail estiver cadastrado, enviaremos um link. Abra-o neste aparelho e confira também a pasta de spam.'); }
    catch (error) { setMessage(friendlyAuthError(error)); }
    finally { setBusy(false); }
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={[styles.container, { backgroundColor: dm.bg }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header Gradient */}
      <LinearGradient
        colors={[COLORS.secondary, '#FFF0AA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, compact && styles.headerCompact]}
      >
        <View style={styles.logoRow}><Image source={require('../../assets/seda-logo.png')} resizeMode="contain" style={styles.logoImage} accessibilityLabel="theSEDA" /></View>
        <Text style={styles.brandSubtitle}>
          Cuidado que aproxima
        </Text>
      </LinearGradient>

      {/* Main Card */}
      <View
        style={[
          styles.card,
          compact && styles.cardCompact,
          {
            backgroundColor: dm.card,
            borderColor: dm.border,
          },
        ]}
      >
        {/* Progress Strip */}
        <View style={styles.progressRow}>
          <View style={[styles.progressBar, { backgroundColor: COLORS.primaryDk }]} />
          <View
            style={[
              styles.progressBar,
              { backgroundColor: 'rgba(94, 143, 192, 0.25)' },
            ]}
          />
        </View>

        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: dm.text }]}>Acesse o theSEDA</Text>
          <Text style={[styles.subtitle, { color: dm.sub }]}>
            Entre com seu e-mail e senha para acessar seus dados
          </Text>
        </View>

        {/* Input Fields */}
        <View style={styles.formGroup}>
          <Text style={[styles.inputLabel, { color: dm.sub }]}>
            E-mail
          </Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            onFocus={(event) => { setFocusedField('email'); keepInputVisible(event); }}
            onBlur={() => setFocusedField(null)}
            placeholder="voce@exemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            placeholderTextColor={dm.sub}
            style={[
              styles.input,
              {
                backgroundColor: dm.inputBg,
                color: dm.text,
                borderColor: focusedField === 'email' ? COLORS.primary : dm.border,
              },
            ]}
          />
        </View>

        <View style={styles.formGroup}>
          <View style={styles.labelRow}>
            <Text style={[styles.inputLabel, { color: dm.sub }]}>
              Senha de Acesso
            </Text>
            <TouchableOpacity onPress={handleForgotPass} disabled={busy} accessibilityRole="button">
              <Text style={[styles.forgotText, { color: COLORS.primary }]}>
                Esqueci a senha
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.passwordWrapper}>
            <TextInput
              ref={passwordRef}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="current-password"
              onFocus={(event) => { setFocusedField('pass'); keepInputVisible(event); }}
              onBlur={() => setFocusedField(null)}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="go"
              onSubmitEditing={handleLogin}
              placeholder="••••••••"
              placeholderTextColor={dm.sub}
              style={[
                styles.input,
                styles.passwordInput,
                {
                  backgroundColor: dm.inputBg,
                  color: dm.text,
                  borderColor: focusedField === 'pass' ? COLORS.primary : dm.border,
                },
              ]}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeBtn}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              hitSlop={8}
            >
              {showPassword ? (
                <EyeOff size={20} color={dm.sub} />
              ) : (
                <Eye size={20} color={dm.sub} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={busy}
          activeOpacity={0.8}
          style={[styles.loginBtn, { backgroundColor: COLORS.primaryDk }]}
        >
          <Text style={styles.loginBtnText}>{busy ? 'Aguarde...' : 'Entrar no theSEDA'}</Text>
          <ArrowRight size={20} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.dividerRow}><View style={[styles.dividerLine, { backgroundColor: dm.border }]} /><Text style={styles.dividerText}>ou</Text><View style={[styles.dividerLine, { backgroundColor: dm.border }]} /></View>
        <TouchableOpacity style={[styles.googleButton, { borderColor: dm.border, backgroundColor: dm.card }]} disabled={googleBusy || busy} onPress={async () => {
          setGoogleBusy(true); setMessage('');
          try { await onGoogleAuth(); } catch (error) { setMessage(friendlyAuthError(error)); }
          finally { setGoogleBusy(false); }
        }} accessibilityRole="button">
          <Text style={styles.googleMark}>G</Text><Text style={[styles.googleText, { color: dm.text }]}>{googleBusy ? 'Conectando...' : 'Continuar com Google'}</Text>
        </TouchableOpacity>

        {message || notice ? <Text style={[styles.feedback, { color: dm.text, backgroundColor: dm.inputBg, borderColor: dm.border }]}>{message || notice}</Text> : null}

        {/* Bottom Switch */}
        <View style={styles.bottomRow}>
          <Text style={[styles.bottomText, { color: dm.sub }]}>
            Primeiro acesso?{' '}
          </Text>
          <TouchableOpacity onPress={() => onNavigate('register')}>
            <Text style={[styles.registerLink, { color: COLORS.primary }]}>
              Criar meu cadastro
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 24,
    paddingBottom: 38,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  headerCompact: { paddingTop: 16, paddingBottom: 32, paddingHorizontal: 16 },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  logoImage: { width: 145, height: 74 },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.primaryDk,
    letterSpacing: -1,
  },
  brandSubtitle: {
    fontSize: 12,
    color: COLORS.primaryDk,
    fontWeight: '600',
  },
  card: {
    flex: 1,
    marginTop: -24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    borderTopWidth: 1,
  },
  cardCompact: { paddingHorizontal: 18, paddingTop: 20 },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  titleSection: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  formGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '700',
  },
  input: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    fontSize: 15,
    borderWidth: 1.5,
    fontWeight: '600',
  },
  passwordWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    padding: 4,
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
    elevation: 4,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  govBtn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  govBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingBottom: 12,
  },
  bottomText: {
    fontSize: 13,
  },
  registerLink: {
    fontSize: 13,
    fontWeight: '800',
  },
  feedback: { marginTop: 16, padding: 12, borderRadius: 12, borderWidth: 1, fontSize: 13, lineHeight: 19 },
  googleButton: { paddingVertical: 13, paddingHorizontal: 16, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10 },
  googleMark: { color: '#4285F4', fontSize: 18, fontWeight: '900' },
  googleText: { fontSize: 13, fontWeight: '800' },
});
