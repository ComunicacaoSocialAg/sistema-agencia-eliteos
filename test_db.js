import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/bruno/Documents/anti/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: clients } = await supabase.from('clients').select('id').limit(1);
  if (!clients || clients.length === 0) return console.log('No clients');
  const clientId = clients[0].id;
  
  const dbTask = {
        title: 'Teste via Node',
        client_id: clientId,
        status: 'backlog',
        tag: 'Onboarding',
        estimated_hours: 10,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tracked_seconds: 0
  };
  
  const { data, error } = await supabase.from('tasks').insert(dbTask).select().single();
  console.log('Result:', { data, error });
}
test();
