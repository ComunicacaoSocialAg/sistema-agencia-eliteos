import { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Target, 
  Calendar,
  Wallet,
  CheckCircle2,
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import toast from 'react-hot-toast';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  Cell
} from 'recharts';
import { useInvoices } from '../hooks/useInvoices';
import { useProfitability } from '../hooks/useProfitability';
import { useClients, areIdsMatching } from '../hooks/useClients';
import { useActiveClient } from '../contexts/ActiveClientContext';
import { useAIAssistant } from '../contexts/AIAssistantContext';
import { cn } from '../utils/cn';

function formatDate(dateStr) {
  try { return format(parseISO(dateStr), "dd/MM/yyyy", { locale: ptBR }); }
  catch { return dateStr || '-'; }
}

// Modal de Nova Cobrança
function NewInvoiceModal({ onClose, onSave, clients = [] }) {
  const [form, setForm] = useState({ client: '', service: '', amount: '', due_date: '', status: 'pending' });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    const saved = await onSave({
      client_id: form.client,
      service: form.service,
      amount: Number(form.amount),
      due_date: form.due_date,
    });
    setSaving(false);
    if (saved) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-cs-surface border border-cs-border rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-cs-border flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Nova Cobrança</h2>
          <button onClick={onClose} className="text-cs-text-secondary hover:text-white p-1"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs text-cs-text-secondary mb-1 block">Cliente</label>
            <select value={form.client} onChange={e => setForm(f => ({ ...f, client: e.target.value }))} required
              className="w-full bg-cs-bg border border-cs-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cs-primary">
              <option value="">Selecione um cliente</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-cs-text-secondary mb-1 block">Serviço / Descrição</label>
            <input value={form.service} onChange={e => setForm(f => ({ ...f, service: e.target.value }))}
              placeholder="Ex: Mensalidade Fee" required
              className="w-full bg-cs-bg border border-cs-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cs-primary" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-cs-text-secondary mb-1 block">Valor (R$)</label>
              <input type="number" min="0.01" max="99999999.99" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="5000" required
                className="w-full bg-cs-bg border border-cs-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cs-primary" />
            </div>
            <div>
              <label className="text-xs text-cs-text-secondary mb-1 block">Vencimento</label>
              <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} required
                className="w-full bg-cs-bg border border-cs-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cs-primary" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-cs-border text-cs-text-secondary hover:text-white py-2 rounded-lg text-sm transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-cs-primary hover:bg-cs-primary-hover text-black py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer">
              {saving ? 'Registrando…' : 'Registrar cobrança'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function FinanceView() {
  const { selectedClient, isAllClients, matchesSelectedClient } = useActiveClient();
  const { setContext } = useAIAssistant();
  const { invoices, loading, error, refetch, createInvoice, updateInvoiceStatus, generateMonthlyInvoices } = useInvoices();
  const { data: profitability = [] } = useProfitability();
  const { clients = [] } = useClients();
  const [showNewModal, setShowNewModal] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState(null);
  const [generatingBatch, setGeneratingBatch] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const handleInvoiceStatus = async (id, status) => {
    if (pendingUpdate || (status === 'cancelled' && !window.confirm('Cancelar esta cobrança?'))) return;
    setPendingUpdate(id);
    try { await updateInvoiceStatus(id, status); }
    finally { setPendingUpdate(null); }
  };

  const handleGenerateMonth = async () => {
    if (generatingBatch) return;
    setGeneratingBatch(true);
    try {
      const targetClients = isAllClients || !selectedClient ? clients : [selectedClient];
      await generateMonthlyInvoices(targetClients);
    } finally {
      setGeneratingBatch(false);
    }
  };

  const handleSendWhatsAppReminder = async (invoice) => {
    const clientObj = clients.find(c =>
      areIdsMatching(c.id, invoice.client_id, c.name, invoice.client?.name || invoice.client)
    );
    const contactName = clientObj?.contact_name || clientObj?.name || invoice.client?.name || 'parceiro';
    const msg = `Olá, ${contactName}! Tudo bem?\n\nPassando para lembrar sobre o faturamento da Comunicação Social Ag:\n• Serviço: ${invoice.service}\n• Valor: ${formatCurrency(invoice.amount)}\n• Vencimento: ${formatDate(invoice.due_date)}\n\nCaso já tenha realizado o pagamento, por favor desconsidere ou nos envie o comprovante por aqui. Qualquer dúvida, estamos à disposição!`;
    try {
      await navigator.clipboard.writeText(msg);
      toast.success('Mensagem de cobrança copiada para o WhatsApp.');
    } catch {
      toast.success('Mensagem preparada.');
    }
    const rawDigits = String(clientObj?.contact_phone || '').replace(/\D/g, '');
    if (rawDigits.length >= 10) {
      const phone = rawDigits.length <= 11 ? `55${rawDigits}` : rawDigits;
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
    }
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

  // Filtrar faturas pelo cliente selecionado
  const displayedInvoices = useMemo(() => {
    const byClient = isAllClients
      ? invoices
      : invoices.filter(i => matchesSelectedClient(i.client_id) || (i.client && matchesSelectedClient(i.client.id)));
    if (statusFilter === 'all') return byClient;
    return byClient.filter(i => i.status === statusFilter);
  }, [invoices, isAllClients, matchesSelectedClient, statusFilter]);

  const clientInvoicesScope = useMemo(() => {
    if (isAllClients) return invoices;
    return invoices.filter(i => matchesSelectedClient(i.client_id) || (i.client && matchesSelectedClient(i.client.id)));
  }, [invoices, isAllClients, matchesSelectedClient]);

  const clientFee = !isAllClients && selectedClient ? Number(selectedClient.monthly_fee || 0) : clients.filter(client => client.status === 'active').reduce((total, client) => total + (Number(client.monthly_fee) || 0), 0);
  const clientPaid = clientInvoicesScope.filter(i => i.status === 'paid').reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const clientPending = clientInvoicesScope.filter(i => i.status === 'pending').reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const overdueCount = clientInvoicesScope.filter(i => i.status === 'overdue').length;
  const displayedOverdue = clientInvoicesScope.filter(i => i.status === 'overdue').reduce((s, i) => s + (Number(i.amount) || 0), 0);

  useEffect(() => {
    setContext({
      module: 'financeiro',
      title: selectedClient ? `Financeiro: ${selectedClient.name}` : 'Financeiro da Agência',
      data: {
        fee_contratado: clientFee,
        recebido: clientPaid,
        pendente: clientPending,
        inadimplencia: displayedOverdue,
        total_faturas: clientInvoicesScope.length,
      },
    });
  }, [setContext, selectedClient, clientFee, clientPaid, clientPending, displayedOverdue, clientInvoicesScope.length]);

  // Recebíveis reais: faturas não pagas agrupadas por mês de vencimento
  const receivablesByMonth = useMemo(() => {
    const groups = {};
    clientInvoicesScope
      .filter(i => ['pending', 'overdue'].includes(i.status) && i.due_date)
      .forEach(i => {
        const key = String(i.due_date).slice(0, 7);
        if (!groups[key]) {
          let label = key;
          try { label = format(parseISO(`${key}-01`), 'MMMM yyyy', { locale: ptBR }); } catch { /* mantém a chave */ }
          groups[key] = { key, label, total: 0, count: 0 };
        }
        groups[key].total += Number(i.amount) || 0;
        groups[key].count += 1;
      });
    return Object.values(groups).sort((a, b) => a.key.localeCompare(b.key));
  }, [clientInvoicesScope]);

  return (
    <div className="h-full bg-cs-bg p-4 sm:p-8 pb-28 overflow-y-auto custom-scrollbar">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">Inteligência Financeira</h2>
          <p className="text-cs-text-secondary text-sm">
            {selectedClient 
              ? `Gestão financeira e contratos de: ${selectedClient.name}`
              : 'Visão consolidada de receitas e faturas da agência'}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleGenerateMonth}
            disabled={generatingBatch || loading}
            className="bg-cs-surface hover:bg-cs-surface-hover border border-cs-border text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={generatingBatch ? 'animate-spin' : ''} />
            {generatingBatch ? 'Gerando...' : 'Gerar Mensalidades do Mês'}
          </button>
          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            className="bg-cs-primary hover:bg-yellow-400 text-black px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-cs-primary/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={16} /> Nova Cobrança
          </button>
        </div>
      </div>

      {/* Banner de Contrato do Cliente se selecionado */}
      {!isAllClients && selectedClient && (
        <div className="bg-cs-surface border border-cs-border rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cs-primary/10 border border-cs-primary/30 text-cs-primary flex items-center justify-center font-bold">
              <Wallet size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-cs-text-secondary tracking-widest block">Contrato Vigente</span>
              <h3 className="text-sm font-bold text-white">{selectedClient.name}</h3>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs">
            <div>
              <span className="text-cs-text-secondary block text-[10px]">Fee Mensal Contratado:</span>
              <strong className="text-white font-mono text-sm">{formatCurrency(selectedClient.monthly_fee)}</strong>
            </div>
            <div>
              <span className="text-cs-text-secondary block text-[10px]">Dia de Vencimento:</span>
              <strong className="text-white font-mono text-sm">Todo dia {selectedClient.billing_day || '10'}</strong>
            </div>
            <div>
              <span className="text-cs-text-secondary block text-[10px]">Status do Contrato:</span>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold text-[10px] uppercase">
                {selectedClient.status === 'active' ? 'Ativo' : selectedClient.status}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Reais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <div className="bg-cs-surface border border-cs-border rounded-xl p-5 min-w-0">
          <p className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest mb-1">
            {selectedClient ? 'Fee Mensal Contratado' : 'MRR da Agência'}
          </p>
          <div className="text-lg xl:text-xl font-bold text-white break-words">{formatCurrency(clientFee)}</div>
          <div className="flex items-center gap-1 text-[10px] text-green-400 mt-2 font-bold">
            <CheckCircle2 size={12} /> Contrato formal ativo
          </div>
        </div>
        <div className="bg-cs-surface border border-cs-border rounded-xl p-5 min-w-0">
          <p className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest mb-1">Total Recebido no Mês</p>
          <div className="text-lg xl:text-xl font-bold text-emerald-400 break-words">{formatCurrency(clientPaid)}</div>
          <div className="text-[10px] text-cs-text-secondary mt-2">Faturas liquidadas</div>
        </div>
        <div className="bg-cs-surface border border-cs-border rounded-xl p-5 min-w-0">
          <p className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest mb-1">A Receber / Pendente</p>
          <div className="text-lg xl:text-xl font-bold text-yellow-400 break-words">{formatCurrency(clientPending)}</div>
          <div className="text-[10px] text-cs-text-secondary mt-2">Vencimentos programados</div>
        </div>
        <div className="bg-cs-surface border border-cs-border rounded-xl p-5 min-w-0">
          <p className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest mb-1">Inadimplência</p>
          <div className="text-lg xl:text-xl font-bold text-red-400 break-words">{formatCurrency(displayedOverdue)}</div>
          <div className="text-[10px] text-cs-text-secondary mt-2">{overdueCount} faturas em atraso</div>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Profitability Bar Chart */}
        <div className="lg:col-span-2 bg-cs-surface border border-cs-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Target size={20} className="text-cs-primary" /> Lucratividade por Cliente
            </h3>
            <div className="text-[10px] font-bold text-cs-text-secondary text-right">
              Fee contratado menos horas cronometradas no Kanban<br />
              <span className="text-yellow-400">Custo/hora: R$ 50 padrão [PREENCHER valor real em Gestão]</span>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitability} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="#888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  width={100}
                />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-cs-surface border border-cs-border p-3 rounded-lg shadow-2xl">
                          <p className="text-xs font-bold text-white mb-2">{data.name}</p>
                          <div className="space-y-1">
                            <div className="flex justify-between gap-4 text-[10px]">
                              <span className="text-cs-text-secondary">Receita:</span>
                              <span className="text-white font-bold">{formatCurrency(data.revenue)}</span>
                            </div>
                            <div className="flex justify-between gap-4 text-[10px]">
                              <span className="text-cs-text-secondary">Margem:</span>
                              <span className={cn("font-bold", data.margin > 40 ? "text-green-400" : "text-yellow-400")}>
                                {data.margin.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="margin" radius={[0, 4, 4, 0]} barSize={20}>
                  {profitability.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.margin > 50 ? '#00f2fe' : entry.margin > 30 ? '#3b82f6' : '#f87171'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recebíveis reais: faturas em aberto agrupadas por mês de vencimento */}
        <div className="bg-cs-surface border border-cs-border rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
            <Wallet size={20} className="text-green-400" /> Recebíveis em Aberto
          </h3>
          <p className="text-[11px] text-cs-text-secondary mb-5">Somente faturas emitidas e ainda não pagas.</p>
          {receivablesByMonth.length === 0 ? (
            <div className="bg-cs-bg/50 border border-cs-border rounded-xl p-4 text-xs text-cs-text-secondary">
              Nenhuma fatura em aberto. Clique em "Gerar Mensalidades do Mês" ou em "Nova Cobrança".
            </div>
          ) : (
            <div className="space-y-3">
              {receivablesByMonth.map(item => (
                <div key={item.key} className="bg-cs-bg/50 border border-cs-border rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-white capitalize block">{item.label}</span>
                    <span className="text-[10px] text-cs-text-secondary">{item.count} fatura{item.count === 1 ? '' : 's'}</span>
                  </div>
                  <span className="text-sm font-bold text-cs-primary font-mono">{formatCurrency(item.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Tables */}
      <div className="bg-cs-surface border border-cs-border rounded-2xl overflow-hidden shrink-0">
        <div className="p-4 sm:p-6 border-b border-cs-border flex flex-wrap justify-between items-center gap-3 bg-cs-surface-hover/30">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar size={18} className="text-cs-primary" /> Faturamento Detalhado
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'Todas' },
              { id: 'pending', label: 'Pendentes' },
              { id: 'overdue', label: 'Atrasadas' },
              { id: 'paid', label: 'Pagas' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={cn(
                  'px-3 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer',
                  statusFilter === tab.id
                    ? 'bg-cs-primary text-black border-cs-primary'
                    : 'bg-cs-bg text-cs-text-secondary border-cs-border hover:text-white'
                )}
              >
                {tab.label}
              </button>
            ))}
            <span className="text-xs text-cs-text-secondary font-medium ml-2">{displayedInvoices.length} fatura(s)</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? <p className="p-8 text-sm" role="status">Carregando cobranças…</p> : error ? (
            <p className="p-8 text-sm text-red-300" role="alert">
              {error} <button type="button" className="underline" onClick={refetch}>Tentar novamente</button>
            </p>
          ) : displayedInvoices.length === 0 ? (
            <div className="p-12 text-center text-xs text-cs-text-secondary">
              Nenhuma fatura encontrada para este filtro. Use "Gerar Mensalidades do Mês" ou "Nova Cobrança".
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-cs-text-secondary border-b border-cs-border bg-cs-bg/50 uppercase tracking-widest font-bold">
                  <th className="px-8 py-4">Cliente / Serviço</th>
                  <th className="px-8 py-4">Valor</th>
                  <th className="px-8 py-4">Vencimento</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-cs-border/50">
                {displayedInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-cs-bg/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="font-bold text-white">{invoice.client?.name || invoice.client}</div>
                    <div className="text-[11px] text-cs-text-secondary mt-0.5">{invoice.service}</div>
                  </td>
                  <td className="px-8 py-5 font-mono font-bold text-white">{formatCurrency(invoice.amount)}</td>
                  <td className="px-8 py-5 text-cs-text-secondary">{formatDate(invoice.due_date)}</td>
                  <td className="px-8 py-5">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                      invoice.status === 'paid' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                      invoice.status === 'pending' ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                      invoice.status === 'cancelled' ? "bg-cs-bg text-cs-text-secondary border-cs-border" :
                      "bg-red-500/10 text-red-400 border-red-500/20"
                    )}>
                      {invoice.status === 'paid' ? 'Pago' : invoice.status === 'pending' ? 'Pendente' : invoice.status === 'cancelled' ? 'Cancelada' : 'Atrasada'}
                    </span>
                  </td>
                  <td className="px-6 sm:px-8 py-5 text-right">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      {['pending', 'overdue'].includes(invoice.status) && (
                        <>
                          <button type="button"
                            onClick={() => handleSendWhatsAppReminder(invoice)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 rounded text-xs font-bold cursor-pointer">
                            <MessageSquare size={13} /> Cobrar WhatsApp
                          </button>
                          <button type="button" disabled={Boolean(pendingUpdate)}
                            onClick={() => handleInvoiceStatus(invoice.id, 'paid')}
                            className="flex items-center gap-1 px-2.5 py-1 bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white rounded text-xs font-bold cursor-pointer">
                            <CheckCircle2 size={14} /> Registrar pagamento
                          </button>
                          <button type="button" disabled={Boolean(pendingUpdate)}
                            onClick={() => handleInvoiceStatus(invoice.id, 'cancelled')}
                            className="px-2 py-1 text-cs-text-secondary hover:text-white text-xs cursor-pointer">
                            Cancelar cobrança
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {showNewModal && <NewInvoiceModal onClose={() => setShowNewModal(false)} onSave={createInvoice} clients={clients} />}
      <div className="h-20 shrink-0" aria-hidden="true" />
    </div>
  );
}
