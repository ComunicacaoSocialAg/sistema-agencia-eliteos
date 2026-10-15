import React, { useState } from 'react';
import { 
  BarChart3, TrendingUp, DollarSign, Target, Plus, 
  ExternalLink, Trash2, CheckCircle2, AlertTriangle, ShieldCheck, 
  Save, X, Filter, Sparkles, Layers 
} from 'lucide-react';
import { useCampaignManagement } from '../hooks/useCampaignManagement';
import { useActiveClient } from '../contexts/ActiveClientContext';
import toast from 'react-hot-toast';
import { cn } from '../utils/cn';

const STATUS_CONFIG = {
  planejamento: { label: 'Planejamento', color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
  ativa: { label: 'Ativa no Ar', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  pausada: { label: 'Pausada / Otimização', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  encerrada: { label: 'Encerrada', color: 'bg-red-500/10 text-red-400 border-red-500/20' }
};

export default function PaidMediaView() {
  const { selectedClient, isAllClients, clients } = useActiveClient();
  const { campaigns, reports, loading, createCampaign, updateCampaignStatus, deleteCampaign, addCampaignReport } = useCampaignManagement();

  const [platformFilter, setPlatformFilter] = useState('todas');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Form de nova campanha
  const [newCampaign, setNewCampaign] = useState({
    client_id: selectedClient?.id || clients[0]?.id || '',
    name: '',
    platform: 'Meta Ads',
    objective: 'Leads',
    budget_monthly: '',
    budget_daily: '',
    status: 'ativa',
    ad_url: '',
    results_summary: ''
  });

  // Form de prestação de contas mensal
  const [newReport, setNewReport] = useState({
    client_id: selectedClient?.id || clients[0]?.id || '',
    period_label: 'Outubro/2026',
    invested_amount: '',
    conversions_count: '',
    cpa_real: '',
    diagnosis: ''
  });

  const isMedicalClient = selectedClient?.document_id?.includes('CRM') || selectedClient?.name?.includes('Dr.');

  const filteredCampaigns = campaigns.filter(c => {
    if (platformFilter === 'todas') return true;
    return c.platform.toLowerCase().includes(platformFilter.toLowerCase());
  });

  const totalMonthlyBudget = filteredCampaigns.reduce((acc, c) => acc + (Number(c.budget_monthly) || 0), 0);
  const totalDailyBudget = filteredCampaigns.reduce((acc, c) => acc + (Number(c.budget_daily) || 0), 0);

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    if (!newCampaign.name.trim()) {
      toast.error('Informe o nome da campanha.');
      return;
    }

    await createCampaign({
      ...newCampaign,
      client_id: isAllClients ? (newCampaign.client_id || clients[0]?.id) : (selectedClient?.id || clients[0]?.id),
      budget_monthly: Number(newCampaign.budget_monthly) || 0,
      budget_daily: Number(newCampaign.budget_daily) || 0
    });

    setShowAddModal(false);
    setNewCampaign({
      client_id: selectedClient?.id || clients[0]?.id || '',
      name: '',
      platform: 'Meta Ads',
      objective: 'Leads',
      budget_monthly: '',
      budget_daily: '',
      status: 'ativa',
      ad_url: '',
      results_summary: ''
    });
  };

  const handleAddReport = async (e) => {
    e.preventDefault();
    if (!newReport.period_label.trim()) {
      toast.error('Informe o período do relatório.');
      return;
    }

    await addCampaignReport({
      ...newReport,
      client_id: isAllClients ? (newReport.client_id || clients[0]?.id) : (selectedClient?.id || clients[0]?.id)
    });

    setShowReportModal(false);
  };

  return (
    <div className="h-full flex flex-col bg-cs-bg text-cs-text-primary overflow-hidden">
      {/* Header */}
      <header className="bg-cs-surface border-b border-cs-border px-6 py-4 shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cs-primary text-black font-black flex items-center justify-center shadow-lg shadow-cs-primary/10 shrink-0">
              <BarChart3 size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Mídia Paga & Tráfego</h1>
                <span className="text-[10px] uppercase tracking-wider font-bold bg-cs-primary/10 text-cs-primary border border-cs-primary/30 px-2 py-0.5 rounded-md">
                  Controle Real de Verba
                </span>
              </div>
              <p className="text-xs text-cs-text-secondary">
                {selectedClient ? `Campanhas e investimento sob gestão de: ${selectedClient.name}` : 'Visão geral de campanhas ativas de toda a agência'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowReportModal(true)}
              className="bg-cs-bg hover:bg-white/5 border border-cs-border text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Save size={15} /> Prestação de Contas
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-cs-primary hover:bg-yellow-400 text-black px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-cs-primary/20"
            >
              <Plus size={16} /> Nova Campanha
            </button>
          </div>
        </div>

        {/* Alerta de Conformidade Médica se aplicável */}
        {isMedicalClient && (
          <div className="mt-3 bg-blue-500/10 border border-blue-500/30 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs text-blue-300">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-blue-400 shrink-0" />
              <span>
                <strong>Normativa CFM 2.336/2023:</strong> É vedado anúncio com preço promocional, promessa de resultado ou apelo sensacionalista. O RQE 15412 deve constar nos criativos.
              </span>
            </div>
            <span className="text-[10px] bg-blue-500/20 px-2 py-0.5 rounded font-mono font-bold">CFM 2.336/2023</span>
          </div>
        )}
      </header>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
        {/* KPI Cards Reais de Orçamento */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-cs-surface border border-cs-border rounded-2xl p-4">
            <span className="text-[10px] uppercase font-bold text-cs-text-secondary tracking-wider block mb-1">
              Campanhas Gerenciadas
            </span>
            <div className="text-2xl font-black text-white">{filteredCampaigns.length}</div>
            <span className="text-[11px] text-cs-text-secondary mt-1 block">
              {filteredCampaigns.filter(c => c.status === 'ativa').length} ativas veiculando
            </span>
          </div>

          <div className="bg-cs-surface border border-cs-border rounded-2xl p-4">
            <span className="text-[10px] uppercase font-bold text-cs-text-secondary tracking-wider block mb-1">
              Verba Mensal Sob Gestão
            </span>
            <div className="text-2xl font-black text-emerald-400">
              R$ {totalMonthlyBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-cs-text-secondary mt-1 block">
              Orçamento planejado no mês
            </span>
          </div>

          <div className="bg-cs-surface border border-cs-border rounded-2xl p-4">
            <span className="text-[10px] uppercase font-bold text-cs-text-secondary tracking-wider block mb-1">
              Ritmo Diário Médio (Pacing)
            </span>
            <div className="text-2xl font-black text-white">
              R$ {totalDailyBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/dia
            </div>
            <span className="text-[11px] text-cs-text-secondary mt-1 block">
              Distribuição diária nas plataformas
            </span>
          </div>
        </div>

        {/* Filtros de Plataforma */}
        <div className="flex items-center justify-between gap-3 bg-cs-surface border border-cs-border rounded-2xl p-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-cs-text-secondary font-bold flex items-center gap-1">
              <Filter size={14} /> Plataforma:
            </span>
            {['todas', 'meta', 'google'].map(p => (
              <button
                key={p}
                onClick={() => setPlatformFilter(p)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-bold transition-colors",
                  platformFilter === p ? "bg-cs-primary text-black" : "text-cs-text-secondary hover:text-white bg-cs-bg"
                )}
              >
                {p === 'todas' ? 'Todas' : p === 'meta' ? 'Meta Ads' : 'Google Ads'}
              </button>
            ))}
          </div>
          <span className="text-xs text-cs-text-secondary font-medium">
            {filteredCampaigns.length} campanha{filteredCampaigns.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Grid de Campanhas Reais */}
        {filteredCampaigns.length === 0 ? (
          <div className="bg-cs-surface border border-cs-border rounded-2xl p-12 text-center">
            <Target size={40} className="mx-auto text-cs-text-secondary/40 mb-3" />
            <h3 className="text-white font-bold text-sm mb-1">Nenhuma campanha cadastrada</h3>
            <p className="text-xs text-cs-text-secondary max-w-sm mx-auto mb-4">
              Cadastre as campanhas que você opera para este cliente para manter o controle de orçamentos e links diretos dos anúncios.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-cs-primary text-black px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Plus size={16} /> Cadastrar Nova Campanha
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCampaigns.map(camp => {
              const cfg = STATUS_CONFIG[camp.status] || STATUS_CONFIG.ativa;
              return (
                <div key={camp.id} className="bg-cs-surface border border-cs-border hover:border-cs-primary/40 rounded-2xl p-5 flex flex-col justify-between transition-all group">
                  <div>
                    {/* Top Status */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold bg-cs-bg border border-cs-border text-white px-2.5 py-1 rounded-lg">
                          {camp.platform}
                        </span>
                        <span className="text-[10px] bg-cs-bg border border-cs-border text-cs-text-secondary px-2 py-0.5 rounded">
                          Obj: {camp.objective}
                        </span>
                      </div>
                      <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border", cfg.color)}>
                        {cfg.label}
                      </span>
                    </div>

                    {/* Nome da Campanha */}
                    <h3 className="text-sm font-bold text-white mb-2 group-hover:text-cs-primary transition-colors">
                      {camp.name}
                    </h3>

                    {/* Resumo do Planejamento */}
                    {camp.results_summary && (
                      <p className="text-xs text-cs-text-secondary mb-3 bg-cs-bg/70 p-2.5 rounded-xl border border-cs-border/50">
                        {camp.results_summary}
                      </p>
                    )}

                    {/* Orçamentos */}
                    <div className="grid grid-cols-2 gap-2 bg-cs-bg p-3 rounded-xl border border-cs-border mb-3 text-xs">
                      <div>
                        <span className="text-[10px] text-cs-text-secondary block">Verba Mensal:</span>
                        <strong className="text-white font-mono">
                          R$ {Number(camp.budget_monthly || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-cs-text-secondary block">Diária Estimada:</span>
                        <strong className="text-white font-mono">
                          R$ {Number(camp.budget_daily || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/dia
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="pt-3 border-t border-cs-border/60 flex items-center justify-between mt-2">
                    <select
                      value={camp.status}
                      onChange={(e) => updateCampaignStatus(camp.id, e.target.value)}
                      className="bg-cs-bg border border-cs-border text-xs text-white rounded-lg px-2.5 py-1 font-semibold focus:outline-none focus:border-cs-primary cursor-pointer"
                    >
                      <option value="planejamento">Planejamento</option>
                      <option value="ativa">Ativa no Ar</option>
                      <option value="pausada">Pausada</option>
                      <option value="encerrada">Encerrada</option>
                    </select>

                    <div className="flex items-center gap-1.5">
                      {camp.ad_url && (
                        <a
                          href={camp.ad_url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-cs-text-secondary hover:text-white rounded-lg hover:bg-cs-bg transition-colors"
                          title="Abrir no Gerenciador de Anúncios"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                      <button
                        onClick={() => deleteCampaign(camp.id)}
                        className="p-1.5 text-cs-text-secondary hover:text-red-400 rounded-lg hover:bg-cs-bg transition-colors"
                        title="Remover campanha"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Prestação de Contas Mensal (Histórico Real) */}
        <div className="bg-cs-surface border border-cs-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Histórico Real de Fechamento de Tráfego</h2>
              <p className="text-xs text-cs-text-secondary">
                Investimentos reais aplicados e resultados apurados mês a mês pela agência.
              </p>
            </div>
            <button
              onClick={() => setShowReportModal(true)}
              className="bg-cs-primary text-black font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5"
            >
              <Plus size={14} /> Lançar Fechamento
            </button>
          </div>

          {reports.length === 0 ? (
            <div className="bg-cs-bg border border-cs-border rounded-xl p-8 text-center text-xs text-cs-text-secondary">
              Nenhum fechamento lançado para este cliente ainda. Clique em "Lançar Fechamento" ao final de cada mês.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-cs-border text-cs-text-secondary">
                    <th className="py-2.5 px-3">Período</th>
                    <th className="py-2.5 px-3">Investido (R$)</th>
                    <th className="py-2.5 px-3">Resultados (Leads/Vendas)</th>
                    <th className="py-2.5 px-3">Custo/Resultado (CPA Real)</th>
                    <th className="py-2.5 px-3">Diagnóstico da Agência</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cs-border/50">
                  {reports.map(r => (
                    <tr key={r.id} className="text-white hover:bg-cs-bg/50">
                      <td className="py-3 px-3 font-bold font-mono text-cs-primary">{r.period_label}</td>
                      <td className="py-3 px-3">R$ {Number(r.invested_amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="py-3 px-3 font-bold text-emerald-400">{r.conversions_count || 0} conversões</td>
                      <td className="py-3 px-3 font-mono">R$ {Number(r.cpa_real || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="py-3 px-3 text-cs-text-secondary max-w-sm">{r.diagnosis || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Nova Campanha */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-cs-surface border border-cs-border rounded-3xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 text-cs-text-secondary hover:text-white"
            >
              <X size={20} />
            </button>

            <h2 className="text-lg font-bold text-white mb-1">Cadastrar Nova Campanha de Tráfego</h2>
            <p className="text-xs text-cs-text-secondary mb-5">
              Cliente: <strong className="text-white">{selectedClient?.name || 'Cliente Ativo'}</strong>
            </p>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-white mb-1 block">Nome da Campanha</label>
                <input
                  type="text"
                  value={newCampaign.name}
                  onChange={e => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  placeholder="Ex: Google Ads: Consultas e Tratamento de Varizes"
                  required
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cs-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-white mb-1 block">Plataforma</label>
                  <select
                    value={newCampaign.platform}
                    onChange={e => setNewCampaign({ ...newCampaign, platform: e.target.value })}
                    className="w-full bg-cs-bg border border-cs-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cs-primary"
                  >
                    <option value="Meta Ads">Meta Ads (Instagram/FB)</option>
                    <option value="Google Ads">Google Ads (Busca/YouTube)</option>
                    <option value="LinkedIn Ads">LinkedIn Ads</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-white mb-1 block">Objetivo</label>
                  <select
                    value={newCampaign.objective}
                    onChange={e => setNewCampaign({ ...newCampaign, objective: e.target.value })}
                    className="w-full bg-cs-bg border border-cs-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cs-primary"
                  >
                    <option value="Leads">Geração de Leads (Formulário)</option>
                    <option value="Mensagens">Mensagens no WhatsApp</option>
                    <option value="Tráfego">Tráfego para Landing Page</option>
                    <option value="Vendas">Vendas / E-commerce</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-white mb-1 block">Verba Mensal (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newCampaign.budget_monthly}
                    onChange={e => setNewCampaign({ ...newCampaign, budget_monthly: e.target.value })}
                    placeholder="Ex: 1800.00"
                    required
                    className="w-full bg-cs-bg border border-cs-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cs-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white mb-1 block">Verba Diária Estimada (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newCampaign.budget_daily}
                    onChange={e => setNewCampaign({ ...newCampaign, budget_daily: e.target.value })}
                    placeholder="Ex: 60.00"
                    className="w-full bg-cs-bg border border-cs-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cs-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-white mb-1 block">Link no Gerenciador de Anúncios</label>
                <input
                  type="url"
                  value={newCampaign.ad_url}
                  onChange={e => setNewCampaign({ ...newCampaign, ad_url: e.target.value })}
                  placeholder="https://adsmanager.facebook.com/..."
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cs-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-white mb-1 block">Estratégia & Notas</label>
                <textarea
                  rows={3}
                  value={newCampaign.results_summary}
                  onChange={e => setNewCampaign({ ...newCampaign, results_summary: e.target.value })}
                  placeholder="Público-alvo, raio geográfico, palavras-chave e orientações de conformidade..."
                  className="w-full bg-cs-bg border border-cs-border rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cs-primary"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-cs-text-secondary hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-cs-primary hover:bg-yellow-400 text-black px-5 py-2 rounded-xl text-xs font-bold transition-all"
                >
                  Salvar Campanha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Fechamento Mensal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-cs-surface border border-cs-border rounded-3xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute top-5 right-5 text-cs-text-secondary hover:text-white"
            >
              <X size={20} />
            </button>

            <h2 className="text-lg font-bold text-white mb-1">Registrar Prestação de Contas Mensal</h2>
            <p className="text-xs text-cs-text-secondary mb-4">
              Consolide os resultados reais de tráfego pago do cliente no período.
            </p>

            <form onSubmit={handleAddReport} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-white mb-1 block">Mês/Ano de Referência</label>
                  <input
                    type="text"
                    value={newReport.period_label}
                    onChange={e => setNewReport({ ...newReport, period_label: e.target.value })}
                    placeholder="Ex: Outubro/2026"
                    required
                    className="w-full bg-cs-bg border border-cs-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cs-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white mb-1 block">Total Investido Real (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newReport.invested_amount}
                    onChange={e => setNewReport({ ...newReport, invested_amount: e.target.value })}
                    placeholder="Ex: 3000.00"
                    required
                    className="w-full bg-cs-bg border border-cs-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cs-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-white mb-1 block">Conversões Obtidas (Leads/Vendas)</label>
                  <input
                    type="number"
                    value={newReport.conversions_count}
                    onChange={e => setNewReport({ ...newReport, conversions_count: e.target.value })}
                    placeholder="Ex: 85"
                    required
                    className="w-full bg-cs-bg border border-cs-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cs-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white mb-1 block">Custo por Resultado (CPA Real)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newReport.cpa_real}
                    onChange={e => setNewReport({ ...newReport, cpa_real: e.target.value })}
                    placeholder="Ex: 35.29"
                    className="w-full bg-cs-bg border border-cs-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cs-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-white mb-1 block">Diagnóstico & Parecer da Agência</label>
                <textarea
                  rows={3}
                  value={newReport.diagnosis}
                  onChange={e => setNewReport({ ...newReport, diagnosis: e.target.value })}
                  placeholder="Ex: O público de 45-65 anos teve o menor custo por lead no Google Ads. Recomendamos manter o orçamento na busca institucional..."
                  className="w-full bg-cs-bg border border-cs-border rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cs-primary"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-cs-text-secondary hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-cs-primary hover:bg-yellow-400 text-black px-5 py-2 rounded-xl text-xs font-bold transition-all"
                >
                  Salvar Fechamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
