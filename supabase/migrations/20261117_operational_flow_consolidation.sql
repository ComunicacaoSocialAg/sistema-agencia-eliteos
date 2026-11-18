-- Consolidação operacional: CRM -> Cliente (com fee) -> Onboarding -> Aprovação -> Saúde Real
begin;

-- 1. Garantir DDL versionado para tabelas de Social e Mídia Paga já usadas pelos hooks
create table if not exists public.social_posts (
  id text primary key,
  client_id text not null,
  title text not null,
  channel text not null default 'Instagram',
  format text not null default 'Carrossel',
  status text not null default 'pauta',
  scheduled_date text,
  caption text,
  visual_concept text,
  asset_url text,
  post_url text,
  medical_compliance_checked boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  published_at timestamptz,
  task_id uuid references public.tasks(id) on delete set null
);

create table if not exists public.social_metrics (
  id text primary key,
  client_id text not null,
  period_month text not null,
  followers_total int default 0,
  followers_growth int default 0,
  reach_organic int default 0,
  total_interactions int default 0,
  top_post_note text,
  notes text,
  updated_at timestamptz default now()
);

create table if not exists public.campaigns (
  id text primary key,
  client_id text not null,
  name text not null,
  platform text not null default 'Meta Ads',
  objective text not null default 'Leads',
  budget_monthly numeric(12,2) default 0,
  budget_daily numeric(12,2) default 0,
  status text not null default 'ativa',
  ad_url text,
  results_summary text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.campaign_reports (
  id text primary key,
  client_id text not null,
  period_label text not null,
  invested_amount numeric(12,2) default 0,
  conversions_count int default 0,
  cpa_real numeric(12,2) default 0,
  diagnosis text,
  updated_at timestamptz default now()
);

-- 2. Corrigir close_agency_deal para repassar deal.value para monthly_fee do cliente
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
    insert into public.clients (name, contact_name, contact_email, contact_phone, monthly_fee, status, lifecycle_stage)
    values (deal.company, deal.contact, deal.contact_email, deal.contact_phone, coalesce(deal.value, 0), 'active', 'onboarding')
    returning id into target_client;
  else
    update public.clients
    set monthly_fee = case when coalesce(monthly_fee, 0) = 0 and coalesce(deal.value, 0) > 0 then deal.value else monthly_fee end
    where id = target_client;
  end if;

  onboarding := deal.onboarding_task_id;
  if onboarding is null then
    insert into public.tasks (title, client_id, tag, priority, status, notes)
    values ('Alinhar briefing e próximos passos', target_client, 'Campanha', 'high', 'briefing', deal.notes)
    returning id into onboarding;
  end if;

  update public.deals
  set status = 'ganho', client_id = target_client, onboarding_task_id = onboarding,
      next_action = null, follow_up_on = null
  where id = deal.id
  returning * into deal;

  return deal;
end;
$$;

-- 3. Corrigir client_health_scores para medir atraso real (prazo vencido ou entrega após prazo)
create or replace view public.client_health_scores
with (security_invoker = true) as
with metrics as (
  select
    c.id as client_id,
    c.name as client_name,
    count(t.id) filter (
      where (t.status <> 'concluido' and t.deadline is not null and t.deadline < (now() at time zone 'America/Sao_Paulo')::date)
         or (t.status = 'concluido' and t.deadline is not null and t.completed_at is not null and (t.completed_at at time zone 'America/Sao_Paulo')::date > t.deadline)
    ) as tasks_delayed,
    count(t.id) filter (where t.status = 'ajustes') as tasks_rework,
    max(t.updated_at) as last_activity
  from public.clients c
  left join public.tasks t on t.client_id = c.id
  group by c.id, c.name
)
select
  client_id,
  client_name,
  greatest(0, least(100, 100 - (tasks_delayed * 5) - (tasks_rework * 10) - (case when last_activity < now() - interval '7 days' then 20 else 0 end))) as score
from metrics;

-- 4. Corrigir transição da aprovação para concluído quando aprovado pelo cliente
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
  update public.tasks set status = case when p_status = 'aprovado' then 'concluido' else 'ajustes' end, updated_at = now()
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

-- 5. Garantir função prepare_social_post_approval no schema público
create or replace function public.prepare_social_post_approval(p_post_id text)
returns uuid language plpgsql set search_path = '' as $$
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
$$;

revoke all on function public.prepare_social_post_approval(text) from public, anon;
grant execute on function public.prepare_social_post_approval(text) to authenticated;

-- 6. Higienizar vínculo de negócio ganho órfão e remover URLs fictícias em agency_metadata
update public.deals
set client_id = '87c0b28f-83f0-43ab-aefe-45bda539e8c2'
where id = '7724425e-ee72-4d76-87a4-b1f5644f3e31'
  and client_id is null
  and exists (select 1 from public.clients where id = '87c0b28f-83f0-43ab-aefe-45bda539e8c2');

update public.clients
set agency_metadata = agency_metadata - 'reportei_url'
where agency_metadata ? 'reportei_url'
  and agency_metadata->>'reportei_url' like '%/demo-%';

update public.clients
set agency_metadata = agency_metadata - 'forms_url'
where agency_metadata ? 'forms_url'
  and agency_metadata->>'forms_url' like 'https://forms.gle/%-onboarding';

commit;
