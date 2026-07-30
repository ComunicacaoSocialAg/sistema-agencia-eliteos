import { useState, useEffect, useMemo } from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  Download, 
  Clock, 
  Heart, 
  AlertTriangle, 
  Zap, 
  Activity,
  User,
  Users,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { useAIAssistant } from '../contexts/AIAssistantContext';
import { useIntelligence } from '../hooks/useIntelligence';
import { useClients } from '../hooks/useClients';
import { cn } from '../utils/cn';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ReportsView() {
  const { setContext, chatWithAgent } = useAIAssistant();
  const { healthScores, hourMetrics, recentLogs, capacity, loading } = useIntelligence();
  const { clients } = useClients();
  const [selectedClient, setSelectedClient] = useState(null);

  const clientNameMap = useMemo(
    () => Object.fromEntries((clients || []).map(c => [c.id, c.name])),
    [clients]
  );

  useEffect(() => {
    if (healthScores.length > 0) {
      setContext({
        module: 'inteligencia',
        title: 'Inteligência & BI',
        data: {
          health_scores: healthScores,
          metricas_horas: hourMetrics,
          logs_recentes: recentLogs.length
        },
      });
    }
  }, [healthScores, hourMetrics, recentLogs, setContext]);

  if (loading && healthScores.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-cs-bg">
        <div className="w-10 h-10 border-4 border-cs-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const [isSummarizing, setIsSummarizing] = useState(false);
  const [weeklySummary, setWeeklySummary] = useState('');

  const handleWeeklySummary = async () => {
    if (recentLogs.length === 0) {
      alert('Sem atividades registradas para resumir.');
      return;
    }
    setIsSummarizing(true);
    try {
      const logsText = recentLogs.map(l => `- ${l.created_at}: ${l.action} em ${l.entity_type} (novo status: ${l.new_value?.status})`).join('\n');
      const prompt = `Gere um resumo semanal profissional para o cliente baseado nestes eventos de produção da agência:\n${logsText}\n\nO tom deve ser de "parceria e progresso", focado em valor entregue e próximos passos. Responda em português.`;
      
      const response = await chatWithAgent('analyst', [], prompt);
      setWeeklySummary(response.text);
    } catch (error) {
      console.error(error);
      alert('Erro ao gerar resumo.');
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-cs-bg p-8 overflow-y-auto custom-scrollbar space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1 tracking-tight">Agência Intelligence</h2>
          <p className="text-cs-text-secondary text-sm">Saúde da carteira e eficiência operacional em tempo real.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleWeeklySummary}
            disabled={isSummarizing}
            className="bg-cs-surface border border-cs-border hover:bg-white/5 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
          >
            {isSummarizing ? <Clock size={16} className="animate-spin" /> : <Zap size={16} className="text-cs-primary fill-cs-primary/20" />}
            {isSummarizing ? 'RESUMINDO...' : 'RESUMO SEMANAL IA'}
          </button>
          <button className="bg-cs-primary hover:bg-cs-primary-hover text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-cs-primary/20 flex items-center gap-2">
            <BarChart2 size={16} /> GERAR RELATÓRIO PDF
          </button>
        </div>
      </div>

      {weeklySummary && (
        <div className="bg-gradient-to-br from-cs-primary/10 to-cs-accent/10 border border-cs-primary/20 rounded-3xl p-8 animate-in slide-in-from-top-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Zap size={120} className="text-cs-primary" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white tracking-tight">Resumo de Valor da Semana</h3>
              <button 
                onClick={() => { navigator.clipboard.writeText(weeklySummary); alert('Copiado!'); }}
                className="text-[10px] font-bold text-cs-primary hover:text-white uppercase tracking-widest"
              >
                COPIAR RELATÓRIO
              </button>
            </div>
            <div className="prose prose-invert max-w-none">
              <p className="text-sm text-cs-text-primary leading-relaxed whitespace-pre-wrap">{weeklySummary}</p>
            </div>
            <button 
              onClick={() => setWeeklySummary('')}
              className="mt-6 text-[10px] font-bold text-cs-text-secondary hover:text-white uppercase"
            >
              FECHAR
            </button>
          </div>
        </div>
      )}

      {/* Top Metrics: Health Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Object.entries(healthScores || {}).map(([clientId, score]) => (
          <div key={clientId} className="bg-cs-surface border border-cs-border rounded-3xl p-6 relative overflow-hidden group hover:border-cs-primary/30 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Heart size={60} className={cn(score > 70 ? "text-green-500" : score > 40 ? "text-yellow-500" : "text-red-500")} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest">{clientNameMap[clientId] || 'Cliente'}</span>
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  score > 70 ? "bg-green-500" : score > 40 ? "bg-yellow-500" : "bg-red-500 animate-pulse"
                )} />
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-black text-white tracking-tighter">{score}</h3>
                <span className="text-xs font-bold text-cs-text-secondary">SCORE</span>
              </div>
              <p className={cn(
                "text-[10px] font-bold mt-2 uppercase tracking-tight",
                score > 70 ? "text-green-500" : score > 40 ? "text-yellow-500" : "text-red-500"
              )}>
                {score > 70 ? 'Saúde Excelente' : score > 40 ? 'Atenção Necessária' : 'Risco Crítico'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Team Capacity */}
      {capacity && capacity.length > 0 && (
        <div className="bg-cs-surface border border-cs-border rounded-3xl p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Users size={20} className="text-cs-primary" />
              Carga da Equipe (7 dias)
            </h3>
            <span className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest">
              {capacity.length} {capacity.length === 1 ? 'membro' : 'membros'}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {capacity.map((member) => {
              const load = Math.min(member.load7d ?? 0, 100);
              const barColor = load > 80 ? 'bg-red-500' : load >= 50 ? 'bg-yellow-500' : 'bg-green-500';
              const textColor = load > 80 ? 'text-red-400' : load >= 50 ? 'text-yellow-400' : 'text-green-400';
              return (
                <div key={member.name} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center">
                        <User size={12} className="text-cs-text-secondary" />
                      </div>
                      <span className="text-xs font-bold text-white">{member.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-cs-text-secondary font-mono">
                        {member.tasksCount ?? 0} {(member.tasksCount ?? 0) === 1 ? 'tarefa' : 'tarefas'}
                      </span>
                      <span className={cn('text-xs font-black tabular-nums', textColor)}>
                        {load}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-500', barColor)}
                      style={{ width: `${load}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Chart: Hour Usage */}
        <div className="lg:col-span-8 bg-cs-surface border border-cs-border rounded-3xl p-8 flex flex-col shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Clock size={20} className="text-cs-primary" />
                Consumo de Horas Contratadas
              </h3>
              <p className="text-xs text-cs-text-secondary">Progresso do mês atual vs. limite contratual.</p>
            </div>
          </div>

          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourMetrics} layout="vertical" margin={{ left: 40, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="#a1a1aa" 
                  fontSize={10} 
                  fontWeight="bold"
                  axisLine={false}
                  tickLine={false}
                  width={100}
                />
                <Tooltip 
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '12px', color: '#fff' }}
                  formatter={(value) => [`${value.toFixed(1)}h`, 'Consumido']}
                />
                <Bar dataKey="consumed" radius={[0, 10, 10, 0]} barSize={24}>
                  {hourMetrics.map((entry, index) => (
                    <Cell key={index} fill={entry.usage_percent > 90 ? '#ef4444' : entry.usage_percent > 70 ? '#f59e0b' : '#3b82f6'} />
                  ))}
                </Bar>
                <Bar dataKey="contracted" fill="#ffffff08" radius={[0, 10, 10, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6 flex items-center gap-6 border-t border-cs-border/50 pt-6">
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded bg-cs-primary" />
               <span className="text-[10px] font-bold text-white uppercase tracking-widest">Normal</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded bg-yellow-500" />
               <span className="text-[10px] font-bold text-white uppercase tracking-widest">Atenção</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded bg-red-500" />
               <span className="text-[10px] font-bold text-white uppercase tracking-widest">Crítico</span>
             </div>
          </div>
        </div>

        {/* Sidebar: Recent Activities */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          <div className="bg-cs-surface border border-cs-border rounded-3xl p-6 flex flex-col h-full shadow-xl">
             <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
               <Activity size={16} className="text-cs-primary" /> Atividade em Tempo Real
             </h3>
             <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
               {recentLogs.map((log) => (
                 <div key={log.id} className="relative pl-6 pb-4 border-l border-cs-border last:pb-0">
                    <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-cs-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    <p className="text-[10px] text-white font-bold tracking-tight mb-0.5">
                      {log.action === 'status_change' ? 'Status Alterado' : 'Aprovação Registrada'}
                    </p>
                    <p className="text-[11px] text-cs-text-secondary leading-snug">
                      {log.entity_type === 'task' ? 'Tarefa' : 'Entregável'} atualizado para <span className="text-white font-medium">{log.new_value?.status}</span>
                    </p>
                    <p className="text-[9px] text-zinc-600 mt-1 font-mono uppercase">
                      {format(parseISO(log.created_at), "HH:mm '•' dd MMM", { locale: ptBR })}
                    </p>
                 </div>
               ))}
               {recentLogs.length === 0 && (
                 <div className="text-center py-12 text-cs-text-secondary text-xs italic">
                    Nenhuma atividade registrada hoje.
                 </div>
               )}
             </div>
          </div>

          {/* Quick AI Action Card */}
          <div className="bg-gradient-to-br from-cs-primary to-cs-accent rounded-3xl p-6 text-white shadow-2xl shadow-cs-primary/20 group cursor-pointer hover:scale-[1.02] transition-all">
             <div className="flex items-center gap-3 mb-3">
               <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                 <Zap size={20} className="fill-white" />
               </div>
               <h4 className="font-bold text-sm tracking-tight">AI Insight Pro</h4>
             </div>
             <p className="text-xs text-white/80 leading-relaxed mb-4">
               Com base nos logs, o cliente **Café Blend** está com baixo engajamento. Sugerimos uma reunião de alinhamento.
             </p>
             <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
               AGENDAR REUNIÃO <ArrowUpRight size={14} />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
