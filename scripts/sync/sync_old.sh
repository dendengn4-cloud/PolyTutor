#!/bin/bash
# Синхронизация одного языка: старая база (только чтение) → снимки в Polytutor → перенос в профили.
# Использование: OLD_DB_URL=… SUPABASE_DB_URL=… scripts/sync/sync_old.sh hy
set -euo pipefail
L="${1:?код языка (hy, uz)}"
[[ "$L" =~ ^[a-z]{2,3}$ ]] || { echo "Неверный код языка: $L"; exit 1; }
: "${OLD_DB_URL:?не задана строка подключения к старой базе}"
: "${SUPABASE_DB_URL:?не задана строка подключения к Polytutor}"
DIR="$(cd "$(dirname "$0")" && pwd)"
SNAP="$(mktemp)"
trap 'rm -f "$SNAP"' EXIT

# 1. снимок из старой базы (только select, пользователь tutor_sync с режимом «только чтение»)
psql "$OLD_DB_URL" -X -q -v ON_ERROR_STOP=1 -f "$DIR/export_old.sql" > "$SNAP"
echo "[$L] прочитано из старой базы: $(wc -l < "$SNAP") пользователей ($(du -h "$SNAP" | cut -f1))"

# 2. снимки → $L.sync_snapshot, затем перенос всем, у кого уже есть профиль в Polytutor
psql "$SUPABASE_DB_URL" -X -q -v ON_ERROR_STOP=1 <<SQL
begin;
create temp table sync_in (tg_id bigint, data jsonb) on commit drop;
\copy sync_in from '$SNAP'
insert into $L.sync_snapshot (tg_id, data, synced_at)
select distinct on (tg_id) tg_id, data, now() from sync_in where tg_id is not null order by tg_id
on conflict (tg_id) do update set data = excluded.data, synced_at = excluded.synced_at;
\pset format unaligned
\pset tuples_only on
select '[$L] перенесено: ' || $L.sync_apply_all()::text;
commit;
SQL
