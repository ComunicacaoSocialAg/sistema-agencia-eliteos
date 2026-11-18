import {
  Rocket,
  Settings,
  Zap,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '../utils/cn';

const STAGES = [
  { id: 'onboarding', label: 'Onboarding', icon: Rocket, description: 'Integração e Briefing' },
  { id: 'setup', label: 'Setup / DNA', icon: Settings, description: 'Configuração de Contas' },
  { id: 'performance', label: 'Performance', icon: Zap, description: 'Tração e Resultados' },
  { id: 'scaling', label: 'Escala', icon: TrendingUp, description: 'Expansão de Verba' },
  { id: 'retention', label: 'Elite / LTV', icon: ShieldCheck, description: 'Parceria de Longo Prazo' },
];

export default function ClientLifecycle({ currentStage = 'performance', onStageChange }) {
  const foundIndex = STAGES.findIndex(s => s.id === currentStage);
  const currentIndex = foundIndex >= 0 ? foundIndex : 0;

  return (
    <div className="bg-cs-surface border border-cs-border rounded-2xl p-6 mb-8 relative overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h3 className="text-sm font-bold text-white mb-1">Ciclo de Vida do Cliente</h3>
          <p className="text-[10px] text-cs-text-secondary uppercase tracking-widest font-bold">
            {onStageChange ? 'Clique em um estágio para atualizar a maturidade da conta' : 'Jornada de Maturidade da Conta'}
          </p>
        </div>
        <div className="px-3 py-1 bg-cs-primary/10 border border-cs-primary/20 rounded-full">
          <span className="text-[10px] font-bold text-cs-primary">
            STÁGIO ATUAL: {STAGES[currentIndex].label.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between relative px-2 sm:px-4">
        <div className="absolute top-6 left-8 right-8 sm:left-12 sm:right-12 h-0.5 bg-cs-border z-0">
          <div
            className="h-full bg-cs-primary transition-all duration-700"
            style={{ width: `${(currentIndex / (STAGES.length - 1)) * 100}%` }}
          />
        </div>

        {STAGES.map((stage, i) => {
          const isCompleted = i < currentIndex;
          const isActive = i === currentIndex;
          const Icon = stage.icon;

          const content = (
            <>
              <div
                className={cn(
                  'w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all duration-300 border-2 shadow-lg',
                  isCompleted
                    ? 'bg-cs-primary border-cs-primary text-black'
                    : isActive
                      ? 'bg-cs-surface border-cs-primary text-cs-primary scale-105'
                      : 'bg-cs-bg border-cs-border text-cs-text-secondary',
                  onStageChange && !isActive && 'group-hover:border-cs-primary/70 group-hover:text-white'
                )}
              >
                <Icon size={18} />
              </div>
              <div className="mt-3 text-center">
                <p
                  className={cn(
                    'text-[10px] font-bold uppercase tracking-tighter mb-0.5',
                    isActive ? 'text-cs-primary' : isCompleted ? 'text-white' : 'text-cs-text-secondary'
                  )}
                >
                  {stage.label}
                </p>
              </div>
            </>
          );

          if (onStageChange) {
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => stage.id !== STAGES[currentIndex].id && onStageChange(stage.id)}
                title={`${stage.label}: ${stage.description}`}
                aria-pressed={isActive}
                className="relative z-10 flex flex-col items-center group cursor-pointer focus:outline-none"
              >
                {content}
              </button>
            );
          }

          return (
            <div key={stage.id} className="relative z-10 flex flex-col items-center" title={stage.description}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
