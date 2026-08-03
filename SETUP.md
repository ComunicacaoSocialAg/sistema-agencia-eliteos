# CS Ag OS — Guia de Ativação Completa

## Status Atual
O sistema já funciona em **Modo Demonstração** localmente.
Para ativar o back-end real (dados persistentes, autenticação, IA), siga os 3 passos abaixo.

---

## PASSO 1 — Criar o banco de dados (Supabase) — ~10 minutos

1. Acesse https://supabase.com e crie uma conta gratuita
2. Clique em **"New Project"**, dê um nome (ex: `csagos`) e escolha a senha do banco
3. Aguarde o projeto inicializar (~2 minutos)
4. No menu lateral, clique em **"SQL Editor"** → **"New Query"**
5. Copie e cole TODO o conteúdo do arquivo `supabase/schema.sql` deste projeto
6. Clique em **"Run"** — o banco e os dados de demonstração serão criados

---

## PASSO 2 — Configurar as variáveis de ambiente — ~5 minutos

1. Na raiz do projeto, copie o arquivo de exemplo:
```bash
cp .env.example .env
```

2. No Supabase, vá em **Settings → API** e copie:
   - **Project URL** → cole em `VITE_SUPABASE_URL`
   - **anon public key** → cole em `VITE_SUPABASE_ANON_KEY`

Seu `.env` deve ficar assim:
```env
VITE_SUPABASE_URL=https://xyzxyz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Importante:** as chaves de IA (Gemini/OpenAI) **não vão nesse arquivo**. Elas
nunca devem ter o prefixo `VITE_`, porque tudo que começa com `VITE_` é
embutido no bundle JS público — qualquer pessoa que abrir o site consegue
extrair. As chaves de IA são configuradas como *secret* do lado do servidor,
no Passo 2.5 a seguir.

---

## PASSO 2.5 — Configurar a IA (Edge Function) — ~5 minutos

O sistema usa uma Edge Function do Supabase (`ai-chat`) como intermediária:
o frontend chama a função, e é ela quem tem a chave e fala com Gemini/OpenAI.
Isso impede que a chave vaze pelo navegador.

1. Instale a CLI do Supabase (se ainda não tiver): https://supabase.com/docs/guides/cli
2. Faça login e linke o projeto:
```bash
supabase login
supabase link --project-ref SEU_PROJECT_REF
```
3. Configure as chaves como secret (nunca vão pro `.env` do frontend):
```bash
supabase secrets set GEMINI_API_KEY=AIzaSy...
supabase secrets set OPENAI_API_KEY=sk-...
```
   (Gemini: https://aistudio.google.com/app/apikey · OpenAI: https://platform.openai.com/api-keys — pode configurar só um dos dois, o sistema usa o que estiver disponível)
4. Publique a função:
```bash
supabase functions deploy ai-chat
```

---

## PASSO 3 — Criar usuários reais (Supabase Auth) — ~5 minutos

1. No Supabase, vá em **Authentication → Users → "Add user"**
2. Crie os usuários da equipe (ex: `bruno@csag.com.br`)
3. Após criar, vá em **SQL Editor** e execute para definir os perfis:

```sql
-- Substitua o ID pelo UUID do usuário criado
INSERT INTO profiles (id, name, role) VALUES
  ('UUID-DO-BRUNO', 'Bruno', 'admin'),
  ('UUID-DA-DEISE', 'Deise', 'commercial');
```

---

## Rodando o sistema

```bash
npm run dev
```

Acesse http://localhost:5173

---

## Contas de demonstração (sem Supabase)

| E-mail | Papel | Acesso |
|---|---|---|
| admin@csag.com | Admin (Bruno) | Tudo |
| deise@csag.com | Comercial | CRM + Produção |
| producao@csag.com | Produção | Kanban + IA |
| cliente@pontocor.com | Cliente | Portal Ponto Cor |

**Senha de todas as contas demo:** `demo123`

---

## Deploy no seu domínio (comunicacaosocialag.com.br)

1. Crie uma conta em https://vercel.com (gratuito)
2. Importe o projeto do GitHub (ou arraste a pasta)
3. Em **Environment Variables**, adicione as mesmas variáveis do `.env` (só `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` — as chaves de IA são secret do Supabase, não da Vercel)
4. No seu registrador de domínio, aponte o DNS para a Vercel
5. Pronto — sistema disponível em `comunicacaosocialag.com.br` 🎉

---

## ⚠️ Se este sistema já esteve no ar antes desta atualização

As chaves `VITE_GEMINI_API_KEY` e `VITE_OPENAI_API_KEY` já foram embutidas no
bundle JS publicado (isso é o que este patch corrigiu). Se o site já esteve
publicado com essas variáveis configuradas, trate as chaves antigas como
comprometidas:
1. Revogue a chave antiga da OpenAI em https://platform.openai.com/api-keys e gere uma nova
2. Revogue/regenere a chave antiga do Gemini em https://aistudio.google.com/app/apikey
3. Configure as novas chaves só via `supabase secrets set` (Passo 2.5), nunca mais no `.env` do frontend
