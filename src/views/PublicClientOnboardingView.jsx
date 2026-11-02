import React, { useState } from 'react';
import { 
  Building2, 
  UserCheck, 
  MapPin, 
  CreditCard, 
  Globe, 
  CheckCircle2, 
  Send, 
  ShieldCheck, 
  Search, 
  FileText, 
  Phone, 
  Mail, 
  Lock,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useClientRegistrations } from '../hooks/useClientRegistrations';

function InstagramIcon({ size = 18, className = "" }) {
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

export default function PublicClientOnboardingView() {
  const { submitRegistration } = useClientRegistrations();

  const [personType, setPersonType] = useState('PJ'); // 'PJ' ou 'PF'
  const [loadingCep, setLoadingCep] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  const [form, setForm] = useState({
    company_name: '',
    trade_name: '',
    document_number: '',
    state_registration: '',
    representative_name: '',
    representative_cpf: '',
    representative_role: 'Sócio Administrador',
    contact_phone: '',
    contact_email: '',
    billing_email: '',
    billing_day: '10',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: 'Poços de Caldas',
    state: 'MG',
    instagram_handle: '',
    website_url: '',
    observations: ''
  });

  // Formatadores de campos
  const formatDocument = (value, type) => {
    const digits = value.replace(/\D/g, '');
    if (type === 'PJ') {
      // 00.000.000/0000-00
      return digits
        .slice(0, 14)
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      // 000.000.000-00
      return digits
        .slice(0, 11)
        .replace(/^(\d{3})(\d)/, '$1.$2')
        .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1-$2');
    }
  };

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 10) {
      return digits
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return digits
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  };

  const formatCep = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    return digits.replace(/^(\d{5})(\d)/, '$1-$2');
  };

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCepLookup = async (cepValue) => {
    const clean = (cepValue || form.cep).replace(/\D/g, '');
    if (clean.length !== 8) return;

    setLoadingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm((prev) => ({
          ...prev,
          street: data.logradouro || prev.street,
          neighborhood: data.bairro || prev.neighborhood,
          city: data.localidade || prev.city,
          state: data.uf || prev.state
        }));
        toast.success('Endereço preenchido automaticamente.');
      } else {
        toast.error('CEP não localizado. Preencha o endereço manualmente.');
      }
    } catch {
      toast.error('Não foi possível buscar o CEP agora. Preencha manualmente.');
    } finally {
      setLoadingCep(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validações básicas
    if (!form.company_name.trim()) {
      toast.error(personType === 'PJ' ? 'Informe a Razão Social da empresa.' : 'Informe o seu Nome Completo.');
      return;
    }
    if (!form.document_number.trim()) {
      toast.error(personType === 'PJ' ? 'Informe o CNPJ da empresa.' : 'Informe o seu CPF.');
      return;
    }
    if (!form.representative_name.trim()) {
      toast.error('Informe o nome do responsável pelo contrato.');
      return;
    }
    if (!form.contact_phone.trim()) {
      toast.error('Informe o telefone ou WhatsApp para contato.');
      return;
    }
    if (!form.contact_email.trim()) {
      toast.error('Informe o e-mail de contato para envio do contrato.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        person_type: personType
      };

      const res = await submitRegistration(payload);
      if (res?.success) {
        setSubmittedData(payload);
        toast.success('Dados cadastrais enviados com sucesso!');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        toast.error('Ocorreu um erro ao salvar os dados. Tente novamente.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erro ao enviar cadastro. Verifique sua conexão.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNotifyWhatsapp = () => {
    const nomeEmpresa = submittedData?.trade_name || submittedData?.company_name || 'minha empresa';
    const msg = encodeURIComponent(`Olá Bruno, acabei de preencher os dados cadastrais da ${nomeEmpresa} no formulário seguro para início do nosso contrato!`);
    // Abre no WhatsApp direto
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  // Se já tiver enviado, exibe a tela de confirmação
  if (submittedData) {
    return (
      <div className="min-h-screen bg-cs-bg text-cs-text-primary flex flex-col justify-center items-center p-4 selection:bg-cs-primary/30">
        <div className="w-full max-w-xl bg-cs-surface border border-cs-border rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Top highlight bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cs-primary via-emerald-400 to-cs-accent" />

          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 size={36} />
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-cs-primary tracking-widest uppercase mb-1">
              <ShieldCheck size={14} /> Comunicação Social Ag
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Ficha cadastral recebida!
            </h1>

            <p className="text-sm text-cs-text-secondary mt-2 max-w-md leading-relaxed">
              Os dados de <strong className="text-white">{submittedData.trade_name || submittedData.company_name}</strong> foram salvos com sucesso na nossa base de dados.
            </p>
          </div>

          {/* Resumo rápido dos dados salvos */}
          <div className="bg-cs-bg/70 border border-cs-border/80 rounded-2xl p-4 sm:p-5 mb-8 space-y-3 text-left">
            <div className="text-[11px] font-bold text-cs-text-secondary uppercase tracking-wider mb-2">
              Resumo do cadastro enviado
            </div>
            <div className="flex justify-between items-center text-xs pb-2 border-b border-cs-border/40">
              <span className="text-cs-text-secondary">Contratante:</span>
              <span className="font-semibold text-white truncate max-w-[240px]">{submittedData.company_name}</span>
            </div>
            <div className="flex justify-between items-center text-xs pb-2 border-b border-cs-border/40">
              <span className="text-cs-text-secondary">Documento:</span>
              <span className="font-mono font-medium text-white">{submittedData.document_number}</span>
            </div>
            <div className="flex justify-between items-center text-xs pb-2 border-b border-cs-border/40">
              <span className="text-cs-text-secondary">Responsável:</span>
              <span className="font-semibold text-white">{submittedData.representative_name}</span>
            </div>
            <div className="flex justify-between items-center text-xs pb-2 border-b border-cs-border/40">
              <span className="text-cs-text-secondary">E-mail:</span>
              <span className="text-white truncate max-w-[240px]">{submittedData.contact_email}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-cs-text-secondary">WhatsApp:</span>
              <span className="text-white">{submittedData.contact_phone}</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleNotifyWhatsapp}
              className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-black font-extrabold py-3.5 px-6 rounded-2xl transition-all shadow-xl shadow-[#25D366]/20 flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <Send size={18} />
              Avisar Bruno no WhatsApp
            </button>

            <button
              onClick={() => setSubmittedData(null)}
              className="w-full bg-cs-surface hover:bg-white/5 border border-cs-border text-cs-text-secondary hover:text-white py-3 px-6 rounded-2xl transition-all text-xs font-semibold cursor-pointer"
            >
              Enviar outra ficha ou corrigir dados
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-cs-border/60 text-center text-[11px] text-cs-text-secondary flex items-center justify-center gap-1.5">
            <Lock size={12} className="text-emerald-400" />
            Dados transmitidos de forma segura e confidencial.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cs-bg text-cs-text-primary py-8 px-4 sm:px-6 lg:px-8 selection:bg-cs-primary/30">
      <div className="max-w-2xl mx-auto">
        {/* Cabeçalho de autoridade */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cs-surface border border-cs-border text-xs text-cs-text-secondary mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Comunicação Social Ag: Poços de Caldas, MG
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Ficha Cadastral: Início de Contrato
          </h1>
          <p className="text-xs sm:text-sm text-cs-text-secondary mt-2 max-w-lg mx-auto leading-relaxed">
            Preencha seus dados cadastrais para elaboração da minuta de contrato e configuração da sua conta na agência. Leva menos de 2 minutos.
          </p>
        </div>

        {/* Formulário Principal */}
        <form onSubmit={handleSubmit} className="bg-cs-surface border border-cs-border rounded-3xl p-5 sm:p-8 shadow-2xl space-y-8">
          
          {/* Seletor de Tipo de Pessoa */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-cs-text-secondary mb-3">
              Tipo de Contratante
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setPersonType('PJ');
                  setForm((prev) => ({ ...prev, document_number: '' }));
                }}
                className={`py-3 px-4 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  personType === 'PJ'
                    ? 'bg-cs-primary text-black border-cs-primary shadow-lg shadow-cs-primary/20'
                    : 'bg-cs-bg border-cs-border text-cs-text-secondary hover:text-white hover:border-cs-border/80'
                }`}
              >
                <Building2 size={16} /> Pessoa Jurídica (CNPJ)
              </button>
              <button
                type="button"
                onClick={() => {
                  setPersonType('PF');
                  setForm((prev) => ({ ...prev, document_number: '' }));
                }}
                className={`py-3 px-4 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  personType === 'PF'
                    ? 'bg-cs-primary text-black border-cs-primary shadow-lg shadow-cs-primary/20'
                    : 'bg-cs-bg border-cs-border text-cs-text-secondary hover:text-white hover:border-cs-border/80'
                }`}
              >
                <UserCheck size={16} /> Pessoa Física (CPF)
              </button>
            </div>
          </div>

          {/* 1. Dados da Empresa / Contratante */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-cs-border text-white font-bold text-sm">
              <Building2 size={18} className="text-cs-primary" />
              <span>1. Dados da Empresa / Contratante</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-cs-text-secondary mb-1.5">
                  {personType === 'PJ' ? 'Razão Social Completa *' : 'Nome Completo *'}
                </label>
                <input
                  type="text"
                  required
                  value={form.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  placeholder={personType === 'PJ' ? 'Ex: Clínica Odontológica Silva Ltda' : 'Ex: João da Silva'}
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-sm text-white placeholder-cs-text-secondary/50 focus:outline-none focus:border-cs-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-cs-text-secondary mb-1.5">
                  Nome Fantasia / Marca
                </label>
                <input
                  type="text"
                  value={form.trade_name}
                  onChange={(e) => handleInputChange('trade_name', e.target.value)}
                  placeholder="Como a marca é conhecida"
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-sm text-white placeholder-cs-text-secondary/50 focus:outline-none focus:border-cs-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-cs-text-secondary mb-1.5">
                  {personType === 'PJ' ? 'CNPJ *' : 'CPF *'}
                </label>
                <input
                  type="text"
                  required
                  value={form.document_number}
                  onChange={(e) => handleInputChange('document_number', formatDocument(e.target.value, personType))}
                  placeholder={personType === 'PJ' ? '00.000.000/0000-00' : '000.000.000-00'}
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-cs-text-secondary/50 focus:outline-none focus:border-cs-primary transition-all"
                />
              </div>

              {personType === 'PJ' && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-cs-text-secondary mb-1.5">
                    Inscrição Estadual ou Municipal (se houver, ou 'Isento')
                  </label>
                  <input
                    type="text"
                    value={form.state_registration}
                    onChange={(e) => handleInputChange('state_registration', e.target.value)}
                    placeholder="Isento ou número da inscrição"
                    className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-sm text-white placeholder-cs-text-secondary/50 focus:outline-none focus:border-cs-primary transition-all"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 2. Representante Legal (quem assina o contrato) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-cs-border text-white font-bold text-sm">
              <UserCheck size={18} className="text-cs-primary" />
              <span>2. Representante Legal (quem assina o contrato)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-cs-text-secondary mb-1.5">
                  Nome Completo do Responsável *
                </label>
                <input
                  type="text"
                  required
                  value={form.representative_name}
                  onChange={(e) => handleInputChange('representative_name', e.target.value)}
                  placeholder="Nome de quem assinará"
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-sm text-white placeholder-cs-text-secondary/50 focus:outline-none focus:border-cs-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-cs-text-secondary mb-1.5">
                  CPF do Responsável *
                </label>
                <input
                  type="text"
                  required
                  value={form.representative_cpf}
                  onChange={(e) => handleInputChange('representative_cpf', formatDocument(e.target.value, 'PF'))}
                  placeholder="000.000.000-00"
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-cs-text-secondary/50 focus:outline-none focus:border-cs-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-cs-text-secondary mb-1.5">
                  Cargo / Função
                </label>
                <input
                  type="text"
                  value={form.representative_role}
                  onChange={(e) => handleInputChange('representative_role', e.target.value)}
                  placeholder="Ex: Sócio Administrador, Diretor"
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-sm text-white placeholder-cs-text-secondary/50 focus:outline-none focus:border-cs-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-cs-text-secondary mb-1.5">
                  WhatsApp / Telefone Direto *
                </label>
                <input
                  type="text"
                  required
                  value={form.contact_phone}
                  onChange={(e) => handleInputChange('contact_phone', formatPhone(e.target.value))}
                  placeholder="(35) 99999-9999"
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-sm text-white placeholder-cs-text-secondary/50 focus:outline-none focus:border-cs-primary transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-cs-text-secondary mb-1.5">
                  E-mail para envio da minuta e assinatura digital *
                </label>
                <input
                  type="email"
                  required
                  value={form.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  placeholder="seuemail@empresa.com.br"
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-sm text-white placeholder-cs-text-secondary/50 focus:outline-none focus:border-cs-primary transition-all"
                />
              </div>
            </div>
          </div>

          {/* 3. Endereço Completo */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-cs-border text-white font-bold text-sm">
              <MapPin size={18} className="text-cs-primary" />
              <span>3. Endereço da Empresa</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-cs-text-secondary mb-1.5">
                  CEP
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.cep}
                    onChange={(e) => {
                      const v = formatCep(e.target.value);
                      handleInputChange('cep', v);
                      if (v.replace(/\D/g, '').length === 8) {
                        handleCepLookup(v);
                      }
                    }}
                    onBlur={() => handleCepLookup(form.cep)}
                    placeholder="37701-000"
                    className="w-full bg-cs-bg border border-cs-border rounded-xl pl-4 pr-10 py-3 text-sm text-white font-mono placeholder-cs-text-secondary/50 focus:outline-none focus:border-cs-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleCepLookup(form.cep)}
                    disabled={loadingCep}
                    className="absolute right-3 top-3 text-cs-text-secondary hover:text-white"
                    title="Buscar CEP"
                  >
                    <Search size={16} className={loadingCep ? "animate-spin text-cs-primary" : ""} />
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-cs-text-secondary mb-1.5">
                  Rua / Avenida / Logradouro
                </label>
                <input
                  type="text"
                  value={form.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                  placeholder="Ex: Rua Assis Figueiredo"
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-sm text-white placeholder-cs-text-secondary/50 focus:outline-none focus:border-cs-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-cs-text-secondary mb-1.5">
                  Número
                </label>
                <input
                  type="text"
                  value={form.number}
                  onChange={(e) => handleInputChange('number', e.target.value)}
                  placeholder="123"
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-sm text-white placeholder-cs-text-secondary/50 focus:outline-none focus:border-cs-primary transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-cs-text-secondary mb-1.5">
                  Complemento / Sala / Andar
                </label>
                <input
                  type="text"
                  value={form.complement}
                  onChange={(e) => handleInputChange('complement', e.target.value)}
                  placeholder="Ex: Sala 402, Edifício Unique"
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-sm text-white placeholder-cs-text-secondary/50 focus:outline-none focus:border-cs-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-cs-text-secondary mb-1.5">
                  Bairro
                </label>
                <input
                  type="text"
                  value={form.neighborhood}
                  onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                  placeholder="Centro"
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-sm text-white placeholder-cs-text-secondary/50 focus:outline-none focus:border-cs-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-cs-text-secondary mb-1.5">
                  Cidade
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Poços de Caldas"
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-sm text-white placeholder-cs-text-secondary/50 focus:outline-none focus:border-cs-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-cs-text-secondary mb-1.5">
                  Estado (UF)
                </label>
                <input
                  type="text"
                  maxLength={2}
                  value={form.state}
                  onChange={(e) => handleInputChange('state', e.target.value.toUpperCase())}
                  placeholder="MG"
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-sm text-white uppercase placeholder-cs-text-secondary/50 focus:outline-none focus:border-cs-primary transition-all"
                />
              </div>
            </div>
          </div>

          {/* 4. Faturamento e Vencimento */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-cs-border text-white font-bold text-sm">
              <CreditCard size={18} className="text-cs-primary" />
              <span>4. Faturamento & Financeiro</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-cs-text-secondary mb-1.5">
                  Melhor dia de vencimento para mensalidade
                </label>
                <select
                  value={form.billing_day}
                  onChange={(e) => handleInputChange('billing_day', e.target.value)}
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cs-primary transition-all cursor-pointer"
                >
                  <option value="05">Dia 05 de cada mês</option>
                  <option value="10">Dia 10 de cada mês (padrão)</option>
                  <option value="15">Dia 15 de cada mês</option>
                  <option value="20">Dia 20 de cada mês</option>
                  <option value="25">Dia 25 de cada mês</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-cs-text-secondary mb-1.5">
                  E-mail financeiro para envio de NF e boletos (se diferente)
                </label>
                <input
                  type="email"
                  value={form.billing_email}
                  onChange={(e) => handleInputChange('billing_email', e.target.value)}
                  placeholder="financeiro@empresa.com.br"
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-sm text-white placeholder-cs-text-secondary/50 focus:outline-none focus:border-cs-primary transition-all"
                />
              </div>
            </div>
          </div>

          {/* 5. Presença Digital & Redes */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-cs-border text-white font-bold text-sm">
              <InstagramIcon size={18} className="text-cs-primary" />
              <span>5. Presença Digital Inicial</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-cs-text-secondary mb-1.5">
                  Instagram da Marca (@)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-cs-text-secondary text-sm">@</span>
                  <input
                    type="text"
                    value={form.instagram_handle.replace(/^@/, '')}
                    onChange={(e) => handleInputChange('instagram_handle', `@${e.target.value.replace(/^@/, '')}`)}
                    placeholder="suaempresa"
                    className="w-full bg-cs-bg border border-cs-border rounded-xl pl-8 pr-4 py-3 text-sm text-white placeholder-cs-text-secondary/50 focus:outline-none focus:border-cs-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-cs-text-secondary mb-1.5">
                  Site ou Linktree (se possuir)
                </label>
                <input
                  type="text"
                  value={form.website_url}
                  onChange={(e) => handleInputChange('website_url', e.target.value)}
                  placeholder="https://suaempresa.com.br"
                  className="w-full bg-cs-bg border border-cs-border rounded-xl px-4 py-3 text-sm text-white placeholder-cs-text-secondary/50 focus:outline-none focus:border-cs-primary transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-cs-text-secondary mb-1.5">
                  Observações adicionais ou alinhamentos para o contrato
                </label>
                <textarea
                  rows={3}
                  value={form.observations}
                  onChange={(e) => handleInputChange('observations', e.target.value)}
                  placeholder="Alguma particularidade importante da sua empresa ou expectativa inicial..."
                  className="w-full bg-cs-bg border border-cs-border rounded-xl p-3 text-sm text-white placeholder-cs-text-secondary/50 focus:outline-none focus:border-cs-primary transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Botão de Envio com feedback */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-cs-primary hover:bg-cs-primary-hover text-black font-extrabold py-4 px-6 rounded-2xl transition-all shadow-xl shadow-cs-primary/20 flex items-center justify-center gap-3 cursor-pointer text-base disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Salvando dados com segurança...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Enviar Dados Cadastrais para o Contrato</span>
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-cs-text-secondary mt-3 flex items-center justify-center gap-1.5">
              <Lock size={12} className="text-emerald-400" />
              Ambiente seguro da Comunicação Social Ag. Seus dados cadastrais não são compartilhados com terceiros.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
