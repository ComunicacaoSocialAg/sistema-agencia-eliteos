import { useEffect, useState } from 'react';
import {
  Palette, FolderGit2, HardDrive, FileText, Image as ImageIcon,
  ExternalLink, Plus, Trash2, Save, X, Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import { areIdsMatching } from '../hooks/useClients';
import { useActiveClient } from '../contexts/ActiveClientContext';
import { getClientBrandKit } from '../lib/brandKit';
import BrandKitEditor from '../components/BrandKitEditor';

export default function BrandCenterView() {
  const {
    clients,
    loading,
    updateClient,
    selectedClientId: globalClientId,
    setSelectedClientId: setGlobalClientId,
  } = useActiveClient();

  const [localClientId, setLocalClientId] = useState('');
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [newAsset, setNewAsset] = useState({ name: '', url: '', type: 'image' });

  useEffect(() => {
    if (!clients.length) return;
    if (globalClientId !== 'all') {
      const matched = clients.find(c => areIdsMatching(c.id, globalClientId, c.name, ''));
      if (matched) setLocalClientId(matched.id);
      return;
    }
    const stillExists = clients.some(c => c.id === localClientId);
    if (!stillExists) {
      setLocalClientId(clients[0].id);
    }
  }, [clients, globalClientId, localClientId]);

  const activeId = globalClientId !== 'all' ? globalClientId : localClientId;
  const selectedClient = clients.find(c => areIdsMatching(c.id, activeId, c.name, '')) || clients[0] || null;

  const handleSelectClient = (id) => {
    setLocalClientId(id);
    setGlobalClientId(id);
  };

  const handleOpenOnboarding = () => {
    if (!selectedClient) return;
    window.dispatchEvent(new CustomEvent('csag:navigate', {
      detail: { view: 'clientes', clientId: selectedClient.id, clientTab: 'onboarding' },
    }));
  };

  const brandKit = getClientBrandKit(selectedClient || {});
  const assets = brandKit.assets;
  const driveUrl = brandKit.drive_url;

  const handleAddAsset = async (e) => {
    e.preventDefault();
    if (!selectedClient) return;
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
      created_at: new Date().toISOString(),
    };

    const updatedAssets = [...assets, assetItem];
    const saved = await updateClient({ ...selectedClient, assets: updatedAssets });
    if (!saved) return;
    toast.success('Arquivo institucional vinculado à marca.');
    setNewAsset({ name: '', url: '', type: 'image' });
    setShowAddAssetModal(false);
  };

  const handleDeleteAsset = async (assetId) => {
    if (!selectedClient) return;
    const updatedAssets = assets.filter(a => a.id !== assetId);
    const saved = await updateClient({ ...selectedClient, assets: updatedAssets });
    if (saved) toast.success('Material removido.');
  };

  return (
    <div className="h-full overflow-y-auto bg-cs-bg p-6 sm:p-8 space-y-8 custom-scrollbar animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cs-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-cs-primary text-xs font-bold uppercase tracking-widest mb-1">
            <Palette size={16} /> Brand Center & Ativos
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Identidade Visual & Central de Marca</h1>
          <p className="text-cs-text-secondary text-sm">Edite paleta HEX, tipografia, logotipo, regras da marca e repositório Google Drive por conta.</p>
        </div>

        {/* Client Selector */}
        {clients.length > 0 && (
          <div className="flex items-center gap-3 bg-cs-surface border border-cs-border p-2 rounded-2xl">
            <label htmlFor="brand-center-account" className="text-xs text-cs-text-secondary font-bold uppercase tracking-wider pl-2">Conta:</label>
            <select
              id="brand-center-account"
              value={selectedClient?.id || ''}
              onChange={(e) => handleSelectClient(e.target.value)}
              className="bg-cs-bg border border-cs-border rounded-xl px-4 py-2 text-white text-sm font-semibold focus:outline-none focus:border-cs-primary cursor-pointer"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading && !selectedClient ? (
        <div className="bg-cs-surface border border-cs-border rounded-3xl p-12 text-center text-sm text-cs-text-secondary">
          Carregando fichas de marca...
        </div>
      ) : !selectedClient ? (
        <div className="bg-cs-surface border border-dashed border-cs-border rounded-3xl p-12 text-center space-y-3">
          <Users size={40} className="mx-auto text-cs-text-secondary opacity-30" />
          <h2 className="text-lg font-bold text-white">Nenhum cliente cadastrado ainda</h2>
          <p className="text-xs text-cs-text-secondary max-w-md mx-auto">
            Cadastre um cliente manualmente, converta uma ficha recebida pelo WhatsApp ou feche um negócio no CRM para gerenciar a identidade visual aqui.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Editable Brand Kit + Assets */}
          <div className="lg:col-span-2 space-y-8">
            <BrandKitEditor
              client={selectedClient}
              onSave={updateClient}
              onOpenOnboarding={handleOpenOnboarding}
            />

            {/* Assets Section */}
            <div className="bg-cs-surface border border-cs-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <FolderGit2 size={20} className="text-cs-primary" /> Arquivos, Logotipos & Materiais Institucionais
                  </h2>
                  <p className="text-xs text-cs-text-secondary">Logotipos em vetor (.svg, .png), manuais em PDF e fotos oficiais.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddAssetModal(true)}
                  className="bg-cs-primary hover:bg-cs-primary-hover text-black px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-lg shadow-cs-primary/20 cursor-pointer"
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
                        type="button"
                        onClick={() => handleDeleteAsset(asset.id)}
                        className="p-1.5 text-cs-text-secondary hover:text-red-400 opacity-70 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Remover arquivo"
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
                      type="button"
                      onClick={() => setShowAddAssetModal(true)}
                      className="text-xs text-cs-primary font-bold hover:underline cursor-pointer"
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
                  <h3 className="text-lg font-bold text-white">Google Drive da Conta</h3>
                  <p className="text-xs text-blue-300">Repositório Oficial em Nuvem</p>
                </div>
              </div>

              <p className="text-xs text-cs-text-secondary leading-relaxed">
                Armazene documentos brutos, logotipos em vetor, vídeos e contratos nesta pasta oficial do cliente. Para alterar o link, clique em Editar Identidade ao lado.
              </p>

              <div className="p-4 bg-cs-bg/80 border border-cs-border rounded-2xl space-y-2">
                <span className="text-[10px] font-bold text-cs-text-secondary uppercase">Link Configurado:</span>
                <p className="text-xs text-white font-mono break-all">
                  {driveUrl || 'Nenhum link de Google Drive cadastrado'}
                </p>
              </div>

              {driveUrl && /^https?:\/\//i.test(driveUrl) ? (
                <a
                  href={driveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
                >
                  Acessar Repositório do Cliente <ExternalLink size={14} />
                </a>
              ) : (
                <div className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3">
                  Configure o link da pasta do Drive clicando em Editar Identidade ou no Onboarding do cliente.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Adicionar Ativo */}
      {showAddAssetModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-cs-surface border border-cs-border rounded-3xl w-full max-w-md p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-cs-border pb-4">
              <h3 className="text-lg font-bold text-white">Vincular Material de Marca</h3>
              <button type="button" onClick={() => setShowAddAssetModal(false)} className="text-cs-text-secondary hover:text-white cursor-pointer">
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
                <button type="button" onClick={() => setShowAddAssetModal(false)} className="px-4 py-2 text-xs font-bold text-cs-text-secondary cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" className="bg-cs-primary text-black text-xs font-extrabold px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-cs-primary/20 cursor-pointer">
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
