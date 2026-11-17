import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useActiveClient } from '../contexts/ActiveClientContext';

const CAMPAIGNS_KEY = 'csag_custom_campaigns_v2';
const REPORTS_KEY = 'csag_custom_campaign_reports_v2';
const remote = isSupabaseConfigured;

function readStored(key) {
  try {
    const values = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(values) ? values : [];
  } catch {
    return [];
  }
}

function confirmed({ data, error }) {
  if (error || !data) throw error || new Error('Gravação não confirmada');
  return data;
}

export function useCampaignManagement() {
  const { isAllClients, matchesSelectedClient } = useActiveClient();
  const [campaigns, setCampaigns] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (remote) {
        const [campaignsResult, reportsResult] = await Promise.all([
          supabase.from('campaigns').select('*').order('created_at', { ascending: false }),
          supabase.from('campaign_reports').select('*').order('updated_at', { ascending: false }),
        ]);
        if (!campaignsResult.error) setCampaigns(campaignsResult.data || []);
        if (!reportsResult.error) setReports(reportsResult.data || []);
        if (campaignsResult.error || reportsResult.error) throw new Error('Falha de leitura');
      } else {
        setCampaigns(readStored(CAMPAIGNS_KEY));
        setReports(readStored(REPORTS_KEY));
      }
      setError('');
    } catch {
      setError('Não foi possível carregar todas as campanhas e prestações de contas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function changeCampaign(id, changes, creating = false) {
    try {
      const values = { ...changes, updated_at: new Date().toISOString() };
      let saved;
      if (remote) {
        const table = supabase.from('campaigns');
        const operation = creating ? table.insert({ ...values, id })
          : changes ? table.update(values).eq('id', id) : table.delete().eq('id', id);
        saved = confirmed(await operation.select().single());
      } else {
        const items = readStored(CAMPAIGNS_KEY);
        const previous = items.find(item => item.id === id);
        if (!creating && !previous) return null;
        saved = { ...previous, ...values, id };
        const next = creating ? [saved, ...items]
          : changes ? items.map(item => item.id === id ? saved : item) : items.filter(item => item.id !== id);
        localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(next));
      }
      setCampaigns(items => creating ? [saved, ...items]
        : changes ? items.map(item => item.id === id ? saved : item) : items.filter(item => item.id !== id));
      toast.success(creating ? 'Campanha registrada.' : changes ? 'Campanha atualizada.' : 'Campanha removida.');
      return saved;
    } catch {
      toast.error('A mudança na campanha não foi confirmada. Tente novamente.');
      return null;
    }
  }

  async function createCampaign(values) {
    if (!values.client_id || !values.name?.trim()) {
      toast.error('Selecione um cliente e informe o nome da campanha.');
      return null;
    }
    return changeCampaign('camp-' + crypto.randomUUID(), {
      ...values, name: values.name.trim(), created_at: new Date().toISOString(),
    }, true);
  }

  async function addCampaignReport(values) {
    if (!values.client_id || !values.period_label?.trim()) {
      toast.error('Selecione o cliente e informe o período.');
      return null;
    }
    const report = {
      ...values, id: 'rep-' + crypto.randomUUID(), period_label: values.period_label.trim(),
      invested_amount: Number(values.invested_amount) || 0, conversions_count: Number(values.conversions_count) || 0,
      cpa_real: Number(values.cpa_real) || 0, updated_at: new Date().toISOString(),
    };
    try {
      const saved = remote ? confirmed(await supabase.from('campaign_reports').insert(report).select().single()) : report;
      if (!remote) localStorage.setItem(REPORTS_KEY, JSON.stringify([saved, ...readStored(REPORTS_KEY)]));
      setReports(items => [saved, ...items]);
      toast.success('Prestação de contas registrada.');
      return saved;
    } catch {
      toast.error('A prestação de contas não foi salva. Tente novamente.');
      return null;
    }
  }

  return {
    campaigns: isAllClients ? campaigns : campaigns.filter(item => matchesSelectedClient(item.client_id)),
    allCampaigns: campaigns,
    reports: isAllClients ? reports : reports.filter(item => matchesSelectedClient(item.client_id)),
    loading, error, createCampaign, addCampaignReport,
    updateCampaignStatus: (id, status) => changeCampaign(id, { status }),
    deleteCampaign: id => changeCampaign(id, null),
    refreshData: fetchData,
  };
}
