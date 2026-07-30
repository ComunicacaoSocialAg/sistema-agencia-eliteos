import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envFile = fs.readFileSync(path.join(__dirname, '../.env'), 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    env[key.trim()] = value.trim();
  }
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseKey = env['VITE_SUPABASE_ANON_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
  const userId = 'd5204bd5-a5b7-4c47-bd9f-f3443741dad9';
  console.log('Inserting profile for:', userId);
  
  const { data, error } = await supabase
    .from('profiles')
    .upsert([
      { id: userId, name: 'Bruno', role: 'admin' }
    ]);
    
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Success:', data);
  }
}

fix();
