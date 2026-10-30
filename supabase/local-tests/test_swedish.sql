-- Проверка шведской версии на локальной базе: после local_stubs.sql, миграций и импорта словаря и курсов
-- (scripts/load_vocab.sql, scripts/load_courses.sql). Любая ошибка останавливает файл (ON_ERROR_STOP).
-- Узбекские test_step*.sql рассчитаны на узбекские слова — для шведской копии запускается этот файл.
\set ON_ERROR_STOP 1

-- ---------------------------------------------------------------- данные
do $$
declare n int;
begin
  select count(*) into n from public.words;
  if n < 4000 then raise exception 'FAIL: words %', n; end if;
  if exists (select 1 from public.words where uz ~ '[А-Яа-яЁёա-և]') then raise exception 'FAIL: в шведском слове чужие буквы'; end if;
  if exists (select 1 from public.words where uz_key <> public.key_uz(uz)) then raise exception 'FAIL: uz_key ≠ key_uz(uz)'; end if;
  select count(*) into n from public.course_units where coalesce(title_uz, '') = '' or coalesce(express_uz, '') = '';
  if n > 0 then raise exception 'FAIL: % тем курсов без шведского текста', n; end if;
  if (select count(*) from public.course_units where course_id = 'dialogs') <> 30 then raise exception 'FAIL: диалогов не 30'; end if;
  raise notice 'ok: данные (% слов)', (select count(*) from public.words);
end $$;

-- ---------------------------------------------------------------- нормализация (та же, что в build_vocab.py и normalize.js)
do $$ begin
  if public.key_uz('Hur MÅR du? Älskar ÖL, café') <> 'hur mår du älskar öl cafe' then raise exception 'FAIL: key_uz %', public.key_uz('Hur MÅR du? Älskar ÖL, café'); end if;
  if public.key_uz('Malmö-Göteborg') <> 'malmö göteborg' then raise exception 'FAIL: key_uz hyphen'; end if;
  if public.key_uz('Kalle''s  ') <> 'kalles' then raise exception 'FAIL: key_uz apostrophe %', public.key_uz('Kalle''s  '); end if;
  if regexp_replace(public.uz_strip_pron('jag går'), '\s+', ' ', 'g') <> 'går' then raise exception 'FAIL: uz_strip_pron'; end if;
  if not public.uz_same('att springa', 'springa') then raise exception 'FAIL: uz_same att'; end if;
  if not public.is_cognate(public.key_uz('en taxi'), array['такси']) and not public.is_cognate(public.key_uz('ett museum'), array['музей']) then raise exception 'FAIL: is_cognate'; end if;
  raise notice 'ok: нормализация';
end $$;

-- ---------------------------------------------------------------- цены, язык, часовой пояс
do $$ begin
  if (select price_uzs from public.plans where tier = 'basic' and months = 1 and seats = 1 and not all_langs) <> 89 then raise exception 'FAIL: цена в кронах'; end if;
  if (select value #>> '{}' from public.app_config where key = 'target_language') <> 'sv' then raise exception 'FAIL: target_language'; end if;
  raise notice 'ok: цены и настройки';
end $$;

-- ---------------------------------------------------------------- пользователь: интерфейс sv, сеанс, ответы, план дня
insert into public.profiles (id, tg_id, first_name, ui_lang) values ('a1a1a1a1-0000-0000-0000-000000000001', 990001, 'Test', 'sv')
on conflict (id) do nothing;
set role authenticated;
set request.jwt.claim.sub = 'a1a1a1a1-0000-0000-0000-000000000001';

do $$
declare s jsonb; me jsonb; nxt jsonb; items jsonb; ev jsonb := '[]'; it jsonb; r jsonb;
begin
  me := public.update_settings('sv', '{"onboarded": true}'::jsonb);
  if me->>'ui_lang' <> 'sv' then raise exception 'FAIL: ui_lang sv не сохранился: %', me->>'ui_lang'; end if;

  s := public.start_session('normal', null);
  items := s->'items';
  if jsonb_array_length(items) = 0 then raise exception 'FAIL: пустой сеанс: %', s; end if;
  if (items->0->>'uz') !~ '[a-zåäö]' then raise exception 'FAIL: в сеансе не шведское слово: %', items->0; end if;

  -- показ и верный ответ на каждую карточку сеанса (формат событий — как у приложения)
  for it in select * from jsonb_array_elements(items) loop
    ev := ev || jsonb_build_array(
      jsonb_build_object('seq', jsonb_array_length(ev) + 1, 'kind', 'shown', 'word_id', (it->>'id')::int),
      jsonb_build_object('seq', jsonb_array_length(ev) + 2, 'kind', 'answer', 'word_id', (it->>'id')::int,
                         'ex_type', 'uz_ru_choice', 'target', 'ru', 'answer', it->>'ru', 'attempt', 'first'));
  end loop;
  r := public.submit_answers((s->>'session_id')::uuid, ev);
  if (select count(*) from public.word_progress where user_id = auth.uid()) = 0 then raise exception 'FAIL: прогресс не записан: %', r; end if;

  nxt := public.get_next_step();
  if nxt->'next'->>'kind' = 'consolidate' and nxt->'next'->>'what' = 'conj' then raise exception 'FAIL: план предлагает спряжение'; end if;
  raise notice 'ok: сеанс (% слов), ответы, план: %', jsonb_array_length(items), nxt->'next'->>'kind';
end $$;

-- тест уровня A1 собирается из шведских слов
do $$
declare t jsonb;
begin
  t := public.start_level_test('A1');
  if t ? 'error' then raise exception 'FAIL: start_level_test: %', t; end if;
  if jsonb_array_length(t->'questions') < 20 then raise exception 'FAIL: мало вопросов теста: %', jsonb_array_length(t->'questions'); end if;
  raise notice 'ok: тест A1 (% вопросов)', jsonb_array_length(t->'questions');
end $$;

reset role;

do $$
declare m text; n int;
begin
  m := public.weekly_text('sv', null, 1);
  if m !~ 'vecka' then raise exception 'FAIL: еженедельное сообщение на шведском: %', m; end if;
  select count(*) into n from public.words where test_ok;
  if n < 2500 then raise exception 'FAIL: слов для тестов мало: %', n; end if;
  if exists (select 1 from public.words w join public.topics t on t.id = w.topic_id where w.test_ok and t.name_ru = 'Шведские имена') then
    raise exception 'FAIL: имена попали в тесты'; end if;
  raise notice 'ok: сообщение недели, слова для тестов (%)', n;
end $$;

delete from public.profiles where id = 'a1a1a1a1-0000-0000-0000-000000000001';
select 'swedish checks passed' as result;
