// ============================================================
// CS Ag OS — Módulo de IA Unificado (OpenAI ChatGPT)
// Usa GPT-4o-mini como fallback ou complemento ao Gemini
// ============================================================

const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export const isOpenAIConfigured = !!OPENAI_KEY;

if (!OPENAI_KEY) {
  console.warn('[CS Ag OS] OpenAI não configurado. Adicione VITE_OPENAI_API_KEY no .env');
}

/**
 * Chama a API do ChatGPT via REST (sem SDK para manter o bundle leve).
 * @param {string} systemPrompt - Instrução de sistema para o agente
 * @param {Array} messages - Histórico [{role: 'user'|'assistant', content: '...'}]
 * @param {string} userMessage - Mensagem atual do usuário
 * @returns {Promise<{text: string}>}
 */
export async function chatWithOpenAI(systemPrompt, messages = [], userMessage) {
  if (!OPENAI_KEY) {
    throw new Error('OpenAI não configurado. Adicione VITE_OPENAI_API_KEY no .env');
  }

  const body = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({
        role: m.role === 'ai' ? 'assistant' : m.role === 'model' ? 'assistant' : m.role || 'user',
        content: m.text || m.content || '',
      })),
      { role: 'user', content: userMessage },
    ],
    temperature: 0.7,
    max_tokens: 2048,
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`OpenAI Error ${response.status}: ${err.error?.message || 'Falha na requisição'}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';

  return { text, provider: 'openai' };
}

/**
 * Gera um plano estratégico de 3 meses com alto nível de especialidade.
 * @param {Object} client - Dados do cliente
 * @param {string} answers - Respostas do formulário/briefing
 * @returns {Promise<{text: string}>}
 */
export async function generateStrategicPlan(client, answers) {
  if (!OPENAI_KEY) {
    throw new Error('OpenAI não configurado. Adicione VITE_OPENAI_API_KEY no .env');
  }

  const systemPrompt = `Você é um Chief Marketing Officer (CMO) e Estrategista de Crescimento de classe mundial, com profundo conhecimento em Growth Hacking, Marketing Digital, Vendas, Tecnologia, IA, Estratégia Corporativa, Administração de Empresas, Business Intelligence e Criatividade. Você tem visão crítica e analisa o mercado com base nas maiores empresas globais de cada segmento.

Sua tarefa é analisar o "Business Core" e as dores de um cliente e gerar um Plano Estratégico de Crescimento de 3 meses de altíssimo nível.
Formate a resposta estritamente em Markdown limpo, estruturado, usando negrito, itálico e listas. Seja pragmático, não use introduções prolixas.

O plano DEVE conter:
- Visão Geral da Estratégia (Diagnóstico rápido e pragmático)
- Mês 1: Setup, Alinhamento e Tração Inicial (Quick Wins)
- Mês 2: Escala, Conversão e Otimização de Funil (Aumento de LTV, Redução de CAC)
- Mês 3: Retenção, Business Intelligence e Automação com IA (Fidelização e Upsell)
- KPIs Críticos a monitorar.

DADOS DO CLIENTE:
Nome: ${client.name || 'Desconhecido'}
Público Alvo: ${client.target_audience || 'Não definido'}
Tom de Voz: ${client.tone_of_voice || 'Não definido'}`;

  const userMessage = `RESPOSTAS DO BRIEFING/FORMS DO CLIENTE:\n"${answers}"\n\nPor favor, atue como o CMO de elite e gere o plano estratégico estruturado de 3 meses (90 dias).`;

  // Força max_tokens maior para garantir que caiba o plano de 3 meses
  const body = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.7,
    max_tokens: 3000,
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`OpenAI Error ${response.status}: ${err.error?.message || 'Falha na requisição'}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';

  return { text, provider: 'openai' };
}
