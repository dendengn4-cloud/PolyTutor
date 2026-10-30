-- Выполнить ОДИН РАЗ в SQL Editor СТАРОГО проекта Supabase (армянского или узбекского приложения).
-- Создаёт пользователя базы tutor_sync, который может только читать нужные таблицы.
-- Приложение, его таблицы, данные, функции и настройки не меняются. В конце показывается пароль tutor_sync —
-- его нужно сохранить в GitHub (секрет OLD_HY_DB_PASSWORD или OLD_UZ_DB_PASSWORD). Повторный запуск выдаёт новый пароль.
do $$
declare
  v_pw     text := replace(gen_random_uuid()::text, '-', '');
  v_t      text;
begin
  if exists (select 1 from pg_roles where rolname = 'tutor_sync') then
    execute format('alter role tutor_sync with login password %L', v_pw);
  else
    execute format('create role tutor_sync with login password %L', v_pw);
  end if;
  -- только чтение — даже если бы права были шире, любая запись этим пользователем будет отклонена
  execute 'alter role tutor_sync set default_transaction_read_only = on';
  execute 'alter role tutor_sync set statement_timeout = ''600s''';
  -- чтение строк всех пользователей: правило (policy) «чтение для tutor_sync». Оно действует только для этого
  -- пользователя; правила приложения (ученик видит только своё) остаются как были.
  execute 'grant usage on schema public to tutor_sync';
  foreach v_t in array array['profiles', 'word_progress', 'sentence_progress', 'verb_progress', 'marathon_progress',
                             'daily_stats', 'level_test_attempts', 'course_progress', 'course_units', 'word_queue', 'subscriptions'] loop
    if to_regclass('public.' || v_t) is not null then
      execute format('grant select on public.%I to tutor_sync', v_t);
      if not exists (select 1 from pg_policies
                                       where schemaname = 'public' and tablename = v_t and policyname = 'tutor_sync_read') then
        execute format('create policy tutor_sync_read on public.%I for select to tutor_sync using (true)', v_t);
      end if;
    end if;
  end loop;
  perform set_config('tutor_sync.pw', v_pw, false);
end $$;
select current_setting('tutor_sync.pw') as "Пароль tutor_sync (сохраните в GitHub)";
