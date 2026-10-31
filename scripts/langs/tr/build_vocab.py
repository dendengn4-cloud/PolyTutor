#!/usr/bin/env python3
"""
Сборка словаря для импорта в Supabase (турецкая версия; основа — шведская сборка, scripts/langs/sv).

Внутренние имена «uz» (колонки words.uz, uz_key, accept_uz, типы заданий uz_ru_choice…) оставлены как в
узбекской версии и означают «изучаемый язык» — здесь турецкий. Так схема базы и код совпадают с узбекскими,
а приложения можно будет объединить без переделки.

Вход:
  data/source/vocabulary.xlsx  — исходная таблица (лист `words`, колонка «Турецкий»; создаётся из партий словаря), НЕ изменяется
  data/fixes.csv               — утверждённые правки примеров (replace / hide / audio_off)
  data/word_fixes.csv          — правки самих слов: uz / ru (исправление) и off (повреждённая запись — слово отключено)
  data/levels.csv              — уровень CEFR по каждому слову (перепроверка 04.10.2026; в источнике уровень стоял по теме)
  data/source/colloquial.json  — разговорная турецкая лексика (отдельные темы «Разговорная речь. …», ID с 20001)

Выход (data/build/):
  topics.csv, words.csv, examples.csv — данные для загрузки (scripts/load_vocab.sql)
  report.md                           — отчёт проверки

Правила нормализации описаны в docs/normalization.md и должны совпадать
с проверкой ответов в приложении и в базе.
"""
from __future__ import annotations

import sys as _sys, os as _os
_sys.path.insert(0, _os.path.dirname(_os.path.abspath(__file__)))
import csv
import json
import re
import sys
import unicodedata
from collections import defaultdict
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parents[3]          # корень репозитория (скрипт лежит в scripts/langs/tr/)
LANG_CODE = "tr"
DATA = ROOT / "data" / LANG_CODE
SRC = DATA / "source" / "vocabulary.xlsx"
FIXES = DATA / "fixes.csv"
WORD_FIXES = DATA / "word_fixes.csv"
LEVELS = DATA / "levels.csv"
COLLOQUIAL = DATA / "source" / "colloquial.json"
COLLOQ_PREFIX = "Разговорная речь. "
# Шаг 21: разговорная лексика — две группы. Самые нужные фразы (data/colloquial_core.txt) — на A1 сразу после
# «Приветствий», остальное — одной темой в начале A2. На пути обе отмечены «разговорная».
COLLOQ_CORE_FILE = DATA / "colloquial_core.txt"
COLLOQ_CORE_TOPIC = COLLOQ_PREFIX + "Самое нужное"
COLLOQ_REST_TOPIC = COLLOQ_PREFIX + "Живая турецкая речь"
SUPPLEMENT = DATA / "source" / "supplement.json"   # недостающие слова (числа 10–19, 30–33…), ID с 21001
SYN_NOTES = DATA / "syn_notes.csv"     # чем слово отличается от синонимов с тем же переводом (шаг 21)
TOPIC_NAMES = DATA / "topic_names.csv"   # переводы названий тем: name_ru,name_uz,name_en
AUDIO_VOICED = DATA / "audio_voiced.txt"  # файлы, озвученные workflow «Озвучка» (scripts/tts.py)
OUT = DATA / "build"

CEFR_RANK = {"A1": 1, "A2": 2, "B1": 3, "B2": 4}
CYRILLIC = re.compile("[Ѐ-ӿ]")
LATIN = re.compile("[A-Za-z]")
# Турецкие буквы: латиница без q w x + ç ğ ı ö ş ü; â î û (kâğıt, hâlâ) при сравнении = a i u
TR_LOWER = "a-zçğıöşü"
TR_LETTERS = "A-Za-zÇĞİIıÖŞÜçğöşüÂÎÛâîû"
TR_MARKS = "'’`ʼ´"     # апостроф перед окончанием имени собственного (İstanbul'da) при сравнении убирается
# Артиклей нет; ответ «gitmek» принимается и как основа «git» (см. accept_uz)
VERB_END = re.compile(r"(mak|mek)$")


# --------------------------------------------------------------------------- нормализация
def display_uz(text: str) -> str:
    """Турецкий текст для показа: NFC, лишние пробелы убраны."""
    s = unicodedata.normalize("NFC", str(text)).strip()
    return re.sub(r"\s+", " ", s)


def tr_lower(text: str) -> str:
    """Строчные буквы по-турецки: I → ı, İ → i (обычный lower() дал бы I → i)."""
    s = unicodedata.normalize("NFC", str(text)).replace("I", "ı").replace("İ", "i")
    return s.lower().replace("i\u0307", "i")


def key_uz(text: str) -> str:
    """Ключ для сравнения турецких ответов: регистр (по-турецки), пунктуация, апострофы не важны; â î û = a i u.
    ç ğ ı ö ş ü — отдельные буквы и сохраняются. Должен совпадать с public.key_uz (база) и keyUz (app/src/lang/normalize.js)."""
    s = tr_lower(text)
    s = s.replace("â", "a").replace("î", "i").replace("û", "u")
    s = re.sub("[" + TR_MARKS + "]", "", s)
    s = re.sub(r"[^a-zçğıöşü \-]", " ", s)
    s = s.replace("-", " ")
    s = re.sub(r"\s+", " ", s).strip()
    return s


def bare_key(k: str) -> str:
    """В турецком артиклей нет: ключ без изменений (функция оставлена для общей схемы сборки)."""
    return k


def key_ru(text: str) -> str:
    """Ключ русского перевода целиком (со скобками): для поиска полных дублей."""
    s = unicodedata.normalize("NFC", str(text)).lower().replace("ё", "е")
    s = re.sub(r"\s+", " ", s).strip()
    s = re.sub(r"[.!?…]+$", "", s).strip()
    return s


def _clean_ru(s: str) -> str:
    s = s.lower().replace("ё", "е")
    s = re.sub(r"[^0-9a-zа-я \-]", " ", s)
    s = s.replace("-", " ")
    return re.sub(r"\s+", " ", s).strip()


def ru_variants(text: str) -> list[str]:
    """Принимаемые варианты русского ответа: без пояснений в скобках, каждый через запятую/;/ и целиком."""
    s = unicodedata.normalize("NFC", str(text))
    no_paren = re.sub(r"\([^)]*\)", " ", s)
    variants = []
    whole = _clean_ru(no_paren)
    if whole:
        variants.append(whole)
    for part in re.split(r"[,;/]", no_paren):
        p = _clean_ru(part)
        if p and p not in variants:
            variants.append(p)
    return variants


RU_INFINITIVE = re.compile(r"(ть|ться|чь|чься|ти|тись)$")
# существительные на -ть/-чь, похожие на инфинитив
RU_NOUNS_T = {"кровать", "тетрадь", "мать", "площадь", "часть", "дочь", "ночь", "печь", "помощь", "речь", "вещь",
              "лошадь", "смерть", "жизнь", "радость", "новость", "власть", "сеть", "нить", "ртуть", "суть", "путь"}


def word_class(uz_key: str, ru: str = "", en: str = "") -> str:
    """Глагол: турецкий инфинитив на -mak/-mek (последнее слово) и перевод-глагол (английский «to …» или
    русский инфинитив). Существительные на -mek (yemek «еда», ekmek «хлеб») отделяет перевод."""
    first_ru = (re.findall(r"[а-яё]+", str(ru).lower()) or [""])[0]
    is_verb_tr = str(en).lower().startswith("to ") or (RU_INFINITIVE.search(first_ru) and first_ru not in RU_NOUNS_T)
    if is_verb_tr and VERB_END.search(uz_key):
        return "verb"
    if " " in bare_key(uz_key):
        return "phrase"
    return "other"


# --------------------------------------------------------------------------- пропуск в примере
TOKEN_CHARS = "A-Za-zÇĞİIıÖŞÜçğöşüÂÎÛâîû"
SOFT = {"p": "b", "ç": "c", "t": "d", "k": "ğ", "g": "ğ"}   # смягчение перед гласной: kitap → kitabı, git → gidiyor, psikolog → psikoloğu
VOWELS = "aeıioöuüâîû"
# Глаголы, у которых основа меняется: de- → di-yor, ye- → yi-yor; et-/git-/tat- → ed-/gid-/tad- (через SOFT)
NARROW = {"de": "di", "ye": "yi"}


def _search(low, w, after_letter=None, left_free=False):
    left = "" if left_free else rf"(?<![{TOKEN_CHARS}])"
    right = "" if after_letter is None else (rf"(?=[{TOKEN_CHARS}])" if after_letter else rf"(?![{TOKEN_CHARS}])")
    m = re.search(left + re.escape(w) + right, low)
    return (m.start(), len(w)) if m else None


def _stems(w: str) -> list[str]:
    """Варианты основы для поиска с окончанием: сама основа, со смягчённой конечной согласной (kitap → kitab-,
    renk → reng-) и с выпавшей гласной (ağız → ağz-, burun → burn-, oğul → oğl-)."""
    out = [w]
    if w and w[-1] in SOFT:
        if w.endswith("nk"):
            out.append(w[:-1] + "g")
        else:
            out.append(w[:-1] + SOFT[w[-1]])
    if len(w) >= 4 and w[-1] not in VOWELS and w[-2] in "ıiuü" and w[-3] not in VOWELS:
        out.append(w[:-2] + w[-1])
    if len(w) >= 5 and w[-1] in "ıiuü":
        out.append(w[:-1])          # аффикс принадлежности сложного слова: gözyaşı → gözyaşları, iş yeri → iş yerinde
    return out


def find_blank(sentence: str, word_display: str, is_verb: bool = True) -> tuple[int, int] | None:
    """Позиция части предложения, которую закрываем в «вставь слово».

    1) слово целиком (или фраза целиком);
    2) слово + окончание (ev → evde, evler), только для слов длиной ≥ 3; основа может смягчаться
       (kitap → kitabı) или терять гласную (burun → burnu);
    3) глагол: основа без -mak/-mek + окончание (gelmek → geliyor, gitmek → gidiyor, demek → diyor);
       у глагольной фразы (teşekkür etmek) — фраза с изменённым глаголом или первое слово;
    4) последняя часть сложного слова, если слово длиной ≥ 4.
    Закрывается само слово/основа, окончание остаётся видимым.
    """
    low = tr_lower(sentence)
    w = tr_lower(word_display).strip(" .!?")
    w = re.sub(r"\s*\([^)]*\)$", "", w)                          # «gelmek (eve)» → «gelmek»
    w = re.sub(r"[-]$", "", w)
    if not w:
        return None
    if "," in w:                                                  # «anlamak, çözmek» — любой из вариантов
        for part in [x.strip() for x in w.split(",") if x.strip()]:
            r = find_blank(sentence, part, is_verb)
            if r:
                return r
        return None
    r = _search(low, w, False)
    if r:
        return r
    words = w.split(" ")
    last = words[-1]
    if is_verb and VERB_END.search(last):
        stem = VERB_END.sub("", last)
        cands = [stem] + ([NARROW[stem]] if stem in NARROW else []) + _stems(stem)[1:]
        if len(stem) >= 3 and stem[-1] in "ae":
            cands.append(stem[:-1])   # -yor сужает гласную: kutla → kutluyor, iste → istiyor
        for c in cands:
            if len(c) >= 2:
                phrase = " ".join(words[:-1] + [c])
                r = _search(low, phrase, None if len(c) >= 3 else True)
                if r:
                    return r
        if len(words) > 1 and len(words[0]) >= 3:
            r = _search(low, words[0], False)
            if r:
                return r
        return None
    if len(last) >= 3:
        for c in _stems(last):                                    # ev sahibi → ev sahibiyle, iş yeri → iş yerinde
            r = _search(low, " ".join(words[:-1] + [c]), True)
            if r:
                return r
    head = words[0]
    if head != w and len(head) >= 3:
        r = _search(low, head, False) or _search(low, head, True)
        if r:
            return r
    if " " not in w and len(w) >= 4:
        r = _search(low, w, None, left_free=True)
        if r:
            return r
    return None


# --------------------------------------------------------------------------- чтение
def read_source():
    wb = openpyxl.load_workbook(SRC, read_only=True, data_only=True)
    ws = wb["words"]
    rows = ws.iter_rows(values_only=True)
    header = [re.sub(r"[\s|]+", "", str(h or "")) for h in next(rows)]
    idx = {h: i for i, h in enumerate(header)}
    global UZ_COL
    UZ_COL = "Турецкий"
    need = ["ID", "Тема", "Русский", UZ_COL, "Уровень"] + \
           [f"ex{k}" for k in range(1, 6)] + [f"ex{k}_ru" for k in range(1, 6)]
    missing = [n for n in need if n not in idx]
    if missing:
        sys.exit(f"В листе words нет колонок: {missing}. Заголовки: {header}")
    data = []
    for r in rows:
        if r is None or r[idx["ID"]] in (None, ""):
            continue
        get = lambda name: r[idx[name]]
        data.append({
            "id": int(float(get("ID"))),
            "topic": str(get("Тема")).strip(),
            "topic_no": get("Тема№") if "Тема№" in idx else None,
            "ru": str(get("Русский")).strip(),
            "uz": str(get(UZ_COL)).strip(),
            "en": str(get("English") or "").strip() if "English" in idx else "",
            "tr_lat": str(get("Транслитерация(лат.)") or "").strip() if "Транслитерация(лат.)" in idx else "",
            "tr_cyr": str(get("Транскрипция(кир.)") or "").strip() if "Транскрипция(кир.)" in idx else "",
            "cefr": str(get("Уровень")).strip(),
            "ex": [(get(f"ex{k}"), get(f"ex{k}_ru")) for k in range(1, 6)],
        })
    return data


def read_fixes():
    fixes = []
    with open(FIXES, encoding="utf-8") as f:
        for row in csv.DictReader(f):
            row["word_id"] = int(row["word_id"])
            fixes.append(row)
    return fixes


def apply_word_fixes(data):
    """Исправления слов. Старое значение сверяется с источником — если источник изменился, сборка останавливается."""
    by_id = {d["id"]: d for d in data}
    off, changed = set(), set()
    if not WORD_FIXES.exists():
        return data, changed
    with open(WORD_FIXES, encoding="utf-8") as f:
        for row in csv.DictReader(f):
            wid, field = int(row["word_id"]), row["field"]
            d = by_id.get(wid)
            if d is None:
                sys.exit(f"word_fixes.csv: нет слова с ID {wid}")
            cur = display_uz(d["uz"]) if field in ("uz", "off") else d["ru"]
            if cur.strip() != row["old"].strip():
                sys.exit(f"word_fixes.csv: {wid}/{field} в источнике изменилось: ожидалось {row['old']!r}, в файле {cur!r}")
            if field == "off":
                off.add(wid)
            elif field == "uz":
                d["uz"] = row["new"]
                changed.add(wid)          # аудио слова записано для старого текста — отключаем
            elif field == "ru":
                d["ru"] = row["new"]
            else:
                sys.exit(f"word_fixes.csv: неизвестное поле {field}")
    return [d for d in data if d["id"] not in off], changed


def apply_levels(data):
    if not LEVELS.exists():
        return 0
    by_id = {d["id"]: d for d in data}
    n = 0
    with open(LEVELS, encoding="utf-8") as f:
        for row in csv.DictReader(f):
            d = by_id.get(int(row["word_id"]))
            if d is None:
                continue                  # слово отключено правкой
            if row["new"] not in CEFR_RANK:
                sys.exit(f"levels.csv: неизвестный уровень {row['new']} у {row['word_id']}")
            d["cefr"] = row["new"]
            d["level_fixed"] = True
            n += 1
    return n


def read_colloquial(existing_keys):
    """Разговорная лексика: слово + литературный вариант + пометка; до двух примеров. Без аудио."""
    if not COLLOQUIAL.exists():
        return [], []
    items = json.loads(COLLOQUIAL.read_text(encoding="utf-8"))
    core = set()
    if COLLOQ_CORE_FILE.exists():
        core = {int(x.split("#")[0]) for x in COLLOQ_CORE_FILE.read_text(encoding="utf-8").split("\n") if x.split("#")[0].strip()}
    out, skipped = [], []
    for e in items:
        if key_uz(e["uz"]) in existing_keys:
            skipped.append(e["uz"])      # такое слово уже есть в словаре
            continue
        ex = [(e.get("ex_uz"), e.get("ex_ru")), (e.get("ex2_uz"), e.get("ex2_ru"))]
        out.append({
            "id": int(e["id"]), "topic": COLLOQ_CORE_TOPIC if int(e["id"]) in core else COLLOQ_REST_TOPIC, "topic_no": None,
            "ru": e["ru"].strip(), "uz": e["uz"].strip(), "cefr": "A1" if int(e["id"]) in core else "A2",
            "ex": [x for x in ex if x[0] and x[1]],
            "register": "colloquial", "literary": e.get("literary") or "", "note": e.get("note") or "",
            "en": e.get("en") or "", "level_fixed": True,
        })
    return out, skipped


def read_supplement(existing_keys):
    """Дополнения к словарю: слово встаёт в тему после слова с ID «after» (например, 10–19 — после «девять»)."""
    if not SUPPLEMENT.exists():
        return []
    out = []
    for k, e in enumerate(json.loads(SUPPLEMENT.read_text(encoding="utf-8"))):
        if key_uz(e["uz"]) in existing_keys:
            continue
        ex = [(e.get("ex_uz"), e.get("ex_ru")), (e.get("ex2_uz"), e.get("ex2_ru"))]
        out.append({
            "id": int(e["id"]), "topic": e["topic"].strip(), "topic_no": None,
            "ru": e["ru"].strip(), "uz": e["uz"].strip(), "cefr": e["cefr"],
            "ex": [x for x in ex if x[0] and x[1]], "register": "lit", "en": e.get("en") or "",
            "level_fixed": True, "no_audio": True, "order": float(e["after"]) + (k + 1) / 1000,
        })
    return out


# --------------------------------------------------------------------------- числа: ответ цифрами
NUM_UNITS = {"ноль": 0, "один": 1, "одна": 1, "два": 2, "две": 2, "три": 3, "четыре": 4, "пять": 5, "шесть": 6, "семь": 7,
             "восемь": 8, "девять": 9, "десять": 10, "одиннадцать": 11, "двенадцать": 12, "тринадцать": 13,
             "четырнадцать": 14, "пятнадцать": 15, "шестнадцать": 16, "семнадцать": 17, "восемнадцать": 18,
             "девятнадцать": 19, "двадцать": 20, "тридцать": 30, "сорок": 40, "пятьдесят": 50, "шестьдесят": 60,
             "семьдесят": 70, "восемьдесят": 80, "девяносто": 90, "сто": 100, "двести": 200, "триста": 300,
             "четыреста": 400, "пятьсот": 500, "шестьсот": 600, "семьсот": 700, "восемьсот": 800, "девятьсот": 900}
NUM_SCALE = {"тысяча": 10**3, "тысячи": 10**3, "тысяч": 10**3, "миллион": 10**6, "миллиона": 10**6,
             "миллионов": 10**6, "миллиард": 10**9}


def ru_number(text: str):
    """«двадцать один» → 21, «две тысячи» → 2000; не число целиком → None."""
    words = text.split()
    if not words:
        return None
    total, cur = 0, 0
    for w in words:
        if w in NUM_UNITS:
            cur += NUM_UNITS[w]
        elif w in NUM_SCALE:
            total += (cur or 1) * NUM_SCALE[w]
            cur = 0
        else:
            return None
    return total + cur


# --------------------------------------------------------------------------- слова примеров
def link_examples(examples, data):
    """Для каждого примера — слова словаря, из которых он состоит (по основе: kitapları → kitap, geldim → gelmek).
    Если опознано меньше 60% слов предложения, список пустой: такой длинный пример в задания не попадёт."""
    keys = {}
    for d in data:
        if d.get("canonical"):
            continue
        k = d["uz_key"]
        if not k or " " in bare_key(k):
            continue
        k = bare_key(k)
        stem = VERB_END.sub("", k) if d["class"] == "verb" else k
        for x in set(_stems(k) + _stems(stem)):
            if len(x) >= 2:
                keys.setdefault(x, d["id"])
    for e in examples:
        tokens = [key_uz(t) for t in e["uz"].split()]
        tokens = [t for t in tokens if t]
        e["n_words"] = len(tokens)
        found, matched = [], 0
        for t in tokens:
            wid = keys.get(t)
            if wid is None and len(t) >= 4:
                for L in range(len(t) - 1, 2, -1):          # самая длинная основа из словаря
                    wid = keys.get(t[:L])
                    if wid is not None:
                        break
            if wid is not None:
                matched += 1
                if wid not in found:
                    found.append(wid)
        e["word_ids"] = csv_array(found) if tokens and matched / len(tokens) >= 0.6 else "{}"


def read_pos():
    """data/pos.csv: часть речи (id,pos). Существительные на -moq (tomoq, barmoq) — не глаголы."""
    path = DATA / "pos.csv"
    if not path.exists():
        return {}
    with open(path, encoding="utf-8") as f:
        return {int(r["id"]): r["pos"].strip() for r in csv.DictReader(f) if r.get("id")}


def write_nouns_js(pos_map):
    """app/src/nouns.js: id существительных из data/pos.csv — по ним приложение показывает кнопку «Склонение»."""
    ids = sorted(i for i, p in pos_map.items() if p == "n")
    body = ",".join(str(i) for i in ids)
    text = ("// Создаётся scripts/build_vocab.py из data/pos.csv — вручную не править.\n"
            "// id существительных, для которых приложение показывает таблицу склонения.\n"
            f"export const NOUN_IDS = new Set([{body}]);\n")
    path = ROOT / "app" / "src" / "langs" / LANG_CODE / "nouns.js"
    if not path.exists() or path.read_text(encoding="utf-8") != text:
        path.write_text(text, encoding="utf-8")


def read_verb_forms():
    """data/verb_forms.csv: переводы форм глаголов (ru: инфинитив, хвост, наст., прош., повел.; en: 5 форм, хвост)."""
    path = DATA / "verb_forms.csv"
    out = {}
    if not path.exists():
        return out
    for line in open(path, encoding="utf-8"):
        if not line.strip() or line.startswith("#"):
            continue
        f = line.rstrip("\n").split("|")
        if len(f) != 8:
            sys.exit(f"verb_forms.csv: неверная строка: {line[:80]}")
        sp = lambda x: [v.strip() for v in x.split(",")]
        pres, past, imp, en = sp(f[3]), sp(f[4]), sp(f[5]), sp(f[6])
        if len(pres) != 6 or len(past) != 3 or len(imp) != 2 or len(en) != 5:
            sys.exit(f"verb_forms.csv: неверное число форм: {line[:80]}")
        out[int(f[0])] = {"ru": {"inf": f[1].strip(), "tail": f[2].strip(), "pres": pres, "past": past, "imp": imp},
                          "en": {"f": en, "tail": f[7].strip()}}
    return out


def read_noun_forms():
    """data/noun_forms.csv: русские падежные формы существительных для подсказок в таблицах склонения."""
    path = DATA / "noun_forms.csv"
    out = {}
    if not path.exists():
        return out
    for line in open(path, encoding="utf-8"):
        if not line.strip() or line.startswith("#"):
            continue
        f = line.rstrip("\n").split("|")
        sg, pl = [v.strip() for v in f[3].split(",")], [v.strip() for v in f[4].split(",")]
        if len(f) != 5 or len(sg) != 5 or len(pl) != 5:
            sys.exit(f"noun_forms.csv: неверная строка: {line[:80]}")
        out[int(f[0])] = {"ru": {"g": f[1], "a": f[2], "sg": sg, "pl": pl}}
    return out


def tr_morph(d) -> str:
    """Колонка words.morph: у турецкой версии таблицы форм строит приложение по правилам — в базе пусто."""
    return ""


def csv_array(items) -> str:
    """Массив Postgres в текстовом формате для COPY CSV: {"a","b"}."""
    esc = ['"' + str(x).replace("\\", "\\\\").replace('"', '\\"') + '"' for x in items]
    return "{" + ",".join(esc) + "}"


# --------------------------------------------------------------------------- сборка
def main():
    data = read_source()
    pos_map = read_pos()
    verb_forms = read_verb_forms()
    noun_forms = read_noun_forms()
    data, uz_changed = apply_word_fixes(data)
    n_levels = apply_levels(data)
    colloq, colloq_skipped = read_colloquial({key_uz(d["uz"]) for d in data})
    data += colloq
    data += read_supplement({key_uz(d["uz"]) for d in data})
    by_id = {d["id"]: d for d in data}
    problems = []
    if colloq_skipped:
        problems.append(f"Разговорная лексика: пропущено (уже есть в словаре): {', '.join(colloq_skipped)}")

    # -- правки
    hidden, audio_off_ex, edited = set(), set(), set()
    for fx in read_fixes():
        wid, field, action = fx["word_id"], fx["field"], fx["action"]
        d = by_id.get(wid)
        if d is None:
            sys.exit(f"fixes.csv: нет слова с ID {wid}")
        if action == "audio_off":
            n = int(re.match(r"ex(\d)_audio", field).group(1))
            audio_off_ex.add((wid, n))
            continue
        n = int(re.match(r"ex(\d)$", field).group(1))
        cur = d["ex"][n - 1][0]
        if str(cur).strip() != fx["old"].strip():
            sys.exit(f"fixes.csv: текст {wid}/{field} в источнике изменился — проверьте правку.\n"
                     f"  ожидалось: {fx['old']}\n  в файле:   {cur}")
        if action == "hide":
            hidden.add((wid, n))
        elif action == "replace":
            d["ex"][n - 1] = (fx["new"], d["ex"][n - 1][1])
            edited.add((wid, n))
        else:
            sys.exit(f"fixes.csv: неизвестное действие {action}")

    # -- темы: по названию, порядок по первому слову
    topics = {}
    for d in sorted(data, key=lambda x: x["id"]):
        t = topics.setdefault(d["topic"], {"name": d["topic"], "first": d["id"], "cefr": set(), "no": d["topic_no"]})
        t["cefr"].add(d["cefr"])
    for i, t in enumerate(sorted(topics.values(), key=lambda t: t["first"]), start=1):
        t["id"] = i
        t["cefr"] = min(t["cefr"], key=lambda c: CEFR_RANK.get(c, 9))
    # порядок тем (sort_order и порядок изучения слов): разговорные группы — на своих местах
    greet = next((t["id"] for t in topics.values() if t["name"].startswith("Приветствия")), 2)
    for t in topics.values():
        t["sort"] = t["id"] * 10
        if t["name"] == COLLOQ_CORE_TOPIC:
            t["sort"] = greet * 10 + 5          # A1: сразу после «Приветствий»
        elif t["name"] == COLLOQ_REST_TOPIC:
            t["sort"] = 0                        # A2: первой темой

    # -- слова
    for d in data:
        if d["cefr"] not in CEFR_RANK:
            sys.exit(f"Слово {d['id']}: неизвестный уровень {d['cefr']}")
        d["uz_disp"] = display_uz(d["uz"])
        d["uz_key"] = key_uz(d["uz"])
        d["ru_key"] = key_ru(d["ru"])
        d["ru_vars"] = ru_variants(d["ru"])
        nums = [ru_number(v) for v in d["ru_vars"]]
        for n in nums:
            if n is not None and str(n) not in d["ru_vars"]:
                d["ru_vars"].append(str(n))          # можно ответить цифрами: «четыре» → 4
        d["ru_whole"] = d["ru_vars"][0] if d["ru_vars"] else ""
        d["class"] = word_class(d["uz_key"], d["ru"], d.get("en", ""))
        d["pos"] = pos_map.get(d["id"], "v" if d["class"] == "verb" else "")
        if d["class"] == "verb" and d["pos"] not in ("", "v"):
            d["class"] = "other"                      # tomoq, barmoq, qaymoq… — существительные
        if not d["uz_key"] or not d["ru_vars"]:
            problems.append(f"Слово {d['id']}: пустой ключ ({d['uz']!r} / {d['ru']!r})")
        if CYRILLIC.search(d["uz"]):
            problems.append(f"Слово {d['id']}: кириллица в турецком слове {d['uz']!r}")

    # полные дубли (узб. + рус. совпадают) → одна карточка: основная = та, что раньше
    # всех в порядке изучения (CEFR → тема → ID), чтобы слово не откладывалось до B2
    learn_pos = lambda i: (CEFR_RANK[by_id[i]["cefr"]], topics[by_id[i]["topic"]]["sort"], i)
    groups = defaultdict(list)
    for d in data:
        groups[(d["uz_key"], d["ru_key"])].append(d["id"])
    # уровень перепроверялся по основной карточке — дубли получают тот же уровень
    for ids in groups.values():
        fixed = [by_id[i]["cefr"] for i in ids if by_id[i].get("level_fixed")]
        if fixed:
            lvl = min(fixed, key=lambda c: CEFR_RANK[c])
            for i in ids:
                by_id[i]["cefr"] = lvl
    for ids in groups.values():
        main_id = min(ids, key=learn_pos)
        for i in ids:
            by_id[i]["canonical"] = None if i == main_id else main_id

    # принимаемые ответы
    ru_by_uz = defaultdict(list)
    uz_by_ruwhole = defaultdict(list)
    for d in data:
        for v in d["ru_vars"]:
            if v not in ru_by_uz[d["uz_key"]]:
                ru_by_uz[d["uz_key"]].append(v)
        k = d["uz_key"]
        if k and k not in uz_by_ruwhole[d["ru_whole"]]:
            uz_by_ruwhole[d["ru_whole"]].append(k)
    for d in data:
        d["accept_ru"] = ru_by_uz[d["uz_key"]]
        d["accept_uz"] = uz_by_ruwhole[d["ru_whole"]]

    # порядок изучения: CEFR → тема → ID
    order = sorted(data, key=lambda d: (CEFR_RANK[d["cefr"]], topics[d["topic"]]["sort"], d.get("order", d["id"])))
    for i, d in enumerate(order, start=1):
        d["sort_key"] = i

    # -- примеры
    examples = []
    blank_stats = defaultdict(int)
    for d in data:
        for n, (uz, ru) in enumerate(d["ex"], start=1):
            if uz in (None, "") or ru in (None, ""):
                if uz not in (None, "") or ru not in (None, ""):      # турецкая версия: 3 примера, пустые 4–5 — норма
                    problems.append(f"Слово {d['id']}: пример {n} заполнен наполовину")
                continue
            uz_disp = display_uz(uz)
            is_hidden = (d["id"], n) in hidden
            if CYRILLIC.search(uz_disp) and not is_hidden:
                problems.append(f"Слово {d['id']} пример {n}: кириллица в турецком тексте: {uz_disp}")
            blank = None if is_hidden else find_blank(uz_disp, d["uz_disp"], d["class"] == "verb")
            blank_stats["скрыт" if is_hidden else ("есть пропуск" if blank else "нет пропуска")] += 1
            examples.append({
                "word_id": d["id"], "n": n, "uz": uz_disp, "ru": str(ru).strip(),
                "blank_start": blank[0] if blank else "",
                "blank_len": blank[1] if blank else "",
                "blank_answer": uz_disp[blank[0]:blank[0] + blank[1]] if blank else "",
                # турецкая версия: аудио есть только у файлов из data/audio_voiced.txt (workflow «Озвучка»)
                "audio_ok": "f",
                "is_hidden": "t" if is_hidden else "f",
            })

    # -- переводы названий тем и дозаписанное аудио
    topic_tr = {}
    if TOPIC_NAMES.exists():
        with open(TOPIC_NAMES, encoding="utf-8") as f:
            topic_tr = {r["name_ru"]: r for r in csv.DictReader(f)}
    missing_tr = [t["name"] for t in topics.values() if t["name"] not in topic_tr]
    if missing_tr:
        problems.append(f"Нет перевода названия темы: {', '.join(missing_tr)}")
    voiced = set()
    if AUDIO_VOICED.exists():
        voiced = {x.strip() for x in AUDIO_VOICED.read_text(encoding="utf-8").split() if x.strip()}
    for e in examples:
        if (e["is_hidden"] == "f" and f"word_{e['word_id']}_ex{e['n']}.mp3" in voiced
                and (e["word_id"], e["n"]) not in audio_off_ex):
            e["audio_ok"] = "t"

    # -- запись
    OUT.mkdir(parents=True, exist_ok=True)
    with open(OUT / "topics.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["id", "source_no", "name_ru", "name_uz", "name_en", "cefr", "sort_order"])
        for t in sorted(topics.values(), key=lambda t: t["id"]):
            no = t["no"]
            try:
                no = int(float(no)) if no not in (None, "") else ""
            except ValueError:
                no = ""
            tr = topic_tr.get(t["name"], {})
            w.writerow([t["id"], no, t["name"], tr.get("name_uz", ""), tr.get("name_en", ""), t["cefr"], t["sort"]])
    with open(OUT / "words.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["id", "topic_id", "cefr", "uz", "ru", "uz_key", "accept_ru", "accept_uz",
                    "word_class", "canonical_id", "audio_ok", "sort_key", "register", "literary", "note", "en",
                    "pos", "morph", "syn_note", "tr_lat", "tr_cyr"])
        syn = {}
        if SYN_NOTES.exists():
            with open(SYN_NOTES, encoding="utf-8") as sf:
                syn = {int(r["word_id"]): r["note"].strip() for r in csv.DictReader(sf) if r.get("note")}
        for d in sorted(data, key=lambda x: x["id"]):
            # аудио — только озвученные файлы (data/audio_voiced.txt); после правки слова файл нужно озвучить заново
            audio = "t" if (f"word_{d['id']}.mp3" in voiced and d["id"] not in uz_changed) else "f"
            w.writerow([d["id"], topics[d["topic"]]["id"], d["cefr"], d["uz_disp"], d["ru"], d["uz_key"],
                        csv_array(d["accept_ru"]), csv_array(d["accept_uz"]), d["class"],
                        d["canonical"] if d["canonical"] else "", audio, d["sort_key"],
                        d.get("register", "lit"), display_uz(d["literary"]) if d.get("literary") else "",
                        d.get("note", ""), d.get("en", ""), d.get("pos", ""),
                        tr_morph(d),
                        syn.get(d["id"], ""), d.get("tr_lat", ""), d.get("tr_cyr", "")])
    with open(OUT / "examples.csv", "w", newline="", encoding="utf-8") as f:
        link_examples(examples, data)
        cols = ["word_id", "n", "uz", "ru", "blank_start", "blank_len", "blank_answer", "audio_ok", "is_hidden", "word_ids", "n_words"]
        w = csv.DictWriter(f, fieldnames=cols)
        w.writeheader()
        w.writerows(examples)

    # -- отчёт
    n_alias = sum(1 for d in data if d["canonical"])
    classes = defaultdict(int)
    for d in data:
        classes[d["class"]] += 1
    lines = [
        "# Отчёт сборки словаря", "",
        f"- Слов: **{len(data)}** (основных карточек: {len(data) - n_alias}, полных дублей: {n_alias})",
        f"- Тем: **{len(topics)}**",
        f"- Примеров: **{len(examples)}** — " + ", ".join(f"{k}: {v}" for k, v in sorted(blank_stats.items())),
        f"- Правки: заменено {len(edited)}, скрыто {len(hidden)}, аудио отключено {len(audio_off_ex | edited | hidden)}",
        f"- Правки слов: исправлено узб. {len(uz_changed)}, уровней из levels.csv {n_levels}, "
        f"разговорных {len(colloq)}",
        f"- Классы слов: " + ", ".join(f"{k}: {v}" for k, v in sorted(classes.items())),
        f"- По уровням: " + ", ".join(f"{c}: {sum(1 for d in data if d['cefr'] == c)}" for c in CEFR_RANK),
        "", "## Проблемы", "",
    ]
    lines += [f"- {p}" for p in problems] or ["- нет"]
    lines += ["", "## Примеры (первые 5 слов в порядке изучения)", ""]
    for d in order[:5]:
        ex = next(e for e in examples if e["word_id"] == d["id"] and e["n"] == 1)
        lines.append(f"- {d['id']}: **{d['uz_disp']}** — {d['ru']} | принимается: {', '.join(d['accept_ru'])} | "
                     f"пример: {ex['uz']} | пропуск: «{ex['blank_answer']}»")
    (OUT / "report.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("\n".join(lines))
    if problems:
        print(f"\nВНИМАНИЕ: найдено проблем: {len(problems)} (см. выше)")


if __name__ == "__main__":
    main()
