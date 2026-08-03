// ============================================================
// CS Ag OS — Hub de Inteligência Artificial Unificado
// Prioridade: Gemini (gratuito) → OpenAI GPT-4o-mini (fallback)
//
// As chaves de API NÃO ficam mais aqui. Antes elas eram lidas via
// VITE_GEMINI_API_KEY / VITE_OPENAI_API_KEY e iam parar no bundle JS
// público — qualquer pessoa conseguia extrair pelo DevTools. Agora
// toda chamada passa pela Edge Function `ai-chat`, que guarda as
// chaves como secret no servidor e exige um usuário autenticado.
// ============================================================

import { supabase, isSupabaseConfigured } from './supabase';

// "Configurado" agora depende só do Supabase estar disponível — é ele
// quem decide, do lado do servidor, se Gemini e/ou OpenAI estão
// disponíveis. Sem Supabase, não tem como chamar a Edge Function.
export const isGeminiConfigured = isSupabaseConfigured;
export const isOpenAIConfigured = isSupabaseConfigured;
export const isAIConfigured = isSupabaseConfigured;

// Sistema de contexto da agência injetado em todos os agentes
const AGENCY_CONTEXT = `
Você é um assistente de IA integrado ao CS Ag OS, o sistema operacional interno da agência de comunicação "Comunicação Social Ag" (comunicacaosocialag.com.br).
Você tem acesso ao contexto da agência e deve agir como um especialista em marketing digital, comunicação e gestão de projetos criativos.
Seja direto, prático e profissional. Responda sempre em português brasileiro.
Clientes ativos da agência: Ponto Cor (armarinho e aviamentos), TechStart App (tecnologia), Café Blend (cafeteria premium), Clínica Sorriso (saúde).
`;

const AGENT_CONTEXTS = {
  brief: `${AGENCY_CONTEXT}
Sua função atual: Assistente de Briefing.
Você transforma pedidos vagos dos clientes em briefings estruturados e completos.
Ao receber uma descrição de projeto, gere um briefing profissional com: Objetivo, Público-alvo, Canais, Tom de voz, Entregas sugeridas e Prazo estimado.
Formate o briefing de forma clara e estruturada.`,

  content: `${AGENCY_CONTEXT}
Sua função atual: Gerador de Conteúdo.
Você cria copies, legendas, roteiros e textos para redes sociais baseados no briefing e na identidade visual de cada cliente.
Sempre ofereça múltiplas opções (mínimo 3) com diferentes abordagens (emocional, direto, minimalista).
Adapte o tom para cada cliente.`,

  analyst: `${AGENCY_CONTEXT}
Sua função atual: Analista de Desempenho.
Você interpreta dados de campanhas (Meta Ads, Google Analytics, Reportei) e sugere otimizações práticas.
Quando receber métricas, identifique padrões, gargalos e oportunidades, e sugira ações concretas com impacto estimado.`,

  campaign: `${AGENCY_CONTEXT}
Sua função atual: Gerador de Campanhas.
Você cria fluxos completos de tarefas para campanhas de marketing.
Quando solicitado, gere uma lista de tarefas estruturadas em JSON com: title, client, assigned_to (Bruno/Carlos/Ana), status (backlog/briefing), deadline (calcule a partir do prazo final), tag (Social Media/Branding/Vídeo/Web/Campanha).
SEMPRE responda com uma explicação breve seguida de um bloco JSON válido com array "tasks".
Exemplo de formato:
Aqui está o fluxo para a campanha:
\`\`\`json
{"tasks": [{"title": "...", "client": "...", "assigned_to": "...", "status": "briefing", "deadline": "2026-05-10", "tag": "Social Media"}]}
\`\`\``,
};

/**
 * Hub unificado: chama a Edge Function `ai-chat`, que decide no servidor
 * se usa Gemini ou OpenAI (fallback automático já acontece lá dentro).
 */
export async function chatWithAgent(agentId, conversationHistory, userMessage, preferredProvider = 'auto') {
  if (!isSupabaseConfigured) {
    throw new Error('IA indisponível: Supabase não configurado (a Edge Function de IA depende dele).');
  }

  const systemPrompt = AGENT_CONTEXTS[agentId] || AGENCY_CONTEXT;

  const { data, error } = await supabase.functions.invoke('ai-chat', {
    body: { systemPrompt, conversationHistory, userMessage, preferredProvider },
  });

  if (error) throw new Error(error.message || 'Falha ao chamar a IA.');
  if (data?.error) throw new Error(data.error);

  return parseAgentResponse(agentId, data.text, data.provider);
}

/**
 * Processa a resposta do agente (extrai JSON se for o agente de campanha).
 */
function parseAgentResponse(agentId, text, provider) {
  if (agentId === 'campaign') {
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        const cleanText = text.replace(/```json[\s\S]*?```/g, '').trim();
        return { text: cleanText, tasks: parsed.tasks || [], provider };
      } catch (e) {
        // fall through
      }
    }
  }

  return { text, provider };
}

export async function generateContent(prompt) {
  const res = await chatWithAgent('brief', [], prompt);
  return res.text;
}
