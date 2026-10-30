-- Шведская версия (основа — армянская цепочка миграций): то, чего нет в узбекской схеме.
-- Остальные языковые отличия внесены прямо в копии миграций (key_uz, ui_lang 'sv', часовой пояс Стокгольма,
-- шведские буквы в регулярных выражениях, sv_lat, еженедельное сообщение) — их видно сравнением с base/armenian.

-- ---------------------------------------------------------------- транскрипция слова
-- Для шведского транскрипция в приложении не показывается; колонки оставлены, чтобы схема была одинаковой.
alter table public.words add column if not exists tr_lat text;
alter table public.words add column if not exists tr_cyr text;

-- ---------------------------------------------------------------- цены в кронах
-- Колонка price_uzs оставлена с узбекским именем (схема общая) и хранит цену в местной валюте — шведских кронах (kr).
-- ПРЕДЛОЖЕНИЕ (меняется в Table Editor → plans): звёзды и доллары как в других версиях,
-- кроны ≈ доллары × 10,5 с округлением до …9 kr. Групповая подписка на 3 человек — ×3 и −15%, округление до 10 kr.
update public.plans p set price_uzs = v.sek
from (values
  ('basic', 1,   89), ('basic', 3,  239), ('basic', 6,  449), ('basic', 12,  849),
  ('advanced', 1, 179), ('advanced', 3, 479), ('advanced', 6, 899), ('advanced', 12, 1699)
) as v(tier, months, sek)
where p.tier = v.tier and p.months = v.months and p.seats = 1;

update public.plans g set price_uzs = (round(p.price_uzs * 3 * 0.85 / 10.0) * 10)::int
  from public.plans p
 where g.seats = 3 and p.seats = 1 and p.tier = g.tier and p.months = g.months;

-- ---------------------------------------------------------------- изучаемый язык
-- Спряжение, склонение и «Как образуется» построены на узбекской и армянской грамматике; в шведской версии они
-- скрыты в приложении (app/src/langs/sv/features.js). Диалоги и разговорная речь — шведские.
insert into public.app_config (key, value, note) values
  ('target_language', '"sv"', 'Изучаемый язык этой копии приложения (sv — шведский)')
on conflict (key) do nothing;
