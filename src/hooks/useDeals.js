import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { collection, onSnapshot, doc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_DEMO_DEALS;
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

export function useDeals() {
  const [deals, setDeals] = useState(getStoredDeals);
  const [loading, setLoading] = useState(true);

  const fetchSupabaseDeals = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setDeals(data);
        saveStoredDeals(data);
        setLoading(false);
        return true;
      }
    } catch (err) {
      console.warn('[Supabase] Erro ao buscar deals:', err);
    }
    return false;
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (isSupabaseConfigured && supabase) {
      fetchSupabaseDeals().then(success => {
        if (!success && isMounted) {
          setDeals(getStoredDeals());
          setLoading(false);
        }
      });
      return;
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

    return () => { isMounted = false; };
  }, [fetchSupabaseDeals]);

  const moveDeal = async (dealId, newStatus) => {
    const current = getStoredDeals();
    const updated = current.map(d => d.id === dealId ? { ...d, status: newStatus } : d);
    saveStoredDeals(updated);
    setDeals(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('deals').update({ status: newStatus }).eq('id', dealId);
        toast.success('Estágio do negócio atualizado no Funil!');
      } catch (err) {
        console.warn('Erro ao atualizar no Supabase:', err);
      }
      return;
    }

    if (!isFirebaseConfigured || !db) {
      toast.success('Estágio do negócio atualizado no Funil!');
      return;
    }

    try {
      await updateDoc(doc(db, 'deals', dealId), { status: newStatus });
      toast.success('Estágio do negócio atualizado');
    } catch (e) {
      console.warn('Erro ao atualizar no Firebase:', e);
    }
  };

  const createDeal = async (dealData) => {
    const newDeal = {
      ...dealData,
      id: dealData.id || `deal-${Date.now()}`,
      created_at: new Date().toISOString()
    };

    const current = getStoredDeals();
    const updated = [newDeal, ...current];
    saveStoredDeals(updated);
    setDeals(updated);

    toast.success('Novo negócio adicionado ao CRM!');

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('deals').insert([newDeal]).select().single();
        if (!error && data) {
          newDeal.id = data.id;
        }
      } catch (err) {
        console.warn('Erro ao salvar no Supabase:', err);
      }
      return newDeal;
    }

    if (!isFirebaseConfigured || !db) {
      return newDeal;
    }

    try {
      const docRef = doc(collection(db, 'deals'));
      newDeal.id = docRef.id;
      await setDoc(docRef, newDeal);
      return newDeal;
    } catch (e) {
      console.warn('Erro ao adicionar no Firebase:', e);
      return newDeal;
    }
  };

  const deleteDeal = async (dealId) => {
    const current = getStoredDeals();
    const updated = current.filter(d => d.id !== dealId);
    saveStoredDeals(updated);
    setDeals(updated);

    toast.success('Negócio removido do CRM.');

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('deals').delete().eq('id', dealId);
      } catch (err) {
        console.warn('Erro ao remover no Supabase:', err);
      }
      return;
    }

    if (!isFirebaseConfigured || !db) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'deals', dealId));
    } catch (e) {
      console.warn('Erro ao remover no Firebase:', e);
    }
  };

  const updateDeal = async (dealId, updatedData) => {
    const current = getStoredDeals();
    const updated = current.map(d => d.id === dealId ? { ...d, ...updatedData } : d);
    saveStoredDeals(updated);
    setDeals(updated);

    toast.success('Negócio atualizado com sucesso!');

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('deals').update(updatedData).eq('id', dealId);
        if (error) console.warn('Erro ao atualizar no Supabase:', error.message);
      } catch (err) {
        console.warn('Erro ao atualizar no Supabase:', err);
      }
      return;
    }

    if (!isFirebaseConfigured || !db) {
      return;
    }

    try {
      await updateDoc(doc(db, 'deals', dealId), updatedData);
    } catch (e) {
      console.warn('Erro ao atualizar no Firebase:', e);
    }
  };

  const restoreDeal = async (deal) => {
    if (!deal) return;
    const current = getStoredDeals();
    if (current.some(d => d.id === deal.id)) return;
    const updated = [deal, ...current];
    saveStoredDeals(updated);
    setDeals(updated);
    toast.success(`Prospect "${deal.company}" restaurado no CRM!`);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('deals').upsert([deal]);
      } catch (err) {
        console.warn('Erro ao restaurar no Supabase:', err);
      }
    }
  };

  const restoreMissingDefaults = async () => {
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

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('deals').upsert(missing);
      } catch (err) {
        console.warn('Erro ao restaurar no Supabase:', err);
      }
    }
  };

  return { 
    deals, 
    loading, 
    moveDeal, 
    createDeal, 
    updateDeal, 
    deleteDeal, 
    restoreDeal, 
    restoreMissingDefaults, 
    refetch: fetchSupabaseDeals 
  };
}
