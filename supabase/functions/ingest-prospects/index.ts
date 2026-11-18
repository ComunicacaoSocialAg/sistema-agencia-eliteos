import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface IncomingLead {
  external_id?: string;
  company_name: string;
  contact?: string;
  segment?: string;
  city?: string;
  status?: string;
  phone?: string;
  email?: string;
  website?: string | null;
  google_rating?: number;
  google_reviews?: number;
  estimated_value?: number;
  diagnosis?: string;
  outreach_message?: string;
  whatsapp_link?: string;
  next_action?: string;
  follow_up_on?: string;
}

const STAGE_MAP: Record<string, string> = {
  "prospeccao": "prospeccao",
  "prospecção": "prospeccao",
  "qualificacao": "qualificacao",
  "qualificação": "qualificacao",
  "proposta": "proposta",
  "proposta enviada": "proposta",
  "negociacao": "negociacao",
  "negociação": "negociacao",
  "ganho": "ganho",
  "fechado ganho": "ganho",
  "perdido": "perdido",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const expectedSecret = Deno.env.get("PROSPECT_INGEST_SECRET");
    const providedSecret =
      req.headers.get("x-api-key") ||
      req.headers.get("authorization")?.replace("Bearer ", "");

    if (expectedSecret && providedSecret !== expectedSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase environment variables" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const body = await req.json();
    const leads: IncomingLead[] = Array.isArray(body)
      ? body
      : body.leads
      ? body.leads
      : [body];

    if (!leads.length || !leads[0]?.company_name) {
      return new Response(
        JSON.stringify({
          error: "Payload inválido: envie um lead ou array de leads com company_name.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const inserted: unknown[] = [];
    const skipped: string[] = [];

    for (const lead of leads) {
      let isDuplicate = false;
      const { data: existingCompany } = await supabase
        .from("deals")
        .select("id, company")
        .ilike("company", lead.company_name.trim())
        .limit(1);

      if (existingCompany && existingCompany.length > 0) {
        isDuplicate = true;
      }

      if (!isDuplicate && lead.external_id) {
        const { data: existingNotes } = await supabase
          .from("deals")
          .select("id, company, notes")
          .ilike("notes", `%${lead.external_id}%`)
          .limit(1);

        if (existingNotes && existingNotes.length > 0) {
          isDuplicate = true;
        }
      }

      if (isDuplicate) {
        skipped.push(lead.company_name);
        continue;
      }

      const rawStatus = (lead.status || "prospeccao").toLowerCase().trim();
      const normalizedStatus = STAGE_MAP[rawStatus] || "prospeccao";

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

      // Schema exato da tabela `deals` conforme src/hooks/useDeals.js
      const dealRecord = {
        company: lead.company_name.trim(),
        contact: lead.contact || "Decisor / Comercial",
        contact_phone: lead.phone ?? null,
        contact_email: lead.email ?? null,
        value: lead.estimated_value ?? 0,
        probability: 20,
        status: normalizedStatus,
        assigned_to: "Bruno",
        next_action: lead.next_action || "Enviar abordagem inicial no WhatsApp",
        follow_up_on: lead.follow_up_on || null,
        notes: notesParts.join("\n"),
      };

      const { data, error } = await supabase
        .from("deals")
        .insert(dealRecord)
        .select()
        .single();

      if (error) {
        return new Response(
          JSON.stringify({
            error: `Erro ao inserir ${lead.company_name}: ${error.message}`,
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      inserted.push(data);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        inserted_count: inserted.length,
        skipped_count: skipped.length,
        skipped,
        inserted,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
