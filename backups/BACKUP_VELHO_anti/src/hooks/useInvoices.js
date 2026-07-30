import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const DEMO_INVOICES = [
  { id: '1', client: { name: 'Ponto Cor' }, service: 'Mensalidade Fee Maio', amount: 15000, status: 'paid', due_date: '2026-05-01' },
  { id: '2', client: { name: 'TechStart App' }, service: 'Identidade Visual V2', amount: 4500, status: 'pending', due_date: '2026-05-05' },
  { id: '3', client: { name: 'Café Blend' }, service: 'Campanha Tráfego', amount: 2000, status: 'overdue', due_date: '2026-04-25' },
  { id: '4', client: { name: 'Clínica Sorriso' }, service: 'Gestão Redes Sociais', amount: 3500, status: 'paid', due_date: '2026-05-02' },
];

export function useInvoices() {
  const [invoices, setInvoices] = useState(DEMO_INVOICES);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = useCallback(async () => {
    if (!isSupabaseConfigured) { setLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, client:clients(name)')
        .order('due_date');
      if (!error && data) setInvoices(data);
    } catch (e) {
      console.warn('[Invoices] Error:', e?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const mrr = invoices
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + (i.amount || 0), 0);

  const overdue = invoices
    .filter(i => i.status === 'overdue')
    .reduce((sum, i) => sum + (i.amount || 0), 0);

  const totalPipeline = invoices.reduce((sum, i) => sum + (i.amount || 0), 0);

  const createInvoice = async (invoiceData) => {
    const newInvoice = { ...invoiceData, id: crypto.randomUUID() };
    setInvoices(prev => [...prev, newInvoice]);
    toast.success('Cobrança criada!');
    if (isSupabaseConfigured) {
      await supabase.from('invoices').insert(invoiceData);
    }
    return newInvoice;
  };

  const updateInvoiceStatus = async (invoiceId, newStatus) => {
    setInvoices(prev => prev.map(i => i.id === invoiceId ? { ...i, status: newStatus, ...(newStatus === 'paid' ? { paid_at: new Date().toISOString() } : {}) } : i));
    toast.success(newStatus === 'paid' ? 'Fatura marcada como paga!' : 'Status atualizado!');
    if (isSupabaseConfigured) {
      const update = { status: newStatus };
      if (newStatus === 'paid') update.paid_at = new Date().toISOString();
      await supabase.from('invoices').update(update).eq('id', invoiceId);
    }
  };

  return { invoices, loading, mrr, overdue, totalPipeline, createInvoice, updateInvoiceStatus, refetch: fetchInvoices };
}
