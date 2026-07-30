import { useState } from 'react';
import { Palette, FolderGit2, HardDrive, FileText, Image as ImageIcon, ExternalLink, Sparkles, Copy, Check } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';

const DEMO_BRANDS = [];

export default function BrandCenterView() {
  const { clients } = useProjects();
  const [selectedClient, setSelectedClient] = useState(DEMO_BRANDS[0] || null);
  const [copiedColor, setCopiedColor] = useState(null);

  const handleCopyColor = (hex) => {
    if (!hex) return;
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  };


  return (
    <div className="h-full overflow-y-auto bg-cs-bg p-6 space-y-6 custom-scrollbar">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cs-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-cs-primary text-sm font-bold uppercase tracking-wider mb-1">
            <Palette size={16} /> Brand Center & Assets
          </div>
          <h1 className="text-2xl font-bold text-white">Identidade Visual & Central de Arquivos</h1>
          <p className="text-cs-text-secondary text-sm">Guia de marca, ativos visuais e repositório Google Drive por cliente.</p>
        </div>

        {/* Client Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-cs-text-secondary font-medium">Cliente:</label>
          <select
            value={selectedClient.id}
            onChange={(e) => setSelectedClient(DEMO_BRANDS.find(b => b.id === e.target.value) || DEMO_BRANDS[0])}
            className="bg-cs-surface border border-cs-border rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-cs-primary"
          >
            {DEMO_BRANDS.map(brand => (
              <option key={brand.id} value={brand.id}>{brand.client_name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Brand Kit */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Identity Card */}
          <div className="bg-cs-surface border border-cs-border rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles size={18} className="text-cs-primary" /> Identidade Visual da Conta
              </h2>
              <a
                href={selectedClient.drive_url}
                target="_blank"
                rel="noreferrer"
                className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
              >
                <HardDrive size={14} /> Abrir Pasta no Google Drive <ExternalLink size={12} />
              </a>
            </div>

            {/* Colors & Typography */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Paleta de Cores */}
              <div>
                <h3 className="text-xs font-bold text-cs-text-secondary uppercase tracking-wider mb-3">Paleta de Cores Oficial</h3>
                <div className="flex items-center gap-3">
                  {[
                    { label: 'Primária', hex: selectedClient.primary_color },
                    { label: 'Secundária', hex: selectedClient.secondary_color },
                    { label: 'Destaque', hex: selectedClient.accent_color },
                  ].map(c => (
                    <button
                      key={c.label}
                      onClick={() => handleCopyColor(c.hex)}
                      className="group flex-1 bg-cs-bg border border-cs-border p-2.5 rounded-xl text-left hover:border-cs-primary transition-all relative"
                    >
                      <div className="h-10 rounded-lg mb-2 shadow-inner" style={{ backgroundColor: c.hex }} />
                      <div className="text-[11px] font-bold text-white truncate">{c.label}</div>
                      <div className="text-[10px] text-cs-text-secondary font-mono flex items-center justify-between">
                        {c.hex}
                        {copiedColor === c.hex ? <Check size={12} className="text-green-400" /> : <Copy size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tipografia & Tom de Voz */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-xs font-bold text-cs-text-secondary uppercase tracking-wider mb-1">Tipografia Oficial</h3>
                  <p className="text-sm font-semibold text-white bg-cs-bg border border-cs-border px-3 py-2 rounded-xl">{selectedClient.typography}</p>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-cs-text-secondary uppercase tracking-wider mb-1">Tom de Voz</h3>
                  <p className="text-xs text-cs-text-secondary bg-cs-bg border border-cs-border p-3 rounded-xl leading-relaxed">{selectedClient.tone_of_voice}</p>
                </div>
              </div>

            </div>

            {/* Keywords */}
            <div>
              <h3 className="text-xs font-bold text-cs-text-secondary uppercase tracking-wider mb-2">Palavras-Chave de Marca</h3>
              <div className="flex flex-wrap gap-2">
                {selectedClient.keywords.map(kw => (
                  <span key={kw} className="bg-cs-primary/10 border border-cs-primary/20 text-cs-primary text-xs font-medium px-3 py-1 rounded-full">
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Assets Section */}
          <div className="bg-cs-surface border border-cs-border rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FolderGit2 size={18} className="text-cs-primary" /> Arquivos & Materiais Institucionais
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedClient.assets.map(asset => (
                <div key={asset.name} className="flex items-center justify-between p-3.5 bg-cs-bg border border-cs-border rounded-xl hover:border-cs-primary/50 transition-all">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-cs-surface rounded-lg text-cs-primary">
                      {asset.type === 'pdf' ? <FileText size={18} /> : <ImageIcon size={18} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{asset.name}</p>
                      <p className="text-[10px] text-cs-text-secondary">{asset.size}</p>
                    </div>
                  </div>
                  <a href={asset.url} className="text-xs font-bold text-cs-primary hover:underline ml-2">Baixar</a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Google Drive Direct Portal */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-900/20 to-cs-surface border border-blue-500/30 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <HardDrive size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Google Drive Integrado</h3>
                <p className="text-xs text-blue-300">Armazenamento oficial da conta</p>
              </div>
            </div>

            <p className="text-xs text-cs-text-secondary leading-relaxed">
              Todos os documentos brutos, vídeos de alta resolução, contratos e briefings preenchidos pelo cliente são sincronizados automaticamente nesta pasta compartilhada.
            </p>

            <a
              href={selectedClient.drive_url}
              target="_blank"
              rel="noreferrer"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
            >
              Acessar Repositório do Cliente <ExternalLink size={14} />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
