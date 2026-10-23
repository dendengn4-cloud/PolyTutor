"""Переносит SQL, написанный для раздела public, в раздел (schema) языка.

  public.<имя>              → <код>.<имя>
  schema public             → schema <код>        (grant / revoke / alter default privileges)
  nspname = 'public'        → nspname = '<код>'
  'data/build/              → 'data/<код>/build/  (пути \\copy в scripts/load_vocab.sql)

Роль public («revoke … from public, anon») и слово public в тексте не меняются.

Как модуль: render(text, code). Как программа: python3 scripts/sqlrender.py <код> < in.sql > out.sql
"""
import re
import sys

CODE_RE = re.compile(r'^[a-z]{2,3}$')
RULES = [
    (re.compile(r'\bpublic\.(?=[A-Za-z_"])'), '{c}.'),
    (re.compile(r'\bschema\s+public\b', re.I), 'schema {c}'),
    (re.compile(r"\bnspname\s*=\s*'public'"), "nspname = '{c}'"),
    (re.compile(r"'data/build/"), "'data/{c}/build/"),
]


def render(text: str, code: str) -> str:
    if not CODE_RE.match(code) or code == 'public':
        raise ValueError(f'неверный код языка: {code!r}')
    for rx, repl in RULES:
        text = rx.sub(repl.replace('{c}', code), text)
    return text


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit('usage: sqlrender.py <код> < in.sql > out.sql')
    sys.stdout.write(render(sys.stdin.read(), sys.argv[1]))
