-- Администратор: коды подписки из приложения (Настройки → Администратор → «Коды подписки»).
-- Код активируется в разделе этого языка (Подписка → Код подписки), как коды из команды бота /gencode.
create or replace function public.admin_generate_codes(p_tier text, p_months int, p_count int, p_uses int default 1)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
  v_tg bigint := (select tg_id from public.profiles where id = auth.uid());
  v_codes jsonb;
begin
  if not public.is_admin() then return jsonb_build_object('error', 'forbidden'); end if;
  if p_tier not in ('basic', 'advanced') or p_months not in (1, 3, 6, 12)
     or p_count is null or p_count < 1 or p_count > 50 or coalesce(p_uses, 1) < 1 or coalesce(p_uses, 1) > 1000 then
    return jsonb_build_object('error', 'bad_args');
  end if;
  select coalesce(jsonb_agg(c), '[]'::jsonb) into v_codes
    from public.admin_create_codes(p_tier, p_months, p_count, coalesce(p_uses, 1), null,
                                   'app ' || to_char(now(), 'YYYY-MM-DD'), v_tg) c;
  return jsonb_build_object('ok', true, 'codes', v_codes, 'tier', p_tier, 'months', p_months, 'uses', coalesce(p_uses, 1));
end $$;
revoke execute on function public.admin_generate_codes(text, int, int, int) from public, anon;
grant execute on function public.admin_generate_codes(text, int, int, int) to authenticated;
