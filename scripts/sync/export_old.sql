-- Снимок пользователей старого приложения (армянского или узбекского): одна строка на человека — Telegram ID и JSON.
-- Выполняется задачей «Синхронизация со старыми приложениями» под пользователем tutor_sync (только чтение).
-- Ничего не меняет: только select. Формат вывода — COPY (текст), его же читает \copy в Polytutor.
copy (
  select p.tg_id, jsonb_build_object(
    'profile', jsonb_build_object('ui_lang', p.ui_lang, 'timezone', p.timezone, 'settings', p.settings),
    'word_progress', coalesce((select jsonb_agg(to_jsonb(w) - 'user_id') from public.word_progress w where w.user_id = p.id), '[]'::jsonb),
    'sentence_progress', coalesce((select jsonb_agg(to_jsonb(s) - 'user_id') from public.sentence_progress s where s.user_id = p.id), '[]'::jsonb),
    'verb_progress', coalesce((select jsonb_agg(to_jsonb(v) - 'user_id') from public.verb_progress v where v.user_id = p.id), '[]'::jsonb),
    'marathon_progress', coalesce((select jsonb_agg(to_jsonb(m) - 'user_id') from public.marathon_progress m where m.user_id = p.id), '[]'::jsonb),
    'daily_stats', coalesce((select jsonb_agg(to_jsonb(ds) - 'user_id') from public.daily_stats ds where ds.user_id = p.id), '[]'::jsonb),
    'level_tests', coalesce((select jsonb_agg(to_jsonb(a) - 'user_id') from public.level_test_attempts a
                              where a.user_id = p.id and a.passed and a.finished_at is not null), '[]'::jsonb),
    'course_progress', coalesce((select jsonb_agg((to_jsonb(c) - 'user_id' - 'unit_id')
                                                  || jsonb_build_object('course_id', u.course_id, 'source_no', u.source_no))
                                  from public.course_progress c join public.course_units u on u.id = c.unit_id
                                 where c.user_id = p.id), '[]'::jsonb),
    'word_queue', coalesce((select jsonb_agg(jsonb_build_object('word_id', q.word_id, 'added_at', q.added_at,
                                                                'course_id', u.course_id, 'source_no', u.source_no))
                             from public.word_queue q left join public.course_units u on u.id = q.unit_id
                            where q.user_id = p.id), '[]'::jsonb),
    'subscriptions', coalesce((select jsonb_agg(jsonb_build_object('id', s.id, 'tier', s.tier, 'starts_at', s.starts_at, 'ends_at', s.ends_at))
                                from public.subscriptions s where s.user_id = p.id and s.ends_at > now()), '[]'::jsonb)
  )
  from public.profiles p
  where p.tg_id is not null
) to stdout;
