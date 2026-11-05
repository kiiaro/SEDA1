import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, EyeOff, Heart, ArrowRight } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { DarkModeTheme, Screen } from '../types';

interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onResetPassword: (email: string) => Promise<void>;
  notice?: string;
  onNavigate: (screen: Screen) => void;
  dm: DarkModeTheme;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onResetPassword, notice, onNavigate, dm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'pass' | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setMessage('Informe seu e-mail e sua senha.');
      return;
    }
    setBusy(true);
    setMessage('');
    try { await onLogin(email.trim().toLowerCase(), password); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível entrar.'); }
    finally { setBusy(false); }
  };

  const handleForgotPass = async () => {
    if (!email.trim()) { setMessage('Digite seu e-mail para recuperar a senha.'); return; }
    setBusy(true);
    try { await onResetPassword(email.trim().toLowerCase()); setMessage('Se o e-mail estiver cadastrado, você receberá um link de recuperação.'); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível solicitar o link.'); }
    finally { setBusy(false); }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: dm.bg }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Gradient */}
      <LinearGradient
        colors={['#1E3A5F', '#3D6E9F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.logoRow}>
          <View style={styles.heartBox}>
            <Heart size={20} color="#FFFFFF" fill="#FFFFFF" />
          </View>
          <Text style={styles.brandTitle}>SEDA</Text>
        </View>
        <Text style={styles.brandSubtitle}>
          Acompanhe suas medições em um só lugar
        </Text>
      </LinearGradient>

      {/* Main Card */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: dm.card,
            borderColor: dm.border,
          },
        ]}
      >
        {/* Progress Strip */}
        <View style={styles.progressRow}>
          <View style={[styles.progressBar, { backgroundColor: COLORS.primary }]} />
          <View
            style={[
              styles.progressBar,
              { backgroundColor: 'rgba(94, 143, 192, 0.25)' },
            ]}
          />
        </View>

        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: dm.text }]}>Acesse sua Conta</Text>
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
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
            placeholder="voce@exemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
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
            <TouchableOpacity onPress={handleForgotPass}>
              <Text style={[styles.forgotText, { color: COLORS.primary }]}>
                Esqueci a senha
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.passwordWrapper}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="current-password"
              onFocus={() => setFocusedField('pass')}
              onBlur={() => setFocusedField(null)}
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
          style={[styles.loginBtn, { backgroundColor: COLORS.primary }]}
        >
          <Text style={styles.loginBtnText}>{busy ? 'Aguarde...' : 'Entrar no SEDA'}</Text>
          <ArrowRight size={20} color="#FFFFFF" strokeWidth={2.5} />
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
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  heartBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  brandSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
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
});
