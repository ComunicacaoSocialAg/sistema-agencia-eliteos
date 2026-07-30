import { 
  Target, 
  TrendingUp, 
  DollarSign, 
  Zap,
  BarChart3,
  Globe,
  Camera
} from 'lucide-react';
import { cn } from '../utils/cn';

export default function StrategicRoadmap({ clientId }) {
  const plans = [
    {
      channel: 'Meta Ads',
      objective: 'Conversão / Vendas Diretas',
      budget: 3500,
      kpi: 'CPL < R$ 12,00',
      status: 'Em Execução',
      icon: Camera,
      color: 'text-purple-400'
    },
    {
      channel: 'Google Search',
      objective: 'Captura de Demanda Ativa',
      budget: 1500,
      kpi: 'ROAS > 4.5x',
      status: 'Aguardando Verba',
      icon: Globe,
      color: 'text-blue-400'
    },
    {
      channel: 'Conteúdo / SEO',
      objective: 'Autoridade de Marca',
      budget: 0,
      kpi: '10 Posts/Mês',
      status: 'Planejado',
      icon: Zap,
      color: 'text-yellow-400'
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Roadmap Estratégico</h3>
          <p className="text-xs text-cs-text-secondary uppercase tracking-widest font-bold">Planejamento de Canais e Verbas</p>
        </div>
        <div className="flex gap-2">
           <div className="bg-cs-surface border border-cs-border rounded-xl px-4 py-2">
             <span className="text-[10px] text-cs-text-secondary uppercase font-bold block">Verba Total Mês</span>
             <span className="text-sm font-bold text-white">R$ 5.000,00</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, i) => (
          <div key={i} className="bg-cs-surface border border-cs-border rounded-2xl p-6 hover:border-cs-primary/40 transition-all group relative overflow-hidden">
            <div className="relative z-10">
              <div className={cn("w-12 h-12 bg-cs-bg rounded-xl flex items-center justify-center border border-cs-border mb-4 group-hover:scale-110 transition-transform", plan.color)}>
                <plan.icon size={24} />
              </div>
              <h4 className="text-white font-bold mb-1">{plan.channel}</h4>
              <p className="text-[10px] text-cs-text-secondary font-bold uppercase tracking-widest mb-4">{plan.objective}</p>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-cs-text-secondary uppercase font-bold">Investimento</span>
                  <span className="text-sm font-mono font-bold text-white">R$ {plan.budget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <Camera size={14} className="text-pink-500" />
                  <span className="text-[10px] text-cs-text-secondary font-bold uppercase">Redes Sociais</span>
                  <span className="text-sm font-bold text-cs-primary">{plan.kpi}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-cs-border flex items-center justify-between">
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded uppercase",
                  plan.status === 'Em Execução' ? 'bg-green-500/10 text-green-400' : 'bg-cs-bg text-cs-text-secondary'
                )}>
                  {plan.status}
                </span>
                <button className="text-[10px] text-cs-primary font-bold hover:underline">DETALHES</button>
              </div>
            </div>
            
            {/* Background Icon Watermark */}
            <plan.icon size={80} className={cn("absolute -right-4 -bottom-4 opacity-5 transition-transform group-hover:scale-110", plan.color)} />
          </div>
        ))}
      </div>

      <div className="bg-cs-bg/50 border border-cs-border border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-cs-surface rounded-full flex items-center justify-center mb-4 text-cs-text-secondary">
          <BarChart3 size={24} />
        </div>
        <h4 className="text-white font-bold mb-2">Deseja expandir a estratégia?</h4>
        <p className="text-xs text-cs-text-secondary max-w-sm mb-6 leading-relaxed">
          Nossa IA de BI sugere a abertura do canal **TikTok Ads** com base no perfil do seu público-alvo. O investimento estimado para teste é de R$ 800,00.
        </p>
        <button className="bg-cs-surface border border-cs-border hover:bg-cs-surface-hover text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all">
          ANALISAR SUGESTÃO DA IA
        </button>
      </div>
    </div>
  );
}
