-- Пробный экзамен KIIP (раздел «Корея для иностранцев»): 40 случайных опубликованных вопросов курса civics —
-- та же функция, что у шведского пробного экзамена на гражданство (app/src/screens/exam.js).

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
