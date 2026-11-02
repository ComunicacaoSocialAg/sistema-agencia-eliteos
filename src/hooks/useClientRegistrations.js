import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY = 'csag_client_registrations_v1';

export function useClientRegistrations() {
  const [registrations, setRegistrations] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(true);

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    let remoteData = null;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('client_registrations')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          remoteData = data;
        }
      } catch (err) {
        console.warn('Erro ao consultar client_registrations no Supabase:', err);
      }
    }

    setRegistrations((prevLocal) => {
      const safeLocal = Array.isArray(prevLocal) ? prevLocal : [];
      if (remoteData && Array.isArray(remoteData)) {
        // Mesclar dados remotos com locais para garantir que nenhum dado recém-enviado offline se perca
        const map = new Map();
        remoteData.forEach((item) => map.set(item.id, item));
        safeLocal.forEach((item) => {
          if (!map.has(item.id)) {
            map.set(item.id, item);
          }
        });
        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
        );
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        } catch {
          // ignore storage error
        }
        return merged;
      }
      return safeLocal;
    });

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRegistrations();

    const handleSync = (e) => {
      if (e?.detail) {
        setRegistrations((prev) => {
          const safe = Array.isArray(prev) ? prev : [];
          const exists = safe.some((r) => r.id === e.detail.id);
          const next = exists ? safe.map((r) => (r.id === e.detail.id ? e.detail : r)) : [e.detail, ...safe];
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          } catch {
            // ignore
          }
          return next;
        });
      }
    };

    window.addEventListener('csag:registration-added', handleSync);
    window.addEventListener('focus', fetchRegistrations);

    return () => {
      window.removeEventListener('csag:registration-added', handleSync);
      window.removeEventListener('focus', fetchRegistrations);
    };
  }, [fetchRegistrations]);

  const submitRegistration = async (formData) => {
    const newId = `reg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const nowIso = new Date().toISOString();

    const record = {
      id: newId,
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
      created_at: nowIso,
      raw_data: formData
    };

    // 1. Persistência local imediata (garantia contra perda de dados)
    try {
      const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const updated = [record, ...current.filter((item) => item.id !== record.id)];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setRegistrations(updated);
      window.dispatchEvent(new CustomEvent('csag:registration-added', { detail: record }));
    } catch (err) {
      console.warn('Erro ao salvar no storage local:', err);
    }

    // 2. Persistência no banco Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        // Remover id customizado se for uuid gerado pelo supabase ou permitir salvar direto
        const { data: dbData, error } = await supabase
          .from('client_registrations')
          .insert([
            {
              company_name: record.company_name,
              trade_name: record.trade_name,
              person_type: record.person_type,
              document_number: record.document_number,
              state_registration: record.state_registration,
              representative_name: record.representative_name,
              representative_cpf: record.representative_cpf,
              representative_role: record.representative_role,
              contact_phone: record.contact_phone,
              contact_email: record.contact_email,
              billing_email: record.billing_email,
              billing_day: record.billing_day,
              cep: record.cep,
              street: record.street,
              number: record.number,
              complement: record.complement,
              neighborhood: record.neighborhood,
              city: record.city,
              state: record.state,
              instagram_handle: record.instagram_handle,
              website_url: record.website_url,
              observations: record.observations,
              status: record.status,
              raw_data: record.raw_data
            }
          ])
          .select()
          .single();

        if (error) {
          console.warn('Aviso ao inserir no Supabase (mantido em redundância local):', error);
        } else if (dbData?.id) {
          // Atualiza com id oficial do banco
          record.id = dbData.id;
          try {
            const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            const updated = current.map((i) => (i.id === newId ? { ...i, id: dbData.id } : i));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            setRegistrations(updated);
          } catch {
            // ignore
          }
        }
      } catch (err) {
        console.warn('Exceção ao gravar no Supabase:', err);
      }
    }

    return { success: true, data: record };
  };

  const updateStatus = async (id, newStatus) => {
    setRegistrations((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('client_registrations')
          .update({ status: newStatus })
          .eq('id', id);
      } catch (err) {
        console.warn('Erro ao atualizar status no Supabase:', err);
      }
    }

    toast.success(`Status atualizado para: ${newStatus}`);
  };

  const deleteRegistration = async (id) => {
    setRegistrations((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('client_registrations')
          .delete()
          .eq('id', id);
      } catch (err) {
        console.warn('Erro ao remover no Supabase:', err);
      }
    }

    toast.success('Ficha cadastral removida.');
  };

  return {
    registrations,
    loading,
    submitRegistration,
    updateStatus,
    deleteRegistration,
    refresh: fetchRegistrations
  };
}
