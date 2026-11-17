-- Ajuste incremental para o banco do CSAg OS. Preserva os registros existentes.
begin;

create schema if not exists agency_private;
revoke all on schema agency_private from public, anon;
grant usage on schema agency_private to authenticated;

create or replace function agency_private.current_role() returns text
language sql stable security definer set search_path = '' as $$
  select p.role from public.profiles p where p.id = (select auth.uid())
$$;

create or replace function agency_private.client_scope() returns uuid
language sql stable security definer set search_path = '' as $$
  select p.client_id from public.profiles p
  where p.id = (select auth.uid()) and p.role = 'client'
$$;

revoke all on function agency_private.current_role(), agency_private.client_scope() from public, anon;
grant execute on function agency_private.current_role(), agency_private.client_scope() to authenticated;

do $$
declare item record;
begin
  for item in
    select tablename, policyname from pg_policies
    where schemaname = 'public' and policyname = 'Public access ' || tablename
      and tablename = any(array[
        'campaign_reports','campaigns','client_vault','deals','invoices','social_metrics',
        'social_posts','task_checklists','task_comments','task_deliverables','team_members','whatsapp_logs'
      ])
  loop
    execute format('drop policy %I on public.%I', item.policyname, item.tablename);
  end loop;

  for item in
    select c.relname as name from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r' and c.relname = any(array[
      'ai_conversations','ai_memories','audit_logs','campaign_reports','campaigns','client_vault','clients','deals','invoices','profiles',
      'recurring_tasks','social_metrics','social_posts','task_attachments','task_checklists',
      'task_comments','task_deliverables','task_templates','tasks','team_members','whatsapp_logs'
    ])
  loop
    execute format('alter table public.%I enable row level security', item.name);
    execute format('revoke all on public.%I from anon, public', item.name);
    execute format('grant select, insert, update, delete on public.%I to authenticated', item.name);
  end loop;

  for item in
    select c.relname as name from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r'
      and c.relname = any(array[
        'campaign_reports','campaigns','social_metrics','social_posts',
        'recurring_tasks','task_attachments','task_templates','audit_logs',
        'task_checklists','task_comments','client_vault','team_members','whatsapp_logs','ai_conversations'
      ])
  loop
    execute format('drop policy if exists "Equipe gerencia operações" on public.%I', item.name);
    execute format(
      'create policy "Equipe gerencia operações" on public.%I for all to authenticated
       using ((select agency_private.current_role()) in (''admin'', ''commercial'', ''production''))
       with check ((select agency_private.current_role()) in (''admin'', ''commercial'', ''production''))', item.name);
  end loop;
end
$$;

drop policy if exists "Users view own profile" on public.profiles;
drop policy if exists "Agency manage all profiles" on public.profiles;
create policy "Users view own profile" on public.profiles for select to authenticated
using (id = (select auth.uid()));
create policy "Agency manage all profiles" on public.profiles for all to authenticated
using ((select agency_private.current_role()) = 'admin')
with check ((select agency_private.current_role()) = 'admin');

drop policy if exists "Agency full access clients" on public.clients;
create policy "Agency full access clients" on public.clients for all to authenticated
using ((select agency_private.current_role()) in ('admin','commercial','production'))
with check ((select agency_private.current_role()) in ('admin','commercial','production'));

drop policy if exists "Agency full access tasks" on public.tasks;
create policy "Agency full access tasks" on public.tasks for all to authenticated
using ((select agency_private.current_role()) in ('admin','commercial','production'))
with check ((select agency_private.current_role()) in ('admin','commercial','production'));

do $$
begin
  if to_regclass('public.ai_memories') is not null then
    drop policy if exists "Users manage own ai memories" on public.ai_memories;
    create policy "Users manage own ai memories" on public.ai_memories for all to authenticated
      using ((select agency_private.current_role()) in ('admin','commercial','production'))
      with check ((select agency_private.current_role()) in ('admin','commercial','production'));
  end if;
end
$$;

drop policy if exists "Client view own client_data" on public.clients;
drop policy if exists "Client view own tasks" on public.tasks;
drop policy if exists "Client update own tasks" on public.tasks;
drop policy if exists "Client view own deliverables" on public.task_deliverables;
drop policy if exists "Client update own deliverables" on public.task_deliverables;
drop policy if exists "Agency full access task_deliverables" on public.task_deliverables;
drop policy if exists "Equipe consulta versões" on public.task_deliverables;
create policy "Equipe consulta versões" on public.task_deliverables for select to authenticated
using ((select agency_private.current_role()) in ('admin','commercial','production'));
drop policy if exists "Client insert own comments" on public.task_comments;
drop policy if exists "Client view own vault" on public.client_vault;
drop policy if exists "Client insert own vault" on public.client_vault;

drop policy if exists "Agency full access deals" on public.deals;
create policy "Agency full access deals" on public.deals for all to authenticated
using ((select agency_private.current_role()) in ('admin','commercial'))
with check ((select agency_private.current_role()) in ('admin','commercial'));

drop policy if exists "Agency full access invoices" on public.invoices;
create policy "Agency full access invoices" on public.invoices for all to authenticated
using ((select agency_private.current_role()) = 'admin')
with check ((select agency_private.current_role()) = 'admin');

do $$
begin
  if to_regclass('public.client_health_scores') is not null then
    alter view public.client_health_scores set (security_invoker = true);
    revoke all on public.client_health_scores from anon, public;
  end if;
end
$$;

-- O formulário de cadastro recebe novas fichas. A consulta e as alterações ficam com a agência.
do $$
begin
  if to_regclass('public.client_registrations') is not null then
    drop policy if exists "Permitir atualizacao de cadastros para todos" on public.client_registrations;
    drop policy if exists "Permitir leitura de cadastros para todos" on public.client_registrations;
    drop policy if exists "Permitir insercao anonima de cadastros" on public.client_registrations;
    drop policy if exists "Equipe gerencia cadastros" on public.client_registrations;
    revoke all on public.client_registrations from anon, public;
    grant insert on public.client_registrations to anon, authenticated;
    create policy "Permitir insercao anonima de cadastros" on public.client_registrations
      for insert to anon, authenticated with check (status = 'pendente');
    create policy "Equipe gerencia cadastros" on public.client_registrations for all to authenticated
      using ((select agency_private.current_role()) in ('admin', 'commercial'))
      with check ((select agency_private.current_role()) in ('admin', 'commercial'));
  end if;
end
$$;

create or replace function public.log_changes() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_table_schema = 'public' and tg_table_name in ('tasks', 'task_deliverables')
     and old.status is distinct from new.status then
    insert into public.audit_logs (entity_type, entity_id, action, old_value, new_value)
    values (case when tg_table_name = 'tasks' then 'task' else 'deliverable' end,
      new.id, case when tg_table_name = 'tasks' then 'status_change' else 'status_update' end,
      jsonb_build_object('status', old.status),
      jsonb_build_object('status', new.status, 'actor_id', auth.uid()));
  end if;
  return new;
end;
$$;
revoke execute on function public.log_changes() from public, anon, authenticated;
drop trigger if exists tr_log_tasks on public.tasks;
create trigger tr_log_tasks after update on public.tasks for each row execute function public.log_changes();
drop trigger if exists tr_log_deliverables on public.task_deliverables;
create trigger tr_log_deliverables after update on public.task_deliverables for each row execute function public.log_changes();

alter table public.tasks add column if not exists completed_at timestamptz;

create or replace function agency_private.track_task_completion() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.status = 'concluido' then
    if tg_op = 'INSERT' then new.completed_at := now();
    elsif old.status is distinct from new.status then new.completed_at := now();
    else new.completed_at := old.completed_at;
    end if;
  else
    new.completed_at := null;
  end if;
  return new;
end
$$;
revoke all on function agency_private.track_task_completion() from public, anon;
drop trigger if exists tr_track_task_completion on public.tasks;
create trigger tr_track_task_completion before insert or update on public.tasks
for each row execute function agency_private.track_task_completion();

alter table public.profiles add column if not exists email text;
alter table public.task_deliverables
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null;
alter table public.deals add column if not exists contact_email text;
alter table public.deals add column if not exists contact_phone text;
alter table public.deals add column if not exists client_id uuid references public.clients(id) on delete set null;
alter table public.deals add column if not exists next_action text;
alter table public.deals add column if not exists follow_up_on date;
alter table public.deals add column if not exists onboarding_task_id uuid references public.tasks(id) on delete set null;

alter table public.clients add column if not exists notes text;
alter table public.clients add column if not exists agency_metadata jsonb not null default '{}'::jsonb;

create table if not exists public.projects (
  id uuid primary key,
  name text not null check (length(trim(name)) between 1 and 200),
  client_id uuid references public.clients(id) on delete set null,
  client_name text,
  type text not null,
  type_label text,
  start_date date,
  end_date date,
  value numeric(12,2) not null default 0 check (value >= 0),
  status text not null default 'em-andamento' check (status in ('backlog','em-andamento','aguardando-cliente','concluido')),
  description text,
  drive_folder_url text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date)
);
alter table public.projects enable row level security;
revoke all on public.projects from public, anon;
grant select, insert, update, delete on public.projects to authenticated;
drop policy if exists "Equipe gerencia projetos" on public.projects;
create policy "Equipe gerencia projetos" on public.projects for all to authenticated
  using ((select agency_private.current_role()) in ('admin','commercial','production'))
  with check ((select agency_private.current_role()) in ('admin','commercial','production'));
alter table public.tasks add column if not exists project_id uuid references public.projects(id) on delete set null;
create index if not exists tasks_project_id_idx on public.tasks(project_id);
create index if not exists projects_client_id_idx on public.projects(client_id);

create or replace function public.create_agency_project(p_id uuid, p_project jsonb, p_tasks jsonb)
returns public.projects language plpgsql set search_path = '' as $$
declare
  saved public.projects;
  actor_role text := agency_private.current_role();
  actor uuid := auth.uid();
  target_client uuid := nullif(p_project->>'client_id', '')::uuid;
  project_type text := p_project->>'type';
  project_name text := trim(p_project->>'name');
  task jsonb;
begin
  if not coalesce(actor_role in ('admin','commercial','production'), false) then
    raise exception using errcode = '42501', message = 'Apenas a equipe pode criar projetos.';
  end if;
  if project_type = 'proposta' and actor_role = 'production' then
    raise exception using errcode = '42501', message = 'Apenas a equipe comercial pode criar uma proposta.';
  end if;
  if project_type not in ('interno','proposta') and target_client is null then
    raise exception 'Selecione um cliente para o projeto.';
  end if;
  if project_type = 'proposta' and length(coalesce(trim(p_project->>'client_name'), '')) = 0 then
    raise exception 'Informe o nome do prospect.';
  end if;
  if jsonb_typeof(p_tasks) is distinct from 'array' or jsonb_array_length(p_tasks) > 100 then
    raise exception 'Selecione até 100 tarefas para o projeto.';
  end if;

  insert into public.projects (id, name, client_id, client_name, type, type_label, start_date, end_date,
    value, description, drive_folder_url, created_by)
  values (p_id, project_name, target_client, nullif(p_project->>'client_name',''), project_type, p_project->>'type_label',
    nullif(p_project->>'start_date','')::date, nullif(p_project->>'end_date','')::date,
    coalesce((p_project->>'value')::numeric,0), p_project->>'description',
    nullif(p_project->>'drive_folder_url',''), actor)
  on conflict (id) do nothing returning * into saved;

  if saved.id is null then
    select * into saved from public.projects where id = p_id and created_by = actor
      and name = project_name and client_id is not distinct from target_client and type = project_type;
    if saved.id is null then raise exception 'O projeto não pôde ser confirmado.'; end if;
    return saved;
  end if;

  for task in select value from jsonb_array_elements(p_tasks) loop
    if length(coalesce(trim(task->>'title'), '')) not between 1 and 200 then
      raise exception 'Informe o título de todas as tarefas.';
    end if;
    insert into public.tasks (title, client_id, project_id, tag, estimated_hours, status, deadline, assigned_to, notes)
    values (trim(task->>'title'), target_client, saved.id, coalesce(nullif(task->>'tag',''),'Campanha'),
      coalesce((task->>'estimated_hours')::double precision, 1), coalesce(nullif(task->>'status',''),'backlog'),
      nullif(task->>'deadline','')::date, nullif(task->>'assigned_to',''), nullif(task->>'description',''));
  end loop;

  if project_type = 'proposta' then
    insert into public.deals (company, value, status, probability, assigned_to, notes, client_id)
    values (saved.client_name, saved.value, 'proposta', 50, 'Bruno', saved.name, target_client);
  end if;
  return saved;
end;
$$;
revoke all on function public.create_agency_project(uuid,jsonb,jsonb) from public, anon;
grant execute on function public.create_agency_project(uuid,jsonb,jsonb) to authenticated;

-- A pauta só ganha uma demanda quando alguém abre o fluxo de aprovação.
do $$
begin
  if to_regclass('public.social_posts') is null then return; end if;
  alter table public.social_posts add column if not exists published_at timestamptz;
  execute $function$
    create or replace function agency_private.track_post_publication() returns trigger
    language plpgsql set search_path = '' as $body$
    begin
      if new.status = 'publicado' then
        if tg_op = 'INSERT' then new.published_at := now();
        elsif old.status is distinct from new.status then new.published_at := now();
        else new.published_at := old.published_at;
        end if;
      else
        new.published_at := null;
      end if;
      return new;
    end
    $body$;
  $function$;
  revoke all on function agency_private.track_post_publication() from public, anon;
  drop trigger if exists tr_track_post_publication on public.social_posts;
  create trigger tr_track_post_publication before insert or update on public.social_posts
  for each row execute function agency_private.track_post_publication();
  alter table public.social_posts add column if not exists task_id uuid references public.tasks(id) on delete set null;
  execute $function$
    create or replace function public.prepare_social_post_approval(p_post_id text)
    returns uuid language plpgsql set search_path = '' as $body$
    declare
      post public.social_posts;
      linked_task uuid;
      target_client uuid;
    begin
      if not coalesce(agency_private.current_role() in ('admin','commercial','production'), false) then
        raise exception using errcode = '42501', message = 'Apenas a equipe pode preparar uma aprovação.';
      end if;
      select * into post from public.social_posts where id = p_post_id for update;
      if post.id is null then raise exception 'Pauta não encontrada.'; end if;
      if post.task_id is not null then return post.task_id; end if;
      select c.id into target_client from public.clients c where c.id::text = post.client_id;
      if target_client is null then raise exception 'Vincule a pauta a um cliente antes de enviar para aprovação.'; end if;
      insert into public.tasks (title, client_id, tag, status, deadline, notes)
      values (post.title, target_client, 'Social Media', 'revisao-interna',
        case when post.scheduled_date ~ '^\d{4}-\d{2}-\d{2}$' then post.scheduled_date::date end,
        concat_ws(E'\n\n', nullif(post.caption,''), nullif(post.visual_concept,'')))
      returning id into linked_task;
      update public.social_posts set task_id = linked_task where id = post.id;
      return linked_task;
    end;
    $body$;
  $function$;
  revoke all on function public.prepare_social_post_approval(text) from public, anon;
  grant execute on function public.prepare_social_post_approval(text) to authenticated;
end
$$;

create or replace function agency_private.close_agency_deal(p_deal_id uuid, p_existing_client uuid default null)
returns public.deals language plpgsql security definer set search_path = '' as $$
declare
  deal public.deals;
  target_client uuid;
  onboarding uuid;
begin
  if auth.uid() is null or not coalesce(agency_private.current_role() in ('admin','commercial'), false) then
    raise exception using errcode = '42501', message = 'Apenas a equipe comercial pode fechar o negócio.';
  end if;
  select * into deal from public.deals where id = p_deal_id for update;
  if deal.id is null then raise exception 'Negócio não encontrado.'; end if;
  if deal.status = 'ganho' and deal.client_id is not null and deal.onboarding_task_id is not null then return deal; end if;
  target_client := coalesce(deal.client_id, p_existing_client);
  if target_client is not null and not exists (select 1 from public.clients where id = target_client) then
    raise exception 'O cliente vinculado não foi encontrado.';
  end if;
  if target_client is null then
    insert into public.clients (name, contact_name, contact_email, contact_phone, status, lifecycle_stage)
    values (deal.company, deal.contact, deal.contact_email, deal.contact_phone, 'active', 'onboarding')
    returning id into target_client;
  end if;
  onboarding := deal.onboarding_task_id;
  if onboarding is null then
    insert into public.tasks (title, client_id, tag, priority, status, notes)
    values ('Alinhar briefing e próximos passos', target_client, 'Campanha', 'high', 'briefing', deal.notes)
    returning id into onboarding;
  end if;
  update public.deals set status = 'ganho', client_id = target_client, onboarding_task_id = onboarding,
    next_action = null, follow_up_on = null where id = deal.id returning * into deal;
  return deal;
end;
$$;

create or replace function public.close_agency_deal(p_deal_id uuid, p_existing_client uuid default null)
returns public.deals language sql set search_path = '' as $$
  select agency_private.close_agency_deal(p_deal_id, p_existing_client)
$$;
revoke all on function public.close_agency_deal(uuid, uuid), agency_private.close_agency_deal(uuid, uuid) from public, anon;
grant execute on function public.close_agency_deal(uuid, uuid), agency_private.close_agency_deal(uuid, uuid) to authenticated;

create or replace function agency_private.approval_versions(p_task_id uuid)
returns setof public.task_deliverables
language sql stable security definer set search_path = '' as $$
  select d.* from public.task_deliverables d join public.tasks t on t.id = d.task_id
  where (
    p_task_id is not null and t.id = p_task_id
  ) or (
    auth.uid() is not null and p_task_id is null
    and (agency_private.current_role() in ('admin','commercial','production')
      or t.client_id = agency_private.client_scope())
  )
  order by d.version_number desc, d.created_at desc, d.id desc
$$;

create or replace function public.get_public_approval_task(p_task_id uuid)
returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'id', t.id,
    'title', t.title,
    'status', t.status,
    'tag', t.tag,
    'deadline', t.deadline,
    'notes', t.notes,
    'external_links', t.external_links,
    'client_id', t.client_id,
    'client_name', c.name,
    'brand_color', coalesce(c.brand_color, '#f7d406')
  )
  from public.tasks t
  left join public.clients c on c.id = t.client_id
  where p_task_id is not null and t.id = p_task_id
$$;
grant execute on function public.get_public_approval_task(uuid) to anon, authenticated;

create or replace function agency_private.publish_approval_version(
  p_task_id uuid, p_version_id uuid, p_file_url text, p_file_name text
) returns public.task_deliverables
language plpgsql security definer set search_path = '' as $$
declare
  task public.tasks;
  version public.task_deliverables;
  next_version integer;
begin
  if auth.uid() is null or not coalesce(agency_private.current_role() in ('admin','commercial','production'), false) then
    raise exception using errcode = '42501', message = 'Apenas a equipe pode enviar versões.';
  end if;
  select * into task from public.tasks where id = p_task_id for update;
  if task.id is null or task.client_id is null then raise exception 'Vincule a demanda a um cliente primeiro.'; end if;
  if p_version_id is null or length(coalesce(trim(p_file_name), '')) not between 1 and 255
     or p_file_url is null or length(p_file_url) > 4096
     or (p_file_url !~ '^https?://[^[:space:]/]+[^[:space:]]*$'
       and p_file_url <> 'storage:' || p_task_id::text || '/' || p_version_id::text) then
    raise exception 'Informe um link ou arquivo válido.';
  end if;
  if left(p_file_url, 8) = 'storage:' and not exists (
    select 1 from storage.objects where bucket_id = 'agency-approvals' and name = substr(p_file_url, 9)
  ) then raise exception 'Arquivo não encontrado. Envie o arquivo novamente.'; end if;

  select * into version from public.task_deliverables where id = p_version_id;
  if version.id is not null then
    if version.task_id = p_task_id and version.file_url = p_file_url and version.file_name = trim(p_file_name) then
      return version;
    end if;
    raise exception 'Identificador de versão já utilizado.';
  end if;

  select coalesce(max(version_number), 0) + 1 into next_version from public.task_deliverables where task_id = p_task_id;
  insert into public.task_deliverables (id, task_id, version_number, file_url, file_name, status, uploaded_by)
  values (p_version_id, p_task_id, next_version, p_file_url, trim(p_file_name), 'pendente', auth.uid())
  returning * into version;
  update public.tasks set status = 'aguardando-cliente', updated_at = now() where id = p_task_id;
  return version;
end;
$$;

create or replace function agency_private.review_approval_version(
  p_version_id uuid, p_status text, p_comment text default null
) returns public.task_deliverables
language plpgsql security definer set search_path = '' as $$
declare
  task public.tasks;
  version public.task_deliverables;
  latest_id uuid;
  feedback text := nullif(trim(p_comment), '');
begin
  select t.* into task from public.tasks t join public.task_deliverables d on d.task_id = t.id
  where d.id = p_version_id
  for update of t;
  if task.id is null then raise exception using errcode = '42501', message = 'Versão indisponível.'; end if;

  if p_status is null or p_status not in ('aprovado','reprovado','com_ressalvas')
     or length(coalesce(feedback, '')) > 4000 or (p_status <> 'aprovado' and feedback is null) then
    raise exception 'Informe uma decisão válida. Um pedido de ajustes precisa de comentário.';
  end if;

  select id into latest_id from public.task_deliverables where task_id = task.id
    order by version_number desc, created_at desc, id desc limit 1;
  if latest_id is distinct from p_version_id then raise exception 'Existe uma versão mais recente. Abra a versão atual.'; end if;

  select * into version from public.task_deliverables where id = p_version_id;
  if version.status <> 'pendente' then
    if version.status = p_status and version.client_comment is not distinct from feedback then return version; end if;
    raise exception 'Já existe uma decisão para esta versão.';
  end if;

  update public.task_deliverables set status = p_status, client_comment = feedback, reviewed_at = now(), reviewed_by = auth.uid()
    where id = p_version_id returning * into version;
  update public.tasks set status = case when p_status = 'aprovado' then 'em-producao' else 'ajustes' end, updated_at = now()
    where id = task.id and status <> 'concluido';

  insert into public.task_comments (task_id, author_name, content, is_ai)
  values (
    task.id,
    'Cliente (Aprovação Externa)',
    case
      when p_status = 'aprovado' then 'Material aprovado pelo cliente (Versão ' || version.version_number || ').'
      else 'Ajustes solicitados pelo cliente na Versão ' || version.version_number || ': ' || coalesce(feedback, '')
    end,
    false
  );

  return version;
end;
$$;

create or replace function agency_private.client_portal()
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'client', jsonb_build_object('id', c.id, 'name', c.name, 'brand_color', c.brand_color, 'status', c.status),
    'projects', coalesce((
      select jsonb_agg(jsonb_build_object('id', p.id, 'name', p.name, 'status', p.status, 'end_date', p.end_date)
        order by p.end_date nulls last, p.created_at desc)
      from public.projects p where p.client_id = c.id
    ), '[]'::jsonb),
    'tasks', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', t.id, 'project_id', t.project_id, 'title', t.title, 'status', t.status, 'deadline', t.deadline, 'tag', t.tag,
        'approval_status', d.status, 'version_number', d.version_number,
        'external_links', case when t.status = 'concluido' then coalesce((
          select jsonb_agg(link) from jsonb_array_elements(
            case when jsonb_typeof(t.external_links) = 'array' then t.external_links else '[]'::jsonb end
          ) link where link->>'kind' = 'delivery' and link->>'url' ~ '^https?://'
        ), '[]'::jsonb) else '[]'::jsonb end
      ) order by t.deadline nulls last, t.created_at desc)
      from public.tasks t left join lateral (
        select v.status, v.version_number from public.task_deliverables v where v.task_id = t.id
        order by v.version_number desc, v.created_at desc, v.id desc limit 1
      ) d on true where t.client_id = c.id
    ), '[]'::jsonb)
  )
  from public.clients c where c.id = agency_private.client_scope()
$$;

create or replace function agency_private.request_client_task(
  p_id uuid, p_title text, p_notes text, p_tag text, p_priority text, p_deadline date
) returns uuid language plpgsql security definer set search_path = '' as $$
declare
  scope uuid := agency_private.client_scope();
  saved_id uuid;
begin
  if scope is null or not exists (select 1 from public.clients where id = scope and status = 'active') then
    raise exception using errcode = '42501', message = 'Sua conta precisa estar vinculada a um cliente ativo.';
  end if;
  if p_id is null or length(coalesce(trim(p_title), '')) not between 1 and 200
    or length(coalesce(trim(p_notes), '')) not between 1 and 8000
    or length(coalesce(trim(p_tag), '')) not between 1 and 80
    or p_priority is null or p_priority not in ('low','medium','high') then
    raise exception 'Preencha o título e os detalhes da solicitação.';
  end if;

  insert into public.tasks (id, title, client_id, status, tag, priority, deadline, notes)
    values (p_id, trim(p_title), scope, 'briefing', trim(p_tag), p_priority, p_deadline, trim(p_notes))
    on conflict (id) do nothing returning id into saved_id;
  if saved_id is null then
    select id into saved_id from public.tasks where id = p_id and client_id = scope
      and title = trim(p_title) and notes = trim(p_notes) and tag = trim(p_tag)
      and priority = p_priority and deadline is not distinct from p_deadline;
  end if;
  if saved_id is null then raise exception 'A solicitação não pôde ser confirmada. Tente novamente.'; end if;
  return saved_id;
end;
$$;

create or replace function public.approval_versions(p_task_id uuid default null)
returns setof public.task_deliverables language sql stable set search_path = '' as $$
  select * from agency_private.approval_versions(p_task_id)
$$;
create or replace function public.publish_approval_version(p_task_id uuid, p_version_id uuid, p_file_url text, p_file_name text)
returns public.task_deliverables language sql set search_path = '' as $$
  select agency_private.publish_approval_version(p_task_id, p_version_id, p_file_url, p_file_name)
$$;
create or replace function public.review_approval_version(p_version_id uuid, p_status text, p_comment text default null)
returns public.task_deliverables language sql set search_path = '' as $$
  select agency_private.review_approval_version(p_version_id, p_status, p_comment)
$$;
create or replace function public.client_portal()
returns jsonb language sql stable set search_path = '' as $$ select agency_private.client_portal() $$;
create or replace function public.request_client_task(p_id uuid, p_title text, p_notes text, p_tag text, p_priority text, p_deadline date)
returns uuid language sql set search_path = '' as $$
  select agency_private.request_client_task(p_id, p_title, p_notes, p_tag, p_priority, p_deadline)
$$;

do $$
declare target text;
begin
  foreach target in array array['public','agency_private'] loop
    execute format('revoke all on function %1$I.approval_versions(uuid),
      %1$I.publish_approval_version(uuid,uuid,text,text), %1$I.review_approval_version(uuid,text,text),
      %1$I.client_portal(), %1$I.request_client_task(uuid,text,text,text,text,date) from public, anon', target);
    execute format('grant execute on function %1$I.publish_approval_version(uuid,uuid,text,text),
      %1$I.client_portal(), %1$I.request_client_task(uuid,text,text,text,text,date) to authenticated', target);
    execute format('grant execute on function %1$I.approval_versions(uuid),
      %1$I.review_approval_version(uuid,text,text) to anon, authenticated', target);
  end loop;
end
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('agency-approvals', 'agency-approvals', true, 20971520,
  array['image/jpeg','image/png','image/webp','image/gif','application/pdf','video/mp4','video/webm','video/quicktime'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function agency_private.can_read_approval_file(p_name text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.task_deliverables d
    where d.file_url = 'storage:' || p_name
  )
$$;
revoke all on function agency_private.can_read_approval_file(text) from public;
grant execute on function agency_private.can_read_approval_file(text) to anon, authenticated;

drop policy if exists "Ler arquivos de aprovação" on storage.objects;
drop policy if exists "Enviar arquivos de aprovação" on storage.objects;
create policy "Ler arquivos de aprovação" on storage.objects for select to anon, authenticated
using (bucket_id = 'agency-approvals' and agency_private.can_read_approval_file(name));
create policy "Enviar arquivos de aprovação" on storage.objects for insert to authenticated
with check (bucket_id = 'agency-approvals'
  and (select agency_private.current_role()) in ('admin','commercial','production')
  and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}$'
  and exists (select 1 from public.tasks t where t.id::text = split_part(name, '/', 1) and t.client_id is not null));

-- Auto-provisionamento de perfil admin para comunicacaosocialag@gmail.com e admin@csag.com
create or replace function agency_private.sync_auth_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  user_email text := lower(trim(coalesce(new.email, '')));
  display_name text := coalesce(
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(new.raw_user_meta_data->>'name'), ''),
    case when user_email in ('comunicacaosocialag@gmail.com', 'admin@csag.com') then 'Bruno (CS Ag)' else split_part(user_email, '@', 1) end
  );
begin
  if user_email in ('comunicacaosocialag@gmail.com', 'admin@csag.com') then
    insert into public.profiles (id, name, email, role)
    values (new.id, display_name, user_email, 'admin')
    on conflict (id) do update
      set email = excluded.email,
          role = 'admin',
          name = coalesce(nullif(public.profiles.name, ''), excluded.name);
  end if;
  return new;
end;
$$;
revoke all on function agency_private.sync_auth_profile() from public, anon, authenticated;

drop trigger if exists tr_sync_auth_profile on auth.users;
create trigger tr_sync_auth_profile
after insert or update on auth.users
for each row execute function agency_private.sync_auth_profile();

create or replace function public.ensure_my_profile()
returns public.profiles
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  u_email text;
  u_name text;
  prof public.profiles;
begin
  if uid is null then
    return null;
  end if;

  select * into prof from public.profiles where id = uid;
  if prof.id is not null then
    return prof;
  end if;

  select lower(trim(u.email)),
         coalesce(nullif(trim(u.raw_user_meta_data->>'full_name'), ''), nullif(trim(u.raw_user_meta_data->>'name'), ''), 'Bruno (CS Ag)')
    into u_email, u_name
    from auth.users u
   where u.id = uid;

  if u_email in ('comunicacaosocialag@gmail.com', 'admin@csag.com') then
    insert into public.profiles (id, name, email, role)
    values (uid, u_name, u_email, 'admin')
    on conflict (id) do update
      set email = excluded.email,
          role = 'admin'
    returning * into prof;
    return prof;
  end if;

  return null;
end;
$$;
revoke all on function public.ensure_my_profile() from public, anon;
grant execute on function public.ensure_my_profile() to authenticated;

-- Enriquecer metadados dos clientes existentes e projetos iniciais
update public.clients
set agency_metadata = coalesce(agency_metadata, '{}'::jsonb) || jsonb_build_object(
  'document_id', 'CRM-MG 39529 / RQE 15412',
  'billing_day', '15',
  'contract_start_date', '2026-03-01',
  'drive_url', 'https://drive.google.com/drive/u/0/search?q=Alberto%20Brasil',
  'reportei_url', 'https://app.reportei.com/demo-dr-alberto',
  'forms_url', 'https://forms.gle/dralberto-onboarding',
  'strategic_goals', 'Posicionamento de alta autoridade científica com o Calendário Trimestral no Edifício Unique',
  'ai_instructions', 'Respeitar rigorosamente a Resolução CFM 2.336/2023: proibido antes e depois, proibido promessa de resultado, incluir CRM-MG 39529 e RQE 15412.',
  'primary_color', '#0284c7',
  'secondary_color', '#0f172a',
  'accent_color', '#38bdf8',
  'typography', 'Inter + Outfit',
  'keywords', jsonb_build_array('Cirurgia Vascular', 'Varizes', 'Laser Transdérmico', 'Poços de Caldas', 'Saúde Vascular', 'Doppler')
)
where id = '87c0b28f-83f0-43ab-aefe-45bda539e8c2';

update public.clients
set agency_metadata = coalesce(agency_metadata, '{}'::jsonb) || jsonb_build_object(
  'document_id', '12.345.678/0001-90',
  'billing_day', '10',
  'contract_start_date', '2026-01-15',
  'drive_url', 'https://drive.google.com/drive/u/0/search?q=Dubola',
  'reportei_url', 'https://app.reportei.com/demo-dubola',
  'forms_url', 'https://forms.gle/dubola-onboarding',
  'strategic_goals', 'Expandir presença nacional e gerar vendas B2B e e-commerce',
  'ai_instructions', 'Destacar textura, sabor artesanal, harmonização gastronômica e apelo visual apetitoso.',
  'primary_color', '#eab308',
  'secondary_color', '#1c1917',
  'accent_color', '#ef4444',
  'typography', 'Playfair Display + Inter',
  'keywords', jsonb_build_array('Gourmet', 'Artesanal', 'Molhos Nobres', 'Sabor Autêntico', 'Premium')
)
where id = 'ce45a984-093d-4484-9ee4-9177d56310e3';

insert into public.projects (id, name, client_id, client_name, type, type_label, start_date, end_date, value, status, description, drive_folder_url)
values
  (
    'a1111111-1111-4111-8111-111111111111',
    'Calendário de Autoridade Vascular & Clínica Unique',
    '87c0b28f-83f0-43ab-aefe-45bda539e8c2',
    'Dr. Alberto Brasil - Cirurgião Vascular',
    'campanha',
    'Campanha de Autoridade Médica',
    '2026-09-01',
    '2026-12-31',
    22500.00,
    'em-andamento',
    'Campanha trimestral de posicionamento de alta autoridade científica para cirurgia vascular e laser transdérmico.',
    'https://drive.google.com/drive/u/0/search?q=Alberto%20Brasil'
  ),
  (
    'b2222222-2222-4222-8222-222222222222',
    'Rebranding & Lançamento Linha Defumada',
    'ce45a984-093d-4484-9ee4-9177d56310e3',
    'Dubola Molhos Especiais',
    'branding',
    'Identidade & Branding',
    '2026-09-15',
    '2026-12-15',
    14000.00,
    'em-andamento',
    'Redesign da identidade visual, novos rótulos Habanero & Mel de Engenho e campanha de lançamento.',
    'https://drive.google.com/drive/u/0/search?q=Dubola'
  )
on conflict (id) do nothing;

update public.tasks
set project_id = 'a1111111-1111-4111-8111-111111111111'
where client_id = '87c0b28f-83f0-43ab-aefe-45bda539e8c2' and project_id is null;

update public.tasks
set project_id = 'b2222222-2222-4222-8222-222222222222'
where client_id = 'ce45a984-093d-4484-9ee4-9177d56310e3' and project_id is null;

commit;
