-- Инструменты администратора (для всех языков):
--   • «Проверка вопросов» — одобрить все непроверенные вопросы всех тем сразу;
--   • сообщение пользователям: показывается в приложении при входе (раздел этого языка или все языки).
--     Создаёт сообщение функция telegram-bot (POST …/telegram-bot/announce, только администратор):
--     она же при желании рассылает текст в чат с ботом.

-- ---------------------------------------------------------------- проверка вопросов: одобрить все
create or replace function public.admin_approve_all_questions()
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
  v_tg bigint := (select tg_id from public.profiles where id = auth.uid());
  v_n int;
begin
  if not public.is_admin() then return jsonb_build_object('error', 'forbidden'); end if;
  update public.unit_tasks set status = 'approved', reviewed_at = now(), reviewed_by = v_tg
   where kind = 'choice' and status = 'draft';
  get diagnostics v_n = row_count;
  return jsonb_build_object('ok', true, 'updated', v_n);
end $$;
revoke execute on function public.admin_approve_all_questions() from public, anon;
grant execute on function public.admin_approve_all_questions() to authenticated;

-- ---------------------------------------------------------------- сообщения пользователям
create table if not exists public.announcements (
  id          bigserial primary key,
  body        text not null check (length(btrim(body)) between 1 and 2000),
  scope       text not null default 'lang' check (scope in ('lang', 'all')),   -- 'all' — отправлено во все языки сразу
  created_at  timestamptz not null default now(),
  created_by  bigint,                                                        -- Telegram ID администратора
  active      boolean not null default true                                  -- false — больше не показывать
);
alter table public.announcements enable row level security;   -- политик нет: доступ только через функции ниже
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    execute 'grant select, insert, update on public.announcements to service_role';
    execute 'grant usage, select on sequence public.announcements_id_seq to service_role';
  end if;
end $$;

-- Новое для пользователя сообщение: самое свежее активное, которое он ещё не закрыл (profiles.settings.ann_seen).
-- Ученик, пришедший позже, тоже видит последнее активное сообщение — старое можно скрыть в приложении.
create or replace function public.get_announcement()
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('id', a.id, 'body', a.body, 'created_at', a.created_at)
    from public.announcements a
   where a.active
     and a.id > coalesce((select (p.settings->>'ann_seen')::bigint from public.profiles p where p.id = auth.uid()), 0)
   order by a.id desc
   limit 1
$$;

create or replace function public.mark_announcement_seen(p_id bigint)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
begin
  update public.profiles
     set settings = coalesce(settings, '{}'::jsonb)
                    || jsonb_build_object('ann_seen', greatest(coalesce((settings->>'ann_seen')::bigint, 0), coalesce(p_id, 0)))
   where id = auth.uid();
  return jsonb_build_object('ok', true);
end $$;

-- администратор: последние сообщения этого языка и их показ
create or replace function public.admin_announcements()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then return jsonb_build_object('error', 'forbidden'); end if;
  return jsonb_build_object('items', coalesce((
    select jsonb_agg(jsonb_build_object('id', a.id, 'body', a.body, 'scope', a.scope, 'created_at', a.created_at,
                                        'active', a.active,
                                        'seen', (select count(*) from public.profiles p
                                                  where coalesce((p.settings->>'ann_seen')::bigint, 0) >= a.id))
                     order by a.id desc)
      from (select * from public.announcements order by id desc limit 30) a), '[]'::jsonb));
end $$;

create or replace function public.admin_set_announcement(p_id bigint, p_active boolean)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
begin
  if not public.is_admin() then return jsonb_build_object('error', 'forbidden'); end if;
  update public.announcements set active = coalesce(p_active, false) where id = p_id;
  return jsonb_build_object('ok', true);
end $$;

revoke execute on function public.get_announcement() from public, anon;
revoke execute on function public.mark_announcement_seen(bigint) from public, anon;
revoke execute on function public.admin_announcements() from public, anon;
revoke execute on function public.admin_set_announcement(bigint, boolean) from public, anon;
grant execute on function public.get_announcement() to authenticated;
grant execute on function public.mark_announcement_seen(bigint) to authenticated;
grant execute on function public.admin_announcements() to authenticated;
grant execute on function public.admin_set_announcement(bigint, boolean) to authenticated;
