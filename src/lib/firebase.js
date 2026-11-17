// Firebase stub: CS Ag OS utiliza Supabase (PostgreSQL) como banco oficial.
// Este stub previne o carregamento do bundle pesado de webchannel do Firebase.

export const isFirebaseConfigured = false;
export const app = null;
export const auth = null;
export const db = null;
export const storage = null;

export const collection = () => ({});
export const onSnapshot = () => () => {};
export const doc = () => ({});
export const updateDoc = async () => {};
export const setDoc = async () => {};
export const deleteDoc = async () => {};
export const query = () => ({});
export const where = () => ({});

// Google Drive API config
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || null;
export const GOOGLE_DEVELOPER_KEY = import.meta.env.VITE_GOOGLE_API_KEY || null;
export const isGoogleConfigured = !!GOOGLE_CLIENT_ID && !!GOOGLE_DEVELOPER_KEY;
