import { test, expect } from '@playwright/test';

test.describe('Golden Path: Production Workflow', () => {
  test('should allow creating a task and seeing it in the kanban', async ({ page }) => {
    // 1. Go to app
    await page.goto('/');

    // 2. Login (assuming it redirects to login if not authenticated, or bypasses in test mode)
    // Here we'll just check if we are on the dashboard or login
    const loginButton = page.locator('button:has-text("Entrar")');
    if (await loginButton.isVisible()) {
      await loginButton.click();
    }

    // 3. Navigate to Production
    await page.click('button:has-text("Atendimento & Produção")');
    
    // 4. Create New Task
    await page.click('button:has-text("NOVA TAREFA")');
    await page.fill('input[placeholder*="Título"]', 'E2E Testing Task');
    
    // Select first client
    await page.selectOption('select:has-text("Selecionar...") >> nth=0', { index: 1 });
    
    await page.click('button:has-text("CRIAR TAREFA")');

    // 5. Verify task is on board
    await expect(page.locator('text=E2E Testing Task')).toBeVisible();
  });
});
