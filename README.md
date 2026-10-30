# Polytutor — самоучители языков в одном Telegram-приложении

Одно приложение и один бот, внутри — выбор изучаемого языка. Каждый язык — полноценный курс:
словарь с примерами и озвучкой, обучение и повторение, грамматика с тестами, спряжение и склонение, игры,
история и культура, подписки, админка, напоминания.

Основа — Armenian Tutor и Uzbek Tutor. Исходные приложения не меняются: материалы, база и правила языка скопированы.
Шведский курс собран заново: словарь 4 145 понятий (те же ID, что у армянского), 33 темы грамматики, 22 — истории,
20 — обществознания, 20 — культуры, 694 вопроса тестов, 30 диалогов, 169 единиц разговорной речи.

| Код | Язык | Откуда | Аудио |
|---|---|---|---|
| `hy` | Армянский | Armenian Tutor (этап 1) | копия `newgden-ai/Armenian-audio` + Озвучка (t5) |
| `uz` | Узбекский | Uzbek Tutor (этап 2) | копия `deniszhovt96-gif/uzbek-audio` + Озвучка (gtts) |
| `sv` | Шведский | новый курс (этап 3), основа базы — армянская цепочка | Озвучка (edge — бесплатно, без регистрации) |

Список языков — `langs.json`. `enabled: false` — язык не собирается и не показывается.

## Как устроено

| Где | Что |
|---|---|
| `langs.json` | языки: код, флаг, названия, основа базы (`base`), часовой пояс, сервис озвучки |
| `data/<код>/` | материалы языка: `source/vocabulary.xlsx`, курсы, тесты (`quiz/`), правки, `audio_voiced.txt` (озвучено), `audio_present.txt` (есть в репозитории аудио) |
| `app/src/` | общее приложение (экраны, обучение, оплата, админка) |
| `app/src/langs/<код>/` | то, что зависит от языка: формы слов, экраны спряжения и склонения, клавиатура, транскрипция, нормализация ответов, таблицы «Как образуется»; `script.js` — буквы, плитки, алфавит, типичные ошибки; `art.js` — рисунки (города пути); `i18n-lang.js` — тексты интерфейса, зависящие от языка |
| `app/root/index.html` | стартовая страница: открывает последний язык или показывает выбор |
| `supabase/` | база: у каждого языка свой раздел (schema) с кодом языка — см. `supabase/README.md` |
| `supabase/functions/` | вход через Telegram и бот — общие для всех языков |
| `scripts/langs/<код>/` | сборка словаря и курсов, загрузка словаря, озвучка — свои у каждого языка |
| `scripts/` | общее: миграции (`migrate.py`), перенос SQL в раздел языка (`sqlrender.py`), список языков, подготовка сборки |

Сайт после сборки: `https://<логин>.github.io/<репозиторий>/` — стартовая страница, `…/hy/` — армянский, `…/uz/` — узбекский, `…/sv/` — шведский.
Аудио — свой репозиторий на каждый язык: `<логин>/PolyTutor-AUDIO-hy` →
`https://<логин>.github.io/PolyTutor-AUDIO-hy/audio/word_1.mp3` (лимит GitHub Pages — 1 ГБ на сайт, язык занимает ~170 МБ).

Ученик один во всех языках (одна учётная запись), но профиль, прогресс и подписка у каждого языка свои.

## Разовая настройка

Понадобятся: аккаунт GitHub, проект Supabase, бот в @BotFather.

### 1. GitHub: репозитории

1. Репозиторий приложения (публичный), например `polytutor`: загрузить все файлы этого архива (Add file → Upload files).
2. Репозиторий аудио армянского языка (публичный) **`PolyTutor-AUDIO-hy`**: создать с README, затем загрузить файл
   `docs/audio-repo/pages.yml` в папку `.github/workflows/` (Add file → Create new file → имя `.github/workflows/pages.yml`, вставить текст).
3. В обоих репозиториях: Settings → Pages → Build and deployment → Source: **GitHub Actions**.
4. Токен для записи аудио: аватар → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** →
   Generate new token: Repository access → Only select repositories → `PolyTutor-AUDIO-hy` (позже — и аудио других языков);
   Permissions → Repository permissions → **Contents: Read and write**. Скопировать токен.

### 2. Supabase

1. Создать проект (регион — ближайший, например Frankfurt). Записать пароль базы.
2. Project Settings → General → **Project ID** (это `SUPABASE_PROJECT_REF`).
3. Кнопка **Connect** вверху → Session pooler → хост вида `aws-0-eu-central-1.pooler.supabase.com` (это `SUPABASE_DB_HOST`).
4. Project Settings → API Keys → **Publishable key** (`sb_publishable_…`).

### 3. GitHub: Settings → Secrets and variables → Actions (в репозитории приложения)

Вкладка **Secrets**:

| Имя | Значение |
|---|---|
| `SUPABASE_DB_PASSWORD` | пароль базы Supabase |
| `AUDIO_REPO_TOKEN` | токен из шага 1.4 |

Вкладка **Variables**:

| Имя | Значение |
|---|---|
| `SUPABASE_PROJECT_REF` | Project ID |
| `SUPABASE_DB_HOST` | хост Session pooler |
| `SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_…` |
| `BOT_USERNAME` | имя бота без @ |
| `AUDIO_REPO` | `<логин>/PolyTutor-AUDIO-{lang}` — ровно так, с `{lang}` |
| `AUDIO_BASE` | `https://<логин>.github.io/PolyTutor-AUDIO-{lang}/audio/` — тоже с `{lang}` |

### 4. Первый запуск (Actions → нужный workflow → Run workflow, по очереди, каждый до зелёной галочки)

1. **Deploy Supabase** — создаёт раздел `hy` с таблицами и функциями.
2. В Supabase: Project Settings → **Data API** (в старом меню — **API**) → поле **Exposed schemas** → добавить **`hy`** и **`uz`** → Save.
   (Без этого приложение и бот не видят раздел языка.)
   Deploy Supabase сам записывает этот список и в базу (роль `authenticator`, настройка `pgrst.db_schemas`):
   запись в базе главнее поля в панели. Если в журнале Deploy Supabase есть «ВНИМАНИЕ: не удалось записать список
   разделов» — выполните показанную там команду в SQL Editor.
3. **Import Vocabulary** — словарь.
4. **Import Courses** — курсы и тесты.
5. **Копирование аудио** — язык `hy`, источник `newgden-ai/Armenian-audio`: готовая армянская озвучка
   копируется в `PolyTutor-AUDIO-hy` (около 17 000 файлов, 5–10 минут), затем сам запускается Import Vocabulary.
   Для узбекского — то же с языком `uz`, источником `deniszhovt96-gif/uzbek-audio` и репозиторием `PolyTutor-AUDIO-uz`.
6. **Deploy App** — приложение.

### 5. Вход через Telegram и бот

Функции создаются в панели Supabase: Edge Functions → Deploy a new function → Via Editor, имена
`auth-telegram` и `telegram-bot` (код — `supabase/functions/<имя>/index.ts`), в настройках функции **Verify JWT = выкл**.

Секреты функций (Edge Functions → Secrets):

| Имя | Значение |
|---|---|
| `TELEGRAM_BOT_TOKEN` | токен бота от @BotFather |
| `TELEGRAM_WEBHOOK_SECRET` | любая строка из латинских букв и цифр |
| `APP_URL` | `https://<логин>.github.io/<репозиторий>/` (со слешем в конце) |

Webhook бота — открыть в браузере:
`https://api.telegram.org/bot<ТОКЕН>/setWebhook?url=https://<SUPABASE_PROJECT_REF>.supabase.co/functions/v1/telegram-bot&secret_token=<СЕКРЕТ>`

В @BotFather: /mybots → бот → Bot Settings → Menu Button → адрес `APP_URL`; /setdescription — описание.

Администратор — Telegram ID `182665947` (записан в таблицу `admins` каждого языка при создании базы).
Команды администратора в боте: язык курса — первым словом, например `/grant hy 123456789 basic 1`.

## Новый язык

1. `langs.json` — запись языка; `data/<код>/` — материалы; `app/src/langs/<код>/` — модули языка (те же файлы, что у
   `hy` и `uz`); `scripts/langs/<код>/` — сборка и озвучка; `supabase/base/…` или `supabase/lang/<код>/` — база.
2. Deploy Supabase → в Supabase добавить `<код>` в Exposed schemas → Import Vocabulary → Import Courses.
3. Репозиторий `PolyTutor-AUDIO-<код>` (как для `hy`), добавить его в токен; Озвучка (язык `<код>`); Deploy App.
4. Бот: название языка — в `COURSE` в `supabase/functions/telegram-bot/index.ts`.

## Проверка на своём компьютере

`supabase/local-tests/` — проверки базы на чистом Postgres (`local_stubs.sql`, затем миграции и данные);
SQL переносится в раздел языка: `python3 scripts/sqlrender.py hy < файл.sql`.

История армянской версии по шагам — `docs/history-armenian.md`.

## Шведский язык: подключение (один раз)

1. Загрузить в репозиторий приложения файлы из архива (с заменой). `langs.json` уже содержит `sv`.
   После загрузки сами запустятся **Deploy Supabase** (создаёт раздел `sv` и сам записывает список разделов Data API:
   `public, graphql_public, hy, uz, sv`), **Import Vocabulary**, **Import Courses**, **Deploy App**.
   Если они не запустились — Actions → нужный workflow → Run workflow, по очереди, каждый до зелёной галочки.
2. В журнале Deploy Supabase должна быть строка «Разделы Data API: public, graphql_public, hy, uz, sv». Если вместо неё
   «ВНИМАНИЕ: не удалось записать список разделов» — выполнить показанную там команду в SQL Editor.
3. Аудио: создать публичный репозиторий **`PolyTutor-AUDIO-sv`** (как для `hy`: README, `.github/workflows/pages.yml`,
   Settings → Pages → Source: GitHub Actions), добавить его в токен `AUDIO_REPO_TOKEN`.
   Затем Actions → **Озвучка** → язык `sv`, сервис `edge`, лимит `3000` → Run workflow. Повторять, пока в журнале не будет
   «Осталось: 0» (словарь и примеры — около 17 000 файлов, 6 запусков). Каждый запуск сам обновляет словарь.
4. Edge Functions → **telegram-bot** → Code → заменить текст файлом `supabase/functions/telegram-bot/index.ts` → Deploy
   (бот пишет по-шведски тем, у кого интерфейс на шведском, и знает название курса).
5. Тесты по темам загружаются черновиками: приложение → Настройки → Администратор → «Проверка вопросов» → одобрить.

