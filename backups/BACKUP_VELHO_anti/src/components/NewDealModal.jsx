import { useState } from 'react';
import { X, DollarSign, Percent, Phone, Mail } from 'lucide-react';

const STAGES = [
  { id: 'prospeccao', label: 'Prospecção' },
  { id: 'qualificacao', label: 'Qualificação' },
  { id: 'proposta', label: 'Proposta' },
  { id: 'negociacao', label: 'Negociação' },
  { id: 'ganho', label: 'Ganho' },
];

export default function NewDealModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    company: '',
    contact: '',
    contact_email: '',
    contact_phone: '',
    value: '',
    probability: 20,
    status: 'prospeccao',
    notes: '',
    assigned_to: 'Deise',
  });

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = () => {
    if (!form.company.trim()) return;
    onSave({ ...form, value: parseFloat(form.value) || 0 });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-cs-surface border border-cs-border rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-cs-border flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Novo Negócio</h2>
          <button onClick={onClose} className="text-cs-text-secondary hover:text-white p-1"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-cs-text-secondary uppercase tracking-wider mb-1.5 block">Empresa *</label>
              <input type="text" value={form.company} onChange={e => set('company', e.target.value)}
                placeholder="Nome da empresa" autoFocus
                className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cs-primary transition-colors placeholder:text-cs-text-secondary/50" />
            </div>

            <div>
              <label className="text-xs font-semibold text-cs-text-secondary uppercase tracking-wider mb-1.5 block">Contato</label>
              <input type="text" value={form.contact} onChange={e => set('contact', e.target.value)}
                placeholder="Nome do contato"
                className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cs-primary transition-colors placeholder:text-cs-text-secondary/50" />
            </div>

            <div>
              <label className="text-xs font-semibold text-cs-text-secondary uppercase tracking-wider mb-1.5 block">Estágio</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}
                className="w-full bg-cs-bg border border-cs-border rounded-xl px-3 py-3 text-white text-sm focus:outline-none focus:border-cs-primary transition-colors">
                {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-cs-text-secondary uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                <Mail size={12} /> E-mail
              </label>
              <input type="email" value={form.contact_email} onChange={e => set('contact_email', e.target.value)}
                placeholder="email@empresa.com"
                className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cs-primary transition-colors placeholder:text-cs-text-secondary/50" />
            </div>

            <div>
              <label className="text-xs font-semibold text-cs-text-secondary uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                <Phone size={12} /> Telefone
              </label>
              <input type="text" value={form.contact_phone} onChange={e => set('contact_phone', e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cs-primary transition-colors placeholder:text-cs-text-secondary/50" />
            </div>

            <div>
              <label className="text-xs font-semibold text-cs-text-secondary uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                <DollarSign size={12} /> Valor (R$)
              </label>
              <input type="number" value={form.value} onChange={e => set('value', e.target.value)}
                placeholder="0,00"
                className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cs-primary transition-colors placeholder:text-cs-text-secondary/50" />
            </div>

            <div>
              <label className="text-xs font-semibold text-cs-text-secondary uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                <Percent size={12} /> Probabilidade: {form.probability}%
              </label>
              <input type="range" min={0} max={100} step={10} value={form.probability} onChange={e => set('probability', parseInt(e.target.value))}
                className="w-full h-2 bg-cs-bg rounded-full accent-cs-primary mt-2" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-cs-text-secondary uppercase tracking-wider mb-1.5 block">Observações</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
              placeholder="Contexto, dores do cliente, próximos passos..."
              rows={2}
              className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cs-primary transition-colors resize-none placeholder:text-cs-text-secondary/50" />
          </div>
        </div>

        <div className="p-6 border-t border-cs-border flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-cs-bg border border-cs-border hover:bg-cs-surface-hover text-cs-text-secondary hover:text-white rounded-xl text-sm font-medium transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={!form.company.trim()}
            className="flex-1 py-2.5 bg-cs-primary hover:bg-cs-primary-hover disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-cs-primary/20">
            Criar Negócio
          </button>
        </div>
      </div>
    </div>
  );
}
