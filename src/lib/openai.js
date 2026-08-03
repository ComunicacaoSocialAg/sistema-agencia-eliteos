// ============================================================
// CS Ag OS — Módulo de IA Unificado (OpenAI ChatGPT)
// Usa GPT-4o-mini como fallback ou complemento ao Gemini
//
// A chave da OpenAI (paga) não fica mais no frontend. Toda chamada
// passa pela Edge Function `ai-chat`, que guarda a chave como secret
// no servidor. Ver src/lib/gemini.js para o motivo completo.
// ============================================================

import { supabase, isSupabaseConfigured } from './supabase';

export const isOpenAIConfigured = isSupabaseConfigured;

/**
 * Chama o GPT-4o-mini via Edge Function (a chave nunca chega ao navegador).
 * @param {string} systemPrompt - Instrução de sistema para o agente
 * @param {Array} messages - Histórico [{role: 'user'|'assistant', content: '...'}]
 * @param {string} userMessage - Mensagem atual do usuário
 * @returns {Promise<{text: string, provider: string}>}
 */
export async function chatWithOpenAI(systemPrompt, messages = [], userMessage) {
  if (!isSupabaseConfigured) {
    throw new Error('IA indisponível: Supabase não configurado (a Edge Function de IA depende dele).');
  }

  const { data, error } = await supabase.functions.invoke('ai-chat', {
    body: { systemPrompt, conversationHistory: messages, userMessage, preferredProvider: 'gpt' },
  });

  if (error) throw new Error(error.message || 'Falha ao chamar a OpenAI.');
  if (data?.error) throw new Error(data.error);

  return { text: data.text, provider: data.provider };
}

/**
 * Gera um plano estratégico de 3 meses com alto nível de especialidade.
 * @param {Object} client - Dados do cliente
 * @param {string} answers - Respostas do formulário/briefing
 * @returns {Promise<{text: string, provider: string}>}
 */
export async function generateStrategicPlan(client, answers) {
  if (!isSupabaseConfigured) {
    throw new Error('IA indisponível: Supabase não configurado (a Edge Function de IA depende dele).');
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

  const { data, error } = await supabase.functions.invoke('ai-chat', {
    body: { systemPrompt, conversationHistory: [], userMessage, preferredProvider: 'gpt', maxTokens: 3000 },
  });

  if (error) throw new Error(error.message || 'Falha ao chamar a OpenAI.');
  if (data?.error) throw new Error(data.error);

  return { text: data.text, provider: data.provider };
}
