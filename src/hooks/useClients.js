import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { collection, onSnapshot, doc, updateDoc, setDoc, db, isFirebaseConfigured } from '../lib/firebase';
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
    drive_url: '',
    reportei_url: '',
    forms_url: '',
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
    assets: []
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
    drive_url: '',
    reportei_url: '',
    forms_url: '',
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
    assets: []
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
  const resolvedPrimary = savedMeta.primary_color || savedMeta.brand_color || rawClient.primary_color || rawClient.brand_color || demoBaseline.primary_color || demoBaseline.brand_color || '#3b82f6';
  return {
    ...demoBaseline,
    ...rawClient,
    ...savedMeta,
    id: rawClient.id, // Preserva o ID primário da lista
    name: savedMeta.name || rawClient.name || demoBaseline.name,
    monthly_fee: savedMeta.monthly_fee !== undefined ? Number(savedMeta.monthly_fee) : (rawClient.monthly_fee !== undefined ? Number(rawClient.monthly_fee) : demoBaseline.monthly_fee),
    brand_color: resolvedPrimary,
    primary_color: resolvedPrimary,
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
  'notes', 'logo_url', 'monthly_hours_contracted', 'lifecycle_stage', 'social_media_config', 'reportei_config',
];

const METADATA_COLUMNS = [
  'document_id', 'billing_day', 'contract_start_date', 'contract_end_date', 'drive_url',
  'reportei_url', 'strategic_goals', 'primary_color', 'secondary_color', 'accent_color', 'typography',
  'keywords', 'assets', 'industry', 'website', 'instagram', 'logo_variations', 'forms_url', 'ai_instructions',
  'briefing_data', 'onboarding_checklist', 'onboarding_completed_at', 'deal_id', 'address', 'registration_id',
];

function buildSafeSupabasePayload(clientObj) {
  const normalizedPrimary = clientObj.primary_color || clientObj.brand_color;
  const source = normalizedPrimary
    ? { ...clientObj, brand_color: normalizedPrimary, primary_color: normalizedPrimary }
    : clientObj;
  const payload = {};
  for (const col of SUPABASE_SAFE_COLUMNS) {
    if (source[col] !== undefined) {
      payload[col] = source[col];
    }
  }
  const metadata = Object.fromEntries(METADATA_COLUMNS.filter(key => source[key] !== undefined)
    .map(key => [key, source[key]]));
  if (Object.keys(metadata).length || source.agency_metadata) {
    payload.agency_metadata = { ...(source.agency_metadata || {}), ...metadata };
  }
  return payload;
}

function presentRemoteClient(client) {
  const metadata = Object.fromEntries(METADATA_COLUMNS.filter(key => client.agency_metadata?.[key] !== undefined)
    .map(key => [key, client.agency_metadata[key]]));
  const resolvedPrimary = metadata.primary_color || client.brand_color || '#3b82f6';
  return { ...client, ...metadata, brand_color: resolvedPrimary, primary_color: resolvedPrimary };
}

export function useClients() {
  const { isDemoMode, role } = useAuth();
  const remote = isSupabaseConfigured && !isDemoMode;
  const allowed = !remote || ['admin', 'commercial', 'production'].includes(role);
  const [clients, setClients] = useState(() => remote ? [] : getStoredClients());
  const [loading, setLoading] = useState(allowed);
  const [error, setError] = useState('');

  const fetchSupabaseClients = useCallback(async () => {
    if (!remote || !allowed || !supabase) return false;
    try {
      const { data, error } = await supabase.from('clients').select('*')
        .neq('status', 'prospect').order('created_at', { ascending: false });
      if (error) throw error;
      setClients(data.map(presentRemoteClient));
      setError('');
      return true;
    } catch {
      setError('Não foi possível carregar as fichas dos clientes.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [allowed, remote]);

  useEffect(() => {
    if (!allowed) return;
    if (remote) {
      fetchSupabaseClients();
      window.addEventListener('csag:remote-clients-changed', fetchSupabaseClients);
      return () => window.removeEventListener('csag:remote-clients-changed', fetchSupabaseClients);
    }
    const sync = event => setClients(Array.isArray(event.detail) ? event.detail : getStoredClients());
    window.addEventListener('csag:clients-updated', sync);
    return () => window.removeEventListener('csag:clients-updated', sync);
  }, [allowed, remote, fetchSupabaseClients]);

  useEffect(() => {
    if (remote) return;
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
  }, [remote]);

  const createClient = async (clientData, { handoff = false } = {}) => {
    if (!allowed || !clientData.name?.trim()) return null;
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

    if (remote) {
      try {
        const values = buildSafeSupabasePayload(newClient);
        if (clientData.id) values.id = clientData.id;
        const table = supabase.from('clients');
        const operation = handoff ? table.upsert(values, { ignoreDuplicates: true }) : table.insert(values);
        const { data, error } = await operation.select('*').maybeSingle();
        if (error) throw error;
        const row = data || (handoff && clientData.id
          ? (await supabase.from('clients').select('*').eq('id', clientData.id).single()).data : null);
        if (!row) throw new Error('Cadastro não confirmado');
        const presented = presentRemoteClient(row);
        setClients(prev => [presented, ...prev.filter(c => c.id !== presented.id)]);
        window.dispatchEvent(new Event('csag:remote-clients-changed'));
        toast.success('Cliente cadastrado.');
        return presented;
      } catch {
        toast.error('Não foi possível cadastrar o cliente. Confira os dados e tente novamente.');
        return null;
      }
    }

    if (handoff) {
      const existing = getStoredClients().find(client => client.id === newClient.id);
      if (existing) return existing;
    } else if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(collection(db, 'clients'));
        newClient.id = docRef.id;
        await setDoc(docRef, newClient);
      } catch {
        toast.error('Não foi possível cadastrar o cliente.');
        return null;
      }
    }

    saveExtendedMetaForClient(newClient);
    const next = [newClient, ...getStoredClients().filter(client =>
      !areIdsMatching(client.id, newClient.id, client.name, newClient.name))];
    setClients(next);
    broadcastClientsUpdate(next);
    toast.success('Cliente cadastrado com sucesso!');
    return newClient;
  };

  const updateClient = async (updated) => {
    if (!allowed) return null;
    try {
      if (remote) {
        const current = clients.find(client => client.id === updated.id);
        if (!current) throw new Error('Cliente indisponível');
        const merged = { ...current, ...updated, agency_metadata: { ...(current.agency_metadata || {}), ...(updated.agency_metadata || {}) } };
        const { data, error } = await supabase.from('clients')
          .update(buildSafeSupabasePayload(merged))
          .eq('id', updated.id).select().single();
        if (error || !data) throw error;
        const presented = presentRemoteClient(data);
        setClients(prev => prev.map(c => c.id === presented.id ? presented : c));
        window.dispatchEvent(new Event('csag:remote-clients-changed'));
        toast.success('Ficha do cliente atualizada.');
        return presented;
      }
      if (isFirebaseConfigured && db) {
        const { id, ...values } = updated;
        await updateDoc(doc(db, 'clients', id), values);
      }
      saveExtendedMetaForClient(updated);
      const next = clients.map(client => client.id === updated.id ? { ...client, ...updated } : client);
      setClients(next);
      broadcastClientsUpdate(next);
      toast.success('Ficha do cliente atualizada.');
      return updated;
    } catch {
      toast.error('A ficha não foi atualizada. Confira os dados e tente novamente.');
      return null;
    }
  };

  const totalMRR = clients.filter(c => c.status === 'active').reduce((sum, c) => sum + (Number(c.monthly_fee) || 0), 0);

  return { clients: allowed ? clients : [], loading: allowed && loading, error, createClient, updateClient, totalMRR, refetch: fetchSupabaseClients };
}

