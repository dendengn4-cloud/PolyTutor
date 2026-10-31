-- Режимы внимания для людей с СДВГ (Настройки → «Режим внимания»):
--   off   — обычный;
--   focus — «Фокусировка»: занятие блоками по 5 слов, мгновенный отклик (звук, вибрация), задания разных типов подряд,
--           таймер по желанию, мягкая серия дней, темы — сначала выжимка;
--   max   — «Максимальная фокусировка»: всё из focus + спокойная тема с цветами по смыслу, без украшений и всплывающих окон.
-- Настройки лежат в profiles.settings: focus, focus_sound, focus_timer. Сохраняются отдельной функцией
-- (update_settings в цепочках языков принимает только свои ключи).

create or replace function public.set_focus(p_mode text default null, p_sound boolean default null, p_timer boolean default null)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_patch jsonb := '{}'::jsonb;
begin
  if v_uid is null then return jsonb_build_object('error', 'not_authenticated'); end if;
  if p_mode is not null then
    if p_mode not in ('off', 'focus', 'max') then return jsonb_build_object('error', 'bad_mode'); end if;
    v_patch := v_patch || jsonb_build_object('focus', p_mode);
  end if;
  if p_sound is not null then v_patch := v_patch || jsonb_build_object('focus_sound', p_sound); end if;
  if p_timer is not null then v_patch := v_patch || jsonb_build_object('focus_timer', p_timer); end if;
  update public.profiles set settings = coalesce(settings, '{}'::jsonb) || v_patch where id = v_uid;
  return jsonb_build_object('ok', true, 'settings', (select settings from public.profiles where id = v_uid));
end $$;
revoke execute on function public.set_focus(text, boolean, boolean) from public, anon;
grant execute on function public.set_focus(text, boolean, boolean) to authenticated;

-- Мягкая серия: дни с занятиями подряд, где один пропущенный день серию не обрывает (обрывают два подряд).
-- Сегодняшний день ещё не закончен: если сегодня занятий нет, счёт идёт со вчера.
create or replace function public.soft_streak()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_today date;
  v_day date;
  v_gap int := 0;
  v_n int := 0;
  v_active boolean;
begin
  if v_uid is null then return jsonb_build_object('error', 'not_authenticated'); end if;
  v_today := public.user_today(v_uid);
  v_day := v_today;
  for i in 0..730 loop
    v_active := exists (select 1 from public.daily_stats where user_id = v_uid and day = v_day and (correct + wrong) > 0);
    if v_active then
      v_n := v_n + 1;
      v_gap := 0;
    elsif v_day <> v_today then
      v_gap := v_gap + 1;
      exit when v_gap >= 2;
    end if;
    v_day := v_day - 1;
  end loop;
  return jsonb_build_object('streak', v_n,
    'today', exists (select 1 from public.daily_stats where user_id = v_uid and day = v_today and (correct + wrong) > 0));
end $$;
revoke execute on function public.soft_streak() from public, anon;
grant execute on function public.soft_streak() to authenticated;
