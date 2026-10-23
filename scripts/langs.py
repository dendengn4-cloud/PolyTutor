"""Список включённых языков из langs.json — для workflow.

  python3 scripts/langs.py codes        → «hy uz» (через пробел)
  python3 scripts/langs.py site-json    → {"langs": [{code, flag, name}]} — для стартовой страницы и бота (langs.json сайта)
  python3 scripts/langs.py check <код>  → код 0, если язык есть и включён
"""
import json
import sys
from pathlib import Path

LANGS = json.loads((Path(__file__).resolve().parent.parent / 'langs.json').read_text(encoding='utf-8'))['langs']
ENABLED = [l for l in LANGS if l.get('enabled')]

if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'codes'
    if cmd == 'codes':
        print(' '.join(l['code'] for l in ENABLED))
    elif cmd == 'site-json':
        print(json.dumps({'langs': [{'code': l['code'], 'flag': l.get('flag', ''), 'name': l['name']} for l in ENABLED]},
                         ensure_ascii=False, indent=1))
    elif cmd == 'check':
        code = sys.argv[2] if len(sys.argv) > 2 else ''
        if not any(l['code'] == code for l in ENABLED):
            sys.exit(f'Язык «{code}» не найден или выключен в langs.json')
    else:
        sys.exit(__doc__)
