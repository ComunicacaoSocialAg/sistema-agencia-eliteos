import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Users, DollarSign, BarChart, Settings, Bot, LogOut, Search, Bell, Sparkles, Shield, Beaker, Menu, X, ClipboardList, Palette, BarChart3 } from 'lucide-react';
import SandboxView from './views/SandboxView';
import { Toaster } from 'react-hot-toast';
import { cn } from './utils/cn';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AIAssistantProvider } from './contexts/AIAssistantContext';
import AIAssistant from './components/AIAssistant';
import LoginView from './views/LoginView';
import ProductionView from './views/ProductionView';
import CRMView from './views/CRMView';
import ClientsView from './views/ClientsView';
import ClientHubView from './views/ClientHubView';
import FinanceView from './views/FinanceView';
import ManagementView from './views/ManagementView';
import ReportsView from './views/ReportsView';
import AILayerView from './views/AILayerView';
import DashboardView from './views/DashboardView';
import BrandCenterView from './views/BrandCenterView';
import PaidMediaView from './views/PaidMediaView';
import PublicApprovalView from './views/PublicApprovalView';
import { useRecurring } from './hooks/useRecurring';
import { useNotifications } from './hooks/useNotifications';

// Role-based nav items
const ALL_NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Resumo pessoal do dia', roles: ['admin', 'commercial', 'production'] },
  { id: 'clientes', label: 'Clientes & Projetos', icon: Users, desc: 'Hub completo do cliente', roles: ['admin', 'commercial', 'production'] },
  { id: 'brandcenter', label: 'Brand Center & Drive', icon: Palette, desc: 'Identidade e arquivos', roles: ['admin', 'commercial', 'production'] },
  { id: 'producao', label: 'Atendimento & Produção', icon: ClipboardList, desc: 'Fluxo de trabalho', roles: ['admin', 'commercial', 'production'] },
  { id: 'crm', label: 'CRM & Vendas', icon: Briefcase, desc: 'Prospecção e conversão', roles: ['admin', 'commercial'] },
  { id: 'midia', label: 'Mídia Paga & Performance', icon: BarChart3, desc: 'Meta & Google Ads', roles: ['admin', 'commercial', 'production'] },
  { id: 'financeiro', label: 'Financeiro', icon: DollarSign, desc: 'Gestão e cobrança', roles: ['admin'] },
  { id: 'relatorios', label: 'Relatórios & BI', icon: BarChart, desc: 'Inteligência de resultados', roles: ['admin', 'commercial', 'production'] },
  { id: 'gestao', label: 'Gestão da Agência', icon: Settings, desc: 'Operação interna', roles: ['admin'] },
  { id: 'ia', label: 'Camada de IA', icon: Bot, desc: 'Gemini API (Gratuita)', roles: ['admin', 'commercial', 'production'] },
];

// Client-specific nav
const CLIENT_NAV_ITEMS = [
  { id: 'hub', label: 'Meu Painel', icon: LayoutDashboard, desc: 'Aprovações e campanhas', roles: ['client'] },
];

function AppShell() {
  const { profile, role, signOut, isDemoMode } = useAuth();
  const [searchValue, setSearchValue] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { checkAndGenerate } = useRecurring();
  const { alerts, dismiss, dismissAll } = useNotifications();

  // Guard: esperar até que o perfil esteja carregado
  const effectiveRole = role || 'admin';

  const [activeView, setActiveView] = useState(effectiveRole === 'client' ? 'hub' : 'dashboard');

  useEffect(() => {
    if (effectiveRole !== 'client') {
      checkAndGenerate();
    }
  }, [effectiveRole, checkAndGenerate]);

  const navItems = effectiveRole === 'client'
    ? CLIENT_NAV_ITEMS
    : ALL_NAV_ITEMS.filter(item => item.roles.includes(effectiveRole));

  const validView = (activeView === 'sandbox' && effectiveRole === 'admin') 
    ? 'sandbox' 
    : (navItems.find(i => i.id === activeView) ? activeView : navItems[0]?.id);

  return (
    <div className="flex h-screen bg-cs-bg text-cs-text-primary overflow-hidden font-sans selection:bg-cs-primary/30">
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "w-[272px] bg-cs-surface border-r border-cs-border flex flex-col shrink-0 transition-transform duration-300 z-40 fixed md:relative h-full",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-5 border-b border-cs-border relative">
          <button className="absolute top-5 right-4 md:hidden text-cs-text-secondary hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={20} />
          </button>
          <div className="flex items-center gap-3 mb-1">
            <img src="/logo.png" alt="Comunica Ag" className="h-9 shrink-0" />
            <span className="font-bold text-lg tracking-wide text-white">Comunica OS</span>
          </div>
          <div className="text-[11px] text-cs-text-secondary pl-12">comunicacaosocialag.com.br</div>
          {isDemoMode && (
            <div className="mt-2 ml-12 text-[10px] text-yellow-500 flex items-center gap-1">
              <Shield size={10} /> Modo demonstração
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5 custom-scrollbar">
          <div className="text-[10px] font-bold text-cs-text-secondary uppercase tracking-wider mb-3 px-3">
            {effectiveRole === 'client' ? 'Portal do Cliente' : 'Plataforma Core'}
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = validView === item.id;
            const isIA = item.id === 'ia';

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-left group relative",
                  isActive
                    ? isIA
                      ? "bg-cs-accent/10 text-cs-accent"
                      : "bg-cs-primary/10 text-white"
                    : "text-cs-text-secondary hover:bg-white/5 hover:text-white"
                )}
              >
                {isActive && (
                  <div className={cn("absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full", isIA ? "bg-cs-accent" : "bg-cs-primary")} />
                )}
                <div className={cn(
                  "p-1.5 rounded-lg shrink-0",
                  isActive
                    ? isIA ? "bg-cs-accent/20" : "bg-cs-primary/20"
                    : "bg-white/5 group-hover:bg-white/10"
                )}>
                  <Icon size={15} className={isActive ? (isIA ? "text-cs-accent" : "text-cs-primary") : "text-cs-text-secondary group-hover:text-white"} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={cn("text-sm font-medium leading-tight truncate", isActive ? "text-white" : "")}>{item.label}</div>
                  <div className="text-[10px] text-cs-text-secondary mt-0.5 truncate">{item.desc}</div>
                </div>
                {isIA && <Sparkles size={11} className="text-cs-accent shrink-0 animate-pulse" />}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-cs-border">
          <div className="flex items-center gap-3 p-2 bg-cs-bg rounded-xl border border-cs-border hover:border-cs-border/60 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cs-primary to-cs-accent flex items-center justify-center text-white font-bold text-xs shrink-0">
              {profile?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{profile?.name || 'Usuário'}</div>
              <div className="text-[10px] text-cs-text-secondary capitalize">{profile?.roleTitle || profile?.role}</div>
            </div>
            <button onClick={signOut} className="text-cs-text-secondary hover:text-red-400 transition-colors p-1.5 hover:bg-red-500/10 rounded-lg" title="Sair">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-cs-bg min-w-0 w-full relative">
        {/* Header */}
        <header className="h-14 border-b border-cs-border bg-cs-bg/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 z-10 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <button className="md:hidden text-cs-text-secondary hover:text-white" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-semibold text-white truncate">
              {navItems.find(i => i.id === validView)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cs-text-secondary" size={14} />
              <input
                type="text"
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                placeholder="Buscar em todo o OS..."
                className="bg-cs-surface border border-cs-border rounded-full pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:border-cs-primary focus:ring-1 focus:ring-cs-primary transition-all w-56 text-white placeholder:text-cs-text-secondary"
              />
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg text-cs-text-secondary hover:text-white hover:bg-cs-surface transition-colors"
              >
                <Bell size={18} />
                {alerts.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center px-1 animate-pulse">
                    {alerts.length}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-12 w-96 bg-cs-surface border border-cs-border rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-4 border-b border-cs-border flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Notificações</h3>
                    {alerts.length > 0 && (
                      <button onClick={dismissAll} className="text-[10px] text-cs-text-secondary hover:text-white font-bold uppercase">Limpar tudo</button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {alerts.length === 0 ? (
                      <div className="p-8 text-center text-cs-text-secondary text-sm">Nenhuma notificação pendente ✨</div>
                    ) : (
                      alerts.map(alert => (
                        <div key={alert.id} className="p-4 border-b border-cs-border/50 hover:bg-white/[0.02] transition-colors flex items-start gap-3">
                          <span className="text-lg">{alert.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white">{alert.title}</p>
                            <p className="text-[11px] text-cs-text-secondary mt-0.5 truncate">{alert.message}</p>
                          </div>
                          <button onClick={() => dismiss(alert.id)} className="text-cs-text-secondary hover:text-white text-xs p-1">✕</button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          {validView === 'dashboard' && <DashboardView />}
          {validView === 'clientes' && <ClientsView />}
          {validView === 'brandcenter' && <BrandCenterView />}
          {validView === 'producao' && <ProductionView />}
          {validView === 'crm' && <CRMView />}
          {validView === 'midia' && <PaidMediaView />}
          {validView === 'hub' && <ClientHubView />}
          {validView === 'financeiro' && <FinanceView />}
          {validView === 'relatorios' && <ReportsView />}
          {validView === 'gestao' && <ManagementView />}
          {validView === 'ia' && <AILayerView />}
          {validView === 'sandbox' && <SandboxView />}

        </div>
      </main>

      {/* Global AI Floating Assistant */}
      <AIAssistant />

      {/* Hidden Sandbox Entry for Admin */}
      {effectiveRole === 'admin' && (
        <button 
          onClick={() => setActiveView('sandbox')}
          className="fixed bottom-6 right-24 w-10 h-10 bg-cs-surface border border-cs-border rounded-full flex items-center justify-center text-cs-text-secondary hover:text-cs-accent hover:border-cs-accent transition-all z-[60] shadow-xl"
          title="Abrir Test Center"
        >
          <Beaker size={16} />
        </button>
      )}

      {/* Toast notifications */}
      <Toaster
        position="bottom-left"
        toastOptions={{
          style: {
            background: '#1e1e2e',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#e2e8f0',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#3b82f6', secondary: '#fff' } },
        }}
      />
    </div>
  );
}

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Global UI Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cs-bg flex items-center justify-center p-6">
          <div className="bg-cs-surface border border-cs-border rounded-3xl p-8 max-w-lg w-full shadow-2xl text-center">
             <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6 border border-red-500/20">
               <span className="text-red-500 text-3xl">⚠️</span>
             </div>
             <h1 className="text-2xl font-bold text-white mb-2">Ops, algo deu errado!</h1>
             <p className="text-cs-text-secondary text-sm mb-6">Encontramos um erro ao renderizar esta tela.</p>
             <div className="bg-black/50 p-4 rounded-xl text-left overflow-auto mb-6 border border-red-500/10">
                <code className="text-red-400 text-xs whitespace-pre-wrap font-mono">
                  {this.state.error?.toString()}
                </code>
             </div>
             <button 
               onClick={() => window.location.reload()}
               className="bg-cs-primary hover:bg-cs-primary-hover text-white px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all w-full"
             >
               Recarregar Sistema
             </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AuthGate() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-cs-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img src="/logo.png" alt="Comunica" className="h-12 object-contain" />
          <div className="w-40 h-0.5 bg-cs-surface rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cs-primary to-cs-accent rounded-full w-3/4 animate-pulse"></div>
          </div>
          <p className="text-cs-text-secondary text-sm">Carregando Comunica OS...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/aprovar/:taskId" element={<PublicApprovalView />} />
      <Route path="/login" element={!user ? <LoginView /> : <Navigate to="/" />} />
      <Route path="/*" element={user ? <AppShell /> : <Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <GlobalErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AIAssistantProvider>
            <AuthGate />
          </AIAssistantProvider>
        </AuthProvider>
      </BrowserRouter>
    </GlobalErrorBoundary>
  );
}
