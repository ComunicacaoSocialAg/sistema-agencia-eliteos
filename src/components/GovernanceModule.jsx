import { useState, useEffect } from 'react';
import { Shield, Calendar, Users, BarChart3, CheckCircle2, Clock, Plus, MessageSquare, AlertCircle, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../utils/cn';

const DEFAULT_RITOS = [
  {
    id: 'rito-semanal',
    title: 'Acompanhamento de Demandas (Semanal)',
    frequency: 'Semanal',
    participants: 'Atendimento + Equipe de Criação',
    objective: 'Revisar status do Kanban, destravar pendências e garantir os prazos da semana.',
    status: 'em_dia',
    last_date: '2026-07-28',
    next_date: '2026-08-04'
  },
  {
    id: 'rito-mensal',
    title: 'Reunião de Resultado & Performance (Mensal)',
    frequency: 'Mensal',
    participants: 'Atendimento + Mídia + Cliente',
    objective: 'Apresentar relatório de KPIs, ROAS/CPA, aprendizados e plano para o próximo mês.',
    status: 'proximo',
    last_date: '2026-07-01',
    next_date: '2026-08-01'
  },
  {
    id: 'rito-capacidade',
    title: 'Revisão de Capacidade & Horas (Quinzenal)',
    frequency: 'Quinzenal',
    participants: 'Gestão da Agência',
    objective: 'Mapear sobrecarga de profissionais, reequilibrar filas de job e checar lucratividade.',
    status: 'em_dia',
    last_date: '2026-07-20',
    next_date: '2026-08-03'
  },
  {
    id: 'rito-qbr',
    title: 'Revisão do Plano Anual / QBR (Trimestral)',
    frequency: 'Trimestral',
    participants: 'Estratégia + Comercial + Cliente',
    objective: 'Validar as grandes apostas do ano, reavaliar orçamentos e propor expansão/renovação.',
    status: 'alerta',
    last_date: '2026-04-30',
    next_date: '2026-07-31'
  },
  {
    id: 'rito-criativo',
    title: 'Comitê de Qualidade Criativa',
    frequency: 'Sob Demanda',
    participants: 'Diretor de Arte + Redator + Estratégia',
    objective: 'Nenhuma peça estratégica de alto impacto sai para o cliente sem segundo olhar.',
    status: 'em_dia',
    last_date: '2026-07-25',
    next_date: 'Sob demanda'
  }
];

export default function GovernanceModule({ client }) {
  const storageKey = `csag_ritos_${client?.id || 'demo'}`;

  const [ritos, setRitos] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : DEFAULT_RITOS;
    } catch {
      return DEFAULT_RITOS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(ritos));
    } catch (e) {
      console.warn(e);
    }
  }, [ritos, storageKey]);

  const handleCompleteRito = (ritoId) => {
    setRitos(prev => prev.map(r => {
      if (r.id === ritoId) {
        const today = new Date().toISOString().split('T')[0];
        return { ...r, status: 'em_dia', last_date: today };
      }
      return r;
    }));
    toast.success('Rito registrado como realizado!');
  };

  const completedCount = ritos.filter(r => r.status === 'em_dia').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cs-border pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cs-primary/10 border border-cs-primary/30 flex items-center justify-center text-cs-primary">
            <Shield size={26} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Governança, SLA & Ritos Operacionais</h2>
            <p className="text-xs text-cs-text-secondary">O ritmo de gestão padrão ouro que garante pontualidade e retenção do cliente.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-xs font-bold uppercase">
            Governança Ativa ({completedCount}/{ritos.length} Ritos)
          </span>
        </div>
      </div>

      {/* Grid de Ritos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ritos.map((rito) => (
          <div key={rito.id} className="bg-cs-surface border border-cs-border rounded-2xl p-6 hover:border-cs-primary/40 transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cs-primary uppercase tracking-wider bg-cs-primary/10 px-2.5 py-1 rounded-lg border border-cs-primary/20">
                  {rito.frequency}
                </span>
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase",
                  rito.status === 'em_dia' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                  rito.status === 'proximo' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                  "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 animate-pulse"
                )}>
                  {rito.status === 'em_dia' ? 'Em Dia' : rito.status === 'proximo' ? 'Próximo' : 'Revisão Pendente'}
                </span>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-cs-primary transition-colors">{rito.title}</h3>
              <p className="text-xs text-cs-text-secondary leading-relaxed">{rito.objective}</p>

              <div className="pt-2 border-t border-cs-border/50 space-y-2 text-xs">
                <div className="flex justify-between items-center text-cs-text-secondary">
                  <span>Participantes:</span>
                  <span className="text-white font-medium">{rito.participants}</span>
                </div>
                <div className="flex justify-between items-center text-cs-text-secondary">
                  <span>Última Realização:</span>
                  <span className="text-white font-mono">{rito.last_date ? new Date(rito.last_date).toLocaleDateString('pt-BR') : '---'}</span>
                </div>
                <div className="flex justify-between items-center text-cs-text-secondary">
                  <span>Próxima Data:</span>
                  <span className="text-cs-primary font-bold font-mono">{rito.next_date}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-cs-border mt-4 flex justify-end">
              <button
                onClick={() => handleCompleteRito(rito.id)}
                className="bg-cs-bg border border-cs-border hover:border-cs-primary text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 size={14} className="text-green-400" /> Registrar Realização
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Regra de SLA e Indicadores de Capacidade */}
      <div className="bg-cs-surface border border-cs-border rounded-3xl p-6 space-y-4">
        <h3 className="text-white font-bold text-base flex items-center gap-2">
          <Award size={20} className="text-yellow-400" /> Matriz de SLA da Agência
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-cs-bg border border-cs-border rounded-xl p-4 text-center">
            <p className="text-[10px] text-cs-text-secondary uppercase font-bold mb-1">Feedback de Review</p>
            <p className="text-lg font-bold text-white">48 Horas</p>
            <p className="text-[9px] text-cs-text-secondary mt-1">Prazo para aprovação do cliente</p>
          </div>
          <div className="bg-cs-bg border border-cs-border rounded-xl p-4 text-center">
            <p className="text-[10px] text-cs-text-secondary uppercase font-bold mb-1">Jobs Urgentes</p>
            <p className="text-lg font-bold text-white">72 Horas</p>
            <p className="text-[9px] text-cs-text-secondary mt-1">Antecedência mínima necessária</p>
          </div>
          <div className="bg-cs-bg border border-cs-border rounded-xl p-4 text-center">
            <p className="text-[10px] text-cs-text-secondary uppercase font-bold mb-1">Calendário Editorial</p>
            <p className="text-lg font-bold text-white">Todo Dia 25</p>
            <p className="text-[9px] text-cs-text-secondary mt-1">Entrega para o mês seguinte</p>
          </div>
          <div className="bg-cs-bg border border-cs-border rounded-xl p-4 text-center">
            <p className="text-[10px] text-cs-text-secondary uppercase font-bold mb-1">Reunião de Resultado</p>
            <p className="text-lg font-bold text-white">1ª Semana do Mês</p>
            <p className="text-[9px] text-cs-text-secondary mt-1">Apresentação de relatório BI</p>
          </div>
        </div>
      </div>
    </div>
  );
}
