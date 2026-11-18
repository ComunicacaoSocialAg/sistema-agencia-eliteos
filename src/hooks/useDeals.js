import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { collection, onSnapshot, doc, updateDoc, setDoc, deleteDoc, db, isFirebaseConfigured } from '../lib/firebase';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { operationId } from '../lib/operationId';

const DEFAULT_DEMO_DEALS = [
  {
    id: 'deal-cop',
    company: 'Centro Odontológico de Poços - COP',
    contact: 'Dr. Mártin Soares',
    contact_phone: '(35) 3722-9008',
    value: 1800,
    probability: 20,
    status: 'prospeccao',
    assigned_to: 'Bruno',
    notes: 'Google Meu Negócio aponta para o Facebook. Falta site próprio. Criação de site institucional de autoridade para 8 consultórios e tráfego pago para implantes.',
    created_at: new Date().toISOString()
  },
  {
    id: 'deal-sorriso',
    company: 'Clínica Odontológica Sorriso',
    contact: 'Dr. Leonardo',
    contact_phone: '(35) 3712-6870',
    value: 1800,
    probability: 20,
    status: 'prospeccao',
    assigned_to: 'Bruno',
    notes: '14 anos de mercado. Usa agregador gratuito no GMB. Substituição de linktree por site próprio e inbound odontológico.',
    created_at: new Date().toISOString()
  },
  {
    id: 'deal-erler-frison',
    company: 'Erler & Frison Odontologia',
    contact: 'Dra. Ingrid Erler / Dra. Cíntia Frison',
    contact_phone: '(35) 98425-8073',
    value: 1800,
    probability: 20,
    status: 'prospeccao',
    assigned_to: 'Bruno',
    notes: '5.0 estrelas no Maps, mas usa link canva.link. Migração do site em Canva para domínio institucional próprio de alto padrão.',
    created_at: new Date().toISOString()
  },
  {
    id: 'deal-tania-mara',
    company: 'Dra. Tania Mara Pereira',
    contact: 'Dra. Tania Mara',
    contact_phone: '(35) 99878-8847',
    value: 1800,
    probability: 20,
    status: 'prospeccao',
    assigned_to: 'Bruno',
    notes: 'Consultório no Paço das Águas Shopping. GMB aponta para Instagram. Landing page para facetas em resina e alinhadores com campanhas no Google Ads.',
    created_at: new Date().toISOString()
  },
  {
    id: 'deal-eveline-leite',
    company: 'Consultório Odontológico Dra. Eveline Leite',
    contact: 'Dra. Eveline Leite',
    contact_phone: '(35) 99102-6801',
    value: 1800,
    probability: 20,
    status: 'prospeccao',
    assigned_to: 'Bruno',
    notes: 'Alto ticket, sem site próprio registrado. Site institucional e captação de pacientes para lentes em resina.',
    created_at: new Date().toISOString()
  },
  {
    id: 'deal-carolina-villela',
    company: 'Dra. Ana Carolina Villela',
    contact: 'Dra. Ana Carolina Villela',
    contact_phone: '(35) 99133-0872',
    value: 1800,
    probability: 20,
    status: 'prospeccao',
    assigned_to: 'Bruno',
    notes: 'Link do GMB direciona para Instagram com parâmetros. Estruturação de funil para Invisalign e lentes de porcelana.',
    created_at: new Date().toISOString()
  },
  {
    id: 'deal-pa-24h',
    company: 'Pronto Atendimento Odontológico 24h',
    contact: 'Dr. Fábio Paiva Togni',
    contact_phone: '(35) 98810-2022',
    value: 1800,
    probability: 20,
    status: 'prospeccao',
    assigned_to: 'Bruno',
    notes: 'Usa subdomínio codental.site; perde conversão imediata de dor. Landing page mobile ultra-rápida para emergências e Google Ads de alta conversão.',
    created_at: new Date().toISOString()
  },
  {
    id: 'deal-pocos-caldas',
    company: 'Clínica Odontológica Poços de Caldas',
    contact: 'Dra. Kelly Assunção',
    contact_phone: '(35) 3721-3037',
    contact_email: 'kellydentistaassuncao@gmail.com',
    value: 1800,
    probability: 20,
    status: 'prospeccao',
    assigned_to: 'Bruno',
    notes: 'Nome forte no Centro, porém presença online estagnada e e-mail genérico. Rebranding digital completo, novo site e reativação de canais sociais.',
    created_at: new Date().toISOString()
  },
  {
    id: 'deal-glauco-lima',
    company: 'Dr. Glauco Lima - Endodontia',
    contact: 'Dr. Glauco Lima',
    contact_phone: '(35) 3722-0000',
    contact_email: 'glaucolima25@hotmail.com',
    value: 1800,
    probability: 20,
    status: 'prospeccao',
    assigned_to: 'Bruno',
    notes: 'Usa Hotmail e subdomínio codental. Site de autoridade médica em microscopia endodôntica e e-mail corporativo.',
    created_at: new Date().toISOString()
  },
  {
    id: 'deal-ortoestetic',
    company: 'Ortoestetic Poços de Caldas',
    contact: 'Gestão Ortoestetic',
    contact_phone: '(35) 98421-8857',
    contact_email: 'ortoesteticpocos@gmail.com',
    value: 1800,
    probability: 20,
    status: 'prospeccao',
    assigned_to: 'Bruno',
    notes: 'Site atual com erros visuais e imagens cruas de WhatsApp. Refatoração completa de site, correção de SEO e automação de atendimento.',
    created_at: new Date().toISOString()
  },
  {
    id: 'deal-monique-barbosa',
    company: 'Dra. Monique Barbosa - Ortodontia',
    contact: 'Dra. Monique Barbosa',
    contact_phone: '(35) 99226-1304',
    value: 1800,
    probability: 20,
    status: 'prospeccao',
    assigned_to: 'Bruno',
    notes: 'Mais de 100 avaliações no Maps sem site institucional. Portal regional multi-cidades (Poços, Cabo Verde, Maria da Fé).',
    created_at: new Date().toISOString()
  },
  {
    id: 'deal-duoclinic',
    company: 'DuoClinic Reabilitação Oral',
    contact: 'Recepção DuoClinic',
    contact_phone: '(35) 4141-1380',
    contact_email: 'atendimento@duoclinic.com.br',
    value: 1800,
    probability: 20,
    status: 'prospeccao',
    assigned_to: 'Bruno',
    notes: 'Redes paradas desde 2023 e site instável. Plano de reativação de tráfego e presença digital para protocolos e próteses.',
    created_at: new Date().toISOString()
  },
  {
    id: 'deal-1',
    company: 'BioNutri Alimentos Saudáveis',
    contact: 'Camila Vasconcelos',
    contact_email: 'camila@bionutri.com.br',
    contact_phone: '(11) 98765-4321',
    value: 9500,
    probability: 80,
    status: 'negociacao',
    assigned_to: 'Bruno',
    notes: 'Interesse em gestão de Social Media, Mídia Paga e lançamento de nova linha de barras de proteína.',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString()
  },
  {
    id: 'deal-2',
    company: 'Nexus Engenharia & Obras',
    contact: 'Eng. Rodrigo Alencar',
    contact_email: 'rodrigo@nexuseng.com.br',
    contact_phone: '(11) 97123-8899',
    value: 12000,
    probability: 60,
    status: 'proposta',
    assigned_to: 'Bruno',
    notes: 'Proposta enviada com escopo de Branding institucional, novo site em Next.js e SEO.',
    created_at: new Date(Date.now() - 3600000 * 96).toISOString()
  },
  {
    id: 'deal-3',
    company: 'Vanguard Investimentos',
    contact: 'Juliana Mendes',
    contact_email: 'juliana@vanguardinv.com',
    contact_phone: '(11) 99444-1234',
    value: 15000,
    probability: 40,
    status: 'qualificacao',
    assigned_to: 'Bruno',
    notes: 'Reunião de diagnóstico realizada. Querem aumentar geração de leads qualificados (B2B).',
    created_at: new Date(Date.now() - 3600000 * 140).toISOString()
  },
  {
    id: 'deal-4',
    company: 'Bella Vita Estética Avançada',
    contact: 'Dra. Patricia Lima',
    contact_email: 'patricia@bellavita.med.br',
    contact_phone: '(11) 98111-2233',
    value: 7000,
    probability: 20,
    status: 'prospeccao',
    assigned_to: 'Bruno',
    notes: 'Lead captado via Inbound. Primeiro contato feito via WhatsApp.',
    created_at: new Date(Date.now() - 3600000 * 180).toISOString()
  }
];

function getStoredDeals() {
  try {
    const raw = localStorage.getItem('csag_custom_deals');
    if (!raw) {
      localStorage.setItem('csag_custom_deals', JSON.stringify(DEFAULT_DEMO_DEALS));
      return DEFAULT_DEMO_DEALS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_DEMO_DEALS;
  } catch {
    return DEFAULT_DEMO_DEALS;
  }
}

function saveStoredDeals(items) {
  try {
    localStorage.setItem('csag_custom_deals', JSON.stringify(items));
  } catch (e) {
    console.warn('Erro ao salvar deals:', e);
  }
}

const UUID = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const DEAL_FIELDS = ['company', 'contact', 'value', 'probability', 'status', 'assigned_to', 'notes', 'contact_email', 'contact_phone', 'next_action', 'follow_up_on'];
const dealFields = input => Object.fromEntries(DEAL_FIELDS.filter(key => input[key] !== undefined)
  .map(key => [key, key === 'follow_up_on' ? input[key] || null : input[key]]));

export function useDeals(enabled = true) {
  const { isDemoMode, user, profile, role } = useAuth();
  const serverMode = isSupabaseConfigured && !isDemoMode && !user?.id?.startsWith('demo-');
  const canWrite = serverMode && enabled && ['admin', 'commercial'].includes(role) && Boolean(user?.id && user.id === profile?.id);
  const [deals, setDeals] = useState(() => enabled && !serverMode ? getStoredDeals() : []);
  const [error, setError] = useState('');

  const saveDeal = (deal) => {
    if (serverMode) {
      setDeals(current => [deal, ...current.filter(item => item.id !== deal.id)]);
      window.dispatchEvent(new Event('csag:deals-changed'));
      return;
    }
    const items = getStoredDeals();
    const next = items.some(item => item.id === deal.id)
      ? items.map(item => item.id === deal.id ? deal : item)
      : [deal, ...items];
    saveStoredDeals(next);
    setDeals(next);
    window.dispatchEvent(new Event('csag:deals-changed'));
  };
  const [loading, setLoading] = useState(true);

  const fetchSupabaseDeals = useCallback(async () => {
    if (!canWrite || !supabase) return false;
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const legacy = getStoredDeals().filter(deal => !UUID.test(deal.id)
          && !DEFAULT_DEMO_DEALS.some(example => example.id === deal.id));
        setDeals([...data, ...legacy.map(deal => ({ ...deal, localOnly: true }))]);
        setError('');
        setLoading(false);
        return true;
      }
    } catch (err) {
      console.warn('[Supabase] Erro ao buscar deals:', err);
    }
    setError('Não foi possível carregar o CRM. Confira a conexão e tente novamente.');
    setLoading(false);
    return false;
  }, [canWrite]);

  useEffect(() => {
    if (!enabled) return;
    if (serverMode) {
      if (!canWrite) return;
      fetchSupabaseDeals();
      window.addEventListener('csag:deals-changed', fetchSupabaseDeals);
      return () => window.removeEventListener('csag:deals-changed', fetchSupabaseDeals);
    }

    if (isFirebaseConfigured && db) {
      const unsubscribe = onSnapshot(collection(db, 'deals'), (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (data.length > 0) {
          setDeals(data);
        } else {
          setDeals(getStoredDeals());
        }
        setLoading(false);
      }, (error) => {
        console.warn('[Firebase] Erro ao buscar deals:', error.message);
        setDeals(getStoredDeals());
        setLoading(false);
      });

      return () => unsubscribe();
    }

    setDeals(getStoredDeals());
    setLoading(false);

    const sync = () => setDeals(getStoredDeals());
    window.addEventListener('csag:deals-changed', sync);
    return () => window.removeEventListener('csag:deals-changed', sync);
  }, [canWrite, enabled, fetchSupabaseDeals, serverMode]);

  const closeDeal = async (dealId, existingClientId) => {
    if (!canWrite || !UUID.test(dealId)) return null;
    try {
      const { data, error } = await supabase.rpc('close_agency_deal', {
        p_deal_id: dealId,
        p_existing_client: existingClientId || null,
      });
      const result = Array.isArray(data) ? data[0] : data;
      if (error || !result?.onboarding_task_id) throw error;
      saveDeal(result);
      return result;
    } catch {
      toast.error('O fechamento não foi confirmado. Tente novamente.');
      return null;
    }
  };

  const moveDeal = (dealId, status) => updateDeal(dealId, { status });

  const createDeal = async (dealData) => {
    let deal = {
      ...dealData,
      id: dealData.id || `deal-${crypto.randomUUID()}`,
      created_at: new Date().toISOString(),
    };
    if (serverMode) {
      if (!canWrite) return null;
      try {
        const table = supabase.from('deals');
        const values = dealFields(deal);
        const operation = UUID.test(deal.id)
          ? table.upsert({ ...values, id: deal.id }, { ignoreDuplicates: true }) : table.insert(values);
        let result = await operation.select().maybeSingle();
        if (!result.error && !result.data && UUID.test(deal.id)) {
          result = await supabase.from('deals').select('*').eq('id', deal.id).single();
        }
        if (result.error || !result.data) throw result.error;
        deal = result.data;
      } catch {
        toast.error('Não foi possível salvar o negócio. Confira a conexão e tente novamente.');
        return null;
      }
    } else if (isFirebaseConfigured && db) {
      const docRef = doc(collection(db, 'deals'));
      deal.id = docRef.id;
      await setDoc(docRef, deal);
    }
    saveDeal(deal);
    toast.success('Negócio salvo no CRM.');
    return deal;
  };

  const deleteDeal = async (dealId) => {
    if (serverMode && (!canWrite || !UUID.test(dealId))) return false;
    try {
      if (serverMode) {
        const { data, error } = await supabase.from('deals').delete().eq('id', dealId).select('id').single();
        if (error || !data) throw error;
      } else if (isFirebaseConfigured && db) {
        await deleteDoc(doc(db, 'deals', dealId));
      }
    } catch {
      toast.error('O negócio não foi removido. Tente novamente.');
      return false;
    }
    if (!serverMode) saveStoredDeals(getStoredDeals().filter(deal => deal.id !== dealId));
    setDeals(items => items.filter(deal => deal.id !== dealId));
    window.dispatchEvent(new Event('csag:deals-changed'));
    return true;
  };

  const updateDeal = async (dealId, changes) => {
    const deal = deals.find(item => item.id === dealId);
    if (!deal || (serverMode && (!canWrite || !UUID.test(dealId)))) return false;
    try {
      if (serverMode) {
        const { data, error } = await supabase.from('deals').update(dealFields(changes))
          .eq('id', dealId).select().single();
        if (error || !data) throw error;
        saveDeal(data);
      } else {
        if (isFirebaseConfigured && db) await updateDoc(doc(db, 'deals', dealId), changes);
        saveDeal({ ...deal, ...changes });
      }
      return true;
    } catch {
      toast.error('As alterações do negócio não foram salvas. Tente novamente.');
      return false;
    }
  };

  const importDeal = async (deal) => {
    const id = await operationId('crm-registro-local-' + deal.id, true);
    const saved = await createDeal({ ...deal, id, status: deal.status === 'ganho' ? 'negociacao' : deal.status });
    if (!saved) return null;
    saveStoredDeals(getStoredDeals().filter(item => item.id !== deal.id));
    await fetchSupabaseDeals();
    return saved;
  };

  const restoreDeal = async (deal) => {
    if (!deal) return false;
    try {
      if (serverMode) {
        if (!canWrite || !UUID.test(deal.id)) return false;
        const { data, error } = await supabase.from('deals').insert(deal).select().single();
        if (error || !data) throw error;
        saveDeal(data);
      } else {
        if (isFirebaseConfigured && db) await setDoc(doc(db, 'deals', deal.id), deal);
        saveDeal(deal);
      }
      toast.success('Negócio restaurado.');
      return true;
    } catch {
      toast.error('Não foi possível restaurar o negócio.');
      return false;
    }
  };

  const restoreMissingDefaults = async () => {
    if (serverMode) return;
    const current = getStoredDeals();
    const missing = DEFAULT_DEMO_DEALS.filter(def => !current.some(c => c.company === def.company || c.id === def.id));
    if (missing.length === 0) {
      toast.success('Todos os prospects odontológicos já estão presentes no CRM.');
      return;
    }
    const updated = [...missing, ...current];
    saveStoredDeals(updated);
    setDeals(updated);
    toast.success(`${missing.length} prospect(s) restaurado(s) com sucesso!`);

    window.dispatchEvent(new Event('csag:deals-changed'));
  };

  const syncSheetProspects = async () => {
    if (!serverMode || !supabase) {
      toast.error('Sincronização disponível apenas no modo conectado ao Supabase.');
      return { ok: false, error: 'Modo local ou não autenticado.' };
    }
    try {
      const { data, error } = await supabase.functions.invoke('sync-sheet-prospects', {
        headers: { 'x-api-key': '104256Br' },
        body: {},
      });

      if (error) throw error;

      if (data?.permission_required) {
        toast.error(
          data.message || 'A planilha requer permissão de leitura. Compartilhe com "Qualquer pessoa com o link" (Leitor).',
          { duration: 9000 }
        );
        return data;
      }

      if (!data?.ok) {
        toast.error(data?.error || 'Não foi possível sincronizar a planilha.');
        return data;
      }

      const inserted = data.inserted_count || 0;
      const skipped = data.skipped_count || 0;

      if (inserted > 0) {
        toast.success(`${inserted} novo(s) lead(s) importado(s) do Pipeline CRM! (${skipped} já no CRM)`);
        await fetchSupabaseDeals();
      } else {
        toast.success(`Planilha em dia: todos os ${skipped} leads já constam no CRM.`);
        await fetchSupabaseDeals();
      }

      return data;
    } catch (err) {
      toast.error(`Erro ao sincronizar com a planilha: ${err?.message || 'Falha de conexão.'}`);
      return { ok: false, error: err?.message };
    }
  };

  return {
    deals: enabled && (!serverMode || canWrite) ? deals : [],
    loading: enabled && (!serverMode || canWrite) && loading,
    error, serverMode, moveDeal, closeDeal, createDeal, updateDeal, importDeal,
    deleteDeal, restoreDeal, restoreMissingDefaults, syncSheetProspects, refetch: fetchSupabaseDeals,
  };
}
