import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  for (const line of envConfig.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valueParts] = trimmed.split('=');
      const val = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      if (key && !process.env[key.trim()]) process.env[key.trim()] = val;
    }
  }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Erro: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não encontradas no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

export const prospects = [
  {
    name: 'Centro Odontológico de Poços - COP',
    contact_name: 'Dr. Mártin Soares',
    contact_phone: '(35) 3722-9008',
    status: 'prospect',
    value_proposition: 'Criação de site institucional de autoridade para 8 consultórios e tráfego pago para implantes.',
    target_audience: 'Pacientes de Poços de Caldas buscando reabilitação e implantes',
    notes: 'Google Meu Negócio aponta para o Facebook. Falta site próprio.'
  },
  {
    name: 'Clínica Odontológica Sorriso',
    contact_name: 'Dr. Leonardo',
    contact_phone: '(35) 3712-6870',
    status: 'prospect',
    value_proposition: 'Substituição de linktree por site próprio e inbound odontológico.',
    target_audience: 'Famílias e tratamentos odontológicos completos',
    notes: '14 anos de mercado. Usa agregador gratuito no GMB.'
  },
  {
    name: 'Erler & Frison Odontologia',
    contact_name: 'Dra. Ingrid Erler / Dra. Cíntia Frison',
    contact_phone: '(35) 98425-8073',
    status: 'prospect',
    value_proposition: 'Migração do site em Canva para domínio institucional próprio de alto padrão.',
    target_audience: 'Pacientes de ortodontia infantil e alinhadores',
    notes: '5.0 estrelas no Maps, mas usa link canva.link.'
  },
  {
    name: 'Dra. Tania Mara Pereira',
    contact_name: 'Dra. Tania Mara',
    contact_phone: '(35) 99878-8847',
    status: 'prospect',
    value_proposition: 'Landing page para facetas em resina e alinhadores com campanhas no Google Ads.',
    target_audience: 'Público A/B interessado em estética do sorriso',
    notes: 'Consultório no Paço das Águas Shopping. GMB aponta para Instagram.'
  },
  {
    name: 'Consultório Odontológico Dra. Eveline Leite',
    contact_name: 'Dra. Eveline Leite',
    contact_phone: '(35) 99102-6801',
    status: 'prospect',
    value_proposition: 'Site institucional e captação de pacientes para lentes em resina.',
    target_audience: 'Pacientes para transformação estética do sorriso',
    notes: 'Alto ticket, sem site próprio registrado.'
  },
  {
    name: 'Dra. Ana Carolina Villela',
    contact_name: 'Dra. Ana Carolina Villela',
    contact_phone: '(35) 99133-0872',
    status: 'prospect',
    value_proposition: 'Estruturação de funil para Invisalign e lentes de porcelana.',
    target_audience: 'Ortodontia estética e alinhadores invisíveis',
    notes: 'Link do GMB direciona para Instagram com parâmetros.'
  },
  {
    name: 'Pronto Atendimento Odontológico 24h',
    contact_name: 'Dr. Fábio Paiva Togni',
    contact_phone: '(35) 98810-2022',
    status: 'prospect',
    value_proposition: 'Landing page mobile ultra-rápida para emergências e Google Ads de alta conversão.',
    target_audience: 'Urgências, dor de dente e emergências 24h',
    notes: 'Usa subdomínio codental.site; perde conversão imediata de dor.'
  },
  {
    name: 'Clínica Odontológica Poços de Caldas',
    contact_name: 'Dra. Kelly Assunção',
    contact_phone: '(35) 3721-3037',
    contact_email: 'kellydentistaassuncao@gmail.com',
    status: 'prospect',
    value_proposition: 'Rebranding digital completo, novo site e reativação de canais sociais.',
    target_audience: 'Clínica geral e implantes',
    notes: 'Nome forte no Centro, porém presença online estagnada e e-mail genérico.'
  },
  {
    name: 'Dr. Glauco Lima - Endodontia',
    contact_name: 'Dr. Glauco Lima',
    contact_phone: '(35) 3722-0000',
    contact_email: 'glaucolima25@hotmail.com',
    status: 'prospect',
    value_proposition: 'Site de autoridade médica em microscopia endodôntica e e-mail corporativo.',
    target_audience: 'Pacientes de canal complexo e dentistas parceiros para indicação',
    notes: 'Usa Hotmail e subdomínio codental.'
  },
  {
    name: 'Ortoestetic Poços de Caldas',
    contact_name: 'Gestão Ortoestetic',
    contact_phone: '(35) 98421-8857',
    contact_email: 'ortoesteticpocos@gmail.com',
    status: 'prospect',
    value_proposition: 'Refatoração completa de site, correção de SEO e automação de atendimento.',
    target_audience: 'Ortodontia e reabilitação geral',
    notes: 'Site atual com erros visuais e imagens cruas de WhatsApp.'
  },
  {
    name: 'Dra. Monique Barbosa - Ortodontia',
    contact_name: 'Dra. Monique Barbosa',
    contact_phone: '(35) 99226-1304',
    status: 'prospect',
    value_proposition: 'Portal regional multi-cidades (Poços, Cabo Verde, Maria da Fé).',
    target_audience: 'Pacientes de ortodontia em Poços e cidades vizinhas',
    notes: 'Mais de 100 avaliações no Maps sem site institucional.'
  },
  {
    name: 'DuoClinic Reabilitação Oral',
    contact_name: 'Recepção DuoClinic',
    contact_phone: '(35) 4141-1380',
    contact_email: 'atendimento@duoclinic.com.br',
    status: 'prospect',
    value_proposition: 'Plano de reativação de tráfego e presença digital para protocolos e próteses.',
    target_audience: 'Pacientes de reabilitação e implantes',
    notes: 'Redes paradas desde 2023 e site instável.'
  }
];

async function run() {
  console.log('Sincronizando 12 prospects no CRM (tabela deals)...');
  let cadastrados = 0;

  for (const item of prospects) {
    // Verificar se deal já existe no CRM
    const { data: existingDeal } = await supabase
      .from('deals')
      .select('id')
      .eq('company', item.name)
      .maybeSingle();

    if (!existingDeal) {
      const { error: dErr } = await supabase.from('deals').insert([{
        company: item.name,
        contact: item.contact_name,
        contact_phone: item.contact_phone,
        contact_email: item.contact_email || null,
        client_id: null,
        status: 'prospeccao',
        value: 1800.00,
        probability: 20,
        assigned_to: 'Bruno',
        notes: item.notes
      }]);

      if (dErr) {
        console.error(`Erro ao cadastrar negócio para ${item.name}:`, dErr.message);
        continue;
      }
    }

    cadastrados++;
    console.log(`✅ [${cadastrados}/12] Lead no CRM: ${item.name}`);
  }

  console.log(`\nFinalizado: prospects mantidos estritamente no CRM.`);
}

run();
