-- =============================================================================
-- Шаг 23: «Другие языки» в настройках — список ботов-самоучителей других языков.
-- Список хранится в app_config.other_languages (меняется без обновления приложения), например:
--   update public.app_config set value = '[{"bot":"armenian_tutor_bot","flag":"🇦🇲","name_ru":"Армянский язык",
--     "name_uz":"Arman tili","name_en":"Armenian"}]' where key = 'other_languages';
-- Пустой список — кнопка в настройках не показывается.
-- =============================================================================
insert into public.app_config (key, value, note) values
  ('other_languages', '[]', 'боты других языков для кнопки «Другие языки»: [{bot, flag, name_ru, name_uz, name_en}]')
on conflict (key) do nothing;

create or replace function public.get_app_info()
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'community_url', nullif((select value #>> '{}' from public.app_config where key = 'community_url'), ''),
    'other_languages', coalesce((
      select jsonb_agg(jsonb_build_object('bot', x->>'bot', 'flag', x->>'flag',
                                          'name_ru', x->>'name_ru', 'name_uz', x->>'name_uz', 'name_en', x->>'name_en'))
        from jsonb_array_elements(case when jsonb_typeof(c.value) = 'array' then c.value else '[]' end) x
       where coalesce(x->>'bot', '') ~ '^[A-Za-z0-9_]{5,32}$'), '[]'::jsonb))
  from (select (select value from public.app_config where key = 'other_languages') as value) c
$$;
revoke execute on function public.get_app_info() from public;
grant execute on function public.get_app_info() to anon, authenticated, service_role;
