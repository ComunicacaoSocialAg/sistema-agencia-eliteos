import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Cache local usado apenas quando o Supabase não está configurado ou está fora do ar.
// Nunca há faturas pré-preenchidas: o financeiro começa vazio e só mostra o que foi emitido.
const LOCAL_KEY = 'csag_invoices_v2';

function readLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocal(items) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('Erro ao salvar faturas localmente:', e);
  }
}

// Fatura vencida e não paga passa a contar como atrasada, sem depender de alguém marcar manualmente.
function withComputedStatus(invoice) {
  if (invoice.status === 'pending' && invoice.due_date) {
    const today = new Date().toISOString().slice(0, 10);
    if (String(invoice.due_date).slice(0, 10) < today) {
      return { ...invoice, status: 'overdue' };
    }
  }
  return invoice;
}

export function useInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setInvoices(readLocal().map(withComputedStatus));
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, client:clients(id, name)')
        .order('due_date');
      if (error) throw error;
      setInvoices((data || []).map(withComputedStatus));
    } catch (e) {
      console.warn('[Invoices] Falha ao ler do Supabase, usando cache local:', e?.message);
      setInvoices(readLocal().map(withComputedStatus));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const sumBy = (status) => invoices
    .filter(i => i.status === status)
    .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  const mrr = sumBy('paid');
  const overdue = sumBy('overdue');
  const pending = sumBy('pending');
  const totalPipeline = invoices.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  const createInvoice = async (invoiceData) => {
    const payload = {
      client_id: invoiceData.client_id,
      service: invoiceData.service,
      amount: Number(invoiceData.amount) || 0,
      due_date: invoiceData.due_date,
      status: 'pending'
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('invoices')
        .insert(payload)
        .select('*, client:clients(id, name)')
        .single();
      if (error) {
        toast.error(`A cobrança não foi salva: ${error.message}`);
        return null;
      }
      setInvoices(prev => [...prev, withComputedStatus(data)]);
      toast.success('Cobrança emitida e salva no banco.');
      return data;
    }

    const local = { ...payload, id: `inv-${Date.now()}`, created_at: new Date().toISOString() };
    const updated = [...readLocal(), local];
    writeLocal(updated);
    setInvoices(updated.map(withComputedStatus));
    toast.success('Cobrança salva neste navegador (Supabase não configurado).');
    return local;
  };

  const updateInvoiceStatus = async (invoiceId, newStatus) => {
    const update = { status: newStatus, paid_at: newStatus === 'paid' ? new Date().toISOString() : null };

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('invoices').update(update).eq('id', invoiceId);
      if (error) {
        toast.error(`Não foi possível atualizar a fatura: ${error.message}`);
        return;
      }
    } else {
      writeLocal(readLocal().map(i => (i.id === invoiceId ? { ...i, ...update } : i)));
    }

    setInvoices(prev => prev.map(i => (i.id === invoiceId ? withComputedStatus({ ...i, ...update }) : i)));
    toast.success(newStatus === 'paid' ? 'Fatura marcada como paga.' : 'Status da fatura atualizado.');
  };

  return {
    invoices,
    loading,
    mrr,
    overdue,
    pending,
    totalPipeline,
    createInvoice,
    updateInvoiceStatus,
    refetch: fetchInvoices
  };
}
