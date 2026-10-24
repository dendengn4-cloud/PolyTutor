-- Проверка шага 23: список «Другие языки» берётся из app_config, неверные имена ботов отбрасываются.
\set ON_ERROR_STOP 1
\pset tuples_only on
create or replace function pg_temp.check(cond boolean, label text) returns text language plpgsql as $$
begin
  if not coalesce(cond, false) then raise exception 'FAIL: %', label; end if;
  return 'ok  ' || label;
end $$;
create temp table keep as select value from public.app_config where key = 'other_languages';
update public.app_config set value = '[]' where key = 'other_languages';
select pg_temp.check(jsonb_array_length(public.get_app_info()->'other_languages') = 0, 'пустой список — кнопки нет');
update public.app_config set value = '[{"bot":"armenian_tutor_bot","flag":"🇦🇲","name_ru":"Армянский язык"},{"bot":"bad name!"},{"flag":"x"}]' where key = 'other_languages';
select pg_temp.check(jsonb_array_length(public.get_app_info()->'other_languages') = 1
                     and public.get_app_info()->'other_languages'->0->>'bot' = 'armenian_tutor_bot', 'в списке только корректные боты');
set role authenticated;
select pg_temp.check(public.get_app_info() ? 'other_languages', 'доступно приложению');
reset role;
update public.app_config set value = (select value from keep) where key = 'other_languages';
