import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Leitura manual do .env
const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length) {
    envVars[key.trim()] = values.join('=').trim();
  }
});

const supabaseUrl = envVars['VITE_SUPABASE_URL'];
const supabaseKey = envVars['VITE_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error("ERRO: Variáveis VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não encontradas no .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('--- INICIANDO IMPORTAÇÃO DO PLANEJAMENTO PONTO COR ---');
  
  // Fazer login como admin para passar pelo RLS
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'admin@csag.com',
    password: 'demo123'
  });

  if (authErr) {
    console.error("ERRO DE AUTENTICAÇÃO (Precisa criar o usuário admin no Supabase primeiro):", authErr.message);
    console.log("\nCOMO RESOLVER: Abra seu app, logue no Supabase real e crie a conta admin@csag.com");
    return;
  }
  console.log("✅ Autenticado como Admin");

  const dataRaw = fs.readFileSync(path.join(__dirname, 'ponto_cor_plan.json'), 'utf-8');
  const plan = JSON.parse(dataRaw);
  
  // 1. Buscar o ID do primeiro cliente disponível para o teste
  const { data: clients, error: clientErr } = await supabase
    .from('clients')
    .select('id, name')
    .limit(1);

  const clientId = clients?.[0]?.id || '11111111-0000-0000-0000-000000000001';
  console.log(`✅ Usando Cliente ID: ${clientId}`);

  // 2. Importar Calendário Comercial (Campanhas Macro)
  console.log('\n📅 Importando Campanhas Comerciais...');
  let totalComercial = 0;
  for (const [mes, acoes] of Object.entries(plan.calendario_comercial)) {
    for (const acao of acoes) {
      const { data: task, error } = await supabase.from('tasks').insert({
        client_id: clientId,
        title: `[Campanha] ${acao.acao}`,
        status: 'backlog',
        tag: 'Campanha',
        priority: 'high',
        deadline: acao.data_fim,
        notes: `Período: ${acao.data_inicio} até ${acao.data_fim}\nMeta: ${acao.meta}`,
      }).select().single();
      
      if (error) console.error("Erro na campanha:", error);
      else {
        console.log(`  - Criada: ${task.title}`);
        totalComercial++;
      }
    }
  }

  // 3. Importar Programação de Redes Sociais
  console.log('\n📱 Importando Calendário de Social Media...');
  let totalSocial = 0;
  for (const mesData of plan.calendario_redes_sociais.programacao_mensal) {
    for (const semana of mesData.cronograma_posts) {
      const title = `[Social] ${semana.tema} - ${mesData.mes}`;
      const { data: task, error } = await supabase.from('tasks').insert({
        client_id: clientId,
        title: title,
        status: 'backlog',
        tag: 'Social Media',
        priority: 'medium',
        notes: `
=== CONTEÚDO DA SEMANA ===
Segunda (${semana.seg_post.tipo}):
${semana.seg_post.conteudo}

Quarta (${semana.qua_post.tipo}):
${semana.qua_post.conteudo}

Sexta (${semana.sex_post.tipo}):
${semana.sex_post.conteudo}
        `.trim(),
      }).select().single();
      
      if (error) {
        console.error("Erro em Social:", error);
      } else {
        // Adicionar os 3 posts como Checklists (subtarefas)
        await supabase.from('task_checklists').insert([
          { task_id: task.id, label: `Segunda: ${semana.seg_post.tipo}`, position: 0 },
          { task_id: task.id, label: `Quarta: ${semana.qua_post.tipo}`, position: 1 },
          { task_id: task.id, label: `Sexta: ${semana.sex_post.tipo}`, position: 2 }
        ]);
        console.log(`  - Criada tarefa c/ checklist: ${task.title}`);
        totalSocial++;
      }
    }
  }

  // 4. Salvar Posicionamento e Tendências na "Memória da IA"
  console.log('\n🧠 Salvando Diretrizes na Memória da IA...');
  
  await supabase.from('ai_memories').upsert({
    client_id: clientId,
    key: 'posicionamento_2026',
    value: JSON.stringify(plan.posicionamento_macro)
  }, { onConflict: 'client_id,key' });
  console.log(`  - Posicionamento de Marca atualizado.`);

  await supabase.from('ai_memories').upsert({
    client_id: clientId,
    key: 'tendencias_2026',
    value: JSON.stringify(plan.pesquisa_tendencias_2026)
  }, { onConflict: 'client_id,key' });
  console.log(`  - Tendências (Moda/Comportamento) atualizadas.`);

  await supabase.from('ai_memories').upsert({
    client_id: clientId,
    key: 'experiencia_pdv',
    value: JSON.stringify(plan.experiencia_offline_pdv)
  }, { onConflict: 'client_id,key' });
  console.log(`  - Regras de Experiência Física (PDV) atualizadas.`);

  console.log('\n✅ IMPORTAÇÃO CONCLUÍDA COM SUCESSO!');
  console.log(`Resumo: ${totalComercial} Campanhas | ${totalSocial} Tarefas de Social Media + Checklists`);
}

run();
