// ============================================================
// CS Ag OS — Hub de Inteligência Artificial Unificado
// Prioridade: Gemini (gratuito) → OpenAI GPT-4o-mini (fallback)
// ============================================================

import { GoogleGenerativeAI } from '@google/generative-ai';
import { chatWithOpenAI, isOpenAIConfigured } from './openai';

const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!geminiKey && !isOpenAIConfigured) {
  console.warn(
    '[CS Ag OS] Nenhuma IA configurada. ' +
    'Adicione VITE_GEMINI_API_KEY e/ou VITE_OPENAI_API_KEY no .env'
  );
}

export const isGeminiConfigured = !!geminiKey;
export const isAIConfigured = !!geminiKey || isOpenAIConfigured;

const genAI = geminiKey ? new GoogleGenerativeAI(geminiKey) : null;

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
 * Hub unificado: tenta Gemini primeiro, fallback para OpenAI.
 */
export async function chatWithAgent(agentId, conversationHistory, userMessage, preferredProvider = 'auto') {
  const systemPrompt = AGENT_CONTEXTS[agentId] || AGENCY_CONTEXT;

  // Estratégia 1: Gemini (gratuito, prioridade)
  if (genAI && (preferredProvider === 'auto' || preferredProvider === 'gemini')) {
    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: systemPrompt,
      });

      const chat = model.startChat({
        history: conversationHistory.map(msg => ({
          role: msg.role === 'ai' ? 'model' : 'user',
          parts: [{ text: msg.text || '' }],
        })),
      });

      const result = await chat.sendMessage(userMessage);
      const text = result.response.text();

      return parseAgentResponse(agentId, text, 'gemini');
    } catch (geminiError) {
      if (preferredProvider === 'gemini') {
        throw new Error(`Gemini indisponível: ${geminiError.message}`);
      }
      console.warn('[AI Hub] Gemini falhou, tentando OpenAI...', geminiError.message);
      // Fall through to OpenAI
    }
  }

  // Estratégia 2: OpenAI (fallback pago ou forçado)
  if (isOpenAIConfigured && (preferredProvider === 'auto' || preferredProvider === 'gpt')) {
    try {
      const result = await chatWithOpenAI(systemPrompt, conversationHistory, userMessage);
      return parseAgentResponse(agentId, result.text, 'openai');
    } catch (openAIError) {
      console.error('[AI Hub] OpenAI falhou:', openAIError.message);
      throw openAIError;
    }
  }

  throw new Error('Nenhuma IA configurada ou o provedor selecionado não está disponível.');
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

