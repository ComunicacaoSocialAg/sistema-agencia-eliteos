import { useState, useEffect } from 'react';
import { Building2, Phone, Mail, Percent, Plus, X, User, Trash2, ChevronLeft, Sparkles, Copy } from 'lucide-react';
import { useDeals } from '../hooks/useDeals';
import { useAIAssistant } from '../contexts/AIAssistantContext';
import { useClients } from '../hooks/useClients';
import { useTasks } from '../hooks/useTasks';
import { generateOnboardingWorkflow } from '../components/OnboardingModule';
import { generateContent } from '../lib/gemini';

// Modal de Novo Negócio
function NewDealModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    company: '', contact: '', value: '', probability: 50, status: 'prospeccao', assigned_to: 'Bruno',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.company.trim()) return;
    onSave({ ...form, value: Number(form.value) || 0 });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-cs-surface border border-cs-border rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-cs-border flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Novo Negócio</h2>
          <button onClick={onClose} className="text-cs-text-secondary hover:text-white p-1"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs text-cs-text-secondary mb-1 block">Empresa *</label>
            <input autoFocus value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
              placeholder="Ex: Clínica Odonto Prime" required
              className="w-full bg-cs-bg border border-cs-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cs-primary" />
          </div>
          <div>
            <label className="text-xs text-cs-text-secondary mb-1 block">Contato</label>
            <input value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))}
              placeholder="Ex: Dr. Marcos"
              className="w-full bg-cs-bg border border-cs-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cs-primary" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-cs-text-secondary mb-1 block">Valor Mensal (R$)</label>
              <input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                placeholder="3000"
                className="w-full bg-cs-bg border border-cs-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cs-primary" />
            </div>
            <div>
              <label className="text-xs text-cs-text-secondary mb-1 block">Probabilidade (%)</label>
              <input type="number" min="0" max="100" value={form.probability}
                onChange={e => setForm(f => ({ ...f, probability: Number(e.target.value) }))}
                className="w-full bg-cs-bg border border-cs-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cs-primary" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-cs-text-secondary mb-1 block">Estágio</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full bg-cs-bg border border-cs-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cs-primary">
                <option value="prospeccao">Prospecção</option>
                <option value="qualificacao">Qualificação</option>
                <option value="proposta">Proposta Enviada</option>
                <option value="negociacao">Negociação</option>
                <option value="ganho">Fechado/Ganho</option>
                <option value="perdido">Perdido</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-cs-text-secondary mb-1 block">Responsável</label>
              <select value={form.assigned_to} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))}
                className="w-full bg-cs-bg border border-cs-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cs-primary">
                {['Bruno', 'Carlos', 'Ana'].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-cs-border text-cs-text-secondary hover:text-white py-2 rounded-lg text-sm transition-colors">Cancelar</button>
            <button type="submit"
              className="flex-1 bg-cs-primary hover:bg-cs-primary-hover text-white py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-cs-primary/20">Criar Negócio</button>
          </div>
        </form>
      </div>
    </div>
  );
}




const COLUMNS = [
  { id: 'prospeccao', title: 'Prospecção', color: 'bg-zinc-500' },
  { id: 'qualificacao', title: 'Qualificação', color: 'bg-blue-500' },
  { id: 'proposta', title: 'Proposta Enviada', color: 'bg-yellow-500' },
  { id: 'negociacao', title: 'Negociação', color: 'bg-orange-500' },
  { id: 'ganho', title: 'Fechado/Ganho', color: 'bg-green-500' },
  { id: 'perdido', title: 'Perdido', color: 'bg-red-500' },
];

export default function CRMView() {
  const { deals, moveDeal, createDeal, deleteDeal } = useDeals();
  const { createClient } = useClients();
  const { createTask } = useTasks();
  const { setContext } = useAIAssistant();
  const [showNewDealModal, setShowNewDealModal] = useState(false);
  const [selectedAiDeal, setSelectedAiDeal] = useState(null);


  const handleMoveDeal = async (dealId, newStatus) => {
    const deal = deals.find(d => d.id === dealId);
    if (!deal) return;
    
    if (newStatus === 'ganho' && deal.status !== 'ganho') {
      try {
        const newClient = await createClient({
          name: deal.company,
          contact_name: deal.contact,
          monthly_fee: deal.value,
          brand_color: '#3b82f6',
          lifecycle_stage: 'onboarding'
        });

        const onboardingTasks = generateOnboardingWorkflow(newClient.id, new Date().toISOString());
        for (const t of onboardingTasks) {
          await createTask({
            title: t.title,
            client_id: newClient.id,
            client_name: newClient.name,
            tag: 'Onboarding',
            estimated_hours: 4,
            status: t.status === 'a_fazer' ? 'backlog' : t.status,
            deadline: t.due_date,
            description: t.description,
          });
        }
      } catch (error) {
        console.error("Erro no handoff:", error);
      }
    }
    
    await moveDeal(dealId, newStatus);
  };

  useEffect(() => {
    const byStage = Object.fromEntries(
      ['prospeccao','qualificacao','proposta','negociacao','ganho','perdido'].map(s => [
        s, { count: deals.filter(d => d.status === s).length, value: deals.filter(d => d.status === s).reduce((a, d) => a + d.value, 0) }
      ])
    );
    setContext({
      module: 'crm',
      title: 'CRM & Vendas',
      data: {
        pipeline_total: deals.reduce((a, d) => a + d.value, 0),
        total_deals: deals.length,
        por_estagio: byStage,
        deals: deals.map(d => ({ empresa: d.company, valor: d.value, probabilidade: d.probability, estagio: d.status })),
      },
    });
  }, [deals, setContext]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="h-full flex flex-col bg-cs-bg p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">CRM (Novos Negócios)</h2>
          <p className="text-sm text-cs-text-secondary">Pipeline comercial e acompanhamento de propostas.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-cs-surface border border-cs-border rounded-lg px-4 py-2 flex flex-col items-end">
             <span className="text-xs text-cs-text-secondary">Pipeline Total</span>
             <span className="text-sm font-bold text-green-500">{formatCurrency(deals.reduce((acc, curr) => acc + curr.value, 0))}</span>
          </div>
          <button
            onClick={() => setShowNewDealModal(true)}
            className="bg-cs-primary hover:bg-cs-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-cs-primary/20 flex items-center gap-2"
          >
            <Plus size={16} /> Novo Negócio
          </button>
        </div>
      </div>

      {/* Kanban Board for CRM */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden flex items-start gap-4 pb-4">
        {COLUMNS.map(column => {
          const colDeals = deals.filter(deal => deal.status === column.id);
          const colValue = colDeals.reduce((acc, curr) => acc + curr.value, 0);
          
          return (
            <div key={column.id} className="flex-shrink-0 w-80 h-full flex flex-col bg-cs-surface/40 rounded-xl border border-cs-border relative overflow-hidden">
              {/* Subtle background glow based on column color */}
              <div className={`absolute top-0 left-0 w-full h-1 ${column.color}`}></div>
              
              {/* Column Header */}
              <div className="p-4 border-b border-cs-border flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white">{column.title}</h3>
                  <span className="text-xs font-medium text-cs-text-secondary bg-cs-bg px-2 py-0.5 rounded-full border border-cs-border">
                    {colDeals.length}
                  </span>
                </div>
                <div className="text-xs text-cs-text-secondary font-medium">
                  {formatCurrency(colValue)}
                </div>
              </div>

              {/* Column Content */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                {colDeals.map(deal => (
                  <div 
                    key={deal.id} 
                    className="bg-cs-surface border border-cs-border hover:border-cs-primary/50 p-4 rounded-lg shadow-sm group transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-cs-bg border border-cs-border text-cs-primary">
                          <Building2 size={14} />
                        </div>
                        <span className="font-semibold text-white text-sm">{deal.company}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-cs-text-secondary mb-3">
                      <div className="flex items-center gap-1">
                        <User size={12} className="text-cs-text-secondary/70" /> {deal.contact}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-1.5 text-green-400 font-medium text-sm">
                        {formatCurrency(deal.value)}
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-cs-bg border border-cs-border">
                        <Percent size={12} className={deal.probability > 60 ? "text-green-500" : deal.probability > 30 ? "text-yellow-500" : "text-red-500"} />
                        <span className="font-medium text-cs-text-primary">{deal.probability}%</span>
                      </div>
                    </div>

                    {/* Actions on hover */}
                    <div className="mt-4 pt-3 border-t border-cs-border flex gap-2 hidden group-hover:flex animate-in fade-in zoom-in duration-200">
                      <button 
                        onClick={() => setSelectedAiDeal(deal)}
                        className="flex-1 flex justify-center items-center py-1.5 bg-cs-accent/15 hover:bg-cs-accent/30 border border-cs-accent/30 text-cs-accent rounded transition-colors"
                        title="Gerar Abordagem de Prospecção via IA"
                      >
                        <Sparkles size={14} />
                      </button>
                      <button className="flex-1 flex justify-center items-center py-1.5 bg-cs-bg hover:bg-cs-surface-hover border border-cs-border text-cs-text-secondary hover:text-white rounded transition-colors">
                        <Phone size={14} />
                      </button>
                      <button className="flex-1 flex justify-center items-center py-1.5 bg-cs-bg hover:bg-cs-surface-hover border border-cs-border text-cs-text-secondary hover:text-white rounded transition-colors">
                        <Mail size={14} />
                      </button>
                      <button
                        onClick={() => deleteDeal(deal.id)}
                        className="flex-1 flex justify-center items-center py-1.5 bg-cs-bg hover:bg-red-500/20 border border-cs-border text-cs-text-secondary hover:text-red-400 rounded transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                      {(() => {
                        const currentIndex = COLUMNS.findIndex(c => c.id === deal.status);
                        return (
                          <>
                            {currentIndex > 0 && (
                              <button
                                onClick={() => handleMoveDeal(deal.id, COLUMNS[currentIndex - 1].id)}
                                className="flex-[2] text-xs py-1.5 bg-cs-bg hover:bg-cs-surface-hover border border-cs-border text-cs-text-secondary hover:text-white rounded transition-colors flex items-center justify-center gap-1"
                              >
                                <ChevronLeft size={12} /> Retroceder
                              </button>
                            )}
                            {deal.status !== 'ganho' && deal.status !== 'perdido' && (
                              <button
                                onClick={() => handleMoveDeal(deal.id, COLUMNS[currentIndex + 1].id)}
                                className="flex-[2] text-xs py-1.5 bg-cs-primary/10 text-cs-primary rounded hover:bg-cs-primary hover:text-white transition-colors"
                              >
                                Avançar
                              </button>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Prospecting Copilot Modal */}
      {selectedAiDeal && (
        <AIProspectingModal
          deal={selectedAiDeal}
          onClose={() => setSelectedAiDeal(null)}
        />
      )}

      {showNewDealModal && (
        <NewDealModal
          onClose={() => setShowNewDealModal(false)}
          onSave={(formData) => createDeal(formData)}
        />
      )}
    </div>
  );
}

function AIProspectingModal({ deal, onClose }) {
  const [copyType, setCopyType] = useState('email');
  const [generatedText, setGeneratedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generatePitch = async () => {
    setLoading(true);
    try {
      const prompt = `Você é o Diretor Comercial de uma agência de comunicação full-service de alta performance (Comunica Ag).
Crie um material de prospecção ${copyType === 'email' ? 'E-mail de Cold Outreach' : copyType === 'whatsapp' ? 'Mensagem curta de WhatsApp' : 'Pitch Comercial de 1 minuto'} para o cliente:
- Empresa: ${deal.company}
- Contato: ${deal.contact || 'Prezado(a)'}
- Ticket Estimado: R$ ${deal.value}/mês

Estrutura:
1. Gancho direto sobre posicionamento e presença digital.
2. Apresentação da solução da agência Comunica Ag (Branding, Tráfego Pago, Gestão 360).
3. Chamada para ação (CTA) para uma reunião rápida de alinhamento de 15 minutos.`;

      const text = await generateContent(prompt);
      setGeneratedText(text);
    } catch {
      setGeneratedText(`Olá ${deal.contact || 'equipe'} da ${deal.company},\n\nNotei que sua marca tem grande potencial para expandir no digital. Aqui na Comunica Ag, gerenciamos toda a comunicação 360º de marcas líderes com inteligência de dados.\n\nPodemos agendar um bate-papo de 15 minutos nesta semana?`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generatePitch();
  }, [copyType, deal]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-cs-surface border border-cs-border rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-cs-border flex items-center justify-between bg-cs-bg/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cs-accent/20 text-cs-accent border border-cs-accent/30">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">IA Outbound Copilot — Prospecção</h3>
              <p className="text-xs text-cs-text-secondary">{deal.company} ({deal.contact || 'Contato'})</p>
            </div>
          </div>
          <button onClick={onClose} className="text-cs-text-secondary hover:text-white transition-colors"><X size={20} /></button>
        </div>

        <div className="p-4 border-b border-cs-border bg-cs-bg/30 flex gap-2 shrink-0">
          {[
            { id: 'email', label: '📧 Cold E-mail' },
            { id: 'whatsapp', label: '💬 WhatsApp' },
            { id: 'pitch', label: '🎙️ Pitch Cold Call' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setCopyType(t.id)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                copyType === t.id
                  ? 'bg-cs-primary text-white border-cs-primary shadow-lg shadow-cs-primary/20'
                  : 'bg-cs-bg text-cs-text-secondary border-cs-border hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <Sparkles size={32} className="text-cs-accent animate-spin" />
              <p className="text-xs text-cs-text-secondary font-bold uppercase tracking-widest">Criando abordagem de alta conversão...</p>
            </div>
          ) : (
            <textarea
              readOnly
              value={generatedText}
              className="w-full h-64 bg-cs-bg border border-cs-border rounded-2xl p-4 text-sm text-white focus:outline-none custom-scrollbar font-sans leading-relaxed"
            />
          )}
        </div>

        <div className="p-6 border-t border-cs-border bg-cs-bg/50 flex items-center justify-between shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-cs-text-secondary hover:text-white uppercase tracking-wider">Fechar</button>
          <button
            onClick={handleCopy}
            className="bg-cs-accent hover:bg-cs-accent/80 text-black px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-xl shadow-cs-accent/20 flex items-center gap-2 cursor-pointer"
          >
            <Copy size={16} /> {copied ? 'Copiado para Área de Transferência!' : 'Copiar Texto da Abordagem'}
          </button>
        </div>
      </div>
    </div>
  );
}
