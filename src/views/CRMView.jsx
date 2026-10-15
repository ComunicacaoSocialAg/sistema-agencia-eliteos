import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  Building2, Phone, Mail, Percent, Plus, X, User, Trash2, ChevronLeft, ChevronRight, 
  Sparkles, Copy, Edit3, MessageCircle, DollarSign, CheckCircle2, ArrowRight, FileText,
  AlertTriangle, RotateCcw
} from 'lucide-react';
import { useDeals } from '../hooks/useDeals';
import { useAIAssistant } from '../contexts/AIAssistantContext';
import { useClients } from '../hooks/useClients';
import { useTasks } from '../hooks/useTasks';
import { generateOnboardingWorkflow } from '../components/OnboardingModule';
import { generateContent } from '../lib/gemini';

const COLUMNS = [
  { id: 'prospeccao', title: 'Prospecção', color: 'bg-zinc-500' },
  { id: 'qualificacao', title: 'Qualificação', color: 'bg-blue-500' },
  { id: 'proposta', title: 'Proposta Enviada', color: 'bg-yellow-500' },
  { id: 'negociacao', title: 'Negociação', color: 'bg-orange-500' },
  { id: 'ganho', title: 'Fechado/Ganho', color: 'bg-green-500' },
  { id: 'perdido', title: 'Perdido', color: 'bg-red-500' },
];

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0);
}

function isMobileNumber(phone) {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, '');
  return (digits.length === 11 && digits[2] === '9') || (digits.length === 9 && digits[0] === '9');
}

function callPhone(phone) {
  if (!phone) {
    toast.error('Telefone não informado para este contato.');
    return;
  }
  const clean = phone.replace(/\D/g, '');
  window.location.href = `tel:${clean}`;
}

function openWhatsApp(phone, contactName, company) {
  if (!phone) {
    toast.error('Telefone não informado para este contato.');
    return;
  }
  const clean = phone.replace(/\D/g, '');
  const number = clean.length === 10 || clean.length === 11 ? `55${clean}` : clean;
  const msg = encodeURIComponent(`Olá ${contactName ? contactName : ''}! Sou o Bruno da Comunicação Social Ag (CS Ag). Gostaria de conversar sobre a estratégia e presença digital da ${company}.`);
  window.open(`https://wa.me/${number}?text=${msg}`, '_blank');
}

function openEmail(email, contactName, company) {
  if (!email) {
    toast.error('E-mail não informado para este contato.');
    return;
  }
  const subject = encodeURIComponent(`Estratégia e Presença Digital: ${company}`);
  const body = encodeURIComponent(`Olá ${contactName ? contactName : ''},\n\nTudo bem?\n\nSou o Bruno da Comunicação Social Ag (CS Ag). Fizemos um diagnóstico da presença digital da ${company} em Poços de Caldas e identificamos oportunidades valiosas de expansão.\n\nPodemos conversar 15 minutos nesta semana?\n\nAtenciosamente,\nBruno | CS Ag`);
  window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
}

// Modal de Novo Negócio
function NewDealModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    company: '',
    contact: '',
    contact_phone: '',
    contact_email: '',
    value: 1800,
    probability: 20,
    status: 'prospeccao',
    assigned_to: 'Bruno',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.company.trim()) {
      toast.error('Informe o nome da empresa.');
      return;
    }
    onSave({ ...form, value: Number(form.value) || 0 });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-cs-surface border border-cs-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-cs-border flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Plus size={18} className="text-cs-primary" /> Novo Negócio no CRM
          </h2>
          <button onClick={onClose} className="text-cs-text-secondary hover:text-white p-1 transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div>
            <label className="text-xs text-cs-text-secondary mb-1 block">Empresa ou Consultório *</label>
            <input 
              autoFocus 
              value={form.company} 
              onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
              placeholder="Ex: Clínica Odontológica Sorriso" 
              required
              className="w-full bg-cs-bg border border-cs-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cs-primary" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-cs-text-secondary mb-1 block">Nome do Contato</label>
              <input 
                value={form.contact} 
                onChange={e => setForm(f => ({ ...f, contact: e.target.value }))}
                placeholder="Ex: Dr. Leonardo"
                className="w-full bg-cs-bg border border-cs-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cs-primary" 
              />
            </div>
            <div>
              <label className="text-xs text-cs-text-secondary mb-1 block">Telefone / WhatsApp</label>
              <input 
                value={form.contact_phone} 
                onChange={e => setForm(f => ({ ...f, contact_phone: e.target.value }))}
                placeholder="(35) 99999-9999"
                className="w-full bg-cs-bg border border-cs-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cs-primary" 
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-cs-text-secondary mb-1 block">E-mail</label>
            <input 
              type="email"
              value={form.contact_email} 
              onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))}
              placeholder="contato@empresa.com.br"
              className="w-full bg-cs-bg border border-cs-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cs-primary" 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-cs-text-secondary mb-1 block">Valor Mensal (R$)</label>
              <input 
                type="number" 
                value={form.value} 
                onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                placeholder="1800"
                className="w-full bg-cs-bg border border-cs-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cs-primary" 
              />
            </div>
            <div>
              <label className="text-xs text-cs-text-secondary mb-1 block">Probabilidade (%)</label>
              <input 
                type="number" 
                min="0" 
                max="100" 
                value={form.probability}
                onChange={e => setForm(f => ({ ...f, probability: Number(e.target.value) }))}
                className="w-full bg-cs-bg border border-cs-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cs-primary" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-cs-text-secondary mb-1 block">Estágio Inicial</label>
              <select 
                value={form.status} 
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full bg-cs-bg border border-cs-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cs-primary"
              >
                {COLUMNS.map(col => <option key={col.id} value={col.id}>{col.title}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-cs-text-secondary mb-1 block">Responsável</label>
              <select 
                value={form.assigned_to} 
                onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))}
                className="w-full bg-cs-bg border border-cs-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cs-primary"
              >
                {['Bruno'].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-cs-text-secondary mb-1 block">Diagnóstico e Anotações</label>
            <textarea 
              rows={3}
              value={form.notes} 
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Descreva o diagnóstico inicial, dores do prospect e oportunidade..."
              className="w-full bg-cs-bg border border-cs-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cs-primary custom-scrollbar resize-none" 
            />
          </div>

          <div className="flex gap-3 pt-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 border border-cs-border text-cs-text-secondary hover:text-white py-2.5 rounded-lg text-sm transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="flex-1 bg-cs-primary hover:bg-cs-primary-hover text-white py-2.5 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-cs-primary/20 cursor-pointer"
            >
              Criar Negócio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal de Confirmação Segura de Exclusão de Prospect
function DeleteConfirmModal({ deal, onConfirm, onCancel }) {
  if (!deal) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onCancel}
    >
      <div 
        className="bg-cs-surface border border-red-500/40 rounded-2xl w-full max-w-md shadow-2xl p-6 relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-white mb-1">
              Confirmar exclusão de prospect
            </h3>
            <p className="text-xs text-cs-text-secondary leading-relaxed mb-3">
              Tem certeza que deseja remover este prospect do pipeline do CRM?
            </p>
            <div className="bg-cs-bg/70 border border-cs-border/60 rounded-lg p-3 text-xs text-zinc-300 space-y-1 mb-4">
              <div className="font-bold text-white text-sm">{deal.company}</div>
              <div className="text-cs-text-secondary">Contato: <span className="text-zinc-200">{deal.contact || 'Não informado'}</span></div>
              <div className="text-cs-text-secondary">Valor Estimado: <span className="text-green-400 font-semibold">{formatCurrency(deal.value)}</span></div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-cs-border/60">
          <button
            type="button"
            onClick={onCancel}
            autoFocus
            className="px-4 py-2 border border-cs-border text-cs-text-secondary hover:text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-lg shadow-red-600/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 size={13} />
            <span>Sim, Excluir Prospect</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal de Detalhes e Edição Integral do Negócio
function DealDetailModal({ deal, onClose, onUpdate, onDelete, onRequestDelete, onMoveStage, onOpenAi, clients }) {
  const [form, setForm] = useState({
    company: deal.company || '',
    contact: deal.contact || '',
    contact_phone: deal.contact_phone || '',
    contact_email: deal.contact_email || '',
    value: deal.value || 0,
    probability: deal.probability || 0,
    status: deal.status || 'prospeccao',
    assigned_to: deal.assigned_to || 'Bruno',
    notes: deal.notes || ''
  });

  const [isSaving, setIsSaving] = useState(false);

  // Vincular com dados do cadastro de cliente se existirem
  const matchedClient = clients?.find(c => 
    (deal.client_id && c.id === deal.client_id) || 
    (c.name && deal.company && c.name.toLowerCase() === deal.company.toLowerCase())
  );

  const currentColumn = COLUMNS.find(c => c.id === form.status) || COLUMNS[0];
  const currentIndex = COLUMNS.findIndex(c => c.id === form.status);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.company.trim()) {
      toast.error('O nome da empresa é obrigatório.');
      return;
    }
    setIsSaving(true);
    try {
      await onUpdate(deal.id, {
        company: form.company,
        contact: form.contact,
        contact_phone: form.contact_phone,
        contact_email: form.contact_email,
        value: Number(form.value) || 0,
        probability: Number(form.probability) || 0,
        status: form.status,
        assigned_to: form.assigned_to,
        notes: form.notes
      });
      onClose();
    } catch {
      toast.error('Erro ao salvar as alterações.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStageChange = async (newStage) => {
    setForm(f => ({ ...f, status: newStage }));
    await onMoveStage(deal.id, newStage);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-cs-surface border border-cs-border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-cs-border flex items-center justify-between bg-cs-bg/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cs-bg border border-cs-border text-cs-primary">
              <Building2 size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{form.company || 'Detalhes do Negócio'}</h2>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full text-white ${currentColumn.color}`}>
                  {currentColumn.title}
                </span>
              </div>
              <p className="text-xs text-cs-text-secondary">
                Responsável: <span className="text-white font-medium">{form.assigned_to}</span> | Criado em: {new Date(deal.created_at || Date.now()).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-cs-text-secondary hover:text-white p-1 rounded-lg transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Barra de Ações Rápidas de Comunicação */}
        <div className="px-6 py-3 bg-cs-bg/30 border-b border-cs-border flex flex-wrap gap-2 items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-cs-text-secondary font-medium">Canais rápidos:</span>
            {form.contact_phone ? (
              isMobileNumber(form.contact_phone) ? (
                <button
                  type="button"
                  onClick={() => openWhatsApp(form.contact_phone, form.contact, form.company)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors cursor-pointer"
                >
                  <MessageCircle size={14} /> WhatsApp
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => callPhone(form.contact_phone)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30 hover:bg-sky-500/25 transition-colors cursor-pointer"
                >
                  <Phone size={14} /> Ligar ({form.contact_phone})
                </button>
              )
            ) : (
              <span className="text-xs text-zinc-500 italic">Sem telefone cadastrado</span>
            )}

            {form.contact_email ? (
              <button
                type="button"
                onClick={() => openEmail(form.contact_email, form.contact, form.company)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:bg-blue-500/25 transition-colors cursor-pointer"
              >
                <Mail size={14} /> Enviar E-mail
              </button>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenAi(deal);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cs-accent/15 text-cs-accent border border-cs-accent/30 hover:bg-cs-accent/25 transition-colors cursor-pointer"
          >
            <Sparkles size={14} /> Gerar Pitch com IA
          </button>
        </div>

        {/* Formulário de Edição Integral */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          {/* Informações da Empresa e Contato */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-cs-text-secondary mb-1 block font-medium">Nome da Empresa ou Clínica *</label>
              <input 
                value={form.company} 
                onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                required
                className="w-full bg-cs-bg border border-cs-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cs-primary"
              />
            </div>
            <div>
              <label className="text-xs text-cs-text-secondary mb-1 block font-medium">Nome do Contato Principal</label>
              <input 
                value={form.contact} 
                onChange={e => setForm(f => ({ ...f, contact: e.target.value }))}
                className="w-full bg-cs-bg border border-cs-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cs-primary"
              />
            </div>
          </div>

          {/* Dados de Contato Direto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-cs-text-secondary mb-1 block font-medium">Telefone / Celular</label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-3 text-cs-text-secondary" />
                <input 
                  value={form.contact_phone} 
                  onChange={e => setForm(f => ({ ...f, contact_phone: e.target.value }))}
                  placeholder="(35) 99999-9999"
                  className="w-full bg-cs-bg border border-cs-border rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-cs-primary"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-cs-text-secondary mb-1 block font-medium">E-mail Corporativo</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-3 text-cs-text-secondary" />
                <input 
                  type="email"
                  value={form.contact_email} 
                  onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))}
                  placeholder="contato@clinica.com.br"
                  className="w-full bg-cs-bg border border-cs-border rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-cs-primary"
                />
              </div>
            </div>
          </div>

          {/* Valores e Probabilidade */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-cs-bg/40 p-4 rounded-xl border border-cs-border">
            <div>
              <label className="text-xs text-cs-text-secondary mb-1 block font-medium">Valor Mensal Estimado</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-semibold text-green-400">R$</span>
                <input 
                  type="number" 
                  value={form.value} 
                  onChange={e => setForm(f => ({ ...f, value: Number(e.target.value) || 0 }))}
                  className="w-full bg-cs-bg border border-cs-border rounded-lg pl-9 pr-3 py-2 text-sm text-white font-bold text-green-400 focus:outline-none focus:border-cs-primary"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-cs-text-secondary font-medium">Probabilidade</label>
                <span className="text-xs font-bold text-white">{form.probability}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                step="5"
                value={form.probability} 
                onChange={e => setForm(f => ({ ...f, probability: Number(e.target.value) }))}
                className="w-full accent-cs-primary cursor-pointer mt-2"
              />
            </div>

            <div>
              <label className="text-xs text-cs-text-secondary mb-1 block font-medium">Responsável Interno</label>
              <select 
                value={form.assigned_to} 
                onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))}
                className="w-full bg-cs-bg border border-cs-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cs-primary"
              >
                {['Bruno'].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>

          {/* Estágio do Funil */}
          <div>
            <label className="text-xs text-cs-text-secondary mb-2 block font-medium">Estágio Atual do Funil</label>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
              {COLUMNS.map(col => {
                const isSelected = form.status === col.id;
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => handleStageChange(col.id)}
                    className={`py-2 px-2 rounded-lg text-xs font-semibold text-center transition-all border cursor-pointer ${
                      isSelected 
                        ? `${col.color} text-white border-transparent shadow-lg shadow-black/40`
                        : 'bg-cs-bg border-cs-border text-cs-text-secondary hover:text-white hover:border-cs-text-secondary'
                    }`}
                  >
                    {col.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Diagnóstico Comercial & Notas */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-cs-text-secondary font-medium flex items-center gap-1.5">
                <FileText size={14} className="text-cs-primary" /> Diagnóstico Comercial & Notas da Abordagem
              </label>
              <span className="text-[11px] text-cs-text-secondary">Visível na ficha do card</span>
            </div>
            <textarea 
              rows={4}
              value={form.notes} 
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Descreva as dores do lead, links encontrados (GMB, Canva, redes sociais), proposta de valor desenhada e histórico de contatos..."
              className="w-full bg-cs-bg border border-cs-border rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cs-primary custom-scrollbar leading-relaxed"
            />
          </div>

          {/* Informações Estratégicas do Cliente (se sincronizado) */}
          {matchedClient && (
            <div className="bg-cs-bg/30 p-4 rounded-xl border border-cs-border/80 space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Estratégia Registrada no Sistema</h4>
              {matchedClient.value_proposition && (
                <div className="text-xs text-cs-text-secondary">
                  <span className="font-semibold text-white">Proposta de Valor:</span> {matchedClient.value_proposition}
                </div>
              )}
              {matchedClient.target_audience && (
                <div className="text-xs text-cs-text-secondary">
                  <span className="font-semibold text-white">Público-Alvo:</span> {matchedClient.target_audience}
                </div>
              )}
            </div>
          )}

          {/* Botões do Rodapé */}
          <div className="pt-4 border-t border-cs-border flex flex-wrap gap-3 items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (onRequestDelete) {
                  onRequestDelete(deal);
                } else if (onDelete) {
                  onDelete(deal.id);
                  onClose();
                }
              }}
              className="px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 size={14} /> Excluir Negócio
            </button>

            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 border border-cs-border text-cs-text-secondary hover:text-white rounded-lg text-sm transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                disabled={isSaving}
                className="bg-cs-primary hover:bg-cs-primary-hover text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-cs-primary/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 size={16} /> {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CRMView() {
  const { deals, moveDeal, createDeal, updateDeal, deleteDeal, restoreDeal, restoreMissingDefaults } = useDeals();
  const { clients, createClient } = useClients();
  const { createTask } = useTasks();
  const { setContext } = useAIAssistant();
  
  const [showNewDealModal, setShowNewDealModal] = useState(false);
  const [selectedAiDeal, setSelectedAiDeal] = useState(null);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [dealToDelete, setDealToDelete] = useState(null);

  const handleConfirmDelete = () => {
    if (!dealToDelete) return;
    const backup = { ...dealToDelete };
    deleteDeal(dealToDelete.id);
    setDealToDelete(null);
    if (selectedDeal?.id === dealToDelete.id) {
      setSelectedDeal(null);
    }
    toast((t) => (
      <div className="flex items-center gap-3">
        <span className="text-xs">Prospect "{backup.company}" excluído.</span>
        <button
          type="button"
          onClick={() => {
            restoreDeal(backup);
            toast.dismiss(t.id);
          }}
          className="text-xs bg-cs-primary text-black font-bold px-2.5 py-1 rounded-md hover:bg-cs-primary-hover transition-colors cursor-pointer"
        >
          Desfazer
        </button>
      </div>
    ), { duration: 6000 });
  };

  const handleMoveDeal = async (dealId, newStatus) => {
    const deal = deals.find(d => d.id === dealId);
    if (!deal) return;
    
    if (newStatus === 'ganho' && deal.status !== 'ganho') {
      try {
        const newClient = await createClient({
          name: deal.company,
          contact_name: deal.contact,
          contact_email: deal.contact_email || '',
          contact_phone: deal.contact_phone || '',
          monthly_fee: deal.value || 5000,
          brand_color: '#eab308',
          status: 'active',
          tone_of_voice: 'Profissional e Estratégico',
          target_audience: 'Público Qualificado',
          strategic_goals: 'Geração de Demanda e Fortalecimento de Marca'
        });

        const onboardingTasks = generateOnboardingWorkflow(newClient.id, new Date().toISOString());
        for (const t of onboardingTasks) {
          await createTask({
            title: `[ONBOARDING] ${t.title}`,
            client_id: newClient.id,
            client_name: newClient.name,
            tag: 'Campanha',
            priority: t.priority || 'high',
            estimated_hours: 4,
            status: 'em-producao',
            demand_status: 'em_producao',
            deadline: t.due_date,
            description: t.description,
          });
        }
        toast.success(`🎉 Negócio Ganho! Cliente "${deal.company}" cadastrado e onboarding criado.`);
      } catch (error) {
        console.error("Erro no handoff:", error);
      }
    }
    
    await moveDeal(dealId, newStatus);
    if (selectedDeal && selectedDeal.id === dealId) {
      setSelectedDeal(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  useEffect(() => {
    const byStage = Object.fromEntries(
      COLUMNS.map(s => [
        s.id, { 
          count: deals.filter(d => d.status === s.id).length, 
          value: deals.filter(d => d.status === s.id).reduce((a, d) => a + (Number(d.value) || 0), 0) 
        }
      ])
    );
    setContext({
      module: 'crm',
      title: 'CRM & Vendas',
      data: {
        pipeline_total: deals.reduce((a, d) => a + (Number(d.value) || 0), 0),
        total_deals: deals.length,
        por_estagio: byStage,
        deals: deals.map(d => ({ empresa: d.company, valor: d.value, probabilidade: d.probability, estagio: d.status })),
      },
    });
  }, [deals, setContext]);

  return (
    <div className="h-full flex flex-col bg-cs-bg p-6 overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">CRM (Novos Negócios)</h2>
          <p className="text-sm text-cs-text-secondary">Pipeline comercial e acompanhamento de propostas ativas.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={restoreMissingDefaults}
            className="bg-cs-surface hover:bg-cs-surface-hover border border-cs-border text-cs-text-secondary hover:text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Restaurar prospects odontológicos padrão caso algum tenha sido removido por engano"
          >
            <RotateCcw size={14} />
            <span>Restaurar Padrões</span>
          </button>
          <div className="bg-cs-surface border border-cs-border rounded-lg px-4 py-2 flex flex-col items-end">
             <span className="text-xs text-cs-text-secondary">Pipeline Total</span>
             <span className="text-sm font-bold text-green-500">
               {formatCurrency(deals.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0))}
             </span>
          </div>
          <button
            onClick={() => setShowNewDealModal(true)}
            className="bg-cs-primary hover:bg-cs-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-cs-primary/20 flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} /> Novo Negócio
          </button>
        </div>
      </div>

      {/* Kanban Board for CRM */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden flex items-start gap-4 pb-4">
        {COLUMNS.map(column => {
          const colDeals = deals.filter(deal => deal.status === column.id);
          const colValue = colDeals.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
          
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
                {colDeals.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center text-center p-4 border border-dashed border-cs-border/60 rounded-lg">
                    <p className="text-xs text-cs-text-secondary">Nenhum negócio neste estágio.</p>
                  </div>
                ) : (
                  colDeals.map(deal => (
                    <div 
                      key={deal.id} 
                      onClick={() => setSelectedDeal(deal)}
                      className="bg-cs-surface border border-cs-border hover:border-cs-primary/80 p-4 rounded-xl shadow-sm group transition-all duration-200 cursor-pointer hover:shadow-lg relative"
                    >
                      {/* Card Header com Nome e Botão Visível de Abertura */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="p-1.5 rounded-md bg-cs-bg border border-cs-border text-cs-primary shrink-0">
                            <Building2 size={14} />
                          </div>
                          <span className="font-bold text-white text-sm leading-tight hover:text-cs-primary transition-colors truncate">
                            {deal.company}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDeal(deal);
                          }}
                          className="shrink-0 px-2 py-1 text-xs font-semibold text-cs-primary bg-cs-primary/10 hover:bg-cs-primary hover:text-white border border-cs-primary/30 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          title="Abrir ficha completa do prospect"
                        >
                          <FileText size={12} />
                          <span>Ver Ficha</span>
                        </button>
                      </div>
                      
                      {/* Contato & Tags de Comunicação Inteligentes */}
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-cs-text-secondary mb-2">
                        <div className="flex items-center gap-1 mr-1">
                          <User size={12} className="text-cs-text-secondary/70" /> 
                          <span className="truncate max-w-[150px]">{deal.contact || 'Contato'}</span>
                        </div>

                        {deal.contact_phone && (
                          isMobileNumber(deal.contact_phone) ? (
                            <span 
                              onClick={(e) => {
                                e.stopPropagation();
                                openWhatsApp(deal.contact_phone, deal.contact, deal.company);
                              }}
                              className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/20 transition-colors cursor-pointer"
                              title="Conversar no WhatsApp"
                            >
                              <MessageCircle size={10} /> WhatsApp
                            </span>
                          ) : (
                            <span 
                              onClick={(e) => {
                                e.stopPropagation();
                                callPhone(deal.contact_phone);
                              }}
                              className="flex items-center gap-1 text-[10px] font-semibold text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 px-1.5 py-0.5 rounded border border-sky-500/20 transition-colors cursor-pointer"
                              title={`Ligar para telefone fixo (${deal.contact_phone})`}
                            >
                              <Phone size={10} /> Fixo
                            </span>
                          )
                        )}

                        {deal.contact_email && (
                          <span 
                            onClick={(e) => {
                              e.stopPropagation();
                              openEmail(deal.contact_email, deal.contact, deal.company);
                            }}
                            className="flex items-center gap-1 text-[10px] font-semibold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-1.5 py-0.5 rounded border border-blue-500/20 transition-colors cursor-pointer"
                            title="Enviar e-mail"
                          >
                            <Mail size={10} /> E-mail
                          </span>
                        )}
                      </div>

                      {/* Diagnóstico / Anotações do Prospect */}
                      {deal.notes && (
                        <div className="text-xs text-cs-text-secondary bg-cs-bg/70 p-2.5 rounded-lg border border-cs-border/70 my-2.5 leading-relaxed line-clamp-3">
                          <div className="text-[10px] uppercase font-bold text-cs-text-secondary/70 mb-1 tracking-wider flex items-center gap-1">
                            <Sparkles size={10} className="text-cs-primary" /> Diagnóstico Comercial
                          </div>
                          <p className="italic text-zinc-300">{deal.notes}</p>
                        </div>
                      )}
                      
                      {/* Valores e Probabilidade */}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-cs-border/60">
                        <div className="flex items-center gap-1.5 text-green-400 font-bold text-sm">
                          {formatCurrency(deal.value)}
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-cs-bg border border-cs-border">
                          <Percent size={11} className={deal.probability > 60 ? "text-green-500" : deal.probability > 30 ? "text-yellow-500" : "text-red-500"} />
                          <span className="font-semibold text-cs-text-primary">{deal.probability}%</span>
                        </div>
                      </div>

                      {/* Barra de Ações do Card */}
                      <div className="mt-3 pt-2.5 border-t border-cs-border/80 flex items-center gap-1.5">
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDeal(deal);
                          }}
                          className="flex-1 flex justify-center items-center gap-1.5 py-1.5 bg-cs-primary/15 hover:bg-cs-primary hover:text-white border border-cs-primary/30 text-cs-primary rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          title="Abrir ficha completa para visualizar ou editar"
                        >
                          <Edit3 size={12} />
                          <span>Ficha</span>
                        </button>

                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAiDeal(deal);
                          }}
                          className="p-1.5 bg-cs-accent/15 hover:bg-cs-accent/30 border border-cs-accent/30 text-cs-accent rounded-lg transition-colors cursor-pointer"
                          title="Gerar Abordagem de Prospecção via IA"
                        >
                          <Sparkles size={13} />
                        </button>

                        {deal.contact_phone && (
                          isMobileNumber(deal.contact_phone) ? (
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openWhatsApp(deal.contact_phone, deal.contact, deal.company);
                              }}
                              className="p-1.5 bg-cs-bg hover:bg-emerald-500/20 border border-cs-border hover:border-emerald-500/30 text-cs-text-secondary hover:text-emerald-400 rounded-lg transition-colors cursor-pointer"
                              title="Conversar no WhatsApp"
                            >
                              <MessageCircle size={13} />
                            </button>
                          ) : (
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                callPhone(deal.contact_phone);
                              }}
                              className="p-1.5 bg-cs-bg hover:bg-sky-500/20 border border-cs-border hover:border-sky-500/30 text-cs-text-secondary hover:text-sky-400 rounded-lg transition-colors cursor-pointer"
                              title={`Ligar para fixo (${deal.contact_phone})`}
                            >
                              <Phone size={13} />
                            </button>
                          )
                        )}

                        {deal.contact_email && (
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEmail(deal.contact_email, deal.contact, deal.company);
                            }}
                            className="p-1.5 bg-cs-bg hover:bg-blue-500/20 border border-cs-border hover:border-blue-500/30 text-cs-text-secondary hover:text-blue-400 rounded-lg transition-colors cursor-pointer"
                            title={`Enviar e-mail para ${deal.contact_email}`}
                          >
                            <Mail size={13} />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDealToDelete(deal);
                          }}
                          className="p-1.5 bg-cs-bg hover:bg-red-500/20 border border-cs-border hover:border-red-500/30 text-cs-text-secondary hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                          title="Excluir prospect do CRM"
                        >
                          <Trash2 size={13} />
                        </button>

                        {/* Botões de Avanço / Retrocesso no Funil */}
                        {(() => {
                          const currentIndex = COLUMNS.findIndex(c => c.id === deal.status);
                          return (
                            <>
                              {currentIndex > 0 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveDeal(deal.id, COLUMNS[currentIndex - 1].id);
                                  }}
                                  className="p-1.5 bg-cs-bg hover:bg-cs-surface-hover border border-cs-border text-cs-text-secondary hover:text-white rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                                  title="Retroceder estágio"
                                >
                                  <ChevronLeft size={13} />
                                </button>
                              )}
                              {deal.status !== 'ganho' && deal.status !== 'perdido' && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveDeal(deal.id, COLUMNS[currentIndex + 1].id);
                                  }}
                                  className="p-1.5 bg-cs-primary/20 text-cs-primary hover:bg-cs-primary hover:text-white border border-cs-primary/30 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                                  title="Avançar estágio"
                                >
                                  <ChevronRight size={13} />
                                </button>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Detalhes e Edição do Negócio Selecionado */}
      {selectedDeal && (
        <DealDetailModal
          key={selectedDeal.id}
          deal={selectedDeal}
          clients={clients}
          onClose={() => setSelectedDeal(null)}
          onUpdate={updateDeal}
          onDelete={deleteDeal}
          onRequestDelete={(deal) => setDealToDelete(deal)}
          onMoveStage={handleMoveDeal}
          onOpenAi={(deal) => setSelectedAiDeal(deal)}
        />
      )}

      {/* Modal de Confirmação Segura de Exclusão */}
      {dealToDelete && (
        <DeleteConfirmModal
          deal={dealToDelete}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDealToDelete(null)}
        />
      )}

      {/* AI Prospecting Copilot Modal */}
      {selectedAiDeal && (
        <AIProspectingModal
          deal={selectedAiDeal}
          onClose={() => setSelectedAiDeal(null)}
        />
      )}

      {/* Modal de Novo Negócio */}
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
      const prompt = `Você é o Diretor Comercial da agência Comunicação Social Ag (CS Ag), Poços de Caldas - MG.
Crie um material de prospecção ${copyType === 'email' ? 'E-mail de Cold Outreach' : copyType === 'whatsapp' ? 'Mensagem curta e humana de WhatsApp' : 'Pitch Comercial de 1 minuto para ligação'} para o cliente:
- Empresa: ${deal.company}
- Contato: ${deal.contact || 'Prezado(a)'}
- Telefone: ${deal.contact_phone || 'Não informado'}
- Diagnóstico identificado: ${deal.notes || 'Sem observações prévias'}
- Ticket Estimado: R$ ${deal.value || 1800}/mês

Diretrizes obrigatórias:
1. Tom consultivo, direto e sem clichês de agência tradicional.
2. Gancho baseado no diagnóstico real (ex: falta de site próprio, dependência de linktree ou canva, potencial de implantes ou odontologia especializada em Poços de Caldas).
3. Convidar para uma conversa rápida de 15 minutos sem compromisso.`;

      const text = await generateContent(prompt);
      setGeneratedText(text);
    } catch {
      setGeneratedText(`Olá ${deal.contact || 'Doutor(a)'}! Tudo bem?\n\nAcompanho a presença da ${deal.company} aqui em Poços de Caldas e notei que podemos fortalecer o posicionamento digital de vocês para captação de pacientes qualificados.\n\nPodemos marcar um café ou conversa de 15 minutos nesta semana?\n\nUm abraço,\nBruno | CS Ag`);
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
    toast.success('Abordagem copiada para a área de transferência!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={onClose}>
      <div className="bg-cs-surface border border-cs-border rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-cs-border flex items-center justify-between bg-cs-bg/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cs-accent/20 text-cs-accent border border-cs-accent/30">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">IA Outbound Copilot: Prospecção</h3>
              <p className="text-xs text-cs-text-secondary">{deal.company} ({deal.contact || 'Contato'})</p>
            </div>
          </div>
          <button onClick={onClose} className="text-cs-text-secondary hover:text-white transition-colors cursor-pointer"><X size={20} /></button>
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
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
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
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-cs-text-secondary hover:text-white uppercase tracking-wider cursor-pointer">Fechar</button>
          <div className="flex gap-2">
            {deal.contact_phone && copyType === 'whatsapp' && (
              <button
                onClick={() => {
                  const clean = deal.contact_phone.replace(/\D/g, '');
                  const number = clean.length === 10 || clean.length === 11 ? `55${clean}` : clean;
                  window.open(`https://wa.me/${number}?text=${encodeURIComponent(generatedText)}`, '_blank');
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20"
              >
                <MessageCircle size={16} /> Abrir no WhatsApp
              </button>
            )}
            <button
              onClick={handleCopy}
              className="bg-cs-accent hover:bg-cs-accent/80 text-black px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-xl shadow-cs-accent/20 flex items-center gap-2 cursor-pointer"
            >
              <Copy size={16} /> {copied ? 'Copiado!' : 'Copiar Texto'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
