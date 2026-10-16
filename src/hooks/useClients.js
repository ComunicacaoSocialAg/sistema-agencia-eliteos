import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { collection, onSnapshot, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const EXTENDED_META_KEY = 'csag_clients_extended_meta_v2';
const CUSTOM_CLIENTS_KEY = 'csag_custom_clients';

const ALIAS_GROUPS = [
  ['client-alberto-brasil', 'client-dr-alberto', '87c0b28f-83f0-43ab-aefe-45bda539e8c2'],
  ['client-dubola', 'ce45a984-093d-4484-9ee4-9177d56310e3']
];

export function getAliasesForId(id, name = '') {
  const s = String(id || '').trim();
  const n = String(name || '').toLowerCase();
  for (const group of ALIAS_GROUPS) {
    if (group.includes(s)) return group;
  }
  if (n.includes('alberto')) return ALIAS_GROUPS[0];
  if (n.includes('dubola')) return ALIAS_GROUPS[1];
  return s ? [s] : [];
}

export function areIdsMatching(aId, bId, aName = '', bName = '') {
  if (aId && bId && String(aId) === String(bId)) return true;
  const groupA = getAliasesForId(aId, aName);
  const groupB = getAliasesForId(bId, bName);
  return groupA.some(x => groupB.includes(x));
}

export const INITIAL_DEMO_CLIENTS = [
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
    value_proposition: 'Diagnóstico vascular com Ecodoppler em tempo real e tratamento de varizes a Laser sem repouso prolongado no Edifício Unique.',
    strategic_goals: 'Posicionamento de alta autoridade científica com o Calendário Trimestral (36 posts) no Edifício Unique',
    ai_instructions: 'Respeitar rigorosamente a Resolução CFM 2.336/2023: proibido antes e depois, proibido promessa de resultado, incluir CRM-MG 39529 e RQE 15412.',
    drive_url: 'https://drive.google.com/drive/folders/demo-dr-alberto',
    reportei_url: 'https://app.reportei.com/demo-dr-alberto',
    forms_url: 'https://forms.gle/dralberto-onboarding',
    reportei_config: {
      meta_ad_account_id: 'act_6957602694317339',
      instagram_handle: '@dralbertobr',
      ga4_property_id: 'GA4-ALBERTO-39529'
    },
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
    value_proposition: 'Molhos artesanais nobres com ingredientes selecionados e identidade gastronômica marcante.',
    strategic_goals: 'Expandir presença nacional e gerar vendas B2B e e-commerce',
    ai_instructions: 'Destacar textura, sabor artesanal, harmonização gastronômica e apelo visual apetitoso.',
    drive_url: 'https://drive.google.com/drive/folders/demo-dubola',
    reportei_url: 'https://app.reportei.com/demo-dubola',
    forms_url: 'https://forms.gle/dubola-onboarding',
    reportei_config: {
      meta_ad_account_id: 'act_844396960524350',
      instagram_handle: '@dubolamolhos',
      ga4_property_id: 'GA4-DUBOLA-2026'
    },
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

function getExtendedMetaMap() {
  try {
    const raw = localStorage.getItem(EXTENDED_META_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveExtendedMetaForClient(client) {
  if (!client || !client.id) return;
  try {
    const map = getExtendedMetaMap();
    const aliases = getAliasesForId(client.id, client.name);
    for (const key of aliases) {
      map[key] = { ...(map[key] || {}), ...client };
    }
    localStorage.setItem(EXTENDED_META_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn('Erro ao salvar metadados estendidos do cliente:', e);
  }
}

function enrichClientWithLocalMeta(rawClient) {
  if (!rawClient) return rawClient;
  const demoBaseline = INITIAL_DEMO_CLIENTS.find(d => areIdsMatching(d.id, rawClient.id, d.name, rawClient.name)) || {};
  const metaMap = getExtendedMetaMap();
  const aliases = getAliasesForId(rawClient.id, rawClient.name);
  let savedMeta = {};
  for (const key of aliases) {
    if (metaMap[key]) {
      savedMeta = { ...savedMeta, ...metaMap[key] };
    }
  }
  return {
    ...demoBaseline,
    ...rawClient,
    ...savedMeta,
    id: rawClient.id, // Preserva o ID primário da lista
    name: savedMeta.name || rawClient.name || demoBaseline.name,
    monthly_fee: savedMeta.monthly_fee !== undefined ? Number(savedMeta.monthly_fee) : (rawClient.monthly_fee !== undefined ? Number(rawClient.monthly_fee) : demoBaseline.monthly_fee),
    brand_color: savedMeta.brand_color || rawClient.brand_color || demoBaseline.brand_color || '#3b82f6',
    primary_color: savedMeta.primary_color || savedMeta.brand_color || rawClient.brand_color || demoBaseline.primary_color || '#3b82f6',
  };
}

function getStoredClients() {
  try {
    const saved = localStorage.getItem(CUSTOM_CLIENTS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const onlyRealClients = parsed
          .filter(c => c.status !== 'prospect')
          .map(enrichClientWithLocalMeta);
        if (onlyRealClients.length > 0) return onlyRealClients;
      }
    }
  } catch (e) {
    console.warn(e);
  }
  return INITIAL_DEMO_CLIENTS.map(enrichClientWithLocalMeta);
}

function broadcastClientsUpdate(nextClients) {
  try {
    const realOnly = nextClients.filter(c => c.status !== 'prospect');
    localStorage.setItem(CUSTOM_CLIENTS_KEY, JSON.stringify(realOnly));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('csag:clients-updated', { detail: realOnly }));
    }
  } catch (e) {
    console.warn('Erro ao propagar atualização de clientes:', e);
  }
}

const SUPABASE_SAFE_COLUMNS = [
  'name',
  'contact_name',
  'contact_email',
  'contact_phone',
  'monthly_fee',
  'brand_color',
  'status',
  'tone_of_voice',
  'target_audience',
  'value_proposition',
  'notes'
];

function buildSafeSupabasePayload(clientObj) {
  const payload = {};
  for (const col of SUPABASE_SAFE_COLUMNS) {
    if (clientObj[col] !== undefined) {
      payload[col] = clientObj[col];
    }
  }
  return payload;
}

export function useClients() {
  const [clients, setClients] = useState(getStoredClients);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleSync = (e) => {
      if (Array.isArray(e?.detail)) {
        setClients(e.detail);
      } else {
        setClients(getStoredClients());
      }
    };
    window.addEventListener('csag:clients-updated', handleSync);
    return () => window.removeEventListener('csag:clients-updated', handleSync);
  }, []);

  const fetchSupabaseClients = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .neq('status', 'prospect')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const enrichedRemote = data.map(enrichClientWithLocalMeta);
        // Preservar clientes criados localmente que ainda não estejam na resposta remota
        const currentLocal = getStoredClients();
        const localExtras = currentLocal.filter(
          loc => !enrichedRemote.some(rem => areIdsMatching(rem.id, loc.id, rem.name, loc.name))
        );
        const merged = [...enrichedRemote, ...localExtras];
        setClients(merged);
        localStorage.setItem(CUSTOM_CLIENTS_KEY, JSON.stringify(merged));
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
      return () => { isMounted = false; };
    }

    if (isFirebaseConfigured && db) {
      const unsubscribe = onSnapshot(collection(db, 'clients'), (snapshot) => {
        const data = snapshot.docs
          .map(d => enrichClientWithLocalMeta({ id: d.id, ...d.data() }))
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

  const createClient = async (clientData) => {
    const newClient = {
      ...clientData,
      id: clientData.id || `client-${Date.now()}`,
      status: clientData.status || 'active',
      monthly_fee: Number(clientData.monthly_fee) || 0,
      billing_day: clientData.billing_day || '10',
      contract_start_date: clientData.contract_start_date || new Date().toISOString().split('T')[0],
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
        const safeInsert = buildSafeSupabasePayload(newClient);
        const { data, error } = await supabase.from('clients').insert([safeInsert]).select().single();

        if (!error && data?.id) {
          newClient.id = data.id;
        }
      } catch (e) {
        console.warn('Erro no Supabase ao criar cliente, mantendo persistência local:', e);
      }
    } else if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(collection(db, 'clients'));
        newClient.id = docRef.id;
        await setDoc(docRef, newClient);
      } catch (e) {
        console.warn('Erro no Firebase ao criar cliente, mantendo persistência local:', e);
      }
    }

    saveExtendedMetaForClient(newClient);
    setClients(prev => {
      const filtered = prev.filter(c => !areIdsMatching(c.id, newClient.id, c.name, newClient.name));
      const next = [newClient, ...filtered];
      broadcastClientsUpdate(next);
      return next;
    });
    toast.success('Cliente cadastrado com sucesso!');
    return newClient;
  };

  const updateClient = async (updated) => {
    saveExtendedMetaForClient(updated);

    let targetIdForRemote = updated.id;
    setClients(prev => {
      const next = prev.map(c => {
        if (areIdsMatching(c.id, updated.id, c.name, updated.name)) {
          targetIdForRemote = c.id;
          const merged = {
            ...c,
            ...updated,
            id: c.id,
            primary_color: updated.primary_color || updated.brand_color || c.primary_color || c.brand_color,
            brand_color: updated.brand_color || updated.primary_color || c.brand_color
          };
          saveExtendedMetaForClient(merged);
          return merged;
        }
        return c;
      });
      broadcastClientsUpdate(next);
      return next;
    });

    if (isSupabaseConfigured && supabase) {
      try {
        const safeUpdate = buildSafeSupabasePayload(updated);
        if (Object.keys(safeUpdate).length > 0) {
          await supabase.from('clients').update(safeUpdate).eq('id', targetIdForRemote);
        }
      } catch (e) {
        console.warn('Erro ao atualizar colunas básicas no Supabase:', e);
      }
      toast.success('Ficha do cliente atualizada!');
      return;
    }

    if (isFirebaseConfigured && db) {
      try {
        const { id, ...data } = updated;
        const docRef = doc(db, 'clients', id);
        await updateDoc(docRef, data);
      } catch (e) {
        console.warn('Erro ao atualizar no Firebase:', e);
      }
    }
    toast.success('Ficha do cliente atualizada!');
  };

  const totalMRR = clients.filter(c => c.status === 'active').reduce((sum, c) => sum + (Number(c.monthly_fee) || 0), 0);

  return { clients, loading, createClient, updateClient, totalMRR, refetch: fetchSupabaseClients };
}

