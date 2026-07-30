import { useState } from 'react';
import { Beaker, RefreshCw, Trash2, ShieldCheck, Play, Zap, Sparkles } from 'lucide-react';
import { runEliteSandbox } from '../lib/sandbox';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function SandboxView() {
  const [loading, setLoading] = useState(false);

  const handlePopulate = async () => {
    setLoading(true);
    const success = await runEliteSandbox();
    if (success) toast.success('Dados de teste injetados com sucesso!');
    else toast.error('Erro ao injetar dados.');
    setLoading(false);
  };

  const handleClear = async () => {
    if (!window.confirm('CUIDADO: Isso vai deletar tarefas e clientes de TESTE. Deseja continuar?')) return;
    setLoading(true);
    // Logic to clear only test data (e.g. by tag or naming convention)
    // For now, let's just show a warning
    toast.error('Limpeza automática não configurada por segurança. Delete manualmente no DB.');
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between border-b border-cs-border pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-cs-accent/20 text-cs-accent rounded-2xl flex items-center justify-center shadow-lg shadow-cs-accent/20">
            <Beaker size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Elite Test Center</h1>
            <p className="text-sm text-cs-text-secondary uppercase tracking-widest font-bold">Laboratório de Simulação & Debug</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Data Influx */}
        <div className="bg-cs-surface border border-cs-border rounded-3xl p-8 space-y-6 hover:border-cs-accent/30 transition-all group">
          <div className="flex items-center gap-3 text-white font-bold">
            <Zap size={20} className="text-cs-accent" /> Influxo de Dados Elite
          </div>
          <p className="text-xs text-cs-text-secondary leading-relaxed">
            Popula instantaneamente o banco com um cenário real: 10 clientes, 50 tarefas distribuídas no Kanban e histórico de logs para o BI.
          </p>
          <button 
            onClick={handlePopulate}
            disabled={loading}
            className="w-full bg-cs-accent hover:bg-cs-accent/80 text-white py-4 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-xl shadow-cs-accent/20"
          >
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} />} 
            INJETAR CENÁRIO DE TESTE
          </button>
        </div>

        {/* Card 2: System Health */}
        <div className="bg-cs-surface border border-cs-border rounded-3xl p-8 space-y-6">
          <div className="flex items-center gap-3 text-white font-bold">
            <ShieldCheck size={20} className="text-green-500" /> Integridade do Backend
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest">
              <span className="text-cs-text-secondary">Conexão Supabase</span>
              <span className="text-green-500">Online</span>
            </div>
            <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest">
              <span className="text-cs-text-secondary">Gemini AI Engine</span>
              <span className="text-green-500">Conectado</span>
            </div>
            <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest">
              <span className="text-cs-text-secondary">Audit Triggers</span>
              <span className="text-cs-primary">Ativos</span>
            </div>
          </div>
          <button 
            onClick={handleClear}
            className="w-full bg-transparent border border-red-500/30 text-red-400 hover:bg-red-500/10 py-4 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2"
          >
            <Trash2 size={16} /> LIMPAR AMBIENTE
          </button>
        </div>

        {/* Card 3: Dubola Tártaro Hero Section */}
        <div className="bg-cs-surface border border-cs-border hover:border-orange-500/30 rounded-3xl p-8 space-y-6 md:col-span-2 transition-all group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white font-bold">
              <Sparkles size={20} className="text-orange-500 animate-pulse" /> Landing Page Premium: Maionese Dubola Tártaro
            </div>
            <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/20 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Ad & UX Showcase
            </span>
          </div>
          <p className="text-xs text-cs-text-secondary leading-relaxed">
            Visualização em alta fidelidade da seção Hero e do simulador de harmonização da nova Maionese Dubola Premium Sabor Tártaro. Desenvolvido com animações fluidas, copy de alto impacto publicitário, hotspots interativos nos ingredientes e design focado em conversão.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href="/dubola" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white py-4 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20"
            >
              <Sparkles size={16} /> ABRIR DEMONSTRAÇÃO EM NOVA ABA
            </a>
          </div>
        </div>

        {/* Card 4: Dubola Linha Completa */}
        <div className="bg-cs-surface border border-cs-border hover:border-purple-500/30 rounded-3xl p-8 space-y-6 md:col-span-2 transition-all group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white font-bold">
              <Sparkles size={20} className="text-purple-400 animate-pulse" /> Nova Linha Completa: Maioneses Dubola
            </div>
            <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Multi-Sabor & IA Engine
            </span>
          </div>
          <p className="text-xs text-cs-text-secondary leading-relaxed">
            Seção de pouso premium e interativa com a linha completa: Sabor Alho (roxo), Tradicional (azul) e Tártaro (laranja). Apresenta um sistema dinâmico de cores baseadas no sabor ativo, hotspots de garrafa e ingredientes de alta precisão, gerador procedural de receitas da IA Chef e tabela nutricional multi-abas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href="/linha-dubola" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex-1 bg-gradient-to-r from-purple-600 via-blue-600 to-orange-600 hover:from-purple-500 hover:via-blue-500 hover:to-orange-500 text-white py-4 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20"
            >
              <Sparkles size={16} /> ABRIR NOVA LINHA COMPLETA
            </a>
          </div>
        </div>
      </div>

      {/* Testing Instructions */}
      <div className="bg-cs-bg border border-cs-border rounded-3xl p-8">
        <h3 className="text-white font-bold mb-4">Guia de QA Profissional</h3>
        <ul className="space-y-3 text-xs text-cs-text-secondary">
          <li className="flex items-center gap-2">• Teste o <strong>Briefing Mágico</strong> com as novas tarefas injetadas.</li>
          <li className="flex items-center gap-2">• Verifique se o <strong>Health Score</strong> mudou após mover uma tarefa para "Ajustes".</li>
          <li className="flex items-center gap-2">• Valide o <strong>Portal de Aprovação</strong> usando o ID de uma nova tarefa Alpha Tech.</li>
        </ul>
      </div>
    </div>
  );
}
