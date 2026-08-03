-- ============================================================
-- CS Ag OS Elite 360 — MASTER SCHEMA v2.0
-- Versão Consolidada, Auditada e Limpa (Revisão Maio/2026)
-- ============================================================

-- 1. EXTENSÕES
create extension if not exists "uuid-ossp";

-- ============================================================
-- 2. TABELAS BASE (EQUIPE E CLIENTES)
-- ============================================================
create table if not exists team_members (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text unique,
  role text, -- 'manager', 'designer', 'copywriter', 'traffic'
  avatar_url text,
  capacity_hours int default 40,
  hourly_cost numeric(10,2) default 50.00,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists clients (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  logo_url text,
  brand_color text default '#3b82f6',
  contact_name text,
  contact_email text,
  contact_phone text,
  monthly_fee numeric(10,2) default 0,
  monthly_hours_contracted float default 10.0,
  status text default 'active' check (status in ('active', 'inactive', 'prospect')),
  lifecycle_stage text default 'onboarding',
  target_audience text,
  tone_of_voice text,
  value_proposition text,
  social_media_config jsonb default '{}'::jsonb,
  reportei_config jsonb default '{"report_url": ""}'::jsonb,
  created_at timestamptz default now()
);

-- ============================================================
-- 3. PERFIS DE AUTENTICAÇÃO
-- Roles: admin | commercial | production | client
-- ============================================================
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  role text not null check (role in ('admin', 'commercial', 'production', 'client')),
  client_id uuid references clients(id),
  avatar_url text,
  created_at timestamptz default now()
);

-- ============================================================
-- 4. COFRE DE SENHAS (VAULT)
-- ============================================================
create table if not exists client_vault (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients(id) on delete cascade,
  platform_name text not null,
  encrypted_username text,
  encrypted_password text,
  notes text,
  created_at timestamptz default now()
);

-- ============================================================
-- 5. OPERAÇÃO (TAREFAS)
-- ============================================================
create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  client_id uuid references clients(id) on delete cascade,
  assigned_to text,             -- Nome do responsável (display)
  assigned_to_id uuid references team_members(id),
  status text not null default 'backlog' check (
    status in ('backlog','briefing','em-producao','revisao-interna','aguardando-cliente','ajustes','concluido')
  ),
  tag text,
  priority text default 'medium' check (priority in ('low','medium','high')),
  deadline date,
  estimated_hours float default 1.0,
  actual_hours float default 0,
  tracked_seconds int default 0,
  notes text,
  external_links jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 6. ENTREGÁVEIS E APROVAÇÃO
-- ============================================================
create table if not exists task_deliverables (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid references tasks(id) on delete cascade,
  version_number int not null,
  file_url text not null,
  file_name text not null,
  status text default 'pendente' check (status in ('pendente','aprovado','reprovado','com_ressalvas')),
  client_comment text,
  uploaded_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists task_attachments (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid references tasks(id) on delete cascade,
  file_url text not null,
  file_name text not null,
  file_size int,
  uploaded_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- ============================================================
-- 7. COLABORAÇÃO E PADRONIZAÇÃO
-- ============================================================
create table if not exists task_comments (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid references tasks(id) on delete cascade,
  author_name text,
  content text not null,
  is_ai boolean default false,
  created_at timestamptz default now()
);

create table if not exists task_checklists (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid references tasks(id) on delete cascade,
  label text not null,
  is_done boolean default false,
  position int default 0,
  created_at timestamptz default now()
);

create table if not exists task_templates (
  id uuid primary key default uuid_generate_v4(),
  tag text not null,
  checklists jsonb not null,
  created_at timestamptz default now()
);

create table if not exists recurring_tasks (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients(id) on delete cascade,
  title text not null,
  notes text,
  tag text,
  assigned_to_id uuid references team_members(id),
  estimated_hours float default 1.0,
  frequency text not null, -- 'weekly', 'monthly'
  next_generation_date date,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- 8. CRM & VENDAS (DEALS)
-- ============================================================
create table if not exists deals (
  id uuid primary key default uuid_generate_v4(),
  company text not null,
  contact text,
  value numeric(10,2) default 0,
  probability int default 0,
  status text default 'prospeccao' check (
    status in ('prospeccao','qualificacao','proposta','negociacao','ganho','perdido')
  ),
  assigned_to text,
  notes text,
  created_at timestamptz default now()
);

-- ============================================================
-- 9. FINANCEIRO (FATURAS)
-- ============================================================
create table if not exists invoices (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients(id) on delete cascade,
  service text,
  amount numeric(10,2) default 0,
  status text default 'pending' check (status in ('pending','paid','overdue','cancelled')),
  due_date date,
  paid_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================================
-- 10. INTELIGÊNCIA E AUDITORIA
-- ============================================================
create table if not exists audit_logs (
  id uuid primary key default uuid_generate_v4(),
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz default now()
);

-- ============================================================
-- 11. OMNICHANNEL WHATSAPP (FOUNDATION)
-- ============================================================
create table if not exists whatsapp_logs (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients(id) on delete cascade,
  direction text check (direction in ('inbound', 'outbound')),
  message_type text check (message_type in ('text', 'template', 'document', 'image', 'audio')),
  content text not null,
  status text default 'sent' check (status in ('pending', 'sent', 'delivered', 'read', 'failed')),
  external_id text,
  created_at timestamptz default now()
);

-- ============================================================
-- 12. AI CONVERSATIONS (PERSISTENCE)
-- ============================================================
create table if not exists ai_conversations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  module text,
  history jsonb default '[]'::jsonb,
  updated_at timestamptz default now(),
  unique(user_id, module)
);

create table if not exists ai_memories (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients(id) on delete cascade,
  key text not null,
  value text,
  created_at timestamptz default now(),
  unique(client_id, key)
);

-- ============================================================
-- 13. VIEW DE SAÚDE (HEALTH SCORE)
-- ============================================================
create or replace view client_health_scores as
with metrics as (
  select 
    c.id as client_id,
    c.name as client_name,
    count(t.id) filter (where t.status = 'concluido' and t.deadline < t.created_at) as tasks_delayed,
    count(t.id) filter (where t.status = 'ajustes') as tasks_rework,
    max(t.updated_at) as last_activity
  from clients c
  left join tasks t on t.client_id = c.id
  group by c.id, c.name
)
select 
  client_id, client_name,
  greatest(0, least(100, 100 - (tasks_delayed * 5) - (tasks_rework * 10) - (case when last_activity < now() - interval '7 days' then 20 else 0 end))) as score
from metrics;

-- ============================================================
-- 14. TRIGGERS E FUNÇÕES
-- ============================================================
create or replace function log_changes() returns trigger as $$
begin
    if (TG_TABLE_NAME = 'tasks' and OLD.status is distinct from NEW.status) then
        insert into audit_logs (entity_type, entity_id, action, old_value, new_value)
        values ('task', NEW.id, 'status_change', jsonb_build_object('status', OLD.status), jsonb_build_object('status', NEW.status));
    elsif (TG_TABLE_NAME = 'task_deliverables' and OLD.status is distinct from NEW.status) then
        insert into audit_logs (entity_type, entity_id, action, old_value, new_value)
        values ('deliverable', NEW.id, 'status_update', jsonb_build_object('status', OLD.status), jsonb_build_object('status', NEW.status));
    end if;
    return NEW;
end;
$$ language plpgsql;

drop trigger if exists tr_log_tasks on tasks;
create trigger tr_log_tasks after update on tasks for each row execute function log_changes();

drop trigger if exists tr_log_deliverables on task_deliverables;
create trigger tr_log_deliverables after update on task_deliverables for each row execute function log_changes();

-- ============================================================
-- 15. DADOS DE SEED (DEMONSTRAÇÃO)
-- ============================================================
insert into team_members (id, name, email, role, hourly_cost) values
('00000000-0000-0000-0000-000000000001', 'Bruno', 'bruno@agencia.com', 'manager', 75.00)
on conflict do nothing;

insert into clients (id, name, contact_name, monthly_fee, brand_color) values
('11111111-0000-0000-0000-000000000001', 'Ponto Cor', 'Fernando', 15000, '#3b82f6')
on conflict do nothing;

insert into task_templates (tag, checklists) values 
('Social Media', '["Legenda", "Design", "Agendamento"]'),
('Vídeo', '["Roteiro", "Edição", "Trilha"]')
on conflict do nothing;

-- ============================================================
-- 16. SEGURANÇA (RLS — Row Level Security)
-- ============================================================

-- Ativar RLS
alter table team_members enable row level security;
alter table clients enable row level security;
alter table profiles enable row level security;
alter table tasks enable row level security;
alter table task_deliverables enable row level security;
alter table task_comments enable row level security;
alter table task_checklists enable row level security;
alter table client_vault enable row level security;
alter table deals enable row level security;
alter table invoices enable row level security;
alter table whatsapp_logs enable row level security;
alter table ai_conversations enable row level security;
alter table ai_memories enable row level security;
alter table task_attachments enable row level security;
alter table task_templates enable row level security;
alter table recurring_tasks enable row level security;
alter table audit_logs enable row level security;

-- ---- AGÊNCIA (Admin + Commercial + Production) ----
create policy "Agency full access team_members" on team_members for all using (auth.uid() in (select id from profiles where role in ('admin', 'commercial', 'production')));
create policy "Agency full access clients" on clients for all using (auth.uid() in (select id from profiles where role in ('admin', 'commercial', 'production')));
create policy "Agency full access tasks" on tasks for all using (auth.uid() in (select id from profiles where role in ('admin', 'commercial', 'production')));
create policy "Agency full access task_deliverables" on task_deliverables for all using (auth.uid() in (select id from profiles where role in ('admin', 'commercial', 'production')));
create policy "Agency full access task_comments" on task_comments for all using (auth.uid() in (select id from profiles where role in ('admin', 'commercial', 'production')));
create policy "Agency full access task_checklists" on task_checklists for all using (auth.uid() in (select id from profiles where role in ('admin', 'commercial', 'production')));
create policy "Agency full access vault" on client_vault for all using (auth.uid() in (select id from profiles where role in ('admin', 'commercial', 'production')));
create policy "Agency full access deals" on deals for all using (auth.uid() in (select id from profiles where role in ('admin', 'commercial', 'production')));
create policy "Agency full access invoices" on invoices for all using (auth.uid() in (select id from profiles where role in ('admin', 'commercial', 'production')));
create policy "Agency full access whatsapp_logs" on whatsapp_logs for all using (auth.uid() in (select id from profiles where role in ('admin', 'commercial', 'production')));

-- ---- PERFIS (todos veem seu próprio) ----
create policy "Users view own profile" on profiles for select using (id = auth.uid());
create policy "Agency manage all profiles" on profiles for all using (auth.uid() in (select id from profiles where role = 'admin'));

-- ---- CLIENTE (só vê seus dados) ----
create policy "Client view own client_data" on clients for select using (id = (select client_id from profiles where id = auth.uid()));
create policy "Client view own tasks" on tasks for select using (client_id = (select client_id from profiles where id = auth.uid()));
create policy "Client update own tasks" on tasks for update using (client_id = (select client_id from profiles where id = auth.uid()));
create policy "Client view own deliverables" on task_deliverables for select using (task_id in (select id from tasks where client_id = (select client_id from profiles where id = auth.uid())));
create policy "Client update own deliverables" on task_deliverables for update using (task_id in (select id from tasks where client_id = (select client_id from profiles where id = auth.uid())));
create policy "Client insert own comments" on task_comments for insert with check (task_id in (select id from tasks where client_id = (select client_id from profiles where id = auth.uid())));
create policy "Client view own vault" on client_vault for select using (client_id = (select client_id from profiles where id = auth.uid()));
create policy "Client insert own vault" on client_vault for insert with check (client_id = (select client_id from profiles where id = auth.uid()));

-- ---- IA (cada usuário gerencia suas próprias conversas) ----
create policy "Users manage own ai conversations" on ai_conversations for all using (user_id = auth.uid());

-- ai_memories estava com "using (true)" — liberava leitura/escrita da memória
-- de IA de QUALQUER cliente para qualquer usuário autenticado. Corrigido para
-- seguir o mesmo padrão de escopo por client_id usado no resto do schema.
create policy "Agency full access ai_memories" on ai_memories for all using (auth.uid() in (select id from profiles where role in ('admin', 'commercial', 'production')));
create policy "Client view own ai_memories" on ai_memories for select using (client_id = (select client_id from profiles where id = auth.uid()));

-- ---- TABELAS SEM POLÍTICA (estavam com RLS desabilitado / totalmente expostas) ----
create policy "Agency full access task_attachments" on task_attachments for all using (auth.uid() in (select id from profiles where role in ('admin', 'commercial', 'production')));
create policy "Client view own task_attachments" on task_attachments for select using (task_id in (select id from tasks where client_id = (select client_id from profiles where id = auth.uid())));

create policy "Agency full access task_templates" on task_templates for all using (auth.uid() in (select id from profiles where role in ('admin', 'commercial', 'production')));

create policy "Agency full access recurring_tasks" on recurring_tasks for all using (auth.uid() in (select id from profiles where role in ('admin', 'commercial', 'production')));

-- audit_logs: leitura restrita a admin (histórico sensível de mudanças);
-- a escrita continua acontecendo via trigger (log_changes), que roda com
-- privilégio de dono de tabela e não é afetada pela política de RLS.
create policy "Admin read audit_logs" on audit_logs for select using (auth.uid() in (select id from profiles where role = 'admin'));

-- ============================================================
-- 17. ÍNDICES DE PERFORMANCE (Junho/2026 — Suporte a Alta Volumetria)
-- ============================================================
create index if not exists idx_tasks_client_status on tasks(client_id, status);
create index if not exists idx_task_comments_task_id on task_comments(task_id);
create index if not exists idx_task_checklists_task_id on task_checklists(task_id);
create index if not exists idx_task_deliverables_task_id on task_deliverables(task_id);
create index if not exists idx_invoices_client_id on invoices(client_id);
create index if not exists idx_recurring_tasks_client_id on recurring_tasks(client_id);

