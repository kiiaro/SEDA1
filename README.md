# SEDA1

Aplicativo Expo para registrar pressão, glicemia, consultas e contatos de apoio. Os dados são salvos no projeto Supabase **SEDA1** e cada conta acessa somente suas próprias linhas por meio de Row Level Security (RLS).

## Rodar localmente

1. Instale as dependências: `npm ci`.
2. Copie `.env.example` para `.env`.
3. Inicie com `npm run web`, `npm run android` ou `npm run ios`.

O esquema aplicado no Supabase está em [`supabase/schema.sql`](supabase/schema.sql). A URL e a chave publicável no `.env.example` pertencem ao projeto SEDA1; a chave secreta de serviço **não** deve ser usada no app. A confirmação de cadastro por e-mail depende das configurações de autenticação e URL de redirecionamento do projeto Supabase.

## Funcionalidades

- Cadastro, login, recuperação de senha e sessão persistente com Supabase Auth.
- Registros e gráficos de medições, consultas, contatos e alertas salvos por conta.
- Consulta registrada com data e horário válidos; mapa e link de teleconsulta abrem apenas quando cadastrados.
- Entrada por texto com prévia dos valores identificados. Não há reconhecimento de voz nativo.
- Emergência abre a ligação para o SAMU 192 ou para um contato cadastrado. O app não envia chamados automaticamente.
- Tema claro/escuro e opções de tamanho de texto.
- Transições suaves entre telas, respostas visuais ao toque, animação dos indicadores e atualização da tela inicial ao puxar para baixo. As animações respeitam a preferência de movimento reduzido do aparelho.

O SEDA1 é um diário de saúde. Ele não confirma agendamentos nem acessa dados do SUS ou Gov.br. As faixas exibidas são referências gerais; metas e decisões clínicas devem ser definidas com um profissional de saúde.

## APK para Android

O fluxo [Android APK](.github/workflows/android-apk.yml) gera um APK instalável em **Actions → Android APK → Artifacts → seda1-android-apk** após um push na branch de desenvolvimento ou em `main`. Baixe o arquivo ZIP do artefato, extraia o `.apk` e abra-o no celular Android para instalar.

Este APK de prévia usa a assinatura de desenvolvimento gerada no build. Para distribuir atualizações sem reinstalar o app ou publicá-lo na Play Store, configure uma chave de assinatura estável. O arquivo `eas.json` também está pronto para `eas build -p android --profile preview` quando uma conta Expo estiver conectada.
