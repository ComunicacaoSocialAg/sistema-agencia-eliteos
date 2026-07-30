import { 
  Rocket, 
  Settings, 
  Zap, 
  TrendingUp, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { cn } from '../utils/cn';

const STAGES = [
  { id: 'onboarding', label: 'Onboarding', icon: Rocket, description: 'Integração e Briefing' },
  { id: 'setup', label: 'Setup / DNA', icon: Settings, description: 'Configuração de Contas' },
  { id: 'performance', label: 'Performance', icon: Zap, description: 'Tração e Resultados' },
  { id: 'scaling', label: 'Escala', icon: TrendingUp, description: 'Expansão de Verba' },
  { id: 'retention', label: 'Elite / LTV', icon: ShieldCheck, description: 'Parceria de Longo Prazo' }
];

export default function ClientLifecycle({ currentStage = 'performance' }) {
  const currentIndex = STAGES.findIndex(s => s.id === currentStage);

  return (
    <div className="bg-cs-surface border border-cs-border rounded-2xl p-6 mb-8 relative overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-sm font-bold text-white mb-1">Ciclo de Vida do Cliente</h3>
          <p className="text-[10px] text-cs-text-secondary uppercase tracking-widest font-bold">Jornada de Maturidade da Conta</p>
        </div>
        <div className="px-3 py-1 bg-cs-primary/10 border border-cs-primary/20 rounded-full">
           <span className="text-[10px] font-bold text-cs-primary">STÁGIO ATUAL: {STAGES[currentIndex].label.toUpperCase()}</span>
        </div>
      </div>

      <div className="flex items-center justify-between relative px-4">
        {/* Connection Line */}
        <div className="absolute top-6 left-12 right-12 h-0.5 bg-cs-border z-0">
          <div 
            className="h-full bg-cs-primary transition-all duration-1000" 
            style={{ width: `${(currentIndex / (STAGES.length - 1)) * 100}%` }}
          />
        </div>

        {STAGES.map((stage, i) => {
          const isCompleted = i < currentIndex;
          const isActive = i === currentIndex;
          const Icon = stage.icon;

          return (
            <div key={stage.id} className="relative z-10 flex flex-col items-center">
              <div 
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 border-2 shadow-lg",
                  isCompleted ? "bg-cs-primary border-cs-primary text-white" :
                  isActive ? "bg-cs-surface border-cs-primary text-cs-primary scale-110 animate-pulse" :
                  "bg-cs-bg border-cs-border text-cs-text-secondary"
                )}
                title={stage.description}
              >
                <Icon size={20} />
              </div>
              <div className="mt-4 text-center">
                <p className={cn(
                  "text-[10px] font-bold uppercase tracking-tighter mb-0.5",
                  isActive ? "text-cs-primary" : isCompleted ? "text-white" : "text-cs-text-secondary"
                )}>
                  {stage.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
