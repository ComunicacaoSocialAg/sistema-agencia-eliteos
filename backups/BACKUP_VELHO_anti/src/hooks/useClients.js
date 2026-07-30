import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const DEMO_CLIENTS = [
  { 
    id: '11111111-0000-0000-0000-000000000001', 
    name: 'Ponto Cor', 
    contact_name: 'Fernando', 
    contact_email: 'fernando@pontocor.com', 
    monthly_fee: 15000, 
    brand_color: '#3b82f6', 
    status: 'active', 
    reportei_config: {
      report_url: 'https://app.reportei.com/report/cLxlIjUPU0yYsD8RSrwpFc8eSGPslwR4',
      project_id: '1139502'
    },
    drive_url: '', 
    notes: 'Cliente desde 2023. Foco em redes sociais e materiais de impressão.',
    tone_of_voice: 'Sofisticado, acolhedor e direto ao ponto.',
    target_audience: 'Mulheres 25-45 anos, classe A/B, interessadas em fotografia de luxo.',
    strategic_goals: 'Consolidar como a maior referência em fotografia lifestyle de SP.'
  },
  { 
    id: '11111111-0000-0000-0000-000000000002', 
    name: 'TechStart App', 
    contact_name: 'Marina Costa', 
    contact_email: 'marina@techstart.com', 
    monthly_fee: 8500, 
    brand_color: '#8b5cf6', 
    status: 'active', 
    drive_url: '', 
    notes: 'Startup de tecnologia. Foco em branding e lançamento de produto.',
    tone_of_voice: 'Inovador, ágil e disruptivo.',
    target_audience: 'Founders de startups e investidores anjo.',
    strategic_goals: 'Atingir 10k usuários ativos até o final do ano.'
  },
  { 
    id: '11111111-0000-0000-0000-000000000003', 
    name: 'Café Blend', 
    contact_name: 'Julio', 
    contact_email: 'julio@cafeblend.com', 
    monthly_fee: 2000, 
    brand_color: '#f59e0b', 
    status: 'active', 
    drive_url: '', 
    notes: 'Cafeteria premium. Comunicação sofisticada e aconchegante.',
    tone_of_voice: 'Confortável, aromático e elegante.',
    target_audience: 'Amantes de café especial e profissionais liberais.',
    strategic_goals: 'Expandir para a segunda unidade e fidelizar o público local.'
  },
  { 
    id: '11111111-0000-0000-0000-000000000004', 
    name: 'Clínica Sorriso', 
    contact_name: 'Dra. Amanda', 
    contact_email: 'amanda@clinicasorriso.com', 
    monthly_fee: 3500, 
    brand_color: '#10b981', 
    status: 'active', 
    drive_url: '', 
    notes: 'Clínica odontológica. Tom humanizado e profissional.',
    tone_of_voice: 'Humanizado, seguro e confiável.',
    target_audience: 'Famílias residentes no bairro e entorno.',
    strategic_goals: 'Tornar-se a clínica nº 1 em ortodontia invisível na região.'
  },
];

export function useClients() {
  const [clients, setClients] = useState(DEMO_CLIENTS);
  const [loading, setLoading] = useState(true);

  const fetchClients = useCallback(async () => {
    if (!isSupabaseConfigured) { setLoading(false); return; }
    const { data, error } = await supabase.from('clients').select('*').order('name');
    if (!error && data) setClients(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const createClient = async (clientData) => {
    const newClient = { ...clientData, id: crypto.randomUUID(), status: 'active' };
    setClients(prev => [...prev, newClient]);
    toast.success('Cliente cadastrado com sucesso!');
    if (isSupabaseConfigured) {
      await supabase.from('clients').insert(clientData);
    }
    return newClient;
  };

  const updateClient = async (updated) => {
    setClients(prev => prev.map(c => c.id === updated.id ? updated : c));
    toast.success('Ficha do cliente atualizada');
    if (isSupabaseConfigured) {
      const { id, ...data } = updated;
      await supabase.from('clients').update(data).eq('id', id);
    }
  };

  const totalMRR = clients.filter(c => c.status === 'active').reduce((sum, c) => sum + (c.monthly_fee || 0), 0);

  return { clients, loading, createClient, updateClient, totalMRR, refetch: fetchClients };
}
