import React, { useState } from 'react';
import { 
  BarChart2, FileText, Download, CheckCircle2, Clock, 
  Send, Copy, Printer, Target, Sparkles, AlertCircle, 
  TrendingUp, Calendar, ShieldCheck, ExternalLink, Save
} from 'lucide-react';
import { useActiveClient } from '../contexts/ActiveClientContext';
import { useTasks } from '../hooks/useTasks';
import { useSocialManagement } from '../hooks/useSocialManagement';
import { useCampaignManagement } from '../hooks/useCampaignManagement';
import toast from 'react-hot-toast';
import { cn } from '../utils/cn';

export default function ReportsView() {
  const { selectedClient, isAllClients, clients, selectedClientId, setSelectedClientId } = useActiveClient();
  const { tasks } = useTasks();
  const { posts } = useSocialManagement();
  const { campaigns, reports: campaignReports } = useCampaignManagement();

  const [period, setPeriod] = useState('Outubro / 2026');
  const [executiveOpinion, setExecutiveOpinion] = useState(
    'As metas do período foram cumpridas com foco em autoridade digital e consistência de marca. Para o próximo ciclo, recomendamos aprofundar criativos em vídeo e manter a regularidade na grade semanal.'
  );

  const activeClientObj = selectedClient || clients[0];
  const isMedicalClient = activeClientObj?.document_id?.includes('CRM') || activeClientObj?.name?.includes('Dr.');

  // Tarefas concluídas e em andamento deste cliente
  const clientTasks = tasks.filter(t => {
    if (activeClientObj) {
      return t.client_id === activeClientObj.id || (t.client && t.client.name === activeClientObj.name);
    }
    return true;
  });

  const completedTasks = clientTasks.filter(t => t.status === 'concluido');
  const inProgressTasks = clientTasks.filter(t => t.status !== 'concluido');

  // Posts deste cliente
  const clientPosts = posts.filter(p => {
    if (activeClientObj) {
      return p.client_id === activeClientObj.id;
    }
    return true;
  });

  const publishedPosts = clientPosts.filter(p => p.status === 'publicado');
  const plannedPosts = clientPosts.filter(p => p.status !== 'publicado');

  // Campanhas ativas
  const clientCampaigns = campaigns.filter(c => {
    if (activeClientObj) {
      return c.client_id === activeClientObj.id;
    }
    return true;
  });

  const totalBudget = clientCampaigns.reduce((sum, c) => sum + (Number(c.budget_monthly) || 0), 0);

  // Copiar resumo pronto para o WhatsApp
  const handleCopyWhatsAppSummary = () => {
    const text = `*COMUNICAÇÃO SOCIAL AG: RELATÓRIO MENSAL*
Cliente: ${activeClientObj?.name || 'Cliente'}
Período: ${period}

*1. Demandas e Entregas Concluídas:*
${completedTasks.length > 0 
  ? completedTasks.map(t => `• ${t.title}`).join('\n') 
  : '• Rotina de alinhamento e planejamento contínuo.'}

*2. Presença Social & Conteúdo:*
• Pautas publicadas: ${publishedPosts.length}
• Pautas planejadas/agendadas: ${plannedPosts.length}

*3. Tráfego Pago & Performance:*
• Campanhas em veiculação: ${clientCampaigns.length}
• Verba mensal sob gestão: R$ ${totalBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}

*4. Parecer da Agência:*
${executiveOpinion}

${isMedicalClient ? 'Conformidade com a Resolução CFM 2.336/2023 mantida rigorosamente.\n' : ''}Operação: Bruno (Comunicação Social Ag - Poços de Caldas, MG)`;

    navigator.clipboard.writeText(text);
    toast.success('Resumo formatado copiado! Cole diretamente no WhatsApp do cliente.');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-full flex flex-col bg-cs-bg text-cs-text-primary overflow-hidden">
      {/* Top Header */}
      <header className="bg-cs-surface border-b border-cs-border px-6 py-4 shrink-0 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cs-primary text-black font-black flex items-center justify-center shadow-lg shadow-cs-primary/10 shrink-0">
            <FileText size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">Relatórios & Prestação de Contas</h1>
              <span className="text-[10px] uppercase tracking-wider font-bold bg-cs-primary/10 text-cs-primary border border-cs-primary/30 px-2 py-0.5 rounded-md">
                Relatório Real
              </span>
            </div>
            <p className="text-xs text-cs-text-secondary">
              {activeClientObj ? `Fechamento executivo oficial de: ${activeClientObj.name}` : 'Visão consolidada'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyWhatsAppSummary}
            className="bg-emerald-500 hover:bg-emerald-600 text-black px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
          >
            <Copy size={15} /> Copiar para WhatsApp
          </button>
          <button
            onClick={handlePrint}
            className="bg-cs-surface hover:bg-white/5 border border-cs-border text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Printer size={15} /> Imprimir / PDF
          </button>
        </div>
      </header>

      {/* Conteúdo do Relatório */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6 max-w-5xl mx-auto w-full">
        {/* Bloco de Identificação */}
        <div className="bg-cs-surface border border-cs-border rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cs-border pb-4 mb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-cs-text-secondary tracking-widest block mb-1">
                Relatório Mensal de Atividades
              </span>
              <h2 className="text-xl font-black text-white">{activeClientObj?.name}</h2>
              <span className="text-xs text-cs-text-secondary">
                {activeClientObj?.document_id || 'Cliente Oficial'} | Poços de Caldas, MG
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-cs-text-secondary font-bold">Mês de Apuração:</span>
              <input
                type="text"
                value={period}
                onChange={e => setPeriod(e.target.value)}
                className="bg-cs-bg border border-cs-border rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-cs-primary"
              />
            </div>
          </div>

          {/* Cards de Resumo Operacional */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-cs-bg border border-cs-border rounded-xl p-4">
              <span className="text-[10px] text-cs-text-secondary uppercase font-bold block mb-1">Demandas Concluídas</span>
              <div className="text-2xl font-black text-white">{completedTasks.length}</div>
              <span className="text-[11px] text-emerald-400 mt-1 block font-semibold">100% validadas</span>
            </div>

            <div className="bg-cs-bg border border-cs-border rounded-xl p-4">
              <span className="text-[10px] text-cs-text-secondary uppercase font-bold block mb-1">Pautas Sociais</span>
              <div className="text-2xl font-black text-white">{clientPosts.length}</div>
              <span className="text-[11px] text-cs-text-secondary mt-1 block">
                {publishedPosts.length} publicadas, {plannedPosts.length} na esteira
              </span>
            </div>

            <div className="bg-cs-bg border border-cs-border rounded-xl p-4">
              <span className="text-[10px] text-cs-text-secondary uppercase font-bold block mb-1">Campanhas Ativas</span>
              <div className="text-2xl font-black text-white">{clientCampaigns.length}</div>
              <span className="text-[11px] text-cs-text-secondary mt-1 block">Meta & Google Ads</span>
            </div>

            <div className="bg-cs-bg border border-cs-border rounded-xl p-4">
              <span className="text-[10px] text-cs-text-secondary uppercase font-bold block mb-1">Fee Contratado</span>
              <div className="text-2xl font-black text-yellow-400">
                R$ {Number(activeClientObj?.monthly_fee || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-cs-text-secondary mt-1 block">
                Vencimento dia {activeClientObj?.billing_day || '10'}
              </span>
            </div>
          </div>
        </div>

        {/* 1. Demandas Entregues no Mês */}
        <div className="bg-cs-surface border border-cs-border rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" /> Demandas Entregues no Período
          </h3>

          {completedTasks.length === 0 ? (
            <p className="text-xs text-cs-text-secondary bg-cs-bg p-4 rounded-xl border border-cs-border">
              Nenhuma demanda com status "Concluído" neste mês ainda. As tarefas concluídas no Kanban de Atendimento aparecerão aqui automaticamente.
            </p>
          ) : (
            <div className="divide-y divide-cs-border/50 border border-cs-border rounded-xl overflow-hidden bg-cs-bg">
              {completedTasks.map(t => (
                <div key={t.id} className="p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">{t.title}</span>
                    <span className="text-[11px] text-cs-text-secondary">Categoria: {t.tag || 'Geral'}</span>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                    Concluído
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Mídia Paga & Performance */}
        <div className="bg-cs-surface border border-cs-border rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Target size={16} className="text-cs-primary" /> Mídia Paga & Campanhas sob Gestão
          </h3>

          {clientCampaigns.length === 0 ? (
            <p className="text-xs text-cs-text-secondary bg-cs-bg p-4 rounded-xl border border-cs-border">
              Nenhuma campanha cadastrada para este cliente.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {clientCampaigns.map(c => (
                <div key={c.id} className="bg-cs-bg border border-cs-border rounded-xl p-4 text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-cs-text-secondary uppercase">{c.platform}</span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase">
                      {c.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-white mb-2">{c.name}</h4>
                  <div className="flex items-center justify-between text-[11px] text-cs-text-secondary pt-2 border-t border-cs-border/60">
                    <span>Verba Mensal:</span>
                    <strong className="text-white font-mono">
                      R$ {Number(c.budget_monthly || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Parecer Estratégico da Agência */}
        <div className="bg-cs-surface border border-cs-border rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <Sparkles size={16} className="text-yellow-400" /> Parecer Estratégico & Recomendações da Agência
          </h3>
          <p className="text-xs text-cs-text-secondary mb-3">
            Este texto é incluído na mensagem enviada ao cliente com o diagnóstico oficial do Bruno.
          </p>
          <textarea
            rows={4}
            value={executiveOpinion}
            onChange={e => setExecutiveOpinion(e.target.value)}
            className="w-full bg-cs-bg border border-cs-border rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cs-primary leading-relaxed"
          />
        </div>

        {/* Rodapé Institucional */}
        <div className="text-center text-xs text-cs-text-secondary pt-4 pb-8">
          Comunicação Social Ag : Poços de Caldas, MG : Relatório Gerado Operacionalmente
        </div>
      </div>
    </div>
  );
}
