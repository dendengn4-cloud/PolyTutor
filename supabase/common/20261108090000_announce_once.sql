-- Сообщения пользователям: одно сообщение «во все языки» показывается человеку один раз, а не в каждом языке;
-- несколько непрочитанных сообщений показываются вместе (карусель от старого к новому, «Закрыть все»).
--
-- Как устроено:
--   • announcements.grp — общий ключ одной рассылки: telegram-bot пишет одинаковый grp во все языки сразу;
--     у старых сообщений «во все языки» grp считается по тексту (одинаковый текст = одна рассылка);
--   • shared.ann_seen (tg_id, grp) — какие рассылки человек уже видел в любом языке;
--   • get_announcements() — до 10 непрочитанных активных сообщений этого языка, от старого к новому,
--     без рассылок, уже показанных в другом языке;
--   • mark_announcements_seen(p_ids) — отметить показанными (в этом языке и, для рассылок «во все языки», во всех).
-- Прежние get_announcement / mark_announcement_seen оставлены для уже открытых старых версий приложения.

-- ---------------------------------------------------------------- общая часть (одна на базу, не зависит от языка)
create schema if not exists shared;
create table if not exists shared.ann_seen (
  tg_id    bigint not null,
  grp      uuid   not null,
  seen_at  timestamptz not null default now(),
  primary key (tg_id, grp)
);

-- ---------------------------------------------------------------- этот язык
alter table public.announcements add column if not exists grp uuid;
update public.announcements set grp = md5('all:' || body)::uuid where grp is null and scope = 'all';
update public.announcements set grp = md5(current_schema() || ':' || id::text)::uuid where grp is null;

create or replace function public.announcements_grp()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.grp is null then
    new.grp := case when new.scope = 'all' then md5('all:' || new.body)::uuid else gen_random_uuid() end;
  end if;
  return new;
end $$;
drop trigger if exists announcements_grp on public.announcements;
create trigger announcements_grp before insert on public.announcements
  for each row execute function public.announcements_grp();

create or replace function public.get_announcements()
returns jsonb language sql stable security definer set search_path = '' as $$
  with me as (select p.tg_id, coalesce((p.settings->>'ann_seen')::bigint, 0) as seen
                from public.profiles p where p.id = auth.uid()),
  fresh as (
    select * from (
      select distinct on (a.grp) a.id, a.body, a.created_at
        from public.announcements a, me
       where a.active
         and a.id > me.seen
         and not exists (select 1 from shared.ann_seen s where s.tg_id = me.tg_id and s.grp = a.grp)
       order by a.grp, a.id) d
     order by id desc
     limit 10)
  select coalesce(jsonb_agg(jsonb_build_object('id', id, 'body', body, 'created_at', created_at) order by id), '[]'::jsonb)
    from fresh
$$;

create or replace function public.mark_announcements_seen(p_ids bigint[])
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
  v_tg bigint;
  v_max bigint;
begin
  select max(x) into v_max from unnest(coalesce(p_ids, '{}'::bigint[])) x;
  if v_max is null then return jsonb_build_object('ok', true); end if;
  update public.profiles
     set settings = coalesce(settings, '{}'::jsonb)
                    || jsonb_build_object('ann_seen', greatest(coalesce((settings->>'ann_seen')::bigint, 0), v_max))
   where id = auth.uid()
  returning tg_id into v_tg;
  if v_tg is not null then
    insert into shared.ann_seen (tg_id, grp)
    select v_tg, a.grp from public.announcements a
     where a.id = any(p_ids) and a.scope = 'all' and a.grp is not null
    on conflict do nothing;
  end if;
  return jsonb_build_object('ok', true);
end $$;

revoke execute on function public.get_announcements() from public, anon;
revoke execute on function public.mark_announcements_seen(bigint[]) from public, anon;
grant execute on function public.get_announcements() to authenticated;
grant execute on function public.mark_announcements_seen(bigint[]) to authenticated;

-- администратор: «видели» у рассылки «во все языки» — сколько человек видели её в любом языке
create or replace function public.admin_announcements()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then return jsonb_build_object('error', 'forbidden'); end if;
  return jsonb_build_object('items', coalesce((
    select jsonb_agg(jsonb_build_object('id', a.id, 'body', a.body, 'scope', a.scope, 'created_at', a.created_at,
                                        'active', a.active,
                                        'seen', case when a.scope = 'all'
                                                     then (select count(*) from shared.ann_seen s where s.grp = a.grp)
                                                     else (select count(*) from public.profiles p
                                                            where coalesce((p.settings->>'ann_seen')::bigint, 0) >= a.id) end)
                     order by a.id desc)
      from (select * from public.announcements order by id desc limit 30) a), '[]'::jsonb));
end $$;
