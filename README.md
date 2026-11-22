# SEDA

Aplicativo Expo para registrar pressão, glicemia, consultas e contatos de apoio. Os dados são salvos no projeto Supabase e cada conta acessa somente suas próprias linhas por meio de Row Level Security (RLS).

## Rodar localmente

1. Instale as dependências: `npm ci`.
2. Copie `.env.example` para `.env`.
3. Inicie com `npm run web`, `npm run android` ou `npm run ios`.

O esquema inicial está em [`supabase/schema.sql`](supabase/schema.sql), e as alterações incrementais ficam em [`supabase/migrations`](supabase/migrations). A URL e a chave publicável no `.env.example` pertencem ao projeto configurado; a chave secreta de serviço **não** deve ser usada no app. A confirmação de cadastro por e-mail depende das configurações de autenticação e URL de redirecionamento do projeto Supabase.

## Funcionalidades

- Cadastro, login, recuperação de senha e sessão persistente com Supabase Auth.
- Painel profissional com agenda, pacientes conectados e atalhos para conversas.
- Rede profissional composta somente por pacientes que aceitam um convite válido por sete dias.
- Chat ao vivo entre paciente e profissional conectado, com histórico salvo e acesso protegido por RLS.
- Registros e gráficos de medições, consultas, contatos e alertas salvos por conta.
- Consulta registrada com data e horário válidos; mapa e link de teleconsulta abrem apenas quando cadastrados.
- Entrada por texto com prévia dos valores identificados. Não há reconhecimento de voz nativo.
- Emergência abre a ligação para o SAMU 192 ou para um contato cadastrado. O app não envia chamados automaticamente.
- Tema claro/escuro e opções de tamanho de texto.
- Transições suaves entre telas, respostas visuais ao toque, animação dos indicadores e atualização da tela inicial ao puxar para baixo. As animações respeitam a preferência de movimento reduzido do aparelho.
- Formulários ajustados para telas estreitas, com área segura e rolagem para manter o campo ativo visível acima do teclado.

O chat exige as migrações em [`supabase/migrations`](supabase/migrations). O paciente precisa aceitar o código gerado pelo profissional; essa ação cria o vínculo e libera o chat privado entre as duas contas.

O SEDA é um diário de saúde. Ele não confirma agendamentos nem acessa dados do SUS ou Gov.br. As faixas exibidas são referências gerais; metas e decisões clínicas devem ser definidas com um profissional de saúde.

## Verificação

Execute `npm run lint`, `npx expo-doctor` e `npm run build`. O workflow do APK executa esses passos antes da compilação Android. Em um aparelho, confira login, cadastro, consultas e contatos com o teclado aberto; teste também a rolagem e o tamanho de texto ampliado.

## APK para Android

O fluxo [Android APK](.github/workflows/android-apk.yml) gera um APK instalável em **Actions → Android APK → Artifacts → seda-android-apk** após um push na branch de desenvolvimento ou em `main`. Baixe o arquivo ZIP do artefato, extraia o `.apk` e abra-o no celular Android para instalar.

Este APK de prévia usa a assinatura de desenvolvimento gerada no build. Para distribuir atualizações sem reinstalar o app ou publicá-lo na Play Store, configure uma chave de assinatura estável. O arquivo `eas.json` também está pronto para `eas build -p android --profile preview` quando uma conta Expo estiver conectada.
