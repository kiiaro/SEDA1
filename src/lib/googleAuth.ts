import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

export async function startGoogleSignIn() {
  const redirectTo = Linking.createURL('auth/callback');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;
  if (!data.url) throw new Error('O Google não retornou o link de acesso.');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success' || !result.url) return null;

  const callback = Linking.parse(result.url);
  const code = typeof callback.queryParams?.code === 'string' ? callback.queryParams.code : '';
  if (!code) {
    const message = typeof callback.queryParams?.error_description === 'string'
      ? callback.queryParams.error_description
      : 'A autorização do Google não foi concluída.';
    throw new Error(message);
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
  if (sessionError) throw sessionError;
  return sessionData.user;
}

export function friendlyAuthError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? '');
  const normalized = message.toLowerCase();
  if (normalized.includes('over_email_send_rate_limit') || normalized.includes('email rate limit') || normalized.includes('too many requests')) {
    return 'O limite de envio de e-mails do SEDA foi atingido. Aguarde antes de tentar novamente. Para normalizar os cadastros, o responsável pelo projeto precisa configurar um serviço SMTP no Supabase.';
  }
  if (normalized.includes('email address not authorized')) {
    return 'O envio de e-mail está no modo de teste do Supabase. Configure SMTP próprio ou use um endereço autorizado da equipe do projeto.';
  }
  if (normalized.includes('provider is not enabled') || normalized.includes('unsupported provider') || normalized.includes('google provider')) {
    return 'O acesso Google ainda precisa ser ativado em Authentication → Sign In / Providers no projeto Supabase, com as credenciais OAuth do Google.';
  }
  return message || 'Não foi possível concluir a autenticação. Tente novamente.';
}
