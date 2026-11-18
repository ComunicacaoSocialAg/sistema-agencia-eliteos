export const LIFECYCLE_STAGE_IDS = ['onboarding', 'setup', 'performance', 'scaling', 'retention'];

export const LIFECYCLE_STAGE_META = [
  { id: 'onboarding', label: 'Onboarding', description: 'Integração e Briefing' },
  { id: 'setup', label: 'Setup / DNA', description: 'Configuração de Contas' },
  { id: 'performance', label: 'Performance', description: 'Tração e Resultados' },
  { id: 'scaling', label: 'Escala', description: 'Expansão de Verba' },
  { id: 'retention', label: 'Elite / LTV', description: 'Parceria de Longo Prazo' },
];

const STAGE_ALIASES = {
  estrategia: 'setup',
  producao: 'performance',
  retencao: 'retention',
};

export function normalizeLifecycleStage(stage) {
  const normalized = STAGE_ALIASES[stage] || stage;
  return LIFECYCLE_STAGE_IDS.includes(normalized) ? normalized : 'onboarding';
}
