// ============================================================
// CS Ag OS — Edge Function: ai-chat
// Proxy autenticado para Gemini / OpenAI.
//
// Por que isso existe: antes, VITE_GEMINI_API_KEY e VITE_OPENAI_API_KEY
// eram lidas no frontend e embutidas no bundle JS público. Qualquer
// pessoa abrindo o DevTools no site publicado conseguia extrair as
// chaves e usá-las por conta própria, no cartão da agência. Agora as
// chaves ficam como secret aqui no servidor (nunca chegam ao navegador)
// e só respondem para usuários autenticados no Supabase.
//
// Deploy:
//   supabase functions deploy ai-chat
// Configurar as chaves (uma vez, no projeto Supabase):
//   supabase secrets set GEMINI_API_KEY=AIzaSy...
//   supabase secrets set OPENAI_API_KEY=sk-...
// ============================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

type HistoryMsg = { role?: string; text?: string; content?: string };

async function callGemini(
  systemPrompt: string,
  history: HistoryMsg[],
  userMessage: string,
) {
  const contents = [
    ...history.map((m) => ({
      role: m.role === "ai" || m.role === "model" ? "model" : "user",
      parts: [{ text: m.text || m.content || "" }],
    })),
    { role: "user", parts: [{ text: userMessage }] },
  ];

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: systemPrompt }] },
      }),
    },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gemini HTTP ${res.status}`);
  }

  const data = await res.json();
  const text = (data.candidates?.[0]?.content?.parts || [])
    .map((p: { text?: string }) => p.text || "")
    .join("");
  return text;
}

async function callOpenAI(
  systemPrompt: string,
  history: HistoryMsg[],
  userMessage: string,
  maxTokens: number,
) {
  const messages = [
    { role: "system", content: systemPrompt },
    ...history.map((m) => ({
      role: m.role === "ai" || m.role === "model" ? "assistant" : (m.role || "user"),
      content: m.text || m.content || "",
    })),
    { role: "user", content: userMessage },
  ];

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Exige um usuário autenticado no Supabase. Sem isso, essa função
    // vira um proxy de IA de graça pra qualquer um que descobrir a URL.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Não autenticado." }, 401);
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return json({ error: "Sessão inválida ou expirada." }, 401);
    }

    const body = await req.json();
    const {
      systemPrompt,
      conversationHistory = [],
      userMessage,
      preferredProvider = "auto",
      maxTokens = 2048,
    } = body;

    if (!systemPrompt || !userMessage) {
      return json({ error: "systemPrompt e userMessage são obrigatórios." }, 400);
    }

    // Estratégia 1: Gemini (gratuito, prioridade)
    if (GEMINI_API_KEY && (preferredProvider === "auto" || preferredProvider === "gemini")) {
      try {
        const text = await callGemini(systemPrompt, conversationHistory, userMessage);
        return json({ text, provider: "gemini" });
      } catch (geminiError) {
        if (preferredProvider === "gemini") {
          return json({ error: `Gemini indisponível: ${(geminiError as Error).message}` }, 502);
        }
        console.warn("[ai-chat] Gemini falhou, tentando OpenAI:", (geminiError as Error).message);
      }
    }

    // Estratégia 2: OpenAI (fallback pago ou forçado)
    if (OPENAI_API_KEY && (preferredProvider === "auto" || preferredProvider === "gpt")) {
      try {
        const text = await callOpenAI(systemPrompt, conversationHistory, userMessage, maxTokens);
        return json({ text, provider: "openai" });
      } catch (openAIError) {
        return json({ error: `OpenAI indisponível: ${(openAIError as Error).message}` }, 502);
      }
    }

    return json({ error: "Nenhuma IA configurada no servidor (defina GEMINI_API_KEY e/ou OPENAI_API_KEY via supabase secrets set)." }, 503);
  } catch (err) {
    return json({ error: (err as Error).message || "Erro interno" }, 500);
  }
});
