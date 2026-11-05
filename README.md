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

O SEDA1 é um diário de saúde. Ele não confirma agendamentos nem acessa dados do SUS ou Gov.br. As faixas exibidas são referências gerais; metas e decisões clínicas devem ser definidas com um profissional de saúde.
