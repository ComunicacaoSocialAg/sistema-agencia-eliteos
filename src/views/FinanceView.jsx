import { useState, useMemo } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Download, 
  X, 
  Plus, 
  Target, 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar,
  Wallet,
  CheckCircle2
} from 'lucide-react';
import { format, parseISO, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { useInvoices } from '../hooks/useInvoices';
import { useProfitability } from '../hooks/useProfitability';
import { useClients } from '../hooks/useClients';
import { useActiveClient } from '../contexts/ActiveClientContext';
import { cn } from '../utils/cn';

function formatDate(dateStr) {
  try { return format(parseISO(dateStr), "dd/MM/yyyy", { locale: ptBR }); }
  catch { return dateStr || '—'; }
}

// Modal de Nova Cobrança
function NewInvoiceModal({ onClose, onSave, clients = [] }) {
  const [form, setForm] = useState({ client: '', service: '', amount: '', due_date: '', status: 'pending' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      client_id: form.client, // We'll pass the ID, but for the mock 'client' name might be needed. The hook can resolve it, but for now we pass ID to 'client' field if needed. To be safe, we'll just pass form.client as client_id and service/amount.
      client: form.client, // we store the ID here
      service: form.service,
      amount: Number(form.amount),
      due_date: form.due_date,
      status: 'pending'
    });
    onClose();
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
              <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
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
            <button type="submit"
              className="flex-1 bg-cs-primary hover:bg-cs-primary-hover text-white py-2 rounded-lg text-sm font-medium transition-colors">
              Criar Cobrança
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function FinanceView() {
  const { selectedClient, isAllClients, matchesSelectedClient } = useActiveClient();
  const { invoices, mrr, overdue, totalPipeline, createInvoice, updateInvoiceStatus } = useInvoices();
  const { data: profitability = [] } = useProfitability();
  const { clients = [] } = useClients();
  const [showNewModal, setShowNewModal] = useState(false);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

  // Filtrar faturas pelo cliente selecionado
  const displayedInvoices = useMemo(() => {
    if (isAllClients) return invoices;
    return invoices.filter(i => matchesSelectedClient(i.client_id) || (i.client && matchesSelectedClient(i.client.id)));
  }, [invoices, isAllClients, matchesSelectedClient]);

  const clientFee = !isAllClients && selectedClient ? Number(selectedClient.monthly_fee || 0) : mrr;
  const clientPaid = displayedInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const clientPending = displayedInvoices.filter(i => i.status === 'pending').reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const overdueCount = displayedInvoices.filter(i => i.status === 'overdue').length;
  const displayedOverdue = displayedInvoices.filter(i => i.status === 'overdue').reduce((s, i) => s + (Number(i.amount) || 0), 0);

  // Recebíveis reais: faturas não pagas agrupadas por mês de vencimento
  const receivablesByMonth = useMemo(() => {
    const groups = {};
    displayedInvoices
      .filter(i => i.status !== 'paid' && i.due_date)
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
  }, [displayedInvoices]);

  return (
    <div className="h-full flex flex-col bg-cs-bg p-8 overflow-y-auto custom-scrollbar">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">Inteligência Financeira</h2>
          <p className="text-cs-text-secondary text-sm">
            {selectedClient 
              ? `Gestão financeira e contratos de: ${selectedClient.name}`
              : 'Visão consolidada de receitas e faturas da agência'}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowNewModal(true)}
            className="bg-cs-primary hover:bg-yellow-400 text-black px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-cs-primary/20 flex items-center gap-1.5"
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-cs-surface border border-cs-border rounded-xl p-5">
          <p className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest mb-1">
            {selectedClient ? 'Fee Mensal Contratado' : 'MRR da Agência'}
          </p>
          <div className="text-xl font-bold text-white">{formatCurrency(clientFee)}</div>
          <div className="flex items-center gap-1 text-[10px] text-green-400 mt-2 font-bold">
            <CheckCircle2 size={12} /> Contrato formal ativo
          </div>
        </div>
        <div className="bg-cs-surface border border-cs-border rounded-xl p-5">
          <p className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest mb-1">Total Recebido no Mês</p>
          <div className="text-xl font-bold text-emerald-400">{formatCurrency(clientPaid)}</div>
          <div className="text-[10px] text-cs-text-secondary mt-2">Faturas liquidadas</div>
        </div>
        <div className="bg-cs-surface border border-cs-border rounded-xl p-5">
          <p className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest mb-1">A Receber / Pendente</p>
          <div className="text-xl font-bold text-yellow-400">{formatCurrency(clientPending)}</div>
          <div className="text-[10px] text-cs-text-secondary mt-2">Vencimentos programados</div>
        </div>
        <div className="bg-cs-surface border border-cs-border rounded-xl p-5">
          <p className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest mb-1">Inadimplência</p>
          <div className="text-xl font-bold text-red-400">{formatCurrency(displayedOverdue)}</div>
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
              Nenhuma fatura em aberto. Emita a cobrança do mês em "Nova Cobrança".
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
      <div className="bg-cs-surface border border-cs-border rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-cs-border flex justify-between items-center bg-cs-surface-hover/30">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar size={18} className="text-cs-primary" /> Faturamento Detalhado
          </h3>
          <span className="text-xs text-cs-text-secondary font-medium">{displayedInvoices.length} faturas encontradas</span>
        </div>
        <div className="overflow-x-auto">
          {displayedInvoices.length === 0 ? (
            <div className="p-12 text-center text-xs text-cs-text-secondary">
              Nenhuma fatura registrada para este cliente ainda. Clique em "Nova Cobrança" para emitir um lançamento.
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
                      "bg-red-500/10 text-red-400 border-red-500/20"
                    )}>
                      {invoice.status === 'paid' ? 'Pago' : invoice.status === 'pending' ? 'Pendente' : 'Atrasado'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right flex items-center justify-end gap-2">
                    {invoice.status !== 'paid' ? (
                      <button 
                        onClick={() => updateInvoiceStatus(invoice.id, 'paid')}
                        className="flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white rounded transition-colors text-xs font-bold"
                        title="Marcar como Pago"
                      >
                        <CheckCircle2 size={14} /> Marcar Pago
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 text-green-500 font-bold text-xs"><CheckCircle2 size={14} /> Pago</span>
                    )}
                    <button className="p-2 text-cs-text-secondary hover:text-cs-primary hover:bg-cs-primary/5 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                      <Download size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {showNewModal && <NewInvoiceModal onClose={() => setShowNewModal(false)} onSave={createInvoice} clients={clients} />}
    </div>
  );
}
