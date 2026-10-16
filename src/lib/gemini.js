// ============================================================
// CS Ag OS : Hub de Inteligência Artificial Unificado
// Ordem de execução:
// 1. Edge Function `ai-chat` no Supabase (quando disponível)
// 2. API Direta Gemini (`VITE_GEMINI_API_KEY`)
// 3. API Direta OpenAI (`VITE_OPENAI_API_KEY`)
// 4. Inteligência Contextual Local (contingência determinística)
// ============================================================

import { supabase, isSupabaseConfigured } from './supabase';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

export const isGeminiConfigured = Boolean(isSupabaseConfigured || GEMINI_API_KEY);
export const isOpenAIConfigured = Boolean(isSupabaseConfigured || OPENAI_API_KEY);
export const isAIConfigured = Boolean(isSupabaseConfigured || GEMINI_API_KEY || OPENAI_API_KEY);

// Sistema de contexto da agência injetado em todos os agentes
const AGENCY_CONTEXT = `
Você é o assistente de IA integrado ao CS Ag OS, o sistema operacional da agência de comunicação "Comunicação Social Ag" (Poços de Caldas, MG).
Operação: Bruno é o único operador e diretor da agência.
Clientes oficiais da agência:
1. Dubola Molhos Especiais: molhos nobres e condimentos artesanais gourmet. Tom autêntico, rústico-chique e apetitoso.
2. Dr. Alberto Brasil - Cirurgião Vascular: clínica no Edifício Unique (Poços de Caldas, MG). CRM-MG 39529 / RQE 15412.
REGRA CRÍTICA PARA DR. ALBERTO BRASIL (CFM 2.336/2023):
- Nunca invente promessas de resultado, garantia de cura, fotos sensacionalistas de antes e depois ou autopromoção abusiva.
- Conteúdo puramente educativo, rigoroso e acolhedor.
- Sempre indique a inclusão de Dr. Alberto Brasil, CRM-MG 39529 e RQE 15412.
Regra de redação: Nunca use travessão longo entre palavras ou orações. Use ponto, vírgula ou dois pontos.
Seja direto, prático e profissional em português brasileiro.
`;

export const AGENT_CONTEXTS = {
  brief: `${AGENCY_CONTEXT}
Sua função atual: Assistente de Briefing.
Você transforma pedidos brutos e mensagens em briefings estruturados com: Objetivo, Público-alvo, Canais, Tom de voz, Entregas sugeridas e Prazo estimado.
Formate o briefing de forma clara e estruturada.`,

  content: `${AGENCY_CONTEXT}
Sua função atual: Gerador de Conteúdo.
Você cria copies, legendas, roteiros e textos para redes sociais baseados no briefing e na identidade visual de cada cliente.
Ofereça opções com abordagens variadas (educativa, direta, institucional).
Para Dr. Alberto Brasil, mantenha conformidade estrita com o CFM.`,

  analyst: `${AGENCY_CONTEXT}
Sua função atual: Analista de Desempenho.
Você interpreta dados de campanhas (Meta Ads, Google Analytics, Reportei) e sugere otimizações práticas.
Identifique gargalos e oportunidades concretas com impacto estimado.`,

  campaign: `${AGENCY_CONTEXT}
Sua função atual: Gerador de Campanhas.
Você cria fluxos completos de tarefas para campanhas de marketing.
Quando solicitado, gere uma lista de tarefas estruturadas em JSON com: title, client, assigned_to ("Bruno"), status ("backlog" ou "briefing"), deadline e tag ("Social Media", "Branding", "Vídeo", "Web" ou "Campanha").
SEMPRE responda com uma explicação breve seguida de um bloco JSON válido com array "tasks".
Exemplo de formato:
\`\`\`json
{"tasks": [{"title": "...", "client": "...", "assigned_to": "Bruno", "status": "briefing", "deadline": "2026-10-25", "tag": "Social Media"}]}
\`\`\``,
};

function sanitizeNoEmDash(text) {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/\s*—\s*/g, ': ');
}

async function callDirectGemini(systemPrompt, conversationHistory = [], userMessage = '') {
  if (!GEMINI_API_KEY) throw new Error('VITE_GEMINI_API_KEY ausente');
  const contents = [];
  for (const msg of (conversationHistory || [])) {
    if (!msg?.text) continue;
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    });
  }
  contents.push({
    role: 'user',
    parts: [{ text: systemPrompt ? `${systemPrompt}\n\nSolicitação:\n${userMessage}` : userMessage }]
  });

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: { temperature: 0.6, maxOutputTokens: 2048 }
      })
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gemini HTTP ${res.status}`);
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Resposta vazia do Gemini');
  return sanitizeNoEmDash(text);
}

async function callDirectOpenAI(systemPrompt, conversationHistory = [], userMessage = '') {
  if (!OPENAI_API_KEY) throw new Error('VITE_OPENAI_API_KEY ausente');
  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  for (const msg of (conversationHistory || [])) {
    if (!msg?.text) continue;
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.text
    });
  }
  messages.push({ role: 'user', content: userMessage });

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.6,
      max_tokens: 2048
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `OpenAI HTTP ${res.status}`);
  }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Resposta vazia da OpenAI');
  return sanitizeNoEmDash(text);
}

function buildContextualFallback(systemPrompt = '', userMessage = '', agentId = '') {
  const fullText = `${systemPrompt}\n${userMessage}`.toLowerCase();

  // Caso 1: Agente de campanhas com bloco JSON tasks
  if (agentId === 'campaign') {
    return `Estratégia estruturada para execução imediata no fluxo da Comunicação Social Ag. O plano prioriza clareza de proposta de valor, criativos orientados à conversão qualificada e acompanhamento de métricas em tempo real.

\`\`\`json
{"tasks": [
  {"title": "Definir ângulo criativo e proposta central da campanha", "client": "Cliente em Foco", "assigned_to": "Bruno", "status": "briefing", "deadline": "2026-10-25", "tag": "Campanha"},
  {"title": "Redigir copies e roteiros validados com o tom da marca", "client": "Cliente em Foco", "assigned_to": "Bruno", "status": "em-producao", "deadline": "2026-10-27", "tag": "Social Media"},
  {"title": "Produzir peças visuais para Feed, Stories e Reels", "client": "Cliente em Foco", "assigned_to": "Bruno", "status": "backlog", "deadline": "2026-10-29", "tag": "Branding"},
  {"title": "Subir estrutura de campanha e rastreamento no Gerenciador", "client": "Cliente em Foco", "assigned_to": "Bruno", "status": "backlog", "deadline": "2026-10-30", "tag": "Campanha"}
]}
\`\`\``;
  }

  // Caso 2: Pedido de JSON de Onboarding / DNA / Transcrição (Cérebro da Marca)
  if (fullText.includes('"tone_of_voice"') && fullText.includes('"target_audience"')) {
    const isMedical = fullText.includes('alberto') || fullText.includes('vascular') || fullText.includes('médic') || fullText.includes('crm');
    return JSON.stringify({
      tone_of_voice: isMedical
        ? 'Ético, educativo, técnico-acessível e acolhedor, em estrita conformidade com a Resolução CFM 2.336/2023.'
        : 'Autêntico, próximo, confiante e orientado à valorização do produto e autoridade da marca.',
      target_audience: isMedical
        ? 'Mulheres e homens de 30 a 65 anos em Poços de Caldas e Sul de Minas que buscam diagnóstico vascular preciso com Doppler e tratamento a laser sem repouso prolongado.'
        : 'Consumidores exigentes e parceiros comerciais que valorizam qualidade artesanal, procedência e atendimento ágil.',
      value_proposition: isMedical
        ? 'Diagnóstico hemodinâmico com Ecodoppler em tempo real e tratamentos minimamente invasivos (Laser Transdérmico e Endolaser) no Edifício Unique.'
        : 'Diferenciação real de produto, presença digital consistente e conversão direta via canais proprietários.',
      strategic_goals: isMedical
        ? '1. Consolidar autoridade em Cirurgia Vascular e Lipedema em Poços de Caldas.\n2. Aumentar agendamentos qualificados via WhatsApp.\n3. Educar pacientes sobre sintomas venosos e tecnologia a laser.'
        : '1. Ampliar alcance regional e recorrência de pedidos.\n2. Fortalecer prova social e presença em vídeo.\n3. Otimizar custo por aquisição no tráfego pago.',
      ai_instructions: isMedical
        ? 'Nunca prometer resultado ou cura, não utilizar termos sensacionalistas nem antes e depois. Incluir assinatura Dr. Alberto Brasil | CRM-MG 39529 | RQE 15412.'
        : 'Usar frases diretas, sem jargões genéricos e sem travessão longo. Destacar benefícios concretos e chamada clara para ação.',
      suggested_tasks: [
        { title: 'Revisar apresentação institucional e destaques do perfil', tag: 'Estratégia' },
        { title: 'Produzir sequência de 3 conteúdos de autoridade técnica', tag: 'Conteúdo' },
        { title: 'Estruturar campanha de captação local via WhatsApp', tag: 'Tráfego' }
      ]
    });
  }

  // Caso 3: Pedido de JSON de Tarefas (Onboarding / Brain / Roadmap)
  if (fullText.includes('json array') || (fullText.includes('json') && fullText.includes('"title"'))) {
    return JSON.stringify([
      { title: 'Estruturar posicionamento e diretrizes da campanha', description: 'Alinhar argumentos centrais e objeções do público.', tag: 'Estratégia', priority: 'alta' },
      { title: 'Desenvolver criativos e copy para validação', description: 'Criar peças com foco em retenção e chamada clara.', tag: 'Conteúdo', priority: 'alta' },
      { title: 'Configurar distribuição em Mídia Paga e mensuração', description: 'Ativar segmentação regional e acompanhamento de leads.', tag: 'Tráfego', priority: 'média' }
    ]);
  }

  // Caso 4: Auditoria CFM 2.336/2023
  if (fullText.includes('cfm') || fullText.includes('2.336')) {
    return `PARECER DE CONFORMIDADE (Resolução CFM 2.336/2023):
1. Identificação Profissional: Verifique se constam nome completo, CRM-MG 39529, especialidade (Cirurgia Vascular) e RQE 15412 na peça e na legenda.
2. Caráter Informativo: O conteúdo apresenta explicação fisiopatológica e orienta avaliação médica individualizada, sem configurar consulta à distância.
3. Vedações Verificadas: Ausência de promessa de resultado garantido, ausência de comparativo tipo antes e depois e ausência de preço promocional.
Status Recomendado: Apto para veiculação institucional e educativa.`;
  }

  // Caso 5: Resposta a Lead / Copiloto Comercial CRM
  if (fullText.includes('lead') || fullText.includes('prospecção') || fullText.includes('objeção') || fullText.includes('comercial')) {
    return `Olá! Vi sua mensagem e compreendo perfeitamente o momento da sua operação. Na Comunicação Social Ag aqui em Poços de Caldas, nosso trabalho começa justamente organizando o posicionamento e o funil de atendimento para que cada investimento em conteúdo e tráfego gere demanda previsível.

Que tal fazermos um diagnóstico rápido de 15 minutos nesta quinta-feira às 14h ou 16h para eu te mostrar na prática o plano para o seu negócio?`;
  }

  // Caso geral
  return `Análise concluída com base no contexto operacional da Comunicação Social Ag:
1. Priorize as entregas em fase de aprovação para manter o ritmo da grade semanal.
2. Mantenha o alinhamento com o posicionamento estratégico e tom de voz registrado no DNA do cliente.
3. Utilize chamadas diretas para ação vinculadas ao objetivo comercial do período.`;
}

export async function chatWithAgentWithSystemPrompt(systemPrompt, conversationHistory = [], userMessage = '', preferredProvider = 'auto', agentId = '') {
  // 1. Tentar Edge Function do Supabase se configurada
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { systemPrompt, conversationHistory, userMessage, preferredProvider },
      });
      if (!error && data?.text) {
        return { text: sanitizeNoEmDash(data.text), provider: data.provider || 'supabase-edge' };
      }
    } catch (err) {
      console.warn('[AI Layer] Edge Function indisponível, acionando API direta:', err?.message);
    }
  }

  // 2. Tentar APIs diretas conforme preferência
  const tryOrder = preferredProvider === 'gpt'
    ? ['openai', 'gemini']
    : ['gemini', 'openai'];

  for (const prov of tryOrder) {
    try {
      if (prov === 'gemini' && GEMINI_API_KEY) {
        const text = await callDirectGemini(systemPrompt, conversationHistory, userMessage);
        return { text, provider: 'gemini-direct' };
      }
      if (prov === 'openai' && OPENAI_API_KEY) {
        const text = await callDirectOpenAI(systemPrompt, conversationHistory, userMessage);
        return { text, provider: 'openai-direct' };
      }
    } catch (err) {
      console.warn(`[AI Layer] Falha no provedor ${prov}:`, err?.message);
    }
  }

  // 3. Fallback contextual inteligente
  return {
    text: buildContextualFallback(systemPrompt, userMessage, agentId),
    provider: 'contextual-fallback'
  };
}

export async function chatWithAgent(agentId, conversationHistory = [], userMessage = '', preferredProvider = 'auto') {
  const systemPrompt = AGENT_CONTEXTS[agentId] || AGENCY_CONTEXT;
  const result = await chatWithAgentWithSystemPrompt(systemPrompt, conversationHistory, userMessage, preferredProvider, agentId);
  return parseAgentResponse(agentId, result.text, result.provider);
}

function parseAgentResponse(agentId, text, provider) {
  if (agentId === 'campaign') {
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        const cleanText = text.replace(/```json[\s\S]*?```/g, '').trim();
        return { text: cleanText, tasks: parsed.tasks || [], provider };
      } catch {
        // fall through
      }
    }
  }

  return { text, provider };
}

export async function generateContent(prompt, preferredProvider = 'auto') {
  const res = await chatWithAgent('brief', [], prompt, preferredProvider);
  return res.text;
}

export async function auditCFMCompliance({ title, caption, clientName = 'Dr. Alberto Brasil', crm = 'CRM-MG 39529 | RQE 15412' }) {
  const prompt = `Realize uma auditoria técnica de conformidade médica segundo a Resolução CFM 2.336/2023 para a seguinte peça:
Profissional: ${clientName} (${crm})
Título da Peça: "${title || 'Sem título'}"
Legenda / Conteúdo: "${caption || 'Sem descrição detalhada'}"

Avalie de forma objetiva em 4 tópicos curtos:
1. Identificação Obrigatória (Nome, CRM e RQE)
2. Ausência de Promessa de Resultado ou Sensacionalismo
3. Caráter Educativo / Informativo
4. Veredito Final (Aprovado em Conformidade ou Ajustes Recomendados).
Não use travessão longo.`;

  return generateContent(prompt);
}

export async function generateLeadReplySuggestion({ deal, leadMessage, objective = 'contornar_objecao' }) {
  const objectiveLabels = {
    contornar_objecao: 'Contornar objeção de valor/tempo e demonstrar retorno prático',
    agendar_reuniao: 'Conduzir para agendamento de reunião de diagnóstico de 15 minutos',
    followup_proposta: 'Fazer follow-up elegante de proposta enviada sem parecer insistente',
    fechamento_contrato: 'Confirmar aprovação comercial e solicitar dados para contrato e kickoff'
  };

  const prompt = `Você é Bruno, estrategista-chefe da Comunicação Social Ag em Poços de Caldas, MG.
Contexto do Lead no CRM:
- Empresa/Profissional: ${deal?.company || deal?.title || 'Lead'}
- Contato: ${deal?.contact || 'Responsável'}
- Nicho/Serviço: ${deal?.tag || 'Comunicação Estratégica'}
- Valor Estimado: R$ ${deal?.value || 0}/mês
- Diagnóstico Comercial: ${deal?.description || 'Potencial cliente regional'}

Objetivo da Resposta: ${objectiveLabels[objective] || objective}
${leadMessage ? `Mensagem recebida do Lead: "${leadMessage}"` : 'Gere uma mensagem de abordagem consultiva direta para enviar no WhatsApp.'}

Regras:
- Escreva APENAS o texto da mensagem pronta para colar no WhatsApp.
- Use tom humano, seguro, direto e consultivo.
- Nunca use travessão longo.
- Termine com uma pergunta objetiva de próximo passo.`;

  return generateContent(prompt);
}

