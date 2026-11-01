-- Проверка корейской версии на локальной базе: после local_stubs.sql, миграций и импорта словаря и курсов
-- (scripts/load_vocab.sql, scripts/load_courses.sql). Любая ошибка останавливает файл (ON_ERROR_STOP).
-- Узбекские test_step*.sql рассчитаны на узбекские слова — для корейской копии запускается этот файл.
\set ON_ERROR_STOP 1

-- ---------------------------------------------------------------- данные
do $$
declare n int;
begin
  select count(*) into n from public.words;
  if n < 4000 then raise exception 'FAIL: words %', n; end if;
  if exists (select 1 from public.words where uz ~ '[А-Яа-яЁёա-և]' or uz !~ '[가-힣]') then raise exception 'FAIL: в корейском слове чужие буквы'; end if;
  if exists (select 1 from public.words where uz_key <> public.key_uz(uz)) then raise exception 'FAIL: uz_key ≠ key_uz(uz)'; end if;
  select count(*) into n from public.course_units where coalesce(title_uz, '') = '' or coalesce(express_uz, '') = '';
  if n > 0 then raise exception 'FAIL: % тем курсов без корейского текста', n; end if;
  if (select count(*) from public.course_units where course_id = 'dialogs') <> 30 then raise exception 'FAIL: диалогов не 30'; end if;
  raise notice 'ok: данные (% слов)', (select count(*) from public.words);
end $$;

-- ---------------------------------------------------------------- нормализация (та же, что в build_vocab.py и normalize.js)
do $$ begin
  if public.key_uz('안녕 하세요!') <> '안녕하세요' then raise exception 'FAIL: key_uz %', public.key_uz('안녕 하세요!'); end if;
  if public.key_uz('KTX 타요.') <> 'ktx타요' then raise exception 'FAIL: key_uz latin %', public.key_uz('KTX 타요.'); end if;
  if public.uz_strip_pron('저는 학생이에요') <> '학생이에요' then raise exception 'FAIL: uz_strip_pron %', public.uz_strip_pron('저는 학생이에요'); end if;
  if not public.uz_same('나는 가요', '가요') then raise exception 'FAIL: uz_same pron'; end if;
  if not public.is_cognate(public.key_uz('택시'), array['такси']) or not public.is_cognate(public.key_uz('바나나'), array['банан']) then raise exception 'FAIL: is_cognate'; end if;
  if public.is_cognate(public.key_uz('빵'), array['хлеб']) then raise exception 'FAIL: is_cognate 빵'; end if;
  raise notice 'ok: нормализация';
end $$;

-- ---------------------------------------------------------------- цены, язык, часовой пояс
do $$ begin
  if (select price_uzs from public.plans where tier = 'basic' and months = 1 and seats = 1 and not all_langs) <> 11100 then raise exception 'FAIL: цена в вонах'; end if;
  if (select value #>> '{}' from public.app_config where key = 'target_language') <> 'ko' then raise exception 'FAIL: target_language'; end if;
  raise notice 'ok: цены и настройки';
end $$;

-- ---------------------------------------------------------------- пользователь: интерфейс ko, сеанс, ответы, план дня
insert into public.profiles (id, tg_id, first_name, ui_lang) values ('a1a1a1a1-0000-0000-0000-000000000001', 990001, 'Test', 'ko')
on conflict (id) do nothing;
set role authenticated;
set request.jwt.claim.sub = 'a1a1a1a1-0000-0000-0000-000000000001';

do $$
declare s jsonb; me jsonb; nxt jsonb; items jsonb; ev jsonb := '[]'; it jsonb; r jsonb;
begin
  me := public.update_settings('ko', '{"onboarded": true}'::jsonb);
  if me->>'ui_lang' <> 'ko' then raise exception 'FAIL: ui_lang ko не сохранился: %', me->>'ui_lang'; end if;

  s := public.start_session('normal', null);
  items := s->'items';
  if jsonb_array_length(items) = 0 then raise exception 'FAIL: пустой сеанс: %', s; end if;
  if (items->0->>'uz') !~ '[가-힣]' then raise exception 'FAIL: в сеансе не корейское слово: %', items->0; end if;

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

-- тест уровня A1 собирается из корейских слов
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
  m := public.weekly_text('ko', null, 1);
  if m !~ '한 주' then raise exception 'FAIL: еженедельное сообщение на корейском: %', m; end if;
  select count(*) into n from public.words where test_ok;
  if n < 2500 then raise exception 'FAIL: слов для тестов мало: %', n; end if;
  if exists (select 1 from public.words w join public.topics t on t.id = w.topic_id where w.test_ok and t.name_ru = 'Корейские имена') then
    raise exception 'FAIL: имена попали в тесты'; end if;
  raise notice 'ok: сообщение недели, слова для тестов (%)', n;
end $$;

-- ---------------------------------------------------------------- часовой пояс, разговорная тема, грамматика
do $$ begin
  if (select timezone from public.profiles where id = 'a1a1a1a1-0000-0000-0000-000000000001') <> 'Asia/Seoul' then
    raise exception 'FAIL: часовой пояс по умолчанию'; end if;
  if not exists (select 1 from public.topics where name_uz like '구어. %') then raise exception 'FAIL: разговорные темы'; end if;
  if (select count(*) from public.course_units where course_id = 'grammar' and example_pattern is not null) <> 41 then raise exception 'FAIL: шаблоны грамматики'; end if;
  raise notice 'ok: часовой пояс, разговорные темы, шаблоны грамматики';
end $$;

-- ---------------------------------------------------------------- формы глагола и частицы существительного
reset role;
insert into public.course_progress (user_id, unit_id, read_at)
select 'a1a1a1a1-0000-0000-0000-000000000001', u.id, now() from public.course_units u
 where u.course_id = 'grammar' and u.source_no in (15, 12)
on conflict do nothing;
select set_config('t.gid', (select id from public.words where uz = '가다' and canonical_id is null limit 1)::text, false),
       set_config('t.nid', (select id from public.words where uz = '책' and canonical_id is null limit 1)::text, false);
set role authenticated;
set request.jwt.claim.sub = 'a1a1a1a1-0000-0000-0000-000000000001';
do $$
declare v jsonb; n jsonb; m jsonb; gid int := current_setting('t.gid')::int; nid int := current_setting('t.nid')::int; r jsonb;
begin
  v := public.get_verbs();
  if not (v->'state'->'grammar' @> '[15]'::jsonb) then raise exception 'FAIL: тема 15 не открыла формы: %', v->'state'; end if;
  if jsonb_array_length(v->'verbs') < 600 then raise exception 'FAIL: глаголов мало: %', jsonb_array_length(v->'verbs'); end if;
  n := public.get_nouns();
  if jsonb_array_length(n->'nouns') < 1500 then raise exception 'FAIL: существительных мало: %', jsonb_array_length(n->'nouns'); end if;
  m := public.get_morph(jsonb_build_array(gid, nid));
  if m->(gid::text)->'v'->'pres'->>0 <> '가요' then raise exception 'FAIL: 가다 pres: %', m->(gid::text); end if;
  if m->(gid::text)->'v'->'past'->>1 <> '갔습니다' then raise exception 'FAIL: 가다 past: %', m->(gid::text)->'v'->'past'; end if;
  if m->(nid::text)->'n'->'p'->>2 <> '책을' then raise exception 'FAIL: 책 obj: %', m->(nid::text); end if;
  r := public.answer_morph(gid, 'form', 1, 1);
  if r->>'level' is null then raise exception 'FAIL: answer_morph: %', r; end if;
  r := public.answer_morph(nid, 'decl', 3, 4);
  raise notice 'ok: формы (глаголов %, существительных %), уровень формы %', jsonb_array_length(v->'verbs'), jsonb_array_length(n->'nouns'), r->>'level';
end $$;

-- ---------------------------------------------------------------- сообщения: карусель, «во все языки» — один раз
reset role;
insert into public.announcements (body, scope) values ('Тест: старое', 'lang'), ('Тест: всем', 'all'), ('Тест: новое', 'lang');
set role authenticated;
set request.jwt.claim.sub = 'a1a1a1a1-0000-0000-0000-000000000001';
do $$
declare l jsonb;
begin
  l := public.get_announcements();
  if jsonb_array_length(l) <> 3 or l->0->>'body' <> 'Тест: старое' or l->2->>'body' <> 'Тест: новое' then
    raise exception 'FAIL: карусель от старого к новому: %', l; end if;
  perform public.mark_announcements_seen(array(select (x->>'id')::bigint from jsonb_array_elements(l) x));
  if jsonb_array_length(public.get_announcements()) <> 0 then raise exception 'FAIL: прочитанные снова показаны'; end if;
end $$;
-- та же рассылка «во все языки» пришла в этот язык ещё раз (как если бы это был другой язык) — не показывается
reset role;
insert into public.announcements (body, scope, grp)
select 'Тест: всем', 'all', grp from public.announcements where body = 'Тест: всем' limit 1;
insert into public.profiles (id, tg_id, first_name) values ('a1a1a1a1-0000-0000-0000-000000000002', 990002, 'New')
on conflict (id) do nothing;
set role authenticated;
set request.jwt.claim.sub = 'a1a1a1a1-0000-0000-0000-000000000001';
do $$ begin
  if jsonb_array_length(public.get_announcements()) <> 0 then raise exception 'FAIL: рассылка «во все языки» показана второй раз'; end if;
end $$;
set request.jwt.claim.sub = 'a1a1a1a1-0000-0000-0000-000000000002';
do $$ declare l jsonb; begin
  l := public.get_announcements();
  if jsonb_array_length(l) <> 0 then raise exception 'FAIL: зарегистрировавшийся после сообщений их видит: %', l; end if;
  raise notice 'ok: сообщения — карусель, рассылка один раз, новым пользователям старые не показываются';
end $$;
reset role;

-- ---------------------------------------------------------------- оформление и детский режим
set role authenticated;
set request.jwt.claim.sub = 'a1a1a1a1-0000-0000-0000-000000000001';
do $$
declare r jsonb; w jsonb; st jsonb; uid uuid := 'a1a1a1a1-0000-0000-0000-000000000001';
begin
  r := public.set_look('{"radius": 99, "icons": 2, "pics": true, "pics_style": "wc", "pics_bg": "sticker", "kids_style": "paper", "x": 1}');
  if r->'settings'->>'radius' <> '11' or r->'settings'->>'pics_bg' <> 'sticker' or r->'settings' ? 'x' then raise exception 'FAIL: set_look %', r->'settings'; end if;
  if (public.kids_enable('12a4')->>'error') <> 'bad_pin' then raise exception 'FAIL: плохой ПИН принят'; end if;
  r := public.kids_enable('1234');
  if not (r->'me'->'settings'->>'kids')::boolean then raise exception 'FAIL: kids не включён'; end if;
  if (public.kids_check('0000')->>'ok')::boolean then raise exception 'FAIL: неверный ПИН принят'; end if;
  if not (public.kids_check('1234')->>'ok')::boolean then raise exception 'FAIL: верный ПИН не принят'; end if;
  w := public.kids_words(array['кошка', 'яблоко', 'дом', 'нет такого слова']);
  if jsonb_array_length(w) < 3 then raise exception 'FAIL: kids_words %', w; end if;
  perform public.kids_answer((w->0->>'i')::int, true, 20, false);
  perform public.kids_answer((w->0->>'i')::int, true, 20, true);
  st := public.kids_stats();
  if (st->>'words')::int <> 1 or (st->>'blocks')::int <> 1 or (st->>'streak')::int <> 1 or jsonb_array_length(st->'week') <> 7 then
    raise exception 'FAIL: kids_stats %', st; end if;
  if (public.kids_disable('9999')->>'ok')::boolean then raise exception 'FAIL: выключение без ПИН'; end if;
  r := public.kids_disable('1234');
  if (r->'me'->'settings'->>'kids')::boolean then raise exception 'FAIL: kids не выключен'; end if;
  raise notice 'ok: оформление, детский режим (ПИН, слова %, успехи)', jsonb_array_length(w);
end $$;
-- «Забыли код?»: бот берёт код сброса, пользователь задаёт новый ПИН
set role authenticated;
select public.kids_enable('1234') is not null;
reset role;
select set_config('t.code', public.kids_reset_code('a1a1a1a1-0000-0000-0000-000000000001')->>'code', false);
set role authenticated;
do $$ begin
  if (public.kids_reset('000000x', '5555')->>'error') is null then raise exception 'FAIL: неверный код сброса принят'; end if;
  if not (public.kids_reset(current_setting('t.code'), '5555')->>'ok')::boolean then raise exception 'FAIL: сброс ПИН'; end if;
  if not (public.kids_check('5555')->>'ok')::boolean then raise exception 'FAIL: новый ПИН не работает'; end if;
  perform public.kids_disable('5555');
  raise notice 'ok: сброс ПИН через бота';
end $$;
reset role;
