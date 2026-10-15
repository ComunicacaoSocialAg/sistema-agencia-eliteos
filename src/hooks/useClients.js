import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { collection, onSnapshot, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const INITIAL_DEMO_CLIENTS = [
  {
    id: 'client-alberto-brasil',
    name: 'Dr. Alberto Brasil (Cirurgia Vascular)',
    document_id: 'CRM-MG 39529 / RQE 15412',
    contact_name: 'Dr. Alberto Brasil',
    contact_email: 'contato@dralbertobrasil.com.br',
    contact_phone: '(35) 3721-3363',
    monthly_fee: 7500,
    billing_day: '15',
    contract_start_date: '2026-03-01',
    brand_color: '#0284c7',
    status: 'active',
    tone_of_voice: 'Bisturi Verbal (Excelência médica, tecnologia minimamente invasiva, rigor científico e compliance CFM 2.336/2023)',
    target_audience: 'Pacientes com sintomas de varizes, dores nas pernas, atletas e público de 35 a 65 anos em Poços de Caldas e região',
    strategic_goals: 'Posicionamento de alta autoridade científica com o Calendário Trimestral (36 posts) no Edifício Unique',
    drive_url: 'https://drive.google.com/drive/folders/demo-dr-alberto',
    reportei_url: 'https://app.reportei.com/demo-dr-alberto',
    primary_color: '#0284c7',
    secondary_color: '#0f172a',
    accent_color: '#38bdf8',
    typography: 'Inter + Outfit',
    keywords: ['Cirurgia Vascular', 'Varizes', 'Laser Transdérmico', 'Poços de Caldas', 'Saúde Vascular', 'Doppler'],
    assets: [
      { id: 'ast-alb-1', name: 'Logo_DrAlbertoBrasil_Oficial.png', type: 'image', url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=600&auto=format&fit=crop' }
    ]
  },
  {
    id: 'client-dubola',
    name: 'Dubola Molhos Especiais',
    document_id: '12.345.678/0001-90',
    contact_name: 'Roberto Dubola',
    contact_email: 'contato@dubola.com.br',
    contact_phone: '(35) 99888-7766',
    monthly_fee: 8500,
    billing_day: '10',
    contract_start_date: '2026-01-15',
    brand_color: '#eab308',
    status: 'active',
    tone_of_voice: 'Gourmet, Rústico-Chique e Apaixonado por Gastronomia',
    target_audience: 'Consumidores de gastronomia artesanal, chefs e supermercados premium',
    strategic_goals: 'Expandir presença nacional e gerar vendas B2B e e-commerce',
    drive_url: 'https://drive.google.com/drive/folders/demo-dubola',
    reportei_url: 'https://app.reportei.com/demo-dubola',
    primary_color: '#eab308',
    secondary_color: '#1c1917',
    accent_color: '#ef4444',
    typography: 'Playfair Display + Inter',
    keywords: ['Gourmet', 'Artesanal', 'Molhos Nobres', 'Sabor Autêntico', 'Premium'],
    assets: [
      { id: 'ast-1', name: 'Logo_Dubola_Oficial_Vetor.svg', type: 'vector', url: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?q=80&w=600&auto=format&fit=crop' },
      { id: 'ast-2', name: 'Manual_Identidade_Visual_2026.pdf', type: 'pdf', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop' }
    ]
  }
];

function getStoredClients() {
  try {
    const saved = localStorage.getItem('csag_custom_clients');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Filtrar prospects para que NUNCA apareçam na lista de clientes ativos
        const onlyRealClients = parsed.filter(c => c.status !== 'prospect');
        if (onlyRealClients.length > 0) return onlyRealClients;
      }
    }
  } catch (e) {
    console.warn(e);
  }
  return INITIAL_DEMO_CLIENTS;
}

export function useClients() {
  const [clients, setClients] = useState(getStoredClients);
  const [loading, setLoading] = useState(true);

  const fetchSupabaseClients = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      // Buscar APENAS clientes reais (exclui prospects que pertencem apenas ao CRM)
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .neq('status', 'prospect')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setClients(data);
        localStorage.setItem('csag_custom_clients', JSON.stringify(data));
        setLoading(false);
        return true;
      }
    } catch (err) {
      console.warn('[Supabase] Erro ao buscar clientes:', err);
    }
    return false;
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (isSupabaseConfigured && supabase) {
      fetchSupabaseClients().then(success => {
        if (!success && isMounted) {
          const stored = getStoredClients();
          setClients(stored);
          setLoading(false);
        }
      });
      return;
    }

    if (isFirebaseConfigured && db) {
      const unsubscribe = onSnapshot(collection(db, 'clients'), (snapshot) => {
        const data = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(c => c.status !== 'prospect');
        if (data.length > 0) {
          setClients(data);
        }
        setLoading(false);
      }, (error) => {
        console.warn('[Firebase] Erro ao buscar clientes:', error.message);
        setClients(getStoredClients());
        setLoading(false);
      });

      return () => unsubscribe();
    }

    setClients(getStoredClients());
    setLoading(false);
    return () => { isMounted = false; };
  }, [fetchSupabaseClients]);

  // Sincronizar clientes reais no localStorage (garantindo que prospect nunca seja salvo aqui)
  useEffect(() => {
    try {
      const realOnly = clients.filter(c => c.status !== 'prospect');
      localStorage.setItem('csag_custom_clients', JSON.stringify(realOnly));
    } catch (e) {
      console.warn('Erro ao salvar no localStorage:', e);
    }
  }, [clients]);

  const createClient = async (clientData) => {
    const newClient = { 
      ...clientData, 
      id: clientData.id || `client-${Date.now()}`,
      status: clientData.status || 'active', 
      monthly_fee: Number(clientData.monthly_fee) || 0,
      brand_color: clientData.brand_color || '#3b82f6',
      primary_color: clientData.primary_color || clientData.brand_color || '#3b82f6',
      secondary_color: clientData.secondary_color || '#18181b',
      accent_color: clientData.accent_color || '#10b981',
      typography: clientData.typography || 'Inter / Plus Jakarta Sans',
      keywords: clientData.keywords || ['Comunicação', 'Marca', 'Performance'],
      assets: clientData.assets || [],
      created_at: new Date().toISOString() 
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('clients').insert([{
          name: newClient.name,
          contact_name: newClient.contact_name,
          contact_email: newClient.contact_email || null,
          contact_phone: newClient.contact_phone || null,
          monthly_fee: newClient.monthly_fee,
          brand_color: newClient.brand_color,
          status: newClient.status,
          tone_of_voice: newClient.tone_of_voice,
          target_audience: newClient.target_audience,
          value_proposition: newClient.value_proposition,
          notes: newClient.notes
        }]).select().single();

        if (!error && data) {
          newClient.id = data.id;
        }
        setClients(prev => [newClient, ...prev]);
        toast.success('Cliente cadastrado com sucesso!');
        return newClient;
      } catch (e) {
        console.warn('Erro no Supabase, salvando local:', e);
        setClients(prev => [newClient, ...prev]);
        toast.success('Cliente salvo localmente.');
        return newClient;
      }
    }

    if (!isFirebaseConfigured || !db) {
      setClients(prev => [newClient, ...prev]);
      toast.success('Cliente cadastrado com sucesso!');
      return newClient;
    }

    try {
      const docRef = doc(collection(db, 'clients'));
      newClient.id = docRef.id;
      await setDoc(docRef, newClient);
      toast.success('Cliente cadastrado no banco!');
      return newClient;
    } catch (e) {
      console.warn('Erro no Firebase, salvando local:', e);
      setClients(prev => [newClient, ...prev]);
      toast.success('Cliente salvo localmente.');
      return newClient;
    }
  };

  const updateClient = async (updated) => {
    setClients(prev => prev.map(c => c.id === updated.id ? { ...c, ...updated } : c));

    if (isSupabaseConfigured && supabase) {
      try {
        const { id, ...data } = updated;
        await supabase.from('clients').update(data).eq('id', id);
        toast.success('Ficha do cliente atualizada!');
      } catch (e) {
        console.warn('Erro ao atualizar no Supabase:', e);
      }
      return;
    }

    if (!isFirebaseConfigured || !db) {
      toast.success('Ficha do cliente atualizada!');
      return;
    }

    try {
      const { id, ...data } = updated;
      const docRef = doc(db, 'clients', id);
      await updateDoc(docRef, data);
      toast.success('Ficha do cliente atualizada!');
    } catch (e) {
      console.warn('Erro ao atualizar no Firebase:', e);
    }
  };

  const totalMRR = clients.filter(c => c.status === 'active').reduce((sum, c) => sum + (Number(c.monthly_fee) || 0), 0);

  return { clients, loading, createClient, updateClient, totalMRR, refetch: fetchSupabaseClients };
}
