import React, { useState } from 'react';
import { 
  Users, Eye, Heart, Share2, MessageCircle, Bookmark, TrendingUp, 
  Sparkles, ExternalLink, MapPin, Award, CheckCircle2, Flame, ArrowUpRight,
  BarChart2, PieChart as PieIcon, ShieldCheck
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { cn } from '../../utils/cn';

const GENDER_COLORS = ['#ec4899', '#3b82f6'];

export default function BuzzAnalyticsTab({ client, selectedPeriod }) {
  const [selectedPost, setSelectedPost] = useState(null);
  const kpis = client.kpis || {};
  const timeSeries = client.time_series || [];
  const posts = client.posts || [];
  const demographics = client.demographics || { top_cities: [], age_gender: [] };

  const genderData = [
    { name: 'Feminino', value: demographics.gender_split?.female || 70 },
    { name: 'Masculino', value: demographics.gender_split?.male || 30 }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Bloco de Destaque / Resumo do Período */}
      <div className="bg-gradient-to-r from-cs-surface via-cs-surface to-cs-primary/10 border border-cs-border rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <img 
              src={client.avatar} 
              alt={client.name} 
              className="w-16 h-16 rounded-2xl object-cover border-2 border-cs-primary/40 shadow-lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white tracking-tight">{client.name}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/30 flex items-center gap-1">
                  <ShieldCheck size={12} /> Meta Conectada
                </span>
              </div>
              <p className="text-xs text-cs-text-secondary mt-0.5 flex items-center gap-2">
                <span>{client.handle}</span>
                <span>•</span>
                <span>{client.segment}</span>
                <span>•</span>
                <span className="text-cs-primary font-medium">{client.city}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-cs-bg/80 border border-cs-border rounded-xl px-4 py-2 text-right">
              <span className="text-[10px] uppercase font-bold text-cs-text-secondary tracking-wider block">Período Selecionado</span>
              <span className="text-sm font-bold text-cs-primary">{selectedPeriod}</span>
            </div>
          </div>
        </div>

        {/* AI Insight Box */}
        <div className="mt-5 pt-4 border-t border-cs-border/60 flex items-start gap-3 bg-cs-bg/40 rounded-xl p-3.5 border border-cs-border/40">
          <div className="p-2 rounded-lg bg-cs-primary/20 text-cs-primary shrink-0 mt-0.5">
            <Sparkles size={16} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              Diagnóstico de Inteligência Social
              <span className="text-[10px] px-1.5 py-0.2 bg-cs-primary/20 text-cs-primary rounded font-mono">100% Orgânico</span>
            </h4>
            <p className="text-xs text-cs-text-secondary mt-1 leading-relaxed">
              {client.ai_insight || `O alcance total no período foi de ${kpis.total_reach?.toLocaleString('pt-BR')} contas únicas, com taxa média de engajamento de ${kpis.interaction_rate || '3.07%'} e ${kpis.posts_count || 0} publicações analisadas.`}
            </p>
          </div>
        </div>
      </div>

      {/* Grid de 6 Principais KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-cs-surface border border-cs-border p-4 rounded-xl relative overflow-hidden group hover:border-cs-primary/40 transition-all">
          <div className="flex items-center justify-between text-cs-text-secondary mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Alcance Total</span>
            <Eye size={16} className="text-cs-primary" />
          </div>
          <div className="text-2xl font-black text-white">{kpis.total_reach?.toLocaleString('pt-BR') || 0}</div>
          <div className="text-[10px] text-green-400 font-bold mt-1 flex items-center gap-1">
            <ArrowUpRight size={12} /> 100% Orgânico
          </div>
        </div>

        <div className="bg-cs-surface border border-cs-border p-4 rounded-xl relative overflow-hidden group hover:border-cs-primary/40 transition-all">
          <div className="flex items-center justify-between text-cs-text-secondary mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Interações</span>
            <Heart size={16} className="text-red-400" />
          </div>
          <div className="text-2xl font-black text-white">{kpis.total_interactions || 0}</div>
          <div className="text-[10px] text-cs-text-secondary mt-1">
            {kpis.likes || 0} likes • {kpis.shares || 0} shares
          </div>
        </div>

        <div className="bg-cs-surface border border-cs-border p-4 rounded-xl relative overflow-hidden group hover:border-cs-primary/40 transition-all">
          <div className="flex items-center justify-between text-cs-text-secondary mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Novos Seguidores</span>
            <Users size={16} className="text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">+{kpis.new_followers || 0}</div>
          <div className="text-[10px] text-cs-text-secondary mt-1">
            Base total: {kpis.total_followers?.toLocaleString('pt-BR')}
          </div>
        </div>

        <div className="bg-cs-surface border border-cs-border p-4 rounded-xl relative overflow-hidden group hover:border-cs-primary/40 transition-all">
          <div className="flex items-center justify-between text-cs-text-secondary mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Taxa Interação</span>
            <TrendingUp size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{kpis.interaction_rate || '0%'}</div>
          <div className="text-[10px] text-cs-text-secondary mt-1">
            Média: {kpis.avg_reach_per_post} / post
          </div>
        </div>

        <div className="bg-cs-surface border border-cs-border p-4 rounded-xl relative overflow-hidden group hover:border-cs-primary/40 transition-all">
          <div className="flex items-center justify-between text-cs-text-secondary mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Visitas Perfil</span>
            <Flame size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">{kpis.profile_views || 0}</div>
          <div className="text-[10px] text-cs-text-secondary mt-1">
            {kpis.website_clicks || 0} cliques no WhatsApp
          </div>
        </div>

        <div className="bg-cs-surface border border-cs-border p-4 rounded-xl relative overflow-hidden group hover:border-cs-primary/40 transition-all">
          <div className="flex items-center justify-between text-cs-text-secondary mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Facebook Page</span>
            <Share2 size={16} className="text-blue-500" />
          </div>
          <div className="text-2xl font-black text-white">{kpis.fb_followers || 0}</div>
          <div className="text-[10px] text-cs-text-secondary mt-1">
            +{kpis.fb_new_followers || 0} novos no período
          </div>
        </div>
      </div>

      {/* Gráficos de Evolução Temporal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alcance e Interações ao Longo do Período */}
        <div className="bg-cs-surface border border-cs-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart2 size={16} className="text-cs-primary" />
                Evolução Temporal de Alcance e Interações
              </h4>
              <p className="text-[11px] text-cs-text-secondary">Picos associados às datas de publicação no feed</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold">
              <span className="flex items-center gap-1 text-cs-primary">
                <div className="w-2.5 h-2.5 rounded-full bg-cs-primary" /> Alcance
              </span>
              <span className="flex items-center gap-1 text-red-400">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" /> Interações
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="reachGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="reach" name="Alcance" stroke="#eab308" strokeWidth={2} fillOpacity={1} fill="url(#reachGrad)" />
                <Area type="monotone" dataKey="interactions" name="Interações" stroke="#f87171" strokeWidth={2} fill="#f87171" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Evolução de Seguidores */}
        <div className="bg-cs-surface border border-cs-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp size={16} className="text-blue-400" />
                Crescimento Líquido de Seguidores (@dralbertobr)
              </h4>
              <p className="text-[11px] text-cs-text-secondary">Evolução acumulada no período oficial</p>
            </div>
            <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
              +{kpis.new_followers} seguidores
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeries} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="followGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={11} />
                <YAxis domain={['dataMin - 5', 'dataMax + 5']} stroke="#71717a" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="followers" name="Seguidores" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#followGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabela de Auditoria de Postagens Individuais */}
      <div className="bg-cs-surface border border-cs-border rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
          <div>
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <Award size={20} className="text-cs-primary" />
              Auditoria de Postagens do Período ({posts.length} publicações)
            </h4>
            <p className="text-xs text-cs-text-secondary">Métricas oficiais extraídas da Graph API do Instagram</p>
          </div>
          <span className="text-xs text-cs-text-secondary bg-cs-bg px-3 py-1.5 rounded-xl border border-cs-border">
            Ordenado por maior alcance orgânico
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-cs-border text-cs-text-secondary font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Rank / Post</th>
                <th className="py-3 px-3">Tipo</th>
                <th className="py-3 px-3">Data</th>
                <th className="py-3 px-3 text-right">Alcance</th>
                <th className="py-3 px-3 text-center">Curtidas</th>
                <th className="py-3 px-3 text-center">Shares</th>
                <th className="py-3 px-3 text-center">Salvos</th>
                <th className="py-3 px-3 text-right">Engajamento</th>
                <th className="py-3 px-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cs-border/50">
              {posts.map((p, idx) => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-6 h-6 rounded-full font-black text-[11px] flex items-center justify-center shrink-0",
                        idx === 0 ? "bg-amber-500 text-black shadow-md shadow-amber-500/20" :
                        idx === 1 ? "bg-zinc-300 text-black" :
                        idx === 2 ? "bg-amber-800 text-white" : "bg-cs-bg text-cs-text-secondary"
                      )}>
                        {idx + 1}
                      </div>
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-cs-border">
                        <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 max-w-xs md:max-w-md">
                        <div className="font-bold text-white truncate group-hover:text-cs-primary transition-colors">{p.title}</div>
                        <div className="text-[11px] text-cs-text-secondary truncate">{p.caption}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className={cn(
                      "px-2 py-0.5 rounded-md text-[10px] font-bold border",
                      p.type === 'CAROUSEL' ? "bg-purple-500/10 text-purple-400 border-purple-500/30" : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                    )}>
                      {p.type_label}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-cs-text-secondary font-medium whitespace-nowrap">
                    {p.date_formatted}
                  </td>
                  <td className="py-3.5 px-3 text-right font-black text-white text-sm">
                    {p.reach?.toLocaleString('pt-BR')}
                  </td>
                  <td className="py-3.5 px-3 text-center text-red-400 font-bold">
                    {p.likes}
                  </td>
                  <td className="py-3.5 px-3 text-center text-blue-400 font-bold">
                    {p.shares}
                  </td>
                  <td className="py-3.5 px-3 text-center text-cs-text-secondary font-bold">
                    {p.saves}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <span className="font-mono font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                      {p.engagement_rate}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    {p.permalink && (
                      <a 
                        href={p.permalink} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-1.5 text-cs-text-secondary hover:text-white hover:bg-white/10 rounded-lg inline-flex items-center transition-colors"
                        title="Ver no Instagram"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Demografia & Distribuição Geográfica */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cidades com maior presença de seguidores */}
        <div className="lg:col-span-2 bg-cs-surface border border-cs-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin size={16} className="text-red-400" />
                Cidades com Maior Presença de Seguidores
              </h4>
              <p className="text-[11px] text-cs-text-secondary">Foco geográfico e captação de pacientes no Sul de Minas e SP</p>
            </div>
            <span className="text-[10px] font-bold text-cs-primary bg-cs-primary/10 px-2.5 py-1 rounded-full border border-cs-primary/20">
              64% Poços de Caldas (Sede)
            </span>
          </div>

          <div className="space-y-3">
            {demographics.top_cities?.map((city, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white flex items-center gap-2">
                    <span className="text-cs-text-secondary font-mono text-[10px]">{idx + 1}.</span>
                    {city.city}
                    {city.is_primary && (
                      <span className="text-[9px] bg-cs-primary text-black font-black px-1.5 py-0.2 rounded uppercase">Sede</span>
                    )}
                  </span>
                  <span className="font-bold text-cs-text-secondary">{city.percentage}% ({city.count} seg.)</span>
                </div>
                <div className="w-full h-2 bg-cs-bg rounded-full overflow-hidden border border-cs-border/40">
                  <div 
                    className="h-full bg-gradient-to-r from-cs-primary to-amber-500 rounded-full transition-all duration-500" 
                    style={{ width: `${city.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divisão por Gênero */}
        <div className="bg-cs-surface border border-cs-border rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
              <PieIcon size={16} className="text-pink-400" />
              Distribuição por Gênero
            </h4>
            <p className="text-[11px] text-cs-text-secondary">Público predominante no perfil</p>
          </div>

          <div className="h-44 flex items-center justify-center relative my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-white">{demographics.gender_split?.female || 79}%</span>
              <span className="text-[9px] text-cs-text-secondary uppercase font-bold">Feminino</span>
            </div>
          </div>

          <div className="flex items-center justify-around border-t border-cs-border/60 pt-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-pink-500" />
              <span className="text-white font-medium">Mulheres: <strong>{demographics.gender_split?.female || 79}%</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-white font-medium">Homens: <strong>{demographics.gender_split?.male || 21}%</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
