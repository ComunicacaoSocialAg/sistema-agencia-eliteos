import {
  Rocket,
  Settings,
  Zap,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '../utils/cn';
import { LIFECYCLE_STAGE_META, normalizeLifecycleStage } from '../lib/lifecycle';

const STAGE_ICONS = {
  onboarding: Rocket,
  setup: Settings,
  performance: Zap,
  scaling: TrendingUp,
  retention: ShieldCheck,
};

const LIFECYCLE_STAGES = LIFECYCLE_STAGE_META.map(stage => ({
  ...stage,
  icon: STAGE_ICONS[stage.id] || Rocket,
}));

export default function ClientLifecycle({ currentStage = 'performance', onStageChange }) {
  const resolvedStage = normalizeLifecycleStage(currentStage);
  const foundIndex = LIFECYCLE_STAGES.findIndex(s => s.id === resolvedStage);
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
            STÁGIO ATUAL: {LIFECYCLE_STAGES[currentIndex].label.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="flex items-start justify-between gap-1.5 relative px-1 sm:px-4">
        <div className="absolute top-5 sm:top-6 left-6 right-6 sm:left-12 sm:right-12 h-0.5 bg-cs-border z-0">
          <div
            className="h-full bg-cs-primary transition-all duration-700"
            style={{ width: `${(currentIndex / (LIFECYCLE_STAGES.length - 1)) * 100}%` }}
          />
        </div>

        {LIFECYCLE_STAGES.map((stage, i) => {
          const isCompleted = i < currentIndex;
          const isActive = i === currentIndex;
          const Icon = stage.icon;

          const content = (
            <>
              <div
                className={cn(
                  'w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all duration-300 border-2 shadow-lg shrink-0',
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
              <div className="mt-2.5 sm:mt-3 text-center px-0.5 w-full min-w-0">
                <p
                  className={cn(
                    'text-[9px] sm:text-[10px] font-bold uppercase tracking-tight leading-tight mb-0.5 break-words',
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
                onClick={() => stage.id !== LIFECYCLE_STAGES[currentIndex].id && onStageChange(stage.id)}
                title={`${stage.label}: ${stage.description}`}
                aria-pressed={isActive}
                className="relative z-10 flex-1 min-w-0 flex flex-col items-center group cursor-pointer focus:outline-none"
              >
                {content}
              </button>
            );
          }

          return (
            <div key={stage.id} className="relative z-10 flex-1 min-w-0 flex flex-col items-center" title={stage.description}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
