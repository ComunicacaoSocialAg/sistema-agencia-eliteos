// Google Drive integration via Google Picker API
// Permite abrir o seletor nativo do Google Drive e criar pastas automaticamente.
// Requer VITE_GOOGLE_CLIENT_ID e VITE_GOOGLE_API_KEY no .env

import { isGoogleConfigured, GOOGLE_CLIENT_ID, GOOGLE_DEVELOPER_KEY } from './firebase';

let pickerApiLoaded = false;
let authApiLoaded = false;
let tokenClient = null;
let accessToken = null;

// Carrega os scripts do Google de forma lazy
function loadGoogleApis() {
  return new Promise((resolve) => {
    if (pickerApiLoaded && authApiLoaded) { resolve(); return; }

    // Load Google API script
    if (!document.getElementById('google-api-script')) {
      const gapiScript = document.createElement('script');
      gapiScript.id = 'google-api-script';
      gapiScript.src = 'https://apis.google.com/js/api.js';
      gapiScript.onload = () => {
        window.gapi.load('picker', () => { pickerApiLoaded = true; tryResolve(); });
      };
      document.body.appendChild(gapiScript);
    }

    // Load Google Identity Services
    if (!document.getElementById('gis-script')) {
      const gisScript = document.createElement('script');
      gisScript.id = 'gis-script';
      gisScript.src = 'https://accounts.google.com/gsi/client';
      gisScript.onload = () => { authApiLoaded = true; tryResolve(); };
      document.body.appendChild(gisScript);
    }

    function tryResolve() {
      if (pickerApiLoaded && authApiLoaded) resolve();
    }
  });
}

// Autentica e obtém o access token
async function getAccessToken() {
  if (accessToken) return accessToken;
  if (!isGoogleConfigured) return null;

  await loadGoogleApis();

  return new Promise((resolve) => {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/drive',
      callback: (response) => {
        if (response.error) { resolve(null); return; }
        accessToken = response.access_token;
        resolve(accessToken);
      },
    });
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
}

// Abre o Google Picker para o usuário selecionar um arquivo
export async function openGooglePicker() {
  if (!isGoogleConfigured) {
    console.warn('[Drive] Google não configurado. Configure VITE_GOOGLE_CLIENT_ID e VITE_GOOGLE_API_KEY.');
    return null;
  }

  const token = await getAccessToken();
  if (!token) return null;

  await loadGoogleApis();

  return new Promise((resolve) => {
    const picker = new window.google.picker.PickerBuilder()
      .addView(new window.google.picker.DocsView())
      .addView(new window.google.picker.DocsUploadView())
      .setOAuthToken(token)
      .setDeveloperKey(GOOGLE_DEVELOPER_KEY)
      .setCallback((data) => {
        if (data.action === window.google.picker.Action.PICKED) {
          const file = data.docs[0];
          resolve({ id: file.id, name: file.name, url: file.url, mimeType: file.mimeType });
        } else if (data.action === window.google.picker.Action.CANCEL) {
          resolve(null);
        }
      })
      .build();
    picker.setVisible(true);
  });
}

// Cria uma pasta no Google Drive com nome e retorna o ID e URL
export async function createDriveFolder(folderName, parentFolderId = null) {
  if (!isGoogleConfigured) {
    console.warn('[Drive] Google não configurado.');
    // Retorna link simulado no modo demo
    return {
      id: `demo-folder-${Date.now()}`,
      url: `https://drive.google.com/drive/folders/demo-${encodeURIComponent(folderName)}`,
      name: folderName,
    };
  }

  const token = await getAccessToken();
  if (!token) return null;

  const metadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    ...(parentFolderId ? { parents: [parentFolderId] } : {}),
  };

  const response = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!response.ok) {
    console.error('[Drive] Erro ao criar pasta:', await response.text());
    return null;
  }

  const folder = await response.json();
  return {
    id: folder.id,
    url: `https://drive.google.com/drive/folders/${folder.id}`,
    name: folderName,
  };
}

// Cria estrutura de pastas para um novo cliente
// Estrutura: Clientes / [Nome do Cliente] / Projetos, Propostas, Ativos
export async function createClientFolderStructure(clientName) {
  const root = await createDriveFolder(`📁 ${clientName}`);
  if (!root) return null;

  // Cria subpastas em paralelo
  await Promise.all([
    createDriveFolder('📂 Projetos', root.id),
    createDriveFolder('📂 Propostas', root.id),
    createDriveFolder('📂 Ativos da Marca', root.id),
    createDriveFolder('📂 Relatórios', root.id),
  ]);

  return root;
}

// Cria pasta para um novo projeto dentro da pasta do cliente
export async function createProjectFolder(projectName, clientFolderId = null) {
  const folder = await createDriveFolder(`🚀 ${projectName}`, clientFolderId);
  return folder;
}

// Cria pasta para uma proposta
export async function createProposalFolder(proposalName, clientFolderId = null) {
  const folder = await createDriveFolder(`💼 Proposta — ${proposalName}`, clientFolderId);
  return folder;
}
