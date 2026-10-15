import { useState, useCallback, useEffect } from 'react';
import {
  Rocket, CheckCircle2, Clock, Upload, Link2, Eye, EyeOff,
  Copy, Trash2, Plus, FileText, Palette, Globe,
  Shield, BookOpen, Zap, ChevronRight, Check, AlertCircle,
  Lock, Calendar, User, Building2,
  Target, TrendingUp, AtSign, Hash, Play, ExternalLink,
  ArrowRight, Sparkles, RefreshCw, Send, Save
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { generateContent } from '../lib/gemini';
import { useTasks } from '../hooks/useTasks';
import { cn } from '../utils/cn';

const WORKFLOW_TASKS = [
  {
    title: 'Disparo de Boas-Vindas',
    description: 'Enviar e-mail e mensagem de boas-vindas para o cliente com acesso ao portal.',
    day: 0,
    icon: '👋',
    priority: 'high',
    category: 'comunicacao',
  },
  {
    title: 'Monitoramento do Hub',
    description: 'Verificar se o cliente acessou o portal e preencheu o formulário de briefing de negócio.',
    day: 4,
    icon: '📡',
    priority: 'medium',
    category: 'monitoramento',
  },
  {
    title: 'Auditoria de Ativos & Drive',
    description: 'Revisar e catalogar todos os materiais enviados pelo cliente no Google Drive.',
    day: 5,
    icon: '🔍',
    priority: 'medium',
    category: 'auditoria',
  },
  {
    title: 'Setup Interno & Mídias',
    description: 'Configurar ferramentas, acessos ao Meta Business Manager, Google Ads e estrutura interna.',
    day: 7,
    icon: '⚙️',
    priority: 'high',
    category: 'setup',
  },
  {
    title: 'Kickoff Estratégico',
    description: 'Reunião de alinhamento estratégico com o cliente para definir metas, personas e calendário.',
    day: 12,
    icon: '🚀',
    priority: 'high',
    category: 'reuniao',
  },
  {
    title: 'Entrega do Job 01 / Plano de Mídia',
    description: 'Entrega da primeira entrega do contrato para validação e aprovação do cliente.',
    day: 14,
    icon: '🎯',
    priority: 'urgent',
    category: 'entrega',
  },
];

export function generateOnboardingWorkflow(clientId, contractDate) {
  const baseDate = contractDate ? new Date(contractDate) : new Date();
  return WORKFLOW_TASKS.map((task, index) => {
    const dueDate = new Date(baseDate);
    dueDate.setDate(dueDate.getDate() + task.day);
    return {
      id: `onboarding-${clientId}-${index}-${Date.now()}`,
      client_id: clientId,
      title: task.title,
      description: task.description,
      status: 'a-fazer',
      priority: task.priority,
      category: task.category,
      due_date: dueDate.toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      is_onboarding: true,
      day_offset: task.day,
      icon: task.icon,
    };
  });
}

const RULES = [
  {
    icon: '📋',
    title: 'Briefings e Aprovações',
    items: [
      'Todo job começa com um briefing aprovado pelo cliente.',
      'O prazo de aprovação no Review Center é de até 48 horas após o envio.',
      'Sem aprovação documentada, nenhuma publicação é realizada.',
    ],
  },
  {
    icon: '📅',
    title: 'Calendário e Prazos',
    items: [
      'O calendário editorial é entregue até o dia 25 de cada mês anterior.',
      'Alterações de pauta devem ser solicitadas com 72 horas de antecedência.',
      'Jobs urgentes fora de pauta possuem acréscimo de taxa emergencial.',
    ],
  },
  {
    icon: '💬',
    title: 'Comunicação',
    items: [
      'O canal oficial de comunicação operacional é o portal e o WhatsApp do atendimento.',
      'E-mails e tickets de suporte têm retorno em até 24 horas úteis.',
      'Reuniões são agendadas com pelo menos 48 horas de antecedência.',
    ],
  },
];

export default function OnboardingModule({ client, onUpdateClient }) {
  const { createTask } = useTasks(client?.id);
  const [activeStep, setActiveStep] = useState('briefing');
  const [generatingTasks, setGeneratingTasks] = useState(false);
  const [tasksGenerated, setTasksGenerated] = useState(false);
  const [synthesizingAi, setSynthesizingAi] = useState(false);

  // Briefing Form State
  const storageKey = `csag_briefing_${client?.id || 'demo'}`;
  const [briefing, setBriefing] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {
        business_summary: '',
        main_products: '',
        competitors: '',
        target_audience: client?.target_audience || '',
        tone_of_voice: client?.tone_of_voice || '',
        main_goals: client?.strategic_goals || '',
        drive_link: client?.drive_url || '',
        social_instagram: '',
        social_website: '',
        notes: ''
      };
    } catch {
      return {
        business_summary: '',
        main_products: '',
        competitors: '',
        target_audience: '',
        tone_of_voice: '',
        main_goals: '',
        drive_link: '',
        social_instagram: '',
        social_website: '',
        notes: ''
      };
    }
  });

  const setBField = (field, val) => {
    setBriefing(prev => {
      const updated = { ...prev, [field]: val };
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
  };

  const handleSaveBriefing = (e) => {
    if (e) e.preventDefault();
    try {
      localStorage.setItem(storageKey, JSON.stringify(briefing));
      if (onUpdateClient && briefing.drive_link && briefing.drive_link !== client.drive_url) {
        onUpdateClient({ ...client, drive_url: briefing.drive_link });
      }
      toast.success('Briefing salvo com sucesso!');
    } catch (err) {
      toast.error('Erro ao salvar briefing.');
    }
  };

  const handleSynthesizeAI = async () => {
    if (!briefing.business_summary.trim() && !briefing.main_products.trim()) {
      toast.error('Preencha ao menos o resumo do negócio ou produtos antes de sintetizar com IA.');
      return;
    }

    setSynthesizingAi(true);
    try {
      const prompt = `Você é um Diretor de Estratégia e Branding de uma agência de publicidade de elite.
Analise as respostas do Briefing de Onboarding do cliente abaixo e gere uma síntese estratégica estruturada em formato JSON válido:

Briefing do Cliente:
- Nome da Empresa: ${client?.name || 'Cliente'}
- Resumo do Negócio: ${briefing.business_summary}
- Principais Produtos/Serviços: ${briefing.main_products}
- Concorrentes: ${briefing.competitors}
- Público-Alvo: ${briefing.target_audience}
- Tom de Voz Desejado: ${briefing.tone_of_voice}
- Objetivos de Comunicação: ${briefing.main_goals}

Retorne estritamente um JSON no seguinte formato:
{
  "target_audience": "Descrição refinada do público e persona",
  "tone_of_voice": "Tom de voz e posicionamento de marca resumido em 3 a 5 palavras",
  "strategic_goals": "Objetivos claros e mensuráveis para a agência focar",
  "suggested_channels": ["Meta Ads", "Instagram Conteúdo", "Google Ads"]
}`;

      const aiResponse = await generateContent(prompt);
      
      // Tentar extrair o JSON da resposta da IA
      let jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setBriefing(prev => ({
          ...prev,
          target_audience: parsed.target_audience || prev.target_audience,
          tone_of_voice: parsed.tone_of_voice || prev.tone_of_voice,
          main_goals: parsed.strategic_goals || prev.main_goals
        }));

        if (onUpdateClient) {
          onUpdateClient({
            ...client,
            target_audience: parsed.target_audience || client.target_audience,
            tone_of_voice: parsed.tone_of_voice || client.tone_of_voice,
            strategic_goals: parsed.strategic_goals || client.strategic_goals
          });
        }
        toast.success('Síntese com IA concluída! DNA do cliente atualizado.');
      } else {
        toast.success('IA respondeu a análise do briefing!');
      }
    } catch (e) {
      console.error(e);
      toast.error('Erro na síntese com IA. Verifique se o Gemini está disponível.');
    } finally {
      setSynthesizingAi(false);
    }
  };

  const handleGenerateWorkflow = async () => {
    setGeneratingTasks(true);
    try {
      const today = new Date();
      for (const task of WORKFLOW_TASKS) {
        const dueDate = new Date(today);
        dueDate.setDate(dueDate.getDate() + task.day);
        
        await createTask({
          title: `[ONBOARDING] ${task.title}`,
          description: `${task.description}\n\nCliente: ${client?.name}`,
          client_id: client?.id,
          client_name: client?.name,
          priority: task.priority,
          status: 'a-fazer',
          deadline: dueDate.toISOString().split('T')[0]
        });
      }
      setTasksGenerated(true);
      toast.success('Workflow de 6 tarefas de Onboarding gerado na Produção!');
    } catch (e) {
      console.error(e);
      toast.error('Erro ao gerar workflow de tarefas.');
    } finally {
      setGeneratingTasks(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cs-border pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cs-primary/10 border border-cs-primary/30 flex items-center justify-center text-cs-primary">
            <Rocket size={26} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Hub de Onboarding & Entrada do Cliente</h2>
            <p className="text-xs text-cs-text-secondary">Gestão de briefings, coleta de ativos, síntese de IA e alinhamentos operacionais.</p>
          </div>
        </div>

        {/* Stepper Navigation */}
        <div className="flex items-center bg-cs-surface border border-cs-border p-1 rounded-2xl shrink-0">
          <button
            onClick={() => setActiveStep('briefing')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
              activeStep === 'briefing' ? "bg-cs-primary text-white" : "text-cs-text-secondary hover:text-white"
            )}
          >
            <FileText size={14} /> 1. Briefing
          </button>
          <button
            onClick={() => setActiveStep('drive')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
              activeStep === 'drive' ? "bg-cs-primary text-white" : "text-cs-text-secondary hover:text-white"
            )}
          >
            <Link2 size={14} /> 2. Drive & Acessos
          </button>
          <button
            onClick={() => setActiveStep('workflow')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
              activeStep === 'workflow' ? "bg-cs-primary text-white" : "text-cs-text-secondary hover:text-white"
            )}
          >
            <CheckCircle2 size={14} /> 3. Workflow Setup
          </button>
          <button
            onClick={() => setActiveStep('regras')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
              activeStep === 'regras' ? "bg-cs-primary text-white" : "text-cs-text-secondary hover:text-white"
            )}
          >
            <Shield size={14} /> 4. Diretrizer
          </button>
        </div>
      </div>

      {/* Step 1: Briefing do Cliente */}
      {activeStep === 'briefing' && (
        <div className="bg-cs-surface border border-cs-border rounded-3xl p-6 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-cs-border pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText size={20} className="text-cs-primary" /> Questionário de Briefing de Entrada
              </h3>
              <p className="text-xs text-cs-text-secondary">Preencha as informações essenciais para a agência entender a essência do cliente.</p>
            </div>
            <button
              onClick={handleSynthesizeAI}
              disabled={synthesizingAi}
              className="bg-cs-primary hover:bg-cs-primary-hover text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
            >
              <Sparkles size={16} /> {synthesizingAi ? 'Sintetizando...' : 'Sintetizar DNA com IA'}
            </button>
          </div>

          <form onSubmit={handleSaveBriefing} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Resumo da Empresa / História do Negócio</label>
                <textarea
                  rows={3}
                  value={briefing.business_summary}
                  onChange={e => setBField('business_summary', e.target.value)}
                  className="w-full bg-cs-bg border border-cs-border rounded-xl p-4 text-xs text-white focus:outline-none focus:border-cs-primary resize-none"
                  placeholder="Qual a história da empresa, o que ela faz e qual seu propósito no mercado?"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Principais Produtos & Serviços (Carro-chefe)</label>
                <textarea
                  rows={3}
                  value={briefing.main_products}
                  onChange={e => setBField('main_products', e.target.value)}
                  className="w-full bg-cs-bg border border-cs-border rounded-xl p-4 text-xs text-white focus:outline-none focus:border-cs-primary resize-none"
                  placeholder="Quais os 3 principais produtos/serviços e margem/ticket médio?"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Concorrentes Diretos & Indiretos</label>
                <textarea
                  rows={3}
                  value={briefing.competitors}
                  onChange={e => setBField('competitors', e.target.value)}
                  className="w-full bg-cs-bg border border-cs-border rounded-xl p-4 text-xs text-white focus:outline-none focus:border-cs-primary resize-none"
                  placeholder="Quem são os principais concorrentes que você admira ou combate no mercado?"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Público-Alvo & Persona</label>
                <textarea
                  rows={3}
                  value={briefing.target_audience}
                  onChange={e => setBField('target_audience', e.target.value)}
                  className="w-full bg-cs-bg border border-cs-border rounded-xl p-4 text-xs text-white focus:outline-none focus:border-cs-primary resize-none"
                  placeholder="Faixa etária, gênero, dores, necessidades e desejos do comprador ideal."
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Tom de Voz & Diretrizes de Comunicação</label>
                <textarea
                  rows={3}
                  value={briefing.tone_of_voice}
                  onChange={e => setBField('tone_of_voice', e.target.value)}
                  className="w-full bg-cs-bg border border-cs-border rounded-xl p-4 text-xs text-white focus:outline-none focus:border-cs-primary resize-none"
                  placeholder="Ex: Sofisticado, Jovem, Educativo, Direto ao ponto. O que NÃO dizer?"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Objetivos Principais do Contrato</label>
                <textarea
                  rows={2}
                  value={briefing.main_goals}
                  onChange={e => setBField('main_goals', e.target.value)}
                  className="w-full bg-cs-bg border border-cs-border rounded-xl p-4 text-xs text-white focus:outline-none focus:border-cs-primary resize-none"
                  placeholder="O que fará a agência ter sucesso nos próximos 6 meses com este cliente?"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-cs-border">
              <button
                type="submit"
                className="bg-cs-primary hover:bg-cs-primary-hover text-white px-6 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg flex items-center gap-2"
              >
                <Save size={16} /> Salvar Briefing
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 2: Drive & Acessos */}
      {activeStep === 'drive' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-cs-surface border border-cs-border rounded-3xl p-6 space-y-4">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center">
              <Link2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-white">Google Drive do Cliente</h3>
            <p className="text-xs text-cs-text-secondary leading-relaxed">
              Pasta oficial no Google Drive onde o cliente disponibiliza materiais de marca, imagens, logotipos e vídeos brutos.
            </p>

            <div className="space-y-2 pt-2">
              <label className="text-[10px] font-bold text-cs-text-secondary uppercase block">Link Compartilhado do Drive</label>
              <input
                type="url"
                value={briefing.drive_link}
                onChange={e => {
                  setBField('drive_link', e.target.value);
                  if (onUpdateClient) onUpdateClient({ ...client, drive_url: e.target.value });
                }}
                className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cs-primary"
                placeholder="https://drive.google.com/drive/folders/..."
              />
            </div>

            {briefing.drive_link ? (
              <a
                href={briefing.drive_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-cs-primary hover:bg-cs-primary-hover text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md"
              >
                Acessar Pasta do Drive no Navegador <ExternalLink size={14} />
              </a>
            ) : (
              <p className="text-[10px] text-yellow-400 font-bold">Nenhum link de Drive configurado ainda.</p>
            )}
          </div>

          <div className="bg-cs-surface border border-cs-border rounded-3xl p-6 space-y-4">
            <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-2xl flex items-center justify-center">
              <Lock size={24} />
            </div>
            <h3 className="text-lg font-bold text-white">Cofre de Acessos & Mídias</h3>
            <p className="text-xs text-cs-text-secondary leading-relaxed">
              Cadastre senhas de redes sociais, acessos do Meta Business Suite e Google Ads com criptografia na aba **Cofre Seguro**.
            </p>

            <div className="p-4 bg-cs-bg rounded-2xl border border-cs-border space-y-3">
              <div className="flex justify-between items-center text-xs text-cs-text-secondary">
                <span>Instagram Business:</span>
                <span className="text-white font-bold">{briefing.social_instagram || '@dubola_molhos'}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-cs-text-secondary">
                <span>Website Principal:</span>
                <span className="text-white font-bold">{briefing.social_website || 'dubola.com.br'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Workflow Setup (30 Dias) */}
      {activeStep === 'workflow' && (
        <div className="bg-cs-surface border border-cs-border rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-cs-border pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 size={20} className="text-cs-primary" /> Workflow de Onboarding (30 Dias)
              </h3>
              <p className="text-xs text-cs-text-secondary">Dispare as tarefas padronizadas de entrada do cliente diretamente para a fila de Produção.</p>
            </div>

            <button
              onClick={handleGenerateWorkflow}
              disabled={generatingTasks || tasksGenerated}
              className={cn(
                "px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg",
                tasksGenerated ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-cs-primary hover:bg-cs-primary-hover text-white"
              )}
            >
              <Rocket size={16} /> {tasksGenerated ? 'Workflow Ativo na Produção' : generatingTasks ? 'Gerando Tarefas...' : 'Disparar Tarefas de Setup'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {WORKFLOW_TASKS.map((t, idx) => (
              <div key={idx} className="bg-cs-bg border border-cs-border rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xl">{t.icon}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cs-surface text-cs-text-secondary uppercase">
                    Dia {t.day}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">{t.title}</h4>
                <p className="text-xs text-cs-text-secondary leading-relaxed">{t.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Regras & Diretrizes da Agência */}
      {activeStep === 'regras' && (
        <div className="bg-cs-surface border border-cs-border rounded-3xl p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Acordo de Nível de Serviço (SLA) & Regras da Agência</h3>
            <p className="text-xs text-cs-text-secondary">Diretrizes operacionais alinhadas com o cliente para garantir pontualidade e qualidade nas entregas.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {RULES.map((rule, idx) => (
              <div key={idx} className="bg-cs-bg border border-cs-border rounded-2xl p-6 space-y-4">
                <div className="text-2xl">{rule.icon}</div>
                <h4 className="text-white font-bold text-sm">{rule.title}</h4>
                <ul className="space-y-2">
                  {rule.items.map((item, i) => (
                    <li key={i} className="text-xs text-cs-text-secondary flex items-start gap-2">
                      <span className="text-cs-primary font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
