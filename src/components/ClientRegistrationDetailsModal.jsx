import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Building2, 
  UserCheck, 
  MapPin, 
  CreditCard, 
  Send, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  FileCheck,
  Globe,
  Phone,
  Mail
} from 'lucide-react';
import toast from 'react-hot-toast';

function InstagramIcon({ size = 14, className = "" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function ClientRegistrationDetailsModal({ 
  registration, 
  isOpen, 
  onClose, 
  onUpdateStatus, 
  onDelete, 
  onCreateClient 
}) {
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [converting, setConverting] = useState(false);

  if (!isOpen || !registration) return null;

  const generateContractText = () => {
    return `DADOS CADASTRAIS PARA CONTRATO:

CONTRATANTE:
Razão Social: ${registration.company_name || ''}
Nome Fantasia: ${registration.trade_name || registration.company_name || ''}
Tipo: ${registration.person_type || 'PJ'}
CNPJ/CPF: ${registration.document_number || ''}
Inscrição Estadual: ${registration.state_registration || 'Isento'}

REPRESENTANTE LEGAL:
Nome: ${registration.representative_name || ''}
CPF: ${registration.representative_cpf || ''}
Cargo: ${registration.representative_role || 'Sócio Administrador'}
WhatsApp: ${registration.contact_phone || ''}
E-mail: ${registration.contact_email || ''}

ENDEREÇO:
Logradouro: ${registration.street || ''}, nº ${registration.number || 'S/N'} ${registration.complement ? `(${registration.complement})` : ''}
Bairro: ${registration.neighborhood || ''}
Cidade/UF: ${registration.city || 'Poços de Caldas'} / ${registration.state || 'MG'}
CEP: ${registration.cep || ''}

FATURAMENTO & OPERAÇÃO:
Dia de Vencimento: Dia ${registration.billing_day || '10'}
E-mail Financeiro: ${registration.billing_email || registration.contact_email || ''}
Instagram: ${registration.instagram_handle || 'Não informado'}
Site: ${registration.website_url || 'Não informado'}
Observações: ${registration.observations || 'Nenhuma'}`;
  };

  const handleCopyContractData = () => {
    const text = generateContractText();
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    toast.success('Dados completos copiados para colar no contrato!');
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleConvertToClient = async () => {
    if (!onCreateClient) return;
    setConverting(true);
    try {
      await onCreateClient(registration);
      if (onUpdateStatus) {
        await onUpdateStatus(registration.id, 'convertido');
      }
      toast.success('Cliente oficial criado e cadastrado com sucesso!');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao converter cliente.');
    } finally {
      setConverting(false);
    }
  };

  const handleOpenWhatsApp = () => {
    const clean = (registration.contact_phone || '').replace(/\D/g, '');
    const number = clean.length === 10 || clean.length === 11 ? `55${clean}` : clean;
    const msg = encodeURIComponent(`Olá ${registration.representative_name}! Aqui é o Bruno da Comunicação Social Ag. Recebemos seus dados cadastrais da ${registration.trade_name || registration.company_name} com sucesso.`);
    window.open(`https://wa.me/${number}?text=${msg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-cs-surface border border-cs-border rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-cs-border shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                registration.status === 'convertido'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : registration.status === 'aprovado'
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                  : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
              }`}>
                {registration.status === 'convertido' ? 'Cliente Convertido' : registration.status === 'aprovado' ? 'Aprovado' : 'Aguardando Revisão'}
              </span>
              <span className="text-[11px] text-cs-text-secondary">
                Enviado em {new Date(registration.created_at).toLocaleDateString('pt-BR')} às {new Date(registration.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-white tracking-tight">
              {registration.company_name}
            </h3>
            {registration.trade_name && registration.trade_name !== registration.company_name && (
              <p className="text-xs text-cs-text-secondary">
                Nome Fantasia: <span className="text-white font-medium">{registration.trade_name}</span>
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="text-cs-text-secondary hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6 custom-scrollbar pr-1">
          {/* 1. Empresa */}
          <div className="bg-cs-bg/60 border border-cs-border rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-cs-primary uppercase tracking-wider">
              <Building2 size={14} /> Dados da Empresa ({registration.person_type || 'PJ'})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-cs-text-secondary block text-[11px]">Documento (CNPJ / CPF):</span>
                <span className="font-mono font-medium text-white">{registration.document_number}</span>
              </div>
              <div>
                <span className="text-cs-text-secondary block text-[11px]">Inscrição Estadual:</span>
                <span className="text-white">{registration.state_registration || 'Isento'}</span>
              </div>
            </div>
          </div>

          {/* 2. Representante */}
          <div className="bg-cs-bg/60 border border-cs-border rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-cs-primary uppercase tracking-wider">
              <UserCheck size={14} /> Representante Legal do Contrato
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-cs-text-secondary block text-[11px]">Nome:</span>
                <span className="font-semibold text-white">{registration.representative_name}</span>
              </div>
              <div>
                <span className="text-cs-text-secondary block text-[11px]">CPF:</span>
                <span className="font-mono text-white">{registration.representative_cpf || 'Não informado'}</span>
              </div>
              <div>
                <span className="text-cs-text-secondary block text-[11px]">Cargo / Função:</span>
                <span className="text-white">{registration.representative_role || 'Sócio Administrador'}</span>
              </div>
              <div>
                <span className="text-cs-text-secondary block text-[11px]">Telefone / WhatsApp:</span>
                <span className="text-white flex items-center gap-1">
                  <Phone size={11} className="text-emerald-400" />
                  {registration.contact_phone}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-cs-text-secondary block text-[11px]">E-mail para assinatura:</span>
                <span className="text-white flex items-center gap-1 font-mono text-[11px]">
                  <Mail size={11} className="text-blue-400" />
                  {registration.contact_email}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Endereço */}
          <div className="bg-cs-bg/60 border border-cs-border rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-cs-primary uppercase tracking-wider">
              <MapPin size={14} /> Endereço Comercial
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <span className="text-cs-text-secondary block text-[11px]">Logradouro:</span>
                <span className="text-white">
                  {registration.street ? `${registration.street}, nº ${registration.number || 'S/N'}` : 'Não informado'}
                  {registration.complement && ` (${registration.complement})`}
                </span>
              </div>
              <div>
                <span className="text-cs-text-secondary block text-[11px]">Bairro:</span>
                <span className="text-white">{registration.neighborhood || 'Não informado'}</span>
              </div>
              <div>
                <span className="text-cs-text-secondary block text-[11px]">Cidade / UF:</span>
                <span className="text-white">{registration.city || 'Poços de Caldas'} / {registration.state || 'MG'}</span>
              </div>
              <div>
                <span className="text-cs-text-secondary block text-[11px]">CEP:</span>
                <span className="font-mono text-white">{registration.cep || 'Não informado'}</span>
              </div>
            </div>
          </div>

          {/* 4. Faturamento & Digital */}
          <div className="bg-cs-bg/60 border border-cs-border rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-cs-primary uppercase tracking-wider">
              <CreditCard size={14} /> Faturamento & Presença Digital
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-cs-text-secondary block text-[11px]">Vencimento Desejado:</span>
                <span className="font-bold text-emerald-400">Todo dia {registration.billing_day || '10'}</span>
              </div>
              <div>
                <span className="text-cs-text-secondary block text-[11px]">E-mail Financeiro:</span>
                <span className="text-white font-mono text-[11px] truncate block">
                  {registration.billing_email || registration.contact_email}
                </span>
              </div>
              <div>
                <span className="text-cs-text-secondary block text-[11px]">Instagram:</span>
                <span className="text-white flex items-center gap-1 font-semibold">
                  <InstagramIcon size={12} className="text-pink-400" />
                  {registration.instagram_handle || 'Não informado'}
                </span>
              </div>
              <div>
                <span className="text-cs-text-secondary block text-[11px]">Site:</span>
                <span className="text-white truncate block">
                  {registration.website_url || 'Não informado'}
                </span>
              </div>
              {registration.observations && (
                <div className="sm:col-span-2 pt-2 border-t border-cs-border/60">
                  <span className="text-cs-text-secondary block text-[11px] mb-1">Observações do Cliente:</span>
                  <p className="text-white text-xs bg-cs-surface/60 p-2.5 rounded-xl border border-cs-border/60 leading-relaxed italic">
                    "{registration.observations}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-cs-border flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyContractData}
              className="bg-cs-bg hover:bg-white/5 border border-cs-border hover:border-cs-primary/50 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Copiar texto pronto para a minuta do contrato"
            >
              {copiedSummary ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copiedSummary ? 'Copiado para Contrato!' : 'Copiar Dados para Contrato'}</span>
            </button>

            {registration.contact_phone && (
              <button
                onClick={handleOpenWhatsApp}
                className="bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Conversar no WhatsApp"
              >
                <Send size={13} />
                <span>WhatsApp</span>
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => {
                  if (confirm('Deseja excluir esta ficha cadastral?')) {
                    onDelete(registration.id);
                    onClose();
                  }
                }}
                className="text-red-400 hover:text-red-300 p-2.5 rounded-xl hover:bg-red-500/10 transition-colors"
                title="Excluir cadastro"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {registration.status !== 'convertido' && onCreateClient && (
              <button
                onClick={handleConvertToClient}
                disabled={converting}
                className="bg-cs-primary hover:bg-cs-primary-hover text-black font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-cs-primary/10 disabled:opacity-50"
              >
                <FileCheck size={16} />
                <span>{converting ? 'Convertendo...' : 'Criar Cliente Oficial'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
