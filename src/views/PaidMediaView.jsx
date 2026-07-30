import { useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Target, AlertTriangle, Sparkles, Filter, ExternalLink } from 'lucide-react';

const DEMO_CAMPAIGNS = [];


export default function PaidMediaView() {
  const [selectedFilter, setSelectedFilter] = useState('todos');

  const filteredCampaigns = selectedFilter === 'todos'
    ? DEMO_CAMPAIGNS
    : DEMO_CAMPAIGNS.filter(c => c.platform.toLowerCase().includes(selectedFilter));

  return (
    <div className="h-full overflow-y-auto bg-cs-bg p-6 space-y-6 custom-scrollbar">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cs-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-cs-primary text-sm font-bold uppercase tracking-wider mb-1">
            <BarChart3 size={16} /> Mídia Paga & Performance
          </div>
          <h1 className="text-2xl font-bold text-white">Painel de Campanhas & Anúncios</h1>
          <p className="text-cs-text-secondary text-sm">Integração de métricas de anúncios Meta Ads e Google Ads com alertas de inteligência artificial.</p>
        </div>

        {/* Platform Filter */}
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-cs-text-secondary" />
          {['todos', 'meta', 'google'].map(f => (
            <button
              key={f}
              onClick={() => setSelectedFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                selectedFilter === f
                  ? 'bg-cs-primary text-white shadow-lg shadow-cs-primary/20'
                  : 'bg-cs-surface border border-cs-border text-cs-text-secondary hover:text-white'
              }`}
            >
              {f === 'todos' ? 'Todas' : f === 'meta' ? 'Meta Ads' : 'Google Ads'}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Investimento Total Mês', value: 'R$ 7.940,00', icon: DollarSign, color: 'text-green-400' },
          { label: 'Impressões Totais', value: '269.800', icon: TrendingUp, color: 'text-blue-400' },
          { label: 'Conversões / Leads', value: '362', icon: Target, color: 'text-purple-400' },
          { label: 'CPA Médio Geral', value: 'R$ 21,93', icon: BarChart3, color: 'text-yellow-400' }
        ].map((card, i) => (
          <div key={i} className="bg-cs-surface border border-cs-border rounded-2xl p-4 flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-white/5 ${card.color}`}>
              <card.icon size={22} />
            </div>
            <div>
              <p className="text-[11px] text-cs-text-secondary font-bold uppercase tracking-wider">{card.label}</p>
              <p className="text-xl font-bold text-white mt-0.5">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Campaigns Table */}
      <div className="bg-cs-surface border border-cs-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles size={16} className="text-cs-primary" /> Campanhas Ativas em Monitoramento
          </h2>
          <span className="text-xs text-cs-text-secondary font-mono">{filteredCampaigns.length} campanhas</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-cs-text-secondary">
            <thead className="bg-cs-bg border-b border-cs-border text-[10px] uppercase font-bold text-cs-text-secondary">
              <tr>
                <th className="py-3 px-4">Cliente / Campanha</th>
                <th className="py-3 px-4">Plataforma</th>
                <th className="py-3 px-4">Investido</th>
                <th className="py-3 px-4">CTR</th>
                <th className="py-3 px-4">CPC</th>
                <th className="py-3 px-4">CPA</th>
                <th className="py-3 px-4">Conversões</th>
                <th className="py-3 px-4">Status & IA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cs-border/50">
              {filteredCampaigns.map(c => (
                <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-medium text-white">
                    <p className="text-xs font-bold text-white">{c.name}</p>
                    <p className="text-[10px] text-cs-text-secondary">{c.client}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                      c.platform.includes('Meta') ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'
                    }`}>
                      {c.platform}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white">{c.spent}</td>
                  <td className="py-3.5 px-4 font-mono">{c.ctr}</td>
                  <td className="py-3.5 px-4 font-mono">{c.cpc}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-purple-400">{c.cpa}</td>
                  <td className="py-3.5 px-4 font-bold text-white">{c.conversions}</td>
                  <td className="py-3.5 px-4">
                    {c.ai_alert ? (
                      <div className="flex items-center gap-1.5 text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 p-1.5 rounded-lg text-[10px]">
                        <AlertTriangle size={12} className="shrink-0" />
                        <span>{c.ai_alert}</span>
                      </div>
                    ) : (
                      <span className="text-green-400 text-[10px] font-bold bg-green-500/10 px-2 py-1 rounded-md">
                        Performance Estável ✨
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
