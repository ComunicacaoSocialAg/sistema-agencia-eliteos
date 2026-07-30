// Firebase configuration — CS Ag OS
// Substitui o Supabase como banco de dados principal.
// O sistema funciona em modo demo completo sem variáveis de ambiente.

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const isPlaceholder = (val) => !val || val === 'undefined' || val.includes('SEU_');

export const isFirebaseConfigured =
  !isPlaceholder(firebaseConfig.apiKey) &&
  !isPlaceholder(firebaseConfig.projectId);

let app = null;
let auth = null;
let db = null;
let storage = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    console.log('[Firebase] Configurado e conectado.');
  } catch (e) {
    console.warn('[Firebase] Erro ao inicializar:', e.message);
  }
} else {
  console.warn(
    '[CS Ag OS] Firebase não configurado. ' +
    'Crie um arquivo .env com as variáveis VITE_FIREBASE_*. ' +
    'O sistema rodará em modo demonstração com dados locais.'
  );
}

export { app, auth, db, storage };

// Google Drive API config
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || null;
export const GOOGLE_DEVELOPER_KEY = import.meta.env.VITE_GOOGLE_API_KEY || null;
export const isGoogleConfigured = !!GOOGLE_CLIENT_ID && !!GOOGLE_DEVELOPER_KEY;
