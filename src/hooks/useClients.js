import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { collection, onSnapshot, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';

const INITIAL_DEMO_CLIENTS = [
  {
    id: 'client-dubola',
    name: 'Dubola Molhos Especiais',
    document_id: '12.345.678/0001-90',
    contact_name: 'Roberto Dubola',
    contact_email: 'contato@dubola.com.br',
    contact_phone: '(35) 99888-7766',
    monthly_fee: 5000,
    billing_day: '10',
    contract_start_date: '2026-01-15',
    brand_color: '#eab308',
    status: 'active',
    tone_of_voice: 'Gourmet, Rústico-Chique e Apixonado por Gastronomia',
    target_audience: 'Consumidores de gastronomia artesanal, chefs e supermercados premium',
    strategic_goals: 'Expandir presença nacional e gerar vendas B2B e e-commerce'
  },
  {
    id: 'client-pontocor',
    name: 'Ponto Cor Fotografia',
    document_id: '98.765.432/0001-10',
    contact_name: 'Fernando Ponto Cor',
    contact_email: 'cliente@pontocor.com',
    contact_phone: '(11) 97777-6655',
    monthly_fee: 3500,
    billing_day: '05',
    contract_start_date: '2026-02-01',
    brand_color: '#3b82f6',
    status: 'active',
    tone_of_voice: 'Criativo, Moderno e Visualmente Impressionante',
    target_audience: 'Noivas, formandos e eventos corporativos de alto padrão',
    strategic_goals: 'Aumentar agendamentos de sessões fotográficas e orçamento corporativo'
  }
];

export function useClients() {
  const [clients, setClients] = useState(() => {
    try {
      const saved = localStorage.getItem('csag_custom_clients');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn(e);
    }
    return INITIAL_DEMO_CLIENTS;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(collection(db, 'clients'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (data.length > 0) {
        setClients(data);
      }
      setLoading(false);
    }, (error) => {
      console.warn('[Firebase] Erro ao buscar clientes:', error.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sincronizar clientes locais no localStorage
  useEffect(() => {
    if (!isFirebaseConfigured) {
      try {
        localStorage.setItem('csag_custom_clients', JSON.stringify(clients));
      } catch (e) {
        console.warn('Erro ao salvar no localStorage:', e);
      }
    }
  }, [clients]);

  const createClient = async (clientData) => {
    const newClient = { 
      ...clientData, 
      id: clientData.id || crypto.randomUUID(),
      status: clientData.status || 'active', 
      monthly_fee: Number(clientData.monthly_fee) || 0,
      brand_color: clientData.brand_color || '#3b82f6',
      created_at: new Date().toISOString() 
    };

    if (!isFirebaseConfigured) {
      setClients(prev => [newClient, ...prev]);
      toast.success('Cliente cadastrado com sucesso!');
      return newClient;
    }

    try {
      const docRef = doc(collection(db, 'clients'));
      newClient.id = docRef.id;
      await setDoc(docRef, newClient);
      toast.success('Cliente cadastrado no banco!');
      return newClient;
    } catch (e) {
      toast.error('Erro ao cadastrar cliente');
      throw e;
    }
  };

  const updateClient = async (updated) => {
    setClients(prev => prev.map(c => c.id === updated.id ? { ...c, ...updated } : c));

    if (!isFirebaseConfigured) {
      toast.success('Ficha do cliente atualizada!');
      return;
    }

    try {
      const { id, ...data } = updated;
      const docRef = doc(db, 'clients', id);
      await updateDoc(docRef, data);
      toast.success('Ficha do cliente atualizada!');
    } catch (e) {
      toast.error('Erro ao atualizar cliente');
      throw e;
    }
  };

  const totalMRR = clients.filter(c => c.status === 'active').reduce((sum, c) => sum + (Number(c.monthly_fee) || 0), 0);

  return { clients, loading, createClient, updateClient, totalMRR, refetch: () => {} };
}
