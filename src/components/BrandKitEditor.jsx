import { useEffect, useState } from 'react';
import {
  Check, Copy, Edit3, ExternalLink, HardDrive, Image as ImageIcon,
  Palette, Save, ShieldCheck, Sparkles, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  BRAND_DEFAULTS,
  buildClientBrandPayload,
  getClientBrandKit,
  normalizeHexColor,
  parseKeywords,
} from '../lib/brandKit';

function buildDraft(client) {
  const kit = getClientBrandKit(client);
  return {
    primary_color: kit.primary_color,
    secondary_color: kit.secondary_color,
    accent_color: kit.accent_color,
    typography: kit.typography,
    tone_of_voice: kit.tone_of_voice,
    keywordsText: kit.keywords.join(', '),
    logo_url: kit.logo_url,
    drive_url: kit.drive_url,
    website: kit.website,
    instagram: kit.instagram,
    ai_instructions: kit.ai_instructions,
  };
}

export default function BrandKitEditor({
  client,
  onSave,
  defaultEditing = false,
  alwaysEditing = false,
  showHeader = true,
  saveLabel = 'Salvar Identidade',
  onOpenOnboarding,
}) {
  const [isEditing, setIsEditing] = useState(alwaysEditing || defaultEditing);
  const [saving, setSaving] = useState(false);
  const [copiedColor, setCopiedColor] = useState(null);
  const [draft, setDraft] = useState(() => buildDraft(client));

  useEffect(() => {
    setDraft(buildDraft(client));
    setIsEditing(alwaysEditing || defaultEditing);
  }, [client, alwaysEditing, defaultEditing]);

  const kit = getClientBrandKit(client);
  const activePrimary = isEditing ? normalizeHexColor(draft.primary_color, BRAND_DEFAULTS.primary_color) : kit.primary_color;
  const activeSecondary = isEditing ? normalizeHexColor(draft.secondary_color, BRAND_DEFAULTS.secondary_color) : kit.secondary_color;
  const activeAccent = isEditing ? normalizeHexColor(draft.accent_color, BRAND_DEFAULTS.accent_color) : kit.accent_color;
  const activeTypography = isEditing ? draft.typography : kit.typography;
  const activeKeywords = isEditing ? parseKeywords(draft.keywordsText) : kit.keywords;
  const activeLogo = isEditing ? draft.logo_url : kit.logo_url;
  const activeDrive = isEditing ? draft.drive_url : kit.drive_url;

  const setField = (field, value) => {
    setDraft(prev => ({ ...prev, [field]: value }));
  };

  const handleCopyColor = (hex) => {
    if (!hex || !navigator.clipboard) return;
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    toast.success(`Cor ${hex} copiada!`);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!client?.id || !onSave) return;
    setSaving(true);
    try {
      const payload = buildClientBrandPayload(client, {
        ...draft,
        keywords: parseKeywords(draft.keywordsText),
      });
      const saved = await onSave(payload);
      if (saved && !alwaysEditing) {
        setIsEditing(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(buildDraft(client));
    if (!alwaysEditing) setIsEditing(false);
  };

  const colorSlots = [
    { key: 'primary_color', label: 'Primária', value: draft.primary_color, viewHex: activePrimary },
    { key: 'secondary_color', label: 'Secundária', value: draft.secondary_color, viewHex: activeSecondary },
    { key: 'accent_color', label: 'Destaque', value: draft.accent_color, viewHex: activeAccent },
  ];

  return (
    <form onSubmit={handleSave} className="bg-cs-surface border border-cs-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cs-border pb-5">
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg overflow-hidden shrink-0 border border-white/10"
              style={{ backgroundColor: activePrimary }}
            >
              {activeLogo && /^https?:\/\//i.test(activeLogo) ? (
                <img src={activeLogo} alt={client?.name || 'Logo'} className="w-full h-full object-cover" />
              ) : (
                client?.name?.charAt(0) || 'M'
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-white truncate">{client?.name || 'Marca do Cliente'}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1.5 text-[11px] text-cs-text-secondary">
                  <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: activePrimary }} />
                  <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: activeSecondary }} />
                  <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: activeAccent }} />
                  <span>{activeTypography || 'Tipografia não definida'}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {activeDrive && /^https?:\/\//i.test(activeDrive) && (
              <a
                href={activeDrive}
                target="_blank"
                rel="noreferrer"
                className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <HardDrive size={14} /> Drive <ExternalLink size={12} />
              </a>
            )}
            {onOpenOnboarding && (
              <button
                type="button"
                onClick={onOpenOnboarding}
                className="bg-cs-bg hover:bg-white/5 border border-cs-border text-cs-text-secondary hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Abrir Onboarding
              </button>
            )}
            {!alwaysEditing && !isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="bg-cs-primary hover:bg-cs-primary-hover text-black px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-cs-primary/15"
              >
                <Edit3 size={14} /> Editar Identidade
              </button>
            )}
          </div>
        </div>
      )}

      {/* Paleta de Cores */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-cs-text-secondary uppercase tracking-widest flex items-center gap-1.5">
            <Palette size={13} className="text-cs-primary" /> Paleta de Cores Oficial
          </h3>
          {!isEditing && <span className="text-[11px] text-cs-text-secondary">Clique em uma cor para copiar o HEX</span>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {colorSlots.map(slot => (
            isEditing ? (
              <div key={slot.key} className="bg-cs-bg border border-cs-border rounded-2xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white">{slot.label}</label>
                  <span className="text-[10px] font-mono text-cs-text-secondary uppercase">{slot.viewHex}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    aria-label={`Cor ${slot.label}`}
                    value={slot.viewHex}
                    onChange={e => setField(slot.key, e.target.value)}
                    className="w-10 h-10 rounded-xl bg-transparent border border-cs-border cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    aria-label={`HEX ${slot.label}`}
                    value={slot.value}
                    onChange={e => setField(slot.key, e.target.value)}
                    placeholder="#000000"
                    className="w-full bg-cs-surface border border-cs-border rounded-xl px-3 py-2 text-xs text-white font-mono uppercase focus:outline-none focus:border-cs-primary"
                  />
                </div>
              </div>
            ) : (
              <button
                key={slot.key}
                type="button"
                onClick={() => handleCopyColor(slot.viewHex)}
                className="group bg-cs-bg border border-cs-border p-3 rounded-2xl text-left hover:border-cs-primary transition-all relative shadow-sm cursor-pointer"
              >
                <div className="h-12 rounded-xl mb-2.5 shadow-inner border border-white/10" style={{ backgroundColor: slot.viewHex }} />
                <div className="text-xs font-bold text-white truncate">{slot.label}</div>
                <div className="text-[11px] text-cs-text-secondary font-mono uppercase flex items-center justify-between mt-1">
                  <span>{slot.viewHex}</span>
                  {copiedColor === slot.viewHex ? (
                    <Check size={12} className="text-green-400" />
                  ) : (
                    <Copy size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </button>
            )
          ))}
        </div>
      </div>

      {/* Tipografia, Logo & Tom de Voz */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-cs-text-secondary uppercase tracking-widest mb-1.5 block">
              Tipografia Oficial
            </label>
            {isEditing ? (
              <input
                type="text"
                value={draft.typography}
                onChange={e => setField('typography', e.target.value)}
                placeholder="Ex: Montserrat + Inter"
                className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cs-primary"
              />
            ) : (
              <p className="text-sm font-semibold text-white bg-cs-bg border border-cs-border px-4 py-3 rounded-2xl">
                {kit.typography || 'Não configurada'}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-cs-text-secondary uppercase tracking-widest mb-1.5 block">
              Logotipo / URL da Marca
            </label>
            {isEditing ? (
              <input
                type="url"
                value={draft.logo_url}
                onChange={e => setField('logo_url', e.target.value)}
                placeholder="https://..."
                className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cs-primary"
              />
            ) : (
              <div className="text-xs text-cs-text-secondary bg-cs-bg border border-cs-border px-4 py-3 rounded-2xl flex items-center justify-between gap-2">
                <span className="truncate flex items-center gap-2">
                  <ImageIcon size={14} className="text-cs-primary shrink-0" />
                  {kit.logo_url || 'Nenhum logotipo direto vinculado'}
                </span>
                {kit.logo_url && /^https?:\/\//i.test(kit.logo_url) && (
                  <a href={kit.logo_url} target="_blank" rel="noreferrer" className="text-cs-primary font-bold shrink-0 hover:underline">
                    Abrir
                  </a>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-cs-text-secondary uppercase tracking-widest mb-1.5 block">
              Pasta Oficial no Google Drive
            </label>
            {isEditing ? (
              <input
                type="url"
                value={draft.drive_url}
                onChange={e => setField('drive_url', e.target.value)}
                placeholder="https://drive.google.com/drive/folders/..."
                className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cs-primary"
              />
            ) : (
              <div className="text-xs text-cs-text-secondary bg-cs-bg border border-cs-border px-4 py-3 rounded-2xl truncate">
                {kit.drive_url || 'Nenhum link de Drive configurado'}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-cs-text-secondary uppercase tracking-widest mb-1.5 block">
              Tom de Voz
            </label>
            {isEditing ? (
              <textarea
                rows={3}
                value={draft.tone_of_voice}
                onChange={e => setField('tone_of_voice', e.target.value)}
                placeholder="Ex: Técnico, acolhedor, autoridade científica sem sensacionalismo"
                className="w-full bg-cs-bg border border-cs-border rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cs-primary resize-none"
              />
            ) : (
              <p className="text-xs text-cs-text-secondary bg-cs-bg border border-cs-border p-4 rounded-2xl leading-relaxed min-h-[76px]">
                {kit.tone_of_voice || 'Tom de voz não configurado. Clique em Editar Identidade para preencher.'}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-cs-text-secondary uppercase tracking-widest mb-1.5 block">
                Instagram
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={draft.instagram}
                  onChange={e => setField('instagram', e.target.value)}
                  placeholder="@marca"
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cs-primary"
                />
              ) : (
                <p className="text-xs text-white bg-cs-bg border border-cs-border px-3 py-2.5 rounded-xl truncate">
                  {kit.instagram || 'Não informado'}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs font-bold text-cs-text-secondary uppercase tracking-widest mb-1.5 block">
                Website
              </label>
              {isEditing ? (
                <input
                  type="url"
                  value={draft.website}
                  onChange={e => setField('website', e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cs-primary"
                />
              ) : (
                <p className="text-xs text-white bg-cs-bg border border-cs-border px-3 py-2.5 rounded-xl truncate">
                  {kit.website || 'Não informado'}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-cs-text-secondary uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-cs-primary" /> Regras de Compliance & IA
            </label>
            {isEditing ? (
              <textarea
                rows={2}
                value={draft.ai_instructions}
                onChange={e => setField('ai_instructions', e.target.value)}
                placeholder="Restrições de conselho (CFM/CFO), termos proibidos, CRM/RQE obrigatório..."
                className="w-full bg-cs-bg border border-cs-border rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cs-primary resize-none"
              />
            ) : (
              <p className="text-xs text-cs-text-secondary bg-cs-bg border border-cs-border p-3 rounded-2xl leading-relaxed">
                {kit.ai_instructions || 'Nenhuma restrição ou regra de compliance cadastrada.'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Palavras-chave */}
      <div>
        <label className="text-xs font-bold text-cs-text-secondary uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <Sparkles size={13} className="text-cs-primary" /> Conceito e Palavras-Chave de Marca
        </label>
        {isEditing ? (
          <div className="space-y-2">
            <input
              type="text"
              value={draft.keywordsText}
              onChange={e => setField('keywordsText', e.target.value)}
              placeholder="Separe por vírgula: Cirurgia Vascular, Laser Transdérmico, Poços de Caldas"
              className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cs-primary"
            />
            {activeKeywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {activeKeywords.map(kw => (
                  <span key={kw} className="bg-cs-primary/10 border border-cs-primary/20 text-cs-primary text-[11px] font-bold px-3 py-1 rounded-full">
                    #{kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : activeKeywords.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {activeKeywords.map(kw => (
              <span key={kw} className="bg-cs-primary/10 border border-cs-primary/20 text-cs-primary text-xs font-bold px-3.5 py-1.5 rounded-full">
                #{kw}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-cs-text-secondary">Nenhuma palavra-chave definida.</p>
        )}
      </div>

      {isEditing && (
        <div className="pt-4 border-t border-cs-border flex items-center justify-end gap-3">
          {!alwaysEditing && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2.5 rounded-xl border border-cs-border text-xs font-bold text-cs-text-secondary hover:text-white flex items-center gap-1.5 cursor-pointer"
            >
              <X size={14} /> Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="bg-cs-primary hover:bg-cs-primary-hover text-black px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-lg shadow-cs-primary/20 cursor-pointer disabled:opacity-50"
          >
            <Save size={14} /> {saving ? 'Salvando...' : saveLabel}
          </button>
        </div>
      )}
    </form>
  );
}
