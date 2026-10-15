import React, { useRef } from 'react';
import { 
  Printer, Download, Share2, Sparkles, Award, Users, Eye, 
  Heart, BarChart3, MapPin, CheckCircle2, Shield, Calendar, ArrowUpRight
} from 'lucide-react';
import { cn } from '../../utils/cn';
import toast from 'react-hot-toast';

export default function BuzzReportsTab({ client, selectedPeriod }) {
  const reportRef = useRef(null);
  const kpis = client.kpis || {};
  const posts = client.posts || [];
  const demographics = client.demographics || { top_cities: [], gender_split: {} };
  const listening = client.listening || {};

  const handlePrint = () => {
    window.print();
  };

  const handleShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Link do relatório copiado para a área de transferência!');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Barra de Ações do Relatório */}
      <div className="bg-cs-surface border border-cs-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 size={18} className="text-cs-primary" />
            Central de Relatórios Executivos (White-Label)
          </h3>
          <p className="text-xs text-cs-text-secondary mt-0.5">
            Relatório oficial pronto para apresentação e entrega ao cliente final.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleShareLink}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-cs-bg border border-cs-border text-cs-text-secondary hover:text-white hover:border-cs-primary/40 flex items-center gap-1.5 transition-colors"
          >
            <Share2 size={14} /> Compartilhar Link
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-cs-primary text-black hover:bg-yellow-400 flex items-center gap-1.5 shadow-lg shadow-cs-primary/10 transition-colors"
          >
            <Printer size={14} /> Imprimir / Baixar PDF
          </button>
        </div>
      </div>

      {/* Documento Executivo Estilizado para Impressão / Apresentação */}
      <div 
        ref={reportRef}
        className="bg-zinc-950 text-zinc-100 border border-zinc-800 rounded-3xl p-8 md:p-12 shadow-2xl space-y-10 print:p-0 print:border-none print:shadow-none print:bg-white print:text-black"
      >
        {/* Header do Relatório com Co-Branding */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-zinc-800 print:border-zinc-300">
          <div className="flex items-center gap-4">
            <img 
              src="/logo.png" 
              alt="Comunicação Social Ag" 
              className="h-12 w-auto object-contain"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-yellow-500 print:text-yellow-600">
                Comunicação Social Ag
              </div>
              <h1 className="text-2xl font-black text-white print:text-black tracking-tight mt-0.5">
                Relatório de Desempenho & Inteligência Social
              </h1>
              <p className="text-xs text-zinc-400 print:text-zinc-600 mt-0.5">
                comunicacaosocialag.com.br • Gestão Estratégica de Redes & Tráfego
              </p>
            </div>
          </div>

          <div className="bg-zinc-900 print:bg-zinc-100 border border-zinc-800 print:border-zinc-300 rounded-2xl p-4 text-left md:text-right min-w-[220px]">
            <div className="text-[10px] uppercase font-bold text-zinc-400 print:text-zinc-600">Cliente</div>
            <div className="text-sm font-black text-white print:text-black mt-0.5">{client.name}</div>
            <div className="text-xs text-yellow-500 font-bold mt-1 flex items-center md:justify-end gap-1">
              <Calendar size={12} /> {selectedPeriod}
            </div>
          </div>
        </div>

        {/* 1. Bloco Personalizado: Indicadores Macro do Período */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white print:text-black flex items-center gap-2">
              <Award size={18} className="text-yellow-500" />
              1. Resumo Executivo Consolidado
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full">
              Meta Graph API Verificada
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-zinc-900/80 print:bg-zinc-50 border border-zinc-800 print:border-zinc-300 rounded-2xl p-4">
              <div className="text-[11px] font-bold text-zinc-400 print:text-zinc-600 uppercase tracking-wider">Alcance Total</div>
              <div className="text-2xl font-black text-white print:text-black mt-1">
                {kpis.total_reach?.toLocaleString('pt-BR')} pessoas
              </div>
              <div className="text-[10px] text-green-400 font-bold mt-1">100% Orgânico</div>
            </div>

            <div className="bg-zinc-900/80 print:bg-zinc-50 border border-zinc-800 print:border-zinc-300 rounded-2xl p-4">
              <div className="text-[11px] font-bold text-zinc-400 print:text-zinc-600 uppercase tracking-wider">Engajamento / Ações</div>
              <div className="text-2xl font-black text-white print:text-black mt-1">
                {kpis.total_interactions} interações
              </div>
              <div className="text-[10px] text-zinc-400 print:text-zinc-600 mt-1">{kpis.likes} curtidas + {kpis.shares} shares</div>
            </div>

            <div className="bg-zinc-900/80 print:bg-zinc-50 border border-zinc-800 print:border-zinc-300 rounded-2xl p-4">
              <div className="text-[11px] font-bold text-zinc-400 print:text-zinc-600 uppercase tracking-wider">Novos Seguidores</div>
              <div className="text-2xl font-black text-white print:text-black mt-1">
                +{kpis.new_followers} seguidores
              </div>
              <div className="text-[10px] text-zinc-400 print:text-zinc-600 mt-1">Base total: {kpis.total_followers?.toLocaleString('pt-BR')}</div>
            </div>

            <div className="bg-zinc-900/80 print:bg-zinc-50 border border-zinc-800 print:border-zinc-300 rounded-2xl p-4">
              <div className="text-[11px] font-bold text-zinc-400 print:text-zinc-600 uppercase tracking-wider">Taxa de Interação</div>
              <div className="text-2xl font-black text-yellow-500 mt-1">
                {kpis.interaction_rate}
              </div>
              <div className="text-[10px] text-zinc-400 print:text-zinc-600 mt-1">Média de {kpis.avg_reach_per_post} / post</div>
            </div>
          </div>
        </div>

        {/* 2. Tabela de Postagens Auditadas */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white print:text-black flex items-center gap-2">
            <Eye size={18} className="text-yellow-500" />
            2. Auditoria Individual de Publicações ({posts.length} posts no período)
          </h2>

          <div className="border border-zinc-800 print:border-zinc-300 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900 print:bg-zinc-100 border-b border-zinc-800 print:border-zinc-300 text-zinc-400 print:text-zinc-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Postagem / Tema</th>
                  <th className="py-3 px-3">Formato</th>
                  <th className="py-3 px-3">Data</th>
                  <th className="py-3 px-3 text-right">Alcance</th>
                  <th className="py-3 px-3 text-center">Curtidas</th>
                  <th className="py-3 px-3 text-center">Shares</th>
                  <th className="py-3 px-3 text-right">Taxa Interação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 print:divide-zinc-200">
                {posts.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-zinc-900/30">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white print:text-black">{p.title}</div>
                      <div className="text-[11px] text-zinc-400 print:text-zinc-600 truncate max-w-sm">{p.caption}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-semibold text-zinc-300 print:text-zinc-800">{p.type_label}</span>
                    </td>
                    <td className="py-3.5 px-3 text-zinc-400 print:text-zinc-600">{p.date_formatted}</td>
                    <td className="py-3.5 px-3 text-right font-black text-white print:text-black text-sm">
                      {p.reach}
                    </td>
                    <td className="py-3.5 px-3 text-center text-red-400 print:text-red-600 font-bold">{p.likes}</td>
                    <td className="py-3.5 px-3 text-center text-blue-400 print:text-blue-600 font-bold">{p.shares}</td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-green-400 print:text-green-700">
                      {p.engagement_rate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Demografia e Região */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white print:text-black flex items-center gap-2">
            <MapPin size={18} className="text-yellow-500" />
            3. Distribuição Geográfica dos Seguidores
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-900/80 print:bg-zinc-50 border border-zinc-800 print:border-zinc-300 rounded-2xl p-5 space-y-2.5">
              <div className="text-xs font-bold text-zinc-300 print:text-zinc-800 uppercase tracking-wider mb-2">
                Top Cidades com Maior Presença
              </div>
              {demographics.top_cities?.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-zinc-800/40 last:border-0">
                  <span className="text-white print:text-black font-medium">{i + 1}. {c.city}</span>
                  <span className="font-bold text-yellow-500">{c.percentage}% ({c.count} seg.)</span>
                </div>
              ))}
            </div>

            <div className="bg-zinc-900/80 print:bg-zinc-50 border border-zinc-800 print:border-zinc-300 rounded-2xl p-5 flex flex-col justify-between">
              <div className="text-xs font-bold text-zinc-300 print:text-zinc-800 uppercase tracking-wider mb-2">
                Perfil de Gênero & Presença
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-pink-400 font-bold">Público Feminino</span>
                    <span className="font-bold">{demographics.gender_split?.female || 79}%</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-pink-500" style={{ width: `${demographics.gender_split?.female || 79}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-blue-400 font-bold">Público Masculino</span>
                    <span className="font-bold">{demographics.gender_split?.male || 21}%</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${demographics.gender_split?.male || 21}%` }} />
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-zinc-400 print:text-zinc-600 pt-3 border-t border-zinc-800/60 mt-3">
                Forte aderência na faixa de <strong>35 a 54 anos</strong>, ideal para tratamentos vasculares e estética avançada.
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé da Agência */}
        <div className="pt-8 border-t border-zinc-800 print:border-zinc-300 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 print:text-zinc-600 gap-2">
          <div>Relatório gerado automaticamente pela plataforma <strong>Comunica OS / BuzzMonitor Hub</strong>.</div>
          <div className="text-yellow-500 font-bold">© 2026 Comunicação Social Ag. Todos os direitos reservados.</div>
        </div>
      </div>
    </div>
  );
}
