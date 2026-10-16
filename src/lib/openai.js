// ============================================================
// CS Ag OS : Módulo de IA Unificado (OpenAI ChatGPT + Fallback)
// ============================================================

import { chatWithAgentWithSystemPrompt, isOpenAIConfigured as geminiOpenAIConfigured } from './gemini';

export const isOpenAIConfigured = geminiOpenAIConfigured;

export async function chatWithOpenAI(systemPrompt, messages = [], userMessage) {
  return chatWithAgentWithSystemPrompt(systemPrompt, messages, userMessage, 'gpt');
}

export async function generateStrategicPlan(client, answers) {
  const systemPrompt = `Você é um Chief Marketing Officer (CMO) e Estrategista de Crescimento da agência Comunicação Social Ag.
Sua tarefa é analisar o Business Core e as dores de um cliente e gerar um Plano Estratégico de Crescimento de 3 meses de altíssimo nível.
Formate a resposta estritamente em Markdown limpo, estruturado, usando negrito e listas. Seja pragmático, sem usar travessão longo.

O plano DEVE conter:
- Visão Geral da Estratégia (Diagnóstico rápido e pragmático)
- Mês 1: Setup, Alinhamento e Tração Inicial (Quick Wins)
- Mês 2: Escala, Conversão e Otimização de Funil (Aumento de LTV, Redução de CAC)
- Mês 3: Retenção, Business Intelligence e Automação com IA (Fidelização e Upsell)
- KPIs Críticos a monitorar.

DADOS DO CLIENTE:
Nome: ${client?.name || 'Desconhecido'}
Público Alvo: ${client?.target_audience || 'Não definido'}
Tom de Voz: ${client?.tone_of_voice || 'Não definido'}`;

  const userMessage = `RESPOSTAS DO BRIEFING/FORMS DO CLIENTE:\n"${answers}"\n\nPor favor, atue como o CMO de elite e gere o plano estratégico estruturado de 3 meses (90 dias).`;

  return chatWithAgentWithSystemPrompt(systemPrompt, [], userMessage, 'gpt');
}

