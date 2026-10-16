import React, { createContext, useContext, useState, useMemo } from 'react';
import { useClients } from '../hooks/useClients';

const ActiveClientContext = createContext(null);

const STORAGE_KEY = 'csag_active_client_id_v2';

export const CLIENT_ALIASES = {
  'client-alberto-brasil': ['87c0b28f-83f0-43ab-aefe-45bda539e8c2', 'client-alberto-brasil', 'client-dr-alberto'],
  'client-dr-alberto': ['87c0b28f-83f0-43ab-aefe-45bda539e8c2', 'client-alberto-brasil', 'client-dr-alberto'],
  '87c0b28f-83f0-43ab-aefe-45bda539e8c2': ['87c0b28f-83f0-43ab-aefe-45bda539e8c2', 'client-alberto-brasil', 'client-dr-alberto'],
  'client-dubola': ['ce45a984-093d-4484-9ee4-9177d56310e3', 'client-dubola', 'ce45a984'],
  'ce45a984-093d-4484-9ee4-9177d56310e3': ['ce45a984-093d-4484-9ee4-9177d56310e3', 'client-dubola', 'ce45a984']
};

export function getClientAliases(idOrName) {
  if (!idOrName) return [];
  const raw = String(idOrName).trim();
  if (CLIENT_ALIASES[raw]) return CLIENT_ALIASES[raw];
  const lower = raw.toLowerCase();
  if (lower.includes('alberto')) return CLIENT_ALIASES['client-alberto-brasil'];
  if (lower.includes('dubola')) return CLIENT_ALIASES['client-dubola'];
  return [raw];
}

export function areClientIdsEquivalent(idA, idB, nameA = '', nameB = '') {
  if (idA && idB && String(idA) === String(idB)) return true;
  const aliasesA = new Set([
    ...getClientAliases(idA),
    ...getClientAliases(nameA)
  ]);
  const aliasesB = new Set([
    ...getClientAliases(idB),
    ...getClientAliases(nameB)
  ]);
  for (const a of aliasesA) {
    if (aliasesB.has(a)) return true;
  }
  if (nameA && nameB && String(nameA).trim().toLowerCase() === String(nameB).trim().toLowerCase()) {
    return true;
  }
  return false;
}

export function ActiveClientProvider({ children }) {
  const { clients, loading, createClient, updateClient } = useClients();
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
    return clients.find(c => areClientIdsEquivalent(c.id, selectedClientId, c.name, '')) || null;
  }, [clients, selectedClientId]);

  // Função utilitária resiliente para checagem em qualquer tela
  const matchesSelectedClient = (targetClientId, targetClientName = '') => {
    if (selectedClientId === 'all') return true;
    if (!targetClientId && !targetClientName) return true;
    return areClientIdsEquivalent(selectedClientId, targetClientId, selectedClient?.name || '', targetClientName);
  };

  const value = {
    selectedClientId,
    setSelectedClientId,
    selectedClient,
    isAllClients: selectedClientId === 'all',
    matchesSelectedClient,
    areClientIdsEquivalent,
    clients,
    createClient,
    updateClient,
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

