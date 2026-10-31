-- Турецкая версия (основа — шведская цепочка миграций): то, чего нет в узбекской схеме.
-- Остальные языковые отличия внесены прямо в копии миграций (key_uz, ui_lang 'tr', часовой пояс Стамбула,
-- турецкие буквы в регулярных выражениях, tr_word_lat, еженедельное сообщение) — их видно сравнением с base/swedish.
-- Шведские формы слов (base/swedish/20261103090000_swedish_forms.sql) и пробный экзамен на гражданство в турецкую
-- цепочку не входят: в Турции нет такого экзамена, формы турецких слов приложение строит само.

-- ---------------------------------------------------------------- транскрипция слова
-- Для турецкого транскрипция в приложении не показывается; колонки оставлены, чтобы схема была одинаковой.
alter table public.words add column if not exists tr_lat text;
alter table public.words add column if not exists tr_cyr text;

-- ---------------------------------------------------------------- цены в лирах
-- Колонка price_uzs оставлена с узбекским именем (схема общая) и хранит цену в местной валюте — турецких лирах (₺).
-- ПРЕДЛОЖЕНИЕ (меняется в Table Editor → plans): звёзды и доллары как в других версиях,
-- лиры ≈ доллары × 49,8 (курс на конец октября 2026) с округлением до …9 ₺. Групповая подписка на 3 человек — ×3 и −15%,
-- округление до 10 ₺.
update public.plans p set price_uzs = v.try
from (values
  ('basic', 1,  419), ('basic', 3, 1139), ('basic', 6, 2139), ('basic', 12, 4029),
  ('advanced', 1, 849), ('advanced', 3, 2289), ('advanced', 6, 4279), ('advanced', 12, 8069)
) as v(tier, months, try)
where p.tier = v.tier and p.months = v.months and p.seats = 1;

update public.plans g set price_uzs = (round(p.price_uzs * 3 * 0.85 / 10.0) * 10)::int
  from public.plans p
 where g.seats = 3 and p.seats = 1 and p.tier = g.tier and p.months = g.months;

-- ---------------------------------------------------------------- изучаемый язык
insert into public.app_config (key, value, note) values
  ('target_language', '"tr"', 'Изучаемый язык этой копии приложения (tr — турецкий)')
on conflict (key) do nothing;
