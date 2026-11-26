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
import { Eye, EyeOff, ArrowRight } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../constants/theme';
import { DarkModeTheme, Screen } from '../types';
import { FadeInItem, MotionButton as TouchableOpacity } from '../components/Motion';
import { useInputVisibility } from '../components/useInputVisibility';

interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onLoginGoogle?: () => Promise<void>;
  onResetPassword: (email: string) => Promise<void>;
  notice?: string;
  onNavigate: (screen: Screen) => void;
  dm: DarkModeTheme;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  onLoginGoogle,
  onResetPassword,
  notice,
  onNavigate,
  dm,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'pass' | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const passwordRef = useRef<TextInput>(null);
  const { width } = useWindowDimensions();
  const compact = width < 380;
  const { scrollRef, keepInputVisible } = useInputVisibility();

  const handleLogin = async () => {
    const targetEmail = email.trim();
    if (!targetEmail || !password) {
      setMessage('Preencha seu e-mail e senha para entrar.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
      setMessage('Confira o formato do e-mail e tente novamente.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      await onLogin(targetEmail.toLowerCase(), password);
    } catch (error: any) {
      const errText = error instanceof Error ? error.message : 'Não foi possível entrar.';
      if (errText.toLowerCase().includes('rate') || errText.toLowerCase().includes('limit')) {
        setMessage('Limite de requisições de e-mail atingido no servidor. Use "Continuar com o Google" para entrar sem limite.');
      } else {
        setMessage(errText);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    if (!onLoginGoogle) return;
    setBusy(true);
    setMessage('');
    try {
      await onLoginGoogle();
    } catch (error: any) {
      setMessage(error instanceof Error ? error.message : 'Falha na autenticação Google.');
    } finally {
      setBusy(false);
    }
  };

  const handleForgotPass = async () => {
    if (!email.trim()) {
      setMessage('Digite seu e-mail para recuperar a senha.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setMessage('Confira o formato do e-mail e tente novamente.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      await onResetPassword(email.trim().toLowerCase());
      setMessage('Se este e-mail estiver cadastrado, enviamos o link. Caso demore por limite de envio, acesse via Google.');
    } catch (error: any) {
      const errText = error instanceof Error ? error.message : 'Não foi possível solicitar o link.';
      if (errText.toLowerCase().includes('rate') || errText.toLowerCase().includes('limit')) {
        setMessage('Limite de envio de e-mails atingido. Entre pelo botão "Continuar com o Google".');
      } else {
        setMessage(errText);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={[styles.container, { backgroundColor: dm.bg }]}
      contentContainerStyle={[styles.contentContainer, compact && styles.contentCompact]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Minimalist Top Logo Block */}
      <FadeInItem delay={0}>
        <View style={styles.brandHeader}>
          <Image
            source={require('../../assets/the_seda_logo.png')}
            style={styles.logoImg}
            resizeMode="contain"
            accessibilityLabel="the seda"
          />
          <Text style={[styles.title, { color: dm.text }]}>Acesse sua conta</Text>
          <Text style={[styles.subtitle, { color: dm.text, fontWeight: '700' }]}>
            Sistema de Equilíbrio de Diabetes e Artérias
          </Text>
          <Text style={[styles.subtitle, { color: dm.sub }]}>
            Seu diário de saúde preventiva
          </Text>
        </View>
      </FadeInItem>

      {/* Main Minimalist Card */}
      <FadeInItem delay={80}>
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
          {/* Google Sign In Button */}
          <TouchableOpacity
            onPress={handleGoogle}
            disabled={busy}
            activeOpacity={0.8}
            style={[styles.googleBtn, { borderColor: dm.border, backgroundColor: dm.inputBg }]}
            accessibilityLabel="Continuar com o Google"
          >
            <Svg width={20} height={20} viewBox="0 0 24 24">
              <Path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <Path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <Path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <Path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </Svg>
            <Text style={[styles.googleBtnText, { color: dm.text }]}>
              Continuar com o Google
            </Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: dm.border }]} />
            <Text style={[styles.dividerText, { color: dm.sub }]}>OU E-MAIL</Text>
            <View style={[styles.dividerLine, { backgroundColor: dm.border }]} />
          </View>

          {/* Input Fields */}
          <View style={styles.formGroup}>
            <Text style={[styles.inputLabel, { color: dm.sub }]}>E-mail</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              onFocus={(event) => {
                setFocusedField('email');
                keepInputVisible(event);
              }}
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
              <Text style={[styles.inputLabel, { color: dm.sub }]}>Senha</Text>
              <TouchableOpacity onPress={handleForgotPass} disabled={busy} accessibilityRole="button">
                <Text style={[styles.forgotText, { color: '#00b690' }]}>
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
                onFocus={(event) => {
                  setFocusedField('pass');
                  keepInputVisible(event);
                }}
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
                  <EyeOff size={18} color={dm.sub} />
                ) : (
                  <Eye size={18} color={dm.sub} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={busy}
            activeOpacity={0.8}
            style={[styles.loginBtn, { backgroundColor: '#00b690' }]}
          >
            <Text style={styles.loginBtnText}>{busy ? 'Entrando...' : 'Entrar no SEDA'}</Text>
            <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>

          {message || notice ? (
            <View
              style={[
                styles.feedbackBox,
                {
                  backgroundColor: 'rgba(38, 77, 140, 0.08)',
                  borderColor: '#264d8c',
                },
              ]}
            >
              <Text style={[styles.feedbackText, { color: dm.text }]}>
                {message || notice}
              </Text>
            </View>
          ) : null}
        </View>
      </FadeInItem>

      <FadeInItem delay={140}>
        <View style={styles.bottomRow}>
          <Text style={[styles.bottomText, { color: dm.sub }]}>
            Primeiro acesso?{' '}
          </Text>
          <TouchableOpacity onPress={() => onNavigate('register')}>
            <Text style={[styles.registerLink, { color: '#00b690' }]}>
              Criar meu cadastro
            </Text>
          </TouchableOpacity>
        </View>
      </FadeInItem>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 28,
    justifyContent: 'center',
  },
  contentCompact: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 22,
    gap: 6,
  },
  logoImg: {
    width: 264,
    height: 156,
    marginTop: -12,
    marginBottom: -10,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
  },
  card: {
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
  },
  cardCompact: {
    padding: 18,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  formGroup: {
    marginBottom: 14,
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
    paddingVertical: 13,
    borderRadius: 16,
    fontSize: 15,
    borderWidth: 1.5,
    fontWeight: '600',
  },
  passwordWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 44,
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
    paddingVertical: 15,
    borderRadius: 18,
    marginTop: 6,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  feedbackBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  feedbackText: {
    fontSize: 12,
    lineHeight: 18,
  },
  bottomRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
  },
  bottomText: {
    fontSize: 13,
  },
  registerLink: {
    fontSize: 13,
    fontWeight: '800',
  },
});
