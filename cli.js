import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

// Carregar variáveis do arquivo .env manualmente (compatível com ES Modules sem dependências extras)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '.env');

if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  for (const line of envConfig.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valueParts] = trimmed.split('=');
      const val = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      if (key && !process.env[key.trim()]) {
        process.env[key.trim()] = val;
      }
    }
  }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Credenciais do Supabase (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) não encontradas no arquivo .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function listClients() {
  const { data, error } = await supabase.from('clients').select('id, name, status');
  if (error) return console.error('❌ Erro ao buscar clientes:', error.message);
  console.table(data);
}

async function listTasks(clientName) {
  let query = supabase.from('tasks').select('id, title, status, priority, deadline, tag, clients(name)');
  
  if (clientName) {
    const { data: clients } = await supabase.from('clients').select('id').ilike('name', `%${clientName}%`);
    if (clients && clients.length > 0) {
      const clientIds = clients.map(c => c.id);
      query = query.in('client_id', clientIds);
    }
  }

  const { data, error } = await query;
  if (error) return console.error('❌ Erro ao buscar tarefas:', error.message);
  console.table((data || []).map(t => ({
    ID: t.id,
    Título: t.title,
    Cliente: t.clients?.name || 'N/A',
    Status: t.status,
    Prioridade: t.priority,
    Prazo: t.deadline || 'Sem prazo',
    Categoria: t.tag || 'Geral'
  })));
}

async function createTask({ title, clientName, priority = 'medium', tag = 'Geral', notes = '' }) {
  let clientId = null;
  if (clientName) {
    const { data: client } = await supabase.from('clients').select('id').ilike('name', `%${clientName}%`).limit(1).maybeSingle();
    if (client) clientId = client.id;
  }

  const { data, error } = await supabase.from('tasks').insert([
    {
      title,
      client_id: clientId,
      priority,
      tag,
      notes,
      status: 'briefing'
    }
  ]).select();

  if (error) return console.error('❌ Erro ao criar tarefa:', error.message);
  console.log('✅ Demanda criada com sucesso:', data[0]);
}

const args = process.argv.slice(2);
const command = args[0];

(async () => {
  if (command === '--clients') {
    await listClients();
  } else if (command === '--tasks') {
    const client = args[1];
    await listTasks(client);
  } else if (command === '--create') {
    const title = args[1];
    const client = args[2];
    if (!title) return console.log('Uso: node cli.js --create "Título da Demanda" "Nome do Cliente"');
    await createTask({ title, clientName: client });
  } else {
    console.log('\nComandos disponíveis:');
    console.log('  node cli.js --clients');
    console.log('  node cli.js --tasks [nome_cliente]');
    console.log('  node cli.js --create "Título" "Cliente"\n');
  }
})();
