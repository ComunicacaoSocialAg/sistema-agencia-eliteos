import { useState } from 'react';
import { Sparkles, FileText, Download, Send, CheckSquare, Plus, Trash2 } from 'lucide-react';
import { cn } from '../utils/cn';

export default function BriefingForm({ initialData, onSave, onGeneratePDF }) {
  const [form, setForm] = useState(initialData || {
    title: '',
    objective: '',
    target_audience: '',
    tone_of_voice: '',
    channels: [],
    deliverables: [],
    deadline: ''
  });

  const [newDeliverable, setNewDeliverable] = useState('');

  const addDeliverable = () => {
    if (!newDeliverable.trim()) return;
    setForm(f => ({ ...f, deliverables: [...f.deliverables, newDeliverable.trim()] }));
    setNewDeliverable('');
  };

  return (
    <div className="bg-cs-surface border border-cs-border rounded-3xl p-8 space-y-8 max-w-3xl mx-auto shadow-2xl">
      <div className="flex items-center justify-between border-b border-cs-border pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-cs-primary/10 rounded-2xl flex items-center justify-center text-cs-primary">
            <FileText size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Briefing Estruturado</h2>
            <p className="text-sm text-cs-text-secondary">Defina os parâmetros criativos do projeto.</p>
          </div>
        </div>
        <button 
          onClick={onGeneratePDF}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-cs-border text-cs-text-secondary hover:text-white hover:border-white transition-all text-sm font-medium"
        >
          <Download size={16} /> Exportar PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest block mb-2">Título do Projeto</label>
          <input 
            type="text" 
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cs-primary"
            placeholder="Ex: Campanha Dia dos Namorados 2026"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest block mb-2">Objetivo Principal</label>
          <textarea 
            rows={3}
            value={form.objective}
            onChange={e => setForm(f => ({ ...f, objective: e.target.value }))}
            className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cs-primary resize-none"
            placeholder="O que esperamos alcançar?"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest block mb-2">Público-Alvo</label>
          <textarea 
            rows={3}
            value={form.target_audience}
            onChange={e => setForm(f => ({ ...f, target_audience: e.target.value }))}
            className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cs-primary resize-none"
            placeholder="Para quem estamos falando?"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-widest block mb-2">Checklist de Entregáveis</label>
          <div className="space-y-2 mb-3">
            {form.deliverables.map((d, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-cs-bg border border-cs-border rounded-xl group">
                <div className="flex items-center gap-3">
                  <CheckSquare size={16} className="text-cs-primary" />
                  <span className="text-sm text-white">{d}</span>
                </div>
                <button 
                  onClick={() => setForm(f => ({ ...f, deliverables: f.deliverables.filter((_, idx) => idx !== i) }))}
                  className="p-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={newDeliverable}
              onChange={e => setNewDeliverable(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addDeliverable()}
              className="flex-1 bg-cs-bg border border-cs-border rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cs-primary"
              placeholder="Adicionar peça (Ex: 3x Stories, 1x Carrossel)..."
            />
            <button 
              onClick={addDeliverable}
              className="bg-cs-surface border border-cs-border text-white p-2 rounded-xl hover:bg-cs-primary transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-cs-border flex justify-end gap-3">
        <button 
          onClick={() => onSave(form)}
          className="bg-cs-primary hover:bg-cs-primary-hover text-white px-8 py-3 rounded-2xl font-bold text-sm transition-all shadow-xl shadow-cs-primary/20 flex items-center gap-2"
        >
          <Send size={18} /> Salvar e Iniciar Produção
        </button>
      </div>
    </div>
  );
}
