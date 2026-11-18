import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

interface ParsedLead {
  external_id?: string;
  company_name: string;
  contact?: string;
  segment?: string;
  city?: string;
  phone?: string;
  email?: string;
  website?: string;
  google_rating?: number;
  google_reviews?: number;
  estimated_value?: number;
  diagnosis?: string;
  outreach_message?: string;
  whatsapp_link?: string;
  next_action?: string;
  follow_up_on?: string;
}

function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
}

function parseCSV(text: string): string[][] {
  let cleanText = text;
  if (cleanText.charCodeAt(0) === 0xfeff) {
    cleanText = cleanText.slice(1);
  }

  const firstLine = cleanText.split(/\r\n|\n|\r/)[0] || "";
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semiCount = (firstLine.match(/;/g) || []).length;
  const delimiter = semiCount > commaCount ? ";" : ",";

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let p = 0;

  while (p < cleanText.length) {
    const c = cleanText[p];
    if (inQuotes) {
      if (c === '"') {
        if (p + 1 < cleanText.length && cleanText[p + 1] === '"') {
          field += '"';
          p += 2;
        } else {
          inQuotes = false;
          p++;
        }
      } else {
        field += c;
        p++;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
        p++;
      } else if (c === delimiter) {
        row.push(field);
        field = "";
        p++;
      } else if (c === "\r") {
        if (p + 1 < cleanText.length && cleanText[p + 1] === "\n") {
          p++;
        }
        row.push(field);
        field = "";
        rows.push(row);
        row = [];
        p++;
      } else if (c === "\n") {
        row.push(field);
        field = "";
        rows.push(row);
        row = [];
        p++;
      } else {
        field += c;
        p++;
      }
    }
  }

  if (field || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function mapRowsToLeads(rows: string[][]): ParsedLead[] {
  if (rows.length < 2) return [];

  const headers = rows[0].map(h => normalizeKey(h.trim()));
  const leads: ParsedLead[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0 || row.every(cell => !cell.trim())) {
      continue;
    }

    const dict: Record<string, string> = {};
    headers.forEach((h, idx) => {
      dict[h] = (row[idx] || "").trim();
    });

    const getVal = (...keys: string[]) => {
      for (const k of keys) {
        if (dict[k] !== undefined && dict[k] !== "") return dict[k];
      }
      return "";
    };

    const companyName = getVal(
      "empresa",
      "company",
      "company_name",
      "nome_da_empresa",
      "nome_empresa",
      "razao_social",
      "nome_fantasia",
      "clinica_empresa",
      "lead"
    );

    if (!companyName) continue;

    const externalId = getVal(
      "id",
      "external_id",
      "id_pipeline",
      "codigo",
      "lead_id",
      "id_prospect",
      "prospect_id",
      "csag_id"
    );

    const segment = getVal("segmento", "segment", "setor", "nicho", "ramo", "area");
    const city = getVal("cidade", "city", "municipio", "localizacao", "local", "cidade_uf");
    const phone = getVal("telefone", "phone", "celular", "telefone_whatsapp", "whatsapp_numero", "tel");
    const contact = getVal("contato", "contact", "nome_do_contato", "responsavel_contato");
    const email = getVal("email", "e_mail", "contato_email");
    const website = getVal("site", "website", "site_perfil", "url", "link", "site_atual", "instagram");
    
    const rawRating = getVal("google_rating", "nota_google", "avaliacao_google", "rating_google", "rating", "nota");
    const googleRating = rawRating ? parseFloat(rawRating.replace(",", ".")) : undefined;

    const rawReviews = getVal("google_reviews", "avaliacoes_google", "qtd_avaliacoes", "reviews_google", "reviews", "n_avaliacoes");
    const googleReviews = rawReviews ? parseInt(rawReviews.replace(/\D/g, ""), 10) : undefined;

    const rawValue = getVal("estimated_value", "valor_estimado", "valor", "ticket", "valor_mensal", "preco");
    const estimatedValue = rawValue
      ? parseFloat(rawValue.replace(/[^\d.,]/g, "").replace(/\.(?=\d{3})/g, "").replace(",", "."))
      : undefined;

    let diagnosis = getVal("diagnosis", "diagnostico", "dores", "analise", "observacoes_diagnostico");
    let nextAction = getVal("next_action", "proxima_acao", "acao", "status_acao", "prioridade", "proximo_passo");

    const passo1 = getVal("passo_1", "passo_1_recepcao", "recepcao", "abordagem_recepcao");
    const passo2 = getVal("passo_2", "passo_2_decisor", "decisor", "abordagem_decisor");
    let outreachMessage = getVal("outreach_message", "mensagem_de_abordagem", "abordagem", "pitch", "script_whatsapp", "texto_abordagem", "mensagem");

    if (!outreachMessage && (passo1 || passo2)) {
      const parts: string[] = [];
      if (passo1) {
        parts.push(passo1.startsWith("[PASSO 1") ? passo1 : `[PASSO 1 - RECEPÇÃO]: ${passo1}`);
      }
      if (passo2) {
        parts.push(passo2.startsWith("[PASSO 2") ? passo2 : `[PASSO 2 - DECISOR]: ${passo2}`);
      }
      outreachMessage = parts.join("\n\n");
    }

    const rawTop2 = getVal("top_2", "top_2_do_dia", "destaque", "prioridade_alta").toLowerCase();
    const isTop2 =
      rawTop2 === "sim" ||
      rawTop2 === "true" ||
      rawTop2 === "1" ||
      nextAction.includes("[TOP 2 DO DIA]") ||
      diagnosis.includes("[TOP 2 DO DIA]");

    if (isTop2 && !nextAction.includes("[TOP 2 DO DIA]")) {
      nextAction = `[TOP 2 DO DIA] ${nextAction || "Disparar Passo 1 no WhatsApp (Recepção)"}`;
    }

    let whatsappLink = getVal("link_whatsapp", "whatsapp_link", "link_whats", "link_do_whatsapp", "whatsapp_url");
    if (!whatsappLink && phone) {
      const clean = phone.replace(/\D/g, "");
      const number = clean.length === 10 || clean.length === 11 ? `55${clean}` : clean;
      if (number.length >= 10) {
        const textMsg = outreachMessage ? encodeURIComponent(outreachMessage) : "";
        whatsappLink = `https://wa.me/${number}${textMsg ? `?text=${textMsg}` : ""}`;
      }
    }

    leads.push({
      external_id: externalId || undefined,
      company_name: companyName,
      contact: contact || "Decisor / Comercial",
      segment: segment || undefined,
      city: city || undefined,
      phone: phone || undefined,
      email: email || undefined,
      website: website || undefined,
      google_rating: isNaN(googleRating as number) ? undefined : googleRating,
      google_reviews: isNaN(googleReviews as number) ? undefined : googleReviews,
      estimated_value: isNaN(estimatedValue as number) ? undefined : estimatedValue,
      diagnosis: diagnosis || undefined,
      outreach_message: outreachMessage || undefined,
      whatsapp_link: whatsappLink || undefined,
      next_action: nextAction || undefined,
    });
  }

  return leads;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Variáveis de ambiente do Supabase não configuradas." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const expectedSecret = Deno.env.get("PROSPECT_INGEST_SECRET") || "104256Br";
    const apiKey = req.headers.get("x-api-key");
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer /i, "").trim();

    let isAuthorized = apiKey === expectedSecret || token === expectedSecret;
    if (!isAuthorized && token && token !== Deno.env.get("SUPABASE_ANON_KEY")) {
      const { data: userData } = await supabase.auth.getUser(token);
      if (userData?.user) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ error: "Não autorizado para sincronizar prospects." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let bodyData: any = null;
    if (req.method === "POST") {
      try {
        bodyData = await req.json();
      } catch {
        bodyData = null;
      }
    }

    const sheetId = bodyData?.sheet_id || "1UcImjjGaZudXxBJhS0j4Jt3cY7TnwDQ9jLVsCRZdVZM";
    const sheetName = bodyData?.sheet_name || "Pipeline CRM";

    let csvContent = typeof bodyData?.csv === "string" ? bodyData.csv : "";
    let leadsToProcess: ParsedLead[] = [];

    if (Array.isArray(bodyData?.leads) && bodyData.leads.length > 0) {
      leadsToProcess = bodyData.leads;
    } else if (csvContent) {
      const rows = parseCSV(csvContent);
      leadsToProcess = mapRowsToLeads(rows);
    } else {
      const gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
      const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&sheet=${encodeURIComponent(sheetName)}`;

      let resp = await fetch(gvizUrl, { redirect: "follow" });
      let text = await resp.text();

      const isHtmlResponse = (content: string, response: Response) => {
        const ct = response.headers.get("content-type") || "";
        return (
          ct.includes("text/html") ||
          content.includes("<!DOCTYPE html") ||
          content.includes("<html") ||
          content.includes("accounts.google.com") ||
          content.includes("ServiceLogin")
        );
      };

      if (!resp.ok || isHtmlResponse(text, resp)) {
        resp = await fetch(exportUrl, { redirect: "follow" });
        text = await resp.text();
      }

      if (isHtmlResponse(text, resp)) {
        return new Response(
          JSON.stringify({
            ok: false,
            permission_required: true,
            sheet_id: sheetId,
            sheet_name: sheetName,
            message:
              "A planilha está restrita no Google Drive. Para sincronizar sem OAuth, abra a planilha no Google Sheets, clique em 'Compartilhar' no canto superior direito e mude o 'Acesso geral' para 'Qualquer pessoa com o link' (como 'Leitor').",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const rows = parseCSV(text);
      leadsToProcess = mapRowsToLeads(rows);
    }

    if (leadsToProcess.length === 0) {
      return new Response(
        JSON.stringify({
          ok: true,
          inserted_count: 0,
          skipped_count: 0,
          skipped: [],
          inserted: [],
          message: "Nenhum lead encontrado para importação.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: allDeals, error: queryErr } = await supabase
      .from("deals")
      .select("id, company, notes");

    if (queryErr) {
      return new Response(
        JSON.stringify({ error: `Erro ao consultar negócios existentes: ${queryErr.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const existingList = allDeals || [];
    const inserted: unknown[] = [];
    const skipped: Array<{ company: string; external_id?: string; reason: string }> = [];

    for (const lead of leadsToProcess) {
      const cleanCompany = lead.company_name.trim().toLowerCase();
      const extId = lead.external_id?.trim();

      const exists = existingList.some(d => {
        const dCompany = (d.company || "").trim().toLowerCase();
        if (dCompany === cleanCompany) return true;
        if (extId && d.notes) {
          if (d.notes.includes(`ID Pipeline: ${extId}`) || d.notes.includes(extId)) {
            return true;
          }
        }
        return false;
      });

      if (exists) {
        skipped.push({
          company: lead.company_name,
          external_id: lead.external_id,
          reason: "Já existente no CRM",
        });
        continue;
      }

      const notesParts = [
        lead.external_id ? `ID Pipeline: ${lead.external_id}` : null,
        lead.segment ? `Segmento: ${lead.segment}` : null,
        lead.city ? `Cidade: ${lead.city}` : null,
        lead.website ? `Site/Perfil: ${lead.website}` : null,
        lead.google_rating
          ? `Google: ${lead.google_rating} (${lead.google_reviews ?? 0} avaliações)`
          : null,
        lead.diagnosis ? `Diagnóstico: ${lead.diagnosis}` : null,
        lead.outreach_message ? `Abordagem: ${lead.outreach_message}` : null,
        lead.whatsapp_link ? `WhatsApp: ${lead.whatsapp_link}` : null,
      ].filter(Boolean);

      const dealRecord = {
        company: lead.company_name.trim(),
        contact: lead.contact || "Decisor / Comercial",
        contact_phone: lead.phone ?? null,
        contact_email: lead.email ?? null,
        value: lead.estimated_value ?? 0,
        probability: 20,
        status: "prospeccao",
        assigned_to: "Bruno",
        next_action: lead.next_action || "Disparar Passo 1 no WhatsApp (Recepção)",
        follow_up_on: lead.follow_up_on || null,
        notes: notesParts.join("\n"),
      };

      const { data: created, error: insertErr } = await supabase
        .from("deals")
        .insert(dealRecord)
        .select()
        .single();

      if (insertErr) {
        return new Response(
          JSON.stringify({
            error: `Erro ao inserir lead ${lead.company_name}: ${insertErr.message}`,
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      inserted.push(created);
      existingList.push(created);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        inserted_count: inserted.length,
        skipped_count: skipped.length,
        skipped,
        inserted,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
