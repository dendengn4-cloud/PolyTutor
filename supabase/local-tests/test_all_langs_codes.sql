-- Проверка common/20261105090000_all_langs_codes.sql: коды «Все языки».
-- База с несколькими языками (схемы hy, sv и uz), без рендера: psql -f test_all_langs_codes.sql
reset role;
insert into sv.profiles (id, tg_id, first_name, ui_lang) values
  ('c0de0000-0000-0000-0000-0000000000a1', 991101, 'Admin', 'ru'),
  ('c0de0000-0000-0000-0000-0000000000b1', 991102, 'User', 'ru'),
  ('c0de0000-0000-0000-0000-0000000000c1', 991103, 'One', 'ru')
on conflict (id) do nothing;
insert into hy.profiles (id, tg_id, first_name, ui_lang) values
  ('c0de0000-0000-0000-0000-0000000000b2', 991102, 'User', 'ru'),
  ('c0de0000-0000-0000-0000-0000000000c2', 991103, 'One', 'ru')
on conflict (id) do nothing;
insert into sv.admins (tg_id) values (991101) on conflict do nothing;

set role authenticated;
set request.jwt.claim.sub = 'c0de0000-0000-0000-0000-0000000000b1';
do $$ begin
  if sv.admin_generate_codes('basic', 1, 1, 1, true)->>'error' <> 'forbidden' then raise exception 'FAIL: коды доступны не администратору'; end if;
end $$;

set request.jwt.claim.sub = 'c0de0000-0000-0000-0000-0000000000a1';
do $$ declare r jsonb; o jsonb; begin
  r := sv.admin_generate_codes(p_tier => 'advanced', p_months => 3, p_count => 2, p_uses => 1, p_all => true);
  if not (r->>'ok')::boolean or jsonb_array_length(r->'codes') <> 2 or not (r->>'all_langs')::boolean then raise exception 'FAIL: %', r; end if;
  o := sv.admin_generate_codes(p_tier => 'basic', p_months => 1, p_count => 1, p_uses => 1);   -- как раньше, без p_all
  if (o->>'all_langs')::boolean then raise exception 'FAIL: обычный код помечен «Все языки»'; end if;
  perform set_config('t.all1', r->'codes'->>0, false);
  perform set_config('t.one', o->'codes'->>0, false);
  raise notice 'ok: коды созданы (% / %)', r->'codes'->>0, o->'codes'->>0;
end $$;

-- активация кода «Все языки» в sv → подписка и в hy
set request.jwt.claim.sub = 'c0de0000-0000-0000-0000-0000000000b1';
do $$ declare r jsonb; begin
  r := sv.redeem_code(current_setting('t.all1'));
  if not (r->>'ok')::boolean then raise exception 'FAIL: активация %', r; end if;
end $$;
-- обычный код → только этот язык
set request.jwt.claim.sub = 'c0de0000-0000-0000-0000-0000000000c1';
do $$ declare r jsonb; begin
  r := sv.redeem_code(current_setting('t.one'));
  if not (r->>'ok')::boolean then raise exception 'FAIL: активация обычного %', r; end if;
end $$;

reset role;
do $$ declare n int; begin
  select count(*) into n from hy.subscriptions where user_id = 'c0de0000-0000-0000-0000-0000000000b2'
     and tier = 'advanced' and source_ref like 'all:code:sv:%';
  if n <> 1 then raise exception 'FAIL: в hy подписок по коду «Все языки»: %', n; end if;
  select count(*) into n from hy.subscriptions where user_id = 'c0de0000-0000-0000-0000-0000000000c2';
  if n <> 0 then raise exception 'FAIL: обычный код выдал подписку в hy'; end if;
  if not exists (select 1 from sv.subscriptions where user_id = 'c0de0000-0000-0000-0000-0000000000b1' and tier = 'advanced')
    then raise exception 'FAIL: нет подписки в sv'; end if;
  raise notice 'ok: код «Все языки» → hy, обычный код → только sv';
end $$;

-- новый язык позже: профиль в uz получает подписку
insert into uz.profiles (id, tg_id, first_name, ui_lang) values ('c0de0000-0000-0000-0000-0000000000b3', 991102, 'User', 'ru');
do $$ begin
  if not exists (select 1 from uz.subscriptions where user_id = 'c0de0000-0000-0000-0000-0000000000b3'
                  and tier = 'advanced' and source_ref like 'all:code:sv:%' and ends_at > now() + interval '80 days')
    then raise exception 'FAIL: новый профиль в uz без подписки'; end if;
  raise notice 'ok: новый язык получил подписку по коду';
end $$;

-- уборка
delete from uz.subscriptions where user_id = 'c0de0000-0000-0000-0000-0000000000b3';
delete from uz.profiles where id = 'c0de0000-0000-0000-0000-0000000000b3';
delete from hy.subscriptions where user_id in ('c0de0000-0000-0000-0000-0000000000b2', 'c0de0000-0000-0000-0000-0000000000c2');
delete from hy.profiles where id in ('c0de0000-0000-0000-0000-0000000000b2', 'c0de0000-0000-0000-0000-0000000000c2');
delete from sv.code_redemptions where user_id in ('c0de0000-0000-0000-0000-0000000000b1', 'c0de0000-0000-0000-0000-0000000000c1');
delete from sv.code_attempts where user_id in ('c0de0000-0000-0000-0000-0000000000b1', 'c0de0000-0000-0000-0000-0000000000c1');
delete from sv.subscriptions where user_id in ('c0de0000-0000-0000-0000-0000000000b1', 'c0de0000-0000-0000-0000-0000000000c1');
delete from sv.access_codes where created_by = 991101;
delete from shared.all_lang_subs where tg_id = 991102;
delete from sv.admins where tg_id = 991101;
delete from sv.profiles where id in ('c0de0000-0000-0000-0000-0000000000a1', 'c0de0000-0000-0000-0000-0000000000b1', 'c0de0000-0000-0000-0000-0000000000c1');
select 'all_langs codes passed';
