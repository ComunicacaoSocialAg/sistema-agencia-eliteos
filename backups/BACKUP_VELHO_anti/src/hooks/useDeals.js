import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const DEMO_DEALS = [
  { id: '1', company: 'Nova Construtora', contact: 'Roberto Silva', value: 15000, probability: 20, status: 'prospeccao', assigned_to: 'Deise' },
  { id: '2', company: 'TechStart App', contact: 'Marina Costa', value: 8500, probability: 50, status: 'qualificacao', assigned_to: 'Deise' },
  { id: '3', company: 'Café Blend', contact: 'Julio', value: 22000, probability: 70, status: 'proposta', assigned_to: 'Deise' },
  { id: '4', company: 'Clínica Sorriso', contact: 'Dra. Amanda', value: 5000, probability: 90, status: 'negociacao', assigned_to: 'Deise' },
  { id: '5', company: 'Ponto Cor', contact: 'Fernando', value: 12000, probability: 100, status: 'ganho', assigned_to: 'Deise' },
];

export function useDeals() {
  const [deals, setDeals] = useState(DEMO_DEALS);
  const [loading, setLoading] = useState(true);

  const fetchDeals = useCallback(async () => {
    if (!isSupabaseConfigured) { setLoading(false); return; }
    const { data, error } = await supabase.from('deals').select('*').order('created_at');
    if (!error && data) setDeals(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDeals();
    if (!isSupabaseConfigured) return;
    const channel = supabase
      .channel('deals-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deals' }, fetchDeals)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [fetchDeals]);

  const moveDeal = async (dealId, newStatus) => {
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, status: newStatus } : d));
    toast.success('Estágio do negócio atualizado');
    if (isSupabaseConfigured) {
      await supabase.from('deals').update({ status: newStatus }).eq('id', dealId);
    }
  };

  const createDeal = async (dealData) => {
    const newDeal = { ...dealData, id: crypto.randomUUID() };
    setDeals(prev => [...prev, newDeal]);
    toast.success('Novo negócio adicionado ao CRM!');
    if (isSupabaseConfigured) {
      await supabase.from('deals').insert(dealData);
    }
    return newDeal;
  };

  const deleteDeal = async (dealId) => {
    setDeals(prev => prev.filter(d => d.id !== dealId));
    toast.success('Negócio removido');
    if (isSupabaseConfigured) {
      await supabase.from('deals').delete().eq('id', dealId);
    }
  };

  return { deals, loading, moveDeal, createDeal, deleteDeal, refetch: fetchDeals };
}
