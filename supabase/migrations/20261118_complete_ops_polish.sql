-- Consolidação operacional v2: faturas no fechamento de negócio e persistência de status ao preparar aprovação social
begin;

create or replace function agency_private.close_agency_deal(p_deal_id uuid, p_existing_client uuid default null)
returns public.deals language plpgsql security definer set search_path = '' as $$
declare
  deal public.deals;
  target_client uuid;
  onboarding uuid;
  current_month text := to_char((now() at time zone 'America/Sao_Paulo')::date, 'YYYY-MM');
  client_billing_day int;
  client_label text;
  due_date_val date;
  today_br date := (now() at time zone 'America/Sao_Paulo')::date;
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

  if coalesce(deal.value, 0) > 0 and not exists (
    select 1 from public.invoices inv
    where inv.client_id = target_client
      and inv.status <> 'cancelled'
      and to_char(inv.due_date, 'YYYY-MM') = current_month
  ) then
    select
      c.name,
      least(28, greatest(1, coalesce(nullif(regexp_replace(coalesce(c.agency_metadata->>'billing_day', ''), '\D', '', 'g'), '')::int, 10)))
    into client_label, client_billing_day
    from public.clients c
    where c.id = target_client;

    due_date_val := make_date(extract(year from today_br)::int, extract(month from today_br)::int, client_billing_day);
    if due_date_val < today_br then
      due_date_val := today_br + interval '7 days';
    end if;

    insert into public.invoices (client_id, service, amount, due_date, status)
    values (
      target_client,
      'Mensalidade / Fechamento CRM: ' || coalesce(nullif(client_label, ''), deal.company),
      deal.value,
      due_date_val,
      'pending'
    );
  end if;

  update public.deals
  set status = 'ganho', client_id = target_client, onboarding_task_id = onboarding,
      next_action = null, follow_up_on = null
  where id = deal.id
  returning * into deal;

  return deal;
end;
$$;

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

  if post.task_id is not null then
    update public.social_posts
    set status = case when status in ('pauta', 'roteiro', 'producao') then 'aprovacao' else status end,
        updated_at = now()
    where id = post.id;
    return post.task_id;
  end if;

  select c.id into target_client from public.clients c where c.id::text = post.client_id;
  if target_client is null then raise exception 'Vincule a pauta a um cliente antes de enviar para aprovação.'; end if;

  insert into public.tasks (title, client_id, tag, status, deadline, notes)
  values (post.title, target_client, 'Social Media', 'revisao-interna',
    case when post.scheduled_date ~ '^\d{4}-\d{2}-\d{2}$' then post.scheduled_date::date end,
    concat_ws(E'\n\n', nullif(post.caption,''), nullif(post.visual_concept,'')))
  returning id into linked_task;

  update public.social_posts
  set task_id = linked_task,
      status = 'aprovacao',
      updated_at = now()
  where id = post.id;

  return linked_task;
end;
$$;

revoke all on function public.prepare_social_post_approval(text) from public, anon;
grant execute on function public.prepare_social_post_approval(text) to authenticated;

commit;
