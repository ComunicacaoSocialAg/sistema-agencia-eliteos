import { useEffect, useMemo, useState } from 'react';
import {
  Rocket, CheckCircle2, FileText, Palette, Shield, Sparkles,
  Save, Building2, DollarSign, MessageSquare, CheckSquare, Square, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { generateContent } from '../lib/gemini';
import { generateStrategicPlan } from '../lib/openai';
import { operationId } from '../lib/operationId';
import { useTasks } from '../hooks/useTasks';
import { useInvoices } from '../hooks/useInvoices';
import { cn } from '../utils/cn';
import BrandKitEditor from './BrandKitEditor';
import RegistrationLinkModal from './RegistrationLinkModal';
import { LIFECYCLE_STAGE_META as LIFECYCLE_STAGES, normalizeLifecycleStage } from '../lib/lifecycle';

const WORKFLOW_TASKS = [
  {
    key: 'boas-vindas',
    title: 'Disparo de Boas-Vindas & Alinhamento',
    description: 'Enviar mensagem de boas-vindas com orientações de aprovação e canal oficial.',
    day: 0,
    tag: 'Social Media',
    priority: 'high',
    status: 'briefing',
  },
  {
    key: 'auditoria-marca',
    title: 'Auditoria de Brand Kit, Logo & Drive',
    description: 'Conferir logotipos em vetor, paleta oficial, tipografia e pasta no Google Drive.',
    day: 2,
    tag: 'Branding',
    priority: 'high',
    status: 'backlog',
  },
  {
    key: 'setup-acessos',
    title: 'Setup de Acessos (Meta, Google & Redes)',
    description: 'Validar acessos administrativos no Business Manager, Google Ads e conta de anúncios.',
    day: 4,
    tag: 'Campanha',
    priority: 'high',
    status: 'backlog',
  },
  {
    key: 'kickoff',
    title: 'Kickoff Estratégico & Validação do Plano',
    description: 'Reunião inicial para validar metas, persona, restrições e calendário.',
    day: 7,
    tag: 'Campanha',
    priority: 'high',
    status: 'backlog',
  },
  {
    key: 'primeira-entrega',
    title: 'Entrega do Job 01 para Aprovação',
    description: 'Produzir primeira entrega do contrato e enviar link de aprovação.',
    day: 14,
    tag: 'Social Media',
    priority: 'high',
    status: 'backlog',
  },
];

const DEFAULT_CHECKLIST = [
  { id: 'dados', label: 'Dados cadastrais e contrato confirmados', done: false },
  { id: 'brand', label: 'Brand Kit (cores, tipografia, logo e Drive) configurado', done: false },
  { id: 'briefing', label: 'Briefing e regras de compliance validados', done: false },
  { id: 'acessos', label: 'Acessos às contas de mídia e redes sociais liberados', done: false },
  { id: 'kickoff', label: 'Kickoff estratégico realizado', done: false },
];

function nextBillingDate(billingDay = '10') {
  const day = Math.min(28, Math.max(1, Number(billingDay) || 10));
  const now = new Date();
  const candidate = new Date(now.getFullYear(), now.getMonth(), day);
  if (candidate < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
    candidate.setMonth(candidate.getMonth() + 1);
  }
  return candidate.toISOString().split('T')[0];
}

export default function OnboardingModule({ client, onUpdateClient }) {
  const { tasks: clientTasks, createTask, remoteMode } = useTasks(client?.id);
  const { invoices, createInvoice } = useInvoices();
  const [activeStep, setActiveStep] = useState('dados');
  const [showLinkModal, setShowLinkModal] = useState(false);

  const [savingContract, setSavingContract] = useState(false);
  const [savingBriefing, setSavingBriefing] = useState(false);
  const [synthesizingAi, setSynthesizingAi] = useState(false);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [approvingPlan, setApprovingPlan] = useState(false);
  const [generatingTasks, setGeneratingTasks] = useState(false);
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [aiPlan, setAiPlan] = useState('');

  const [contractForm, setContractForm] = useState({
    document_id: client?.document_id || '',
    contact_name: client?.contact_name || '',
    contact_email: client?.contact_email || '',
    contact_phone: client?.contact_phone || '',
    monthly_fee: client?.monthly_fee ?? 0,
    monthly_hours_contracted: client?.monthly_hours_contracted ?? 10,
    billing_day: client?.billing_day || '10',
    contract_start_date: client?.contract_start_date || new Date().toISOString().split('T')[0],
    lifecycle_stage: normalizeLifecycleStage(client?.lifecycle_stage || 'onboarding'),
  });

  const storedBriefing = client?.briefing_data || client?.agency_metadata?.briefing_data || {};
  const [briefing, setBriefing] = useState({
    business_summary: storedBriefing.business_summary || '',
    main_products: storedBriefing.main_products || '',
    competitors: storedBriefing.competitors || '',
    target_audience: client?.target_audience || storedBriefing.target_audience || '',
    value_proposition: client?.value_proposition || storedBriefing.value_proposition || '',
    main_goals: client?.strategic_goals || storedBriefing.main_goals || '',
    ai_instructions: client?.ai_instructions || storedBriefing.ai_instructions || '',
    forms_url: client?.forms_url || storedBriefing.forms_url || '',
    notes: storedBriefing.notes || '',
  });

  const savedChecklist = Array.isArray(client?.onboarding_checklist) && client.onboarding_checklist.length > 0
    ? client.onboarding_checklist
    : DEFAULT_CHECKLIST;
  const [checklist, setChecklist] = useState(savedChecklist);

  useEffect(() => {
    setContractForm({
      document_id: client?.document_id || '',
      contact_name: client?.contact_name || '',
      contact_email: client?.contact_email || '',
      contact_phone: client?.contact_phone || '',
      monthly_fee: client?.monthly_fee ?? 0,
      monthly_hours_contracted: client?.monthly_hours_contracted ?? 10,
      billing_day: client?.billing_day || '10',
      contract_start_date: client?.contract_start_date || new Date().toISOString().split('T')[0],
      lifecycle_stage: normalizeLifecycleStage(client?.lifecycle_stage || 'onboarding'),
    });
    const b = client?.briefing_data || client?.agency_metadata?.briefing_data || {};
    setBriefing({
      business_summary: b.business_summary || '',
      main_products: b.main_products || '',
      competitors: b.competitors || '',
      target_audience: client?.target_audience || b.target_audience || '',
      value_proposition: client?.value_proposition || b.value_proposition || '',
      main_goals: client?.strategic_goals || b.main_goals || '',
      ai_instructions: client?.ai_instructions || b.ai_instructions || '',
      forms_url: client?.forms_url || b.forms_url || '',
      notes: b.notes || '',
    });
    setChecklist(
      Array.isArray(client?.onboarding_checklist) && client.onboarding_checklist.length > 0
        ? client.onboarding_checklist
        : DEFAULT_CHECKLIST
    );
  }, [client]);

  const existingOnboardingCount = useMemo(
    () => (clientTasks || []).filter(t => t.title?.startsWith('[ONBOARDING]')).length,
    [clientTasks]
  );

  const clientInvoicesThisMonth = useMemo(() => {
    const monthPrefix = new Date().toISOString().slice(0, 7);
    return (invoices || []).filter(
      inv => inv.client_id === client?.id && String(inv.due_date || '').startsWith(monthPrefix) && inv.status !== 'cancelled'
    );
  }, [invoices, client?.id]);

  const completedChecklistCount = checklist.filter(i => i.done).length;
  const progressPct = Math.round((completedChecklistCount / checklist.length) * 100);

  const handleSaveContract = async (e) => {
    e.preventDefault();
    if (!onUpdateClient || !client) return;
    setSavingContract(true);
    try {
      await onUpdateClient({
        ...client,
        ...contractForm,
        monthly_fee: Number(contractForm.monthly_fee) || 0,
        monthly_hours_contracted: Number(contractForm.monthly_hours_contracted) || 10,
      });
    } finally {
      setSavingContract(false);
    }
  };

  const handleSaveBriefing = async (e) => {
    if (e) e.preventDefault();
    if (!onUpdateClient || !client) return;
    setSavingBriefing(true);
    try {
      await onUpdateClient({
        ...client,
        target_audience: briefing.target_audience,
        value_proposition: briefing.value_proposition,
        strategic_goals: briefing.main_goals,
        ai_instructions: briefing.ai_instructions,
        forms_url: briefing.forms_url,
        briefing_data: briefing,
      });
    } finally {
      setSavingBriefing(false);
    }
  };

  const handleSynthesizeAI = async () => {
    if (!briefing.business_summary.trim() && !briefing.main_products.trim()) {
      toast.error('Preencha ao menos o resumo do negócio ou produtos antes de sintetizar.');
      return;
    }

    setSynthesizingAi(true);
    try {
      const prompt = `Você é o Diretor de Estratégia da Comunicação Social Ag.
Analise o briefing abaixo e gere JSON válido com campos diretos e reais (sem travessão longo):
- Cliente: ${client?.name || 'Cliente'}
- Resumo: ${briefing.business_summary}
- Produtos/Serviços: ${briefing.main_products}
- Concorrentes: ${briefing.competitors}
- Público: ${briefing.target_audience}
- Objetivos: ${briefing.main_goals}

Formato estrito:
{
  "target_audience": "Descrição objetiva da persona e público",
  "value_proposition": "Proposta de valor central em 1 frase",
  "tone_of_voice": "Tom de voz em 3 a 5 palavras",
  "strategic_goals": "Metas claras de comunicação"
}`;

      const aiResponse = await generateContent(prompt, 'auto', { requireProvider: true });
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        toast.error('A IA não retornou o formato esperado. Tente novamente.');
        return;
      }
      const parsed = JSON.parse(jsonMatch[0]);
      const updatedBriefing = {
        ...briefing,
        target_audience: parsed.target_audience || briefing.target_audience,
        value_proposition: parsed.value_proposition || briefing.value_proposition,
        main_goals: parsed.strategic_goals || briefing.main_goals,
      };
      setBriefing(updatedBriefing);
      if (onUpdateClient && client) {
        await onUpdateClient({
          ...client,
          target_audience: updatedBriefing.target_audience,
          value_proposition: updatedBriefing.value_proposition,
          tone_of_voice: parsed.tone_of_voice || client.tone_of_voice,
          strategic_goals: updatedBriefing.main_goals,
          briefing_data: updatedBriefing,
        });
      }
      toast.success('DNA sintetizado e salvo na ficha do cliente.');
    } catch {
      toast.error('IA indisponível agora. Preencha e salve manualmente.');
    } finally {
      setSynthesizingAi(false);
    }
  };

  const handleGeneratePlan = async () => {
    const rawAnswers = [
      briefing.business_summary,
      briefing.main_products,
      briefing.competitors,
      briefing.target_audience,
      briefing.main_goals,
    ].filter(Boolean).join('\n');

    if (!rawAnswers.trim()) {
      toast.error('Preencha o briefing primeiro para gerar o plano.');
      return;
    }

    setGeneratingPlan(true);
    try {
      const { text } = await generateStrategicPlan(client, rawAnswers);
      setAiPlan(text || '');
    } catch {
      toast.error('Não foi possível gerar o plano agora.');
    } finally {
      setGeneratingPlan(false);
    }
  };

  const handleApprovePlan = async () => {
    if (!aiPlan.trim() || !client?.id) return;
    setApprovingPlan(true);
    try {
      if (isSupabaseConfigured) {
        await supabase.from('ai_memories').upsert({
          client_id: client.id,
          key: 'strategic_plan_3months',
          value: aiPlan,
        }, { onConflict: 'client_id,key' });
      }
      const milestones = [
        { key: 'm1', title: 'Mês 1: Setup, Alinhamento e Tração', days: 30, hours: 10, tag: 'Campanha' },
        { key: 'm2', title: 'Mês 2: Escala, Conversão e Otimização', days: 60, hours: 15, tag: 'Campanha' },
        { key: 'm3', title: 'Mês 3: Retenção, BI e Otimização Contínua', days: 90, hours: 15, tag: 'Campanha' },
      ];
      for (const m of milestones) {
        await createTask({
          id: await operationId(`plano-90d-${client.id}-${m.key}`, remoteMode),
          title: m.title,
          client_id: client.id,
          client_name: client.name,
          status: 'backlog',
          tag: m.tag,
          priority: 'medium',
          estimated_hours: m.hours,
          deadline: new Date(Date.now() + m.days * 86400000).toISOString().split('T')[0],
        });
      }
      toast.success('Plano de 90 dias salvo e marcos enviados para Produção.');
      setAiPlan('');
    } catch {
      toast.error('Erro ao salvar o plano na operação.');
    } finally {
      setApprovingPlan(false);
    }
  };

  const handleToggleChecklist = async (itemId) => {
    const next = checklist.map(item => item.id === itemId ? { ...item, done: !item.done } : item);
    setChecklist(next);
    if (onUpdateClient && client) {
      await onUpdateClient({ ...client, onboarding_checklist: next });
    }
  };

  const handleGenerateWorkflow = async () => {
    if (!client?.id) return;
    setGeneratingTasks(true);
    try {
      const today = new Date();
      let createdCount = 0;
      for (const task of WORKFLOW_TASKS) {
        const dueDate = new Date(today);
        dueDate.setDate(dueDate.getDate() + task.day);
        const taskTitle = `[ONBOARDING] ${task.title}`;
        const alreadyExists = (clientTasks || []).some(t => t.title === taskTitle);
        if (alreadyExists) continue;

        const saved = await createTask({
          id: await operationId(`onboarding-step-${client.id}-${task.key}`, remoteMode),
          title: taskTitle,
          notes: `${task.description}\n\nCliente: ${client.name}`,
          client_id: client.id,
          client_name: client.name,
          tag: task.tag,
          priority: task.priority,
          status: task.status,
          deadline: dueDate.toISOString().split('T')[0],
        });
        if (saved) createdCount++;
      }
      if (createdCount === 0) {
        toast.success('Todas as tarefas de onboarding já estavam criadas em Produção.');
      } else {
        toast.success(`${createdCount} tarefa(s) de onboarding criadas em Produção.`);
      }
    } finally {
      setGeneratingTasks(false);
    }
  };

  const handleCreateFirstInvoice = async () => {
    if (!client?.id) return;
    const fee = Number(contractForm.monthly_fee || client.monthly_fee || 0);
    if (fee <= 0) {
      toast.error('Defina um Fee Mensal maior que R$ 0 na etapa 1 antes de gerar cobrança.');
      setActiveStep('dados');
      return;
    }
    if (clientInvoicesThisMonth.length > 0) {
      toast.error('Já existe uma cobrança ativa registrada neste mês para este cliente.');
      return;
    }
    setCreatingInvoice(true);
    try {
      await createInvoice({
        client_id: client.id,
        service: `Mensalidade Fee | ${client.name}`,
        amount: fee,
        due_date: nextBillingDate(contractForm.billing_day || client.billing_day),
      });
    } finally {
      setCreatingInvoice(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    if (!onUpdateClient || !client) return;
    await onUpdateClient({
      ...client,
      lifecycle_stage: 'performance',
      onboarding_checklist: checklist,
      onboarding_completed_at: new Date().toISOString(),
    });
    toast.success('Onboarding concluído. Conta avançou para Performance.');
  };

  const steps = [
    { id: 'dados', label: '1. Dados & Contrato', icon: Building2 },
    { id: 'brand', label: '2. Brand Kit & Drive', icon: Palette },
    { id: 'briefing', label: '3. Briefing & IA', icon: FileText },
    { id: 'setup', label: '4. Setup & Cobrança', icon: Rocket },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header + Progress */}
      <div className="bg-cs-surface border border-cs-border rounded-3xl p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cs-primary/10 border border-cs-primary/30 flex items-center justify-center text-cs-primary">
              <Rocket size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Onboarding & Implantação da Conta</h2>
              <p className="text-xs text-cs-text-secondary">
                Tudo salvo no banco oficial da conta: contrato, Brand Center, briefing, tarefas e primeira fatura.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowLinkModal(true)}
              className="bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 text-[#25D366] px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
            >
              <MessageSquare size={14} /> Link WhatsApp (/cadastro)
            </button>
            <div className="bg-cs-bg border border-cs-border px-3.5 py-2 rounded-xl text-xs">
              <span className="text-cs-text-secondary mr-2">Checklist:</span>
              <strong className="text-white">{progressPct}%</strong>
            </div>
          </div>
        </div>

        {/* Stepper */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {steps.map(step => (
            <button
              key={step.id}
              type="button"
              onClick={() => setActiveStep(step.id)}
              className={cn(
                'px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer',
                activeStep === step.id
                  ? 'bg-cs-primary text-black border-cs-primary shadow-md'
                  : 'bg-cs-bg text-cs-text-secondary border-cs-border hover:text-white'
              )}
            >
              <step.icon size={14} /> {step.label}
            </button>
          ))}
        </div>
      </div>

      {/* Step 1: Dados & Contrato */}
      {activeStep === 'dados' && (
        <form onSubmit={handleSaveContract} className="bg-cs-surface border border-cs-border rounded-3xl p-6 space-y-5">
          <div>
            <h3 className="text-base font-bold text-white">Dados Cadastrais, Contrato & Fee</h3>
            <p className="text-xs text-cs-text-secondary">Confira os dados vindos do CRM ou da Ficha Cadastral do cliente.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">CNPJ / CPF / Registro (CRM)</label>
              <input
                type="text"
                value={contractForm.document_id}
                onChange={e => setContractForm(p => ({ ...p, document_id: e.target.value }))}
                className="w-full bg-cs-bg border border-cs-border rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cs-primary"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Responsável / Contato</label>
              <input
                type="text"
                value={contractForm.contact_name}
                onChange={e => setContractForm(p => ({ ...p, contact_name: e.target.value }))}
                className="w-full bg-cs-bg border border-cs-border rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cs-primary"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">WhatsApp / Telefone</label>
              <input
                type="text"
                value={contractForm.contact_phone}
                onChange={e => setContractForm(p => ({ ...p, contact_phone: e.target.value }))}
                className="w-full bg-cs-bg border border-cs-border rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cs-primary"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">E-mail de Contato</label>
              <input
                type="email"
                value={contractForm.contact_email}
                onChange={e => setContractForm(p => ({ ...p, contact_email: e.target.value }))}
                className="w-full bg-cs-bg border border-cs-border rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cs-primary"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Fee Mensal (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={contractForm.monthly_fee}
                onChange={e => setContractForm(p => ({ ...p, monthly_fee: e.target.value }))}
                className="w-full bg-cs-bg border border-cs-border rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cs-primary"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Horas Contratadas / Mês</label>
              <input
                type="number"
                min="1"
                step="0.5"
                value={contractForm.monthly_hours_contracted}
                onChange={e => setContractForm(p => ({ ...p, monthly_hours_contracted: e.target.value }))}
                className="w-full bg-cs-bg border border-cs-border rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cs-primary"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Dia de Vencimento</label>
              <select
                value={contractForm.billing_day}
                onChange={e => setContractForm(p => ({ ...p, billing_day: e.target.value }))}
                className="w-full bg-cs-bg border border-cs-border rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cs-primary"
              >
                {['05', '10', '15', '20', '25', '30'].map(d => (
                  <option key={d} value={d}>Dia {d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Início do Contrato</label>
              <input
                type="date"
                value={contractForm.contract_start_date}
                onChange={e => setContractForm(p => ({ ...p, contract_start_date: e.target.value }))}
                className="w-full bg-cs-bg border border-cs-border rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cs-primary"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Estágio da Conta</label>
              <select
                value={contractForm.lifecycle_stage}
                onChange={e => setContractForm(p => ({ ...p, lifecycle_stage: e.target.value }))}
                className="w-full bg-cs-bg border border-cs-border rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cs-primary"
              >
                {LIFECYCLE_STAGES.map(stage => (
                  <option key={stage.id} value={stage.id}>{stage.label} ({stage.description})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-cs-border">
            <button
              type="button"
              onClick={() => setActiveStep('brand')}
              className="px-4 py-2.5 rounded-xl border border-cs-border text-xs font-bold text-cs-text-secondary hover:text-white cursor-pointer"
            >
              Ir para Brand Kit
            </button>
            <button
              type="submit"
              disabled={savingContract}
              className="bg-cs-primary hover:bg-cs-primary-hover text-black px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save size={15} /> {savingContract ? 'Salvando...' : 'Salvar Dados do Contrato'}
            </button>
          </div>
        </form>
      )}

      {/* Step 2: Brand Kit & Drive */}
      {activeStep === 'brand' && (
        <BrandKitEditor
          client={client}
          onSave={onUpdateClient}
          alwaysEditing
          saveLabel="Salvar Brand Kit no Banco"
        />
      )}

      {/* Step 3: Briefing & Estratégia IA */}
      {activeStep === 'briefing' && (
        <div className="space-y-6">
          <form onSubmit={handleSaveBriefing} className="bg-cs-surface border border-cs-border rounded-3xl p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cs-border pb-4">
              <div>
                <h3 className="text-base font-bold text-white">Briefing Estratégico & Regras de DNA</h3>
                <p className="text-xs text-cs-text-secondary">Persistido diretamente na ficha oficial do cliente no Supabase.</p>
              </div>
              <button
                type="button"
                onClick={handleSynthesizeAI}
                disabled={synthesizingAi}
                className="bg-cs-primary hover:bg-cs-primary-hover text-black px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Sparkles size={14} /> {synthesizingAi ? 'Sintetizando...' : 'Sintetizar DNA com IA'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Resumo do Negócio / Contexto</label>
                <textarea
                  rows={3}
                  value={briefing.business_summary}
                  onChange={e => setBriefing(p => ({ ...p, business_summary: e.target.value }))}
                  className="w-full bg-cs-bg border border-cs-border rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cs-primary resize-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Produtos / Serviços Principais</label>
                <textarea
                  rows={3}
                  value={briefing.main_products}
                  onChange={e => setBriefing(p => ({ ...p, main_products: e.target.value }))}
                  className="w-full bg-cs-bg border border-cs-border rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cs-primary resize-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Concorrentes & Referências</label>
                <textarea
                  rows={3}
                  value={briefing.competitors}
                  onChange={e => setBriefing(p => ({ ...p, competitors: e.target.value }))}
                  className="w-full bg-cs-bg border border-cs-border rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cs-primary resize-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Público-Alvo / Persona</label>
                <textarea
                  rows={2}
                  value={briefing.target_audience}
                  onChange={e => setBriefing(p => ({ ...p, target_audience: e.target.value }))}
                  className="w-full bg-cs-bg border border-cs-border rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cs-primary resize-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Proposta de Valor / Diferenciais</label>
                <textarea
                  rows={2}
                  value={briefing.value_proposition}
                  onChange={e => setBriefing(p => ({ ...p, value_proposition: e.target.value }))}
                  className="w-full bg-cs-bg border border-cs-border rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cs-primary resize-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Objetivos Estratégicos do Contrato</label>
                <textarea
                  rows={2}
                  value={briefing.main_goals}
                  onChange={e => setBriefing(p => ({ ...p, main_goals: e.target.value }))}
                  className="w-full bg-cs-bg border border-cs-border rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cs-primary resize-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Restrições & Compliance (ex: CFM/CFO)</label>
                <textarea
                  rows={2}
                  value={briefing.ai_instructions}
                  onChange={e => setBriefing(p => ({ ...p, ai_instructions: e.target.value }))}
                  className="w-full bg-cs-bg border border-cs-border rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cs-primary resize-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Link de Questionário Externo (Google Forms, se usado)</label>
                <input
                  type="url"
                  value={briefing.forms_url}
                  onChange={e => setBriefing(p => ({ ...p, forms_url: e.target.value }))}
                  placeholder="https://forms.gle/..."
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cs-primary"
                />
              </div>
            </div>

            <div className="flex flex-wrap justify-between gap-3 pt-4 border-t border-cs-border">
              <button
                type="button"
                onClick={handleGeneratePlan}
                disabled={generatingPlan}
                className="px-4 py-2.5 rounded-xl border border-cs-border hover:border-cs-primary text-xs font-bold text-white flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Sparkles size={14} className="text-cs-primary" /> {generatingPlan ? 'Gerando Plano...' : 'Gerar Plano 90 Dias (IA)'}
              </button>
              <button
                type="submit"
                disabled={savingBriefing}
                className="bg-cs-primary hover:bg-cs-primary-hover text-black px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save size={15} /> {savingBriefing ? 'Salvando...' : 'Salvar Briefing & DNA'}
              </button>
            </div>
          </form>

          {aiPlan && (
            <div className="bg-cs-surface border border-cs-primary/30 rounded-3xl p-6 space-y-4">
              <h4 className="text-sm font-bold text-white">Rascunho de Plano Estratégico (90 Dias)</h4>
              <pre className="whitespace-pre-wrap font-sans text-xs text-cs-text-primary bg-cs-bg border border-cs-border rounded-2xl p-4 max-h-80 overflow-y-auto custom-scrollbar">
                {aiPlan}
              </pre>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAiPlan('')}
                  className="px-4 py-2 text-xs font-bold text-cs-text-secondary hover:text-white cursor-pointer"
                >
                  Descartar
                </button>
                <button
                  type="button"
                  onClick={handleApprovePlan}
                  disabled={approvingPlan}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold px-5 py-2.5 rounded-xl text-xs cursor-pointer disabled:opacity-50"
                >
                  {approvingPlan ? 'Salvando...' : 'Aprovar Plano & Criar Marcos em Produção'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Setup, Produção & Cobrança */}
      {activeStep === 'setup' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Checklist Persistido */}
          <div className="bg-cs-surface border border-cs-border rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Shield size={18} className="text-cs-primary" /> Checklist de Implantação
                </h3>
                <p className="text-xs text-cs-text-secondary">
                  {completedChecklistCount} de {checklist.length} etapas concluídas
                </p>
              </div>
              {normalizeLifecycleStage(client?.lifecycle_stage) === 'onboarding' && (
                <button
                  type="button"
                  onClick={handleCompleteOnboarding}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black px-3.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer"
                >
                  Concluir Onboarding
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {checklist.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleToggleChecklist(item.id)}
                  className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-cs-bg border border-cs-border hover:border-cs-primary/40 text-left transition-all cursor-pointer"
                >
                  {item.done ? (
                    <CheckSquare size={18} className="text-emerald-400 shrink-0" />
                  ) : (
                    <Square size={18} className="text-cs-text-secondary shrink-0" />
                  )}
                  <span className={cn('text-xs font-semibold', item.done ? 'text-cs-text-secondary line-through' : 'text-white')}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Ações de Produção & Faturamento */}
          <div className="space-y-6">
            <div className="bg-cs-surface border border-cs-border rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-cs-primary" /> Esteira de Setup em Produção
                  </h3>
                  <p className="text-xs text-cs-text-secondary">
                    {existingOnboardingCount > 0
                      ? `${existingOnboardingCount} tarefa(s) de onboarding já estão na fila de Produção.`
                      : 'Dispare as 5 tarefas padrão de setup sem duplicar.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateWorkflow}
                  disabled={generatingTasks}
                  className="bg-cs-primary hover:bg-cs-primary-hover text-black px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer disabled:opacity-50"
                >
                  {generatingTasks ? 'Gerando...' : existingOnboardingCount > 0 ? 'Sincronizar Faltantes' : 'Criar Tarefas em Produção'}
                </button>
              </div>

              <div className="space-y-2">
                {WORKFLOW_TASKS.map(t => (
                  <div key={t.key} className="flex items-center justify-between bg-cs-bg border border-cs-border rounded-xl px-3.5 py-2.5 text-xs">
                    <span className="text-white font-medium truncate pr-2">{t.title}</span>
                    <span className="text-[10px] font-mono text-cs-text-secondary shrink-0">D+{t.day}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-cs-surface border border-cs-border rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <DollarSign size={18} className="text-emerald-400" /> Primeira Cobrança do Contrato
                  </h3>
                  <p className="text-xs text-cs-text-secondary">
                    Fee atual: <strong className="text-white">R$ {Number(contractForm.monthly_fee || client?.monthly_fee || 0).toLocaleString('pt-BR')}</strong> · Vencimento todo dia <strong className="text-white">{contractForm.billing_day}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCreateFirstInvoice}
                  disabled={creatingInvoice || clientInvoicesThisMonth.length > 0}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer disabled:opacity-50"
                >
                  {clientInvoicesThisMonth.length > 0
                    ? 'Fatura do Mês Criada'
                    : creatingInvoice
                      ? 'Gerando...'
                      : 'Gerar 1ª Fatura'}
                </button>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-cs-text-secondary bg-cs-bg border border-cs-border rounded-xl px-3.5 py-2.5">
                <Calendar size={14} className="text-cs-primary shrink-0" />
                <span>Próximo vencimento sugerido: {nextBillingDate(contractForm.billing_day).split('-').reverse().join('/')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <RegistrationLinkModal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        context={{
          clientId: client?.id,
          company: client?.name,
          contact: client?.contact_name,
          phone: client?.contact_phone,
          value: client?.monthly_fee,
        }}
      />
    </div>
  );
}
