-- Шведские формы слов (words.morph: {"v": …} у глаголов, {"n": …} у существительных — scripts/langs/sv/sv_forms.py):
-- списки «Формы глагола» / «Формы существительного» и потолки уровней упражнений по темам шведской грамматики.

-- Потолок уровня: глагол — темы 15 (инфинитив и презенс), 16 (претерит), 17 (супин и перфект), 18 (будущее),
-- 19 (повелительное); существительное — 3 (en/ett), 4 (опр. форма), 5 (мн. число), 6 (опр. мн.).
create or replace function public.morph_state(p_user uuid)
returns jsonb language sql stable security definer set search_path = '' as $$
  with lvl as (
    select max(cefr) as cefr from public.level_test_attempts where user_id = p_user and passed),
  passed as (
    select u.source_no from public.course_units u
     where u.course_id = 'grammar'
       and (exists (select 1 from public.course_progress cp
                     where cp.user_id = p_user and cp.unit_id = u.id and (cp.read_at is not null or cp.status = 'tested'))
            or u.cefr <= (select cefr from lvl)
            or coalesce((select p.alpha from public.profiles p where p.id = p_user), false)))
  select jsonb_build_object(
    'grammar', coalesce((select jsonb_agg(source_no order by source_no) from passed), '[]'::jsonb),
    'by_test', (select cefr from lvl),
    'alpha', coalesce((select p.alpha from public.profiles p where p.id = p_user), false),
    'conj_cap', (select case when count(*) = 5 then 15 else greatest(1, floor(15.0 * count(*) / 5))::int end
                   from passed where source_no in (15, 16, 17, 18, 19)),
    'decl_cap', (select case when count(*) = 4 then 15 else greatest(1, floor(15.0 * count(*) / 4))::int end
                   from passed where source_no in (3, 4, 5, 6)))
$$;

create or replace function public.get_verbs()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_now timestamptz := public.app_now();
  v_today date;
begin
  perform public.rate_hit('verbs', public.cfg_int('rate_morph_list_per_hour', 40));
  if v_uid is null then return jsonb_build_object('error', 'not_authenticated'); end if;
  v_today := public.user_today(v_uid);
  return jsonb_build_object('state', public.morph_state(v_uid), 'verbs', (
    select coalesce(jsonb_agg(jsonb_build_object('i', w.id, 'u', w.uz, 'r', w.ru, 'e', w.en, 'c', w.cefr,
             'l', public.effective_level(wp.level, wp.level_at, v_now),
             'f', vf.level, 'fd', vf.due_on <= v_today, 't', vt.level, 'td', vt.due_on <= v_today, 'm', true)
             order by w.cefr, w.uz_key), '[]'::jsonb)
    from public.words w
    left join public.word_progress wp on wp.word_id = w.id and wp.user_id = v_uid
    left join public.verb_progress vf on vf.word_id = w.id and vf.user_id = v_uid and vf.kind = 'form'
    left join public.verb_progress vt on vt.word_id = w.id and vt.user_id = v_uid and vt.kind = 'table'
    where w.is_active and w.canonical_id is null and w.morph ? 'v'));
end $$;

create or replace function public.get_nouns()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_now timestamptz := public.app_now();
  v_today date;
begin
  perform public.rate_hit('nouns', public.cfg_int('rate_morph_list_per_hour', 40));
  if v_uid is null then return jsonb_build_object('error', 'not_authenticated'); end if;
  v_today := public.user_today(v_uid);
  return jsonb_build_object('state', public.morph_state(v_uid), 'nouns', (
    select coalesce(jsonb_agg(jsonb_build_object('i', w.id, 'u', w.uz, 'r', w.ru, 'e', w.en, 'c', w.cefr,
             'l', public.effective_level(wp.level, wp.level_at, v_now),
             'd', vd.level, 'dd', vd.due_on <= v_today)
             order by w.cefr, w.uz_key), '[]'::jsonb)
    from public.words w
    left join public.word_progress wp on wp.word_id = w.id and wp.user_id = v_uid
    left join public.verb_progress vd on vd.word_id = w.id and vd.user_id = v_uid and vd.kind = 'decl'
    where w.is_active and w.canonical_id is null and w.morph ? 'n'));
end $$;

revoke execute on function public.morph_state(uuid) from public, anon, authenticated;
revoke execute on function public.get_verbs() from public, anon;
revoke execute on function public.get_nouns() from public, anon;
grant execute on function public.get_verbs() to authenticated;
grant execute on function public.get_nouns() to authenticated;

-- ---------------------------------------------------------------- пробный экзамен на гражданство
-- 40 случайных одобренных вопросов курса обществознания (как засчитываемая часть medborgarskapsprovet),
-- варианты перемешаны, 'c' — номер верного. Тренажёр: результат не сохраняется. Доступ — как ко всем темам курса (courses.min_tier).
create or replace function public.civics_exam()
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare v_uid uuid := auth.uid(); v_out jsonb;
  v_need text := coalesce((select min_tier from public.courses where id = 'civics'), 'basic');
begin
  if v_uid is null then return jsonb_build_object('error', 'not_authenticated'); end if;
  perform public.rate_hit('civics_exam', 30);
  if public.tier_rank(public.current_tier()) < public.tier_rank(v_need) then
    return jsonb_build_object('error', 'locked_tier', 'need', v_need);
  end if;
  with q as (
    select t.id, t.prompt_ru, t.prompt_uz, t.prompt_en, t.options, t.source_quote, u.title_ru, u.title_uz, u.title_en
      from public.unit_tasks t join public.course_units u on u.id = t.unit_id
     where u.course_id = 'civics' and t.kind = 'choice' and t.status = 'approved'
     order by random() limit 40),
  s as (
    select q.*, (select array_agg(i order by random()) from generate_series(0, jsonb_array_length(q.options->'ru') - 1) i) as ord from q)
  select coalesce(jsonb_agg(jsonb_build_object(
           'id', s.id, 'p_ru', s.prompt_ru, 'p_uz', s.prompt_uz, 'p_en', s.prompt_en, 'unit', s.title_ru, 'unit_uz', s.title_uz, 'unit_en', s.title_en,
           'o_ru', (select jsonb_agg(s.options->'ru'->o order by k) from unnest(s.ord) with ordinality x(o, k)),
           'o_uz', (select jsonb_agg(s.options->'uz'->o order by k) from unnest(s.ord) with ordinality x(o, k)),
           'o_en', (select jsonb_agg(s.options->'en'->o order by k) from unnest(s.ord) with ordinality x(o, k)),
           'c', array_position(s.ord, 0) - 1, 'quote', s.source_quote)), '[]'::jsonb)
    into v_out from s;
  return jsonb_build_object('questions', v_out, 'pass', 0.7);
end $$;
revoke execute on function public.civics_exam() from public, anon;
grant execute on function public.civics_exam() to authenticated;
