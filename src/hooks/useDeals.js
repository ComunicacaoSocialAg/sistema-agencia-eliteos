import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const DEMO_DEALS = [];


import { collection, onSnapshot, doc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';

export function useDeals() {
  const [deals, setDeals] = useState(DEMO_DEALS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(collection(db, 'deals'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDeals(data);
      setLoading(false);
    }, (error) => {
      console.warn('[Firebase] Erro ao buscar deals:', error.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const moveDeal = async (dealId, newStatus) => {
    if (!isFirebaseConfigured) {
      setDeals(prev => prev.map(d => d.id === dealId ? { ...d, status: newStatus } : d));
      toast.success('Estágio do negócio atualizado (Modo Demo)');
      return;
    }

    try {
      await updateDoc(doc(db, 'deals', dealId), { status: newStatus });
      toast.success('Estágio do negócio atualizado');
    } catch (e) {
      toast.error('Erro ao atualizar negócio');
      throw e;
    }
  };

  const createDeal = async (dealData) => {
    const newDeal = { ...dealData, created_at: new Date().toISOString() };
    if (!isFirebaseConfigured) {
      newDeal.id = crypto.randomUUID();
      setDeals(prev => [...prev, newDeal]);
      toast.success('Novo negócio adicionado ao CRM! (Modo Demo)');
      return newDeal;
    }

    try {
      const docRef = doc(collection(db, 'deals'));
      newDeal.id = docRef.id;
      await setDoc(docRef, newDeal);
      toast.success('Novo negócio adicionado ao CRM!');
      return newDeal;
    } catch (e) {
      toast.error('Erro ao adicionar negócio');
      throw e;
    }
  };

  const deleteDeal = async (dealId) => {
    if (!isFirebaseConfigured) {
      setDeals(prev => prev.filter(d => d.id !== dealId));
      toast.success('Negócio removido (Modo Demo)');
      return;
    }

    try {
      await deleteDoc(doc(db, 'deals', dealId));
      toast.success('Negócio removido');
    } catch (e) {
      toast.error('Erro ao remover negócio');
      throw e;
    }
  };

  return { deals, loading, moveDeal, createDeal, deleteDeal, refetch: () => {} };
}
