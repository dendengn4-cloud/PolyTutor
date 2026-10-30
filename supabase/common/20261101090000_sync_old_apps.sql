-- Перенос прогресса и подписок из отдельных приложений (старые армянский и узбекский боты) в этот раздел.
-- Раз в неделю задача GitHub «Синхронизация со старыми приложениями» читает старую базу (только чтение) и кладёт
-- снимок каждого пользователя в sync_snapshot (по Telegram ID), затем вызывает sync_apply_all().
-- Человек, который ещё не заходил сюда, получает снимок при первом входе (триггер на создание профиля).
-- Правило объединения: по каждому слову, теме, тесту остаётся то, что дальше; здесь ничего не теряется.
-- Подписки старого приложения копируются как отдельные записи (source 'manual', source_ref 'sync:<id>:<конец>').

create table if not exists public.sync_snapshot (
  tg_id       bigint primary key,
  data        jsonb not null,
  synced_at   timestamptz not null default now(),     -- когда снимок прочитан из старой базы
  applied_at  timestamptz                             -- когда последний раз перенесён в профиль
);
alter table public.sync_snapshot enable row level security;   -- политик нет: только владелец и service_role
revoke all on public.sync_snapshot from anon, authenticated;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    execute 'grant select, insert, update, delete on public.sync_snapshot to service_role';
  end if;
end $$;

-- Перенос снимка в профиль с этим Telegram ID. Повторный вызов безопасен: уже перенесённое не дублируется,
-- а продвинутое здесь не откатывается.
create or replace function public.sync_apply(p_tg_id bigint)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
  v_uid   uuid;
  v_set   jsonb;
  d       jsonb;
  v_first boolean;
  v_n     int;
  v_res   jsonb := '{}'::jsonb;
  v_refs  text[];
begin
  select id, coalesce(settings, '{}'::jsonb) into v_uid, v_set from public.profiles where tg_id = p_tg_id;
  select data into d from public.sync_snapshot where tg_id = p_tg_id;
  if v_uid is null or d is null then return null; end if;
  v_first := not (v_set ? 'synced_at');

  -- настройки: из старого приложения — то, чего здесь ещё нет (здешние значения главнее)
  update public.profiles
     set settings = (coalesce(d->'profile'->'settings', '{}'::jsonb) - 'ann_seen' - 'synced_at')
                    || coalesce(settings, '{}'::jsonb) || jsonb_build_object('synced_at', now())
   where id = v_uid;
  if v_first then
    -- первый перенос: язык интерфейса и часовой пояс как в старом приложении (если подходят этому разделу)
    begin
      update public.profiles set ui_lang = d->'profile'->>'ui_lang'
       where id = v_uid and coalesce(d->'profile'->>'ui_lang', '') <> '';
    exception when others then null;
    end;
    begin
      update public.profiles set timezone = d->'profile'->>'timezone'
       where id = v_uid and coalesce(d->'profile'->>'timezone', '') <> '';
    exception when others then null;
    end;
  end if;

  -- слова: остаётся более высокий уровень (при равном — более свежий)
  insert into public.word_progress as t (user_id, word_id, level, level_at, due_on, fail_streak, correct_count, wrong_count,
                                         first_seen_at, last_correct_at, last_seen_at)
  select v_uid, r.word_id, r.level, r.level_at, r.due_on, coalesce(r.fail_streak, 0), coalesce(r.correct_count, 0),
         coalesce(r.wrong_count, 0), r.first_seen_at, r.last_correct_at, r.last_seen_at
    from jsonb_populate_recordset(null::public.word_progress, coalesce(d->'word_progress', '[]'::jsonb)) r
   where r.word_id is not null and r.level is not null and exists (select 1 from public.words w where w.id = r.word_id)
  on conflict (user_id, word_id) do update
     set level = excluded.level, level_at = excluded.level_at, due_on = excluded.due_on, fail_streak = excluded.fail_streak,
         correct_count = greatest(t.correct_count, excluded.correct_count), wrong_count = greatest(t.wrong_count, excluded.wrong_count),
         first_seen_at = least(t.first_seen_at, excluded.first_seen_at),
         last_correct_at = greatest(t.last_correct_at, excluded.last_correct_at),
         last_seen_at = greatest(t.last_seen_at, excluded.last_seen_at)
   where (excluded.level, coalesce(excluded.level_at, '-infinity'::timestamptz))
       > (t.level, coalesce(t.level_at, '-infinity'::timestamptz));
  get diagnostics v_n = row_count; v_res := v_res || jsonb_build_object('words', v_n);

  -- предложения и формы (спряжение / склонение): остаётся более высокий уровень
  insert into public.sentence_progress as t (user_id, word_id, n, level, due_on, correct, wrong, last_at)
  select v_uid, r.word_id, r.n, r.level, r.due_on, coalesce(r.correct, 0), coalesce(r.wrong, 0), r.last_at
    from jsonb_populate_recordset(null::public.sentence_progress, coalesce(d->'sentence_progress', '[]'::jsonb)) r
   where r.word_id is not null and r.n is not null and r.level is not null and exists (select 1 from public.words w where w.id = r.word_id)
  on conflict (user_id, word_id, n) do update
     set level = excluded.level, due_on = excluded.due_on, correct = greatest(t.correct, excluded.correct),
         wrong = greatest(t.wrong, excluded.wrong), last_at = greatest(t.last_at, excluded.last_at)
   where (excluded.level, coalesce(excluded.last_at, '-infinity'::timestamptz)) > (t.level, coalesce(t.last_at, '-infinity'::timestamptz));

  insert into public.verb_progress as t (user_id, word_id, kind, level, due_on, correct, wrong, last_at)
  select v_uid, r.word_id, r.kind, r.level, r.due_on, coalesce(r.correct, 0), coalesce(r.wrong, 0), r.last_at
    from jsonb_populate_recordset(null::public.verb_progress, coalesce(d->'verb_progress', '[]'::jsonb)) r
   where r.word_id is not null and r.kind in ('form', 'table', 'decl') and r.level is not null
     and exists (select 1 from public.words w where w.id = r.word_id)
  on conflict (user_id, word_id, kind) do update
     set level = excluded.level, due_on = excluded.due_on, correct = greatest(t.correct, excluded.correct),
         wrong = greatest(t.wrong, excluded.wrong), last_at = greatest(t.last_at, excluded.last_at)
   where (excluded.level, coalesce(excluded.last_at, '-infinity'::timestamptz)) > (t.level, coalesce(t.last_at, '-infinity'::timestamptz));

  -- марафон: дальше — кто закончил, затем лучший процент, затем позиция
  insert into public.marathon_progress as t (user_id, cefr, pos, correct, wrong, best_pct, started_at, updated_at, finished_at)
  select v_uid, r.cefr, coalesce(r.pos, 0), coalesce(r.correct, 0), coalesce(r.wrong, 0), r.best_pct,
         coalesce(r.started_at, now()), coalesce(r.updated_at, now()), r.finished_at
    from jsonb_populate_recordset(null::public.marathon_progress, coalesce(d->'marathon_progress', '[]'::jsonb)) r
   where r.cefr in ('A1', 'A2', 'B1', 'B2')
  on conflict (user_id, cefr) do update
     set pos = excluded.pos, correct = excluded.correct, wrong = excluded.wrong,
         best_pct = greatest(t.best_pct, excluded.best_pct), started_at = least(t.started_at, excluded.started_at),
         updated_at = greatest(t.updated_at, excluded.updated_at), finished_at = coalesce(t.finished_at, excluded.finished_at)
   where (excluded.finished_at is not null, coalesce(excluded.best_pct, -1), excluded.pos)
       > (t.finished_at is not null, coalesce(t.best_pct, -1), t.pos);

  -- статистика по дням (неделя, серия дней): по каждому числу — большее
  insert into public.daily_stats as t (user_id, day, sessions, new_words, reviews, correct, wrong, seconds)
  select v_uid, r.day, coalesce(r.sessions, 0), coalesce(r.new_words, 0), coalesce(r.reviews, 0),
         coalesce(r.correct, 0), coalesce(r.wrong, 0), coalesce(r.seconds, 0)
    from jsonb_populate_recordset(null::public.daily_stats, coalesce(d->'daily_stats', '[]'::jsonb)) r
   where r.day is not null
  on conflict (user_id, day) do update
     set sessions = greatest(t.sessions, excluded.sessions), new_words = greatest(t.new_words, excluded.new_words),
         reviews = greatest(t.reviews, excluded.reviews), correct = greatest(t.correct, excluded.correct),
         wrong = greatest(t.wrong, excluded.wrong), seconds = greatest(t.seconds, excluded.seconds);

  -- сданные тесты уровня (открывают уровни A2, B1, B2)
  insert into public.level_test_attempts (id, user_id, cefr, questions, answers, total, score, passed, started_at, finished_at)
  select r.id, v_uid, r.cefr, coalesce(r.questions, '[]'::jsonb), coalesce(r.answers, '{}'::jsonb), r.total, r.score, true,
         coalesce(r.started_at, r.finished_at), r.finished_at
    from jsonb_populate_recordset(null::public.level_test_attempts, coalesce(d->'level_tests', '[]'::jsonb)) r
   where r.id is not null and r.passed and r.finished_at is not null and r.cefr in ('A1', 'A2', 'B1', 'B2')
  on conflict (id) do nothing;
  get diagnostics v_n = row_count; v_res := v_res || jsonb_build_object('level_tests', v_n);

  -- темы курсов: номер темы здесь другой — сопоставление по курсу и номеру темы в файле (course_id, source_no)
  insert into public.course_progress as t (user_id, unit_id, status, best_score, updated_at, tasks_done, read_at)
  select v_uid, u.id, x.status, x.best_score, coalesce(x.updated_at, now()), coalesce(x.tasks_done, '{}'), x.read_at
    from jsonb_to_recordset(coalesce(d->'course_progress', '[]'::jsonb))
         as x(course_id text, source_no int, status text, best_score smallint, updated_at timestamptz, tasks_done smallint[], read_at timestamptz)
    join lateral (select cu.id from public.course_units cu
                   where cu.course_id = x.course_id and cu.source_no = x.source_no order by cu.id limit 1) u on true
   where x.status in ('opened', 'read', 'tested')
  on conflict (user_id, unit_id) do update
     set status = case when array_position(array['opened', 'read', 'tested'], excluded.status)
                            > array_position(array['opened', 'read', 'tested'], t.status) then excluded.status else t.status end,
         best_score = greatest(t.best_score, excluded.best_score),
         tasks_done = (select coalesce(array_agg(distinct v order by v), '{}') from unnest(t.tasks_done || excluded.tasks_done) v),
         read_at = least(t.read_at, excluded.read_at),
         updated_at = greatest(t.updated_at, excluded.updated_at);
  get diagnostics v_n = row_count; v_res := v_res || jsonb_build_object('units', v_n);

  -- очередь слов из прочитанных тем
  insert into public.word_queue (user_id, word_id, unit_id, added_at)
  select v_uid, x.word_id,
         (select cu.id from public.course_units cu where cu.course_id = x.course_id and cu.source_no = x.source_no order by cu.id limit 1),
         coalesce(x.added_at, now())
    from jsonb_to_recordset(coalesce(d->'word_queue', '[]'::jsonb)) as x(word_id int, course_id text, source_no int, added_at timestamptz)
   where x.word_id is not null and exists (select 1 from public.words w where w.id = x.word_id)
  on conflict (user_id, word_id) do nothing;

  -- подписки: действующие и будущие из старого приложения. Запись с тем же сроком не трогаем (её могли сдвинуть
  -- здешние покупки); изменившийся срок (продление, возврат) — заменяем; исчезнувшую в старом — удаляем.
  select coalesce(array_agg('sync:' || (s->>'id') || ':' || extract(epoch from (s->>'ends_at')::timestamptz)::bigint), '{}')
    into v_refs
    from jsonb_array_elements(coalesce(d->'subscriptions', '[]'::jsonb)) s
   where s->>'tier' in ('basic', 'advanced') and (s->>'ends_at')::timestamptz > (s->>'starts_at')::timestamptz;
  delete from public.subscriptions
   where user_id = v_uid and source = 'manual' and source_ref like 'sync:%' and not (source_ref = any (v_refs));
  insert into public.subscriptions (user_id, tier, starts_at, ends_at, source, source_ref)
  select v_uid, s->>'tier', (s->>'starts_at')::timestamptz, (s->>'ends_at')::timestamptz, 'manual',
         'sync:' || (s->>'id') || ':' || extract(epoch from (s->>'ends_at')::timestamptz)::bigint
    from jsonb_array_elements(coalesce(d->'subscriptions', '[]'::jsonb)) s
   where s->>'tier' in ('basic', 'advanced') and (s->>'ends_at')::timestamptz > (s->>'starts_at')::timestamptz
     and not exists (select 1 from public.subscriptions x
                      where x.user_id = v_uid and x.source = 'manual'
                        and x.source_ref = 'sync:' || (s->>'id') || ':' || extract(epoch from (s->>'ends_at')::timestamptz)::bigint);
  get diagnostics v_n = row_count; v_res := v_res || jsonb_build_object('subscriptions_added', v_n);

  update public.sync_snapshot set applied_at = now() where tg_id = p_tg_id;
  return v_res;
end $$;

-- Перенос всем, у кого уже есть профиль здесь (вызывает недельная задача после загрузки снимков)
create or replace function public.sync_apply_all()
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare r record; v_ok int := 0; v_err int := 0;
begin
  for r in select s.tg_id from public.sync_snapshot s join public.profiles p on p.tg_id = s.tg_id loop
    begin
      perform public.sync_apply(r.tg_id);
      v_ok := v_ok + 1;
    exception when others then
      v_err := v_err + 1;
      raise warning 'sync_apply(%): %', r.tg_id, sqlerrm;
    end;
  end loop;
  return jsonb_build_object('applied', v_ok, 'errors', v_err,
                            'snapshots', (select count(*) from public.sync_snapshot));
end $$;

-- Первый вход: профиль создан — сразу переносим снимок (ошибка переноса не мешает входу)
create or replace function public.sync_on_profile_created()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.tg_id is not null and exists (select 1 from public.sync_snapshot where tg_id = new.tg_id) then
    begin
      perform public.sync_apply(new.tg_id);
    exception when others then
      raise warning 'sync_apply(%) при первом входе: %', new.tg_id, sqlerrm;
    end;
  end if;
  return null;
end $$;
drop trigger if exists profiles_sync_old on public.profiles;
create trigger profiles_sync_old after insert on public.profiles
  for each row execute function public.sync_on_profile_created();

revoke execute on function public.sync_apply(bigint) from public, anon, authenticated;
revoke execute on function public.sync_apply_all() from public, anon, authenticated;
revoke execute on function public.sync_on_profile_created() from public, anon, authenticated;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    execute format('grant execute on function %s to service_role', 'public.sync_apply(bigint)');
    execute format('grant execute on function %s to service_role', 'public.sync_apply_all()');
  end if;
end $$;
