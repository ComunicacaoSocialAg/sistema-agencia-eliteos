import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useClients } from '../hooks/useClients';

const ActiveClientContext = createContext(null);

const STORAGE_KEY = 'csag_active_client_id_v2';

export const CLIENT_ALIASES = {
  'client-alberto-brasil': ['87c0b28f-83f0-43ab-aefe-45bda539e8c2', 'client-alberto-brasil', 'client-dr-alberto'],
  '87c0b28f-83f0-43ab-aefe-45bda539e8c2': ['87c0b28f-83f0-43ab-aefe-45bda539e8c2', 'client-alberto-brasil', 'client-dr-alberto'],
  'client-dubola': ['ce45a984-093d-4484-9ee4-9177d56310e3', 'client-dubola', 'ce45a984'],
  'ce45a984-093d-4484-9ee4-9177d56310e3': ['ce45a984-093d-4484-9ee4-9177d56310e3', 'client-dubola', 'ce45a984']
};

export function ActiveClientProvider({ children }) {
  const { clients, loading } = useClients();
  const [selectedClientId, setSelectedClientIdState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'all';
    } catch {
      return 'all';
    }
  });

  const setSelectedClientId = (id) => {
    setSelectedClientIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch (e) {
      console.warn('Erro ao salvar cliente ativo:', e);
    }
  };

  const selectedClient = useMemo(() => {
    if (selectedClientId === 'all') return null;
    return clients.find(c => {
      if (c.id === selectedClientId) return true;
      const aliases = CLIENT_ALIASES[selectedClientId] || [];
      return aliases.includes(c.id);
    }) || null;
  }, [clients, selectedClientId]);

  // Função utilitária resiliente para checagem em qualquer tela
  const matchesSelectedClient = (targetClientId) => {
    if (!targetClientId || selectedClientId === 'all') return true;
    if (targetClientId === selectedClientId) return true;
    const activeAliases = CLIENT_ALIASES[selectedClientId] || [selectedClientId];
    const targetAliases = CLIENT_ALIASES[targetClientId] || [targetClientId];
    return activeAliases.some(a => targetAliases.includes(a));
  };

  const value = {
    selectedClientId,
    setSelectedClientId,
    selectedClient,
    isAllClients: selectedClientId === 'all',
    matchesSelectedClient,
    clients,
    loading
  };

  return (
    <ActiveClientContext.Provider value={value}>
      {children}
    </ActiveClientContext.Provider>
  );
}

export function useActiveClient() {
  const context = useContext(ActiveClientContext);
  if (!context) {
    throw new Error('useActiveClient deve ser usado dentro de ActiveClientProvider');
  }
  return context;
}
