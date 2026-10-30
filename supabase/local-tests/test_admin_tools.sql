-- Проверка common/20261031090000_admin_tools.sql (любой язык; запуск после test_<язык>.sql, рендер sqlrender.py <код>)
reset role;
insert into public.profiles (id, tg_id, first_name, ui_lang) values
  ('a1a1a1a1-0000-0000-0000-0000000000a1', 990101, 'Admin', 'ru'),
  ('a1a1a1a1-0000-0000-0000-0000000000a2', 990102, 'User', 'ru')
on conflict (id) do nothing;
insert into public.admins (tg_id) values (990101) on conflict do nothing;
update public.unit_tasks set status = 'draft' where kind = 'choice' and id in (select id from public.unit_tasks where kind = 'choice' order by id limit 5);
select set_config('t.drafts', (select count(*) from public.unit_tasks where kind = 'choice' and status = 'draft')::text, false);

-- обычный пользователь: функции администратора запрещены, сообщений нет
set role authenticated;
set request.jwt.claim.sub = 'a1a1a1a1-0000-0000-0000-0000000000a2';
do $$ begin
  if public.admin_approve_all_questions()->>'error' <> 'forbidden' then raise exception 'FAIL: одобрение доступно не администратору'; end if;
  if public.admin_announcements()->>'error' <> 'forbidden' then raise exception 'FAIL: список сообщений доступен не администратору'; end if;
  if public.get_announcement() is not null then raise exception 'FAIL: сообщение до создания'; end if;
  begin
    perform count(*) from public.announcements;
    raise exception 'FAIL: таблица сообщений читается напрямую';
  exception when insufficient_privilege then null;
  end;
end $$;

-- администратор: «одобрить все»
set request.jwt.claim.sub = 'a1a1a1a1-0000-0000-0000-0000000000a1';
do $$ declare r jsonb; begin
  r := public.admin_approve_all_questions();
  if (r->>'updated')::int <> current_setting('t.drafts')::int then raise exception 'FAIL: одобрено % из %', r, current_setting('t.drafts'); end if;
  if (public.admin_review_summary()->>'draft')::int <> 0 then raise exception 'FAIL: остались черновики'; end if;
  raise notice 'ok: одобрить все (%)', r->>'updated';
end $$;

-- сообщение создаёт функция бота (service_role) — здесь вставка от владельца
reset role;
insert into public.announcements (body, scope, created_by) values ('Первое', 'lang', 990101), ('Второе', 'all', 990101);
do $$ begin
  begin insert into public.announcements (body) values ('   '); raise exception 'FAIL: пустой текст принят';
  exception when check_violation then null; end;
end $$;

set role authenticated;
set request.jwt.claim.sub = 'a1a1a1a1-0000-0000-0000-0000000000a2';
do $$ declare a jsonb; begin
  a := public.get_announcement();
  if a->>'body' <> 'Второе' then raise exception 'FAIL: показывается не последнее: %', a; end if;
  perform public.mark_announcement_seen((a->>'id')::bigint);
  if public.get_announcement() is not null then raise exception 'FAIL: закрытое сообщение показывается снова'; end if;
  perform public.mark_announcement_seen(1);   -- меньший id не откатывает отметку
  if public.get_announcement() is not null then raise exception 'FAIL: отметка откатилась'; end if;
end $$;

set request.jwt.claim.sub = 'a1a1a1a1-0000-0000-0000-0000000000a1';
do $$ declare l jsonb; v_id bigint; begin
  l := public.admin_announcements();
  if jsonb_array_length(l->'items') <> 2 or (l->'items'->0->>'seen')::int < 1 then raise exception 'FAIL: список: %', l; end if;
  v_id := (l->'items'->0->>'id')::bigint;
  perform public.admin_set_announcement(v_id, false);
  -- администратор ещё не закрывал сообщений: после скрытия «Второго» видит «Первое»
  if public.get_announcement()->>'body' <> 'Первое' then raise exception 'FAIL: скрытие не сработало: %', public.get_announcement(); end if;
  perform public.admin_set_announcement(v_id, true);
  if public.get_announcement()->>'body' <> 'Второе' then raise exception 'FAIL: показ снова не сработал'; end if;
  raise notice 'ok: сообщения пользователям';
end $$;
reset role;
select 'admin tools checks passed';
