const BASE_URL = 'https://app.reportei.com/api/v2';
const TOKEN = import.meta.env.VITE_REPORTEI_TOKEN;

/**
 * Biblioteca de Integração Reportei para CS Ag OS
 */
export const reportei = {
  /**
   * Lista todos os projetos da conta
   */
  getProjects: async () => {
    try {
      const response = await fetch(`${BASE_URL}/projects`, {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Accept': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Falha ao buscar projetos do Reportei');
      return await response.json();
    } catch (error) {
      console.error('Reportei API Error:', error);
      return { data: [] };
    }
  },

  /**
   * Busca métricas de performance em tempo real
   * @param {number} projectId 
   */
  getMetrics: async (projectId) => {
    try {
      // Nota: Na v2 do Reportei, buscamos os widgets de performance do projeto
      const response = await fetch(`${BASE_URL}/projects/${projectId}/metrics`, {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Accept': 'application/json'
        }
      });
      if (!response.ok) return null;
      const json = await response.json();
      
      // Simplificando o retorno para a UI do CS Ag OS
      return {
        instagram: json.data?.find(m => m.network === 'instagram')?.summary || { followers: 0, reach: 0 },
        facebook_ads: json.data?.find(m => m.network === 'facebook_ads')?.summary || { spend: 0, clicks: 0, conversions: 0 },
        google_ads: json.data?.find(m => m.network === 'google_ads')?.summary || { spend: 0, clicks: 0, conversions: 0 },
        last_update: new Date().toISOString()
      };
    } catch (error) {
      console.error('Reportei Metrics Error:', error);
      return null;
    }
  }
};
