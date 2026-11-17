import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY = 'csag_client_registrations_v1';

function readLocal() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function useClientRegistrations() {
  const { role, isDemoMode } = useAuth();
  const remote = isSupabaseConfigured;
  const canManage = isDemoMode || ['admin', 'commercial'].includes(role);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(canManage);

  const fetchRegistrations = useCallback(async () => {
    if (!canManage) return;
    try {
      if (!remote) {
        setRegistrations(readLocal());
        return;
      }
      const { data, error } = await supabase.from('client_registrations').select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setRegistrations(data);
    } catch {
      toast.error('As fichas cadastrais não puderam ser carregadas.');
    } finally {
      setLoading(false);
    }
  }, [canManage, remote]);

  useEffect(() => {
    if (!canManage) return;
    fetchRegistrations();
    window.addEventListener('csag:registration-changed', fetchRegistrations);
    window.addEventListener('focus', fetchRegistrations);
    return () => {
      window.removeEventListener('csag:registration-changed', fetchRegistrations);
      window.removeEventListener('focus', fetchRegistrations);
    };
  }, [canManage, fetchRegistrations]);

  const submitRegistration = async (formData) => {
    if (!remote && !isDemoMode) return { success: false };
    const record = {
      id: crypto.randomUUID(),
      company_name: formData.company_name?.trim() || '',
      trade_name: formData.trade_name?.trim() || formData.company_name?.trim() || '',
      person_type: formData.person_type || 'PJ',
      document_number: formData.document_number?.trim() || '',
      state_registration: formData.state_registration?.trim() || '',
      representative_name: formData.representative_name?.trim() || '',
      representative_cpf: formData.representative_cpf?.trim() || '',
      representative_role: formData.representative_role?.trim() || 'Sócio Administrador',
      contact_phone: formData.contact_phone?.trim() || '',
      contact_email: formData.contact_email?.trim() || '',
      billing_email: formData.billing_email?.trim() || formData.contact_email?.trim() || '',
      billing_day: formData.billing_day || '10',
      cep: formData.cep?.trim() || '',
      street: formData.street?.trim() || '',
      number: formData.number?.trim() || '',
      complement: formData.complement?.trim() || '',
      neighborhood: formData.neighborhood?.trim() || '',
      city: formData.city?.trim() || '',
      state: formData.state?.trim() || '',
      instagram_handle: formData.instagram_handle?.trim() || '',
      website_url: formData.website_url?.trim() || '',
      observations: formData.observations?.trim() || '',
      status: 'pendente',
      created_at: new Date().toISOString()
    };

    try {
      if (remote) {
        const { error } = await supabase.from('client_registrations').insert(record);
        if (error) throw error;
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([record, ...readLocal()]));
      }
      window.dispatchEvent(new Event('csag:registration-changed'));
      return { success: true, data: { id: record.id } };
    } catch {
      return { success: false };
    }
  };

  const changeRegistration = async (id, newStatus) => {
    if (!canManage) return false;
    try {
      if (remote) {
        const table = supabase.from('client_registrations');
        const operation = newStatus ? table.update({ status: newStatus }) : table.delete();
        const { data, error } = await operation.eq('id', id).select('id').single();
        if (error || !data) throw error;
      } else {
        const updated = newStatus
          ? readLocal().map(item => item.id === id ? { ...item, status: newStatus } : item)
          : readLocal().filter(item => item.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      window.dispatchEvent(new Event('csag:registration-changed'));
      toast.success(newStatus ? 'Status atualizado.' : 'Ficha cadastral removida.');
      return true;
    } catch {
      toast.error('Não foi possível gravar a mudança da ficha cadastral.');
      return false;
    }
  };

  return {
    registrations: canManage ? registrations : [],
    loading: canManage && loading,
    submitRegistration,
    updateStatus: changeRegistration,
    deleteRegistration: id => changeRegistration(id, null),
    refresh: fetchRegistrations,
  };
}
