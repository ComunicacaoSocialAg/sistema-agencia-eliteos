import { useState } from 'react';
import { X, Building2, CircleDollarSign, Share2, Bot, Save, Palette } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../utils/cn';
import { buildClientBrandPayload, getClientBrandKit, normalizeHexColor } from '../lib/brandKit';
import { LIFECYCLE_STAGE_META as LIFECYCLE_STAGES, normalizeLifecycleStage } from '../lib/lifecycle';

export default function ClientConfigModal({ client, onClose, onSave }) {
  const brandKit = getClientBrandKit(client);
  const [activeTab, setActiveTab] = useState('geral');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    id: client.id,
    name: client.name || '',
    document_id: client.document_id || '',
    contact_name: client.contact_name || '',
    contact_email: client.contact_email || '',
    contact_phone: client.contact_phone || '',
    monthly_fee: client.monthly_fee || 0,
    monthly_hours_contracted: client.monthly_hours_contracted || 10,
    billing_day: client.billing_day || '10',
    contract_start_date: client.contract_start_date || '',
    primary_color: brandKit.primary_color,
    secondary_color: brandKit.secondary_color,
    accent_color: brandKit.accent_color,
    typography: brandKit.typography,
    logo_url: brandKit.logo_url,
    keywordsText: brandKit.keywords.join(', '),
    drive_url: brandKit.drive_url,
    website: brandKit.website,
    instagram: brandKit.instagram,
    reportei_url: client.reportei_url || '',
    reportei_config: client.reportei_config || { project_id: '' },
    tone_of_voice: client.tone_of_voice || '',
    target_audience: client.target_audience || '',
    value_proposition: client.value_proposition || '',
    strategic_goals: client.strategic_goals || '',
    ai_instructions: client.ai_instructions || '',
    status: client.status || 'active',
    lifecycle_stage: normalizeLifecycleStage(client.lifecycle_stage || 'onboarding'),
  });

  const setField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('O nome do cliente é obrigatório.');
      return;
    }

    let reportei_config = form.reportei_config;
    if (form.reportei_url && !reportei_config?.project_id) {
      reportei_config = { ...reportei_config, project_id: form.reportei_url.trim() };
    }

    setSaving(true);
    try {
      const withBrand = buildClientBrandPayload(client, {
        ...form,
        keywords: form.keywordsText,
      });
      const saved = await onSave({
        ...withBrand,
        name: form.name.trim(),
        document_id: form.document_id.trim(),
        contact_name: form.contact_name.trim(),
        contact_email: form.contact_email.trim(),
        contact_phone: form.contact_phone.trim(),
        monthly_fee: Number(form.monthly_fee) || 0,
        monthly_hours_contracted: Number(form.monthly_hours_contracted) || 10,
        billing_day: form.billing_day,
        contract_start_date: form.contract_start_date,
        target_audience: form.target_audience,
        value_proposition: form.value_proposition,
        strategic_goals: form.strategic_goals,
        status: form.status,
        lifecycle_stage: form.lifecycle_stage,
        reportei_url: form.reportei_url,
        reportei_config,
      });
      if (saved) onClose();
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'geral', label: 'Dados Gerais', icon: Building2 },
    { id: 'marca', label: 'Brand Kit', icon: Palette },
    { id: 'financeiro', label: 'Contrato & Fee', icon: CircleDollarSign },
    { id: 'integracoes', label: 'Drive & Canais', icon: Share2 },
    { id: 'ai', label: 'DNA & IA', icon: Bot },
  ];

  const colorPreview = normalizeHexColor(form.primary_color, '#3b82f6');

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-cs-surface border border-cs-border rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-cs-border flex items-center justify-between bg-cs-bg/50 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md"
              style={{ backgroundColor: colorPreview }}
            >
              {form.name.charAt(0) || 'C'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Configurações do Cliente</h2>
              <p className="text-xs text-cs-text-secondary">Edite parâmetros operacionais e Brand Kit de {form.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-cs-text-secondary hover:text-white rounded-xl hover:bg-cs-bg transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-cs-border px-4 bg-cs-bg/30 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all relative border-b-2 whitespace-nowrap cursor-pointer',
                activeTab === tab.id
                  ? 'border-cs-primary text-cs-primary'
                  : 'border-transparent text-cs-text-secondary hover:text-white'
              )}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {activeTab === 'geral' && (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Nome do Cliente / Marca *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cs-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">CNPJ / CPF / CRM</label>
                  <input
                    type="text"
                    value={form.document_id}
                    onChange={(e) => setField('document_id', e.target.value)}
                    className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cs-primary"
                    placeholder="00.000.000/0001-00"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Estágio do Ciclo</label>
                  <select
                    value={form.lifecycle_stage}
                    onChange={(e) => setField('lifecycle_stage', e.target.value)}
                    className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cs-primary"
                  >
                    {LIFECYCLE_STAGES.map(stage => (
                      <option key={stage.id} value={stage.id}>{stage.label} ({stage.description})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-cs-border/50">
                <h4 className="text-xs font-bold text-white mb-3 uppercase tracking-wider">Contato Principal na Empresa</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Nome do Contato</label>
                    <input
                      type="text"
                      value={form.contact_name}
                      onChange={(e) => setField('contact_name', e.target.value)}
                      className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cs-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">E-mail</label>
                    <input
                      type="email"
                      value={form.contact_email}
                      onChange={(e) => setField('contact_email', e.target.value)}
                      className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cs-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">WhatsApp / Fone</label>
                    <input
                      type="text"
                      value={form.contact_phone}
                      onChange={(e) => setField('contact_phone', e.target.value)}
                      className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cs-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'marca' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { key: 'primary_color', label: 'Cor Primária' },
                  { key: 'secondary_color', label: 'Cor Secundária' },
                  { key: 'accent_color', label: 'Cor de Destaque' },
                ].map(item => (
                  <div key={item.key} className="bg-cs-bg border border-cs-border rounded-2xl p-3 space-y-2">
                    <label className="text-[10px] font-bold text-cs-text-secondary uppercase block">{item.label}</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={normalizeHexColor(form[item.key], '#3b82f6')}
                        onChange={(e) => setField(item.key, e.target.value)}
                        className="w-10 h-10 rounded-xl bg-transparent border border-cs-border cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={form[item.key]}
                        onChange={(e) => setField(item.key, e.target.value)}
                        className="w-full bg-cs-surface border border-cs-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cs-primary font-mono uppercase"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Tipografia Oficial</label>
                  <input
                    type="text"
                    value={form.typography}
                    onChange={(e) => setField('typography', e.target.value)}
                    placeholder="Ex: Montserrat + Inter"
                    className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cs-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">URL do Logotipo</label>
                  <input
                    type="url"
                    value={form.logo_url}
                    onChange={(e) => setField('logo_url', e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cs-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Palavras-Chave da Marca (separadas por vírgula)</label>
                <input
                  type="text"
                  value={form.keywordsText}
                  onChange={(e) => setField('keywordsText', e.target.value)}
                  placeholder="Ex: Cirurgia Vascular, Laser Transdérmico, Poços de Caldas"
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cs-primary"
                />
              </div>
            </div>
          )}

          {activeTab === 'financeiro' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Fee Mensal (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.monthly_fee}
                    onChange={(e) => setField('monthly_fee', e.target.value)}
                    className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cs-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Horas Contratadas / Mês</label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={form.monthly_hours_contracted}
                    onChange={(e) => setField('monthly_hours_contracted', e.target.value)}
                    className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cs-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Dia de Vencimento</label>
                  <select
                    value={form.billing_day}
                    onChange={(e) => setField('billing_day', e.target.value)}
                    className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cs-primary"
                  >
                    <option value="05">Dia 05</option>
                    <option value="10">Dia 10</option>
                    <option value="15">Dia 15</option>
                    <option value="20">Dia 20</option>
                    <option value="25">Dia 25</option>
                    <option value="30">Dia 30</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Início do Contrato</label>
                  <input
                    type="date"
                    value={form.contract_start_date}
                    onChange={(e) => setField('contract_start_date', e.target.value)}
                    className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cs-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Status do Cliente</label>
                <select
                  value={form.status}
                  onChange={(e) => setField('status', e.target.value)}
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cs-primary"
                >
                  <option value="active">Ativo (Em Operação)</option>
                  <option value="inactive">Inativo (Pausado / Encerrado)</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'integracoes' && (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">
                  Link da Pasta no Google Drive do Cliente
                </label>
                <input
                  type="url"
                  value={form.drive_url}
                  onChange={(e) => setField('drive_url', e.target.value)}
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cs-primary"
                  placeholder="https://drive.google.com/drive/folders/..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Instagram (@)</label>
                  <input
                    type="text"
                    value={form.instagram}
                    onChange={(e) => setField('instagram', e.target.value)}
                    placeholder="@empresa"
                    className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cs-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Website</label>
                  <input
                    type="url"
                    value={form.website}
                    onChange={(e) => setField('website', e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cs-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">
                  ID do Projeto / Link no Reportei
                </label>
                <input
                  type="text"
                  value={form.reportei_url || form.reportei_config?.project_id || ''}
                  onChange={(e) => {
                    setField('reportei_url', e.target.value);
                    setField('reportei_config', { ...form.reportei_config, project_id: e.target.value });
                  }}
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cs-primary"
                  placeholder="Ex: 987654"
                />
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Tom de Voz da Marca</label>
                <input
                  type="text"
                  value={form.tone_of_voice}
                  onChange={(e) => setField('tone_of_voice', e.target.value)}
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cs-primary"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Público-Alvo Principal</label>
                <input
                  type="text"
                  value={form.target_audience}
                  onChange={(e) => setField('target_audience', e.target.value)}
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cs-primary"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Proposta de Valor / Diferenciais</label>
                <input
                  type="text"
                  value={form.value_proposition}
                  onChange={(e) => setField('value_proposition', e.target.value)}
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cs-primary"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Objetivos Estratégicos</label>
                <input
                  type="text"
                  value={form.strategic_goals}
                  onChange={(e) => setField('strategic_goals', e.target.value)}
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cs-primary"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Instruções Customizadas & Compliance (IA)</label>
                <textarea
                  rows={3}
                  value={form.ai_instructions}
                  onChange={(e) => setField('ai_instructions', e.target.value)}
                  className="w-full bg-cs-bg border border-cs-border rounded-xl p-4 text-xs text-white focus:outline-none focus:border-cs-primary resize-none"
                  placeholder="Regras de conselho profissional, palavras proibidas e diretrizes de copywriting..."
                />
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-cs-border flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-cs-border text-cs-text-secondary hover:text-white transition-colors text-xs font-bold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-cs-primary hover:bg-cs-primary-hover text-black px-6 py-2.5 rounded-xl font-extrabold text-xs transition-all shadow-lg shadow-cs-primary/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save size={16} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
