import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Send, ShieldCheck, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegistrationLinkModal({ isOpen, onClose }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [targetPhone, setTargetPhone] = useState('');

  if (!isOpen) return null;

  const isLocal = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('192.168.') ||
    window.location.hostname.includes('10.') ||
    window.location.hostname.endsWith('.local')
  );
  const productionBaseUrl = 'https://sistema-agencia-eliteos.vercel.app';
  const url = isLocal ? `${productionBaseUrl}/cadastro` : `${window.location.origin}/cadastro`;
  const defaultMessage = `Olá! Para darmos início ao nosso contrato e prepararmos tudo na Comunicação Social Ag, por favor preencha seus dados cadastrais neste link seguro:\n\n${url}\n\nLeva menos de 2 minutos!`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast.success('Link copiado para a área de transferência!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(defaultMessage);
    setCopiedMsg(true);
    toast.success('Mensagem completa copiada para enviar no WhatsApp!');
    setTimeout(() => setCopiedMsg(false), 2000);
  };

  const handleSendDirectWhatsApp = () => {
    const clean = targetPhone.replace(/\D/g, '');
    const number = clean.length === 10 || clean.length === 11 ? `55${clean}` : clean;
    const encoded = encodeURIComponent(defaultMessage);
    if (number) {
      window.open(`https://wa.me/${number}?text=${encoded}`, '_blank');
    } else {
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-cs-surface border border-cs-border rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cs-primary via-emerald-400 to-cs-accent" />

        <div className="flex items-center justify-between pb-4 border-b border-cs-border mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] flex items-center justify-center">
              <MessageSquare size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Link de Cadastro para WhatsApp
              </h3>
              <p className="text-xs text-cs-text-secondary">
                Envie para o cliente preencher os dados de início de contrato
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-cs-text-secondary hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Link direto */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-cs-text-secondary uppercase tracking-wider mb-2">
              Link Seguro do Formulário
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={url}
                className="flex-1 bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-xs text-white font-mono select-all focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="bg-cs-bg hover:bg-white/5 border border-cs-border hover:border-cs-primary/50 text-white px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Copiar apenas o link"
              >
                {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copiedLink ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Mensagem sugerida */}
          <div>
            <label className="block text-xs font-bold text-cs-text-secondary uppercase tracking-wider mb-2">
              Mensagem pronta para WhatsApp
            </label>
            <textarea
              readOnly
              rows={4}
              value={defaultMessage}
              className="w-full bg-cs-bg border border-cs-border rounded-xl p-3 text-xs text-cs-text-primary resize-none focus:outline-none leading-relaxed select-all"
            />
          </div>

          {/* Envio direto */}
          <div>
            <label className="block text-xs font-bold text-cs-text-secondary uppercase tracking-wider mb-2">
              Enviar direto para número do WhatsApp (opcional)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={targetPhone}
                onChange={(e) => setTargetPhone(e.target.value)}
                placeholder="(35) 99999-9999"
                className="flex-1 bg-cs-bg border border-cs-border rounded-xl px-4 py-2.5 text-xs text-white placeholder-cs-text-secondary/50 focus:outline-none focus:border-cs-primary"
              />
              <button
                onClick={handleSendDirectWhatsApp}
                className="bg-[#25D366] hover:bg-[#20ba5a] text-black font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-[#25D366]/20 cursor-pointer"
              >
                <Send size={14} />
                <span>Abrir WhatsApp</span>
              </button>
            </div>
          </div>
        </div>

        {/* Rodapé com ações */}
        <div className="pt-4 border-t border-cs-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-cs-text-secondary hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>Visualizar página como o cliente</span>
            <ExternalLink size={12} />
          </a>

          <button
            onClick={handleCopyMessage}
            className="w-full sm:w-auto bg-cs-primary hover:bg-cs-primary-hover text-black font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-cs-primary/10"
          >
            {copiedMsg ? <Check size={14} /> : <Copy size={14} />}
            <span>{copiedMsg ? 'Mensagem Copiada!' : 'Copiar Mensagem do WhatsApp'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
