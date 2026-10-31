-- Коды подписки «Все языки» (Настройки → Администратор → «Коды подписки» → «Все языки»).
-- Код активируется в языке, где он создан (Подписка → Код подписки). После активации та же подписка
-- выдаётся во всех остальных языках, где у человека есть профиль, и в тех, что он начнёт позже —
-- так же, как при оплате тарифа «Все языки» (shared.grant_all_langs, source_ref 'all:code:…').
alter table public.access_codes add column if not exists all_langs boolean not null default false;

-- старая версия (4 параметра) заменяется версией с p_all — иначе вызов с именованными параметрами неоднозначен
drop function if exists public.admin_generate_codes(text, int, int, int);
create or replace function public.admin_generate_codes(p_tier text, p_months int, p_count int, p_uses int default 1,
                                                       p_all boolean default false)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
  v_tg bigint := (select tg_id from public.profiles where id = auth.uid());
  v_note text;
  v_codes jsonb;
begin
  if not public.is_admin() then return jsonb_build_object('error', 'forbidden'); end if;
  if p_tier not in ('basic', 'advanced') or p_months not in (1, 3, 6, 12)
     or p_count is null or p_count < 1 or p_count > 50 or coalesce(p_uses, 1) < 1 or coalesce(p_uses, 1) > 1000 then
    return jsonb_build_object('error', 'bad_args');
  end if;
  -- уникальная пометка партии: по ней отмечаются коды «Все языки»
  v_note := 'app ' || to_char(now(), 'YYYY-MM-DD') || case when coalesce(p_all, false) then ' all ' else ' ' end
            || substr(md5(random()::text), 1, 8);
  select coalesce(jsonb_agg(c), '[]'::jsonb) into v_codes
    from public.admin_create_codes(p_tier, p_months, p_count, coalesce(p_uses, 1), null, v_note, v_tg) c;
  if coalesce(p_all, false) then
    update public.access_codes set all_langs = true where note = v_note;
  end if;
  return jsonb_build_object('ok', true, 'codes', v_codes, 'tier', p_tier, 'months', p_months,
                            'uses', coalesce(p_uses, 1), 'all_langs', coalesce(p_all, false));
end $$;
revoke execute on function public.admin_generate_codes(text, int, int, int, boolean) from public, anon;
grant execute on function public.admin_generate_codes(text, int, int, int, boolean) to authenticated;

-- активация кода «Все языки» → подписка во всех языках
create or replace function public.all_langs_on_code_redeemed()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_code public.access_codes%rowtype; v_tg bigint; v_s timestamptz; v_e timestamptz; v_me text;
begin
  select * into v_code from public.access_codes where id = new.code_id;
  if not found or not v_code.all_langs then return null; end if;
  v_me := (select c.relnamespace::regnamespace::text from pg_class c where c.oid = 'public.access_codes'::regclass);
  select tg_id into v_tg from public.profiles where id = new.user_id;
  if v_tg is null then return null; end if;
  select starts_at, ends_at into v_s, v_e from public.subscriptions where id = new.subscription_id;
  begin
    perform shared.grant_all_langs('code:' || v_me || ':' || new.code_id || ':' || new.user_id, v_tg, v_code.tier,
                                   v_code.months, coalesce(v_s, now()),
                                   coalesce(v_e, now() + make_interval(months => v_code.months)), v_me);
  exception when others then
    -- ошибка не должна отменить активацию: подписка в этом языке уже выдана
    raise warning 'all_langs code %: %', new.code_id, sqlerrm;
  end;
  return null;
end $$;
drop trigger if exists code_redemptions_all_langs on public.code_redemptions;
create trigger code_redemptions_all_langs after insert on public.code_redemptions
  for each row execute function public.all_langs_on_code_redeemed();
revoke execute on function public.all_langs_on_code_redeemed() from public, anon, authenticated;
