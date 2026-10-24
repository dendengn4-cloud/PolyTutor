-- Проверка шага 24: администратор редактирует список «Другие языки».
\set ON_ERROR_STOP 1
\pset tuples_only on
create or replace function pg_temp.check(cond boolean, label text) returns text language plpgsql as $$
begin
  if not coalesce(cond, false) then raise exception 'FAIL: %', label; end if;
  return 'ok  ' || label;
end $$;
create temp table keep as select value from public.app_config where key = 'other_languages';
delete from public.admins where tg_id in (2401);
delete from public.profiles where tg_id in (2401, 2402);
insert into public.profiles (id, tg_id, first_name) values
  ('24010000-0000-0000-0000-000000000001', 2401, 'Admin'), ('24020000-0000-0000-0000-000000000001', 2402, 'User');
insert into public.admins (tg_id) values (2401);
grant select on keep to authenticated;
set role authenticated;
set request.jwt.claim.sub = '24020000-0000-0000-0000-000000000001';
select pg_temp.check(public.admin_other_languages()->>'error' = 'forbidden', 'обычный пользователь не видит настройку');
select pg_temp.check(public.admin_set_other_languages('[{"bot":"armenian_tutor_bot"}]')->>'error' = 'forbidden', 'и не может её менять');
set request.jwt.claim.sub = '24010000-0000-0000-0000-000000000001';
select pg_temp.check(public.admin_set_other_languages('[{"bot":"bad name"}]')->>'error' = 'bad_bot', 'неверное имя бота — отказ');
select pg_temp.check(public.admin_set_other_languages('[{"bot":"a_bot_1"},{"bot":"A_Bot_1"}]')->>'error' = 'duplicate', 'повтор — отказ');
select pg_temp.check((public.admin_set_other_languages('[{"bot":"@armenian_tutor_bot","flag":"🇦🇲","name_ru":"Армянский язык"},{"bot":"https://t.me/kazakh_tutor_bot","name_ru":"  Казахский  "}]')->>'ok')::boolean,
                     'сохранено: @ и ссылка t.me убираются');
select pg_temp.check(public.get_app_info()->'other_languages'->0->>'bot' = 'armenian_tutor_bot'
                     and public.get_app_info()->'other_languages'->1->>'bot' = 'kazakh_tutor_bot'
                     and public.get_app_info()->'other_languages'->1->>'name_ru' = 'Казахский', 'приложение видит новый список');
select pg_temp.check(jsonb_array_length(public.admin_other_languages()->'items') = 2, 'администратор видит 2 языка');
reset role;
update public.app_config set value = (select value from keep) where key = 'other_languages';
delete from public.admins where tg_id in (2401);
delete from public.profiles where tg_id in (2401, 2402);
