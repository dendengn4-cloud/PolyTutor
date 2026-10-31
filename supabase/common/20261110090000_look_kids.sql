-- Оформление и детский режим (для всех языков).
--
-- Оформление (settings профиля, сохраняет set_look):
--   radius 0…11 — скругление углов (8 — как раньше), icons 0…7 — скругление иконок (3 — как раньше),
--   pics — картинки к словам, pics_style line | flat | wc, pics_bg white | none | sticker.
--
-- Детский режим:
--   • settings.kids = true — включён; settings.kids_style outline | paper | crayon — стиль картинок;
--   • ПИН-код (4 цифры) задаётся при включении, нужен для настроек и выключения: kids_pin (соль + sha256),
--     5 неверных попыток — пауза 10 минут;
--   • «Забыли код?»: бот присылает код сброса (kids_reset_code — только для бота), kids_reset(код, новый ПИН);
--   • слова детского режима — kids_words(русские значения → слова этого языка), прогресс — kids_progress,
--     дни и время — kids_days; kids_answer записывает ответ, kids_stats — «Успехи».

-- ---------------------------------------------------------------- оформление
create or replace function public.set_look(p jsonb)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v jsonb := '{}'::jsonb;
begin
  if v_uid is null then return jsonb_build_object('error', 'not_authenticated'); end if;
  if p ? 'radius' and jsonb_typeof(p->'radius') = 'number' then
    v := v || jsonb_build_object('radius', least(11, greatest(0, (p->>'radius')::int)));
  end if;
  if p ? 'icons' and jsonb_typeof(p->'icons') = 'number' then
    v := v || jsonb_build_object('icons', least(7, greatest(0, (p->>'icons')::int)));
  end if;
  if p ? 'pics' and jsonb_typeof(p->'pics') = 'boolean' then
    v := v || jsonb_build_object('pics', (p->>'pics')::boolean);
  end if;
  if p->>'pics_style' in ('line', 'flat', 'wc') then
    v := v || jsonb_build_object('pics_style', p->>'pics_style');
  end if;
  if p->>'pics_bg' in ('white', 'none', 'sticker') then
    v := v || jsonb_build_object('pics_bg', p->>'pics_bg');
  end if;
  if p->>'kids_style' in ('outline', 'paper', 'crayon') then
    v := v || jsonb_build_object('kids_style', p->>'kids_style');
  end if;
  update public.profiles set settings = coalesce(settings, '{}'::jsonb) || v where id = v_uid;
  return public.get_me();
end $$;

-- ---------------------------------------------------------------- детский режим: ПИН-код
create table if not exists public.kids_pin (
  user_id      uuid primary key references public.profiles(id) on delete cascade,
  salt         text not null,
  hash         text not null,
  fails        int not null default 0,
  locked_until timestamptz,
  reset_hash   text,
  reset_until  timestamptz,
  updated_at   timestamptz not null default now()
);
alter table public.kids_pin enable row level security;   -- политик нет: только через функции

create or replace function public.kids_hash(p_salt text, p_pin text)
returns text language sql immutable set search_path = '' as $$
  select encode(sha256(convert_to(p_salt || ':' || p_pin, 'UTF8')), 'hex')
$$;

-- включить детский режим и задать ПИН
create or replace function public.kids_enable(p_pin text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_salt text := md5(random()::text || clock_timestamp()::text);
begin
  if v_uid is null then return jsonb_build_object('error', 'not_authenticated'); end if;
  if coalesce(p_pin, '') !~ '^[0-9]{4}$' then return jsonb_build_object('error', 'bad_pin'); end if;
  insert into public.kids_pin (user_id, salt, hash) values (v_uid, v_salt, public.kids_hash(v_salt, p_pin))
  on conflict (user_id) do update set salt = excluded.salt, hash = excluded.hash, fails = 0, locked_until = null,
                                      reset_hash = null, reset_until = null, updated_at = now();
  update public.profiles set settings = coalesce(settings, '{}'::jsonb) || '{"kids": true}'::jsonb where id = v_uid;
  return jsonb_build_object('ok', true, 'me', public.get_me());
end $$;

-- проверить ПИН (для настроек и выключения); 5 ошибок — пауза 10 минут
create or replace function public.kids_check(p_pin text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  r public.kids_pin;
begin
  if v_uid is null then return jsonb_build_object('error', 'not_authenticated'); end if;
  select * into r from public.kids_pin where user_id = v_uid for update;
  if not found then return jsonb_build_object('ok', true, 'no_pin', true); end if;
  if r.locked_until is not null and r.locked_until > now() then
    return jsonb_build_object('ok', false, 'locked', true, 'wait', ceil(extract(epoch from r.locked_until - now()) / 60));
  end if;
  if r.hash = public.kids_hash(r.salt, coalesce(p_pin, '')) then
    update public.kids_pin set fails = 0, locked_until = null where user_id = v_uid;
    return jsonb_build_object('ok', true);
  end if;
  update public.kids_pin
     set fails = r.fails + 1,
         locked_until = case when r.fails + 1 >= 5 then now() + interval '10 minutes' else null end
   where user_id = v_uid;
  return jsonb_build_object('ok', false, 'left', greatest(0, 4 - r.fails), 'locked', r.fails + 1 >= 5);
end $$;

-- выключить детский режим (с ПИН-кодом)
create or replace function public.kids_disable(p_pin text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v jsonb;
begin
  if v_uid is null then return jsonb_build_object('error', 'not_authenticated'); end if;
  v := public.kids_check(p_pin);
  if not (v->>'ok')::boolean then return v; end if;
  update public.profiles set settings = coalesce(settings, '{}'::jsonb) || '{"kids": false}'::jsonb where id = v_uid;
  delete from public.kids_pin where user_id = v_uid;
  return jsonb_build_object('ok', true, 'me', public.get_me());
end $$;

-- «Забыли код?»: код сброса для бота (вызывает только бот — service_role); возвращает код и Telegram ID
create or replace function public.kids_reset_code(p_user uuid)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
  v_code text := lpad((floor(random() * 1000000))::int::text, 6, '0');
  v_tg bigint;
  r public.kids_pin;
begin
  select tg_id into v_tg from public.profiles where id = p_user;
  select * into r from public.kids_pin where user_id = p_user;
  if v_tg is null or not found then return jsonb_build_object('error', 'no_pin'); end if;
  if r.reset_until is not null and r.reset_until > now() + interval '14 minutes' then
    return jsonb_build_object('error', 'too_often');      -- не чаще раза в минуту
  end if;
  update public.kids_pin set reset_hash = public.kids_hash(salt, 'reset:' || v_code), reset_until = now() + interval '15 minutes'
   where user_id = p_user;
  return jsonb_build_object('ok', true, 'code', v_code, 'tg_id', v_tg);
end $$;

-- новый ПИН по коду из бота
create or replace function public.kids_reset(p_code text, p_pin text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  r public.kids_pin;
  v_salt text := md5(random()::text || clock_timestamp()::text);
begin
  if v_uid is null then return jsonb_build_object('error', 'not_authenticated'); end if;
  if coalesce(p_pin, '') !~ '^[0-9]{4}$' then return jsonb_build_object('error', 'bad_pin'); end if;
  select * into r from public.kids_pin where user_id = v_uid for update;
  if not found or r.reset_hash is null or r.reset_until < now() then return jsonb_build_object('error', 'no_code'); end if;
  if r.locked_until is not null and r.locked_until > now() then return jsonb_build_object('error', 'locked'); end if;
  if r.reset_hash <> public.kids_hash(r.salt, 'reset:' || coalesce(p_code, '')) then
    update public.kids_pin set fails = r.fails + 1,
           locked_until = case when r.fails + 1 >= 5 then now() + interval '10 minutes' else null end where user_id = v_uid;
    return jsonb_build_object('error', 'bad_code');
  end if;
  update public.kids_pin set salt = v_salt, hash = public.kids_hash(v_salt, p_pin), fails = 0, locked_until = null,
         reset_hash = null, reset_until = null, updated_at = now() where user_id = v_uid;
  return jsonb_build_object('ok', true);
end $$;

-- ---------------------------------------------------------------- детский режим: слова, прогресс, успехи
create table if not exists public.kids_progress (
  user_id   uuid not null references public.profiles(id) on delete cascade,
  word_id   int not null,
  box       smallint not null default 0,         -- 0…5: сколько раз подряд верно (5 — «знает»)
  seen      int not null default 0,
  correct   int not null default 0,
  last_at   timestamptz not null default now(),
  primary key (user_id, word_id)
);
create table if not exists public.kids_days (
  user_id   uuid not null references public.profiles(id) on delete cascade,
  day       date not null,
  seconds   int not null default 0,
  answers   int not null default 0,
  blocks    int not null default 0,
  primary key (user_id, day)
);
alter table public.kids_progress enable row level security;
alter table public.kids_days enable row level security;

-- слова этого языка по русским значениям (первое значение до запятой), с прогрессом ребёнка
create or replace function public.kids_words(p_keys text[])
returns jsonb language sql stable security definer set search_path = '' as $$
  with k as (select distinct lower(btrim(x)) as key from unnest(coalesce(p_keys, '{}'::text[])) x where btrim(x) <> ''),
  w as (
    select distinct on (k.key) k.key, w.id, w.uz, w.ru, w.audio_ok
      from k join public.words w
        on lower(btrim(split_part(w.ru, ',', 1))) = k.key
     where w.is_active and w.canonical_id is null
     order by k.key, w.cefr, w.id)
  select coalesce(jsonb_agg(jsonb_build_object('k', w.key, 'i', w.id, 'u', w.uz, 'r', w.ru, 'a', w.audio_ok,
                                               'b', coalesce(p.box, 0), 's', coalesce(p.seen, 0))), '[]'::jsonb)
    from w left join public.kids_progress p on p.word_id = w.id and p.user_id = auth.uid()
$$;

-- ответ в детском задании
create or replace function public.kids_answer(p_word int, p_ok boolean, p_seconds int default 0, p_block_done boolean default false)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_box smallint;
  v_day date;
begin
  if v_uid is null then return jsonb_build_object('error', 'not_authenticated'); end if;
  perform public.rate_hit('kids', 600);
  if not exists (select 1 from public.words where id = p_word) then return jsonb_build_object('error', 'no_word'); end if;
  v_day := public.user_today(v_uid);
  insert into public.kids_progress as kp (user_id, word_id, box, seen, correct)
  values (v_uid, p_word, case when p_ok then 1 else 0 end, 1, case when p_ok then 1 else 0 end)
  on conflict (user_id, word_id) do update
     set box = case when p_ok then least(5, kp.box + 1) else greatest(0, kp.box - 1) end,
         seen = kp.seen + 1, correct = kp.correct + case when p_ok then 1 else 0 end, last_at = now()
  returning box into v_box;
  insert into public.kids_days as d (user_id, day, seconds, answers, blocks)
  values (v_uid, v_day, least(600, greatest(0, coalesce(p_seconds, 0))), 1, case when p_block_done then 1 else 0 end)
  on conflict (user_id, day) do update
     set seconds = d.seconds + least(600, greatest(0, coalesce(p_seconds, 0))), answers = d.answers + 1,
         blocks = d.blocks + case when p_block_done then 1 else 0 end;
  return jsonb_build_object('ok', true, 'box', v_box);
end $$;

-- «Успехи»: всего слов, знает (box ≥ 3), дней, минут, блоков (= наклеек), минуты за последние 7 дней
create or replace function public.kids_stats()
returns jsonb language sql stable security definer set search_path = '' as $$
  with me as (select auth.uid() as uid, public.user_today(auth.uid()) as today)
  select jsonb_build_object(
    'words', (select count(*) from public.kids_progress p, me where p.user_id = me.uid),
    'known', (select count(*) from public.kids_progress p, me where p.user_id = me.uid and p.box >= 3),
    'days', (select count(*) from public.kids_days d, me where d.user_id = me.uid),
    'minutes', (select coalesce(sum(seconds), 0) / 60 from public.kids_days d, me where d.user_id = me.uid),
    'blocks', (select coalesce(sum(blocks), 0) from public.kids_days d, me where d.user_id = me.uid),
    'streak', (select case when exists (select 1 from public.kids_days d where d.user_id = me.uid and d.day = me.today)
                           then (select min(g) from generate_series(0, 400) g
                                  where not exists (select 1 from public.kids_days d where d.user_id = me.uid and d.day = me.today - g))
                           else (select min(g) from generate_series(1, 400) g
                                  where not exists (select 1 from public.kids_days d where d.user_id = me.uid and d.day = me.today - g)) - 1 end),
    'week', (select jsonb_agg(jsonb_build_object('d', me.today - g, 'm', coalesce((select d.seconds from public.kids_days d
                                where d.user_id = me.uid and d.day = me.today - g), 0) / 60) order by g desc)
               from generate_series(0, 6) g, me),
    'recent', (select coalesce(jsonb_agg(jsonb_build_object('i', w.id, 'u', w.uz, 'r', w.ru, 'b', p.box) order by p.last_at desc), '[]'::jsonb)
                 from (select * from public.kids_progress p, me where p.user_id = me.uid order by p.last_at desc limit 30) p
                 join public.words w on w.id = p.word_id))
  from me
$$;

-- ---------------------------------------------------------------- права
revoke execute on function public.set_look(jsonb) from public, anon;
revoke execute on function public.kids_enable(text) from public, anon;
revoke execute on function public.kids_check(text) from public, anon;
revoke execute on function public.kids_disable(text) from public, anon;
revoke execute on function public.kids_reset_code(uuid) from public, anon, authenticated;
revoke execute on function public.kids_reset(text, text) from public, anon;
revoke execute on function public.kids_words(text[]) from public, anon;
revoke execute on function public.kids_answer(int, boolean, int, boolean) from public, anon;
revoke execute on function public.kids_stats() from public, anon;
grant execute on function public.set_look(jsonb) to authenticated;
grant execute on function public.kids_enable(text) to authenticated;
grant execute on function public.kids_check(text) to authenticated;
grant execute on function public.kids_disable(text) to authenticated;
grant execute on function public.kids_reset(text, text) to authenticated;
grant execute on function public.kids_words(text[]) to authenticated;
grant execute on function public.kids_answer(int, boolean, int, boolean) to authenticated;
grant execute on function public.kids_stats() to authenticated;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    execute 'grant execute on function public.kids_reset_code(uuid) to service_role';
  end if;
end $$;

