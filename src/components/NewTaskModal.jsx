import { useState, useEffect } from 'react';
import { X, Calendar, User, Tag, AlignLeft, Sparkles, Plus, Zap, Clock } from 'lucide-react';
import { useTeam } from '../hooks/useTeam';
import { useClients } from '../hooks/useClients';
import { cn } from '../utils/cn';
import { supabase } from '../lib/supabase';
import { chatWithAgent } from '../lib/gemini';
import toast from 'react-hot-toast';

const TAGS = ['Social Media', 'Branding', 'Vídeo', 'Web', 'Campanha'];

export default function NewTaskModal({ onClose, onSave, initialClient }) {
  const { team = [] } = useTeam() || {};
  const { clients = [] } = useClients() || {};
  const [form, setForm] = useState({
    title: '',
    client_id: initialClient?.id || '',
    client_name: initialClient?.name || '',
    assigned_to: 'Bruno',
    assigned_to_id: '',
    status: 'backlog',
    deadline: '',
    tag: 'Social Media',
    notes: '',
    estimated_hours: 1.0
  });

  const [isParsing, setIsParsing] = useState(false);
  const [rawText, setRawText] = useState('');
  const [showMagic, setShowMagic] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [suggestedChecklist, setSuggestedChecklist] = useState([]);

  useEffect(() => {
    async function loadTemplates() {
      if (!supabase) return;
      const { data } = await supabase.from('task_templates').select('*');
      setTemplates(data || []);
    }
    loadTemplates();
  }, []);

  const set = (field, value) => {
    const safeClients = Array.isArray(clients) ? clients : [];
    const safeTeam = Array.isArray(team) ? team : [];

    if (field === 'client_id') {
      const client = safeClients.find(c => c.id === value);
      setForm(prev => ({ ...prev, client_id: value, client_name: client?.name || '' }));
    } else if (field === 'assigned_to_id') {
       const member = safeTeam.find(m => m.id === value);
       setForm(prev => ({ ...prev, assigned_to_id: value, assigned_to: member?.name || 'Bruno' }));
    } else {
      setForm(prev => ({ ...prev, [field]: value }));
    }
  };

  const applyTemplate = (templateId) => {
    const t = templates.find(item => item.id === templateId);
    if (t) {
      setForm(prev => ({ ...prev, tag: t.tag }));
      if (t.checklists) {
        setSuggestedChecklist(t.checklists.map(label => ({ id: crypto.randomUUID(), label, is_done: false })));
      }
      toast.success(`Template de ${t.tag} aplicado!`);
    }
  };

  const handleMagicBriefing = async () => {
    if (!rawText.trim()) return;
    setIsParsing(true);
    try {
      const prompt = `Extraia os dados para uma tarefa de agência a partir deste texto: "${rawText}". 
      Seja inteligente: se o texto mencionar prazos, sugira um título claro.
      Retorne APENAS um JSON no formato: 
      { "title": "...", "notes": "...", "tag": "Social Media/Branding/Vídeo/Web/Campanha", "checklist": ["item1", "item2"] }`;
      
      const response = await chatWithAgent('brief', [], prompt);
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        setForm(prev => ({
          ...prev,
          title: data.title || prev.title,
          notes: data.notes || prev.notes,
          tag: data.tag || prev.tag
        }));
        if (data.checklist) {
          setSuggestedChecklist(data.checklist.map(label => ({ id: crypto.randomUUID(), label, is_done: false })));
        }
        toast.success('IA estruturou a demanda com sucesso!');
        setShowMagic(false);
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro ao processar briefing.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    if (!form.title.trim() || !form.client_id) {
      toast.error('Preencha o título e o cliente.');
      return;
    }
    onSave({ ...form, checklist: suggestedChecklist });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-cs-bg/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-cs-surface border border-cs-border w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 my-auto" onClick={e => e.stopPropagation()}>
        <div className="p-10 space-y-10">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-cs-primary flex items-center justify-center shadow-lg shadow-cs-primary/30">
                <Plus size={28} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Nova Demanda de Elite</h2>
                <p className="text-xs text-cs-text-secondary">Preencha ou use o Briefing Mágico.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select 
                onChange={(e) => applyTemplate(e.target.value)}
                className="bg-cs-bg border border-cs-border text-[10px] font-bold text-cs-text-secondary px-4 py-2 rounded-xl focus:outline-none focus:border-cs-primary uppercase tracking-widest cursor-pointer hover:bg-white/5 transition-all"
              >
                <option value="">⚙️ TEMPLATES</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.tag}</option>)}
              </select>
              <button 
                onClick={() => setShowMagic(!showMagic)}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg",
                  showMagic ? "bg-cs-primary text-white" : "bg-cs-bg text-cs-primary border border-cs-primary/30 hover:bg-cs-primary/10"
                )}
              >
                <Zap size={14} className={showMagic ? "fill-white" : "fill-cs-primary"} /> 
                {showMagic ? 'FECHAR MÁGICO' : 'BRIEFING MÁGICO'}
              </button>
            </div>
          </div>

          {showMagic && (
            <div className="bg-gradient-to-br from-cs-primary/10 to-cs-accent/10 border border-cs-primary/20 rounded-2xl p-6 space-y-4 animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest">Cole o pedido bruto do cliente</label>
                <Sparkles size={16} className="text-cs-primary animate-pulse" />
              </div>
              <textarea
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                placeholder="Ex: Bruno, preciso de 1 carrossel educativo sobre varizes e dor nas pernas para o Dr. Alberto até sexta..."
                className="w-full bg-cs-bg/50 border border-cs-border rounded-xl p-4 text-sm text-white focus:outline-none focus:border-cs-primary h-32 resize-none"
              />
              <button 
                onClick={handleMagicBriefing}
                disabled={isParsing}
                className="w-full bg-white text-cs-bg hover:bg-cs-primary hover:text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isParsing ? 'PROCESSANDO...' : 'TRANSFORMAR EM TAREFA'}
              </button>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest mb-2 block">Título da Demanda</label>
              <input
                type="text"
                value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder="Ex: Campanha de Lançamento Verão 2024"
                className="w-full bg-cs-bg border border-cs-border rounded-2xl px-6 py-4 text-white text-lg font-semibold focus:outline-none focus:border-cs-primary transition-all placeholder:text-cs-text-secondary/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest mb-2 block flex items-center gap-2">
                  <User size={12} className="text-cs-primary" /> Cliente
                </label>
                <select
                  value={form.client_id}
                  onChange={e => set('client_id', e.target.value)}
                  className="w-full bg-cs-bg border border-cs-border rounded-2xl px-4 py-4 text-white text-sm focus:outline-none focus:border-cs-primary transition-all appearance-none cursor-pointer"
                >
                  <option value="">Selecionar...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest mb-2 block">Responsável</label>
                <select
                  value={form.assigned_to_id}
                  onChange={e => set('assigned_to_id', e.target.value)}
                  className="w-full bg-cs-bg border border-cs-border rounded-2xl px-4 py-4 text-white text-sm focus:outline-none focus:border-cs-primary transition-all appearance-none cursor-pointer"
                >
                  <option value="">Selecionar...</option>
                  {team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest mb-2 block flex items-center gap-2">
                  <Tag size={12} className="text-cs-primary" /> Categoria
                </label>
                <select
                  value={form.tag}
                  onChange={e => set('tag', e.target.value)}
                  className="w-full bg-cs-bg border border-cs-border rounded-2xl px-4 py-4 text-white text-sm focus:outline-none focus:border-cs-primary transition-all appearance-none cursor-pointer"
                >
                  {TAGS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest mb-2 block flex items-center gap-2">
                  <Clock size={12} className="text-cs-primary" /> Estimativa (h)
                </label>
                <input
                  type="number"
                  value={form.estimated_hours}
                  onChange={e => set('estimated_hours', parseFloat(e.target.value))}
                  className="w-full bg-cs-bg border border-cs-border rounded-2xl px-4 py-4 text-white text-sm focus:outline-none focus:border-cs-primary transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest mb-2 block flex items-center gap-2">
                  <Calendar size={12} className="text-cs-primary" /> Data de Entrega
                </label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={e => set('deadline', e.target.value)}
                  className="w-full bg-cs-bg border border-cs-border rounded-2xl px-4 py-4 text-white text-sm focus:outline-none focus:border-cs-primary transition-all cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest mb-2 block flex items-center gap-2">
                <AlignLeft size={12} className="text-cs-primary" /> Briefing Inicial / Notas
              </label>
              <textarea
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                placeholder="Descreva o que deve ser feito, links de referência, etc..."
                rows={3}
                className="w-full bg-cs-bg border border-cs-border rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-cs-primary transition-all resize-none placeholder:text-cs-text-secondary/30"
              />
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-cs-border flex gap-4 bg-cs-bg/20">
          <button onClick={onClose} className="flex-1 py-4 bg-transparent border border-cs-border hover:bg-white/5 text-cs-text-secondary hover:text-white rounded-2xl text-xs font-bold uppercase tracking-widest transition-all">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!form.title.trim() || !form.client_id}
            className="flex-1 py-4 bg-cs-primary hover:bg-cs-primary-hover disabled:opacity-30 disabled:grayscale text-white rounded-2xl text-xs font-bold uppercase tracking-widest transition-all shadow-xl shadow-cs-primary/20 flex items-center justify-center gap-2"
          >
            <Sparkles size={16} /> CRIAR TAREFA
          </button>
        </div>
      </div>
    </div>
  );
}
