import { useState } from 'react';
import { X, Building2, CircleDollarSign, Share2, Bot, Save, Trash2, Check, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../utils/cn';

export default function ClientConfigModal({ client, onClose, onSave }) {
  const [activeTab, setActiveTab] = useState('geral');
  const [form, setForm] = useState({
    id: client.id,
    name: client.name || '',
    document_id: client.document_id || '',
    contact_name: client.contact_name || '',
    contact_email: client.contact_email || '',
    contact_phone: client.contact_phone || '',
    monthly_fee: client.monthly_fee || 0,
    billing_day: client.billing_day || '10',
    contract_start_date: client.contract_start_date || '',
    brand_color: client.brand_color || '#3b82f6',
    drive_url: client.drive_url || '',
    reportei_url: client.reportei_url || '',
    reportei_config: client.reportei_config || { project_id: '' },
    tone_of_voice: client.tone_of_voice || '',
    target_audience: client.target_audience || '',
    strategic_goals: client.strategic_goals || '',
    ai_instructions: client.ai_instructions || '',
    status: client.status || 'active'
  });

  const setField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('O nome do cliente é obrigatório.');
      return;
    }
    
    // Garantir que a estrutura de reportei_config contenha project_id se reportei_url for preenchido
    let reportei_config = form.reportei_config;
    if (form.reportei_url && !reportei_config?.project_id) {
      reportei_config = { project_id: form.reportei_url.trim() };
    }

    onSave({
      ...form,
      monthly_fee: Number(form.monthly_fee) || 0,
      reportei_config
    });
    toast.success('Configurações do cliente salvas com sucesso!');
    onClose();
  };

  const tabs = [
    { id: 'geral', label: 'Dados Gerais', icon: Building2 },
    { id: 'financeiro', label: 'Financeiro', icon: CircleDollarSign },
    { id: 'integracoes', label: 'Drive & Reportei', icon: Share2 },
    { id: 'ai', label: 'Instruções da IA', icon: Bot },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-cs-surface border border-cs-border rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-cs-border flex items-center justify-between bg-cs-bg/50 shrink-0">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md"
              style={{ backgroundColor: form.brand_color || '#3b82f6' }}
            >
              {form.name.charAt(0) || 'C'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Configurações do Cliente</h2>
              <p className="text-xs text-cs-text-secondary">Edite os parâmetros operacionais de {form.name}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-cs-text-secondary hover:text-white rounded-xl hover:bg-cs-bg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-cs-border px-6 bg-cs-bg/30 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all relative border-b-2",
                activeTab === tab.id
                  ? "border-cs-primary text-cs-primary"
                  : "border-transparent text-cs-text-secondary hover:text-white"
              )}
            >
              <tab.icon size={16} />
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
                  placeholder="Ex: Dubola Molhos Especiais"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">CNPJ / CPF</label>
                  <input
                    type="text"
                    value={form.document_id}
                    onChange={(e) => setField('document_id', e.target.value)}
                    className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cs-primary"
                    placeholder="00.000.000/0001-00"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Cor Identidade (Hex)</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={form.brand_color}
                      onChange={(e) => setField('brand_color', e.target.value)}
                      className="w-10 h-10 rounded-xl bg-transparent border border-cs-border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={form.brand_color}
                      onChange={(e) => setField('brand_color', e.target.value)}
                      className="flex-1 bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cs-primary font-mono uppercase"
                    />
                  </div>
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
                      placeholder="Ex: Roberto Silva"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">E-mail</label>
                    <input
                      type="email"
                      value={form.contact_email}
                      onChange={(e) => setField('contact_email', e.target.value)}
                      className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cs-primary"
                      placeholder="contato@cliente.com"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">WhatsApp / Fone</label>
                    <input
                      type="text"
                      value={form.contact_phone}
                      onChange={(e) => setField('contact_phone', e.target.value)}
                      className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cs-primary"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'financeiro' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Fee Mensal (R$)</label>
                  <input
                    type="number"
                    value={form.monthly_fee}
                    onChange={(e) => setField('monthly_fee', e.target.value)}
                    className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cs-primary"
                    placeholder="3500"
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
                  <option value="pending">Pendente (Onboarding)</option>
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
                <p className="text-[10px] text-cs-text-secondary mt-1">
                  Insira o link compartilhado do Google Drive para armazenar artes, vídeos, contratos e relatórios deste cliente.
                </p>
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
                    setField('reportei_config', { project_id: e.target.value });
                  }}
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cs-primary"
                  placeholder="Ex: 987654 (ID do Projeto no Reportei)"
                />
                <p className="text-[10px] text-cs-text-secondary mt-1">
                  Utilizado para integrar métricas ao vivo de Meta Ads, Google Ads e Instagram no Dashboard do cliente.
                </p>
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
                  placeholder="Ex: Sofisticado, Técnico, Educativo, Descontraído"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Público-Alvo Principal</label>
                <input
                  type="text"
                  value={form.target_audience}
                  onChange={(e) => setField('target_audience', e.target.value)}
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cs-primary"
                  placeholder="Ex: Empresários B2B de médio porte, 30 a 55 anos"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1.5">Instruções Customizadas para a IA</label>
                <textarea
                  rows={4}
                  value={form.ai_instructions}
                  onChange={(e) => setField('ai_instructions', e.target.value)}
                  className="w-full bg-cs-bg border border-cs-border rounded-xl p-4 text-xs text-white focus:outline-none focus:border-cs-primary resize-none"
                  placeholder="Especifique palavras proibidas, diretrizes rígidas de marca ou regras de copywriting para a IA aplicar neste cliente..."
                />
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-cs-border flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-cs-border text-cs-text-secondary hover:text-white transition-colors text-xs font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-cs-primary hover:bg-cs-primary-hover text-white px-6 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg shadow-cs-primary/20 flex items-center gap-2"
            >
              <Save size={16} /> Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
