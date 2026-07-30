# Como Fazer o Deploy do CS Ag OS na Vercel

O sistema já está otimizado para o deploy na Vercel a **custo zero** e configurado para lidar tanto com o domínio principal quanto com o subdomínio do cliente.

## 1. Subindo o código para o GitHub
Para a Vercel conseguir construir o seu site, o código precisa estar no GitHub.
1. Crie uma conta no GitHub (se não tiver).
2. Crie um repositório privado chamado `cs-ag-os`.
3. Suba esta pasta de código para lá.

## 2. Configurando a Vercel
1. Acesse [vercel.com](https://vercel.com/) e faça login com seu GitHub.
2. Clique em **"Add New..."** > **"Project"**.
3. Selecione o repositório `cs-ag-os` que você acabou de criar.
4. Na tela de configuração (Configure Project):
   - **Framework Preset**: Selecione `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Environment Variables**:
   Adicione as chaves que estão no seu `.env`:
   - `VITE_SUPABASE_URL` = [sua url do supabase]
   - `VITE_SUPABASE_ANON_KEY` = [sua key anon do supabase]
   - `VITE_GEMINI_API_KEY` = [sua chave do gemini]
6. Clique em **Deploy** e aguarde 1-2 minutos.

---

## 3. Configurando os Domínios (A mágica do Subdomínio)
Agora que a aplicação está no ar com a URL padrão da Vercel (`cs-ag-os.vercel.app`), vamos conectar seus domínios da Hostinger.

1. No painel do seu projeto na Vercel, clique na aba **"Settings"**.
2. No menu esquerdo, clique em **"Domains"**.
3. Adicione o seu domínio principal: `comunicacaosocialag.com.br`
   - A Vercel vai te mostrar algumas entradas DNS (normalmente um A Record apontando para `76.76.21.21` e um CNAME).
4. Adicione o subdomínio do cliente: `cliente.comunicacaosocialag.com.br`
   - A Vercel vai te dar um CNAME apontando para `cname.vercel-dns.com`.

### 4. Apontando na Hostinger
1. Acesse sua conta na Hostinger.
2. Vá em **Gerenciar Domínio** > **Editor de Zona DNS**.
3. Adicione as entradas que a Vercel gerou:
   - Tipo: `A` | Nome: `@` | Aponta para: `76.76.21.21`
   - Tipo: `CNAME` | Nome: `www` | Aponta para: `cname.vercel-dns.com`
   - Tipo: `CNAME` | Nome: `cliente` | Aponta para: `cname.vercel-dns.com`
4. Salve. O tempo de propagação pode levar de 10 minutos a algumas horas.

### 5. Como funciona o Subdomínio para o Cliente?
A Vercel agora vai mandar tanto quem acessa `comunicacaosocialag.com.br` quanto quem acessa `cliente.comunicacaosocialag.com.br` para a **mesma** aplicação.
* A separação é feita no momento do login: quando o cliente entra com email e senha, a nossa arquitetura AuthContext identifica o cargo `role: 'client'` e trava a visualização dele exclusivamente no **Painel do Cliente**, escondendo completamente a Mesa de Produção, CRM, e Financeiro.
* Quando a Deise entrar, a plataforma inteira se abre.

Pronto! Seu OS de agência está no ar.
