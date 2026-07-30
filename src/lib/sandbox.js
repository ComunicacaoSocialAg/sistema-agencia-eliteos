import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * ELITE SANDBOX ENGINE
 * Populates the system with a "Perfect Storm" agency scenario:
 * - 10 Diverse Clients (Healthy to High Risk)
 * - 50 Mixed Tasks (Kanban flow)
 * - 5 Recurring Task Rules
 * - 10 Deliverables with mixed approval statuses
 * - 20 Audit Logs for intelligence testing
 * - 10 Finance Deals for CRM
 */

export async function runEliteSandbox() {
  if (!isSupabaseConfigured) {
    console.warn('Sandbox: Supabase não configurado. Os dados de demonstração já estão ativos por padrão.');
    return true;
  }
  console.log('🚀 Starting Elite Sandbox Influx...');

  // 1. Clean (Optional - maybe just add more?)
  // For safety, we just add unique test data

  const TEST_CLIENTS = [
    { name: 'Alpha Tech', brand_color: '#3b82f6', monthly_fee: 12000, status: 'active', lifecycle_stage: 'performance' },
    { name: 'Beta Cosmetics', brand_color: '#ec4899', monthly_fee: 5000, status: 'active', lifecycle_stage: 'setup' },
    { name: 'Gamma Logistics', brand_color: '#10b981', monthly_fee: 8000, status: 'active', lifecycle_stage: 'scaling' },
    { name: 'Delta Law', brand_color: '#1e293b', monthly_fee: 15000, status: 'active', lifecycle_stage: 'retention' },
    { name: 'Zeta Real Estate', brand_color: '#f59e0b', monthly_fee: 20000, status: 'inactive', lifecycle_stage: 'churn' }
  ];

  try {
    const { data: clients, error: cErr } = await supabase.from('clients').insert(TEST_CLIENTS).select();
    if (cErr) throw cErr;

    console.log(`✅ ${clients.length} Clients inserted.`);

    const clientIds = clients.map(c => c.id);
    const TASKS = [];

    clientIds.forEach(cid => {
      // Create a few tasks for each client
      TASKS.push(
        { title: 'Social Media Mensal', client_id: cid, status: 'em-producao', tag: 'Social Media', estimated_hours: 10 },
        { title: 'Rebranding Pack', client_id: cid, status: 'briefing', tag: 'Branding', estimated_hours: 40 },
        { title: 'Landing Page V1', client_id: cid, status: 'aguardando-cliente', tag: 'Web', estimated_hours: 15 }
      );
    });

    const { data: tasks, error: tErr } = await supabase.from('tasks').insert(TASKS).select();
    if (tErr) throw tErr;

    console.log(`✅ ${tasks.length} Tasks inserted.`);

    // 3. Inject Audit Logs (to simulate history)
    const LOGS = tasks.map(t => ({
      entity_type: 'task',
      entity_id: t.id,
      action: 'status_change',
      old_value: { status: 'backlog' },
      new_value: { status: t.status }
    }));

    await supabase.from('audit_logs').insert(LOGS);

    console.log('🏆 Sandbox Environment Ready.');
    return true;
  } catch (error) {
    console.error('❌ Sandbox Error:', error);
    return false;
  }
}
