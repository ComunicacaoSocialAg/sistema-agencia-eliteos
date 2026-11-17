import { test, expect } from '@playwright/test';

test('da prospecção ao acompanhamento, o trabalho fica ligado ao mesmo cliente', async ({ page }) => {
  const clientName = 'Cliente Fictício Piloto';
  await page.addInitScript(() => {
    for (const key of ['csag_custom_clients', 'csag_custom_deals', 'csag_custom_tasks']) {
      if (localStorage.getItem(key) === null) localStorage.setItem(key, '[]');
    }
  });

  const openApp = async () => {
    const login = page.getByRole('button', { name: /Bruno \(Agência\)/ });
    if (await login.isVisible()) await login.click();
    await expect(page.getByRole('button', { name: /Direção do Dia/ })).toBeVisible();
  };
  const navigate = async name => page.getByRole('button', { name }).click();

  await page.goto('/');
  await page.getByRole('button', { name: /Bruno \(Agência\)/ }).click();
  await navigate(/CRM & Vendas/);
  await page.getByRole('button', { name: 'Novo Negócio', exact: true }).click();
  await page.getByPlaceholder('Ex: Clínica Odontológica Sorriso').fill(clientName);
  await page.getByRole('button', { name: 'Criar Negócio' }).click();
  for (let step = 0; step < 4; step++) await page.getByTitle('Avançar estágio').click();
  await expect(page.getByText('Negócio fechado. A próxima ação está em Produção.')).toBeVisible();

  await navigate(/Direção do Dia/);
  await expect(page.getByText('Alinhar briefing e próximos passos')).toBeVisible();
  await page.getByLabel('Cliente', { exact: true }).selectOption({ label: clientName });
  await page.getByLabel('Prazo', { exact: true }).fill('2099-01-14');
  await page.getByLabel(/Caixa de Entrada Universal/).fill('Publicar a página');
  await page.getByRole('button', { name: 'Salvar demanda' }).click();

  await navigate(/Atendimento & Produção/);
  await page.getByRole('heading', { name: 'Publicar a página' }).click();
  await page.getByRole('button', { name: /^concluído$/i }).click();
  await page.getByLabel('Link da entrega').fill('https://example.com/entrega');
  await page.getByRole('button', { name: 'Salvar link da entrega' }).click();
  await expect(page.getByRole('link', { name: 'Abrir entrega registrada' })).toHaveAttribute('href', 'https://example.com/entrega');
  await page.getByLabel('Data do acompanhamento').fill('2099-01-21');
  await page.getByRole('button', { name: 'Criar tarefa de acompanhamento' }).click();
  await page.getByRole('button', { name: 'Fechar tarefa' }).click();
  await expect(page.getByRole('heading', { name: 'Acompanhar: Publicar a página' })).toBeVisible();

  await page.reload();
  await openApp();
  await navigate(/Atendimento & Produção/);
  await expect(page.getByRole('heading', { name: 'Acompanhar: Publicar a página' })).toBeVisible();
  const saved = await page.evaluate(() => ({
    clients: JSON.parse(localStorage.getItem('csag_custom_clients')),
    deals: JSON.parse(localStorage.getItem('csag_custom_deals')),
    tasks: JSON.parse(localStorage.getItem('csag_custom_tasks')),
  }));
  const client = saved.clients.find(item => item.name === clientName);
  expect(saved.deals.find(deal => deal.company === clientName).status).toBe('ganho');
  expect(saved.tasks.filter(task => task.client_id === client.id)).toHaveLength(3);
  expect(saved.tasks.find(task => task.title.startsWith('Acompanhar:'))).toMatchObject({ deadline: '2099-01-21' });
});
