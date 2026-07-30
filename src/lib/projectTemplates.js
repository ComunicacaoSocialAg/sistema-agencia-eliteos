// src/lib/projectTemplates.js
// Templates editáveis de projetos — cada template define um guia de tarefas
// que pode ser personalizado antes de ser disparado no Kanban.

export const PROJECT_TYPES = [
  { id: 'social-media', label: 'Gestão de Redes Sociais', icon: '📱' },
  { id: 'branding', label: 'Identidade Visual / Branding', icon: '🎨' },
  { id: 'site', label: 'Site / Landing Page', icon: '🌐' },
  { id: 'video', label: 'Vídeo / Audiovisual', icon: '🎬' },
  { id: 'campanha', label: 'Campanha de Marketing', icon: '📣' },
  { id: 'trafego', label: 'Tráfego Pago / Mídia', icon: '📊' },
  { id: 'evento', label: 'Evento / Lançamento', icon: '🚀' },
  { id: 'interno', label: 'Demanda Interna da Agência', icon: '🏠' },
  { id: 'proposta', label: 'Proposta para Prospect (CRM)', icon: '💼' },
  { id: 'outro', label: 'Outro (personalizado)', icon: '✏️' },
];

export const PROJECT_TEMPLATES = {
  'social-media': {
    name: 'Gestão de Redes Sociais',
    description: 'Planejamento e execução mensal de conteúdo para redes sociais.',
    estimatedDays: 30,
    tasks: [
      { title: 'Briefing de Conteúdo', description: 'Reunião para definir pautas, tom de voz e objetivos do mês.', day: 0, tag: 'Social Media', estimated_hours: 2, status: 'backlog' },
      { title: 'Calendário Editorial', description: 'Montar grade completa de conteúdo do mês com temas e formatos.', day: 2, tag: 'Social Media', estimated_hours: 3, status: 'backlog' },
      { title: 'Produção de Artes — Semana 1', description: 'Criar peças visuais da primeira semana conforme calendário aprovado.', day: 5, tag: 'Social Media', estimated_hours: 8, status: 'backlog' },
      { title: 'Produção de Artes — Semana 2', description: 'Criar peças visuais da segunda semana.', day: 10, tag: 'Social Media', estimated_hours: 8, status: 'backlog' },
      { title: 'Produção de Artes — Semana 3', description: 'Criar peças visuais da terceira semana.', day: 17, tag: 'Social Media', estimated_hours: 8, status: 'backlog' },
      { title: 'Produção de Artes — Semana 4', description: 'Criar peças visuais da quarta semana.', day: 22, tag: 'Social Media', estimated_hours: 8, status: 'backlog' },
      { title: 'Relatório Mensal de Performance', description: 'Compilar métricas e entregar relatório ao cliente.', day: 30, tag: 'Social Media', estimated_hours: 4, status: 'backlog' },
    ],
  },

  'branding': {
    name: 'Identidade Visual / Branding',
    description: 'Desenvolvimento completo de identidade visual da marca.',
    estimatedDays: 21,
    tasks: [
      { title: 'Briefing de Marca', description: 'Entrevista profunda: valores, missão, público, concorrência e referências.', day: 0, tag: 'Branding', estimated_hours: 3, status: 'backlog' },
      { title: 'Pesquisa e Moodboard', description: 'Análise de mercado, tendências e compilação de referências visuais.', day: 2, tag: 'Branding', estimated_hours: 6, status: 'backlog' },
      { title: 'Exploração de Logo — 3 Conceitos', description: 'Apresentar 3 direções distintas de identidade para o cliente escolher.', day: 7, tag: 'Branding', estimated_hours: 16, status: 'backlog' },
      { title: 'Refinamento do Conceito Escolhido', description: 'Desenvolver e refinar o conceito aprovado com variações.', day: 12, tag: 'Branding', estimated_hours: 10, status: 'backlog' },
      { title: 'Manual da Marca (Brandbook)', description: 'Documentar cores, tipografia, usos corretos e incorretos da marca.', day: 16, tag: 'Branding', estimated_hours: 12, status: 'backlog' },
      { title: 'Entrega Final dos Arquivos', description: 'Organizar e entregar todos os arquivos nos formatos solicitados.', day: 21, tag: 'Branding', estimated_hours: 3, status: 'backlog' },
    ],
  },

  'site': {
    name: 'Site / Landing Page',
    description: 'Criação de site institucional ou landing page de alta conversão.',
    estimatedDays: 30,
    tasks: [
      { title: 'Briefing e Definição de Escopo', description: 'Definir páginas, funcionalidades, CMS e objetivos do site.', day: 0, tag: 'Web', estimated_hours: 3, status: 'backlog' },
      { title: 'Arquitetura de Informação (Sitemap)', description: 'Mapear a estrutura de páginas e navegação do site.', day: 2, tag: 'Web', estimated_hours: 4, status: 'backlog' },
      { title: 'Wireframes (Baixa Fidelidade)', description: 'Rascunhos da estrutura de cada página.', day: 5, tag: 'Web', estimated_hours: 8, status: 'backlog' },
      { title: 'Design Visual (Alta Fidelidade)', description: 'Criar o design completo de todas as páginas no Figma.', day: 10, tag: 'Web', estimated_hours: 20, status: 'backlog' },
      { title: 'Aprovação do Design pelo Cliente', description: 'Apresentar design e coletar feedback para ajustes finais.', day: 16, tag: 'Web', estimated_hours: 2, status: 'backlog' },
      { title: 'Desenvolvimento Front-End', description: 'Codificar o site aprovado e integrar com CMS.', day: 18, tag: 'Web', estimated_hours: 24, status: 'backlog' },
      { title: 'Testes e Ajustes (QA)', description: 'Testar em mobile, tablet, desktop e browsers. Corrigir bugs.', day: 26, tag: 'Web', estimated_hours: 6, status: 'backlog' },
      { title: 'Deploy e Go-Live', description: 'Configurar domínio, hospedagem e publicar o site.', day: 29, tag: 'Web', estimated_hours: 4, status: 'backlog' },
    ],
  },

  'video': {
    name: 'Vídeo / Audiovisual',
    description: 'Produção de vídeo institucional, reels, documentário ou campanha.',
    estimatedDays: 20,
    tasks: [
      { title: 'Briefing Criativo', description: 'Definir roteiro, tom, locações, elenco e equipamentos necessários.', day: 0, tag: 'Vídeo', estimated_hours: 3, status: 'backlog' },
      { title: 'Desenvolvimento do Roteiro', description: 'Escrever roteiro completo e aprovado pelo cliente.', day: 3, tag: 'Vídeo', estimated_hours: 8, status: 'backlog' },
      { title: 'Produção (Gravação)', description: 'Dia(s) de gravação conforme roteiro aprovado.', day: 8, tag: 'Vídeo', estimated_hours: 12, status: 'backlog' },
      { title: 'Edição — Corte Rough', description: 'Primeiro corte para aprovação de estrutura e ritmo.', day: 12, tag: 'Vídeo', estimated_hours: 10, status: 'backlog' },
      { title: 'Edição Final (Color + Motion)', description: 'Finalização com color grading, motion graphics e trilha.', day: 16, tag: 'Vídeo', estimated_hours: 8, status: 'backlog' },
      { title: 'Entrega e Exportação', description: 'Exportar nos formatos e resoluções solicitados.', day: 20, tag: 'Vídeo', estimated_hours: 2, status: 'backlog' },
    ],
  },

  'campanha': {
    name: 'Campanha de Marketing',
    description: 'Planejamento e execução de campanha integrada (online + offline).',
    estimatedDays: 25,
    tasks: [
      { title: 'Briefing Estratégico da Campanha', description: 'Definir objetivo, KPIs, verba, canais e público.', day: 0, tag: 'Campanha', estimated_hours: 4, status: 'backlog' },
      { title: 'Conceito Criativo', description: 'Desenvolver conceito central e tagline da campanha.', day: 3, tag: 'Campanha', estimated_hours: 8, status: 'backlog' },
      { title: 'Produção de Materiais', description: 'Criar todas as peças (digital, impresso, vídeo) conforme o conceito.', day: 7, tag: 'Campanha', estimated_hours: 20, status: 'backlog' },
      { title: 'Revisão e Aprovação do Cliente', description: 'Apresentar materiais e recolher aprovações.', day: 15, tag: 'Campanha', estimated_hours: 3, status: 'backlog' },
      { title: 'Lançamento e Publicação', description: 'Publicar materiais nos canais definidos no briefing.', day: 20, tag: 'Campanha', estimated_hours: 6, status: 'backlog' },
      { title: 'Monitoramento e Relatório', description: 'Acompanhar resultados e entregar relatório de performance.', day: 25, tag: 'Campanha', estimated_hours: 5, status: 'backlog' },
    ],
  },

  'trafego': {
    name: 'Tráfego Pago / Mídia',
    description: 'Setup, gestão e otimização de campanhas de anúncios pagos.',
    estimatedDays: 30,
    tasks: [
      { title: 'Auditoria das Contas de Anúncios', description: 'Revisar configurações do Meta Ads, Google Ads e histórico.', day: 0, tag: 'Campanha', estimated_hours: 4, status: 'backlog' },
      { title: 'Planejamento de Mídia', description: 'Definir verba, públicos, objetivos e estrutura de campanhas.', day: 2, tag: 'Campanha', estimated_hours: 6, status: 'backlog' },
      { title: 'Criação dos Criativos', description: 'Produzir peças (imagens e vídeos) para os anúncios.', day: 5, tag: 'Campanha', estimated_hours: 10, status: 'backlog' },
      { title: 'Setup e Lançamento das Campanhas', description: 'Subir campanhas nas plataformas e ativar anúncios.', day: 8, tag: 'Campanha', estimated_hours: 6, status: 'backlog' },
      { title: 'Otimização — Semana 2', description: 'Analisar dados e otimizar públicos, lances e criativos.', day: 14, tag: 'Campanha', estimated_hours: 3, status: 'backlog' },
      { title: 'Otimização — Semana 3', description: 'Segunda rodada de otimizações e testes A/B.', day: 21, tag: 'Campanha', estimated_hours: 3, status: 'backlog' },
      { title: 'Relatório Mensal de Mídia', description: 'Compilar resultados: CPL, CPA, ROAS e recomendações.', day: 30, tag: 'Campanha', estimated_hours: 4, status: 'backlog' },
    ],
  },

  'evento': {
    name: 'Evento / Lançamento',
    description: 'Planejamento e execução de evento, lançamento de produto ou ativação.',
    estimatedDays: 30,
    tasks: [
      { title: 'Briefing do Evento', description: 'Definir data, local, público, objetivos e verba.', day: 0, tag: 'Campanha', estimated_hours: 3, status: 'backlog' },
      { title: 'Identidade Visual do Evento', description: 'Criar logo, paleta e materiais visuais do evento.', day: 5, tag: 'Branding', estimated_hours: 12, status: 'backlog' },
      { title: 'Estratégia de Divulgação', description: 'Planejar canais, cronograma de posts e comunicações.', day: 8, tag: 'Social Media', estimated_hours: 6, status: 'backlog' },
      { title: 'Materiais de Divulgação', description: 'Produzir peças para redes sociais, e-mail e impresso.', day: 10, tag: 'Campanha', estimated_hours: 16, status: 'backlog' },
      { title: 'Cobertura do Evento (Foto/Vídeo)', description: 'Registrar o evento com foto e vídeo profissional.', day: 28, tag: 'Vídeo', estimated_hours: 8, status: 'backlog' },
      { title: 'Pós-Evento: Edição e Publicação', description: 'Editar conteúdo e publicar highlights nas redes.', day: 30, tag: 'Vídeo', estimated_hours: 6, status: 'backlog' },
    ],
  },

  'interno': {
    name: 'Demanda Interna da Agência',
    description: 'Projeto ou melhoria interna sem vínculo com cliente externo.',
    estimatedDays: 14,
    tasks: [
      { title: 'Definição do Objetivo e Escopo', description: 'Documentar o que será feito, por quê e quem é responsável.', day: 0, tag: 'Campanha', estimated_hours: 2, status: 'backlog' },
      { title: 'Execução', description: 'Realizar as tarefas definidas no escopo interno.', day: 2, tag: 'Campanha', estimated_hours: 10, status: 'backlog' },
      { title: 'Revisão e Ajustes', description: 'Avaliar o resultado e aplicar melhorias.', day: 10, tag: 'Campanha', estimated_hours: 4, status: 'backlog' },
      { title: 'Entrega / Conclusão', description: 'Finalizar e documentar o resultado.', day: 14, tag: 'Campanha', estimated_hours: 2, status: 'backlog' },
    ],
  },

  'proposta': {
    name: 'Proposta Comercial',
    description: 'Elaboração de proposta para um prospect. Gera deal automático no CRM.',
    estimatedDays: 7,
    tasks: [
      { title: 'Levantamento de Necessidades', description: 'Reunião ou pesquisa para entender os desafios e objetivos do prospect.', day: 0, tag: 'Campanha', estimated_hours: 2, status: 'backlog' },
      { title: 'Elaboração da Proposta', description: 'Redigir escopo, serviços, prazo e investimento.', day: 2, tag: 'Campanha', estimated_hours: 6, status: 'backlog' },
      { title: 'Apresentação ao Cliente', description: 'Reunião de apresentação da proposta (presencial ou remota).', day: 5, tag: 'Campanha', estimated_hours: 2, status: 'backlog' },
      { title: 'Follow-up e Negociação', description: 'Acompanhar a decisão e negociar ajustes se necessário.', day: 7, tag: 'Campanha', estimated_hours: 2, status: 'backlog' },
    ],
  },

  'outro': {
    name: 'Projeto Personalizado',
    description: 'Projeto de escopo livre. Adicione as tarefas conforme a necessidade.',
    estimatedDays: 14,
    tasks: [
      { title: 'Briefing Inicial', description: 'Documentar objetivos, prazos e responsáveis.', day: 0, tag: 'Campanha', estimated_hours: 2, status: 'backlog' },
      { title: 'Execução', description: 'Realizar as entregas planejadas.', day: 3, tag: 'Campanha', estimated_hours: 8, status: 'backlog' },
      { title: 'Entrega Final', description: 'Consolidar e entregar os resultados.', day: 14, tag: 'Campanha', estimated_hours: 2, status: 'backlog' },
    ],
  },
};

// Gera tarefas com datas calculadas a partir da data de início
export function generateProjectTasks(templateId, clientId, clientName, startDate, overrides = []) {
  const template = PROJECT_TEMPLATES[templateId];
  if (!template) return [];

  const base = startDate ? new Date(startDate) : new Date();
  const tasks = overrides.length > 0 ? overrides : template.tasks;

  return tasks.map((task, index) => {
    const due = new Date(base);
    due.setDate(due.getDate() + (task.day || 0));

    return {
      id: `proj-${Date.now()}-${index}`,
      title: task.title,
      notes: task.description,
      status: 'backlog',
      tag: task.tag || 'Campanha',
      estimated_hours: task.estimated_hours || 4,
      deadline: due.toISOString().split('T')[0],
      client_id: clientId || null,
      client_name: clientName || 'Interno',
      is_project_task: true,
      day_offset: task.day || 0,
    };
  });
}
