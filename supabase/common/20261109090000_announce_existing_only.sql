-- Сообщения пользователям получают только те, кто уже был учеником в момент отправки.
-- Кто зарегистрировался позже, старых сообщений не видит.
--   • сообщение одного языка — если профиль в этом языке создан не позже сообщения;
--   • сообщение «во все языки» — если человек к моменту отправки был учеником хотя бы одного языка
--     (shared.user_since — дата первого профиля в любом языке по Telegram ID).

-- ---------------------------------------------------------------- общая часть
create table if not exists shared.user_since (
  tg_id     bigint primary key,
  first_at  timestamptz not null
);
-- уже существующие профили этого языка (миграция выполняется для каждого языка — заполнится по всем)
insert into shared.user_since (tg_id, first_at)
select tg_id, min(created_at) from public.profiles where tg_id is not null group by tg_id
on conflict (tg_id) do update set first_at = least(shared.user_since.first_at, excluded.first_at);

-- новый профиль в любом языке
create or replace function public.profiles_user_since()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.tg_id is not null then
    insert into shared.user_since (tg_id, first_at) values (new.tg_id, coalesce(new.created_at, now()))
    on conflict (tg_id) do update set first_at = least(shared.user_since.first_at, excluded.first_at);
  end if;
  return new;
end $$;
drop trigger if exists profiles_user_since on public.profiles;
create trigger profiles_user_since after insert or update of tg_id on public.profiles
  for each row execute function public.profiles_user_since();

-- ---------------------------------------------------------------- показ
create or replace function public.get_announcements()
returns jsonb language sql stable security definer set search_path = '' as $$
  with me as (select p.tg_id, p.created_at, coalesce((p.settings->>'ann_seen')::bigint, 0) as seen,
                     coalesce((select u.first_at from shared.user_since u where u.tg_id = p.tg_id), p.created_at) as since
                from public.profiles p where p.id = auth.uid()),
  fresh as (
    select * from (
      select distinct on (a.grp) a.id, a.body, a.created_at
        from public.announcements a, me
       where a.active
         and a.id > me.seen
         and a.created_at >= case when a.scope = 'all' then least(me.since, me.created_at) else me.created_at end
         and not exists (select 1 from shared.ann_seen s where s.tg_id = me.tg_id and s.grp = a.grp)
       order by a.grp, a.id) d
     order by id desc
     limit 10)
  select coalesce(jsonb_agg(jsonb_build_object('id', id, 'body', body, 'created_at', created_at) order by id), '[]'::jsonb)
    from fresh
$$;

-- прежний показ одного сообщения (старые версии приложения) — по тому же правилу
create or replace function public.get_announcement()
returns jsonb language sql stable security definer set search_path = '' as $$
  select coalesce((select l->-1 from (select public.get_announcements() l) x where jsonb_array_length(l) > 0), 'null'::jsonb)
$$;

revoke execute on function public.get_announcements() from public, anon;
revoke execute on function public.get_announcement() from public, anon;
grant execute on function public.get_announcements() to authenticated;
grant execute on function public.get_announcement() to authenticated;
