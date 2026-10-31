#!/usr/bin/env python3
"""Сборка библиотеки рисунков к словам: scripts/pics/pics_*.py → app/src/pics/lib.js.

Каждый рисунок: ключ (понятие), SVG-разметка поля 64×64, русские значения слова, тег
(n — существительное, v — глагол, a — прилагательное; k — входит в детский набор).
Привязка к словам — по русскому значению (первое значение до запятой, без пояснений в скобках), поэтому
один рисунок подходит всем языкам. --report печатает, сколько слов каждого языка получили картинку.

Запуск: python3 scripts/pics/build_pics.py [--report]
"""
import csv, importlib.util, json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = Path(__file__).resolve().parent
OUT = ROOT / 'app' / 'src' / 'pics' / 'lib.js'
S = ' stroke="#2B2D42" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"'
T = ' stroke="#2B2D42" stroke-width="1.4" stroke-linecap="round" fill="none"'


def ru_key(s: str) -> str:
    s = re.sub(r'\([^)]*\)', ' ', str(s or ''))
    s = s.split(',')[0].split(';')[0].split('/')[0]
    return ' '.join(s.replace('ё', 'е').replace('Ё', 'Е').lower().split())


def load():
    pics = {}
    for f in sorted(SRC.glob('pics_*.py')):
        spec = importlib.util.spec_from_file_location(f.stem, f)
        m = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(m)
        for k, v in m.D.items():
            if k in pics:
                raise SystemExit(f'Повтор рисунка {k} в {f.name}')
            pics[k] = v
    return pics


def main():
    pics = load()
    body, ru, kids, tags = {}, {}, [], {}
    for k, (svg, words, tag) in pics.items():
        svg = svg.replace('{S}', S).replace('{T}', T)
        svg = re.sub(r'\s*\n\s*', '', svg)
        if '{' in svg:
            raise SystemExit(f'Незаменённый шаблон в {k}')
        body[k] = svg
        tags[k] = tag[0]
        if 'k' in tag:
            kids.append(k)
        for w in words:
            key = ru_key(w)
            if key in ru and ru[key] != k:
                raise SystemExit(f'Значение «{w}» уже у рисунка {ru[key]} (и у {k})')
            ru[key] = k
    OUT.parent.mkdir(parents=True, exist_ok=True)
    js = ['// Собрано scripts/pics/build_pics.py из scripts/pics/pics_*.py — не править вручную.',
          '// PICS: рисунок → SVG (поле 64×64); RU: русское значение → рисунок; KIDS: детский набор; TAG: n | v | a.',
          'export const PICS = ' + json.dumps(body, ensure_ascii=False, indent=0) + ';',
          'export const RU = ' + json.dumps(ru, ensure_ascii=False) + ';',
          'export const KIDS = ' + json.dumps(kids) + ';',
          'export const TAG = ' + json.dumps(tags) + ';', '']
    OUT.write_text('\n'.join(js), encoding='utf-8')
    print(f'Рисунков: {len(body)}, русских значений: {len(ru)}, детский набор: {len(kids)} → {OUT.relative_to(ROOT)}')
    if '--report' in sys.argv:
        csv.field_size_limit(10 ** 8)
        for wf in sorted(ROOT.glob('data/*/build/words.csv')):
            rows = [r for r in csv.DictReader(open(wf, encoding='utf-8')) if not r.get('canonical_id')]
            hit = [r for r in rows if ru_key(r['ru']) in ru]
            used = {ru[ru_key(r['ru'])] for r in hit}
            print(f'  {wf.parts[-3]}: слов с картинкой {len(hit)} из {len(rows)}; рисунков задействовано {len(used)} из {len(body)}')
            if '--missing' in sys.argv:
                print('    без слов:', ', '.join(sorted(set(body) - used)))


if __name__ == '__main__':
    main()
