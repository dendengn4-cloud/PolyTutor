"""Сверка форм tr_forms.py с примерами словаря: где пример показывает другую основу или гармонию — список для проверки.
Запуск: python3 scripts/langs/tr/forms_check.py  (после build_vocab.py)"""
import csv, re, sys, glob, json
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import tr_forms as T
from build_vocab import tr_lower

ROOT = Path(__file__).resolve().parents[3]
SV = {}
for f in glob.glob(str(ROOT.parent / 'sv' / 'v' / '*.txt')):
    for l in open(f, encoding='utf-8'):
        if l[:1] in '#@\n':
            continue
        p = l.split('|')
        SV[int(p[0])] = p[1]
words = {r['id']: r for r in csv.DictReader(open(ROOT / 'data/tr/build/words.csv', encoding='utf-8'))}
ex = {}
for r in csv.DictReader(open(ROOT / 'data/tr/build/examples.csv', encoding='utf-8')):
    ex.setdefault(r['word_id'], []).append(r['uz'])
tok = lambda s: re.findall(r"[a-zçğıöşüâîû]+", tr_lower(s))
SOFT = {'p': 'b', 'ç': 'c', 't': 'd', 'k': 'ğ'}
issues = []
for wid, w in words.items():
    if int(wid) >= 20000 or w['canonical_id']:
        continue
    n = w['uz']
    if not SV.get(int(wid), '').startswith(('en ', 'ett ')) or not T.noun_forms(n):
        continue
    pre, v = T.noun_parts(n)
    for s in ex.get(wid, []):
        for t in tok(s):
            if t == n or len(t) <= len(n) - 1:
                continue
            if t.startswith(n) and len(t) > len(n):
                suf = t[len(n):]
                if suf[0] in T.VOW and not T.ends_vowel(n) and pre != n and suf[0] != 'y':
                    issues.append((n, 'не смягчается/не выпадает в примере', t, s))
                fv = next((c for c in suf if c in T.VOW), None)
                if suf[0] in 'ldt' and fv in 'ae' and fv != T.A(v):
                    issues.append((n, f'гармония: в примере -{suf}', t, s))
            elif pre == n and not T.ends_vowel(n) and n[-1] in SOFT:
                sv = n[:-1] + ('g' if n.endswith('nk') else SOFT[n[-1]])
                if t.startswith(sv) and len(t) > len(sv) and t[len(sv)] in T.VOW:
                    issues.append((n, 'в примере смягчение', t, s))
            elif pre == n and len(n) >= 4 and n[-2] in 'ıiuü' and t.startswith(n[:-2] + n[-1]) and len(t) > len(n) - 1 and t[len(n) - 1] in T.VOW:
                issues.append((n, 'в примере выпадение гласной', t, s))
# глаголы: формы на -yor, -acak, -ir/-ar в примерах
for wid, w in words.items():
    if w['word_class'] != 'verb' or w['canonical_id']:
        continue
    f = T.verb_forms(w['uz'])
    if not f:
        continue
    last = lambda x: x.split(' ')[-1]
    yor = last(f['pres'][2]); fut = last(f['fut'][2]); aor = last(f['aor'][2])
    stem = last(f['stem'])
    for s in ex.get(wid, []):
        for t in tok(s):
            if 'yor' in t and t.startswith(stem[:max(2, len(stem) - 1)]) and not t.startswith(yor) and 'mıyor' not in t and 'miyor' not in t and 'muyor' not in t and 'müyor' not in t \
                    and 'abil' not in t and 'ebil' not in t and 'il' not in t[len(stem) - 1:len(stem) + 2] and 'ın' not in t[len(stem):len(stem) + 2] and 'in' not in t[len(stem):len(stem) + 2] and 'ş' not in t[len(stem):len(stem) + 2] and 'dır' not in t and 'dir' not in t and 'tır' not in t and 'tir' not in t:
                issues.append((w['uz'], f'настоящее: {yor}', t, s))
            if re.match(re.escape(stem) + r'[aeıiuü]r(ım|im|um|üm|sın|sin|sun|sün|ız|iz|uz|üz|lar|ler)?$', t) and t != aor and not t.startswith(aor):
                issues.append((w['uz'], f'широкое время: {aor}', t, s))
print(len(issues))
for i in issues:
    print(' | '.join(i))
