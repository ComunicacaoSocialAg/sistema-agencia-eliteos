import { useState } from 'react';
import { 
  Palette, FolderGit2, HardDrive, FileText, Image as ImageIcon, 
  ExternalLink, Sparkles, Copy, Check, Plus, Trash2, Edit3, Save, X 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useClients } from '../hooks/useClients';
import { useActiveClient } from '../contexts/ActiveClientContext';
import { cn } from '../utils/cn';

export default function BrandCenterView() {
  const { clients, updateClient } = useClients();
  const { selectedClientId: globalClientId, setSelectedClientId: setGlobalClientId } = useActiveClient();
  
  const [localClientId, setLocalClientId] = useState(() => {
    return globalClientId !== 'all' ? globalClientId : (clients[0]?.id || 'client-alberto-brasil');
  });

  const selectedClientId = globalClientId !== 'all' ? globalClientId : localClientId;

  const handleSelectClient = (id) => {
    setLocalClientId(id);
    setGlobalClientId(id);
  };

  const [copiedColor, setCopiedColor] = useState(null);
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [newAsset, setNewAsset] = useState({ name: '', url: '', type: 'image' });

  // Obter o cliente selecionado atual ou o primeiro da lista
  const selectedClient = clients.find(c => c.id === selectedClientId || (globalClientId !== 'all' && c.name?.includes(selectedClientId))) || clients[0] || {
    id: 'default',
    name: 'Cliente Padrão',
    primary_color: '#3b82f6',
    secondary_color: '#18181b',
    accent_color: '#10b981',
    typography: 'Inter + Plus Jakarta Sans',
    tone_of_voice: 'Profissional e Moderno',
    keywords: ['Comunicação', 'Marca', 'Performance'],
    drive_url: 'https://drive.google.com',
    assets: []
  };

  const primaryColor = selectedClient.primary_color || selectedClient.brand_color || '#3b82f6';
  const secondaryColor = selectedClient.secondary_color || '#18181b';
  const accentColor = selectedClient.accent_color || '#10b981';
  const typography = selectedClient.typography || 'Inter / Plus Jakarta Sans';
  const toneOfVoice = selectedClient.tone_of_voice || 'Profissional, acolhedor e focado em resultados';
  const keywords = Array.isArray(selectedClient.keywords) && selectedClient.keywords.length > 0 
    ? selectedClient.keywords 
    : ['Identidade', 'Criatividade', 'Posicionamento'];
  const assets = Array.isArray(selectedClient.assets) ? selectedClient.assets : [];
  const driveUrl = selectedClient.drive_url || 'https://drive.google.com';

  const handleCopyColor = (hex) => {
    if (!hex) return;
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    toast.success(`Cor ${hex} copiada!`);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const handleAddAsset = async (e) => {
    e.preventDefault();
    if (!newAsset.name.trim() || !newAsset.url.trim()) {
      toast.error('Preencha o nome e o link do arquivo.');
      return;
    }

    const assetItem = {
      id: `asset-${Date.now()}`,
      name: newAsset.name.trim(),
      url: newAsset.url.trim(),
      type: newAsset.type || 'image',
      size: 'Cloud Link',
      created_at: new Date().toISOString()
    };

    const updatedAssets = [...assets, assetItem];
    await updateClient({ ...selectedClient, assets: updatedAssets });
    toast.success('Arquivo institucional vinculado à marca!');
    setNewAsset({ name: '', url: '', type: 'image' });
    setShowAddAssetModal(false);
  };

  const handleDeleteAsset = async (assetId) => {
    const updatedAssets = assets.filter(a => a.id !== assetId);
    await updateClient({ ...selectedClient, assets: updatedAssets });
    toast.success('Material removido.');
  };

  return (
    <div className="h-full overflow-y-auto bg-cs-bg p-8 space-y-8 custom-scrollbar animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cs-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-cs-primary text-xs font-bold uppercase tracking-widest mb-1">
            <Palette size={16} /> Brand Center & Assets
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Identidade Visual & Central de Arquivos</h1>
          <p className="text-cs-text-secondary text-sm">Guia de marca oficial, paleta HSL, tipografia e repositório Google Drive por conta.</p>
        </div>

        {/* Client Selector */}
        <div className="flex items-center gap-3 bg-cs-surface border border-cs-border p-2 rounded-2xl">
          <label className="text-xs text-cs-text-secondary font-bold uppercase tracking-wider pl-2">Conta:</label>
          <select
            value={selectedClient.id}
            onChange={(e) => handleSelectClient(e.target.value)}
            className="bg-cs-bg border border-cs-border rounded-xl px-4 py-2 text-white text-sm font-semibold focus:outline-none focus:border-cs-primary cursor-pointer"
          >
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Brand Kit */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Identity Card */}
          <div className="bg-cs-surface border border-cs-border rounded-3xl p-8 space-y-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
                  style={{ backgroundColor: primaryColor }}
                >
                  {selectedClient.name?.charAt(0) || 'B'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    {selectedClient.name}
                  </h2>
                  <span className="text-xs text-cs-text-secondary">Manual de Diretrizes e Aplicações</span>
                </div>
              </div>
              <a
                href={driveUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md"
              >
                <HardDrive size={16} /> Abrir Google Drive <ExternalLink size={12} />
              </a>
            </div>

            {/* Colors & Typography */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Paleta de Cores */}
              <div>
                <h3 className="text-xs font-bold text-cs-text-secondary uppercase tracking-widest mb-3">Paleta de Cores Oficial</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Primária', hex: primaryColor },
                    { label: 'Secundária', hex: secondaryColor },
                    { label: 'Destaque', hex: accentColor },
                  ].map(c => (
                    <button
                      key={c.label}
                      onClick={() => handleCopyColor(c.hex)}
                      className="group bg-cs-bg border border-cs-border p-3 rounded-2xl text-left hover:border-cs-primary transition-all relative shadow-sm"
                    >
                      <div className="h-12 rounded-xl mb-2.5 shadow-inner border border-white/5" style={{ backgroundColor: c.hex }} />
                      <div className="text-xs font-bold text-white truncate">{c.label}</div>
                      <div className="text-[10px] text-cs-text-secondary font-mono flex items-center justify-between mt-1">
                        {c.hex}
                        {copiedColor === c.hex ? <Check size={12} className="text-green-400" /> : <Copy size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tipografia & Tom de Voz */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-cs-text-secondary uppercase tracking-widest mb-1.5">Tipografia Oficial</h3>
                  <p className="text-sm font-semibold text-white bg-cs-bg border border-cs-border px-4 py-3 rounded-2xl">{typography}</p>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-cs-text-secondary uppercase tracking-widest mb-1.5">Tom de Voz</h3>
                  <p className="text-xs text-cs-text-secondary bg-cs-bg border border-cs-border p-4 rounded-2xl leading-relaxed">{toneOfVoice}</p>
                </div>
              </div>

            </div>

            {/* Keywords */}
            <div>
              <h3 className="text-xs font-bold text-cs-text-secondary uppercase tracking-widest mb-3">Conceito e Palavras-Chave de Marca</h3>
              <div className="flex flex-wrap gap-2">
                {keywords.map(kw => (
                  <span key={kw} className="bg-cs-primary/10 border border-cs-primary/20 text-cs-primary text-xs font-bold px-3.5 py-1.5 rounded-full">
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Assets Section */}
          <div className="bg-cs-surface border border-cs-border rounded-3xl p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FolderGit2 size={20} className="text-cs-primary" /> Arquivos, Logotipos & Materiais Institucionais
                </h2>
                <p className="text-xs text-cs-text-secondary">Logotipos em vetor (.svg, .png), manuais em PDF e fotos de alta resolução.</p>
              </div>
              <button
                onClick={() => setShowAddAssetModal(true)}
                className="bg-cs-primary hover:bg-cs-primary-hover text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-cs-primary/20"
              >
                <Plus size={14} /> Vincular Arquivo
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assets.map(asset => (
                <div key={asset.id || asset.name} className="flex items-center justify-between p-4 bg-cs-bg border border-cs-border rounded-2xl hover:border-cs-primary/50 transition-all group">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-3 bg-cs-surface rounded-xl text-cs-primary border border-cs-border">
                      {asset.type === 'pdf' ? <FileText size={20} /> : <ImageIcon size={20} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{asset.name}</p>
                      <span className="text-[10px] text-cs-text-secondary uppercase">{asset.type || 'Arquivo'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a 
                      href={asset.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-xs font-bold text-cs-primary hover:underline px-2 py-1"
                    >
                      Abrir
                    </a>
                    <button
                      onClick={() => handleDeleteAsset(asset.id)}
                      className="p-1.5 text-cs-text-secondary hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {assets.length === 0 && (
                <div className="col-span-full py-8 text-center border border-dashed border-cs-border rounded-2xl bg-cs-bg/30">
                  <p className="text-xs text-cs-text-secondary mb-2">Nenhum ativo específico cadastrado nesta conta.</p>
                  <button 
                    onClick={() => setShowAddAssetModal(true)}
                    className="text-xs text-cs-primary font-bold hover:underline"
                  >
                    + Adicionar primeiro logotipo ou manual
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Google Drive Direct Portal */}
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-blue-900/20 to-cs-surface border border-blue-500/30 rounded-3xl p-8 space-y-6 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-md">
                <HardDrive size={26} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Google Drive Integrado</h3>
                <p className="text-xs text-blue-300">Repositório Oficial em Nuvem</p>
              </div>
            </div>

            <p className="text-xs text-cs-text-secondary leading-relaxed">
              Todos os documentos brutos, vídeos de alta resolução, contratos e briefings preenchidos pelo cliente são organizados nesta pasta compartilhada da agência.
            </p>

            <div className="p-4 bg-cs-bg/80 border border-cs-border rounded-2xl space-y-2">
              <span className="text-[10px] font-bold text-cs-text-secondary uppercase">Link Atual:</span>
              <p className="text-xs text-white font-mono truncate">{driveUrl}</p>
            </div>

            <a
              href={driveUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
            >
              Acessar Repositório do Cliente <ExternalLink size={14} />
            </a>
          </div>
        </div>

      </div>

      {/* Modal Adicionar Ativo */}
      {showAddAssetModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-cs-surface border border-cs-border rounded-3xl w-full max-w-md p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-cs-border pb-4">
              <h3 className="text-lg font-bold text-white">Vincular Material de Marca</h3>
              <button onClick={() => setShowAddAssetModal(false)} className="text-cs-text-secondary hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddAsset} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1">Nome do Arquivo / Peça *</label>
                <input 
                  type="text"
                  value={newAsset.name}
                  onChange={e => setNewAsset(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cs-primary"
                  placeholder="Ex: Logo_Vetor_Oficial.svg"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1">Link do Arquivo (Google Drive / Canva / Cloud) *</label>
                <input 
                  type="url"
                  value={newAsset.url}
                  onChange={e => setNewAsset(p => ({ ...p, url: e.target.value }))}
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cs-primary"
                  placeholder="https://drive.google.com/..."
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-cs-text-secondary uppercase block mb-1">Tipo de Material</label>
                <select
                  value={newAsset.type}
                  onChange={e => setNewAsset(p => ({ ...p, type: e.target.value }))}
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cs-primary"
                >
                  <option value="image">Logotipo / Imagem (PNG, SVG, JPG)</option>
                  <option value="pdf">Manual de Marca / PDF</option>
                  <option value="video">Vídeo Institucional</option>
                  <option value="font">Tipografia / Fontes</option>
                </select>
              </div>

              <div className="pt-4 border-t border-cs-border flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddAssetModal(false)} className="px-4 py-2 text-xs font-bold text-cs-text-secondary">
                  Cancelar
                </button>
                <button type="submit" className="bg-cs-primary text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-cs-primary/20">
                  <Save size={14} /> Salvar Ativo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
