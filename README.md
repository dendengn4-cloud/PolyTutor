# Language Tutor — самоучители языков в одном Telegram-приложении

Одно приложение и один бот, внутри — выбор изучаемого языка. Каждый язык — полноценный курс:
словарь с примерами и озвучкой, обучение и повторение, грамматика с тестами, спряжение и склонение, игры,
история и культура, подписки, админка, напоминания.

Основа — армянское приложение (Armenian Tutor, которое сделано из Uzbek Tutor). Исходные приложения не меняются.

| Код | Язык | Состояние |
|---|---|---|
| `hy` | Армянский | этап 1 — перенесён целиком |

Список языков — `langs.json`. `enabled: false` — язык не собирается и не показывается.

## Как устроено

| Где | Что |
|---|---|
| `langs.json` | языки: код, флаг, названия, основа базы (`base`), часовой пояс, сервис озвучки |
| `data/<код>/` | материалы языка: `source/vocabulary.xlsx`, курсы, тесты (`quiz/`), правки, список озвученного `audio_voiced.txt` |
| `app/src/` | общее приложение (экраны, обучение, оплата, админка) |
| `app/src/langs/<код>/` | то, что зависит от языка: формы слов (`forms.js`), клавиатура, транскрипция, нормализация ответов, таблицы «Как образуется», экраны спряжения и склонения |
| `app/root/index.html` | стартовая страница: открывает последний язык или показывает выбор |
| `supabase/` | база: у каждого языка свой раздел (schema) с кодом языка — см. `supabase/README.md` |
| `supabase/functions/` | вход через Telegram и бот — общие для всех языков |
| `scripts/` | сборка словаря и курсов, миграции, озвучка |

Сайт после сборки: `https://<логин>.github.io/<репозиторий>/` — стартовая страница, `…/hy/` — армянский.
Аудио — свой репозиторий на каждый язык: `<логин>/audio-hy` → `https://<логин>.github.io/audio-hy/audio/word_1.mp3`.

Ученик один во всех языках (одна учётная запись), но профиль, прогресс и подписка у каждого языка свои.

## Разовая настройка

Понадобятся: аккаунт GitHub, проект Supabase, бот в @BotFather.

### 1. GitHub: репозитории

1. Репозиторий приложения (публичный), например `language-tutor`: загрузить все файлы этого архива (Add file → Upload files).
2. Репозиторий аудио армянского языка (публичный) **`audio-hy`**: создать с README, затем загрузить файл
   `docs/audio-repo/pages.yml` в папку `.github/workflows/` (Add file → Create new file → имя `.github/workflows/pages.yml`, вставить текст).
3. В обоих репозиториях: Settings → Pages → Build and deployment → Source: **GitHub Actions**.
4. Токен для записи аудио: аватар → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** →
   Generate new token: Repository access → Only select repositories → `audio-hy` (позже — и аудио других языков);
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
| `AUDIO_REPO` | `<логин>/audio-{lang}` — ровно так, с `{lang}` |
| `AUDIO_BASE` | `https://<логин>.github.io/audio-{lang}/audio/` — тоже с `{lang}` |

### 4. Первый запуск (Actions → нужный workflow → Run workflow, по очереди, каждый до зелёной галочки)

1. **Deploy Supabase** — создаёт раздел `hy` с таблицами и функциями.
2. В Supabase: Project Settings → **Data API** (в старом меню — **API**) → поле **Exposed schemas** → добавить **`hy`** → Save.
   (Без этого приложение и бот не видят раздел языка.)
3. **Import Vocabulary** — словарь.
4. **Import Courses** — курсы и тесты.
5. **Копирование аудио** — язык `hy`, источник `newgden-ai/Armenian-audio`: готовая армянская озвучка
   копируется в `audio-hy` (около 17 000 файлов, 5–10 минут), затем сам запускается Import Vocabulary.
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

## Новый язык (следующие этапы)

1. `langs.json` — запись языка; `data/<код>/` — материалы; `app/src/langs/<код>/` — модули языка.
2. Deploy Supabase → в Supabase добавить `<код>` в Exposed schemas → Import Vocabulary → Import Courses.
3. Репозиторий `audio-<код>` (как `audio-hy`), добавить его в токен; Озвучка (язык `<код>`); Deploy App.

## Проверка на своём компьютере

`supabase/local-tests/` — проверки базы на чистом Postgres (`local_stubs.sql`, затем миграции и данные);
SQL переносится в раздел языка: `python3 scripts/sqlrender.py hy < файл.sql`.

История армянской версии по шагам — `docs/history-armenian.md`.
