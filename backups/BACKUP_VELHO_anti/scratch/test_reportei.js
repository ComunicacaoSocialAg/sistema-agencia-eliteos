const TOKEN = 'PQlu8mdHsV71M9a72l7YKZjtUIU6kxhAKURf0m5e';

async function testReportei() {
  console.log('--- TESTANDO CONEXÃO REPORTEI ---');
  try {
    const response = await fetch('https://api.reportei.com/v2/companies/settings', {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Erro na API:', error);
      return;
    }

    const data = await response.json();
    console.log('✅ Conexão estabelecida com sucesso!');
    console.log('Dados da Conta:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Erro ao conectar:', err.message);
  }
}

testReportei();
