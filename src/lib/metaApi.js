// src/lib/metaApi.js
// Camada de integração para Meta Graph API, Analytics Orgânico/Pago, Social Listening e SAC

export const CLIENT_DATASETS = {
  'client-alberto-brasil': {
    id: 'client-alberto-brasil',
    name: 'Dr. Alberto Brasil (Cirurgia Vascular)',
    handle: '@dralbertobr',
    pageName: 'Clínica Dr. Alberto Brasil - Cirurgia Vascular',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=300&auto=format&fit=crop',
    segment: 'Saúde / Medicina Especializada',
    city: 'Poços de Caldas - MG',
    tone_of_voice: 'Ético, Técnico-Acessível, Empático e Educativo em Saúde Vascular',
    credentials: {
      ig_user_id: '17841447659233841',
      fb_page_id: '151850335022084',
      ad_account_id: 'act_6957602694317339',
      token_status: 'valid',
      last_sync: '2026-08-19T13:30:00Z',
      active_permissions: [
        'pages_show_list',
        'pages_read_engagement',
        'instagram_basic',
        'instagram_manage_insights',
        'instagram_manage_comments',
        'instagram_manage_messages',
        'ads_read',
        'business_management'
      ]
    },
    // Métricas para o período oficial analisado (05/07/2026 a 05/08/2026)
    kpis: {
      period_label: '05/07/2026 a 05/08/2026',
      total_reach: 1142,
      reach_organic: 1142,
      reach_paid: 0,
      total_interactions: 35,
      likes: 29,
      shares: 5,
      comments: 0,
      saves: 0,
      new_followers: 15,
      total_followers: 2015,
      posts_count: 5,
      avg_reach_per_post: 228.4,
      interaction_rate: '3.07%',
      profile_views: 312,
      website_clicks: 48,
      fb_followers: 856,
      fb_new_followers: 1,
      fb_shares: 2,
      fb_reactions: 1
    },
    // Série temporal de alcance diário e seguidores
    time_series: [
      { date: '05/07', reach: 45, followers: 2000, interactions: 2 },
      { date: '09/07', reach: 68, followers: 2001, interactions: 3 },
      { date: '14/07', reach: 113, followers: 2003, interactions: 6 },
      { date: '17/07', reach: 260, followers: 2005, interactions: 7 },
      { date: '22/07', reach: 74, followers: 2007, interactions: 1 },
      { date: '28/07', reach: 185, followers: 2013, interactions: 5 },
      { date: '30/07', reach: 241, followers: 2014, interactions: 8 },
      { date: '03/08', reach: 292, followers: 2015, interactions: 6 },
      { date: '05/08', reach: 35, followers: 2015, interactions: 1 }
    ],
    // Postagens auditadas no período
    posts: [
      {
        id: 'post-1',
        permalink: 'https://www.instagram.com/p/Dbbk1sQEsFL/',
        title: 'Medo de manchas ou marcas de queimadura após o Laser',
        caption: 'O medo mais comum no consultório é a queimadura de pele. O laser transdérmico atua especificamente na hemoglobina do vaso sem lesionar a epiderme superficial...',
        type: 'CAROUSEL',
        type_label: 'Carrossel Educativo',
        date: '2026-08-03T18:30:00Z',
        date_formatted: '03/08/2026',
        reach: 292,
        rank: 1,
        likes: 5,
        comments: 0,
        shares: 1,
        saves: 0,
        total_interactions: 6,
        engagement_rate: '2.05%',
        thumbnail: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=400&auto=format&fit=crop',
        key_learning: 'Formato Carrossel gerou a maior entrega orgânica do mês (292 contas).'
      },
      {
        id: 'post-2',
        permalink: 'https://www.instagram.com/p/Dbbk1sQEsFL/',
        title: 'Inchaço nos dois tornozelos vs inchaço em só um lado',
        caption: 'Inchaço bilateral costuma ter relação sistêmica (coração, rins ou medicamentos). Já o inchaço assimétrico exige avaliação vascular imediata...',
        type: 'CAROUSEL',
        type_label: 'Carrossel Diagnóstico',
        date: '2026-07-17T19:00:00Z',
        date_formatted: '17/07/2026',
        reach: 260,
        rank: 2,
        likes: 6,
        comments: 0,
        shares: 1,
        saves: 0,
        total_interactions: 7,
        engagement_rate: '2.69%',
        thumbnail: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop',
        key_learning: 'Dúvida clínica com alto salvamento potencial e retenção.'
      },
      {
        id: 'post-3',
        permalink: 'https://www.instagram.com/p/Dbbk1sQEsFL/',
        title: 'O corpo é inteligente: drenagem e circulação venosa',
        caption: 'Quando uma veia falha, vasos colaterais tentam compensar o fluxo. Só que colateral não é solução definitiva, é apenas um desvio de emergência...',
        type: 'IMAGE',
        type_label: 'Imagem Única',
        date: '2026-07-30T20:43:00Z',
        date_formatted: '30/07/2026',
        reach: 241,
        rank: 3,
        likes: 7,
        comments: 0,
        shares: 1,
        saves: 0,
        total_interactions: 8,
        engagement_rate: '3.32%',
        thumbnail: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=400&auto=format&fit=crop',
        key_learning: 'Post com maior número absoluto de curtidas no mês (7 likes).'
      },
      {
        id: 'post-4',
        permalink: 'https://www.instagram.com/p/Dbbk1sQEsFL/',
        title: 'Viagem longa + cirurgia recente (Risco de Trombose)',
        caption: 'Voos com mais de 4 horas aumentam a estase venosa. Se você operou recentemente, o uso de meias elásticas e hidratação são mandatórios...',
        type: 'IMAGE',
        type_label: 'Imagem Informativa',
        date: '2026-07-29T14:15:00Z',
        date_formatted: '29/07/2026',
        reach: 236,
        rank: 4,
        likes: 5,
        comments: 0,
        shares: 1,
        saves: 0,
        total_interactions: 6,
        engagement_rate: '2.54%',
        thumbnail: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?q=80&w=400&auto=format&fit=crop',
        key_learning: 'Compartilhado no Facebook e Instagram simultaneamente.'
      },
      {
        id: 'post-5',
        permalink: 'https://www.instagram.com/p/Dbbk1sQEsFL/',
        title: 'Atletas de alta performance e dores nas pernas',
        caption: 'Varizes e insuficiência venosa também atingem corredores e atletas de alto rendimento. Não confunda cansaço muscular com estase venosa...',
        type: 'IMAGE',
        type_label: 'Imagem Nichada',
        date: '2026-07-14T11:20:00Z',
        date_formatted: '14/07/2026',
        reach: 113,
        rank: 5,
        likes: 6,
        comments: 0,
        shares: 0,
        saves: 0,
        total_interactions: 6,
        engagement_rate: '5.31%',
        thumbnail: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=400&auto=format&fit=crop',
        key_learning: 'Maior taxa de engajamento proporcional (5,31%).'
      }
    ],
    // Demografia dos seguidores
    demographics: {
      top_cities: [
        { city: 'Poços de Caldas (MG)', percentage: 64, count: 1290, is_primary: true },
        { city: 'Campestre (MG)', percentage: 11, count: 221 },
        { city: 'Botelhos (MG)', percentage: 8, count: 161 },
        { city: 'Andradas (MG)', percentage: 7, count: 141 },
        { city: 'São João da Boa Vista (SP)', percentage: 6, count: 121 },
        { city: 'Divinolândia (SP)', percentage: 4, count: 81 }
      ],
      age_gender: [
        { age: '25-34', female: 14, male: 5 },
        { age: '35-44', female: 28, male: 9 },
        { age: '45-54', female: 22, male: 7 },
        { age: '55-64', female: 11, male: 3 },
        { age: '65+', female: 4, male: 2 }
      ],
      gender_split: { female: 79, male: 21 }
    },
    // Social Listening & Monitoramento
    listening: {
      monitored_terms: ['Dr. Alberto Brasil', 'varizes Poços de Caldas', 'laser vascular', 'cirurgião vascular', 'escleroterapia laser'],
      sentiment: { positive: 74, neutral: 22, negative: 4 },
      sentiment_volume: 48,
      trending_topics: [
        { term: 'Laser Transdérmico', count: 24, sentiment: 'positive' },
        { term: 'Tratamento de Varizes', count: 19, sentiment: 'positive' },
        { term: 'Consultório Unique', count: 12, sentiment: 'neutral' },
        { term: 'Preço da Consulta', count: 8, sentiment: 'neutral' },
        { term: 'Tempo de Espera', count: 2, sentiment: 'negative' }
      ],
      mentions: [
        {
          id: 'men-1',
          author: 'Mariana Silveira',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=120&auto=format&fit=crop',
          channel: 'Instagram Mention',
          content: 'Fiz a primeira sessão de laser com o @dralbertobr e o resultado já foi incrível! O consultório no Unique é impecável.',
          sentiment: 'positive',
          date: 'Ontem às 15:40',
          reach: 1240,
          status: 'resolved'
        },
        {
          id: 'men-2',
          author: 'Carlos Eduardo Nogueira',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop',
          channel: 'Google Reviews',
          content: 'Excelente profissional. Muito transparente na explicação sobre trombose e cuidados no pós-operatório.',
          sentiment: 'positive',
          date: 'Há 3 dias',
          reach: 450,
          status: 'resolved'
        },
        {
          id: 'men-3',
          author: 'Luciana Ferreira',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop',
          channel: 'Facebook Post',
          content: 'Alguém sabe se o Dr. Alberto atende Unimed em Poços de Caldas?',
          sentiment: 'neutral',
          date: 'Há 5 dias',
          reach: 180,
          status: 'pending'
        }
      ]
    },
    // SAC 2.0 / Omni-Channel Inbox
    sac_tickets: [
      {
        id: 'sac-101',
        author: 'Fernanda Martins',
        channel: 'Instagram Direct',
        snippet: 'Olá Dr.! Gostaria de saber quanto custa a sessão de laser para vasinhos nas pernas...',
        date: 'Hoje às 11:20',
        sentiment: 'neutral',
        urgency: 'high',
        status: 'open',
        history: [
          { sender: 'user', text: 'Olá Dr.! Gostaria de saber quanto custa a sessão de laser para vasinhos nas pernas e se precisa de repouso depois?' }
        ],
        suggested_ai_reply: 'Olá Fernanda! Tudo bem? O tratamento com Laser Transdérmico é altamente individualizado, pois varia conforme o calibre dos vasinhos e a extensão da área a ser tratada. Uma das grandes vantagens é que você não precisa de repouso e pode voltar às suas atividades normais no mesmo dia! Para avaliarmos o seu caso com precisão e apresentarmos o plano de tratamento, nossa equipe está pronta para te atender no WhatsApp: (35) 3721-3363. Posso te enviar o link direto para agendamento?'
      },
      {
        id: 'sac-102',
        author: 'Renata Castro',
        channel: 'Instagram Comment',
        snippet: 'Doutor, você atende convênio ou somente consulta particular em Poços?',
        date: 'Ontem às 18:45',
        sentiment: 'neutral',
        urgency: 'medium',
        status: 'open',
        history: [
          { sender: 'user', text: 'Doutor, você atende convênio ou somente consulta particular em Poços?' }
        ],
        suggested_ai_reply: 'Olá Renata! Os atendimentos no consultório são realizados de forma particular para garantir uma consulta aprofundada com ultrassom Doppler vascular e tempo dedicado ao seu caso. No entanto, fornecemos recibo detalhado para solicitação de reembolso no seu plano de saúde. Para verificar horários disponíveis, fale com nossa secretária pelo WhatsApp (35) 3721-3363!'
      },
      {
        id: 'sac-103',
        author: 'Sônia Maria',
        channel: 'Facebook Comment',
        snippet: 'Parabéns pela explicação no post sobre inchaço! Me ajudou muito a entender.',
        date: '16/08 às 09:12',
        sentiment: 'positive',
        urgency: 'low',
        status: 'closed',
        history: [
          { sender: 'user', text: 'Parabéns pela explicação no post sobre inchaço! Me ajudou muito a entender.' },
          { sender: 'agent', text: 'Ficamos muito felizes em ajudar, dona Sônia! Cuidar da saúde vascular e levar informação clara é o nosso propósito. Conte sempre conosco!' }
        ],
        suggested_ai_reply: 'Muito obrigado pelas palavras, Sônia! Fico muito contente em saber que as informações foram úteis. Conte comigo sempre que precisar.'
      }
    ],
    // Calendário de Publicações / Publisher - 36 Posts Trimestrais Reais
    scheduled_posts: [
      {
        id: 'dr-alb-1',
        post_id: 1,
        semana: 1,
        dia_semana: 'Segunda-feira',
        date: '2026-08-24T18:00:00Z',
        date_formatted: '24/08/2026 às 18:00',
        channels: ['Instagram Feed', 'Facebook'],
        funnel_stage: 'CON',
        funnel_label: 'Consideração',
        strategic_pillar: 'O Olhar do Especialista',
        type: 'Carrossel',
        format_label: 'Carrossel Clínico',
        title: 'A veia nutridora invisível: Por que tratar apenas a superfície garante o retorno da queixa',
        hook_clinical_reasoning: 'A persistência de vasinhos não decorre de azar biológico, mas da ausência de neutralização da veia nutridora oculta milímetros abaixo da derme.',
        cta: 'Agende sua avaliação com mapeamento hemodinâmico por Doppler colorido.',
        compliance: 'Dr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412. Informativo de caráter estritamente educativo e preventivo, em conformidade com a Resolução CFM 2.336/2023. Sem promessas de cura.',
        caption: 'A persistência de vasinhos não decorre de azar biológico, mas da ausência de neutralização da veia nutridora oculta milímetros abaixo da derme.\n\nQuando tratamos apenas os vasinhos visíveis na superfície da pele sem mapear e secar a fonte nutridora que os alimenta, o refluxo sanguíneo persiste e novos vasinhos voltam a surgir no mesmo local.\n\nCom o mapeamento hemodinâmico detalhado e a associação de Laser Transdérmico e CLaCS, tratamos tanto a raiz nutridora quanto os ramos visíveis, com maior durabilidade e segurança.\n\n📲 Agende sua avaliação com mapeamento hemodinâmico por Doppler colorido através do link na bio.\n\n---\nDr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412\n#CirurgiaVascular #LaserTransdermico #DopplerColorido #PocosDeCaldas #SaudeVascular #DrAlbertoBrasil',
        image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=600&auto=format&fit=crop',
        status: 'Aprovado pelo Cliente'
      },
      {
        id: 'dr-alb-2',
        post_id: 2,
        semana: 1,
        dia_semana: 'Quarta-feira',
        date: '2026-08-26T18:00:00Z',
        date_formatted: '26/08/2026 às 18:00',
        channels: ['Instagram Feed'],
        funnel_stage: 'ATR',
        funnel_label: 'Atração',
        strategic_pillar: 'Sinais Silenciosos & Fisiopatologia',
        type: 'Imagem Única',
        format_label: 'Alerta Clínico',
        title: 'Vasinhos que ardem após o treino: O sinal de sobrecarga circulatória',
        hook_clinical_reasoning: 'A falha nas válvulas venosas retém metabólitos durante o esforço físico, gerando sensação de queimação que muitos confundem com fadiga muscular.',
        cta: 'Salve este post para consultar no seu próximo treino.',
        compliance: 'Dr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412. Informativo de caráter estritamente educativo e preventivo, em conformidade com a Resolução CFM 2.336/2023. Sem promessas de cura.',
        caption: 'Você sente queimação ou ardência nas pernas logo após o treino de membros inferiores ou corrida?\n\nMuitas vezes esse sintoma é confundido com fadiga muscular ou acúmulo de ácido lático, mas pode ser um alerta precoce de sobrecarga no sistema venoso superficial.\n\nDurante o esforço físico, o volume de sangue nas pernas aumenta exponencialmente. Se as válvulas venosas apresentam refluxo, o sangue desoxigenado fica retido, causando irritação e sensação térmica de ardência.\n\n📌 Salve este post para consultar no seu próximo treino e compartilhe com seu parceiro de academia.\n\n---\nDr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412\n#SaudeVascular #TreinoSemDor #Varizes #Circulacao #PocosDeCaldas',
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop',
        status: 'Aprovado pelo Cliente'
      },
      {
        id: 'dr-alb-3',
        post_id: 3,
        semana: 1,
        dia_semana: 'Sexta-feira',
        date: '2026-08-28T18:00:00Z',
        date_formatted: '28/08/2026 às 18:00',
        channels: ['Instagram Reels', 'TikTok'],
        funnel_stage: 'CVR',
        funnel_label: 'Conversão',
        strategic_pillar: 'Vanguarda Tecnológica',
        type: 'Vídeo / Reels',
        format_label: 'Vídeo Clínico',
        title: 'O ecodoppler em tempo real: Nossa bússola de navegação vascular',
        hook_clinical_reasoning: 'Tratar disfunções venosas sem imagem em tempo real equivale a operar às cegas. O ultrassom entrega a precisão milimétrica que o procedimento exige.',
        cta: 'Conheça o protocolo de precisão diagnóstica.',
        compliance: 'Dr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412. Informativo de caráter estritamente educativo e preventivo, em conformidade com a Resolução CFM 2.336/2023. Sem promessas de cura.',
        caption: 'Tratar disfunções venosas sem imagem em tempo real equivale a operar às cegas. No nosso consultório, o Ecodoppler Vascular de alta definição é utilizado em todas as etapas.\n\nEle funciona como uma bússola de navegação milimétrica, mostrando a direção do fluxo, a integridade das válvulas e a profundidade exata da veia antes de qualquer disparo a laser.\n\n✨ Conheça nosso protocolo de precisão diagnóstica e agende sua consulta.\n\n---\nDr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412\n#Ecodoppler #CirurgiaVascular #TecnologiaMedica #LaserVascular #PocosDeCaldas',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=600&auto=format&fit=crop',
        status: 'Aprovado pelo Cliente'
      },
      {
        id: 'dr-alb-4',
        post_id: 4,
        semana: 2,
        dia_semana: 'Segunda-feira',
        date: '2026-08-31T18:00:00Z',
        date_formatted: '31/08/2026 às 18:00',
        channels: ['Instagram Feed', 'Facebook'],
        funnel_stage: 'CON',
        funnel_label: 'Consideração',
        strategic_pillar: 'O Olhar do Especialista',
        type: 'Carrossel',
        format_label: 'Carrossel Diferencial',
        title: 'Lipedema não é falta de disciplina: O diagnóstico que interrompe dietas frustradas',
        hook_clinical_reasoning: 'O acúmulo desproporcional de gordura dolorosa com preservação dos pés é uma doença genética inflamatória, não um fracasso comportamental.',
        cta: 'Compartilhe com quem precisa desse esclarecimento clínico.',
        compliance: 'Dr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412. Informativo de caráter estritamente educativo e preventivo, em conformidade com a Resolução CFM 2.336/2023. Sem promessas de cura.',
        caption: 'O acúmulo desproporcional de gordura dolorosa com preservação dos pés é uma doença genética e inflamatória crônica, não um fracasso comportamental.\n\nMilhares de mulheres passam anos em dietas restritivas e treinos exaustivos sem emagrecer as pernas, convivendo com hematomas frequentes e dor ao toque. Esse quadro tem nome: Lipedema.\n\nO diagnóstico clínico precoce permite adotar protocolos anti-inflamatórios, terapias compressivas e acompanhamento vascular especializado.\n\n📢 Compartilhe com quem precisa desse esclarecimento clínico libertador.\n\n---\nDr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412\n#Lipedema #SaudeDaMulher #LipedemaBrasil #DiagnosticoCorreto #CirurgiaVascular',
        image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=600&auto=format&fit=crop',
        status: 'Aprovado pelo Cliente'
      },
      {
        id: 'dr-alb-5',
        post_id: 5,
        semana: 2,
        dia_semana: 'Quarta-feira',
        date: '2026-09-02T18:00:00Z',
        date_formatted: '02/09/2026 às 18:00',
        channels: ['Instagram Feed'],
        funnel_stage: 'ATR',
        funnel_label: 'Atração',
        strategic_pillar: 'Sinais Silenciosos & Fisiopatologia',
        type: 'Imagem Única',
        format_label: 'Alerta Clínico',
        title: 'Erro comum: A ilusão dos cremes e géis para varizes',
        hook_clinical_reasoning: 'Produtos tópicos criam alívio térmico superficial passageiro, mas são incapazes de restaurar a falha mecânica nas válvulas venosas profundas.',
        cta: 'Priorize a investigação da causa hemodinâmica.',
        compliance: 'Dr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412. Informativo de caráter estritamente educativo e preventivo, em conformidade com a Resolução CFM 2.336/2023. Sem promessas de cura.',
        caption: 'Géis mentolados e cremes para pernas cansadas proporcionam frescor passageiro, mas não tratam varizes.\n\nA insuficiência venosa é um problema mecânico de refluxo valvar milímetros abaixo da pele. Nenhuma substância tópica consegue reconstruir uma válvula venosa doente.\n\nNão adie o tratamento definitivo mascarando os sintomas com produtos cosméticos.\n\n🩺 Priorize a investigação da causa hemodinâmica no consultório vascular.\n\n---\nDr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412\n#MitosDaSaude #VarizesTratamento #LaserVascular #PocosDeCaldas',
        image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=600&auto=format&fit=crop',
        status: 'Aprovado pelo Cliente'
      },
      {
        id: 'dr-alb-6',
        post_id: 6,
        semana: 2,
        dia_semana: 'Sexta-feira',
        date: '2026-09-04T18:00:00Z',
        date_formatted: '04/09/2026 às 18:00',
        channels: ['Instagram Feed', 'Facebook'],
        funnel_stage: 'CVR',
        funnel_label: 'Conversão',
        strategic_pillar: 'Vanguarda Tecnológica',
        type: 'Carrossel',
        format_label: 'Carrossel Técnico',
        title: 'Endolaser versus Safenectomia tradicional: Por que cortes se tornaram desnecessários',
        hook_clinical_reasoning: 'A termoablação por fibra óptica fecha a veia doente por dentro com anestesia local, eliminando a internação hospitalar e o repouso na cama.',
        cta: 'Descubra se o seu caso é elegível ao tratamento com Endolaser.',
        compliance: 'Dr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412. Informativo de caráter estritamente educativo e preventivo, em conformidade com a Resolução CFM 2.336/2023. Sem promessas de cura.',
        caption: 'A cirurgia convencional de varizes com múltiplos cortes e semanas de repouso absoluto pertence ao passado.\n\nCom o Endolaser (termoablação por fibra óptica guiada por ultrassom), fechamos a veia safena doente por dentro através de uma punção milimétrica, sob anestesia local e sem necessidade de internação.\n\nO paciente sai caminhando no mesmo dia e retoma suas atividades normais com mínimo desconforto.\n\n💡 Descubra se o seu caso é elegível ao tratamento com Endolaser agendando sua avaliação.\n\n---\nDr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412\n#Endolaser #Safenectomia #SemCortes #CirurgiaVascularModerna #PocosDeCaldas',
        image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=600&auto=format&fit=crop',
        status: 'Aprovado pelo Cliente'
      },
      {
        id: 'dr-alb-7',
        post_id: 7,
        semana: 3,
        dia_semana: 'Segunda-feira',
        date: '2026-09-07T18:00:00Z',
        date_formatted: '07/09/2026 às 18:00',
        channels: ['Instagram Feed'],
        funnel_stage: 'CON',
        funnel_label: 'Consideração',
        strategic_pillar: 'O Olhar do Especialista',
        type: 'Carrossel',
        format_label: 'Carrossel Clínico',
        title: 'Varizes na perna esquerda: Quando a causa está na região abdominal',
        hook_clinical_reasoning: 'A Síndrome de May-Thurner comprime a veia ilíaca esquerda contra a coluna vertebral, gerando refluxo unilateral persistente que não melhora com tratamentos locais.',
        cta: 'Agende uma investigação vascular completa e estruturada.',
        compliance: 'Dr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412. Informativo de caráter estritamente educativo e preventivo, em conformidade com a Resolução CFM 2.336/2023. Sem promessas de cura.',
        caption: 'Você tem varizes proeminentes ou inchaço recorrente apenas na perna esquerda?\n\nA Síndrome de May-Thurner ocorre quando a artéria ilíaca direita comprime a veia ilíaca esquerda contra a coluna vertebral na região pélvica. Isso gera sobrecarga de pressão retrógrada em todo o membro inferior esquerdo.\n\nTratar apenas as veias da perna sem desobstruir a compressão ilíaca gera recidiva precoce. Por isso a visão vascular precisa ser global.\n\n🩺 Agende uma investigação vascular completa e estruturada no consultório.\n\n---\nDr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412\n#MayThurner #VarizesPernaEsquerda #DiagnosticoAvancado #CirurgiaVascular',
        image: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?q=80&w=600&auto=format&fit=crop',
        status: 'Em Revisão Interna'
      },
      {
        id: 'dr-alb-8',
        post_id: 8,
        semana: 3,
        dia_semana: 'Quarta-feira',
        date: '2026-09-09T18:00:00Z',
        date_formatted: '09/09/2026 às 18:00',
        channels: ['Instagram Feed', 'Facebook'],
        funnel_stage: 'ATR',
        funnel_label: 'Atração',
        strategic_pillar: 'Sinais Silenciosos & Fisiopatologia',
        type: 'Imagem Única',
        format_label: 'Alerta Clínico',
        title: 'Assimetria no inchaço dos tornozelos: Um alerta para o sistema venoso',
        hook_clinical_reasoning: 'Quando apenas um membro incha de forma súbita ou recorrente, a hipótese clínica migra de cansaço postural para eventos de oclusão ou estase localizada.',
        cta: 'Diante de assimetria nos membros, busque avaliação médica imediata.',
        compliance: 'Dr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412. Informativo de caráter estritamente educativo e preventivo, em conformidade com a Resolução CFM 2.336/2023. Sem promessas de cura.',
        caption: 'Inchaço nos dois pés ao fim do dia após muito tempo em pé pode ser cansaço habitual. Mas inchaço em apenas um dos tornozelos exige investigação rigorosa.\n\nA assimetria é um sinal clássico de obstrução localizada, trombose venosa profunda incipiente ou insuficiência valvar severa em um dos eixos.\n\n⚠️ Diante de assimetria nos membros inferiores, busque avaliação médica vascular sem hesitar.\n\n---\nDr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412\n#AlertaMedico #Trombose #InchaçoNasPernas #PrevencaoVascular #PocosDeCaldas',
        image: 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?q=80&w=600&auto=format&fit=crop',
        status: 'Em Revisão Interna'
      },
      {
        id: 'dr-alb-9',
        post_id: 9,
        semana: 3,
        dia_semana: 'Sexta-feira',
        date: '2026-09-11T18:00:00Z',
        date_formatted: '11/09/2026 às 18:00',
        channels: ['Instagram Reels', 'TikTok'],
        funnel_stage: 'CVR',
        funnel_label: 'Conversão',
        strategic_pillar: 'Vanguarda Tecnológica',
        type: 'Vídeo / Reels',
        format_label: 'Vídeo Tecnológico',
        title: 'A física do CLaCS e resfriamento cutâneo a 20 graus negativos',
        hook_clinical_reasoning: 'A sinergia entre laser transdérmico, escleroterapia química e crioanalgesia permite secar os vasos sem risco térmico à pele.',
        cta: 'Agende sua sessão de avaliação para tratamentos a laser.',
        compliance: 'Dr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412. Informativo de caráter estritamente educativo e preventivo, em conformidade com a Resolução CFM 2.336/2023. Sem promessas de cura.',
        caption: 'Como é possível aplicar energia laser e escleroterapia nos vasinhos sem dor excessiva e com máxima segurança dérmica?\n\nA técnica CLaCS alia disparos de laser transdérmico com injeção de glicose hipertônica sob resfriamento cutâneo a até -20°C por ar gelado contínuo (crioanalgesia).\n\nO frio adormece as terminações nervosas e protege a epiderme, permitindo tratar os vasos na raiz com conforto superior.\n\n❄️ Agende sua sessão de avaliação para tratamentos a laser no Unique.\n\n---\nDr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412\n#CLaCS #LaserTransdermico #Crioanalgesia #EsteticaVascular #PocosDeCaldas',
        image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=600&auto=format&fit=crop',
        status: 'Em Revisão Interna'
      },
      {
        id: 'dr-alb-10',
        post_id: 10,
        semana: 4,
        dia_semana: 'Segunda-feira',
        date: '2026-09-14T18:00:00Z',
        date_formatted: '14/09/2026 às 18:00',
        channels: ['Instagram Feed'],
        funnel_stage: 'CON',
        funnel_label: 'Consideração',
        strategic_pillar: 'O Olhar do Especialista',
        type: 'Imagem Única',
        format_label: 'Imagem Diagnóstica',
        title: 'O erro de avaliar pernas apenas pelo calibre visível das veias',
        hook_clinical_reasoning: 'Vasos calibrosos podem ser colaterais sadias que mantêm o fluxo, enquanto eixos profundos invisíveis a olho nu sustentam refluxos graves.',
        cta: 'Marque sua consulta para uma avaliação minuciosa.',
        compliance: 'Dr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412. Informativo de caráter estritamente educativo e preventivo, em conformidade com a Resolução CFM 2.336/2023. Sem promessas de cura.',
        caption: 'Pernas lisinhas podem esconder insuficiências venosas severas nos eixos profundos, enquanto veias aparentes podem ser rotas de drenagem sadias.\n\nA avaliação vascular moderna não se limita ao que os olhos enxergam na superfície. O exame clínico aliado ao Ecodoppler mapeia a velocidade e direção do fluxo com precisão anatômica.\n\n🩺 Marque sua consulta para uma avaliação minuciosa e individualizada.\n\n---\nDr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412\n#DiagnosticoVascular #Doppler #Varizes #SaudeIntegrativa #PocosDeCaldas',
        image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=600&auto=format&fit=crop',
        status: 'Aguardando Aprovação'
      },
      {
        id: 'dr-alb-11',
        post_id: 11,
        semana: 4,
        dia_semana: 'Quarta-feira',
        date: '2026-09-16T18:00:00Z',
        date_formatted: '16/09/2026 às 18:00',
        channels: ['Instagram Feed', 'Facebook'],
        funnel_stage: 'ATR',
        funnel_label: 'Atração',
        strategic_pillar: 'Sinais Silenciosos & Fisiopatologia',
        type: 'Carrossel',
        format_label: 'Carrossel Clínico',
        title: 'Varizes Pélvicas: A origem esquecida da dor crônica no baixo ventre',
        hook_clinical_reasoning: 'A dilatação das veias ovarianas e uterinas provoca peso e desconforto que pioram no ciclo menstrual e durante as relações íntimas.',
        cta: 'Investigue sintomas persistentes com um cirurgião vascular.',
        compliance: 'Dr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412. Informativo de caráter estritamente educativo e preventivo, em conformidade com a Resolução CFM 2.336/2023. Sem promessas de cura.',
        caption: 'Muitas mulheres convivem com dor pélvica crônica, sensação de peso no baixo ventre e desconforto íntimo que pioram no período pré-menstrual sem causa ginecológica aparente.\n\nA Síndrome de Congestão Pélvica decorre da dilatação das veias ovarianas e uterinas (varizes internas). O diagnóstico por imagem vascular e o tratamento por embolização minimamente invasiva transformam a qualidade de vida.\n\n🔍 Investigue sintomas persistentes com um cirurgião vascular.\n\n---\nDr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412\n#VarizesPelvicas #CongestaoPelvica #SaudeFeminina #CirurgiaVascular #PocosDeCaldas',
        image: 'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?q=80&w=600&auto=format&fit=crop',
        status: 'Aguardando Aprovação'
      },
      {
        id: 'dr-alb-12',
        post_id: 12,
        semana: 4,
        dia_semana: 'Sexta-feira',
        date: '2026-09-18T18:00:00Z',
        date_formatted: '18/09/2026 às 18:00',
        channels: ['Instagram Feed', 'Facebook'],
        funnel_stage: 'CVR',
        funnel_label: 'Conversão',
        strategic_pillar: 'Longevidade & Decisão Clínica',
        type: 'Carrossel',
        format_label: 'Carrossel Síntese',
        title: 'Checklist funcional: 5 sinais de que o retorno venoso atingiu o limite',
        hook_clinical_reasoning: 'Marcas profundas de meia, cãibras noturnas, sensação de peso ao deitar, queimação plantar e vasos agrupados indicam falha mecânica instalada.',
        cta: 'Se identificou dois ou mais sinais, agende sua consulta.',
        compliance: 'Dr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412. Informativo de caráter estritamente educativo e preventivo, em conformidade com a Resolução CFM 2.336/2023. Sem promessas de cura.',
        caption: 'Faça este teste rápido:\n1. Marcas fundas de elástico de meia no fim do dia?\n2. Cãibras noturnas na panturrilha que te acordam?\n3. Sensação de peso e alívio imediato ao elevar as pernas?\n4. Queimação na sola dos pés ao deitar?\n5. Agrupamento de vasinhos avermelhados ou arroxeados nos tornozelos?\n\nEsses sinais indicam que a bomba da panturrilha está sobrecarregada.\n\n📲 Se identificou dois ou mais sinais, agende sua consulta pelo link da bio.\n\n---\nDr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412\n#ChecklistSaude #CirculacaoSanguinea #Varizes #PernasLeves #PocosDeCaldas',
        image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=600&auto=format&fit=crop',
        status: 'Aguardando Aprovação'
      },
      {
        id: 'dr-alb-13',
        post_id: 13,
        semana: 5,
        dia_semana: 'Segunda-feira',
        date: '2026-09-21T18:00:00Z',
        date_formatted: '21/09/2026 às 18:00',
        channels: ['Instagram Feed'],
        funnel_stage: 'ATR',
        funnel_label: 'Atração',
        strategic_pillar: 'O Olhar do Especialista',
        type: 'Imagem Única',
        format_label: 'Imagem Educativa',
        title: 'O paradoxo do repouso: Por que as pernas pesam mais ao sentar do que em movimento',
        hook_clinical_reasoning: 'Ao interromper a caminhada, a bomba da panturrilha para de drenar o sangue. Sob refluxo valvar, a pressão hidrostática se acumula de forma aguda.',
        cta: 'Priorize a restauração da eficiência da sua bomba muscular venosa.',
        compliance: 'Dr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412. Informativo de caráter estritamente educativo e preventivo, em conformidade com a Resolução CFM 2.336/2023. Sem promessas de cura.',
        caption: 'Ao parar de caminhar e sentar no sofá, a panturrilha deixa de bombear o sangue de volta ao coração. Se há insuficiência valvar, a pressão hidrostática sobe rapidamente, gerando aquela sensação de peso intenso.\n\nCaminhar ativa o coração periférico. Tratar as veias insuficientes restaura o fluxo contínuo.\n\n🩺 Priorize a restauração da eficiência da sua bomba muscular venosa.\n\n---\nDr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412\n#Panturrilha #CoracaoPeriferico #SaudeVascular #PocosDeCaldas',
        image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=600&auto=format&fit=crop',
        status: 'Em Produção'
      },
      {
        id: 'dr-alb-14',
        post_id: 14,
        semana: 5,
        dia_semana: 'Quarta-feira',
        date: '2026-09-23T18:00:00Z',
        date_formatted: '23/09/2026 às 18:00',
        channels: ['Instagram Reels'],
        funnel_stage: 'ATR',
        funnel_label: 'Atração',
        strategic_pillar: 'Sinais Silenciosos & Fisiopatologia',
        type: 'Vídeo / Reels',
        format_label: 'Vídeo Informativo',
        title: 'Pernas pesadas no período pré-menstrual: O papel da progesterona',
        hook_clinical_reasoning: 'A elevação hormonal promove relaxamento nas paredes venosas e aumenta a retenção fluida, intensificando a sobrecarga circulatória.',
        cta: 'Comente se você nota essa piora nos dias anteriores ao seu ciclo.',
        compliance: 'Dr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412. Informativo de caráter estritamente educativo e preventivo, em conformidade com a Resolução CFM 2.336/2023. Sem promessas de cura.',
        caption: 'A progesterona promove vasodilatação e retenção hídrica fisiológica antes do ciclo. Em mulheres com predisposição a varizes, isso multiplica a sobrecarga nas pernas.\n\nEntender o ciclo biológico é o primeiro passo para o manejo preventivo eficaz.\n\n💬 Comente se você nota essa piora nos dias anteriores ao seu ciclo.\n\n---\nDr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412\n#Hormonios #TPM #SaudeFeminina #CirurgiaVascular #PocosDeCaldas',
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop',
        status: 'Em Produção'
      },
      {
        id: 'dr-alb-15',
        post_id: 15,
        semana: 5,
        dia_semana: 'Sexta-feira',
        date: '2026-09-25T18:00:00Z',
        date_formatted: '25/09/2026 às 18:00',
        channels: ['Instagram Feed', 'Facebook'],
        funnel_stage: 'CVR',
        funnel_label: 'Conversão',
        strategic_pillar: 'Vanguarda Tecnológica',
        type: 'Carrossel',
        format_label: 'Carrossel Clínico',
        title: 'Tratamentos ambulatoriais: Como tratar veias doentes sem internação hospitalar',
        hook_clinical_reasoning: 'Métodos modernos substituem o ambiente hospitalar pesado pelo conforto do consultório, permitindo retorno imediato às atividades.',
        cta: 'Saiba como recuperar a saúde e a leveza das suas pernas.',
        compliance: 'Dr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412. Informativo de caráter estritamente educativo e preventivo, em conformidade com a Resolução CFM 2.336/2023. Sem promessas de cura.',
        caption: 'Hoje em dia, a grande maioria dos tratamentos venosos é realizada em ambiente de clínica/consultório com máxima biossegurança, conforto e anestesia local.\n\nSem pernoite em hospital, sem cortes traumáticos e sem pausas prolongadas na sua rotina de trabalho.\n\n✨ Saiba como recuperar a leveza das suas pernas agendando sua consulta no Edifício Unique.\n\n---\nDr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412\n#TratamentoAmbulatorial #ConsultorioUnique #CirurgiaVascular #LaserTransdermico',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=600&auto=format&fit=crop',
        status: 'Em Produção'
      },
      {
        id: 'dr-alb-16',
        post_id: 16,
        semana: 6,
        dia_semana: 'Segunda-feira',
        date: '2026-09-28T18:00:00Z',
        date_formatted: '28/09/2026 às 18:00',
        channels: ['Instagram Feed'],
        funnel_stage: 'CON',
        funnel_label: 'Consideração',
        strategic_pillar: 'O Olhar do Especialista',
        type: 'Imagem Única',
        format_label: 'Imagem Alerta',
        title: 'Trombofilia e perdas gestacionais de repetição: A investigação necessária',
        hook_clinical_reasoning: 'Microtrombos na circulação placentária provocados por distúrbios de coagulação exigem profilaxia anticoagulante planejada com rigor técnico.',
        cta: 'Agende sua triagem vascular com um cirurgião especializado.',
        compliance: 'Dr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412. Informativo de caráter estritamente educativo e preventivo, em conformidade com a Resolução CFM 2.336/2023. Sem promessas de cura.',
        caption: 'Distúrbios de hipercoagulabilidade (trombofilias hereditárias ou adquiridas) podem formar microcoágulos na vascularização da placenta, comprometendo a gestação.\n\nA triagem hematológica e vascular criteriosa permite instituir a profilaxia correta com heparina de baixo peso molecular, viabilizando uma gestação segura e plena.\n\n🤰 Agende sua triagem vascular com um cirurgião especializado.\n\n---\nDr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412\n#Trombofilia #GestacaoSegura #SaudeMaterna #CirurgiaVascular #PocosDeCaldas',
        image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=600&auto=format&fit=crop',
        status: 'Pauta Estruturada'
      },
      {
        id: 'dr-alb-17',
        post_id: 17,
        semana: 6,
        dia_semana: 'Quarta-feira',
        date: '2026-09-30T18:00:00Z',
        date_formatted: '30/09/2026 às 18:00',
        channels: ['Instagram Feed', 'Facebook'],
        funnel_stage: 'ATR',
        funnel_label: 'Atração',
        strategic_pillar: 'Sinais Silenciosos & Fisiopatologia',
        type: 'Carrossel',
        format_label: 'Carrossel de Alerta',
        title: 'Meia de compressão sem receita: O risco de transformar alívio em torniquete',
        hook_clinical_reasoning: 'Tamanhos ou graduações incorretas geram garroteamento, agravam o refluxo e podem induzir isquemia em quem apresenta obstruções arteriais.',
        cta: 'Utilize exclusivamente compressão médica sob medida e prescrição.',
        compliance: 'Dr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412. Informativo de caráter estritamente educativo e preventivo, em conformidade com a Resolução CFM 2.336/2023. Sem promessas de cura.',
        caption: 'Comprar meias de compressão em farmácias sem medir circunferências de tornozelo, panturrilha e coxa é um risco sério.\n\nA compressão inadequada pode garrotear a perna, piorar o inchaço e, em pacientes com doença arterial assintomática, provocar isquemia tecidual grave.\n\n📏 Utilize exclusivamente compressão médica com prescrição e medidas exatas.\n\n---\nDr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412\n#MeiasDeCompressao #UsoCorreto #SegurancaDoPaciente #CirurgiaVascular',
        image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=600&auto=format&fit=crop',
        status: 'Pauta Estruturada'
      },
      {
        id: 'dr-alb-18',
        post_id: 18,
        semana: 6,
        dia_semana: 'Sexta-feira',
        date: '2026-10-02T18:00:00Z',
        date_formatted: '02/10/2026 às 18:00',
        channels: ['Instagram Feed', 'Facebook'],
        funnel_stage: 'CON',
        funnel_label: 'Consideração',
        strategic_pillar: 'O Olhar do Especialista',
        type: 'Carrossel',
        format_label: 'Carrossel Comparativo',
        title: 'Linfedema versus Lipedema: O detalhe anatômico no dorso dos pés',
        hook_clinical_reasoning: 'Enquanto o linfedema envolve pés e dedos pelo acúmulo de linfa, o lipedema preserva os pés e forma o sinal de Cuff acima do tornozelo.',
        cta: 'Agende sua consulta para um diagnóstico diferencial preciso.',
        compliance: 'Dr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412. Informativo de caráter estritamente educativo e preventivo, em conformidade com a Resolução CFM 2.336/2023. Sem promessas de cura.',
        caption: 'Como diferenciar Linfedema de Lipedema no exame físico?\n\nNo Linfedema, o dorso dos pés e dedos incham (Sinal de Stemmer positivo). No Lipedema, o depósito adiposo para abruptamente no tornozelo (Sinal de Cuff), poupando completamente os pés.\n\nTratamentos corretos começam com diagnóstico anatômico preciso.\n\n🩺 Agende sua consulta para um diagnóstico diferencial minucioso.\n\n---\nDr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412\n#Linfedema #Lipedema #DiagnosticoDiferencial #CirurgiaVascular #PocosDeCaldas',
        image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=600&auto=format&fit=crop',
        status: 'Pauta Estruturada'
      },
      {
        id: 'dr-alb-19',
        post_id: 19,
        semana: 7,
        dia_semana: 'Segunda-feira',
        date: '2026-10-05T18:00:00Z',
        date_formatted: '05/10/2026 às 18:00',
        channels: ['Instagram Feed'],
        funnel_stage: 'CON',
        funnel_label: 'Consideração',
        strategic_pillar: 'O Olhar do Especialista',
        type: 'Carrossel',
        format_label: 'Carrossel de Acompanhamento',
        title: 'A cicatriz venosa pós-trombose: Por que a alta do remédio não encerra o cuidado',
        hook_clinical_reasoning: 'A recanalização do coágulo danifica as válvulas internas, abrindo caminho para a Síndrome Pós-Trombótica se não houver vigilância por Doppler.',
        cta: 'Mapeie a saúde residual das suas veias.',
        compliance: 'Dr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412. Informativo de caráter estritamente educativo e preventivo, em conformidade com a Resolução CFM 2.336/2023. Sem promessas de cura.',
        caption: 'Terminar o tempo prescrito de anticoagulante não significa que a veia voltou a ser 100% como antes. A cicatriz interna da trombose pode deixar refluxo valvar crônico.\n\nO acompanhamento com Ecodoppler pós-tratamento evita a temida Síndrome Pós-Trombótica, caracterizada por dor, manchas e úlceras.\n\n🩺 Mapeie a saúde residual das suas veias com o especialista.\n\n---\nDr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412\n#PosTrombose #Ecodoppler #SaudeVascular #PocosDeCaldas',
        image: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?q=80&w=600&auto=format&fit=crop',
        status: 'Pauta Estruturada'
      },
      {
        id: 'dr-alb-20',
        post_id: 20,
        semana: 7,
        dia_semana: 'Quarta-feira',
        date: '2026-10-07T18:00:00Z',
        date_formatted: '07/10/2026 às 18:00',
        channels: ['Instagram Feed'],
        funnel_stage: 'ATR',
        funnel_label: 'Atração',
        strategic_pillar: 'Sinais Silenciosos & Fisiopatologia',
        type: 'Imagem Única',
        format_label: 'Alerta Clínico',
        title: 'Prurido de estase e dermatite ocre: A coceira que nasce na pressão venosa',
        hook_clinical_reasoning: 'O extravasamento crônico de hemácias nos tecidos libera hemossiderina, escurecendo a pele e gerando inflamações que precedem úlceras.',
        cta: 'Trate a raiz da sobrecarga venosa antes do surgimento de feridas.',
        compliance: 'Dr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412. Informativo de caráter estritamente educativo e preventivo, em conformidade com a Resolução CFM 2.336/2023. Sem promessas de cura.',
        caption: 'Pele escurecida e coceira constante perto do tornozelo não são alergias de pele simples. Trata-se de Dermatite Ocre causada pelo extravasamento de ferro (hemossiderina) das veias sobrecarregadas.\n\nSem tratamento vascular, a pele afina e pode evoluir para feridas de difícil cicatrização (úlceras venosas).\n\n⚠️ Trate a raiz da sobrecarga venosa antes do surgimento de feridas.\n\n---\nDr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412\n#DermatiteOcre #UlceraVenosa #Prevencao #SaudeDaPele #PocosDeCaldas',
        image: 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?q=80&w=600&auto=format&fit=crop',
        status: 'Pauta Estruturada'
      },
      {
        id: 'dr-alb-21',
        post_id: 21,
        semana: 7,
        dia_semana: 'Sexta-feira',
        date: '2026-10-09T18:00:00Z',
        date_formatted: '09/10/2026 às 18:00',
        channels: ['Instagram Feed', 'Facebook'],
        funnel_stage: 'CVR',
        funnel_label: 'Conversão',
        strategic_pillar: 'Vanguarda Tecnológica',
        type: 'Carrossel',
        format_label: 'Carrossel Técnico',
        title: 'Laser transdérmico seguro em peles morenas e negras: A calibração correta',
        hook_clinical_reasoning: 'Comprimentos de onda específicos associados a resfriamento intenso agem na hemoglobina do sangue sem agredir a melanina epidérmica.',
        cta: 'Agende sua avaliação personalizada e segura.',
        compliance: 'Dr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412. Informativo de caráter estritamente educativo e preventivo, em conformidade com a Resolução CFM 2.336/2023. Sem promessas de cura.',
        caption: 'Peles morenas e negras (fototipos IV a VI) exigem tecnologia Nd:YAG 1064nm de pulso longo com calibração precisa e resfriamento contínuo.\n\nIsso garante que a energia térmica atinja exclusivamente o pigmento vermelho do sangue no vaso, preservando a melanina e evitando manchas pós-inflamatórias.\n\n✨ Agende sua avaliação personalizada e segura para o seu fototipo.\n\n---\nDr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412\n#FototipoAlto #LaserSeguro #NdYAG #CirurgiaVascular #PocosDeCaldas',
        image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=600&auto=format&fit=crop',
        status: 'Pauta Estruturada'
      },
      {
        id: 'dr-alb-22',
        post_id: 22,
        semana: 8,
        dia_semana: 'Segunda-feira',
        date: '2026-10-12T18:00:00Z',
        date_formatted: '12/10/2026 às 18:00',
        channels: ['Instagram Feed'],
        funnel_stage: 'CON',
        funnel_label: 'Consideração',
        strategic_pillar: 'O Olhar do Especialista',
        type: 'Imagem Única',
        format_label: 'Imagem Técnica',
        title: 'Calibração técnica: Por que vasos faciais e das pernas exigem parâmetros opostos',
        hook_clinical_reasoning: 'Vasos da face trabalham sob alta pressão arterial e pele delgada, enquanto as pernas sofrem alta pressão hidrostática venosa e exigem fluências distintas.',
        cta: 'A precisão dos parâmetros clínicos garante a eficácia do tratamento.',
        compliance: 'Dr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412. Informativo de caráter estritamente educativo e preventivo, em conformidade com a Resolução CFM 2.336/2023. Sem promessas de cura.',
        caption: 'Vasinhos no nariz e bochechas (telangiectasias faciais) têm origem arterial e pele muito fina. Nas pernas, os vasos sofrem a força da gravidade e alta pressão venosa.\n\nAjustar a largura de pulso, fluência e resfriamento de acordo com a região anatômica é o que separa um resultado comum de uma transformação clínica de excelência.\n\n🩺 A precisão dos parâmetros clínicos garante a eficácia e segurança do seu procedimento.\n\n---\nDr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412\n#LaserFacial #VasosFaciais #CirurgiaVascular #PrecisaoMedica',
        image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=600&auto=format&fit=crop',
        status: 'Pauta Estruturada'
      },
      {
        id: 'dr-alb-23',
        post_id: 23,
        semana: 8,
        dia_semana: 'Quarta-feira',
        date: '2026-10-14T18:00:00Z',
        date_formatted: '14/10/2026 às 18:00',
        channels: ['Instagram Feed', 'Facebook'],
        funnel_stage: 'ATR',
        funnel_label: 'Atração',
        strategic_pillar: 'Sinais Silenciosos & Fisiopatologia',
        type: 'Carrossel',
        format_label: 'Carrossel Clínico',
        title: 'Manchas roxas espontâneas: Quando o hematoma não decorre de trauma',
        hook_clinical_reasoning: 'Fragilidade capilar, perda de sustentação de colágeno, medicamentos e alterações na cascata de coagulação exigem rastreamento laboratorial.',
        cta: 'Investigue sinais incomuns que surgem na sua pele.',
        compliance: 'Dr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412. Informativo de caráter estritamente educativo e preventivo, em conformidade com a Resolução CFM 2.336/2023. Sem promessas de cura.',
        caption: 'Acordar com manchas roxas nas pernas ou braços sem ter batido em nada pode indicar fragilidade capilar ou alterações na cascata de coagulação.\n\nInvestigar níveis de plaquetas, tempo de protrombina e integridade das paredes vasculares traz tranquilidade e prevenção.\n\n🔍 Investigue sinais incomuns que surgem na sua pele com o cirurgião vascular.\n\n---\nDr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412\n#Hematomas #FragilidadeCapilar #Coagulacao #CirurgiaVascular #PocosDeCaldas',
        image: 'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?q=80&w=600&auto=format&fit=crop',
        status: 'Pauta Estruturada'
      },
      {
        id: 'dr-alb-24',
        post_id: 24,
        semana: 8,
        dia_semana: 'Sexta-feira',
        date: '2026-10-16T18:00:00Z',
        date_formatted: '16/10/2026 às 18:00',
        channels: ['Instagram Reels', 'TikTok'],
        funnel_stage: 'CVR',
        funnel_label: 'Conversão',
        strategic_pillar: 'Longevidade & Decisão Clínica',
        type: 'Vídeo / Reels',
        format_label: 'Vídeo Alerta',
        title: 'A linha do tempo da insuficiência: De vasinhos leves ao endurecimento tecidual',
        hook_clinical_reasoning: 'A doença venosa é progressiva. Ignorar os primeiros sinais permite a evolução de telangiectasias para edema crônico e dermatofibrose.',
        cta: 'Não espere o quadro evoluir para buscar cuidado especializado.',
        compliance: 'Dr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412. Informativo de caráter estritamente educativo e preventivo, em conformidade com a Resolução CFM 2.336/2023. Sem promessas de cura.',
        caption: 'A classificação CEAP mostra a evolução: C1 (vasinhos finos) ➔ C2 (varizes tronculares) ➔ C3 (inchaço diário) ➔ C4 (manchas e endurecimento da pele) ➔ C6 (feridas abertas).\n\nTratar no início é rápido, indolor e preserva a estética e a saúde das suas pernas.\n\n⏳ Não espere o quadro evoluir. Agende sua avaliação no consultório.\n\n---\nDr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412\n#LinhaDoTempo #ClassificacaoCEAP #SaudeVascular #PocosDeCaldas',
        image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=600&auto=format&fit=crop',
        status: 'Pauta Estruturada'
      },
      {
        id: 'dr-alb-25',
        post_id: 25,
        semana: 9,
        dia_semana: 'Segunda-feira',
        date: '2026-10-19T18:00:00Z',
        date_formatted: '19/10/2026 às 18:00',
        channels: ['Instagram Reels'],
        funnel_stage: 'ATR',
        funnel_label: 'Atração',
        strategic_pillar: 'Sinais Silenciosos & Fisiopatologia',
        type: 'Vídeo / Reels',
        format_label: 'Vídeo Educativo',
        title: 'Cãibras noturnas frequentes: Quando a causa é estase venosa profunda',
        hook_clinical_reasoning: 'O acúmulo de sangue desoxigenado nas camadas profundas durante o dia irrita terminações nervosas na ausência de contração muscular noturna.',
        cta: 'Leve essa queixa para a sua avaliação vascular.',
        compliance: 'Dr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412. Informativo de caráter estritamente educativo e preventivo, em conformidade com a Resolução CFM 2.336/2023. Sem promessas de cura.',
        caption: 'Acordar de madrugada com contrações dolorosas na panturrilha nem sempre é falta de magnésio ou potássio.\n\nA estase venosa prolongada acumula toxinas e metabólitos celulares que hiperexcitam os fusos musculares durante o sono.\n\n🩺 Traga essa queixa para a sua próxima avaliação com ultrassom Doppler.\n\n---\nDr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412\n#Caibras #SonoTranquilo #Circulacao #DopplerVascular #PocosDeCaldas',
        image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=600&auto=format&fit=crop',
        status: 'Pauta Estruturada'
      },
      {
        id: 'dr-alb-26',
        post_id: 26,
        semana: 9,
        dia_semana: 'Quarta-feira',
        date: '2026-10-21T18:00:00Z',
        date_formatted: '21/10/2026 às 18:00',
        channels: ['Instagram Feed', 'Facebook'],
        funnel_stage: 'CON',
        funnel_label: 'Consideração',
        strategic_pillar: 'O Olhar do Especialista',
        type: 'Carrossel',
        format_label: 'Carrossel Clínico',
        title: 'Trombose muscular silenciosa: Como pequenos trombos se escondem na panturrilha',
        hook_clinical_reasoning: 'Coágulos em veias musculares podem causar apenas discreto peso e sensibilidade ao toque, passando despercebidos sem avaliação por Doppler.',
        cta: 'Conheça seus fatores de risco e priorize o diagnóstico seguro.',
        compliance: 'Dr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412. Informativo de caráter estritamente educativo e preventivo, em conformidade com a Resolução CFM 2.336/2023. Sem promessas de cura.',
        caption: 'Nem toda trombose causa inchaço gigantesco e dor insuportável. Tromboses nas veias gastrocnêmias e soleares (musculares) podem causar apenas dor leve semelhante a uma distensão de treino.\n\nSem o Ecodoppler, esse coágulo pode progredir para os eixos profundos principais.\n\n⚠️ Conheça seus fatores de risco e priorize o diagnóstico seguro e precoce.\n\n---\nDr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412\n#TromboseMuscular #Panturrilha #Ecodoppler #CirurgiaVascular #PocosDeCaldas',
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop',
        status: 'Pauta Estruturada'
      },
      {
        id: 'dr-alb-27',
        post_id: 27,
        semana: 9,
        dia_semana: 'Sexta-feira',
        date: '2026-10-23T18:00:00Z',
        date_formatted: '23/10/2026 às 18:00',
        channels: ['Instagram Feed'],
        funnel_stage: 'CVR',
        funnel_label: 'Conversão',
        strategic_pillar: 'Vanguarda Tecnológica',
        type: 'Carrossel',
        format_label: 'Carrossel Técnico',
        title: 'Ecoescleroterapia com microespuma densa para vasos de grande calibre',
        hook_clinical_reasoning: 'O direcionamento ultrassonográfico permite preencher e fechar trajetos venosos tortuosos e complexos em ambiente ambulatorial.',
        cta: 'Saiba se a espuma ecoguiada é a conduta indicada para o seu quadro.',
        compliance: 'Dr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412. Informativo de caráter estritamente educativo e preventivo, em conformidade com a Resolução CFM 2.336/2023. Sem promessas de cura.',
        caption: 'A Ecoescleroterapia com Espuma Densa é uma alternativa fantástica para o fechamento de varizes volumosas e tratamento de úlceras venosas crônicas sem internação.\n\nGuiados pelo ultrassom em tempo real, injetamos a microespuma que desloca o sangue e fecha quimicamente a parede doente.\n\n💡 Saiba se a espuma ecoguiada é a conduta indicada para o seu quadro clínico.\n\n---\nDr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412\n#EspumaDensa #Ecoescleroterapia #TratamentoModerno #SemCirurgia #PocosDeCaldas',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=600&auto=format&fit=crop',
        status: 'Pauta Estruturada'
      },
      {
        id: 'dr-alb-28',
        post_id: 28,
        semana: 10,
        dia_semana: 'Segunda-feira',
        date: '2026-10-26T18:00:00Z',
        date_formatted: '26/10/2026 às 18:00',
        channels: ['Instagram Feed'],
        funnel_stage: 'CON',
        funnel_label: 'Consideração',
        strategic_pillar: 'O Olhar do Especialista',
        type: 'Imagem Única',
        format_label: 'Imagem Científica',
        title: 'Preservação da safena sadia: Por que veias funcionais nunca devem ser removidas',
        hook_clinical_reasoning: 'A safena sem refluxo é patrimônio biológico valioso para pontes coronárias futuras. A indicação de ablação deve ser estritamente criteriosa.',
        cta: 'A conduta médica ponderada protege o seu patrimônio biológico.',
        compliance: 'Dr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412. Informativo de caráter estritamente educativo e preventivo, em conformidade com a Resolução CFM 2.336/2023. Sem promessas de cura.',
        caption: 'A veia safena só deve ser tratada ou termoablada se tiver refluxo comprovado e causar repercussão clínica. Safena competente e sadia é um enxerto biológico nobre para eventuais cirurgias cardíacas futuras.\n\nTratar com parcimônia e precisão é a marca da medicina ética e científica.\n\n🩺 A conduta médica ponderada protege o seu patrimônio biológico.\n\n---\nDr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412\n#Safena #PreservacaoVascular #MedicinaEtica #CirurgiaVascular #PocosDeCaldas',
        image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=600&auto=format&fit=crop',
        status: 'Pauta Estruturada'
      },
      {
        id: 'dr-alb-29',
        post_id: 29,
        semana: 10,
        dia_semana: 'Quarta-feira',
        date: '2026-10-28T18:00:00Z',
        date_formatted: '28/10/2026 às 18:00',
        channels: ['Instagram Reels', 'TikTok'],
        funnel_stage: 'ATR',
        funnel_label: 'Atração',
        strategic_pillar: 'Sinais Silenciosos & Fisiopatologia',
        type: 'Vídeo / Reels',
        format_label: 'Vídeo Prático',
        title: 'Viagens longas e a síndrome do viajante: O protocolo de proteção circulatória',
        hook_clinical_reasoning: 'Cabines pressurizadas e mais de 4 horas de imobilidade reduzem a velocidade do fluxo sanguíneo nas pernas a níveis críticos.',
        cta: 'Salve estas orientações clínicas antes do seu próximo embarque.',
        compliance: 'Dr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412. Informativo de caráter estritamente educativo e preventivo, em conformidade com a Resolução CFM 2.336/2023. Sem promessas de cura.',
        caption: 'Vai fazer uma viagem de avião ou carro com mais de 4 horas de duração? A estase venosa multiplica o risco de trombose (Síndrome da Classe Econômica).\n\nProtocolo de proteção:\n1. Meia de compressão prescrita.\n2. Hidratação abundante (evite álcool excessivo a bordo).\n3. Movimentação dos pés a cada hora.\n\n✈️ Salve estas orientações clínicas antes do seu próximo embarque!\n\n---\nDr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412\n#ViagemSegura #SindromeDoViajante #TromboseEmVoo #Prevencao',
        image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=600&auto=format&fit=crop',
        status: 'Pauta Estruturada'
      },
      {
        id: 'dr-alb-30',
        post_id: 30,
        semana: 10,
        dia_semana: 'Sexta-feira',
        date: '2026-10-30T18:00:00Z',
        date_formatted: '30/10/2026 às 18:00',
        channels: ['Instagram Feed', 'Facebook'],
        funnel_stage: 'CON',
        funnel_label: 'Consideração',
        strategic_pillar: 'O Olhar do Especialista',
        type: 'Carrossel',
        format_label: 'Carrossel Clínico',
        title: 'Anticoagulantes modernos e diretrizes científicas da SBACV e ESVS',
        hook_clinical_reasoning: 'O uso de anticoagulantes orais de ação direta requer cálculo de risco trombótico e hemorrágico. A automedicação impõe riscos graves.',
        cta: 'Decisões farmacológicas exigem acompanhamento médico contínuo.',
        compliance: 'Dr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412. Informativo de caráter estritamente educativo e preventivo, em conformidade com a Resolução CFM 2.336/2023. Sem promessas de cura.',
        caption: 'Os DOACs (anticoagulantes orais de ação direta) trouxeram imensa comodidade sem necessidade de exames de sangue frequentes como a varfarina. No entanto, o ajuste de dose exige cálculo de função renal e perfil de risco.\n\nNunca inicie, altere a dose ou interrompa esses medicamentos por conta própria.\n\n💊 Decisões farmacológicas exigem acompanhamento médico contínuo.\n\n---\nDr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412\n#Anticoagulantes #DiretrizesSBACV #SegurancaMedicamentosa #CirurgiaVascular',
        image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=600&auto=format&fit=crop',
        status: 'Pauta Estruturada'
      },
      {
        id: 'dr-alb-31',
        post_id: 31,
        semana: 11,
        dia_semana: 'Segunda-feira',
        date: '2026-11-02T18:00:00Z',
        date_formatted: '02/11/2026 às 18:00',
        channels: ['Instagram Feed'],
        funnel_stage: 'CON',
        funnel_label: 'Consideração',
        strategic_pillar: 'O Olhar do Especialista',
        type: 'Imagem Única',
        format_label: 'Imagem Reflexão',
        title: 'A microcirculação periférica como espelho da saúde de todo o organismo',
        hook_clinical_reasoning: 'Capilares dérmicos refletem diretamente o impacto da glicemia, estresse oxidativo, tabagismo e inflamação endotelial sistêmica.',
        cta: 'Priorize a integridade da sua microcirculação com acompanhamento preventivo.',
        compliance: 'Dr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412. Informativo de caráter estritamente educativo e preventivo, em conformidade com a Resolução CFM 2.336/2023. Sem promessas de cura.',
        caption: 'Seus capilares sanguíneos nas extremidades revelam a saúde do seu endotélio vascular como um todo. Glicose elevada, sedentarismo e estresse oxidativo desgastam essa rede microscópica antes dos grandes vasos adoecerem.\n\nCuidar da circulação periférica é cuidar do coração, do cérebro e da longevidade celular.\n\n🩺 Priorize a integridade da sua microcirculação com acompanhamento preventivo.\n\n---\nDr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412\n#Microcirculacao #Longevidade #Endotelio #SaudeIntegral #PocosDeCaldas',
        image: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?q=80&w=600&auto=format&fit=crop',
        status: 'Pauta Estruturada'
      },
      {
        id: 'dr-alb-32',
        post_id: 32,
        semana: 11,
        dia_semana: 'Quarta-feira',
        date: '2026-11-04T18:00:00Z',
        date_formatted: '04/11/2026 às 18:00',
        channels: ['Instagram Feed', 'Facebook'],
        funnel_stage: 'ATR',
        funnel_label: 'Atração',
        strategic_pillar: 'Sinais Silenciosos & Fisiopatologia',
        type: 'Carrossel',
        format_label: 'Carrossel Clínico',
        title: 'Queimação na sola dos pés ao repousar: Origem venosa versus neurológica',
        hook_clinical_reasoning: 'O represamento de sangue desoxigenado no plexo venoso plantar durante a noite causa calor local que é frequentemente confundido com neuropatias.',
        cta: 'Identifique a causa real do seu sintoma em uma consulta especializada.',
        compliance: 'Dr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412. Informativo de caráter estritamente educativo e preventivo, em conformidade com a Resolução CFM 2.336/2023. Sem promessas de cura.',
        caption: 'Sensação de pés queimando ou formigamento ao deitar pode ser neuropatia periférica, mas com muita frequência é a estase no plexo venoso plantar (represamento de sangue quente e sem oxigênio sob a sola do pé).\n\nO mapeamento vascular esclarece a origem exata para o tratamento correto.\n\n🔍 Identifique a causa real do seu sintoma em uma consulta especializada.\n\n---\nDr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412\n#PlexoPlantar #PesQueimando #DiagnosticoDiferencial #CirurgiaVascular',
        image: 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?q=80&w=600&auto=format&fit=crop',
        status: 'Pauta Estruturada'
      },
      {
        id: 'dr-alb-33',
        post_id: 33,
        semana: 11,
        dia_semana: 'Sexta-feira',
        date: '2026-11-06T18:00:00Z',
        date_formatted: '06/11/2026 às 18:00',
        channels: ['Instagram Feed'],
        funnel_stage: 'CON',
        funnel_label: 'Consideração',
        strategic_pillar: 'O Olhar do Especialista',
        type: 'Imagem Única',
        format_label: 'Imagem Institucional',
        title: 'O valor da atualização médica continuada no rigor dos procedimentos vasculares',
        hook_clinical_reasoning: 'O domínio técnico e a dedicação ao estudo constante consolidam a precisão necessária para a condução segura de cada caso no consultório.',
        cta: 'Conheça nosso padrão de precisão clínica e cirúrgica.',
        compliance: 'Dr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412. Informativo de caráter estritamente educativo e preventivo, em conformidade com a Resolução CFM 2.336/2023. Sem promessas de cura.',
        caption: 'A cirurgia vascular é uma das especialidades que mais evoluiu tecnologicamente nos últimos anos. Estudo contínuo, participação em congressos e rigor científico são compromissos inegociáveis com cada paciente que confia na nossa equipe.\n\n✨ Conheça nosso padrão de precisão clínica e cirúrgica no Edifício Unique.\n\n---\nDr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412\n#ExcelenciaMedica #RigorCientifico #CirurgiaVascular #PocosDeCaldas',
        image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=600&auto=format&fit=crop',
        status: 'Pauta Estruturada'
      },
      {
        id: 'dr-alb-34',
        post_id: 34,
        semana: 12,
        dia_semana: 'Segunda-feira',
        date: '2026-11-09T18:00:00Z',
        date_formatted: '09/11/2026 às 18:00',
        channels: ['Instagram Feed', 'Facebook'],
        funnel_stage: 'ATR',
        funnel_label: 'Atração',
        strategic_pillar: 'O Olhar do Especialista',
        type: 'Carrossel',
        format_label: 'Carrossel de Longevidade',
        title: 'Idade do documento versus Idade vascular: Como medimos a saúde das artérias',
        hook_clinical_reasoning: 'Rigidez arterial e disfunção endotelial determinam o verdadeiro ritmo de envelhecimento biológico dos tecidos e órgãos.',
        cta: 'Agende seu check-up de saúde e longevidade vascular.',
        compliance: 'Dr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412. Informativo de caráter estritamente educativo e preventivo, em conformidade com a Resolução CFM 2.336/2023. Sem promessas de cura.',
        caption: 'Você tem a idade dos seus vasos sanguíneos. A rigidez arterial e o espessamento das camadas íntima-média das artérias predizem o risco cardiovascular muito antes de qualquer sintoma perceptível.\n\nO check-up vascular preventivo preserva sua vitalidade a longo prazo.\n\n🩺 Agende seu check-up de saúde e longevidade vascular no consultório.\n\n---\nDr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412\n#IdadeVascular #LongevidadeSaudavel #CheckupPreventivo #CirurgiaVascular',
        image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=600&auto=format&fit=crop',
        status: 'Pauta Estruturada'
      },
      {
        id: 'dr-alb-35',
        post_id: 35,
        semana: 12,
        dia_semana: 'Quarta-feira',
        date: '2026-11-11T18:00:00Z',
        date_formatted: '11/11/2026 às 18:00',
        channels: ['Instagram Reels'],
        funnel_stage: 'CON',
        funnel_label: 'Consideração',
        strategic_pillar: 'Sinais Silenciosos & Fisiopatologia',
        type: 'Vídeo / Reels',
        format_label: 'Vídeo Clínico',
        title: 'Reposição hormonal e saúde vascular: A triagem circulatória antes do tratamento',
        hook_clinical_reasoning: 'Avaliar o histórico de trombofilia e o retorno venoso antes de iniciar estrogênios assegura uma transição hormonal com proteção circulatória.',
        cta: 'Inclua a avaliação vascular no seu planejamento médico.',
        compliance: 'Dr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412. Informativo de caráter estritamente educativo e preventivo, em conformidade com a Resolução CFM 2.336/2023. Sem promessas de cura.',
        caption: 'A Terapia de Reposição Hormonal (TRH) traz benefícios incríveis para a qualidade de vida na menopausa, mas requer avaliação vascular prévia para calibrar a melhor via de administração (transdérmica vs oral) e mitigar qualquer risco trombótico.\n\nA integração entre ginecologia e cirurgia vascular garante segurança total para a sua saúde.\n\n🩺 Inclua a avaliação vascular no seu planejamento médico anual.\n\n---\nDr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412\n#ReposicaoHormonal #TRH #SaudeDaMulher #Menopausa #CirurgiaVascular',
        image: 'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?q=80&w=600&auto=format&fit=crop',
        status: 'Pauta Estruturada'
      },
      {
        id: 'dr-alb-36',
        post_id: 36,
        semana: 12,
        dia_semana: 'Sexta-feira',
        date: '2026-11-13T18:00:00Z',
        date_formatted: '13/11/2026 às 18:00',
        channels: ['Instagram Feed', 'Facebook'],
        funnel_stage: 'CVR',
        funnel_label: 'Conversão',
        strategic_pillar: 'Vanguarda Tecnológica',
        type: 'Carrossel',
        format_label: 'Carrossel Síntese',
        title: 'A ciência da restauração vascular: Recuperar a leveza das pernas mantendo sua rotina',
        hook_clinical_reasoning: 'A união de diagnóstico por imagem de alta resolução, laser transdérmico e rigor ético devolve o conforto às pernas sem necessidade de internação.',
        cta: 'Recupere a saúde e a leveza das suas pernas. Agende sua consulta.',
        compliance: 'Dr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412. Informativo de caráter estritamente educativo e preventivo, em conformidade com a Resolução CFM 2.336/2023. Sem promessas de cura.',
        caption: 'Você não precisa conviver com dor, queimação, inchaço ou o incômodo estético de vasinhos e varizes.\n\nAliando Ecodoppler de alta resolução, Laser Transdérmico CLaCS e Endolaser com anestesia local, você recupera a leveza e a saúde das suas pernas sem internação hospitalar e sem parar sua rotina de vida.\n\n✨ Recupere a saúde e a leveza das suas pernas. Agende sua consulta no Edifício Unique pelo link da bio.\n\n---\nDr. Alberto Brasil | Cirurgião Vascular | CRM-MG: 39529 | RQE: 15412\n#RestauracaoVascular #LaserTransdermico #PernasLeves #CirurgiaVascular #PocosDeCaldas',
        image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=600&auto=format&fit=crop',
        status: 'Pauta Estruturada'
      }
    ]
  },

  'client-dubola': {
    id: 'client-dubola',
    name: 'Dubola Molhos Especiais',
    handle: '@dubolagourmet',
    pageName: 'Dubola Molhos Nobres',
    avatar: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?q=80&w=300&auto=format&fit=crop',
    segment: 'Alimentos & Gastronomia Gourmet',
    city: 'Pouso Alegre - MG',
    tone_of_voice: 'Gourmet, Rústico-Chique, Apaixonado por Gastronomia e Conectado ao Sabor Autêntico',
    credentials: {
      ig_user_id: '17841400234988771',
      fb_page_id: '109823487123490',
      ad_account_id: 'act_6957602694317339',
      token_status: 'valid',
      last_sync: '2026-08-19T12:45:00Z',
      active_permissions: ['pages_show_list', 'instagram_basic', 'ads_read']
    },
    kpis: {
      period_label: 'Últimos 30 dias',
      total_reach: 84320,
      reach_organic: 21400,
      reach_paid: 62920,
      total_interactions: 3840,
      likes: 3120,
      shares: 480,
      comments: 240,
      saves: 310,
      new_followers: 640,
      total_followers: 18450,
      posts_count: 14,
      avg_reach_per_post: 6022,
      interaction_rate: '4.55%',
      profile_views: 12400,
      website_clicks: 1890,
      fb_followers: 9200,
      fb_new_followers: 85,
      fb_shares: 140,
      fb_reactions: 820
    },
    time_series: [
      { date: '01/08', reach: 2400, followers: 17850, interactions: 110 },
      { date: '05/08', reach: 3800, followers: 17980, interactions: 180 },
      { date: '10/08', reach: 6200, followers: 18120, interactions: 320 },
      { date: '15/08', reach: 5100, followers: 18290, interactions: 260 },
      { date: '18/08', reach: 4900, followers: 18450, interactions: 240 }
    ],
    posts: [
      {
        id: 'dub-1',
        title: 'Receita: Costela Defumada ao Molho Barbecue com Goiabada',
        type: 'VIDEO',
        type_label: 'Reels Gourmet',
        date_formatted: '15/08/2026',
        reach: 28400,
        likes: 1240,
        comments: 92,
        shares: 210,
        saves: 180,
        total_interactions: 1722,
        engagement_rate: '6.06%',
        thumbnail: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'dub-2',
        title: 'Linha de Pimentas Artesanais: Do Suave ao Extremo',
        type: 'CAROUSEL',
        type_label: 'Carrossel de Produto',
        date_formatted: '10/08/2026',
        reach: 19500,
        likes: 890,
        comments: 64,
        shares: 110,
        saves: 75,
        total_interactions: 1139,
        engagement_rate: '5.84%',
        thumbnail: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?q=80&w=400&auto=format&fit=crop'
      }
    ],
    demographics: {
      top_cities: [
        { city: 'São Paulo (SP)', percentage: 38, count: 7011 },
        { city: 'Belo Horizonte (MG)', percentage: 22, count: 4059 },
        { city: 'Campinas (SP)', percentage: 14, count: 2583 },
        { city: 'Pouso Alegre (MG)', percentage: 12, count: 2214 }
      ],
      age_gender: [
        { age: '25-34', female: 32, male: 28 },
        { age: '35-44', female: 20, male: 12 }
      ],
      gender_split: { female: 54, male: 46 }
    },
    listening: {
      monitored_terms: ['Dubola Molhos', 'molho de pimenta artesanal', 'barbecue com goiabada', 'gastronomia de minas'],
      sentiment: { positive: 88, neutral: 10, negative: 2 },
      sentiment_volume: 184,
      trending_topics: [
        { term: 'Barbecue de Goiabada', count: 86, sentiment: 'positive' },
        { term: 'Sabor Defumado', count: 42, sentiment: 'positive' },
        { term: 'Frete para SP', count: 18, sentiment: 'neutral' }
      ],
      mentions: [
        {
          id: 'dub-m1',
          author: 'Chef Gustavo Prado',
          channel: 'Instagram Post',
          content: 'Esse molho da @dubolagourmet elevou o brisket do meu restaurante a outro patamar. Sabor absurdo!',
          sentiment: 'positive',
          date: 'Ontem',
          reach: 8900,
          status: 'resolved'
        }
      ]
    },
    sac_tickets: [
      {
        id: 'sac-201',
        author: 'Marcelo Mendes',
        channel: 'Instagram Direct',
        snippet: 'Onde encontro os molhos Dubola aqui em São Paulo capital?',
        date: 'Hoje às 09:30',
        sentiment: 'neutral',
        urgency: 'high',
        status: 'open',
        history: [{ sender: 'user', text: 'Onde encontro os molhos Dubola aqui em São Paulo capital?' }],
        suggested_ai_reply: 'Olá Marcelo! Você encontra nossa linha completa em empórios parceiros como o Empório Santa Luzia e Casa Santa Luzia, ou direto pelo nosso e-commerce com entrega rápida em toda a capital: loja.dubola.com.br. Bom apetite!'
      }
    ],
    scheduled_posts: []
  }
};

// Funções de apoio para cálculo de métricas
export function calculateEngagementRate(interactions, reach) {
  if (!reach || reach === 0) return '0.00%';
  const rate = (interactions / reach) * 100;
  return `${rate.toFixed(2)}%`;
}

// Adaptador dinâmico de dados por período
export function getClientDataForPeriod(baseClient, period) {
  if (!baseClient) return null;
  const clientId = baseClient.id;

  // 1. Dr. Alberto Brasil
  if (clientId === 'client-alberto-brasil') {
    if (period === 'Últimos 7 dias') {
      return {
        ...baseClient,
        ai_insight: 'Nos últimos 7 dias, o pico de alcance ocorreu em 17/08 com 181 contas alcançadas. O engajamento semanal se manteve aquecido em 3.74%.',
        kpis: {
          period_label: 'Últimos 7 dias (12/08 a 19/08/2026)',
          total_reach: 294,
          reach_organic: 294,
          reach_paid: 0,
          total_interactions: 11,
          likes: 9,
          shares: 2,
          comments: 0,
          saves: 0,
          new_followers: 3,
          total_followers: 2015,
          posts_count: 1,
          avg_reach_per_post: 294.0,
          interaction_rate: '3.74%',
          profile_views: 78,
          website_clicks: 12,
          fb_followers: 856,
          fb_new_followers: 0,
          fb_shares: 0,
          fb_reactions: 1
        },
        time_series: [
          { date: '13/08', reach: 42, followers: 2012, interactions: 1 },
          { date: '14/08', reach: 65, followers: 2013, interactions: 2 },
          { date: '15/08', reach: 38, followers: 2013, interactions: 1 },
          { date: '16/08', reach: 24, followers: 2013, interactions: 0 },
          { date: '17/08', reach: 181, followers: 2015, interactions: 6 },
          { date: '18/08', reach: 44, followers: 2015, interactions: 1 },
          { date: '19/08', reach: 28, followers: 2015, interactions: 0 }
        ],
        posts: [
          {
            id: 'post-recent-1',
            permalink: 'https://www.instagram.com/p/Dbbk1sQEsFL/',
            title: 'Laser Transdérmico: Eliminação de Vasinhos Sem Cortes',
            caption: 'A tecnologia do laser transdérmico no Edifício Unique permite tratar vasinhos e telangiectasias com máxima segurança...',
            type: 'CAROUSEL',
            type_label: 'Carrossel Educativo',
            date_formatted: '17/08/2026',
            reach: 181,
            rank: 1,
            likes: 6,
            comments: 0,
            shares: 2,
            saves: 0,
            total_interactions: 8,
            engagement_rate: '4.42%',
            thumbnail: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=400&auto=format&fit=crop'
          }
        ]
      };
    }

    if (period === 'Últimos 30 dias') {
      return {
        ...baseClient,
        ai_insight: 'Desempenho consistente nos últimos 30 dias com 1.280 contas únicas e 56 cliques direcionados para o WhatsApp do consultório.',
        kpis: {
          period_label: 'Últimos 30 dias',
          total_reach: 1280,
          reach_organic: 1280,
          reach_paid: 0,
          total_interactions: 42,
          likes: 34,
          shares: 6,
          comments: 2,
          saves: 0,
          new_followers: 16,
          total_followers: 2015,
          posts_count: 6,
          avg_reach_per_post: 213.3,
          interaction_rate: '3.28%',
          profile_views: 345,
          website_clicks: 56,
          fb_followers: 856,
          fb_new_followers: 2,
          fb_shares: 3,
          fb_reactions: 2
        },
        time_series: [
          { date: '21/07', reach: 68, followers: 2005, interactions: 2 },
          { date: '25/07', reach: 85, followers: 2009, interactions: 3 },
          { date: '29/07', reach: 236, followers: 2013, interactions: 6 },
          { date: '30/07', reach: 241, followers: 2014, interactions: 8 },
          { date: '03/08', reach: 292, followers: 2015, interactions: 6 },
          { date: '10/08', reach: 54, followers: 2015, interactions: 1 },
          { date: '14/08', reach: 65, followers: 2015, interactions: 2 },
          { date: '17/08', reach: 181, followers: 2015, interactions: 6 }
        ],
        posts: [
          baseClient.posts[0],
          baseClient.posts[1],
          baseClient.posts[2],
          baseClient.posts[3],
          baseClient.posts[4],
          {
            id: 'post-extra-1',
            permalink: 'https://www.instagram.com/p/Dbbk1sQEsFL/',
            title: 'Varizes no inverno: Por que esta é a melhor época para tratar?',
            caption: 'Menor exposição solar e facilidade no uso de meias elásticas tornam o inverno o período ideal...',
            type: 'IMAGE',
            type_label: 'Imagem Sazonal',
            date_formatted: '21/07/2026',
            reach: 198,
            rank: 6,
            likes: 5,
            comments: 2,
            shares: 1,
            saves: 0,
            total_interactions: 8,
            engagement_rate: '4.04%',
            thumbnail: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=400&auto=format&fit=crop'
          }
        ]
      };
    }

    if (period === 'Últimos 90 dias') {
      return {
        ...baseClient,
        ai_insight: 'No trimestre, os conteúdos educativos sobre sintomas vasculares responderam por 68% de todas as interações e geraram 48 novos seguidores orgânicos.',
        kpis: {
          period_label: 'Últimos 90 dias (Trimestre)',
          total_reach: 3720,
          reach_organic: 3720,
          reach_paid: 0,
          total_interactions: 126,
          likes: 104,
          shares: 18,
          comments: 4,
          saves: 0,
          new_followers: 48,
          total_followers: 2015,
          posts_count: 15,
          avg_reach_per_post: 248.0,
          interaction_rate: '3.38%',
          profile_views: 980,
          website_clicks: 162,
          fb_followers: 856,
          fb_new_followers: 6,
          fb_shares: 8,
          fb_reactions: 9
        },
        time_series: [
          { date: 'Jun S1', reach: 310, followers: 1968, interactions: 10 },
          { date: 'Jun S2', reach: 280, followers: 1974, interactions: 8 },
          { date: 'Jun S3', reach: 410, followers: 1982, interactions: 14 },
          { date: 'Jun S4', reach: 350, followers: 1990, interactions: 11 },
          { date: 'Jul S1', reach: 420, followers: 2001, interactions: 15 },
          { date: 'Jul S2', reach: 390, followers: 2008, interactions: 12 },
          { date: 'Jul S3', reach: 510, followers: 2014, interactions: 20 },
          { date: 'Ago S1', reach: 490, followers: 2015, interactions: 18 },
          { date: 'Ago S2', reach: 360, followers: 2015, interactions: 12 }
        ],
        posts: [
          ...baseClient.posts,
          {
            id: 'post-90d-1',
            title: 'Trombose Venosa Profunda: Sintomas silenciosos',
            type: 'CAROUSEL',
            type_label: 'Carrossel Clínico',
            date_formatted: '18/06/2026',
            reach: 340,
            rank: 6,
            likes: 12,
            comments: 1,
            shares: 4,
            saves: 0,
            total_interactions: 17,
            engagement_rate: '5.00%',
            thumbnail: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop'
          },
          {
            id: 'post-90d-2',
            title: 'Check-up Vascular: Quando agendar com Doppler?',
            type: 'IMAGE',
            type_label: 'Imagem Única',
            date_formatted: '04/06/2026',
            reach: 280,
            rank: 7,
            likes: 9,
            comments: 1,
            shares: 2,
            saves: 0,
            total_interactions: 12,
            engagement_rate: '4.28%',
            thumbnail: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?q=80&w=400&auto=format&fit=crop'
          }
        ]
      };
    }

    if (period === 'Ano 2026') {
      return {
        ...baseClient,
        ai_insight: 'Em 2026, a base de seguidores do Dr. Alberto cresceu 10.1% de forma 100% orgânica em Poços de Caldas e região, gerando mais de 520 conversões de contato no WhatsApp.',
        kpis: {
          period_label: 'Ano 2026 (Acumulado)',
          total_reach: 12450,
          reach_organic: 12450,
          reach_paid: 0,
          total_interactions: 410,
          likes: 340,
          shares: 55,
          comments: 15,
          saves: 0,
          new_followers: 185,
          total_followers: 2015,
          posts_count: 42,
          avg_reach_per_post: 296.4,
          interaction_rate: '3.29%',
          profile_views: 3120,
          website_clicks: 520,
          fb_followers: 856,
          fb_new_followers: 24,
          fb_shares: 28,
          fb_reactions: 34
        },
        time_series: [
          { date: 'Jan/26', reach: 1100, followers: 1830, interactions: 38 },
          { date: 'Fev/26', reach: 1350, followers: 1865, interactions: 44 },
          { date: 'Mar/26', reach: 1600, followers: 1910, interactions: 52 },
          { date: 'Abr/26', reach: 1540, followers: 1945, interactions: 49 },
          { date: 'Mai/26', reach: 1780, followers: 1970, interactions: 60 },
          { date: 'Jun/26', reach: 1850, followers: 1995, interactions: 62 },
          { date: 'Jul/26', reach: 1920, followers: 2014, interactions: 68 },
          { date: 'Ago/26', reach: 1310, followers: 2015, interactions: 37 }
        ],
        posts: baseClient.posts
      };
    }

    // Default '05/07/2026 a 05/08/2026'
    return {
      ...baseClient,
      ai_insight: 'O formato Carrossel liderou o alcance com 292 contas únicas no post sobre Laser. A taxa média de engajamento da conta atingiu 3.07%, superando o benchmark do nicho médico regional em Poços de Caldas.'
    };
  }

  // 2. Dubola Molhos Especiais
  if (clientId === 'client-dubola') {
    if (period === 'Últimos 7 dias') {
      return {
        ...baseClient,
        ai_insight: 'Campanha de Reels gastronômicos gerou 18.200 visualizações na última semana, impulsionando pedidos de e-commerce em SP e BH.',
        kpis: {
          period_label: 'Últimos 7 dias',
          total_reach: 24500,
          reach_organic: 6800,
          reach_paid: 17700,
          total_interactions: 1120,
          likes: 920,
          shares: 140,
          comments: 60,
          saves: 95,
          new_followers: 180,
          total_followers: 18450,
          posts_count: 3,
          avg_reach_per_post: 8166,
          interaction_rate: '4.57%',
          profile_views: 3400,
          website_clicks: 520,
          fb_followers: 9200,
          fb_new_followers: 22,
          fb_shares: 35,
          fb_reactions: 210
        },
        time_series: [
          { date: '13/08', reach: 2900, followers: 18310, interactions: 130 },
          { date: '14/08', reach: 3400, followers: 18360, interactions: 155 },
          { date: '15/08', reach: 5100, followers: 18400, interactions: 260 },
          { date: '16/08', reach: 3800, followers: 18420, interactions: 180 },
          { date: '17/08', reach: 4100, followers: 18440, interactions: 195 },
          { date: '18/08', reach: 4900, followers: 18450, interactions: 240 },
          { date: '19/08', reach: 2300, followers: 18450, interactions: 110 }
        ]
      };
    }

    if (period === 'Últimos 90 dias' || period === 'Ano 2026') {
      const isYear = period === 'Ano 2026';
      return {
        ...baseClient,
        ai_insight: 'Crescimento escalável com ROAS de 4.8x nas campanhas pagas de molhos especiais e expansão sólida da comunidade gastronômica.',
        kpis: {
          period_label: period,
          total_reach: isYear ? 340000 : 210000,
          reach_organic: isYear ? 85000 : 54000,
          reach_paid: isYear ? 255000 : 156000,
          total_interactions: isYear ? 14200 : 9200,
          likes: isYear ? 11500 : 7400,
          shares: isYear ? 1800 : 1100,
          comments: isYear ? 900 : 700,
          saves: isYear ? 1200 : 800,
          new_followers: isYear ? 2400 : 1600,
          total_followers: 18450,
          posts_count: isYear ? 48 : 36,
          avg_reach_per_post: 7083,
          interaction_rate: '4.17%',
          profile_views: isYear ? 48000 : 31000,
          website_clicks: isYear ? 7800 : 4900,
          fb_followers: 9200,
          fb_new_followers: isYear ? 320 : 210,
          fb_shares: isYear ? 510 : 340,
          fb_reactions: isYear ? 2900 : 1800
        },
        time_series: [
          { date: 'Mês 1', reach: 22000, followers: 16500, interactions: 950 },
          { date: 'Mês 2', reach: 28000, followers: 17200, interactions: 1200 },
          { date: 'Mês 3', reach: 34000, followers: 18450, interactions: 1600 }
        ]
      };
    }
  }

  return baseClient;
}

// IA Helper para SAC 2.0 (Respostas contextualizadas)
export async function generateSmartReply({ clientName, toneOfVoice, channel, userMessage, extraContext = '' }) {
  try {
    const { generateContent } = await import('./gemini');
    const prompt = `Você é o assistente oficial de SAC 2.0 e Social Media da agência Comunicação Social Ag, respondendo em nome do cliente "${clientName}".
Canal: ${channel}
Tom de voz configurado da marca: ${toneOfVoice}
Contexto adicional: ${extraContext}

Mensagem recebida do usuário:
"${userMessage}"

Diretrizes:
1. Responda com cordialidade, precisão e respeito absoluto às normas da profissão/segmento.
2. Mantenha a resposta concisa (ideal para Direct ou comentário de rede social).
3. Se for área médica/saúde, oriente sempre para a consulta/avaliação médica presencial e forneça canal direto como WhatsApp ou telefone se aplicável.
4. Responda em Português do Brasil.`;

    const reply = await generateContent(prompt);
    return reply || 'Olá! Agradecemos pelo seu contato. Para maiores informações e agendamentos, entre em contato direto pelo nosso WhatsApp oficial.';
  } catch (error) {
    console.warn('[AI SAC] Falha ao gerar resposta com Gemini:', error);
    return 'Olá! Agradecemos o contato. Nossa equipe entrará em contato em breve para fornecer todas as informações necessárias.';
  }
}

// IA Helper para Social Listening & Classificação de Sentimento
export async function analyzeMentionSentiment(text) {
  try {
    const { generateContent } = await import('./gemini');
    const prompt = `Analise o sentimento desta menção de rede social e responda APENAS uma única palavra em minúsculo: "positive", "neutral" ou "negative".
Texto: "${text}"`;
    const res = (await generateContent(prompt)).toLowerCase().trim();
    if (res.includes('positive') || res.includes('positivo')) return 'positive';
    if (res.includes('negative') || res.includes('negativo')) return 'negative';
    return 'neutral';
  } catch {
    return 'neutral';
  }
}

// Contas de Anúncio Oficiais mapeadas na Business Manager da CS Ag
export const META_AD_ACCOUNTS = [
  { id: 'act_6957602694317339', name: 'Dr. Alberto Brasil', client_slug: 'client-alberto-brasil', client_uuid: '87c0b28f-83f0-43ab-aefe-45bda539e8c2' },
  { id: 'act_844396960524350', name: 'Bruno Lima (Conta 1)', client_slug: 'client-dubola', client_uuid: 'ce45a984-093d-4484-9ee4-9177d56310e3' },
  { id: 'act_842403653348752', name: 'Bruno Lima (Conta 2)', client_slug: 'csag-internal-2', client_uuid: null },
  { id: 'act_1391503391222489', name: 'Bruno Lima (Conta 3)', client_slug: 'csag-internal-3', client_uuid: null },
  { id: 'act_1069489698295853', name: 'A Toca', client_slug: 'client-a-toca', client_uuid: null },
];

export function resolveMetaAccountForClient(client) {
  if (!client) return META_AD_ACCOUNTS[0];
  const explicitAccount = client?.reportei_config?.meta_ad_account_id || client?.meta_ad_account_id;
  if (explicitAccount) {
    const found = META_AD_ACCOUNTS.find(a => a.id === explicitAccount);
    if (found) return found;
    return { id: explicitAccount.startsWith('act_') ? explicitAccount : `act_${explicitAccount}`, name: client.name };
  }
  const idStr = String(client.id || '').toLowerCase();
  const nameStr = String(client.name || '').toLowerCase();
  if (idStr.includes('alberto') || idStr === '87c0b28f-83f0-43ab-aefe-45bda539e8c2' || nameStr.includes('alberto')) {
    return META_AD_ACCOUNTS[0];
  }
  if (idStr.includes('dubola') || idStr === 'ce45a984-093d-4484-9ee4-9177d56310e3' || nameStr.includes('dubola')) {
    return META_AD_ACCOUNTS[1];
  }
  if (nameStr.includes('toca')) {
    return META_AD_ACCOUNTS[4];
  }
  return META_AD_ACCOUNTS[0];
}

async function callMetaProxy(endpoint, params = {}) {
  const qs = new URLSearchParams({ endpoint, ...params });
  const res = await fetch(`/api/meta?${qs.toString()}`);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Meta API HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchMetaAdAccounts() {
  try {
    const data = await callMetaProxy('me/adaccounts', {
      fields: 'name,account_id,account_status,currency,amount_spent,balance',
      limit: '50'
    });
    if (Array.isArray(data?.data) && data.data.length > 0) {
      return { live: true, accounts: data.data };
    }
  } catch (err) {
    console.warn('[Meta Graph API] Usando contas mapeadas localmente:', err?.message);
  }
  return {
    live: false,
    accounts: META_AD_ACCOUNTS.map(a => ({
      id: a.id,
      account_id: a.id.replace('act_', ''),
      name: a.name,
      account_status: 1,
      currency: 'BRL'
    }))
  };
}

export async function syncLiveMetaAccount(accountId = 'act_6957602694317339', datePreset = 'last_30d') {
  const cleanAct = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
  try {
    const [accountInfo, campaignsRes, insightsRes] = await Promise.all([
      callMetaProxy(cleanAct, {
        fields: 'name,account_status,currency,amount_spent,balance,spend_cap'
      }),
      callMetaProxy(`${cleanAct}/campaigns`, {
        fields: 'id,name,status,effective_status,objective,daily_budget,lifetime_budget,Created_time,updated_time',
        limit: '50'
      }),
      callMetaProxy(`${cleanAct}/insights`, {
        fields: 'spend,impressions,clicks,cpc,cpm,ctr,reach,frequency,actions,cost_per_action_type',
        date_preset: datePreset,
        level: 'account'
      })
    ]);

    const rawInsight = insightsRes?.data?.[0] || {};
    const actions = Array.isArray(rawInsight.actions) ? rawInsight.actions : [];
    const leadsAction = actions.find(a =>
      a.action_type === 'lead' ||
      a.action_type === 'onsite_conversion.messaging_conversation_started_7d' ||
      a.action_type === 'contact_total' ||
      a.action_type === 'link_click'
    );

    const liveCampaigns = (campaignsRes?.data || []).map(c => {
      const dailyBudget = c.daily_budget ? Number(c.daily_budget) / 100 : 0;
      const lifetimeBudget = c.lifetime_budget ? Number(c.lifetime_budget) / 100 : 0;
      const statusMap = {
        ACTIVE: 'ativa',
        PAUSED: 'pausada',
        ARCHIVED: 'encerrada',
        DELETED: 'encerrada'
      };
      return {
        id: `meta-${c.id}`,
        meta_campaign_id: c.id,
        name: c.name,
        platform: 'Meta Ads',
        objective: c.objective || 'Tráfego / Mensagens',
        budget_daily: dailyBudget,
        budget_monthly: dailyBudget > 0 ? dailyBudget * 30 : lifetimeBudget,
        status: statusMap[c.effective_status || c.status] || 'pausada',
        effective_status: c.effective_status || c.status,
        ad_url: `https://adsmanager.facebook.com/adsmanager/manage/campaigns?act=${cleanAct.replace('act_', '')}`,
        results_summary: `Sincronizado via Meta Graph API v21 (${cleanAct}). Status original: ${c.effective_status || c.status}.`
      };
    });

    return {
      live: true,
      synced_at: new Date().toISOString(),
      account: {
        id: cleanAct,
        name: accountInfo?.name || cleanAct,
        currency: accountInfo?.currency || 'BRL',
        amount_spent_total: accountInfo?.amount_spent ? Number(accountInfo.amount_spent) / 100 : 0,
        balance: accountInfo?.balance ? Number(accountInfo.balance) / 100 : 0,
        status: accountInfo?.account_status === 1 ? 'ACTIVE' : 'INACTIVE'
      },
      insights: {
        date_preset: datePreset,
        spend: Number(rawInsight.spend || 0),
        impressions: Number(rawInsight.impressions || 0),
        reach: Number(rawInsight.reach || 0),
        clicks: Number(rawInsight.clicks || 0),
        cpc: Number(rawInsight.cpc || 0),
        cpm: Number(rawInsight.cpm || 0),
        ctr: Number(rawInsight.ctr || 0),
        conversions: Number(leadsAction?.value || 0),
        actions
      },
      campaigns: liveCampaigns
    };
  } catch (err) {
    console.warn('[Meta Graph API] Usando dados consolidados de contingência:', err?.message);
    const isAlberto = cleanAct === 'act_6957602694317339';
    return {
      live: false,
      error: err?.message,
      synced_at: new Date().toISOString(),
      account: {
        id: cleanAct,
        name: isAlberto ? 'Dr. Alberto Brasil' : 'Conta Meta Ads CS Ag',
        currency: 'BRL',
        amount_spent_total: isAlberto ? 2840.50 : 4120.00,
        balance: 0,
        status: 'ACTIVE'
      },
      insights: {
        date_preset: datePreset,
        spend: isAlberto ? 1200.00 : 2500.00,
        impressions: isAlberto ? 28450 : 64200,
        reach: isAlberto ? 14200 : 38900,
        clicks: isAlberto ? 645 : 1840,
        cpc: isAlberto ? 1.86 : 1.35,
        cpm: isAlberto ? 42.17 : 38.94,
        ctr: isAlberto ? 2.27 : 2.86,
        conversions: isAlberto ? 42 : 96,
        actions: []
      },
      campaigns: []
    };
  }
}

