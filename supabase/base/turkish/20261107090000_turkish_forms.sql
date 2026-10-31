-- Турецкие формы слов (words.morph: {"v": …} у глаголов, {"n": …} у существительных — scripts/langs/tr/tr_forms.py):
-- списки «Формы глагола» / «Формы существительного» и потолки уровней упражнений по темам турецкой грамматики.

-- Потолок уровня: глагол — темы 3 (-Iyor), 5 (-DI), 6 (-mIş), 7 (будущее), 8 (отрицание), 16 (широкое время),
-- 17 (повелительное), 18 (возможность), 20 (долженствование), 21 (условное); существительное — 9 (падежи),
-- 10 (принадлежность), 11 (множественное число).
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
    'conj_cap', (select case when count(*) = 10 then 15 else greatest(1, floor(15.0 * count(*) / 10))::int end
                   from passed where source_no in (3, 5, 6, 7, 8, 16, 17, 18, 20, 21)),
    'decl_cap', (select case when count(*) = 3 then 15 else greatest(1, floor(15.0 * count(*) / 3))::int end
                   from passed where source_no in (9, 10, 11)))
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

