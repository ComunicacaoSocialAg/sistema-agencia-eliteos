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
  const { invoices, mrr, overdue, totalPipeline, createInvoice, updateInvoiceStatus } = useInvoices();
  const { data: profitability, loading: loadingProfits } = useProfitability();
  const { clients } = useClients();
  const [showNewModal, setShowNewModal] = useState(false);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

  // Projeção de Fluxo de Caixa (Próximos 3 meses)
  const cashFlowProjection = useMemo(() => {
    const months = [0, 1, 2];
    return months.map(m => {
      const date = addMonths(new Date(), m);
      return {
        month: format(date, 'MMM', { locale: ptBR }),
        entrada: mrr * (1 + (m * 0.1)), // Projeção otimista de 10% crescimento
        saida: (mrr * 0.6)
      };
    });
  }, [mrr]);

  const overdueCount = invoices.filter(i => i.status === 'overdue').length;
  const grossRevenue = totalPipeline;
  const expenses = 24500;
  const taxes = 4200;
  const netProfit = grossRevenue - expenses - taxes;
  const margin = grossRevenue > 0 ? ((netProfit / grossRevenue) * 100).toFixed(1) : '0.0';

  return (
    <div className="h-full flex flex-col bg-cs-bg p-8 overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">Inteligência Financeira</h2>
          <p className="text-cs-text-secondary">Visibilidade de margem, lucratividade e projeção de caixa.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowNewModal(true)}
            className="bg-cs-primary hover:bg-cs-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-cs-primary/20 flex items-center gap-2"
          >
            <Plus size={16} /> Nova Cobrança
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-cs-surface border border-cs-border rounded-xl p-5">
          <p className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest mb-1">MRR Atual</p>
          <div className="text-xl font-bold text-white">{formatCurrency(mrr)}</div>
          <div className="flex items-center gap-1 text-[10px] text-green-400 mt-2 font-bold">
            <ArrowUpRight size={12} /> +12% vs mês anterior
          </div>
        </div>
        <div className="bg-cs-surface border border-cs-border rounded-xl p-5">
          <p className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest mb-1">Margem Líquida</p>
          <div className="text-xl font-bold text-white">{margin}%</div>
          <div className="w-full bg-cs-bg h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-cs-primary h-full" style={{ width: `${margin}%` }}></div>
          </div>
        </div>
        <div className="bg-cs-surface border border-cs-border rounded-xl p-5">
          <p className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest mb-1">Inadimplência</p>
          <div className="text-xl font-bold text-red-400">{formatCurrency(overdue)}</div>
          <div className="text-[10px] text-cs-text-secondary mt-2">{overdueCount} faturas em aberto</div>
        </div>
        <div className="bg-cs-surface border border-cs-border rounded-xl p-5">
          <p className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest mb-1">Custo Operacional</p>
          <div className="text-xl font-bold text-white">{formatCurrency(expenses)}</div>
          <div className="text-[10px] text-cs-text-secondary mt-2">Fixo + Variáveis</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Profitability Bar Chart */}
        <div className="lg:col-span-2 bg-cs-surface border border-cs-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Target size={20} className="text-cs-primary" /> Lucratividade por Cliente
            </h3>
            <div className="text-[10px] font-bold text-cs-text-secondary uppercase">Ranking de Margem (%)</div>
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

        {/* Cash Flow Projection */}
        <div className="bg-cs-surface border border-cs-border rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Wallet size={20} className="text-green-400" /> Projeção de Caixa
          </h3>
          <div className="space-y-6">
            {cashFlowProjection.map((item, i) => (
              <div key={i} className="bg-cs-bg/50 border border-cs-border rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-white uppercase">{item.month} 2026</span>
                  <div className="flex items-center gap-1 text-[10px] text-green-400 font-bold">
                    <ArrowUpRight size={12} /> PROJETADO
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-cs-text-secondary mb-1">Entradas</p>
                    <p className="text-sm font-bold text-white">{formatCurrency(item.entrada)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-cs-text-secondary mb-1">Saídas (Est.)</p>
                    <p className="text-sm font-bold text-red-400">-{formatCurrency(item.saida)}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-cs-border flex justify-between items-center">
                  <span className="text-[10px] text-cs-text-secondary uppercase">Saldo Previsto</span>
                  <span className="text-sm font-bold text-cs-primary">{formatCurrency(item.entrada - item.saida)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Tables */}
      <div className="bg-cs-surface border border-cs-border rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-cs-border flex justify-between items-center bg-cs-surface-hover/30">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar size={18} className="text-cs-primary" /> Faturamento Detalhado
          </h3>
          <span className="text-xs text-cs-text-secondary font-medium">{invoices.length} faturas registradas</span>
        </div>
        <div className="overflow-x-auto">
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
              {invoices.map((invoice) => (
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
        </div>
      </div>

      {showNewModal && <NewInvoiceModal onClose={() => setShowNewModal(false)} onSave={createInvoice} clients={clients} />}
    </div>
  );
}
