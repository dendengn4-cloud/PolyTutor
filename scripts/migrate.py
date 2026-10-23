"""Применяет миграции базы для всех включённых языков (langs.json) — см. supabase/README.md.

Подключение: переменная SUPABASE_DB_URL (строка подключения psql).
Список языков можно ограничить: LANGS=hy,uz (по умолчанию — все с enabled: true).
LANGS_FILE — другой файл со списком языков (для локальной проверки).
Каждый файл — отдельная транзакция: при ошибке файл откатывается целиком, и работа останавливается.
"""
import json
import os
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from sqlrender import render  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
SUPA = ROOT / 'supabase'

# Раздел языка и права по умолчанию — как у раздела public в Supabase (миграции потом сужают их сами)
BOOTSTRAP = """
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
"""
BOOTSTRAP_NAME = '00000000000000_schema'


def psql_base():
    url = os.environ.get('SUPABASE_DB_URL')
    if not url:
        sys.exit('Не задана SUPABASE_DB_URL')
    return ['psql', url, '-v', 'ON_ERROR_STOP=1', '-X', '-q']


def run_sql(sql: str, single=True):
    cmd = psql_base() + (['--single-transaction'] if single else []) + ['-f', '-']
    p = subprocess.run(cmd, input=sql, text=True)
    if p.returncode != 0:
        sys.exit(p.returncode)


def query(sql: str) -> list[str]:
    p = subprocess.run(psql_base() + ['-tA', '-c', sql], text=True, capture_output=True)
    if p.returncode != 0:
        sys.stderr.write(p.stderr)
        sys.exit(p.returncode)
    return [x for x in p.stdout.splitlines() if x]


def languages():
    langs_file = Path(os.environ.get('LANGS_FILE') or ROOT / 'langs.json')   # LANGS_FILE — только для локальной проверки
    langs = json.loads(langs_file.read_text(encoding='utf-8'))['langs']
    only = [x.strip() for x in os.environ.get('LANGS', '').split(',') if x.strip()]
    if only:
        unknown = set(only) - {l['code'] for l in langs}
        if unknown:
            sys.exit(f'Нет в langs.json: {", ".join(sorted(unknown))}')
        return [l for l in langs if l['code'] in only]
    return [l for l in langs if l.get('enabled')]


def files_for(lang):
    base = SUPA / 'base' / lang['base']
    if not base.is_dir():
        sys.exit(f'Нет цепочки миграций {base}')
    found = {}
    for folder in (base, SUPA / 'lang' / lang['code'], SUPA / 'common'):
        if folder.is_dir():
            for f in folder.glob('*.sql'):
                if f.name in found:
                    sys.exit(f'Одинаковое имя миграции: {f} и {found[f.name]}')
                found[f.name] = f
    return [found[k] for k in sorted(found)]


def main():
    run_sql("""
create schema if not exists supabase_migrations;
create table if not exists supabase_migrations.schema_migrations (version text primary key, statements text[], name text);
""")
    applied = set(query('select version from supabase_migrations.schema_migrations'))
    total = 0
    for lang in languages():
        code = lang['code']
        items = [(BOOTSTRAP_NAME, f'create schema if not exists {code};\n' + render(BOOTSTRAP, code))]
        items += [(f.stem, render(f.read_text(encoding='utf-8'), code)) for f in files_for(lang)]
        n = 0
        for name, sql in items:
            version = f'{code}:{name}'
            if version in applied:
                continue
            print(f'[{code}] применяю: {name}', flush=True)
            run_sql(sql + f"\ninsert into supabase_migrations.schema_migrations (version, name) values ('{version}', '{name}');\n")
            n += 1
        print(f'[{code}] новых миграций: {n}', flush=True)
        total += n
    print(f'Готово. Всего применено: {total}')


if __name__ == '__main__':
    main()
