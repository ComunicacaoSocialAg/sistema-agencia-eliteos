import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const DEMO_INVOICES = [];


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
