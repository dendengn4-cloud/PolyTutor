-- Подписка «Все языки»: оплата в любом языке открывает тот же уровень (Базовая / Продвинутая) во всех языках
-- приложения — и в тех, которые человек начнёт позже (в том числе в новых языках).
-- Цена по умолчанию — вдвое дороже подписки на один язык (меняется в Table Editor → plans, строки all_langs = true).
--
-- Как устроено:
--   • тарифы all_langs = true в plans каждого языка (только «для себя», без групп);
--   • оплата записывается как обычно (stars_grant_payment) — подписка в языке оплаты; триггер на payments
--     добавляет такую же подписку во все остальные языки, где у человека есть профиль (source 'manual',
--     source_ref 'all:<ID платежа>'), и запоминает покупку в shared.all_lang_subs;
--   • новый профиль в любом языке получает действующие подписки «Все языки» (триггер на profiles);
--   • возврат платежа (status → refunded) отключает подписку во всех языках.

-- ---------------------------------------------------------------- общая часть (одна на базу, не зависит от языка)
create schema if not exists shared;
revoke all on schema shared from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on schema shared from anon, authenticated';
  end if;
end $$;

create table if not exists shared.lang_schemas (code text primary key);
insert into shared.lang_schemas (code)
select c.relnamespace::regnamespace::text from pg_class c where c.oid = 'public.profiles'::regclass
on conflict do nothing;

create table if not exists shared.all_lang_subs (
  charge_id   text primary key,               -- ID платежа Telegram
  tg_id       bigint not null,
  tier        text not null check (tier in ('basic', 'advanced')),
  months      smallint not null,
  starts_at   timestamptz not null,
  ends_at     timestamptz not null,
  origin      text not null,                  -- язык, в котором оплачено
  created_at  timestamptz not null default now(),
  refunded_at timestamptz
);
create index if not exists all_lang_subs_tg on shared.all_lang_subs (tg_id);

-- Покупка: запомнить и выдать во всех остальных языках, где у человека есть профиль
create or replace function shared.grant_all_langs(p_charge text, p_tg bigint, p_tier text, p_months int,
                                                  p_starts timestamptz, p_ends timestamptz, p_origin text)
returns int language plpgsql security definer set search_path = '' as $$
declare v_s text; v_uid uuid; v_n int := 0; v_has boolean;
begin
  insert into shared.all_lang_subs (charge_id, tg_id, tier, months, starts_at, ends_at, origin)
  values (p_charge, p_tg, p_tier, p_months, p_starts, p_ends, p_origin)
  on conflict (charge_id) do nothing;
  for v_s in select code from shared.lang_schemas where code <> p_origin order by code loop
    if to_regclass(format('%I.profiles', v_s)) is null then continue; end if;
    execute format('select id from %I.profiles where tg_id = $1', v_s) into v_uid using p_tg;
    if v_uid is null then continue; end if;
    execute format('select exists (select 1 from %I.subscriptions where user_id = $1 and source_ref = $2)', v_s)
       into v_has using v_uid, 'all:' || p_charge;
    if v_has then continue; end if;
    execute format('select %I.grant_subscription($1, $2, $3, $4, $5)', v_s)
      using v_uid, p_tier, p_months, 'manual', 'all:' || p_charge;
    v_n := v_n + 1;
  end loop;
  return v_n;
end $$;

-- Возврат: отключить во всех языках
create or replace function shared.refund_all_langs(p_charge text)
returns int language plpgsql security definer set search_path = '' as $$
declare v_s text; v_id bigint; v_n int := 0;
begin
  update shared.all_lang_subs set refunded_at = now() where charge_id = p_charge and refunded_at is null;
  for v_s in select code from shared.lang_schemas order by code loop
    if to_regclass(format('%I.subscriptions', v_s)) is null then continue; end if;
    for v_id in execute format('select id from %I.subscriptions where source_ref = $1', v_s) using 'all:' || p_charge loop
      execute format('select %I.cut_subscription($1)', v_s) using v_id;
      v_n := v_n + 1;
    end loop;
  end loop;
  return v_n;
end $$;

-- Новый профиль: действующие подписки «Все языки» этого человека
create or replace function shared.all_langs_for_profile(p_schema text, p_uid uuid, p_tg bigint)
returns int language plpgsql security definer set search_path = '' as $$
declare r record; v_n int := 0; v_has boolean;
begin
  for r in select * from shared.all_lang_subs
            where tg_id = p_tg and refunded_at is null and ends_at > now() and origin <> p_schema
            order by starts_at loop
    execute format('select exists (select 1 from %I.subscriptions where user_id = $1 and source_ref = $2)', p_schema)
       into v_has using p_uid, 'all:' || r.charge_id;
    if v_has then continue; end if;
    execute format('insert into %I.subscriptions (user_id, tier, starts_at, ends_at, source, source_ref) values ($1, $2, $3, $4, $5, $6)', p_schema)
      using p_uid, r.tier, greatest(now(), r.starts_at), r.ends_at, 'manual', 'all:' || r.charge_id;
    v_n := v_n + 1;
  end loop;
  return v_n;
end $$;

revoke all on all tables in schema shared from public;
revoke execute on all functions in schema shared from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on all tables in schema shared from anon, authenticated';
    execute 'revoke execute on all functions in schema shared from anon, authenticated';
  end if;
end $$;

-- ---------------------------------------------------------------- тарифы этого языка
alter table public.plans add column if not exists all_langs boolean not null default false;
alter table public.plans drop constraint if exists plans_tier_months_seats_key;
create unique index if not exists plans_tier_months_seats_all_key on public.plans (tier, months, seats, all_langs);
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'plans_all_langs_personal' and conrelid = 'public.plans'::regclass) then
    alter table public.plans add constraint plans_all_langs_personal check (not all_langs or seats = 1);
  end if;
end $$;

-- ПРЕДЛОЖЕНИЕ: вдвое дороже подписки на один язык (звёзды, местная валюта, доллары)
insert into public.plans (tier, months, seats, price_stars, price_uzs, price_usd, is_active, all_langs)
select p.tier, p.months, 1, p.price_stars * 2, p.price_uzs * 2, p.price_usd * 2, p.is_active, true
  from public.plans p
 where p.seats = 1 and not p.all_langs
on conflict (tier, months, seats, all_langs) do nothing;

create or replace function public.get_plans()
returns jsonb language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object(
           'id', id, 'tier', tier, 'months', months, 'seats', seats, 'all_langs', all_langs,
           'price_stars', price_stars, 'price_uzs', price_uzs, 'price_usd', price_usd)
         order by all_langs, seats, tier desc, months), '[]'::jsonb)
  from public.plans where is_active
$$;

-- предложение личного тарифа после отмены групповой подписки — только тарифы одного языка
create or replace function public.personal_offer(p_user uuid, p_tier text, p_left interval)
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('tg_id', pr.tg_id, 'lang', pr.ui_lang, 'tier', p.tier, 'months', p.months,
                            'stars', p.price_stars, 'plan_id', p.id, 'days_left', ceil(extract(epoch from p_left) / 86400)::int)
  from public.profiles pr
  cross join lateral (
    select * from public.plans
     where tier = p_tier and seats = 1 and not all_langs and is_active
     order by (now() + make_interval(months => months) + interval '1 day' < now() + p_left), months
     limit 1) p
  where pr.id = p_user and not coalesce(pr.bot_blocked, false)
$$;

-- ---------------------------------------------------------------- оплата и возврат → все языки
create or replace function public.all_langs_on_payment()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_tg bigint; v_s timestamptz; v_e timestamptz; v_me text;
begin
  v_me := (select c.relnamespace::regnamespace::text from pg_class c where c.oid = 'public.payments'::regclass);
  if tg_op = 'INSERT' then
    if coalesce((select all_langs from public.plans where id = new.plan_id), false) then
      select tg_id into v_tg from public.profiles where id = new.user_id;
      select starts_at, ends_at into v_s, v_e from public.subscriptions where id = new.subscription_id;
      begin
        perform shared.grant_all_langs(new.charge_id, v_tg, new.tier, new.months,
                                       coalesce(v_s, now()), coalesce(v_e, now() + make_interval(months => new.months)), v_me);
      exception when others then
        -- ошибка не должна отменить оплату: подписка в языке оплаты уже выдана, в журнале базы — предупреждение
        raise warning 'all_langs grant %: %', new.charge_id, sqlerrm;
      end;
    end if;
  elsif tg_op = 'UPDATE' and new.status = 'refunded' and old.status is distinct from 'refunded' then
    if exists (select 1 from shared.all_lang_subs where charge_id = new.charge_id) then
      perform shared.refund_all_langs(new.charge_id);
    end if;
  end if;
  return null;
end $$;
drop trigger if exists payments_all_langs on public.payments;
create trigger payments_all_langs after insert or update of status on public.payments
  for each row execute function public.all_langs_on_payment();

create or replace function public.all_langs_on_profile_created()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.tg_id is not null then
    begin
      perform shared.all_langs_for_profile(
        (select c.relnamespace::regnamespace::text from pg_class c where c.oid = 'public.profiles'::regclass), new.id, new.tg_id);
    exception when others then
      raise warning 'all_langs for profile %: %', new.tg_id, sqlerrm;
    end;
  end if;
  return null;
end $$;
drop trigger if exists profiles_all_langs on public.profiles;
create trigger profiles_all_langs after insert on public.profiles
  for each row execute function public.all_langs_on_profile_created();

revoke execute on function public.all_langs_on_payment() from public, anon, authenticated;
revoke execute on function public.personal_offer(uuid, text, interval) from public, anon, authenticated;
revoke execute on function public.all_langs_on_profile_created() from public, anon, authenticated;
revoke execute on function public.get_plans() from public, anon;
grant execute on function public.get_plans() to authenticated;
