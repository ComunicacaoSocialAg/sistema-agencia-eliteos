import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useActiveClient } from '../contexts/ActiveClientContext';

const LOCAL_CAMPAIGNS_KEY = 'csag_custom_campaigns_v2';
const LOCAL_REPORTS_KEY = 'csag_custom_campaign_reports_v2';

export function useCampaignManagement() {
  const { selectedClientId, selectedClient, isAllClients, matchesSelectedClient } = useActiveClient();
  const [campaigns, setCampaigns] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    if (!isSupabaseConfigured || !supabase) {
      loadFromLocalStorage();
      setLoading(false);
      return;
    }

    try {
      const { data: campData, error: campErr } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: repData, error: repErr } = await supabase
        .from('campaign_reports')
        .select('*')
        .order('period_label', { ascending: false });

      if (!campErr && campData) {
        setCampaigns(campData);
        try { localStorage.setItem(LOCAL_CAMPAIGNS_KEY, JSON.stringify(campData)); } catch (_) {}
      } else {
        loadFromLocalStorage();
      }

      if (!repErr && repData) {
        setReports(repData);
        try { localStorage.setItem(LOCAL_REPORTS_KEY, JSON.stringify(repData)); } catch (_) {}
      }
    } catch (e) {
      console.warn('Erro ao carregar campanhas:', e);
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFromLocalStorage = () => {
    try {
      const savedCamp = localStorage.getItem(LOCAL_CAMPAIGNS_KEY);
      if (savedCamp) setCampaigns(JSON.parse(savedCamp));
      const savedRep = localStorage.getItem(LOCAL_REPORTS_KEY);
      if (savedRep) setReports(JSON.parse(savedRep));
    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtrar conforme o cliente ativo
  const filteredCampaigns = campaigns.filter(c => {
    if (isAllClients) return true;
    return matchesSelectedClient(c.client_id);
  });

  const filteredReports = reports.filter(r => {
    if (isAllClients) return true;
    return matchesSelectedClient(r.client_id);
  });

  // Criar campanha real
  const createCampaign = async (data) => {
    const id = `camp-${Date.now()}`;
    const newCamp = {
      id,
      client_id: data.client_id || selectedClient?.id || '87c0b28f-83f0-43ab-aefe-45bda539e8c2',
      name: data.name,
      platform: data.platform || 'Meta Ads',
      objective: data.objective || 'Leads',
      budget_monthly: Number(data.budget_monthly) || 0,
      budget_daily: Number(data.budget_daily) || 0,
      status: data.status || 'ativa',
      ad_url: data.ad_url || '',
      results_summary: data.results_summary || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setCampaigns(prev => [newCamp, ...prev]);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('campaigns').insert([newCamp]);
        if (error) throw error;
      } catch (err) {
        console.warn('Erro ao salvar no Supabase, mantendo local:', err);
      }
    }

    try {
      const current = JSON.parse(localStorage.getItem(LOCAL_CAMPAIGNS_KEY) || '[]');
      localStorage.setItem(LOCAL_CAMPAIGNS_KEY, JSON.stringify([newCamp, ...current]));
    } catch (_) {}

    toast.success('Campanha cadastrada com sucesso!');
    return newCamp;
  };

  // Atualizar status da campanha
  const updateCampaignStatus = async (campId, newStatus) => {
    setCampaigns(prev => prev.map(c => c.id === campId ? { ...c, status: newStatus, updated_at: new Date().toISOString() } : c));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('campaigns').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', campId);
      } catch (e) {
        console.warn(e);
      }
    }

    toast.success(`Status da campanha: ${newStatus}`);
  };

  // Excluir campanha
  const deleteCampaign = async (campId) => {
    setCampaigns(prev => prev.filter(c => c.id !== campId));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('campaigns').delete().eq('id', campId);
      } catch (e) {
        console.warn(e);
      }
    }

    toast.success('Campanha excluída.');
  };

  // Adicionar fechamento mensal de prestação de contas
  const addCampaignReport = async (reportData) => {
    const id = `rep-${Date.now()}`;
    const newReport = {
      id,
      client_id: reportData.client_id || selectedClient?.id || '87c0b28f-83f0-43ab-aefe-45bda539e8c2',
      period_label: reportData.period_label,
      invested_amount: Number(reportData.invested_amount) || 0,
      conversions_count: Number(reportData.conversions_count) || 0,
      cpa_real: Number(reportData.cpa_real) || 0,
      diagnosis: reportData.diagnosis || '',
      updated_at: new Date().toISOString()
    };

    setReports(prev => [newReport, ...prev]);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('campaign_reports').insert([newReport]);
      } catch (e) {
        console.warn(e);
      }
    }

    toast.success('Prestação de contas mensal registrada!');
  };

  return {
    campaigns: filteredCampaigns,
    allCampaigns: campaigns,
    reports: filteredReports,
    loading,
    createCampaign,
    updateCampaignStatus,
    deleteCampaign,
    addCampaignReport,
    refreshData: fetchData
  };
}
