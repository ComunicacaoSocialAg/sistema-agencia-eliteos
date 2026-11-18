import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { areIdsMatching } from './useClients';

const LOCAL_KEY = 'csag_invoices_v2';
const INVOICE_FIELDS = '*, client:clients(id, name)';
const todayInBrazil = () => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date());

function readLocal() {
  try {
    const data = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function withComputedStatus(invoice) {
  return invoice.status === 'pending' && invoice.due_date && invoice.due_date < todayInBrazil()
    ? { ...invoice, status: 'overdue' }
    : invoice;
}

export function useInvoices() {
  const { isDemoMode, role } = useAuth();
  const remote = isSupabaseConfigured && !isDemoMode;
  const allowed = !remote || role === 'admin';
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchInvoices = useCallback(async () => {
    if (!allowed) return;
    setLoading(true);
    try {
      if (remote) {
        const { data, error } = await supabase.from('invoices').select(INVOICE_FIELDS).order('due_date');
        if (error) throw error;
        setInvoices(data.map(withComputedStatus));
      } else {
        setInvoices(readLocal().map(withComputedStatus));
      }
      setError('');
    } catch {
      setError('Não foi possível carregar as cobranças.');
    } finally {
      setLoading(false);
    }
  }, [allowed, remote]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const createInvoice = async ({ client_id, service, amount, due_date }) => {
    if (!allowed) return null;
    const value = Number(amount);
    if (!client_id || !service?.trim() || !Number.isFinite(value) || value <= 0 || !due_date) {
      toast.error('Preencha cliente, descrição, valor e vencimento.');
      return null;
    }
    const payload = { client_id, service: service.trim(), amount: value, due_date, status: 'pending' };
    try {
      let invoice;
      if (remote) {
        const { data, error } = await supabase.from('invoices').insert(payload).select(INVOICE_FIELDS).single();
        if (error || !data) throw error;
        invoice = data;
      } else {
        invoice = { ...payload, id: crypto.randomUUID(), created_at: new Date().toISOString() };
        localStorage.setItem(LOCAL_KEY, JSON.stringify([...readLocal(), invoice]));
      }
      setInvoices(items => [...items, withComputedStatus(invoice)]);
      toast.success('Cobrança registrada.');
      return invoice;
    } catch {
      toast.error('A cobrança não foi registrada. Confira os dados e tente novamente.');
      return null;
    }
  };

  const updateInvoiceStatus = async (id, status) => {
    if (!allowed || !['paid', 'cancelled'].includes(status)) return false;
    const update = { status, paid_at: status === 'paid' ? new Date().toISOString() : null };
    try {
      let invoice;
      if (remote) {
        const { data, error } = await supabase.from('invoices').update(update).eq('id', id)
          .in('status', ['pending', 'overdue']).select(INVOICE_FIELDS).single();
        if (error || !data) throw error;
        invoice = data;
      } else {
        const stored = readLocal();
        const current = stored.find(item => item.id === id);
        if (!current || !['pending', 'overdue'].includes(current.status)) return false;
        invoice = { ...current, ...update };
        localStorage.setItem(LOCAL_KEY, JSON.stringify(stored.map(item => item.id === id ? invoice : item)));
      }
      setInvoices(items => items.map(item => item.id === id ? invoice : item));
      toast.success(status === 'paid' ? 'Pagamento registrado.' : 'Cobrança cancelada.');
      return true;
    } catch {
      toast.error('A mudança não foi confirmada. Atualize a lista e tente novamente.');
      return false;
    }
  };

  const generateMonthlyInvoices = async (clients = [], targetMonth = todayInBrazil().slice(0, 7)) => {
    if (!allowed || !/^\d{4}-\d{2}$/.test(targetMonth)) return [];
    const activeClients = (clients || []).filter(c => c.status === 'active' && Number(c.monthly_fee) > 0);
    const pendingRows = activeClients
      .filter(client => !invoices.some(inv =>
        inv.status !== 'cancelled' &&
        String(inv.due_date || '').startsWith(targetMonth) &&
        areIdsMatching(inv.client_id, client.id, inv.client?.name, client.name)
      ))
      .map(client => {
        const day = Math.min(28, Math.max(1, Number(String(client.billing_day || '10').replace(/\D/g, '')) || 10));
        return {
          client_id: client.id,
          service: `Mensalidade Fee | ${client.name}`,
          amount: Number(client.monthly_fee),
          due_date: `${targetMonth}-${String(day).padStart(2, '0')}`,
          status: 'pending',
        };
      });

    if (pendingRows.length === 0) {
      toast.success('Todos os clientes ativos já possuem cobrança lançada para este mês.');
      return [];
    }

    try {
      let created = [];
      if (remote) {
        const { data, error } = await supabase.from('invoices').insert(pendingRows).select(INVOICE_FIELDS);
        if (error) throw error;
        created = data || [];
      } else {
        created = pendingRows.map(row => ({
          ...row,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
        }));
        localStorage.setItem(LOCAL_KEY, JSON.stringify([...readLocal(), ...created]));
      }
      setInvoices(items => [...items, ...created.map(withComputedStatus)]);
      toast.success(`${created.length} mensalidade(s) gerada(s) para ${targetMonth.split('-').reverse().join('/')}.`);
      return created;
    } catch {
      toast.error('Não foi possível gerar as mensalidades do mês.');
      return [];
    }
  };

  const visible = allowed ? invoices : [];
  const sum = (filter) => visible.filter(filter).reduce((total, item) => total + (Number(item.amount) || 0), 0);
  return {
    invoices: visible, loading: allowed && loading, error,
    mrr: sum(item => item.status === 'paid' && item.paid_at?.startsWith(todayInBrazil().slice(0, 7))),
    overdue: sum(item => item.status === 'overdue'),
    pending: sum(item => item.status === 'pending'),
    totalPipeline: sum(item => item.status !== 'cancelled'),
    createInvoice, updateInvoiceStatus, generateMonthlyInvoices, refetch: fetchInvoices,
  };
}
