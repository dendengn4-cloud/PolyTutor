-- =============================================================================
-- Шаг 24: администратор редактирует список «Другие языки» прямо в приложении
--   (Настройки → Администратор → «Другие языки»), без SQL.
-- =============================================================================

-- текущий список как есть (для редактирования)
create or replace function public.admin_other_languages()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then return jsonb_build_object('error', 'forbidden'); end if;
  return jsonb_build_object('items', coalesce((select case when jsonb_typeof(value) = 'array' then value end
                                                 from public.app_config where key = 'other_languages'), '[]'::jsonb));
end
$$;

-- сохранить список целиком: имя бота — латиница, цифры, «_», 5–32 символа; не больше 20 языков; без повторов
create or replace function public.admin_set_other_languages(p_items jsonb)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
  v_out jsonb := '[]'::jsonb;
  v_seen text[] := '{}';
  x jsonb;
  v_bot text;
begin
  if not public.is_admin() then return jsonb_build_object('error', 'forbidden'); end if;
  if jsonb_typeof(p_items) <> 'array' then return jsonb_build_object('error', 'bad_list'); end if;
  if jsonb_array_length(p_items) > 20 then return jsonb_build_object('error', 'too_many'); end if;
  for x in select * from jsonb_array_elements(p_items) loop
    v_bot := regexp_replace(coalesce(x->>'bot', ''), '^(https?://)?(t\.me/)?@?', '');
    if v_bot !~ '^[A-Za-z0-9_]{5,32}$' then
      return jsonb_build_object('error', 'bad_bot', 'bot', x->>'bot');
    end if;
    if lower(v_bot) = any (v_seen) then return jsonb_build_object('error', 'duplicate', 'bot', v_bot); end if;
    v_seen := v_seen || lower(v_bot);
    v_out := v_out || jsonb_build_array(jsonb_strip_nulls(jsonb_build_object(
      'bot', v_bot,
      'flag', nullif(left(btrim(coalesce(x->>'flag', '')), 8), ''),
      'name_ru', nullif(left(btrim(coalesce(x->>'name_ru', '')), 60), ''),
      'name_uz', nullif(left(btrim(coalesce(x->>'name_uz', '')), 60), ''),
      'name_en', nullif(left(btrim(coalesce(x->>'name_en', '')), 60), ''))));
  end loop;
  insert into public.app_config (key, value, note) values ('other_languages', v_out, 'боты других языков для кнопки «Другие языки»')
  on conflict (key) do update set value = excluded.value;
  return jsonb_build_object('ok', true, 'items', v_out);
end
$$;

revoke execute on function public.admin_other_languages() from public, anon;
revoke execute on function public.admin_set_other_languages(jsonb) from public, anon;
grant execute on function public.admin_other_languages() to authenticated, service_role;
grant execute on function public.admin_set_other_languages(jsonb) to authenticated, service_role;
