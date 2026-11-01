-- Корейская версия (основа — турецкая цепочка миграций): то, чего нет в узбекской схеме.
-- Остальные языковые отличия внесены прямо в копии миграций (key_uz — только хангыль без пробелов, ui_lang 'ko',
-- часовой пояс Сеула, хангыль в регулярных выражениях, ko_word_lat, еженедельное сообщение по-корейски) — их видно
-- сравнением с base/turkish. Формы корейских слов — отдельная миграция (позже).

-- ---------------------------------------------------------------- транскрипция слова
-- Транскрипция показывается в приложении (кириллица по Концевичу / латиница Revised Romanization) и считается
-- в самом приложении (app/src/langs/ko/translit.js); колонки оставлены, чтобы схема была одинаковой.
alter table public.words add column if not exists tr_lat text;
alter table public.words add column if not exists tr_cyr text;

-- ---------------------------------------------------------------- цены в вонах
-- Колонка price_uzs оставлена с узбекским именем (схема общая) и хранит цену в местной валюте — корейских вонах (₩).
-- ПРЕДЛОЖЕНИЕ (меняется в Table Editor → plans): звёзды и доллары как в других версиях,
-- воны ≈ доллары × 1325 (курс на конец октября 2026) с округлением до 100 ₩. Групповая подписка на 3 человек — ×3 и −15%.
update public.plans p set price_uzs = v.krw
from (values
  ('basic', 1, 11100), ('basic', 3, 30300), ('basic', 6, 56900), ('basic', 12, 107200),
  ('advanced', 1, 22600), ('advanced', 3, 60900), ('advanced', 6, 113800), ('advanced', 12, 214700)
) as v(tier, months, krw)
where p.tier = v.tier and p.months = v.months and p.seats = 1;

update public.plans g set price_uzs = (round(p.price_uzs * 3 * 0.85 / 100.0) * 100)::int
  from public.plans p
 where g.seats = 3 and p.seats = 1 and p.tier = g.tier and p.months = g.months;

-- ---------------------------------------------------------------- изучаемый язык
insert into public.app_config (key, value, note) values
  ('target_language', '"ko"', 'Изучаемый язык этой копии приложения (ko — корейский)')
on conflict (key) do nothing;
